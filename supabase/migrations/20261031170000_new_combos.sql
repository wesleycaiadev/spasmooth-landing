-- Additive catalog update. Existing services and later Admin edits are preserved
-- when this migration is reapplied. Each appointment occupies 45 minutes,
-- including one session of a monthly package, never its combined session time.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS reference_price numeric(10,2) CHECK (reference_price >= 0),
  ADD COLUMN IF NOT EXISTS session_count integer NOT NULL DEFAULT 1 CHECK (session_count BETWEEN 1 AND 100),
  ADD COLUMN IF NOT EXISTS validity_days integer CHECK (validity_days BETWEEN 1 AND 365);

INSERT INTO public.services(name, slug, category, price, duration_minutes, description, active, reference_price, session_count, validity_days)
SELECT v.name, v.slug, v.category, v.price, 45, v.description, true, v.reference_price, v.session_count, v.validity_days
FROM (VALUES
  ('Combo Desacelera', 'combo-desacelera', 'combo', 160.00,
   'Massagem sueca relaxante e reflexologia podal. Uma pausa para o corpo e para a mente, com conforto e sensação de bem-estar.', NULL::numeric, 1, NULL::integer),
  ('Combo Contorno & Cuidado', 'combo-contorno-cuidado', 'combo', 190.00,
   'Massagem estética anticelulítica e drenagem linfática. Técnicas de cuidado corporal e mobilização tecidual em um só atendimento.', NULL::numeric, 1, NULL::integer),
  ('Combo Leveza', 'combo-leveza', 'combo', 180.00,
   'Escalda-pés, reflexologia podal e drenagem linfática. Cuidado dedicado aos pés e às pernas para deixar o peso do dia para trás.', NULL::numeric, 1, NULL::integer),
  ('Combo Recupera', 'combo-recupera', 'combo', 150.00,
   'Massagem desportiva e massagem terapêutica. Cuidado para quem mantém o corpo em movimento e busca conforto após o esforço.', NULL::numeric, 1, NULL::integer),
  ('Mensal Modeladora · 10 sessões', 'mensal-modeladora-10-sessoes', 'mensal', 800.00,
   'Dez sessões de massagem modeladora para incluir o cuidado corporal na sua rotina. Pacote completo válido por 30 dias; sessões agendadas individualmente.', 1200.00, 10, 30),
  ('Mensal Sueca Relaxante · 4 sessões', 'mensal-sueca-4-sessoes', 'mensal', 300.00,
   'Quatro sessões de massagem sueca relaxante para desacelerar ao longo do mês. Pacote completo válido por 30 dias; sessões agendadas individualmente.', 400.00, 4, 30)
) AS v(name, slug, category, price, description, reference_price, session_count, validity_days)
WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE s.slug = v.slug OR s.name = v.name);

-- Preserve the existing category order while registering the new Admin tab.
UPDATE public.site_config
SET sections_layout = '["mensal"]'::jsonb || sections_layout, updated_at = now()
WHERE id = 'service_categories' AND jsonb_typeof(sections_layout) = 'array'
  AND NOT sections_layout @> '["mensal"]'::jsonb;
