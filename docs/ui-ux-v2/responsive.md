# Responsividade e acessibilidade

- **360–639 px:** header compacto; menu em painel; CTAs em largura útil; cards em trilho horizontal ou uma coluna; áreas clicáveis mínimas de 44 px.
- **640–1023 px:** duas colunas quando o conteúdo permitir; imagens mantêm proporção e o mapa não corta o CTA.
- **1024 px+:** grid editorial, hero em duas colunas e navegação completa.
- Imagens usam `next/image`, `sizes` e `object-fit: cover`.
- Contraste de texto e botões é mantido; botões, tabs e accordion exibem foco via teclado; o menu expõe `aria-expanded`.
- Nenhuma informação depende apenas de cor ou hover; motion é reduzida para pessoas que preferem menos animação.
