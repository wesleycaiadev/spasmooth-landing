# Revisão de segurança e correções — 31/10/2026

**Atualização posterior solicitada pelo proprietário:** a obrigatoriedade de MFA
foi retirada da aplicação para permitir o acesso com o plano atual do Clerk.
Continuam obrigatórios o login Clerk, a lista de administradores no servidor,
o e-mail principal verificado para autorização por e-mail, a conta não bloqueada
ou banida e a sessão ativa vinculada ao usuário. Cookie assinado, checagem de
origem, limites de requisições e permissões SQL foram preservados. As menções
a MFA obrigatório abaixo descrevem a revisão histórica anterior a essa decisão.

Relatório preparado antes do commit, sem deploy, aplicação de SQL em produção ou alteração
de contas externas. Fonte inicial: `fc5466c5338ef816755e16a2869d2d0d88ea4516`.

## Escopo e limites

A skill oficial `cloudflare/security-audit-skill` foi instalada em
`C:/Users/wesley/.codex/skills/security-audit`, revisão
`c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`. A instalação foi feita com Git porque
o Python exigido pelo instalador padrão não estava disponível.

O reconhecimento mapeou login, ações administrativas, reservas, links assinados,
uploads, catálogo público, renderização, SQL/RLS e dependências. Revisões estáticas
separadas conferiram as correções de autenticação, SQL e rotas web.

**A auditoria formal das seis fases ficou incompleta.** Ambos os validadores
da Cloudflare recusaram este Windows com
`OS no-follow and nonblocking input protection is unavailable`. Não foram
modificados ou contornados. Os arquivos do reconhecimento e o registro de
incompletude estão em
`C:/Users/wesley/AppData/Local/Temp/spasmooth-security-audit-20261030/`.
Não há alegação de cobertura completa ou vulnerabilidade explorada em produção.

A skill exige isolamento de execução com rede negada, ambiente vazio com lista
permitida, fonte e ferramentas somente leitura, escrita restrita a scratch e
limites de recursos. Esse conjunto não está disponível nesta sessão. Por isso,
os testes do projeto, PGlite, build e navegador não foram executados. A análise
estática e a checagem de tipos não executaram o código da aplicação.

## Administradora solicitada e login

`layararenata123@gmail.com` não aparecia na configuração versionada inicial.
Agora consta explicitamente em `src/lib/security/admin-config.ts`, consumida
pela autorização de servidor em `src/lib/auth.ts`.

- O endereço precisa ser o **e-mail principal verificado** da conta Clerk.
- A conta precisa ter MFA ativo e a sessão assinada precisa comprovar a
  verificação dos dois fatores; ausência de `fva` ou idade `-1` é recusada.
- `ADMIN_EMAILS` e a variável antiga `ADMIN_EMAIL` são mescladas, preservando
  administradores configurados nas duas listas. `ADMIN_USER_IDS` continua
  permitindo IDs explícitos e também passa pelas exigências de MFA e sessão.
- Usuário divergente, bloqueado ou banido e sessão inativa, expirada ou de outro
  usuário são recusados. O cookie administrativo segue vinculado à sessão Clerk.
- A tela de login tolera conta sem e-mail principal, limpa erros ao tentar
  novamente e apresenta mensagem segura para respostas inesperadas.
- E-mail e exceções brutas foram retirados dos logs de verificação de identidade.

**Isto autoriza o endereço no código; não comprova o cadastro no Clerk de
produção.** Não há credenciais disponíveis neste checkout para verificar sua
existência, verificação de e-mail, MFA ou variáveis efetivas de produção.
Não foi criada conta nem alterado metadata do Clerk. Para revogar a autorização,
remova o endereço do arquivo e de quaisquer listas/IDs do ambiente que também
autorizem essa conta. O acesso depende de publicar o código corrigido.

## Correções e endurecimento

| Área | Problema no código anterior | Alteração |
| --- | --- | --- |
| MFA | Verificação removida, apesar da mensagem de acesso exigir dois fatores | Exige cadastro e fatores comprovados pela sessão assinada |
| Lista admin | `ADMIN_EMAILS || ADMIN_EMAIL` ocultava a lista antiga quando a plural estava preenchida | Mescla ambas com a autorização explícita solicitada |
| Rate limit | Erros de RPC/exceções retornavam `true`, removendo os limites durante falhas | Erro ou resposta inválida interrompe a operação; limite atingido continua retornando `false` |
| SQL do limitador | Caminhos de instalação diferentes, `SECURITY DEFINER`, `search_path` não fixado e revogações incompletas de `PUBLIC` | Instalador idempotente único com `SECURITY INVOKER`, caminho fixo, RLS e grants somente para `service_role` |
| JSON-LD | Nome/descrição do banco chegavam a scripts HTML via `JSON.stringify` sem escape de `<` | Serializador compartilhado nos sete scripts, preservando o JSON sem fechamento antecipado de script |
| Corpos de requisição | Limites dependiam de `Content-Length`, antes de leitura sem contagem real | Leitura limitada dos bytes efetivos, cancelamento no excesso e memória limitada mesmo com fragmentos pequenos |
| Relatórios CSP | Mapa limitado por tempo, mas sem teto de entradas | Máximo de 1.000 fingerprints por instância |
| Links de reserva | Página com token herdava indexação pública e política genérica de referência | `noindex`, `nofollow`, `noarchive`, `no-referrer` e `private, no-store` específicos |
| Testes no Windows | Uso de URL `.pathname` podia gerar `/C:/...` ou manter escapes de espaços | `fileURLToPath`, `path.join` e fechamento do PGlite em `finally` |

