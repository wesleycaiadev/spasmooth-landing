-- SCRIPT DE ATUALIZAÇÃO DO SUPABASE (PRODUÇÃO)
-- Copie e cole este script no SQL Editor do seu Supabase para aplicar as alterações de SEO no banco de produção.

-- 1. Adicionar colunas de SEO
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_indexable boolean DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_content jsonb;

-- 2. Associar slugs aos registros de produção existentes. Os IDs preservam os
-- serviços já relacionados a agendamentos e evitam criar registros duplicados.
UPDATE public.services SET slug = 'ventosa-com-relaxante-60min', seo_indexable = false WHERE id = '6a0ac487-1482-486d-9473-4dedcc3765d3';
UPDATE public.services SET slug = 'vivencia-premium-black', seo_indexable = false WHERE id = 'c0e6caaa-1f28-46a9-88ae-f75c399d2f5c';
UPDATE public.services SET slug = 'massagem-relaxante-especial', seo_indexable = false WHERE id = '981fd7d2-8b36-4001-9c80-2c21a86d8c5c';
UPDATE public.services SET slug = 'terapia-tantrica-1h', seo_indexable = false WHERE id = '62346e74-01a2-43bb-a8fb-96423e16734a';
UPDATE public.services SET slug = 'ventosa-com-relaxante-40min', seo_indexable = false WHERE id = 'e8170a53-7618-469d-9cdc-0631570a904f';
UPDATE public.services SET slug = 'legacy-depilacao-meia-perna-163fdca3', seo_indexable = false WHERE id = '163fdca3-773d-4c42-bf17-d5049331ae21';
UPDATE public.services SET slug = 'depilacao-meia-perna', seo_indexable = false WHERE id = 'e534eac1-92d0-4ece-93e6-1995fc0db2ec';
UPDATE public.services SET slug = 'legacy-depilacao-perna-completa-c9eb34f1', seo_indexable = false WHERE id = 'c9eb34f1-b297-422c-83ed-48d98f11f055';
UPDATE public.services SET slug = 'depilacao-perna-completa', seo_indexable = true WHERE id = '3dd299e2-e254-41f2-b408-5199a12967c9';
UPDATE public.services SET slug = 'legacy-depilacao-bracos-1bea58c3', seo_indexable = false WHERE id = '1bea58c3-10c9-408e-9b25-5907351e2d12';
UPDATE public.services SET slug = 'depilacao-bracos', seo_indexable = false WHERE id = '5c03e2d8-91fc-454b-bcb3-da07bc3ed23a';
UPDATE public.services SET slug = 'legacy-depilacao-costas-2fa54086', seo_indexable = false WHERE id = '2fa54086-9f3b-4ee6-b441-b0aba892e51d';
UPDATE public.services SET slug = 'depilacao-costas', seo_indexable = true WHERE id = 'ed2f6077-1298-4d52-be20-6238eed3fba2';
UPDATE public.services SET slug = 'legacy-depilacao-abdomen-55182b59', seo_indexable = false WHERE id = '55182b59-cea1-44e3-afdf-2118ee3037fc';
UPDATE public.services SET slug = 'depilacao-abdomen', seo_indexable = false WHERE id = 'fb712edf-1ac8-4ca6-99fb-ceeec5c4eb18';
UPDATE public.services SET slug = 'legacy-depilacao-intima-0570f7c0', seo_indexable = false WHERE id = '0570f7c0-7329-4173-8de8-ac43b4e2fade';
UPDATE public.services SET slug = 'depilacao-intima', seo_indexable = true WHERE id = 'd3a57163-30e7-4e3f-9406-6bbe7efbcb6c';
UPDATE public.services SET slug = 'legacy-depilacao-corpo-todo-ad7e69c6', seo_indexable = false WHERE id = 'ad7e69c6-cbe8-4bc3-b003-e82ff95e64a4';
UPDATE public.services SET slug = 'depilacao-corpo-todo', seo_indexable = false WHERE id = 'c40cfd04-eac9-46d2-8540-268f4c511e9b';
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

-- 4. Adicionar Restrição de Unicidade no Slug
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_slug_key') THEN
        ALTER TABLE public.services ADD CONSTRAINT services_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 5. Atualizar Lote 1
