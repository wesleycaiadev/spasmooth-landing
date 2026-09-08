# SpaSmooTh

Plataforma de agendamento e gestão para o SpaSmooTh, com site público, páginas de serviços otimizadas para busca e painel administrativo.

**Site:** [spasmooth.com.br](https://spasmooth.com.br)

## Principais recursos

- Agendamento online por unidade, profissional, serviço, data e horário.
- Agenda configurável no Admin: os horários exibidos ao cliente respeitam o início, fim e folgas definidos para cada profissional.
- Prevenção de conflitos de agenda no PostgreSQL.
- Painel administrativo para profissionais, serviços, leads, calendário e layout.
- Páginas de serviços com metadados, canonical, sitemap e `robots.txt`.
- Autorização administrativa no servidor e validação de dados com Zod.

## Stack

- Next.js 16 / React
- Supabase (PostgreSQL)
- Clerk
- Tailwind CSS
- Vercel

## Desenvolvimento local

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Crie `.env.local` a partir de `.env.example` e preencha as credenciais do seu ambiente.

3. Inicie o projeto:

   ```bash
   npm run dev
   ```

O site fica disponível em `http://localhost:3000` e o painel em `/admin`.

## Banco de dados

As alterações de banco ficam em `sql/` e em `supabase/migrations/`. Execute somente as migrações adequadas ao ambiente alvo; os arquivos históricos não devem ser reaplicados em uma base de produção já migrada.

Para validar as regras de agendamento em um banco isolado em memória:

```bash
npm run test:db
```

## Verificações

```bash
npm test
npm run typecheck
npm run lint
```

## Segurança

Não versione arquivos `.env`, credenciais, tokens ou dados de clientes. Operações administrativas e acesso ao Supabase usam apenas o servidor.
