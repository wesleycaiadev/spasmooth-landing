-- Melhorias de Segurança (Cybersecurity) e Row Level Security (RLS)
-- Copie e cole este código no SQL Editor do Supabase (https://supabase.com/dashboard/project/_/sql)

-- 1. Ativando o RLS nas tabelas vitais
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Excluir políticas antigas caso existam para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura anonima" ON public.leads;
DROP POLICY IF EXISTS "Permitir insercao anonima" ON public.leads;
DROP POLICY IF EXISTS "Permitir leitura pública de profs" ON public.professionals;

----------------------------------------------------
-- A. Políticas para a tabela `professionals`
----------------------------------------------------
-- Visitantes do site (Anon) podem listar quem são os profissionais.
CREATE POLICY "Permitir leitura pública de profissionais" 
ON public.professionals FOR SELECT USING (true);

-- Apenas Autenticados (Painel Admin) podem editar profissionais
CREATE POLICY "Admin tem Acesso Total em Profissionais" 
ON public.professionals FOR ALL TO authenticated USING (true);


----------------------------------------------------
-- B. Políticas para a tabela `leads` (Agendamentos)
----------------------------------------------------
-- Visitantes do site podem INSERIR um novo agendamento, mas NÃO LER OS OUTROS.
CREATE POLICY "Permitir inserção de novo lead publicamente" 
ON public.leads FOR INSERT WITH CHECK (true);

-- Apenas Autenticados (Painel Admin) podem visualizar, editar ou deletar as informações e dados sensíveis dos clientes (LGPD / Proteção de Dados de Terceiros).
CREATE POLICY "Admin pode C/R/U/D (Acesso Total) os Leads" 
ON public.leads FOR ALL TO authenticated USING (true);

-- ====================================================
-- FIM DAS CONFIGURAÇÕES DE PROTEÇÃO DE DADOS
-- ====================================================
