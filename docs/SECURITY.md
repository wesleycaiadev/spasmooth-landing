# Segurança e infraestrutura

Atualizado em 14/09/2026, na branch `security/performance-hardening`.

## Linha de base verificada

- A aplicação está vinculada ao projeto Vercel `spasmooth-landing` e as Functions
  usam hoje `iad1` (Virgínia, EUA).
- O projeto está no plano Hobby. A região `gru1` (São Paulo) exige Vercel Pro;
  portanto ela **não deve** ser declarada no repositório antes do upgrade, pois
  isso pode impedir o deploy.
- `SUPABASE_SERVICE_ROLE_KEY` é consumida exclusivamente por código marcado com
  `server-only`. Ela não pode receber o prefixo `NEXT_PUBLIC_` nem ser usada por
  componentes do cliente.
- As rotas `/admin/*` e `/api/*` devem continuar com `Cache-Control: no-store`
  e `X-Robots-Tag: noindex, nofollow`.

## Mudança regional aprovada após upgrade do plano

1. Alterar o plano Vercel para Pro.
2. Em **Project Settings → Functions → Region**, escolher `gru1` (São Paulo).
3. Confirmar o novo deploy com:

   ```bash
   curl -sSI https://spasmooth.com.br | rg -i 'x-vercel-id|cache-control'
   ```

   O `x-vercel-id` deve conter `gru1` na parte da origem. Uma alteração de
   região não deve ser feita junto com uma migração de banco.

Referências oficiais: [regiões Vercel](https://vercel.com/docs/regions),
[configuração de regiões](https://vercel.com/docs/functions/configuring-functions/region)
e [disponibilidade de GRU1](https://vercel.com/docs/pricing/regional-pricing/gru1).

## Próximas proteções nesta branch

- Remover domínios Clerk de desenvolvimento da CSP de produção, mantendo a
  instância real `clerk.spasmooth.com.br`.
- Acrescentar cabeçalhos de isolamento e `/.well-known/security.txt`.
- Auditar RLS e privilégios do Supabase com credenciais anônimas, sem registrar
  chaves ou dados de clientes em arquivos ou logs.
- Medir CSP e cache depois de cada deploy antes de apertar a política.
