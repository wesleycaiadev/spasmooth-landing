# Spa Smooth — Functional Audit

_Última auditoria: 14 de setembro de 2026._

## Mapa de funcionalidades

| Funcionalidade | Frontend | Servidor | Banco | Admin | Status |
| --- | --- | --- | --- | --- | --- |
| Criar agendamento | `BookingWizard` | `createBooking` Server Action | RPC `check_and_create_booking` cria `bookings` e `leads` | Kanban, agenda e bookings | Validado estaticamente e por schema/RPC; aguarda E2E com conta admin |
| Mensagem de interesse | `/interesse` | `updateBookingInterest` Server Action | `leads.mensagem_interesse` | Kanban | Corrigido no código; aguarda deploy |
| Alertar admin por WhatsApp | Nenhum componente público | `createBooking` | Não há outbox/tabela de notificações | CallMeBot + polling do Kanban | Bloqueado por configuração de produção |
| Login/admin | `/entrar` | `/api/admin/session`, `verifyAdmin` | Clerk + cookie `spa_admin` | Rotas `/admin/*` | Acesso anônimo bloqueado; E2E autenticado pendente |
| CRUD de leads, serviços, profissionais, agenda e layout | Páginas `/admin/*` | Server Actions em `src/services/admin` | Supabase | Painel | Pendente de E2E autenticado |
| Upload/galeria | `PhotoUploader` | `/api/admin/upload` | Supabase Storage | Profissionais | Pendente de E2E autenticado |

## Fluxos reais

### Agendamento e lead

```text
src/components/booking/BookingWizard.jsx
  → createBooking() em src/services/booking.ts
  → RPC public.check_and_create_booking(...)
  → public.bookings + public.leads, na mesma transação
  → getLeads() em src/services/admin/leads.ts
  → src/app/admin/kanban/page.js
```

O RPC é a fonte de verdade: ele cria o booking e o lead com o mesmo ID. A interface só mostra sucesso depois de a Server Action retornar `success: true`.

### Mensagem de interesse

```text
/interesse
  → updateBookingInterest()
  → UPDATE public.leads.mensagem_interesse
  → Kanban
```

O cookie HttpOnly `spa_booking`, emitido somente após o booking persistir, limita a atualização ao lead recém-criado e expira em 30 minutos.

### Notificação do administrador

```text
createBooking()
  → CallMeBot (quando explicitamente ativado)
  → WhatsApp administrativo

AdminNotifications
  → polling de leads a cada 30 segundos enquanto o Kanban está aberto
```

Não existe tabela `messages` ou `notifications`. O Kanban é o canal durável: alertas CallMeBot e toasts não substituem o lead salvo.

## P0

### BUG-001 — Alertas de novos agendamentos não chegam ao administrador

**Sintoma:** o agendamento pode ser persistido sem alerta por WhatsApp.

**Causa raiz:** no artefato de ambiente de produção auditado, `BOOKING_NOTIFICATIONS_ENABLED` está ausente. O código só envia para CallMeBot quando ela é exatamente `true`.

**Arquivos:** `src/services/booking.ts`, configuração de ambiente da Vercel.

**Correção de código:** logs operacionais seguros distinguem configuração desativada, configuração incompleta, rejeição HTTP e entrega. A resposta HTTP do CallMeBot agora é validada.

**Ação operacional executada:** `BOOKING_NOTIFICATIONS_ENABLED=true` foi criada no ambiente **Production** da Vercel e o deployment de produção foi publicado. Chaves e telefones permanecem somente no servidor.

**Status:** RESOLVIDO EM PRODUÇÃO; aguarda confirmação controlada de entrega CallMeBot.

### BUG-002 — Links de confirmar/cancelar enviados pelo WhatsApp não executavam ação

**Sintoma:** a mensagem CallMeBot oferecia ações que apenas redirecionavam ao Kanban.

**Causa raiz:** `d4d8dd7` desativou corretamente a rota pública insegura; `4572a1d` voltou a gerar os links antigos.

**Arquivos:** `src/services/booking.ts`, `src/app/api/booking/action/route.js`.

**Correção:** a notificação agora instrui o administrador a usar o painel autenticado; não inclui links de ação por UUID.

**Status:** RESOLVIDO NO CÓDIGO; aguarda deploy.

### BUG-003 — Etapa de mensagem de interesse inacessível

**Sintoma:** `/interesse` tinha persistência segura, mas nenhum caminho do booking chegava até ela.

**Causa raiz:** após sucesso, `BookingWizard` redirecionava diretamente a `/obrigado`.

**Correção:** o booking persistido leva à etapa de interesse; o usuário pode concluir ou pular sem apagar o lead.

**Status:** RESOLVIDO NO CÓDIGO; aguarda deploy.

## Evidências e validação

- `npm test`: passou.
- `npm run typecheck`: passou.
- `npm run lint`: passou com warnings já existentes.
- `npm run test:db`: passou, incluindo RLS/grants, rate limit, disponibilidade, prevenção de duplicidade, sincronização booking/lead e reagendamento.
- `npm run build`: não concluiu neste ambiente porque o Turbopack não pode abrir o processo/porta temporária exigida pelo sandbox. A alternativa Webpack também falhou sem diagnóstico adicional; validar o build da Vercel no deploy é obrigatório.
- Produção: domínio raiz redireciona para `www`; home e login respondem; rota administrativa redireciona visitante não autenticado para `/entrar`.
- Supabase de produção: leitura de schema para `leads`, `bookings`, catálogo, agenda e rate limit respondeu; `available_booking_slots` respondeu com sucesso.

Não foi criado um lead de teste, nem foi usado login de administrador, nesta auditoria. A validação de ponta a ponta abaixo ainda é obrigatória após deploy.

## Próximos passos de recuperação

1. Configurar a flag de notificação na Vercel e fazer deploy.
2. Criar um agendamento de teste identificável e confirmar `bookings` e `leads`.
3. Confirmar o alerta CallMeBot e a presença no Kanban usando conta administradora.
4. Validar criação, edição e exclusão dos módulos administrativos, incluindo upload.
