-- Fase 1.1: Atualizar slugs dos serviços existentes de forma limpa
UPDATE public.services SET slug = 'ventosa-com-relaxante-60min', seo_indexable = false WHERE id = '6a0ac487-1482-486d-9473-4dedcc3765d3';
UPDATE public.services SET slug = 'vivencia-premium-black', seo_indexable = false WHERE id = 'c0e6caaa-1f28-46a9-88ae-f75c399d2f5c';
UPDATE public.services SET slug = 'massagem-relaxante-especial', seo_indexable = false WHERE id = '981fd7d2-8b36-4001-9c80-2c21a86d8c5c';
UPDATE public.services SET slug = 'terapia-tantrica-1h', seo_indexable = false WHERE id = '62346e74-01a2-43bb-a8fb-96423e16734a';
UPDATE public.services SET slug = 'ventosa-com-relaxante-40min', seo_indexable = false WHERE id = 'e8170a53-7618-469d-9cdc-0631570a904f';
UPDATE public.services SET slug = 'legacy-depilacao-meia-perna-163fdca3', seo_indexable = false WHERE id = '163fdca3-773d-4c42-bf17-d5049331ae21';
UPDATE public.services SET slug = 'depilacao-meia-perna', seo_indexable = true WHERE id = 'e534eac1-92d0-4ece-93e6-1995fc0db2ec';
UPDATE public.services SET slug = 'legacy-depilacao-perna-completa-c9eb34f1', seo_indexable = false WHERE id = 'c9eb34f1-b297-422c-83ed-48d98f11f055';
UPDATE public.services SET slug = 'depilacao-perna-completa', seo_indexable = true WHERE id = '3dd299e2-e254-41f2-b408-5199a12967c9';
UPDATE public.services SET slug = 'legacy-depilacao-bracos-1bea58c3', seo_indexable = false WHERE id = '1bea58c3-10c9-408e-9b25-5907351e2d12';
UPDATE public.services SET slug = 'depilacao-bracos', seo_indexable = true WHERE id = '5c03e2d8-91fc-454b-bcb3-da07bc3ed23a';
UPDATE public.services SET slug = 'legacy-depilacao-costas-2fa54086', seo_indexable = false WHERE id = '2fa54086-9f3b-4ee6-b441-b0aba892e51d';
UPDATE public.services SET slug = 'depilacao-costas', seo_indexable = true WHERE id = 'ed2f6077-1298-4d52-be20-6238eed3fba2';
UPDATE public.services SET slug = 'legacy-depilacao-abdomen-55182b59', seo_indexable = false WHERE id = '55182b59-cea1-44e3-afdf-2118ee3037fc';
UPDATE public.services SET slug = 'depilacao-abdomen', seo_indexable = true WHERE id = 'fb712edf-1ac8-4ca6-99fb-ceeec5c4eb18';
UPDATE public.services SET slug = 'legacy-depilacao-intima-0570f7c0', seo_indexable = false WHERE id = '0570f7c0-7329-4173-8de8-ac43b4e2fade';
UPDATE public.services SET slug = 'depilacao-intima', seo_indexable = true WHERE id = 'd3a57163-30e7-4e3f-9406-6bbe7efbcb6c';
UPDATE public.services SET slug = 'legacy-depilacao-corpo-todo-ad7e69c6', seo_indexable = false WHERE id = 'ad7e69c6-cbe8-4bc3-b003-e82ff95e64a4';
UPDATE public.services SET slug = 'depilacao-corpo-todo', seo_indexable = true WHERE id = 'c40cfd04-eac9-46d2-8540-268f4c511e9b';
UPDATE public.services SET slug = 'legacy-tailandesa-a40a019c', seo_indexable = false WHERE id = 'a40a019c-cc58-4eb1-86a5-dd69a96a7728';
UPDATE public.services SET slug = 'tailandesa', seo_indexable = false WHERE id = '3d021b71-a6ae-4e63-ad86-4d967d4828cc';
UPDATE public.services SET slug = 'legacy-massagem-nuru-b14c6ab2', seo_indexable = false WHERE id = 'b14c6ab2-1e23-45e6-b009-55639f069d8f';
UPDATE public.services SET slug = 'massagem-nuru', seo_indexable = false WHERE id = '765e3b05-1f3e-4536-ba7c-e40e6c357f75';
UPDATE public.services SET slug = 'terapia-tantrica-2h', seo_indexable = false WHERE id = 'f93081fb-a178-4723-9973-eb978231cf2e';
UPDATE public.services SET slug = 'vivencia-delirium', seo_indexable = false WHERE id = 'ac1b2da5-530b-4890-925f-1462b47fa87b';
UPDATE public.services SET slug = 'sessao-tantrica', seo_indexable = false WHERE id = '3dc01a36-fbe8-4d40-8d45-f4ad53ceaee1';
UPDATE public.services SET slug = 'vivencia', seo_indexable = false WHERE id = '8bd5b3a2-ec87-4fbc-9b45-2f94387d2757';
UPDATE public.services SET slug = 'drenagem-linfatica', seo_indexable = true WHERE id = '3bd0d735-9de5-4d46-8307-345afb9c3313';
UPDATE public.services SET slug = 'spa-dos-pes', seo_indexable = true WHERE id = 'a2312312-84ea-4e4f-aebb-9413f2807b8e';
UPDATE public.services SET slug = 'relaxante-bambu', seo_indexable = true WHERE id = '1525eae5-caee-48f9-9927-8c1d9962eaaa';
UPDATE public.services SET slug = 'relaxante-pedras', seo_indexable = true WHERE id = 'c9ed27f2-a1f6-471e-879f-b868b1ea5691';
UPDATE public.services SET slug = 'relaxante-ventosa', seo_indexable = true WHERE id = 'bfaeb4c4-83a3-412c-b922-e4b1c2d1984e';
UPDATE public.services SET slug = 'bambu-ventosa-pedras-quentes', seo_indexable = true WHERE id = 'd9c6dbae-fd6a-4557-801e-78a431408416';
UPDATE public.services SET slug = 'massagem-desportiva', seo_indexable = true WHERE id = 'a3b99e0a-14e7-4061-b872-d7ddff4a6f2a';
UPDATE public.services SET slug = 'day-spa-standard', seo_indexable = true WHERE id = '35e39b84-fd0a-4e1e-812b-d0ba5ca6dc35';

-- Fase 1.2: Adicionar Unique Constraint
ALTER TABLE public.services ADD CONSTRAINT services_slug_key UNIQUE (slug);
