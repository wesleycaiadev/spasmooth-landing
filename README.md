<h1 align="center">🌿 SpaSmooth</h1>

<p align="center">
  Plataforma Full-Stack de agendamento e gestão para clínicas SPA —
  arquitetura Zero Trust, RPC atômica anti-double-booking e painel administrativo protegido.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-cyan?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-Validation-E02020?style=for-the-badge" />
</p>

<p align="center">
  <strong>🔗 <a href="https://spasmooth.com.br">spasmooth.com.br</a></strong>
</p>

---

## Sobre o projeto

O SpaSmooth começou como uma landing page e evoluiu para uma plataforma completa de agendamento online com painel administrativo. O sistema resolve dois problemas centrais:

1. **Captação de clientes** — landing page com design imersivo, SEO técnico completo (Open Graph, schema.org, sitemap dinâmico) e funil de conversão direto para o wizard de agendamento.
2. **Gestão operacional** — painel admin com kanban de leads, calendário semanal por profissional, dashboard de métricas e sistema de agendamentos com controle de status.

---

## Funcionalidades

- **Wizard de agendamento em 5 etapas** — escolha de unidade, profissional, serviço, data/horário e dados do cliente, com grade horária calculada no servidor em tempo real
- **Anti-double-booking atômico** — função PL/pgSQL com `SELECT ... FOR UPDATE` garante que dois clientes simultâneos nunca reservem o mesmo horário
- **Painel admin protegido** — autenticação via Clerk com whitelist de emails, kanban de leads, calendário semanal e ações de confirmar/cancelar agendamentos
- **Dashboard de métricas** — conversão de leads, receita por período e filtros por unidade (Aracaju, Maceió, Recife)
- **Headers de segurança OWASP** — CSP, HSTS, X-Frame-Options, Referrer-Policy e Permissions-Policy configurados em produção

---

## Arquitetura

### Zero Trust — frontend tratado como hostil

O princípio central da arquitetura é que nenhuma operação de banco de dados ocorre no cliente. Todo acesso ao Supabase passa exclusivamente por Server Actions usando a `SUPABASE_SERVICE_ROLE_KEY` no servidor.
Browser → Server Action → supabaseAdmin → PostgreSQL
↑
auth() + Zod validation
(nunca chega ao banco sem passar aqui)

Componentes client-side recebem apenas os dados já processados como props — sem imports de Supabase, sem queries expostas no bundle.

### RPC atômica — eliminação de race condition

O maior risco técnico de um sistema de agendamento é o double-booking por requisições simultâneas. A solução implementada é uma função PL/pgSQL que executa verificação e inserção em uma única transação:
```sql
-- sql/002_check_and_create_booking.sql
CREATE FUNCTION check_and_create_booking(...)
RETURNS uuid AS $$
BEGIN
  -- Lock pessimista: bloqueia o range do profissional
  SELECT id FROM bookings
  WHERE professional_id = p_professional_id
    AND tstzrange(starts_at, ends_at) && tstzrange(p_starts_at, p_ends_at)
    AND status != 'cancelado'
  FOR UPDATE;

  IF FOUND THEN
    RAISE EXCEPTION 'SLOT_UNAVAILABLE';
  END IF;

  -- INSERT só ocorre se não houver conflito
  INSERT INTO bookings (...) VALUES (...);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

O índice GiST em `tstzrange(starts_at, ends_at)` garante que a verificação de sobreposição seja eficiente mesmo com alto volume de agendamentos.

### Validação em camadas

Cada input passa por três barreiras antes de chegar ao banco:

1. **HTML** — `maxLength` nos campos do formulário
2. **Zod** — schema tipado com limites, regex e sanitização (`src/lib/validations/booking.ts`)
3. **PostgreSQL** — constraints e a própria RPC rejeitam dados inválidos

### Segurança administrativa

Todas as Server Actions do painel admin verificam sessão e autorização antes de qualquer operação:
```typescript
const { userId } = await auth()
const user = await currentUser()
const email = user.emailAddresses[0].emailAddress

if (!ADMIN_EMAILS.includes(email)) {
  return { success: false, error: 'Acesso negado' }
}
```

Não há verificação client-side de permissões — o `useUser` do Clerk é usado apenas para UI, nunca como controle de acesso real.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Banco de dados | Supabase — PostgreSQL |
| Autenticação | Clerk |
| Validação | Zod |
| Estilização | Tailwind CSS |
| Deploy | Vercel |
| Linguagem | TypeScript + JavaScript |

---

## Estrutura relevante
src/
├── lib/
│   ├── validations/booking.ts   # Schemas Zod + tipos TypeScript
│   └── supabaseAdmin.ts         # Cliente server-only (service role)
├── services/
│   ├── booking.ts               # Server Actions públicas
│   └── admin/
│       ├── bookings.ts          # Server Actions admin (auth obrigatória)
│       └── dashboard.ts         # Métricas e agregações
sql/
├── 001_booking_tables.sql       # Schema + RLS + índice GiST
└── 002_check_and_create_booking.sql  # RPC atômica anti-race-condition

---

## Rodando localmente
```bash
git clone https://github.com/wesleycaiadev/spasmooth-landing.git
cd spasmooth-landing
npm install
```

Crie `.env.local` na raiz:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=sua_pub_key
CLERK_SECRET_KEY=sua_secret_key
```

Execute os SQLs em `sql/` no Supabase SQL Editor (na ordem numérica), depois:
```bash
npm run dev
```

- `localhost:3000` — landing page
- `localhost:3000/admin` — painel administrativo (requer email autorizado)

---

## Autor

**Wesley Caiã** — Desenvolvedor Front-End

[wesleycaiadev.vercel.app](https://wesleycaiadev.vercel.app) · [wesleycaia.dev@gmail.com](mailto:wesleycaia.dev@gmail.com)
