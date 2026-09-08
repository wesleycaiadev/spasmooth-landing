# Segurança

Nunca versione credenciais, tokens, dados de clientes ou arquivos `.env`.

Relate vulnerabilidades de forma privada ao responsável pelo projeto. Não abra uma issue pública com detalhes exploráveis antes da correção.

As variáveis necessárias para desenvolvimento estão documentadas em `.env.example`. Execute `npm test` e `npm run test:db` antes de enviar alterações que afetem autenticação, agendamento ou banco de dados.
