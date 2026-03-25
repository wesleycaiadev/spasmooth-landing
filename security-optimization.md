# Arquitetura e Decisões Técnicas (SpaSmooth)

## Visão Geral
Este repositório contém o registro das decisões arquiteturais tomadas para escalar a base de código do **SpaSmooth**, elevando-a para um padrão sênior de engenharia de software. O foco foi garantir isolamento de responsabilidades, tipagem forte e resolver gargalos de segurança em interações de banco expostas no Next.js (Client boundaries).

## Changelog Técnico

### 1. Hardening do Supabase (Row Level Security)
Identifiquei que chamadas diretas ao Client do Supabase operavam em componentes `use client`, correndo risco de expor credenciais super-privilegiadas e permitindo saltos de autorização através do bloqueio falho do RLS. 
- **Solução:** Isolei completamente a infra de banco de dados na camada de serviços sob o Node.js. Implementei `supabaseAdmin.ts` rodando estritamente no Server com `SERVICE_ROLE_KEY`. Isso cria um bypass autoritativo pelo back-end autenticado e zera a necessidade das políticas públicas estarem abertas para o Client.

### 2. Clean Architecture e Padronização
Componentes de interface como o Kanban, Calendário e Dashboard acumulavam responsabilidades de Controller e Model (buscando, processando estados e mutando DB via query builder no próprio `useEffect`).
- **Solução:** Adotei de fato *Server Actions*. Centralizando cada domínio de entidades em `src/services/admin/` (ex: `leads.ts`, `professionals.ts`), criei boundaries que desacoplam os componentes puramente reativos.

### 3. TypeScript e DTOs
Abandonei a dependência do tipo `any` retornada pela API e introduzi Types/Interfaces rigorosos por model (ex: `Professional[]`). Isso quebra a compilação antecipadamente se houver dessincronização entre o Frontend e os campos retornados pelo Banco.

### 4. Higiene e Performance
- Remoção pesada de abstrações mortas, verbose logging de depuração (que muitas vezes mascaram uma arquitetura frágil) e comentários de baixa densidade semântica. 
- Redução de Payload: No serviço de Dashboard, otimização das requisições limitando a malha de seletores de dados (`select('created_at, status_kanban')`) para aliviar throughput ao invés de buscar a tabela interia na web.
