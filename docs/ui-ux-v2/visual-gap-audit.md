# Auditoria de fidelidade visual

| Componente | Referência aprovada | Implementação anterior | Problema | Correção |
| --- | --- | --- | --- | --- |
| Preloader | marca, animação curta e transição | componente existente, mas encerrado no primeiro frame | a experiência personalizada não era percebida | manter SVG/identidade e exibir por 420 ms, com saída de 360 ms |
| Header | navegação central, unidade e CTA compacto | navegação reduzida e seletor em pill | faltavam itens e hierarquia do seletor | restaurar itens relevantes; dropdown com título, cidades e estados |
| Hero desktop | texto à esquerda, foto de spa à direita | título reinterpretado, foto antiga, card e círculo decorativos | composição e mensagem divergentes | usar texto aprovado; foto editorial 4:3; overlay de logo real sem elementos decorativos |
| Hero mobile | foto primeiro, conteúdo editorial depois | desktop apenas empilhado | sequência visual não acompanhava a referência | imagem no topo e conteúdo abaixo, sem card flutuante |
| Tratamentos | imagem contextual por serviço | quatro imagens repetidas por categoria | contexto visual insuficiente | mapa por slug; gerar/planejar assets específicos e fallback sem repetição |
| Destaque | Bambu + Ventosa + Pedras | imagem só de pedras quando esse serviço aparece | conteúdo e imagem não correspondem | asset combinado dedicado |
| Terapeutas | cards reais, trilho mobile | bom ponto de partida | avanço do próximo card excessivo | ajustar largura para expor aproximadamente 12% do próximo card |
| Cookies | modal com logo, cookie e ações claras | modal funcional, sem marca no topo | menor fidelidade ao fluxo aprovado | inserir marca e manter só categorias realmente existentes |
| WhatsApp | mensagem contextual | mensagem contextual parcial | não inclui unidade selecionada | montar mensagem com serviço e unidade atuais |
| Footer | compacto, legível, link de preferências | funcional | faltava atalho explícito a preferências | adicionar gatilho compartilhado de preferências |

## Restrições

Não serão usados emojis, bolhas decorativas, sparkles, blobs, glows gratuitos, cards flutuantes sem função, textos inventados, avaliações sem fonte ou imagens com texto/logotipo gerado.
