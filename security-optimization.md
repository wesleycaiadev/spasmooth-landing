# Decisões de Segurança — SpaSmooth

Registro das decisões arquiteturais tomadas para elevar o SpaSmooth
a um padrão de segurança de produção.

## 1. Zero Trust — banimento do Supabase client-side

Todas as chamadas diretas ao Supabase via `anon key` no browser foram
removidas. O acesso ao banco ocorre exclusivamente via `supabaseAdmin`
em Server Actions, usando `SUPABASE_SERVICE_ROLE_KEY` no servidor.

Isso elimina a possibilidade de manipulação de queries pelo cliente
e torna as políticas RLS uma segunda camada, não a única.

## 2. Eliminação de race condition (double-booking)

O sistema anterior verificava conflitos de horário em JavaScript
(SELECT no client → INSERT separado). Dois clientes simultâneos
passavam na checagem e geravam reservas sobrepostas.

Solução: função PL/pgSQL `check_and_create_booking` com
`SELECT ... FOR UPDATE` — verificação e inserção em uma única
transação atômica. Índice GiST em `tstzrange(starts_at, ends_at)`
garante eficiência na verificação de sobreposição.

## 3. Validação em camadas com Zod

Nenhum input chega ao banco sem passar por schema Zod com limites
explícitos (`min`, `max`, `trim`, regex). Tipos TypeScript inferidos
via `z.infer<>` — sem `any` em nenhum ponto do fluxo de dados.

## 4. Proteção contra IDOR

`professional_id` e `service_id` vindos do frontend são revalidados
no servidor — o banco confirma `active = true` antes de qualquer
inserção. IDs manipulados pelo cliente não produzem efeito.

## 5. Controle de acesso administrativo

Verificação de admin exclusivamente server-side via `auth()` +
`currentUser()` do Clerk com whitelist de emails. O `useUser`
client-side é usado apenas para UI — nunca como controle de acesso.

## 6. Headers de segurança HTTP

Configurados em `next.config.mjs`: CSP calibrado para os domínios
do projeto (Clerk, Supabase, Unsplash), HSTS, X-Frame-Options,
X-Content-Type-Options, Referrer-Policy e Permissions-Policy