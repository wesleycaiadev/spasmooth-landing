-- FINALIZAÇÃO LOTE 2 (Combos)
-- Ajustes textuais aplicados, habilitar indexação

UPDATE services SET 
  seo_indexable = true,
  seo_content = '{
    "intro": "A Massagem Relaxante com Bambu em Aracaju (Bambuterapia) combina movimentos manuais e o uso do bambu em uma experiência voltada ao conforto e ao relaxamento corporal. No SpaSmooTh, utilizamos rolos de bambu de diferentes tamanhos para proporcionar um alcance mais uniforme e firme em todas as regiões das costas e pernas.",
    "how_it_works": "Após o aquecimento natural com toques manuais suaves, introduzimos os rolos de bambu em movimentos de deslizamento, que se adaptam perfeitamente aos contornos corporais.",
    "experience": "A técnica proporciona uma pressão contínua e prazerosa, pensada para quem busca uma experiência de relaxamento após a rotina. É uma vivência altamente envolvente e voltada ao conforto geral do corpo.",
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
  seo_indexable = true,
  seo_content = '{
    "intro": "Nossa Massagem Relaxante com Pedras Quentes em Aracaju oferece o aconchego ideal para quem busca desconexão. A aplicação das pedras próprias para massagem, aquecidas em temperatura confortável e controlada, promove uma sensação inigualável de cuidado e descanso profundo.",
    "how_it_works": "O procedimento combina os deslizamentos da massagem clássica com o posicionamento cuidadoso das pedras em áreas-chave das costas, promovendo conforto térmico.",
    "experience": "O calor das pedras complementa os movimentos da massagem e cria uma experiência acolhedora de relaxamento, ajudando você a desligar a mente de uma rotina agitada.",
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
  seo_indexable = true,
  seo_description = 'Conheça a Massagem Relaxante com Ventosa em Aracaju no SpaSmooTh. Uma experiência que combina massagem manual, aplicação de ventosas e conforto personalizado.',
  seo_content = '{
    "intro": "A Massagem Relaxante com Ventosa em Aracaju é procurada por clientes que desejam focar em regiões específicas das costas e ombros. Combinamos a aplicação das ventosas com a técnica manual para garantir uma experiência confortável.",
    "how_it_works": "Primeiro, os músculos são preparados com massagem manual. Em seguida, os copos de ventosa são aplicados para promover uma sucção leve e controlada.",
    "experience": "Você sentirá um puxão agradável nas costas. A intensidade é ajustada ao conforto de cada cliente, combinando a aplicação das ventosas com movimentos manuais.",
    "before_visit": "A aplicação de ventosas pode deixar marcas temporárias na pele em algumas pessoas. Antes do atendimento, a profissional orienta sobre a técnica e ajusta a intensidade conforme a sensibilidade do cliente.",
    "faq": [
      {
        "question": "A ventosa deixa marcas na pele?",
        "answer": "Sim, pode deixar marcas temporárias e indolores devido à sucção, que normalmente desaparecem em alguns dias."
      },
      {
        "question": "É recomendado para quem sente muita tensão?",
        "answer": "Sim, é uma técnica amplamente utilizada para promover conforto e aquela pausa merecida na sua rotina."
      }
    ]
  }'::jsonb
WHERE slug = 'relaxante-ventosa';


UPDATE services SET 
  seo_indexable = true,
  seo_description = 'Combine Bambu, Ventosa e Pedras Quentes em Aracaju em uma experiência de relaxamento no SpaSmooTh. Conheça a sessão e agende seu horário.',
  seo_content = '{
    "intro": "Este é o combo especial do SpaSmooTh: Bambu + Ventosa + Pedras Quentes em Aracaju. Uma experiência que reúne três técnicas de relaxamento em uma única sessão prolongada, ideal para quem quer aproveitar tudo em um único atendimento.",
    "how_it_works": "A sessão inicia-se com a precisão dos bambus, intercala as ventosas nas áreas combinadas previamente, e é finalizada com as pedras quentes ao longo da coluna.",
    "experience": "É uma verdadeira imersão em autocuidado, combinando diferentes formas de pressão, movimento e calor ao longo da experiência para um repouso inesquecível.",
    "before_visit": "Reserve um tempo considerável para não ter pressa após a sessão, garantindo que o relaxamento permaneça com você no decorrer do seu dia.",
    "faq": [
      {
        "question": "Posso escolher focar mais em uma das técnicas do que nas outras?",
        "answer": "Sim! Antes de iniciar o protocolo, o terapeuta conversará com você para adaptar o tempo investido em cada técnica de acordo com a sua preferência."
      }
    ]
  }'::jsonb
WHERE slug = 'bambu-ventosa-pedras-quentes';
