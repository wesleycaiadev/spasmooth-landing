-- Add Lay Bronze services to catalog
-- Existing services and edits are preserved.

INSERT INTO public.services(name, slug, category, price, duration_minutes, description, active, seo_indexable, reference_price, session_count, validity_days)
SELECT v.name, v.slug, v.category, v.price, v.duration_minutes, v.description, true, true, v.reference_price, v.session_count, v.validity_days
FROM (VALUES
  ('Bronze Gelado · Público LGBT+', 'bronze-gelado-lgbt', 'bronzeamento', 200.00, 45,
   'Bronzeamento a jato com acabamento uniforme, natural e sem sol. Secagem rápida e atendimento exclusivo e respeitoso ao público LGBT+. Ideal para eventos, festas, praia e fotos.', NULL::numeric, 1, NULL::integer),
  ('Bronze Gelado Masculino', 'bronze-gelado-masculino', 'bronzeamento', 200.00, 45,
   'Bronzeamento a jato com acabamento uniforme, natural e sem sol. Secagem rápida e valorização da definição muscular. Ideal para eventos, praia, viagens e fotos.', NULL::numeric, 1, NULL::integer),
  ('Bronze Gelado · Marquinha Superior e Inferior', 'bronze-gelado-marquinha', 'bronzeamento', 80.00, 40,
   'Bronze a vaporização sem sol, com aplicação focada na marquinha superior e inferior. Tom uniforme, secagem rápida e resultado imediato.', NULL::numeric, 1, NULL::integer),
  ('Bronze Gelado · Corpo Todo', 'bronze-gelado-corpo-todo', 'bronzeamento', 120.00, 45,
   'Bronze a vaporização sem sol com aplicação no corpo todo para uniformização completa. Tom natural, secagem rápida e acabamento impecável.', NULL::numeric, 1, NULL::integer),
  ('Realce Bronze · Jato Superior', 'realce-bronze-jato-superior', 'bronzeamento', 40.00, 30,
   'Bronze a vaporização sem sol com jato focado na parte superior do corpo para realçar e iluminar o bronzeado existente.', NULL::numeric, 1, NULL::integer),
  ('Banho de Lua Clareador', 'banho-de-lua-clareador', 'bronzeamento', 59.90, 40,
   'Realça o bronzeado e contrasta o tom dos pelos claros com a pele bronzeada. Remove células mortas, esfolia, uniformiza e proporciona sensação de spa e relaxamento.', NULL::numeric, 1, NULL::integer),
  ('Descoloração de Pelos', 'descoloracao-de-pelos', 'bronzeamento', 30.00, 30,
   'Clareia os pelos deixando-os douradinhos, iluminados e discretos sem precisar depilar.', NULL::numeric, 1, NULL::integer),
  ('Clareamento de Áreas', 'clareamento-de-areas', 'bronzeamento', 50.00, 30,
   'Tratamento de clareamento e uniformização de tom para áreas como axilas, virilha, joelhos e cotovelos, com aspecto saudável e renovado.', NULL::numeric, 1, NULL::integer)
) AS v(name, slug, category, price, duration_minutes, description, reference_price, session_count, validity_days)
WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE s.slug = v.slug OR s.name = v.name);

-- Append bronzeamento category to service_categories order if not already registered
UPDATE public.site_config
SET sections_layout = sections_layout || '["bronzeamento"]'::jsonb, updated_at = now()
WHERE id = 'service_categories' AND jsonb_typeof(sections_layout) = 'array'
  AND NOT sections_layout @> '["bronzeamento"]'::jsonb;
