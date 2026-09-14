# Design system V2

## Direção

Uma presença de spa contemporâneo: azul petróleo para confiança, azul claro para respiro, coral para ações e marfim para superfícies. Serif editorial apenas em títulos; Nunito para interface e leitura.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--spa-ink` | `#063b64` | títulos e ações escuras |
| `--spa-blue` | `#007fbc` | links, ícones e foco |
| `--spa-sky` | `#dff5fb` | superfícies informativas |
| `--spa-coral` | `#ff6b2c` | CTA principal |
| `--spa-cream` | `#fffdf8` | fundo principal |
| `--spa-mist` | `#f3f8f8` | seções alternadas |
| `--spa-line` | `#d9e7ea` | bordas discretas |

## Regras

- Um CTA coral por contexto; ações secundárias são contornadas em azul.
- Raio grande apenas em cards de conteúdo e imagens; controles ficam entre 10 e 16 px.
- Sombra suave, sem efeitos de vidro sobre conteúdo essencial.
- Estados de foco usam anel azul visível; animações respeitam `prefers-reduced-motion`.