O caminho de escrita visível do conteúdo de serviços exige administrador; não
foi encontrado escritor anônimo para o JSON-LD. Não se afirma XSS anônimo
demonstrado. A exposição efetiva dos grants SQL anteriores depende do histórico
de migrações e dos privilégios de produção, que não foram observados. Limites
de corpo, mapa CSP e headers dos links são endurecimento sem demonstração de
indisponibilidade ou vazamento em produção.

## Banco e ordem de publicação

1. Validar em banco descartável a migração
   `supabase/migrations/20261030120000_rate_limit_privileges.sql`.
2. Aplicá-la no ambiente alvo **antes** de publicar o código que falha fechado.
   Sem a função/tabela/permissões corretas, login, reservas e operações protegidas
   ficam indisponíveis em vez de ignorar os limites.
3. Publicar e validar o login com conta principal verificada e MFA, além dos
   fluxos de reserva e administração.

`sql/009_rate_limit.sql` contém exatamente o mesmo SQL para instalações manuais.
Migrações históricas não foram reescritas. A tabela antiga `rate_limit_entries`,
quando existe, é preservada e tem o acesso público revogado; o código usa
`security_rate_limits`. Se apenas a tabela antiga era usada, os contadores
canônicos começam uma nova janela; os contadores antigos não são transferidos.
Não reaplicar os scripts históricos `001`, `002` ou `006` isoladamente em uma
base migrada: eles contêm políticas/grants substituídos pelo endurecimento.

## Verificações

| Verificação | Resultado |
| --- | --- |
| Dependências instaladas para consultar os guias locais | `npm ci --ignore-scripts --no-audit --no-fund`; scripts de instalação desativados |
| Guias do Next 16.3.1 | Lidos os guias locais de autenticação, segurança de dados, JSON-LD, handlers e headers antes das alterações |
| Dependências conhecidas vulneráveis | `npm audit --package-lock-only --json`: zero no lockfile consultado; não prova ausência de falhas da aplicação |
| Versões/lockfile | Sem alterações de versão; o audit não indicou correção de dependência necessária |
| TypeScript | `node node_modules/typescript/bin/tsc --noEmit --incremental false` passou |
| Sintaxe sem execução | `node --check scripts/test-database.mjs` e `node --check next.config.mjs` passaram |
| Diff | `git diff --check` passou; hashes SHA-256 dos dois instaladores SQL são iguais |
| Revisão estática separada | Autorização/MFA, compatibilidade SQL e mudanças web revisados; ajuste de memória por fragmentos incorporado |
| Testes, lint com configuração executável, build e navegador | Pendentes por restrições de execução da skill |
| Produção e login real | Não verificados; nenhuma migração, notificação ou alteração remota executada |

Foram acrescentados casos de regressão para e-mail principal verificado,
coexistência das listas, MFA inválido, escape de JSON-LD, corpos fragmentados e
limites reais em bytes. O teste SQL verifica `PUBLIC`, `anon`, `authenticated`,
limpeza sem remover contadores ativos, entradas inválidas, tabela antiga e
reaplicação do instalador após simular ACLs permissivas. Esses testes estão
preparados, **não executados**.

Para completar a validação, executar em sandbox compatível `npm test`,
`npm run test:db`, lint e build com dados fictícios e provedores simulados.
O build também precisa de uma estratégia local para a fonte Nunito e leituras
Supabase, sem liberar rede ou credenciais reais ao processo de auditoria.

## Pendências de configuração

- Confirmar no Clerk a conta solicitada, e-mail principal verificado e MFA, e
  habilitar os métodos necessários na instância. A exigência restaurada bloqueia
  contas que ainda não concluíram essa configuração.
- Conferir variáveis e migrações efetivas do ambiente alvo; os documentos
  históricos de produção não são prova do estado atual.
- Configurar um `APP_SESSION_SECRET` próprio, aleatório e com ao menos 32
  caracteres. O fallback existente para a chave de serviço foi preservado;
  separação e rotação de chaves continuam pendentes de configuração operacional.
- A CSP ainda permite scripts inline conforme a decisão já documentada em
  `docs/SECURITY.md`. Remover isso exige solução de nonce/hash e validação do
  Clerk/ISR; não foi alterado sem essa validação.

Referências técnicas: [claims de sessão Clerk](https://clerk.com/docs/guides/sessions/session-tokens)
e [JSON-LD no Next.js](https://nextjs.org/docs/app/guides/json-ld).

## Validação funcional posterior

Na tarefa posterior de adicionar os combos, os testes foram executados como
verificação funcional normal do projeto. `npm test` passou com 16 casos,
incluindo os testes de segurança preparados nesta revisão. O comando precisou
de execução fora da restrição de subprocessos do sandbox após `spawn EPERM`.
`npm run test:db` também passou com as migrações antigas e novas, grants/RLS,
reaplicação do limitador, termos dos combos e reservas individuais de 45 minutos.
Esses resultados atualizam a pendência funcional, mas não concluem a auditoria
formal da Cloudflare: seus validadores e requisitos específicos de isolamento
continuam sem atendimento neste Windows. Produção não foi acessada ou alterada.