UPDATE services SET
  seo_indexable = true, seo_title = 'Day Spa em Aracaju | SpaSmooTh', seo_description = 'O Day Spa Standard no SpaSmooTh em Aracaju oferece 120 minutos de relaxamento total, combinando massagem relaxante e cuidados revigorantes.',
  seo_content = '{"intro": "O Day Spa Standard em Aracaju é a escolha perfeita para quem busca desconectar da rotina. Em um ambiente preparado para o seu descanso, oferecemos uma jornada de bem-estar de 120 minutos que renova as energias e alivia as tensões do dia a dia.","how_it_works": "A sessão inicia com uma recepção acolhedora e escalda-pés, preparando o corpo para o relaxamento. Em seguida, você recebe uma massagem relaxante corporal completa. Finalizamos com um momento de descanso e chá.","experience": "Nossa equipe prioriza o seu conforto. O ambiente possui iluminação suave, climatização ideal e aromaterapia, proporcionando uma experiência imersiva de autocuidado.","before_visit": "Recomendamos chegar com 10 minutos de antecedência para desfrutar do ambiente e preencher sua ficha de anamnese sem pressa. Evite refeições pesadas antes da sessão.","faq": [{"question": "O que devo vestir durante o Day Spa?", "answer": "Fornecemos roupões e roupas íntimas descartáveis para garantir o seu conforto e privacidade durante todos os procedimentos."},{"question": "Posso personalizar a intensidade da massagem?", "answer": "Sim. Antes do início, a profissional alinhará com você a pressão ideal e as áreas que necessitam de mais atenção."}]}'::jsonb WHERE slug = 'day-spa-standard';

UPDATE services SET
  seo_indexable = true, seo_title = 'Drenagem Linfática em Aracaju | SpaSmooTh', seo_description = 'Sessão de Drenagem Linfática em Aracaju com 60 minutos. Movimentos suaves que ajudam na redução da retenção de líquidos e promovem bem-estar.',
  seo_content = '{"intro": "A Drenagem Linfática em Aracaju no SpaSmooTh é um procedimento voltado para o equilíbrio do corpo. Através de movimentos suaves e rítmicos, a técnica auxilia na circulação e promove uma sensação imediata de leveza.","how_it_works": "Durante 60 minutos, a profissional realiza manobras específicas e lentas que estimulam o sistema linfático, direcionando o excesso de líquidos e toxinas para os gânglios.","experience": "Diferente de massagens modeladoras, a drenagem linfática é extremamente relaxante. O foco é a suavidade, proporcionando descanso enquanto cuida da estética e saúde corporal.","before_visit": "Recomenda-se beber bastante água no dia da sessão para potencializar os resultados do procedimento.","faq": [{"question": "A drenagem linfática dói ou deixa hematomas?", "answer": "Não. A drenagem verdadeira utiliza movimentos lentos e pressão muito leve. Se houver dor ou hematoma, não é drenagem linfática."},{"question": "Quantas sessões são necessárias para ver resultado?", "answer": "A sensação de leveza e redução de inchaço costuma ser imediata, mas para resultados estéticos duradouros, indica-se um pacote contínuo."}]}'::jsonb WHERE slug = 'drenagem-linfatica';

UPDATE services SET
  seo_indexable = true, seo_title = 'Massagem Desportiva em Aracaju | SpaSmooTh', seo_description = 'Massagem Desportiva em Aracaju para atletas e praticantes de atividades físicas. 60 minutos focados na recuperação muscular no SpaSmooTh.',
  seo_content = '{"intro": "A Massagem Desportiva em Aracaju é indicada para quem tem uma rotina ativa e busca alívio muscular. No SpaSmooTh, a sessão é direcionada para as necessidades do corpo após esforço físico intenso.","how_it_works": "A sessão de 60 minutos utiliza técnicas mais profundas e vigorosas, combinadas com alongamentos, focando nos agrupamentos musculares mais exigidos pela sua prática esportiva.","experience": "Embora a pressão seja maior do que em uma massagem relaxante, o procedimento respeita o limite do seu corpo, focando na soltura muscular e na prevenção de fadiga.","before_visit": "Não é recomendado realizar a massagem imediatamente após uma lesão aguda. Aguarde a liberação médica ou realize a sessão como prevenção e manutenção.","faq": [{"question": "Preciso ser atleta profissional para fazer a massagem desportiva?", "answer": "Não. Qualquer pessoa que pratique atividades físicas regulares ou sinta tensões musculares profundas pode se beneficiar do serviço."},{"question": "Dói fazer a massagem desportiva?", "answer": "Pode haver um leve desconforto nas áreas de maior tensão (pontos gatilho), mas a profissional sempre ajustará a pressão de acordo com a sua tolerância."}]}'::jsonb WHERE slug = 'massagem-desportiva';

