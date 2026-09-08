# Segurança

A revisão, evidências, riscos pendentes e roteiro de implantação estão em [docs/SEGURANCA.md](docs/SEGURANCA.md).

Não publique chaves privadas, senhas, tokens de sessão ou dados pessoais em issues, logs, screenshots ou no repositório. Use `.env.example` somente como modelo. Todos os arquivos `.env` reais e `.vercel` são ignorados pelo Git.

Os scripts SQL em sql/ são históricos e contêm permissões antigas. A correção vigente está em supabase/migrations/20260908100346_security_hardening.sql. A migração foi aplicada e verificada no Supabase; o deployment foi promovido aos três domínios de produção na Vercel. A reavaliação identificou Clerk Development no site publicado, com TOTP e recuperação desativados. Migrar para Clerk Production e concluir MFA/testes antes de encerrar a revisão.

Validação local: `npm ci`, `npm test`, `npm run test:db`, `npm run typecheck`, `npm run lint` e `npm run build`. Para compilar com Clerk, configure seu identificador público. Os testes de banco criam apenas um PostgreSQL isolado em memória e não usam dados reais.
