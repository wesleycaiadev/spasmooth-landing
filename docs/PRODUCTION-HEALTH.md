# Spa Smooth — Production Health

_Auditoria em 14 de setembro de 2026. Nenhum segredo é registrado neste documento._

| Área | Estado | Evidência / ação |
| --- | --- | --- |
| Auth | DEGRADED | Login Clerk responde em produção, mas o fluxo autenticado não foi executado nesta auditoria. |
| Admin | DEGRADED | Visitante anônimo é redirecionado corretamente; validar sessão, refresh e nova aba com conta admin. |
| Messages | DEGRADED | Mensagem de interesse foi religada ao fluxo e publicada; falta validação E2E controlada. |
| Appointments | DEGRADED | RPC, schema e testes de integridade respondem; falta criação E2E pós-deploy. |
| Database | HEALTHY | Tabelas críticas e RPC de disponibilidade responderam em produção; RLS local foi validado. |
| Storage | DEGRADED | Código protegido existe; upload/delete ainda não foram testados em produção. |
| Notifications | DEGRADED | Flag e credenciais estão configuradas e o código foi publicado; falta confirmação controlada de entrega CallMeBot. |
| Vercel | HEALTHY | Deployment `dpl_AXRU7LPAJmhFJV2Juxgd2kRaRdnm` ficou READY e os logs iniciais não contêm erros. |
| DNS | HEALTHY | `spasmooth.com.br` redireciona para `www.spasmooth.com.br` por HTTPS. |

## Variáveis verificadas

| Variável | Produção auditada |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | CONFIGURADA |
| `SUPABASE_SERVICE_ROLE_KEY` | CONFIGURADA |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | CONFIGURADA |
| `CLERK_SECRET_KEY` | CONFIGURADA |
| `ADMIN_EMAILS` / `ADMIN_EMAIL` | CONFIGURADA |
| `CALLMEBOT_PHONE` / `CALLMEBOT_APIKEY` | CONFIGURADA |
| `BOOKING_NOTIFICATIONS_ENABLED` | CONFIGURADA em Production |
| `APP_SESSION_SECRET` | AUSENTE |

Definir também um `APP_SESSION_SECRET` aleatório, exclusivo e com ao menos 32 caracteres. Hoje há fallback para a chave de serviço do Supabase; ele mantém o sistema funcional, mas não é a separação de segredos desejável.

## Release gate

Não declarar a produção integralmente saudável antes de executar o smoke test completo, incluindo confirmação controlada da entrega CallMeBot.