UPDATE services SET
  seo_indexable = true, seo_title = 'Spa dos Pés em Aracaju | SpaSmooTh', seo_description = 'Spa dos Pés em Aracaju. 40 minutos de esfoliação, hidratação e massagem relaxante para pés cansados no SpaSmooTh.',
  seo_content = '{"intro": "O Spa dos Pés em Aracaju é um cuidado essencial oferecido pelo SpaSmooTh para uma das áreas mais exigidas do nosso corpo. Um momento focado inteiramente no descanso e na renovação dos pés.","how_it_works": "Em 40 minutos, realizamos a higienização, seguida de uma esfoliação revigorante. Após a remoção das células mortas, aplicamos hidratação profunda acompanhada de uma massagem relaxante focada na reflexologia.","experience": "É uma sessão de autocuidado rápido, mas profundamente eficaz. A massagem nos pés ativa pontos de relaxamento que refletem em todo o corpo, trazendo alívio instantâneo para a sensação de pernas cansadas.","before_visit": "Venha com calçados confortáveis para não apertar os pés logo após a hidratação intensa recebida na sessão.","faq": [{"question": "O Spa dos Pés substitui o serviço de pedicure?", "answer": "Não. O Spa dos Pés foca no relaxamento, esfoliação e hidratação da pele e músculos, e não no tratamento de unhas ou cutículas."},{"question": "Pode ser feito por gestantes?", "answer": "Sim, é muito procurado por gestantes para alívio do inchaço nos pés e tornozelos, desde que haja liberação médica."}]}'::jsonb WHERE slug = 'spa-dos-pes';

-- 6. Atualizar Lote 2
UPDATE services SET
  seo_indexable = true, seo_title = 'Massagem Relaxante com Bambu em Aracaju | SpaSmooTh', seo_description = 'Massagem relaxante com bambu em Aracaju (Bambuterapia). Sessão de 60 minutos combinando movimentos manuais e uso de bambus para o seu bem-estar no SpaSmooTh.',
  seo_content = '{"intro": "A Massagem Relaxante com Bambu em Aracaju, ou Bambuterapia, é uma técnica que utiliza hastes de bambu de diferentes tamanhos para promover relaxamento. No SpaSmooTh, oferecemos essa experiência de 60 minutos para quem busca um toque firme e revigorante.","how_it_works": "A terapeuta desliza os bambus sobre o corpo com óleos corporais, utilizando-os como uma extensão das mãos. O formato cilíndrico dos bambus permite alcançar a musculatura de forma uniforme e com pressão consistente.","experience": "A sessão combina os movimentos rítmicos dos bambus com a massagem manual, proporcionando uma experiência voltada à renovação física e ao bem-estar contínuo.","before_visit": "Aconselhamos evitar refeições pesadas antes do atendimento para garantir conforto abdominal durante a massagem.","faq": [{"question": "A massagem com bambu é dolorida?", "answer": "Não. Embora a técnica permita um toque mais firme se desejado, a pressão é totalmente ajustável para que a experiência seja apenas relaxante."},{"question": "Qual a diferença para a massagem relaxante tradicional?", "answer": "O uso dos bambus permite que a massagem seja mais uniforme e, dependendo da preferência, mais profunda, sendo ideal para quem gosta de pressão média a forte sem abrir mão do relaxamento."}]}'::jsonb WHERE slug = 'relaxante-bambu';

UPDATE services SET
  seo_indexable = true, seo_title = 'Massagem Relaxante com Pedras Quentes em Aracaju | SpaSmooTh', seo_description = 'Massagem com pedras quentes em Aracaju. Sessão de 90 minutos de termoterapia e relaxamento no SpaSmooTh.',
  seo_content = '{"intro": "A Massagem Relaxante com Pedras Quentes em Aracaju é uma das experiências mais imersivas do SpaSmooTh. Através da termoterapia, esta sessão de 90 minutos promove um aquecimento reconfortante e relaxamento.","how_it_works": "Pedras vulcânicas (basalto) são aquecidas e dispostas em pontos energéticos específicos do corpo. A terapeuta também utiliza as pedras aquecidas para massagear os músculos suavemente, combinando o calor com óleos corporais.","experience": "O calor das pedras atua no relaxamento muscular, criando uma sensação de envolvimento e acolhimento térmico. É a escolha ideal para desligar a mente.","before_visit": "Reserve um tempo livre após a sessão. O relaxamento induzido pelo calor é profundo, e recomendamos evitar atividades agitadas logo em seguida.","faq": [{"question": "As pedras podem queimar a pele?", "answer": "Não. A temperatura é rigorosamente controlada e testada pela profissional antes de entrar em contato com a sua pele."},{"question": "Posso fazer no verão?", "answer": "Sim. O ambiente do spa é climatizado e o calor das pedras atua no relaxamento do músculo, sendo extremamente agradável em qualquer estação do ano."}]}'::jsonb WHERE slug = 'relaxante-pedras';

