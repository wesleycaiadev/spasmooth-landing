# Acesso administrativo e compatibilidade SQL — 31/10/2026

O proprietário solicitou retirar a exigência de MFA da aplicação, mantendo o
plano atual do Clerk. O painel aceita uma conta administradora autenticada sem
cadastro de segundo fator ou claim `fva`. Métodos de MFA que já estejam ativos
na própria conta continuam sendo gerenciados pelo Clerk.

## Controles mantidos

- `auth()` do Clerk identifica usuário e sessão autenticados.
- Conta atual deve coincidir com o usuário autenticado e estar desbloqueada.
- Autorização vem das listas de IDs/e-mails do servidor. A autorização por e-mail
  exige endereço principal verificado, incluindo `layararenata123@gmail.com`.
- Consulta da sessão no backend do Clerk verifica ID, usuário, status e expiração.
- O painel continua exigindo o cookie HttpOnly assinado, vinculado à mesma sessão.
- Mesma origem, rate limit compartilhado e grants/RLS do Supabase continuam ativos.
- A tela de segurança usa texto neutro, sem exigir configuração de MFA.

## Banco

O proprietário confirmou a execução sem erro das duas migrações no SQL Editor:
`20261030120000_rate_limit_privileges.sql` e `20261031170000_new_combos.sql`.
Essa confirmação é do proprietário; a sessão não tem conexão autenticada ao
Supabase para consultar diretamente o estado remoto.

O SQL dos combos adiciona seis registros e campos em `public.services`; não cria
uma tabela separada de combos. O SQL de segurança cuida de
`public.security_rate_limits`, RLS e execução das funções apenas pelo servidor.
As duas alterações são compatíveis e não dependem de MFA do Clerk.

## Verificações locais

- 20 testes de aplicação passaram. Os casos de identidade testam entrada sem
  MFA e negação de conta bloqueada, e-mail não autorizado/não verificado,
  sessão revogada, pendente, expirada ou pertencente a outro usuário.
- Testes PostgreSQL em memória passaram aplicando as duas migrações, inclusive
  reaplicação dos instaladores, permissões de PUBLIC/anon/authenticated e os
  seis serviços com preços/validade e atendimento individual de 45 minutos.
- Reaplicar o SQL dos combos preserva alterações posteriores de duração e preço
  feitas pelo Admin; reaplicar segurança mantém os seis registros de serviços.
- Checagem de tipos sem emissão passou.
- O build local compilou os bundles e passou no TypeScript; a geração de
  `/servicos` não concluiu porque faltam as credenciais Supabase neste checkout.
  O build da Vercel deve ser conferido com as variáveis já configuradas no projeto;
  nenhuma credencial foi copiada para o computador para contornar essa limitação.

## Publicação

O repositório usa `main` com integração Vercel. O envio do novo commit deve ser
seguido da consulta ao status público do contexto Vercel no GitHub e da conferência
do site publicado. Um push concluído, isoladamente, não comprova deploy pronto.
Não foi necessário alterar planos pagos nem credenciais no Clerk.
