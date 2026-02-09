-- SCRIPT DE LIMPEZA PROFUNDA DE FUNÇÕES
-- Remove TODAS as versões da função 'create_lead' para acabar com o conflito.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop para encontrar e apagar todas as funções com nome 'create_lead'
    FOR r IN 
        SELECT oid::regprocedure as func_signature 
        FROM pg_proc 
        WHERE proname = 'create_lead'
    LOOP
        EXECUTE 'DROP FUNCTION ' || r.func_signature || ' CASCADE';
    END LOOP;
END $$;

-- Agora cria APENAS UMA VEZ a função correta
create or replace function create_lead(
  p_nome text,
  p_whatsapp text,
  p_email text,
  p_professional_id uuid,
  p_date date,
  p_time text,
  p_service text
)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into leads (nome, whatsapp, email, professional_id, appointment_date, appointment_time, service_name, status_kanban)
  values (p_nome, p_whatsapp, p_email, p_professional_id, p_date, p_time, p_service, 'novo')
  returning id into new_id;
  
  return new_id;
end;
$$;
