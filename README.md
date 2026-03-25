# 🌿 SpaSmooth

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?logo=next.js" />
  <img src="https://img.shields.io/badge/Supabase-Database-green?logo=supabase" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-cyan?logo=tailwind-css" />
</p>

## Sobre o Projeto
O SpaSmooth é uma aplicação Full-Stack desenvolvida em **Next.js** no padrão SPA (Single Page Application), criada para o gerenciamento de agendamentos, captação de clientes e administração de uma clínica/SPA. 
Além de uma Landing Page com alta conversão e forte engajamento em UI/UX, o projeto conta com um painel administrativo protegido, focado em performance e segurança.

---

## 🚀 Arquitetura e Decisões Técnicas

Este projeto foi reescrito e otimizado seguindo padrões robustos de engenharia de software:

### 1. API e Persistência (Clean Architecture)
A camada de persistência e orquestração de dados foi 100% isolada da interface (UI). Todo o fetching acontece exclusivamente através de **Server Actions** (`src/services/admin`), proporcionando:
- **Ausência de Client-side Waterfalls**: Mitigação de _round-trips_ no browser.
- **Blindagem**: As queries complexas ao banco agora ocorrem restritamente no ambiente Node.js do servidor, impedindo o vazamento de credenciais via bundle.

### 2. Segurança Hardened (RLS + Supabase Auth)
O acesso ao Supabase (PostgreSQL) conta com controle severo de **Row Level Security (RLS)**. As intervenções do painel administrativo trafegam por um conector autorizado via `SERVICE_ROLE_KEY` puramente no servidor. Isso cria uma barreira impenetrável que separa as políticas do usuário de frontend comum e as mutações corporativas de back-office.

### 3. Tipagem Defensiva (TypeScript)
Todo o intercâmbio de dados entre Supabase e React utiliza DTOs (Data Transfer Objects) rigorosamente tipados. O código não confia em inferências genéricas (`any`), mitigando quebras drásticas em *runtime* e impulsionando a confiabilidade do código.

---

## 🛠 Tecnologias Utilizadas

- **Next.js (App Router)**: Framework modular provendo rotas aninhadas e SSR.
- **React 18+**: Hooks interativos focados em manipulação limpa de estado.
- **Supabase**: Banco PostgreSQL Serverless, Autenticação e Storage.
- **TypeScript**: Estabilidade e segurança massiva em tempo de desenvolvimento.
- **Tailwind CSS**: Estilização utility-first de alta manutenibilidade.
- **Clerk**: Gerenciador de autentição do painel `/admin`.
- **Lucide React & Date-Fns**: Manipulação refinada de tempo e ícones otimizados.

---

## 📦 Como Instalar e Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (V18+)
- [npm](https://www.npmjs.com/) ou `yarn`
- Projeto provisionado no Supabase com suas respectivas chaves.

### Passo a Passo

1. **Faça o clone do repositório:**
   ```bash
   git clone https://github.com/wesleycaiadev/spasmooth-landing.git
   cd spasmooth-landing
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz contendo às variáveis do Clerk e do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=service_role_aqui
   
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pub_key_clerk
   CLERK_SECRET_KEY=secret_key_clerk
   ```

4. **Execute o projeto:**
   ```bash
   npm run dev
   ```
   > Acesse `http://localhost:3000` para a Landing Page ou `http://localhost:3000/admin` para o painel de gestão.
