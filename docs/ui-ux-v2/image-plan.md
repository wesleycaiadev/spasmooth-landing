# Plano de imagens

| Área | Asset | Origem | Status | Fallback |
| --- | --- | --- | --- | --- |
| Hero | `public/images/hero/spasmooth-hero.webp` | fotografia gerada para a composição aprovada; marca aplicada por HTML | gerar | estrutura de hero sem card decorativo |
| Equipe | `public/images/professionals/**` | já presente no projeto | manter | avatar existente do cadastro |
| Tratamentos | `public/images/treatments/<slug>.webp` | fotografia específica por serviço, sem texto/logotipo | gerar gradualmente | imagem de contexto genérico apenas enquanto o slug não tiver asset próprio |

As imagens geradas mostram apenas ambiente, objetos e enquadramentos de tratamento; não representam resultados, profissionais identificáveis, depoimentos ou promessas clínicas. Todas terão `alt` descritivo e serão carregadas sem prioridade fora do hero.
