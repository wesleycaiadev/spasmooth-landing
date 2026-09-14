# Auditoria antes da UI/UX V2

Data: 08/09/2026. Base: `6f3aa41`, branch `feat/ui-ux-spasmooth-v2`.

## Estrutura preservada

- Next.js App Router; home server-renderizada, com componentes interativos isolados em client components.
- Serviços ativos vêm de `services`; profissionais e horários permanecem atendidos por `src/services/booking.ts` e pelo Booking Wizard.
- Metadados, canonical, sitemap, robots e páginas indexáveis já existem e não fazem parte desta alteração visual.
- Consentimento bloqueia Analytics e embeds de Google Maps até autorização.

## Achados de interface

- A página combinava cyan, rose, amarelo, cinza escuro e gradientes pesados sem uma hierarquia de marca única.
- O hero centralizado reduzia a leitura editorial e escondia a foto do ambiente atrás de uma sobreposição forte.
- O catálogo usava cards sem imagens contextuais e o carrossel usava textura externa decorativa.
- O header não oferecia troca de unidade e os CTAs tinham destinos pouco explícitos.
- O consentimento funcionava, mas não tinha a apresentação/modal de preferências esperada de uma marca premium.
- A seção de depoimentos continha nomes e avaliações estáticos sem uma fonte verificável; não será mantida como prova social.
- Alguns conteúdos de localização e rodapé eram estáticos. O redesenho não cria novos endereços, telefones, horários, preços, avaliações ou alegações clínicas.

## Riscos controlados

- A seleção de serviço guarda o serviço selecionado e leva ao mesmo wizard; este contrato é mantido.
- Não há alteração em actions, RPCs, autenticação ou admin.
- Imagens de serviço serão locais e otimizadas; a imagem já existente do ambiente continua sendo o LCP do hero.
