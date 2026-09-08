# Plano de imagens

| Área | Asset | Origem | Status | Fallback |
| --- | --- | --- | --- | --- |
| Hero | `public/images/ambiente.webp` | já presente no projeto | manter | gradiente marfim/azul |
| Equipe | `public/images/professionals/**` | já presente no projeto | manter | avatar existente do cadastro |
| Serviços em destaque | `public/images/treatments/*.webp` | imagens geradas para esta interface, sem texto/logotipo | gerar | gradiente da categoria + ícone |

As imagens geradas mostram apenas ambiente, objetos e enquadramentos de tratamento; não representam resultados, profissionais identificáveis, depoimentos ou promessas clínicas. Todas terão `alt` descritivo e serão carregadas sem prioridade fora do hero.
