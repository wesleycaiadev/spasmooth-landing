# Anamnese digital · teste da branch

A reserva e o lead continuam a ser criados por `check_and_create_booking`. Com `BOOKING_ANAMNESIS_ENABLED=true`, um RPC chama essa mesma função e grava a ficha pendente e a fila de notificação na mesma transação. `/interesse` usa o recibo assinado e HttpOnly da reserva, válido por 30 minutos. A tela envia um vínculo ao recibo para evitar que um formulário aberto em outra aba seja salvo na reserva mais recente. O painel usa a autorização administrativa existente a cada leitura e revisão e registra o identificador Clerk do responsável.

## Preparar o ambiente de teste

1. Use um banco de teste com o esquema atual e aplique a migração [20261122150000_booking_anamnesis.sql](../supabase/migrations/20261122150000_booking_anamnesis.sql). Use contas autorizadas e dados fictícios.
2. Configure `NEXT_PUBLIC_SITE_URL` para o ambiente de teste e habilite `BOOKING_ANAMNESIS_ENABLED`. O prazo padrão é de 300 segundos e pode ser ajustado entre 60 e 1.200 segundos.
3. Configure um agendador no ambiente de teste para chamar `POST /api/booking/notifications-worker` a cada minuto, com `Authorization: Bearer <BOOKING_ANAMNESIS_WORKER_SECRET>`. Use um segredo aleatório de pelo menos 32 caracteres. O worker processa a fila, marca fichas pendentes após o prazo e executa o descarte. A contingência ocorre na primeira execução elegível com capacidade na fila.
4. Deixe `BOOKING_NOTIFICATIONS_ENABLED=false` para começar pelo formulário e pelo painel. Para testar a entrega real, habilite a flag somente no ambiente de teste e use credenciais CallMeBot autorizadas para esse teste.
5. Faça reservas de massagem, depilação, bronzeamento e de um combo ou plano. Confira as quatro etapas, as perguntas por serviço, os dois lados do mapa no celular, a remoção e a seleção por nome. Complete uma ficha e pule outra. Feche uma terceira sem responder, execute o worker após o prazo e reabra `/interesse` na mesma sessão para preencher a ficha. Todas devem levar a `/obrigado` ao concluir ou pular.
6. Com uma sessão administrativa, abra a ficha em **Agendamentos**, confirme o vínculo com a reserva e registre a revisão. Em outra janela sem conta autorizada, tente acessar a URL diretamente. Confira os links de confirmação e recusa e a liberação do horário após o cancelamento.

## Notificação e operação

Concluir ou pular adianta a fila para a próxima tentativa elegível. Um disparo após a resposta tenta processá-la imediatamente e o worker garante a contingência persistente. O processamento usa uma linha por reserva e uma tomada exclusiva com `FOR UPDATE SKIP LOCKED`. Um preenchimento depois da tomada ou da aceitação atualiza a ficha sem reabrir um envio encerrado.

O CallMeBot documenta uma chamada GET para envio. A aplicação diferencia aceitação reconhecida pela resposta HTTP de confirmação no WhatsApp. Timeout, interrupção do worker após a tomada e respostas ambíguas ficam como **Resultado desconhecido**. Apenas HTTP 429 ou falha anterior à chamada podem entrar em retentativa automática, com até três tentativas e intervalos de dois e quatro minutos. A documentação pública do serviço não especifica chave de idempotência ou comprovante de entrega. Confira a resposta real do provedor no ambiente de teste e verifique a elegibilidade da modalidade de uso contratada. [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/)

**Falhou**, **Resultado desconhecido** e filas acima do prazo precisam de acompanhamento em **Agendamentos**. O conteúdo da ficha e as observações livres ficam no painel. A mensagem usa os dados operacionais da reserva, o estado de preenchimento e links de acesso. Para investigação, `booking_notification_outbox` registra tentativa, estado, código de resultado e horário. Configure o monitoramento para verificar a idade da fila e falhas do worker sem capturar o corpo de requisições, o URL do provedor ou o cabeçalho de autorização.

## Privacidade e ativação

A [proposta clínica `spa-2`](ANAMNESE-REVISAO-CLINICA.md) reúne o questionário ampliado e suas regras condicionais. A emissão de novas fichas clínicas depende da aprovação da versão e da configuração das profissionais designadas.

As tabelas têm RLS e as funções e tabelas concedem acesso à aplicação no servidor. As páginas da ficha usam `no-store`, `noindex`, `no-referrer` e ficam fora do Google Analytics. Os mapas e respostas estruturadas são descartados após o prazo de retenção configurado, inicialmente 30 dias após o envio. A auditoria de eventos, com ator administrativo quando aplicável, tem retenção inicial de 90 dias. Os estados operacionais e de descarte permanecem vinculados à reserva. Valide os prazos e o ciclo de expiração de backups com a política do SpaSmooth.

As perguntas iniciais são de preferência e de encaminhamento à revisão. A configuração versionada em `src/lib/anamnesis/questionnaire.ts` deve receber a aprovação da profissional responsável antes de incluir perguntas clínicas. Valide o aviso e a base legal com a equipe responsável pela LGPD antes de coletar dados reais. O consentimento da ficha tem finalidade própria e é independente das escolhas de marketing e da autorização do procedimento. [ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte) · [OWASP ASVS](https://asvs.owasp.org/) · [Supabase](https://supabase.com/docs/guides/api/securing-your-api) · [Clerk](https://clerk.com/docs/guides/secure/protect-content) · [Next.js](https://nextjs.org/docs/app/guides/data-security)

## Reversão

Desative `BOOKING_ANAMNESIS_ENABLED` para voltar ao fluxo anterior em novas reservas. Mantenha esta versão, a migração e o worker enquanto houver itens na fila ou dados sujeitos a retenção. As fichas emitidas antes da desativação ainda usam o recibo válido e o link administrativo direto. Deixe os estados desconhecidos para conferência operacional. Planeje a remoção definitiva da estrutura depois de esgotar a fila e cumprir a política de descarte.
