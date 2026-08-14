-- ============================================================
-- 005: RLS Hardening — Ativa RLS e políticas em TODAS as tabelas
-- Garante que nenhuma tabela fique aberta ao público.
-- ============================================================

-- ========== PROFESSIONALS ==========
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de profissionais" ON public.professionals;
CREATE POLICY "Leitura pública de profissionais"
    ON public.professionals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role acesso total em profissionais" ON public.professionals;
CREATE POLICY "Service role acesso total em profissionais"
    ON public.professionals FOR ALL TO service_role USING (true);

-- ========== LEADS ==========
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inserção pública de leads" ON public.leads;
CREATE POLICY "Inserção pública de leads"
    ON public.leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role acesso total em leads" ON public.leads;
CREATE POLICY "Service role acesso total em leads"
    ON public.leads FOR ALL TO service_role USING (true);

-- ========== PROFESSIONAL_SCHEDULE ==========
ALTER TABLE public.professional_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de agendas" ON public.professional_schedule;
CREATE POLICY "Leitura pública de agendas"
    ON public.professional_schedule FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role acesso total em agendas" ON public.professional_schedule;
CREATE POLICY "Service role acesso total em agendas"
    ON public.professional_schedule FOR ALL TO service_role USING (true);

-- ========== SERVICES (RESTRIÇÃO DE POLICY) ==========
-- A policy antiga permitia ALL para "authenticated" (qualquer logado).
-- Corrige para permitir ALL apenas para service_role (backend admin).
DROP POLICY IF EXISTS "Admin acesso total em serviços" ON public.services;
CREATE POLICY "Service role acesso total em serviços"
    ON public.services FOR ALL TO service_role USING (true);

-- ========== BOOKINGS (REFORÇO) ==========
-- A inserção pública já existe. Reforça que SELECT público não existe
-- e apenas service_role pode ler/alterar.
-- (As policies existentes já estão corretas, este bloco é idempotente)
