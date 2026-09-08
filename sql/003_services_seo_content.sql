ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_content JSONB DEFAULT '{}'::jsonb;

-- Reset all to false
UPDATE services SET seo_indexable = false;

-- Enable the Top 4
UPDATE services SET seo_indexable = true WHERE slug IN (
    'day-spa-standard',
    'drenagem-linfatica',
    'massagem-desportiva',
    'spa-dos-pes'
);

-- Populate Top 4 with initial rich content
UPDATE services SET seo_content = '{
  "intro": "O Day Spa Standard em Aracaju é uma experiência imersiva de cuidado pessoal. É ideal para quem busca uma pausa na rotina, proporcionando momentos de relaxamento e desconexão em um ambiente acolhedor e preparado para o seu conforto.",
  "how_it_works": "Durante o pacote, você será acompanhado por nossa equipe em uma sequência de terapias programadas, intercaladas com momentos de descanso. O ambiente é climatizado e conta com aromaterapia e música suave.",
  "experience": "A sessão inclui técnicas integradas de massagem e cuidados focados em promover relaxamento muscular e sensação de bem-estar geral.",
  "before_visit": "Recomendamos que você chegue com 15 minutos de antecedência. Oferecemos roupão e toalhas para uso durante o spa.",
  "faq": [
    {
      "question": "O que está incluso no pacote?",
      "answer": "O pacote inclui uma combinação das nossas melhores terapias de relaxamento, além de amenities durante a sua estadia."
    },
    {
      "question": "Preciso levar alguma coisa?",
      "answer": "Não. Fornecemos toalhas, roupões e tudo o que é necessário para a sua comodidade no local."
    }
  ]
}'::jsonb
WHERE slug = 'day-spa-standard';

UPDATE services SET seo_content = '{
  "intro": "A Drenagem Linfática em Aracaju oferecida pelo SpaSmooTh é uma técnica suave e rítmica focada em promover uma sensação de leveza e conforto. Ideal para complementar seus cuidados com o bem-estar.",
  "how_it_works": "Utilizamos movimentos lentos e precisos que acompanham o trajeto do sistema linfático. O ambiente tranquilo maximiza os efeitos relaxantes da técnica.",
  "experience": "Você experimentará uma massagem leve e metódica, reconhecida por muitas pessoas como uma ótima aliada no relaxamento corporal e bem-estar físico geral.",
  "before_visit": "Evite refeições pesadas antes da sessão. Vista roupas confortáveis para facilitar o relaxamento após o procedimento.",
  "faq": [
    {
      "question": "A sessão causa algum incômodo?",
      "answer": "Não. A técnica utiliza toques suaves e superficiais, focando totalmente no relaxamento e conforto."
    },
    {
      "question": "A drenagem pode ser feita por gestantes?",
      "answer": "Depende de recomendação médica. Caso tenha liberação do seu obstetra, a sessão será adaptada para o seu conforto."
    }
  ]
}'::jsonb
WHERE slug = 'drenagem-linfatica';

UPDATE services SET seo_content = '{
  "intro": "Nossa Massagem Desportiva em Aracaju é procurada por praticantes de atividades físicas ou pessoas que buscam alívio da fadiga muscular. A técnica foca nas áreas de maior tensão para proporcionar mais conforto corporal.",
  "how_it_works": "A sessão intercala manobras profundas e alongamentos suaves, focando em grupos musculares específicos apontados por você.",
  "experience": "O atendimento visa o relaxamento da tensão acumulada e a promoção de uma sensação revigorante, ideal para quem mantém uma rotina ativa.",
  "before_visit": "Recomendamos que não realize atividades físicas intensas imediatamente antes do atendimento.",
  "faq": [
    {
      "question": "É necessário ser atleta para fazer essa massagem?",
      "answer": "Não. Qualquer pessoa que sinta necessidade de alívio em tensões musculares mais persistentes pode aproveitar a sessão."
    },
    {
      "question": "O procedimento causa dor?",
      "answer": "A técnica utiliza mais firmeza que as massagens comuns, mas a intensidade sempre será ajustada de acordo com o seu nível de conforto."
    }
  ]
}'::jsonb
WHERE slug = 'massagem-desportiva';

UPDATE services SET seo_content = '{
  "intro": "O Spa dos Pés em Aracaju é uma experiência dedicada exclusivamente ao relaxamento das extremidades. Uma excelente opção de cuidado focada em revitalizar e trazer descanso após dias longos.",
  "how_it_works": "O procedimento inicia com um escalda-pés relaxante com aromaterapia, seguido por esfoliação, hidratação profunda e reflexologia básica.",
  "experience": "Uma sensação imediata de alívio e frescor, combinando os benefícios térmicos da água quente com toques cuidadosos.",
  "before_visit": "Venha de calçados confortáveis e evite roupas muito apertadas nas pernas para aproveitar a experiência ao máximo.",
  "faq": [
    {
      "question": "O Spa dos Pés inclui cuidado de unhas (pedicure)?",
      "answer": "Não. O nosso foco é terapêutico e relaxante, focado em esfoliação e massagem, sem os procedimentos estéticos de corte e cutícula."
    }
  ]
}'::jsonb
WHERE slug = 'spa-dos-pes';
