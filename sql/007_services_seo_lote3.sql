-- ATUALIZAÇÃO LOTE 3: DEPILAÇÕES / APARA

-- 1. Perna Completa (Aprovado para indexar)
UPDATE services SET 
  seo_indexable = true,
  seo_title = 'Apara de Pelos da Perna Completa em Aracaju | SpaSmooTh',
  seo_description = 'Serviço de apara de pelos da perna completa em Aracaju. Atendimento prático de 30 minutos voltado para o seu conforto no SpaSmooTh.',
  seo_content = '{
    "intro": "A Apara de Pelos da Perna Completa em Aracaju oferecida pelo SpaSmooTh é um serviço focado em cuidado pessoal de forma prática. Importante: este serviço é realizado exclusivamente por apara de pelos (com aparador corporal), não utilizando cera ou métodos de remoção pela raiz, visando maior conforto.",
    "how_it_works": "Durante os 30 minutos de sessão, a profissional higieniza a região e realiza a apara uniforme de todos os pelos das coxas e panturrilhas, ajustando a técnica à sensibilidade da sua pele.",
    "experience": "É uma sessão rápida e cuidadosa. Nossa equipe garante que o procedimento seja realizado com atenção ao seu bem-estar, preservando a integridade da pele.",
    "before_visit": "Recomendamos que não aplique cremes hidratantes intensos no dia do atendimento, para facilitar a apara.",
    "faq": [
      {
        "question": "O serviço de Perna Completa inclui a virilha?",
        "answer": "Não, a região da virilha não está inclusa neste atendimento. Ela faz parte do nosso serviço específico de Apara Íntima."
      },
      {
        "question": "O pelo é arrancado pela raiz?",
        "answer": "Não. Este serviço é uma apara superficial para reduzir ou zerar a altura dos pelos sem o desconforto de métodos como a cera."
      }
    ]
  }'::jsonb
WHERE slug = 'depilacao-perna-completa';

-- 2. Depilação Íntima (Aprovado para indexar)
UPDATE services SET 
  seo_indexable = true,
  seo_title = 'Apara Íntima em Aracaju | SpaSmooTh',
  seo_description = 'Serviço de apara íntima em Aracaju. Atendimento realizado com atenção à privacidade, ao conforto e à comunicação durante a sessão no SpaSmooTh.',
  seo_content = '{
    "intro": "A Apara Íntima em Aracaju é um atendimento estético e de cuidado pessoal. É um procedimento de apara superficial de pelos, não invasivo e realizado sem o uso de cera.",
    "how_it_works": "A sessão de 20 minutos foca em atender sua necessidade estética de forma prática e rápida, garantindo que você se sinta seguro e confortável do início ao fim.",
    "experience": "Atendimento realizado com atenção à privacidade, ao conforto e à comunicação durante a sessão. Mantemos o foco total no profissionalismo e no seu bem-estar.",
    "before_visit": "Recomendamos a higiene pessoal habitual antes do serviço. O objetivo é que você sinta máxima tranquilidade durante o processo.",
    "faq": [
      {
        "question": "O procedimento dói?",
        "answer": "Como o serviço consiste apenas na apara dos pelos e não na remoção com cera, o procedimento é muito mais confortável e geralmente indolor."
      },
      {
        "question": "Como é garantida a minha privacidade?",
        "answer": "Nosso ambiente e nossa equipe são preparados para oferecer um atendimento focado no conforto e no respeito, priorizando a sua tranquilidade e privacidade."
      }
    ]
  }'::jsonb
WHERE slug = 'depilacao-intima';

-- 3. Depilação Costas (Aprovado para indexar)
UPDATE services SET 
  seo_indexable = true,
  seo_title = 'Apara de Pelos das Costas em Aracaju | SpaSmooTh',
  seo_description = 'Serviço de apara de pelos das costas e ombros em Aracaju. Atendimento rápido e prático de 20 minutos no SpaSmooTh.',
  seo_content = '{
    "intro": "A Apara de Pelos das Costas em Aracaju é ideal para quem busca praticidade no cuidado pessoal de áreas difíceis de alcançar. Este serviço utiliza apenas aparador corporal, sem cera, garantindo conforto e rapidez.",
    "how_it_works": "Em um atendimento objetivo de 20 minutos, realizamos a apara completa da região das costas e dos ombros, cuidando da estética sem agressões fortes à pele.",
    "experience": "Você experimentará um procedimento prático e tranquilo, voltado especialmente para quem deseja o conforto de uma pele aparada sem o incômodo da depilação tradicional.",
    "before_visit": "Aconselhamos não utilizar pomadas ou cosméticos oleosos nas costas antes do atendimento.",
    "faq": [
      {
        "question": "Os ombros estão inclusos?",
        "answer": "Sim. A apara abrange toda a extensão das costas até os ombros para garantir um aspecto uniforme."
      }
    ]
  }'::jsonb
WHERE slug = 'depilacao-costas';

-- 4. Meia Perna, Braços, Abdômen, Corpo Todo (Noindex)
UPDATE services SET 
  seo_indexable = false,
  seo_title = 'Apara de Meia Perna em Aracaju',
  seo_content = '{ "intro": "Serviço de apara da meia perna. Não é cera ou laser." }'::jsonb
WHERE slug = 'depilacao-meia-perna';

UPDATE services SET 
  seo_indexable = false,
  seo_title = 'Apara de Braços em Aracaju',
  seo_content = '{ "intro": "Serviço de apara dos braços. Não é cera ou laser." }'::jsonb
WHERE slug = 'depilacao-bracos';

UPDATE services SET 
  seo_indexable = false,
  seo_title = 'Apara de Abdômen em Aracaju',
  seo_content = '{ "intro": "Serviço de apara do abdômen. Não é cera ou laser." }'::jsonb
WHERE slug = 'depilacao-abdomen';

UPDATE services SET 
  seo_indexable = false,
  seo_title = 'Pacote de Apara - Corpo Todo em Aracaju',
  seo_content = '{ "intro": "Aguardando confirmação sobre as regiões exatas inclusas neste pacote de apara." }'::jsonb
WHERE slug = 'depilacao-corpo-todo';
