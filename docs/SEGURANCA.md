# Revisão e plano de segurança — SpaSmooth

Data: 08/09/2026. Escopo: código deste diretório, projeto Supabase `SPASMOOTH` (`xqxrjwamybfndpnvlgie`) e projeto Vercel `spasmooth-landing` (`prj_CMePJLW51cCANthSPKaoI2Aw8cN2`).

**Estado da entrega: migração aplicada e verificada no Supabase; versão de segurança publicada nos três domínios de produção.** Migração remota 20260908100346_security_hardening, aplicada em 08/09/2026. Deployment dpl_D5ffdeMii1VYzXp5QWUuNetHUA3X promovido e aliases conferidos. MFA individual e testes autenticados ainda precisam ser concluídos.

## Reavaliação: ainda não encerrar a revisão de segurança

A proteção técnica básica melhorou, mas há uma pendência de alta prioridade no login de produção. Esta conclusão substitui a impressão de que faltaria apenas cadastrar o segundo fator de cada usuário.

| Prioridade | Evidência confirmada em 08/09/2026 | O que falta |
|---|---|---|
| Alta | O HTML de /entrar carrega grand-reindeer-97.clerk.accounts.dev; sua configuração pública informa test_mode=true | Ativar a instância Production do Clerk, configurar domínio/DNS e substituir o par de chaves na Vercel. Validar administradores na instância correta antes de concluir a troca |
| Alta | Na instância utilizada, authenticator_app.enabled=false e backup_code.enabled=false; segundo fator disponível listado como phone_code | Habilitar TOTP e códigos de recuperação, cadastrar cada administrador e testar o segundo fator. O código do painel exige MFA, mas isso não configura o provedor nem comprova que usuários já conseguem entrar |
| Alta — verificação | Não foi executado login administrativo real, revogação/logout nem teste de usuário autenticado sem permissão | Testar os fluxos completos, inclusive API/Server Actions, cookie válido/expirado, logout e upload autenticado |
| Média | APP_SESSION_SECRET não aparece na listagem de produção | Criar segredo exclusivo para assinatura dos cookies; hoje o código usa a service role como fallback. A separação permite rotação independente |
| Média | enumeration_protection.enabled=false na configuração pública do Clerk | Habilitar a proteção contra enumeração e revisar recuperação de conta e bloqueio de tentativas na instância Production |
| Operacional | Backup com restauração testada, alertas e trilha de auditoria administrativa não foram demonstrados | Confirmar restauração, responsáveis e retenção; registrar quem alterou dados sem gravar payloads pessoais nos logs |
| Privacidade | Aviso e preferências implementados; retenção, controlador e processo de exclusão ainda não formalizados | Concluir definições e revisar atendimento aos titulares; banner sozinho não comprova conformidade |

