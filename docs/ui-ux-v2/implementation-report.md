# Relatório de implementação

## Entregue

- Header responsivo com navegação, seletor de unidade e CTA de agenda.
- Hero editorial com imagem local existente e foco no fluxo de escolha de terapeuta.
- Destaques e catálogo com imagens locais, duração/preço do banco e filtros por categoria.
- Cards de profissionais, modal e Booking Wizard preservados; os CTAs de serviço ainda mantêm a seleção via `sessionStorage`.
- Seção de localização com mapa condicionado a consentimento e sem expor horários estáticos que podem divergir da agenda do admin.
- Novo modal de consentimento com Essenciais, Estatísticas e Mapas do Google.
- WhatsApp usa uma mensagem contextual quando há serviço selecionado.
- Página de confirmação deixa explícito que a solicitação aguarda confirmação da equipe.
- A seção de depoimentos estáticos foi retirada porque não havia fonte verificável para os nomes, notas e textos existentes.
- Atualização compatível com Next 16 para `params` assíncronos nas duas rotas dinâmicas públicas.

## Validação executada

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | passou |
| `npm run lint` | passou sem erros; 27 avisos legados fora do escopo visual |
| `npx next build --webpack` | passou |
| `npm test` | passou |
| `npm run test:db` | passou |
| `git diff --check` | passou |

## Revisão visual pendente

O ambiente não disponibilizou uma instância navegável persistente: o servidor local não permaneceu ativo entre as sessões de automação e o binário `agent-browser` não está instalado. Antes de publicar, confira no navegador local ou em preview: 360 px, 768 px e desktop; menu móvel; filtros; modal de terapeuta/wizard; consentimento (aceitar, apenas essenciais, preferências); mapa com e sem consentimento.
