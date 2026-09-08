-- LOTE 2 (Combos de Massagem)
-- Manter seo_indexable = false até a aprovação.

UPDATE services SET 
  seo_indexable = false,
  seo_title = 'Massagem Relaxante com Bambu em Aracaju | SpaSmooTh',
  seo_description = 'Experimente a Massagem Relaxante com Bambu em Aracaju no SpaSmooTh. Alívio de tensões, conforto e toques precisos para um profundo bem-estar.',
  seo_content = '{
    "intro": "A Massagem Relaxante com Bambu em Aracaju (Bambuterapia) é uma combinação que traz conforto imediato e alívio de tensões persistentes. No SpaSmooTh, utilizamos rolos de bambu de diferentes tamanhos para proporcionar um alcance mais uniforme e firme em todas as regiões das costas e pernas.",
    "how_it_works": "Após o aquecimento natural com toques manuais suaves, introduzimos os rolos de bambu em movimentos de deslizamento, que se adaptam perfeitamente aos contornos corporais.",
    "experience": "A técnica proporciona uma pressão contínua e prazerosa, ideal para quem gosta de massagens com toques mais densos e envolventes. É uma experiência altamente relaxante, excelente para ajudar no descanso muscular.",
    "before_visit": "Vista roupas leves para a sessão e tente reservar um momento livre na sua agenda logo após o término, para que você possa aproveitar o estado de relaxamento por mais tempo.",
    "faq": [
      {
        "question": "A massagem com bambu machuca?",
        "answer": "Não. Os bambus são polidos e rolam suavemente sobre a pele, e a pressão aplicada é sempre ajustada de acordo com o que for mais confortável para você."
      },
      {
        "question": "Pode ser feita no corpo todo?",
        "answer": "Sim, a técnica é aplicada de forma integral (com exceção do rosto e áreas sensíveis), garantindo um relaxamento completo."
      }
    ]
  }'::jsonb
WHERE slug = 'relaxante-bambu';

UPDATE services SET 
  seo_indexable = false,
  seo_title = 'Massagem Relaxante com Pedras Quentes em Aracaju | SpaSmooTh',
  seo_description = 'Aproveite nossa Massagem com Pedras Quentes em Aracaju. Conforto térmico e relaxamento profundo para revitalizar seu bem-estar no SpaSmooTh.',
  seo_content = '{
    "intro": "Nossa Massagem Relaxante com Pedras Quentes em Aracaju oferece o aconchego ideal para quem busca desconexão. A aplicação do calor na pele combinada aos óleos essenciais promove uma sensação inigualável de cuidado e descanso profundo.",
    "how_it_works": "O procedimento combina os deslizamentos da massagem clássica com o posicionamento cuidadoso de pedras vulcânicas aquecidas em áreas-chave de tensão nas costas, promovendo conforto térmico imediato.",
    "experience": "O toque morno das pedras penetra suavemente, criando um ambiente favorável ao relaxamento pleno. É a escolha perfeita para aliviar a tensão de uma rotina agitada.",
    "before_visit": "Nenhuma preparação específica é necessária. Apenas permita-se relaxar desde o momento em que chega ao nosso espaço.",
    "faq": [
      {
        "question": "As pedras não vão queimar a minha pele?",
        "answer": "De forma alguma. As pedras são aquecidas em uma temperatura controlada e agradável, e testadas por nossos profissionais antes de tocarem a pele."
      },
      {
        "question": "Posso fazer essa massagem no verão?",
        "answer": "Sim! A sala é sempre adequadamente climatizada, tornando a sensação do calor pontual das pedras muito agradável em qualquer época do ano."
      }
    ]
  }'::jsonb
WHERE slug = 'relaxante-pedras';

UPDATE services SET 
  seo_indexable = false,
  seo_title = 'Massagem Relaxante com Ventosa em Aracaju | SpaSmooTh',
  seo_description = 'Alívio para tensões musculares: agende sua Massagem com Ventosaterapia em Aracaju no SpaSmooTh. Conforto, relaxamento e cuidado.',
  seo_content = '{
    "intro": "A Massagem Relaxante com Ventosa em Aracaju é procurada por clientes que desejam um foco maior no alívio de tensões concentradas nas costas e ombros. Combinamos a sucção das ventosas com a técnica manual para garantir uma experiência confortável.",
    "how_it_works": "Primeiro, os músculos são preparados com massagem manual para relaxamento inicial. Em seguida, os copos de ventosa são aplicados em áreas específicas para promover uma sucção leve e controlada.",
    "experience": "Você sentirá um leve puxão agradável e focado. Muitas pessoas relatam uma grande sensação de alívio instantâneo em regiões onde a tensão muscular costuma se acumular.",
    "before_visit": "Informe ao terapeuta caso possua sensibilidade extrema na pele ou áreas machucadas, para que a pressão da ventosa seja ajustada com total cuidado.",
    "faq": [
      {
        "question": "A ventosa deixa marcas roxas?",
        "answer": "Pode acontecer de deixar leves marcas temporárias nas áreas de maior tensão, mas são reações estéticas e sem dor."
      },
      {
        "question": "É recomendado para quem sente muita tensão?",
        "answer": "Sim, é uma técnica amplamente utilizada para promover a sensação de conforto e alívio daquelas tensões cotidianas persistentes."
      }
    ]
  }'::jsonb
WHERE slug = 'relaxante-ventosa';

UPDATE services SET 
  seo_indexable = false,
  seo_title = 'Combo Bambu, Ventosa e Pedras Quentes em Aracaju | SpaSmooTh',
  seo_description = 'O pacote definitivo de relaxamento no SpaSmooTh. Aproveite a Massagem com Bambu, Ventosaterapia e Pedras Quentes em Aracaju em uma única experiência.',
  seo_content = '{
    "intro": "Este é o combo especial do SpaSmooTh: Bambu + Ventosa + Pedras Quentes em Aracaju. Pensado para quem não quer escolher entre as terapias, combinando os melhores recursos de alívio e conforto em uma única sessão prolongada.",
    "how_it_works": "A sessão inicia-se com a precisão firme dos bambus, intercala a sucção das ventosas nas áreas de maior foco de tensão e é finalizada com o calor acolhedor das pedras quentes ao longo da coluna.",
    "experience": "É uma jornada sensorial de relaxamento. A combinação das três técnicas oferece uma verdadeira imersão em autocuidado, proporcionando um estado de repouso inesquecível.",
    "before_visit": "Reserve um tempo considerável para não ter pressa após a sessão, garantindo que o relaxamento permaneça com você no decorrer do seu dia.",
    "faq": [
      {
        "question": "Posso escolher focar mais em uma das técnicas do que nas outras?",
        "answer": "Sim! Antes de iniciar o protocolo, o terapeuta conversará com você para adaptar o tempo investido em cada técnica de acordo com a sua preferência."
      }
    ]
  }'::jsonb
WHERE slug = 'bambu-ventosa-pedras-quentes';