O Clerk informa que instâncias Development têm controles mais permissivos e são inadequadas para produção. A mudança de instância exige verificar contas, configurações e integrações; não basta trocar uma URL. [Ambientes do Clerk](https://clerk.com/docs/guides/development/managing-environments), [publicação em produção](https://clerk.com/docs/guides/development/deployment/production) e [configuração de MFA](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options).

Nova conferência: npm audit retornou zero vulnerabilidades conhecidas; as oito tabelas públicas continuam com RLS, sem escrita por anon/authenticated, sem views públicas adicionais e sem CREATE de anon no schema public. Buckets continuam públicos somente para imagens, sem políticas de escrita direta para clientes. O advisor mantém apenas o aviso btree_gist no schema public.

Nos logs da versão publicada havia uma resposta 500 em /admin/rewards causada por um cabeçalho de estado do roteador que o Next não conseguiu interpretar. Isso não demonstrou acesso indevido; a nova requisição comum sem sessão voltou a redirecionar para login. Monitorar recorrência e testar navegação autenticada após a troca do provedor.

Evidências adicionais: docs/security-reassessment.json. A reavaliação consultou configurações públicas do Clerk, metadados do banco, nomes de variáveis e logs técnicos; não acessou contas de clientes nem baixou segredos.

**Critério para considerar a base adequada ao uso habitual:** concluir Clerk Production + MFA, aprovar testes de autorização/sessão de ponta a ponta e comprovar recuperação de backup. CSP com nonce, WAF ajustado ao tráfego e a mudança de schema da extensão são melhorias seguintes. Isso é uma avaliação limitada ao escopo verificado, não uma certificação ou pentest completo.

## Achados prioritários

| Prioridade | Evidência observada | Correção aplicada |
|---|---|---|
| Crítica | RLS habilitado nas 7 tabelas, porém `public_leads_v2` e `public_pros_v2` permitem `ALL USING (true) WITH CHECK (true)` para `public` | Revogar permissões e remover políticas amplas; clientes comuns acessam somente catálogo ativo e 3 registros públicos de configuração |
| Crítica | `verifyAdmin` e upload liberavam qualquer autenticado se a lista de administradores estivesse vazia | Lista vazia nega acesso; ID explicitamente autorizado ou e-mail primário verificado; lista somente no servidor |
| Crítica | GET `/api/booking/action?token=<uuid>&action=...` alterava dados sem autenticação | GET apenas redireciona ao painel, sem consultar clientes nem alterar status |
| Alta | Funções `SECURITY DEFINER` de agendamento/interesse executáveis por `anon` e `authenticated` | Revogar EXECUTE de funções da aplicação; novas funções com SECURITY INVOKER; fixar search_path |
| Alta | POST `/api/booking/notify` aceitava mensagem e dados arbitrários sem autenticação | Endpoint aposentado com HTTP 410; notificações somente no fluxo validado do servidor |
| Alta | Ausência de limite distribuído de requisições | Contadores atômicos no PostgreSQL para agendamento, telefone, disponibilidade, sessão e ações administrativas/uploads |
| Alta | Fidelidade e notificações administrativas liam leads pelo navegador com cliente público | Server Actions com autorização; notificações consultadas a cada 30 segundos quando a aba está visível |
| Alta | Upload confiava no MIME declarado e não decodificava o arquivo | Decodificação real com Sharp, formato compatível, limite de pixels e tamanho, regravação WebP e remoção de metadados |
| Alta | Consulta de disponibilidade e criação não impunham as mesmas regras; prevenção de sobreposição insuficiente | Regra compartilhada no banco, lock por profissional, constraint de exclusão e duração derivada do serviço |
| Média | Campos administrativos aceitavam objetos parciais sem esquema e havia interpolação na gramática `.or()` | Schemas Zod, campos permitidos, limites e consultas do dashboard com parâmetros independentes |
| Média | Build ignorava erros TypeScript e ESLint estava em versão diferente do Next | TypeScript ativo no build; configuração ESLint compatível; versões fixas e lockfile atualizado |
| Média | Analytics e Google Maps carregavam sem escolha prévia | Banner com rejeição, escolha por categoria e revogação; recursos opcionais desligados por padrão |

A consulta de produção encontrou **zero pares de agendamentos sobrepostos** antes da migração. Isso é uma fotografia da consulta, não uma garantia de que novos conflitos não aparecerão antes de aplicar a constraint. Não foram extraídos registros de clientes para conduzir a revisão.

## Controles por assunto

| Assunto solicitado | Implementação / resultado | Limitação ou próximo passo |
|---|---|---|
| RLS | Migração aplicada; RLS e grants verificados nas 8 tabelas, incluindo rate limit; leituras privadas negadas sob anon/authenticated | Testes negativos no banco real aprovados; integração autenticada completa pendente |
| API keys | `server-only` no cliente privilegiado; remoção do cliente Supabase do navegador; modelo `.env.example` sem valores reais | Não foi auditado histórico Git: o diretório disponibilizado não contém repositório Git utilizável |
| Rate limit | Persistente no banco, HMAC de IP/telefone, falha fechada | Não substitui WAF contra ataques volumétricos ou múltiplos IPs |
| Validação no servidor | Zod e checagens no SQL; nenhum preço/duração confiado ao navegador | UI autenticada completa precisa de teste real |
| Queries | PostgREST `.eq/.gte/.lte`, argumentos RPC; remoção da interpolação do dashboard | SQL dinâmico da migração usa `%I` para identificadores obtidos do catálogo, sem entradas HTTP |
| Senhas | Autenticação delegada ao Clerk; aplicação não recebe nem armazena senhas | Checagem de senhas comprometidas ativa na configuração pública atual; revalidar na instância Production. A aplicação não mantém tabela própria de senhas |
| HttpOnly | Cookie administrativo assinado, Secure em produção, SameSite=Strict, vinculado a usuário e sessão | Clerk mantém seu próprio token curto acessível ao SDK; o cookie adicional protege a autorização administrativa e não altera a arquitetura interna do Clerk |
| Tokens | Grant administrativo de 8h; receipt de agendamento de 30min; assinatura, finalidade e expiração verificadas | Chave dedicada `APP_SESSION_SECRET` recomendada; na ausência usa segredo do servidor Supabase; trocar a chave invalida os cookies locais |
| Revogação | Consulta da sessão ativa e usuário atual no Clerk a cada autorização | Indisponibilidade do provedor bloqueia o acesso; não foi simulado logout real |
| 2FA | Administração exige `twoFactorEnabled` e segundo fator comprovado no JWT, no máximo 480 minutos; página `/seguranca` | Configuração pública verificada: instância Development, TOTP e códigos de recuperação desativados. Corrigir provedor e concluir cadastro/teste dos administradores |
| Permissões | Leitura pública mínima e administração centralizada no servidor | Papéis de recepcionista, terapeuta e financeiro separados ainda não existem |
| CORS / CSRF | Origens exatas para APIs mutáveis; sem `Access-Control-Allow-Origin: *`; proteções nativas do Next nas Server Actions | CORS não protege a Data API Supabase: essa proteção depende de grants/RLS |
| Uploads | 4 MB de entrada, 16 milhões de pixels, imagem estática JPEG/PNG/WebP, saída WebP com nome aleatório | Fotos continuam públicas por finalidade do catálogo; não usar esses buckets para documentos ou dados sensíveis |
| Dependências | Auditoria inicial: 4 pacotes vulneráveis, incluindo 2 de severidade alta; após correção: 0 vulnerabilidades conhecidas | Resultado representa o registro npm no momento da revisão, não uma garantia permanente |
| Rotas | Autorização no layout administrativo, em cada ação e API; SDK inicializado pelo proxy | Login/2FA e usuário comum autenticado ainda precisam de teste de integração com a instância real |
| Headers | nosniff, anti-frame, HSTS em produção, Referrer-Policy, Permissions-Policy e CSP sem unsafe-eval | CSP ainda permite scripts inline para compatibilidade; migrar para nonces após testar Clerk, Analytics e renderização Next |
| LGPD | Aviso de privacidade, ciência no formulário, categorias de cookies e revogação; sem geolocalização automática | A interface não representa conformidade LGPD completa; faltam definição formal de controlador, prazos de retenção, bases legais específicas e processo de atendimento aos titulares |

Não foi encontrada chave privada literal nos arquivos de código/configuração/documentação varridos por padrões de segredos. Arquivos de ambiente, dependências e artefatos foram excluídos desse levantamento. A leitura de nomes das variáveis confirmou a presença de `ADMIN_EMAILS`, `SUPABASE_SERVICE_ROLE_KEY` e `CLERK_SECRET_KEY` na Vercel; os respectivos valores não foram baixados. `vercel link` criou apenas um token OIDC temporário local, ignorado pelo Git.

As variáveis públicas de Supabase/Clerk são identificadores públicos, quando usadas corretamente. Esconder a chave pública não corrige uma política RLS permissiva. Nunca colocar service role, secret key Clerk ou credenciais de serviços sob `NEXT_PUBLIC_`.

## Limites implementados

| Operação | Limite |
|---|---|
| Criar agendamento por IP | 5 tentativas / 15 minutos |
| Criar agendamento por telefone normalizado | 3 tentativas / hora |
| Consultar horários | 60 / minuto por IP |
| Atualizar observação por receipt | 5 / 15 minutos por IP |
| Abrir sessão administrativa | 10 / 5 minutos por IP |
| Operações administrativas autorizadas | 180 / minuto por administrador |
| Upload/exclusão de fotos | 20 / 5 minutos por administrador |

O IP de produção na Vercel vem de `x-vercel-forwarded-for`. Não se confia em um IP arbitrário enviado no corpo ou em cabeçalho customizado pelo usuário. Fora da Vercel, produção usa um contador de fallback compartilhado quando não há uma origem confiável de IP. Definir um adaptador confiável antes de migrar a hospedagem.

O contador usa janela fixa a partir do primeiro acesso e limpeza oportunista dos registros expirados. Requisições simultâneas atualizam a mesma linha atomicamente; a verificação funcional local não substitui ensaio de carga em múltiplas instâncias. Cadastros inválidos também gastam cota. No servidor, erros do limitador não liberam a operação.

## Implantação em produção

- Deployment: `dpl_D5ffdeMii1VYzXp5QWUuNetHUA3X`, estado `READY`.
- URL: https://spasmooth-landing-n9c2746a3-wesleycaiadevs-projects.vercel.app
- Deployment promovido após aplicar e verificar a migração. Aliases reais confirmados: spasmooth.com.br, www.spasmooth.com.br e spasmooth.vercel.app apontam para a nova versão. O domínio sem www redireciona para https://www.spasmooth.com.br/.
- Build remoto aprovado. HTTP no domínio de produção: início, privacidade e login 200; administrador sem sessão 307 para /entrar; upload com origem externa 403; GET de ação antiga 303 sem mutação; relay aposentado com 410. Evidências em docs/deployment-validation.json.
- Headers de produção confirmados: CSP sem unsafe-eval, HSTS, nosniff e X-Frame-Options DENY; respostas administrativas sem cache.
- Snapshot das políticas anteriores: `docs/security-before.json`, sem dados de clientes.

## Verificação do Supabase em produção

- Histórico remoto confirma a migração 20260908100346; arquivo local alinhado a essa versão.
- Nas 8 tabelas revisadas: RLS habilitado, nenhuma escrita por anon/authenticated e leitura pública somente de catálogo/configuração.
- As 8 funções revisadas negam EXECUTE a anon/authenticated e permitem ao servidor. Constraint bookings_no_overlap validada.
- Transação revertida confirmou negação de leitura privada e bloqueio da terceira chamada de um limite de duas. Nenhum registro de teste permaneceu.
- Advisor de segurança: restou somente o aviso da extensão btree_gist no schema público. [Orientação do Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public).
- Evidências: docs/security-after.json. Não foram extraídos dados de clientes.

## Verificação realizada

- `npm test`: arquivo com 7 casos de teste passou. Execução direta também confirmou os 7 casos individualmente.
- `npm run test:db`: migração aplicada a PostgreSQL PGlite isolado com esquema mínimo compatível; testes passaram para grants/RLS, rate limit/expiração, disponibilidade, duplicatas, constraint de exclusão, vínculo lead/agendamento e reagendamento. Nenhum acesso ao banco remoto nesse teste.
- `npm run typecheck`: passou.
- `npm run build`: passou usando chave pública fictícia de Clerk; nenhuma credencial de produção necessária. Nova compilação final executada após os últimos ajustes.
- `npm run lint`: sem erros; avisos React existentes. Três regras novas de migração/performance do compilador React foram mantidas como avisos, explicitamente documentadas no arquivo ESLint.
- HTTP local: `/privacidade` = 200, endpoint antigo de alteração = 303, endpoint de notificação = 410; respostas com nosniff e rotas API com no-store.
- Não houve navegador conectado. Layout visual, consentimento no navegador, MFA, cookies Secure reais e fluxos autenticados de ponta a ponta **não foram verificados**.
- A tentativa inicial de verificar rotas administrativas localmente não pôde autenticar porque não há secret key Clerk local. Não interpretar esse resultado como teste funcional de login aprovado.

## Roteiro de implantação e manutenção

A migração e a promoção abaixo já foram executadas nesta revisão. Não reaplicar a migração existente; os passos servem de referência para alterações futuras. As pendências atuais são as da reavaliação acima.

1. Migração e publicação autorizadas e concluídas nesta revisão. Para futuras alterações, revisar impacto e evidências da versão específica.
2. Concluir a verificação da lista administrativa e de MFA no Clerk. Cada administrador deve cadastrar seu fator e guardar seus códigos de recuperação. Testar /seguranca; a administração publicada nega acesso sem segundo fator.
3. Confirmar backup/restauração e registrar as políticas atuais. Reservar janela curta: a migração adquire locks, troca acesso de RPCs e as páginas antigas de interesse/fidelidade deixam de funcionar com a política antiga removida.
4. Aplicar `supabase/migrations/20260908100346_security_hardening.sql` com ferramenta de migração. O script pressupõe as tabelas da instalação existente, não é bootstrap de projeto vazio. **Não reaplicar os SQLs legados de `sql/` isoladamente:** eles contêm permissões históricas amplas que esta migração revoga.
5. Repetir advisors e testes de grants/RLS no ambiente real. As verificações de escrita com dados sintéticos devem usar transação com rollback, já aprovada para o ambiente de destino.
6. Criar deployment com configuração de produção e sem troca inicial de domínio. Validar build, catálogo, login, upload, agenda, painel e consentimento. As variáveis de Preview não incluem toda a configuração pública de Supabase/Clerk; não presumir que um preview comum reproduz produção.
7. Promover a versão verificada e monitorar erros 403/429/503 e chamadas Supabase. Confirmar que o domínio desejado está associado ao projeto correto.

Não há rollback automático que restaure permissões públicas inseguras. Em caso de problema, manter dados pessoais bloqueados, corrigir a versão ou suspender o fluxo afetado. As consultas públicas de catálogo devem permanecer acessíveis, conforme as políticas da migração.

O projeto Vercel está no plano Hobby; a tentativa de deployment mais recente listada antes desta revisão estava em estado `ERROR`. A consulta de overview do firewall retornou 402 por incluir o recurso IP Bypass não disponível nesse plano. A consulta específica confirmou que não há regras WAF customizadas configuradas. Nenhum upgrade foi feito. Não foram publicadas regras ou alteradas proteções de infraestrutura. O novo deployment de revisão foi criado posteriormente e está READY.

## Próximas prioridades operacionais

- **Prioridade imediata:** migrar o login para Clerk Production, habilitar TOTP/recuperação e validar login administrativo de ponta a ponta; a versão publicada exige segundo fator. Confirmar variáveis no ambiente remoto sem expor valores. Remover a variável obsoleta NEXT_PUBLIC_ADMIN_EMAILS de novos deployments.
- **Em seguida:** WAF para rotas administrativas e Server Actions, primeiro em modo de observação. Proposta inicial: 100 POSTs/5min por IP para `/api/admin/session`; 200 requisições/5min para `/api/admin/upload`; 300 POSTs/min com header `Next-Action` para investigar automação. Ajustar limites usando tráfego legítimo; o rate limit do aplicativo continua sendo a regra por operação. Não publicar regras sem revisar drafts existentes.
- **Dados pessoais:** inventário e minimização, retenção aprovada e rotina de exclusão, revisão dos textos com identificação do controlador e canal dedicado, registro de consentimentos quando essa for a base legal, contratos com operadores e avaliação das transferências internacionais. Há serviços cujo contexto pode revelar informações sensíveis; revisar bases legais por finalidade e evitar observações de saúde no formulário geral.
- **Contas e segredos:** 2FA também nas contas de equipe Vercel, Supabase e provedor Git; menor privilégio; revisar membros e acessos de ex-colaboradores; rotacionar segredos se houver evidência de exposição e revogar sessões comprometidas.
- **Operação:** trilha de auditoria de mudanças administrativas com ator, ação e ID, sem payload de cliente; alertas de erros/abuso; teste de restauração; revisão periódica das dependências; proteção de branches e CI; revisão das consultas de métricas/filas para paginação acima de 1.000 registros.
- **Hardening adicional:** CSP com nonce, política de senha e detecção de senhas comprometidas no Clerk; retirar extensão `btree_gist` do schema público após testar dependências. A autenticação Supabase não é usada pelo aplicativo, então alterar suas opções de senha/MFA não protege o login Clerk.

## Referências consultadas

- [Supabase: proteção da Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase: chaves públicas e privilegiadas](https://supabase.com/docs/guides/getting-started/api-keys)
- [Linter: funções privilegiadas acessíveis anonimamente](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Linter: search_path mutável](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Linter: extensão em schema público](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public)
- [Clerk: proteção por recurso, inclusive Server Functions](https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher)
- [Clerk: sessões e expiração](https://clerk.com/docs/guides/secure/session-options)
- [Clerk: controles de segurança](https://clerk.com/docs/guides/secure/overview)
- [Next.js: autenticação e cookies](https://nextjs.org/docs/app/guides/authentication)
- [Vercel: cabeçalhos de requisição](https://vercel.com/docs/headers/request-headers)
- [ANPD: recomendações sobre cookies e rejeição](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-emite-recomendacoes-para-adequacao-da-pratica-de-coleta-de-cookies-do-portal-gov.br)
