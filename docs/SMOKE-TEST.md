# Spa Smooth — Smoke Test pós-deploy

Tempo esperado: 5 a 10 minutos. Use um telefone e nome de teste identificáveis; remova o registro de teste pelo Kanban ao final, se a operação permitir.

## Público

- [ ] Abrir `https://spasmooth.com.br` e confirmar redirecionamento/HTTPS.
- [ ] Abrir uma profissional, selecionar serviço, data e horário disponíveis.
- [ ] Tentar enviar sem nome, telefone ou aceite de privacidade: não deve avançar.
- [ ] Criar um agendamento válido uma única vez e confirmar a página de interesse.
- [ ] Enviar uma mensagem de interesse e confirmar a página de agradecimento.
- [ ] Em nova aba, repetir o clique de confirmação durante o loading: não deve duplicar booking.
- [ ] Confirmar que o alerta de WhatsApp administrativo chegou e não contém links de ação pública.

## Admin

- [ ] Entrar em `/entrar` com conta autorizada e abrir o painel.
- [ ] Confirmar que o novo lead aparece no Kanban com nome, WhatsApp, serviço, data, horário e mensagem.
- [ ] Abrir Calendário e Agendamentos: o mesmo booking deve aparecer no horário correto.
- [ ] Alterar o status pelo painel e confirmar sincronização de lead e booking.
- [ ] Atualizar a página e abrir nova aba: sessão e dados devem permanecer corretos.
- [ ] Criar/editar um serviço e um profissional de teste; confirmar persistência após refresh.
- [ ] Enviar, visualizar e excluir uma imagem de galeria de teste.
- [ ] Sair e confirmar que `/admin/*` volta a exigir login.

## Regressão e observabilidade

- [ ] Repetir o fluxo em viewport móvel e desktop.
- [ ] Conferir logs da Vercel: não pode haver `Admin notification disabled by configuration`, falha CallMeBot ou erro de Server Action.
- [ ] Conferir no banco que booking e lead foram criados com o mesmo ID.