UPDATE services SET
  seo_indexable = true, seo_title = 'Massagem Relaxante com Ventosaterapia em Aracaju | SpaSmooTh', seo_description = 'Massagem relaxante integrada à ventosaterapia em Aracaju. Sessão de 60 minutos focada no conforto muscular e bem-estar no SpaSmooTh.',
  seo_content = '{"intro": "A Massagem Relaxante com Ventosaterapia em Aracaju une a tranquilidade da massagem clássica aos benefícios tradicionais das ventosas. No SpaSmooTh, desenhamos esta sessão de 60 minutos para quem busca focar em pontos de tensão específicos.","how_it_works": "A sessão intercala manobras de massagem relaxante manual com a aplicação das ventosas nas áreas de maior rigidez (geralmente costas e ombros). A sucção das ventosas atua na oxigenação local.","experience": "Esta combinação permite que você relaxe a mente enquanto a ventosaterapia cuida daquela sensação de peso muscular. É um equilíbrio entre conforto e cuidado direcionado.","before_visit": "Se você tiver eventos sociais e se importar com marcas na pele, informe a profissional, pois a ventosa costuma deixar círculos temporários.","faq": [{"question": "A ventosa vai deixar marcas nas minhas costas?", "answer": "Sim, é normal que a sucção deixe marcas circulares (petéquias) avermelhadas ou roxas, que desaparecem naturalmente em alguns dias."},{"question": "A aplicação das ventosas causa dor?", "answer": "A sensação é de repuxamento da pele. Pode ser inicialmente estranha para quem nunca fez, mas torna-se confortável e proporciona relaxamento rápido da área."}]}'::jsonb WHERE slug = 'relaxante-ventosa';

UPDATE services SET
  seo_indexable = true, seo_title = 'Combo: Bambu, Ventosa e Pedras Quentes em Aracaju | SpaSmooTh', seo_description = 'Sessão completa de massagem em Aracaju integrando bambuterapia, ventosaterapia e pedras quentes. 120 minutos de cuidado integral no SpaSmooTh.',
  seo_content = '{"intro": "O Combo de Bambu, Ventosa e Pedras Quentes em Aracaju é a nossa sessão premium. Desenvolvemos este serviço de 120 minutos no SpaSmooTh para quem deseja experimentar diversas terapias em um único atendimento focado no bem-estar.","how_it_works": "Durante as duas horas, a terapeuta orquestra o uso das três ferramentas de forma fluida: a precisão das ventosas para pontos de tensão, os deslizamentos firmes com bambus e o conforto térmico e relaxante das pedras vulcânicas quentes.","experience": "É uma jornada sensorial completa. Você vivenciará diferentes texturas, temperaturas e intensidades de toque, resultando em um descanso longo e revigorante.","before_visit": "Venha sem pressa. Esta é uma sessão longa dedicada inteiramente a você. Evite compromissos urgentes logo após o término.","faq": [{"question": "O uso de três técnicas diferentes não sobrecarrega o corpo?", "answer": "Não. O tempo de 120 minutos permite que a profissional faça transições suaves entre as técnicas, garantindo que cada área do corpo receba o estímulo mais adequado sem pressa."},{"question": "Posso pedir para focar mais em uma das três técnicas?", "answer": "Com certeza. Durante a anamnese inicial, você pode alinhar com a terapeuta as suas preferências e áreas de foco."}]}'::jsonb WHERE slug = 'bambu-ventosa-pedras-quentes';

-- 7. Atualizar Lote 3
UPDATE services SET
  seo_indexable = true, seo_title = 'Apara de Pelos da Perna Completa em Aracaju | SpaSmooTh', seo_description = 'Serviço de apara de pelos da perna completa em Aracaju. Atendimento prático de 30 minutos voltado para o seu conforto no SpaSmooTh.',
  seo_content = '{"intro": "A Apara de Pelos da Perna Completa em Aracaju oferecida pelo SpaSmooTh é um serviço focado em cuidado pessoal de forma prática. Importante: este serviço é realizado exclusivamente por apara de pelos (com aparador corporal), não utilizando cera ou métodos de remoção pela raiz, visando maior conforto.","how_it_works": "Durante os 30 minutos de sessão, a profissional higieniza a região e realiza a apara uniforme de todos os pelos das coxas e panturrilhas, ajustando a técnica à sensibilidade da sua pele.","experience": "É uma sessão rápida e cuidadosa. Nossa equipe garante que o procedimento seja realizado com atenção ao seu bem-estar, preservando a integridade da pele.","before_visit": "Recomendamos que não aplique cremes hidratantes intensos no dia do atendimento, para facilitar a apara.","faq": [{"question": "O serviço de Perna Completa inclui a virilha?", "answer": "Não, a região da virilha não está inclusa neste atendimento. Ela faz parte do nosso serviço específico de Apara Íntima."},{"question": "O pelo é arrancado pela raiz?", "answer": "Não. Este serviço é uma apara superficial para reduzir ou zerar a altura dos pelos sem o desconforto de métodos como a cera."}]}'::jsonb WHERE slug = 'depilacao-perna-completa';

