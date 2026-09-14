# Migração de região do Supabase

Este documento descreve o procedimento para aproximar o banco do público do
SpaSmooth (Nordeste do Brasil). Ele **não executa** uma migração automática.

## Estado a confirmar

A região do projeto Supabase não é declarada no repositório. Confirme-a no
Dashboard do Supabase em **Project Settings → General → Region** antes de
qualquer mudança. Registre somente o nome da região, nunca URL privada, chave
anônima, service role ou dados de reservas.

## Quando migrar

Só programe a mudança após a Vercel estar em `gru1` e em uma janela de
manutenção. Migrar apenas a Function ou apenas o banco preserva uma perna de
latência desnecessária.

## Roteiro seguro

1. Exportar schema, migrações versionadas e um backup restaurável do Supabase.
2. Criar um projeto na região sul-americana disponível no plano contratado.
3. Aplicar as migrações do repositório e validar RLS, funções de agenda e
   políticas de Storage em uma cópia sem dados pessoais.
4. Migrar dados com uma janela de escrita bloqueada; validar contagens,
   integridade de agendamentos e uploads.
5. Atualizar `NEXT_PUBLIC_SUPABASE_URL`, a chave pública e a chave de serviço
   somente nas variáveis protegidas da Vercel. Nunca versionar esses valores.
6. Testar reserva, agenda administrativa, catálogo público e rollback antes de
   trocar o tráfego.

## Critérios de aceite

- Nenhuma tabela administrativa é acessível com a chave anônima.
- O fluxo de reserva e os horários retornam o mesmo resultado antes e depois.
- O novo endpoint apresenta latência menor a partir do Brasil.
- Há backup e procedimento de retorno documentados antes do corte.