UPDATE services SET
  seo_indexable = true, seo_title = 'Apara Íntima em Aracaju | SpaSmooTh', seo_description = 'Serviço de apara íntima em Aracaju. Atendimento realizado com atenção à privacidade, ao conforto e à comunicação durante a sessão no SpaSmooTh.',
  seo_content = '{"intro": "A Apara Íntima em Aracaju é um atendimento estético e de cuidado pessoal. É um procedimento de apara superficial de pelos, não invasivo e realizado sem o uso de cera.","how_it_works": "A sessão de 20 minutos foca em atender sua necessidade estética de forma prática e rápida, garantindo que você se sinta seguro e confortável do início ao fim.","experience": "Atendimento realizado com atenção à privacidade, ao conforto e à comunicação durante a sessão. Mantemos o foco total no profissionalismo e no seu bem-estar.","before_visit": "Recomendamos a higiene pessoal habitual antes do serviço. O objetivo é que você sinta máxima tranquilidade durante o processo.","faq": [{"question": "O procedimento dói?", "answer": "Como o serviço consiste apenas na apara dos pelos e não na remoção com cera, o procedimento é muito mais confortável e geralmente indolor."},{"question": "Como é garantida a minha privacidade?", "answer": "Nosso ambiente e nossa equipe são preparados para oferecer um atendimento focado no conforto e no respeito, priorizando a sua tranquilidade e privacidade."}]}'::jsonb WHERE slug = 'depilacao-intima';

UPDATE services SET
  seo_indexable = true, seo_title = 'Apara de Pelos das Costas em Aracaju | SpaSmooTh', seo_description = 'Serviço de apara de pelos das costas e ombros em Aracaju. Atendimento rápido e prático de 20 minutos no SpaSmooTh.',
  seo_content = '{"intro": "A Apara de Pelos das Costas em Aracaju é ideal para quem busca praticidade no cuidado pessoal de áreas difíceis de alcançar. Este serviço utiliza apenas aparador corporal, sem cera, garantindo conforto e rapidez.","how_it_works": "Em um atendimento objetivo de 20 minutos, realizamos a apara completa da região das costas e dos ombros, cuidando da estética sem agressões fortes à pele.","experience": "Você experimentará um procedimento prático e tranquilo, voltado especialmente para quem deseja o conforto de uma pele aparada sem o incômodo da depilação tradicional.","before_visit": "Aconselhamos não utilizar pomadas ou cosméticos oleosos nas costas antes do atendimento.","faq": [{"question": "Os ombros estão inclusos?", "answer": "Sim. A apara abrange toda a extensão das costas até os ombros para garantir um aspecto uniforme."}]}'::jsonb WHERE slug = 'depilacao-costas';

UPDATE services SET
  seo_indexable = false, seo_title = 'Apara de Meia Perna em Aracaju',
  seo_content = '{ "intro": "Serviço de apara da meia perna. Não é cera ou laser." }'::jsonb WHERE slug = 'depilacao-meia-perna';

UPDATE services SET
  seo_indexable = false, seo_title = 'Apara de Braços em Aracaju',
  seo_content = '{ "intro": "Serviço de apara dos braços. Não é cera ou laser." }'::jsonb WHERE slug = 'depilacao-bracos';

UPDATE services SET
  seo_indexable = false, seo_title = 'Apara de Abdômen em Aracaju',
  seo_content = '{ "intro": "Serviço de apara do abdômen. Não é cera ou laser." }'::jsonb WHERE slug = 'depilacao-abdomen';

UPDATE services SET
  seo_indexable = false, seo_title = 'Pacote de Apara - Corpo Todo em Aracaju',
  seo_content = '{ "intro": "Aguardando confirmação sobre as regiões exatas inclusas neste pacote de apara." }'::jsonb WHERE slug = 'depilacao-corpo-todo';
