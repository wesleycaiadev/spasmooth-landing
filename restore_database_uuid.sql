-- SCRIPT DEFINITIVO (UUID FIX v2)
-- Resolve erro de "function not unique" limpando todas as versões anteriores.

-- 1. Habilitar extensão
create extension if not exists "uuid-ossp";

-- 2. Limpeza Profunda (Remover todas as variantes possíveis da função)
-- Tenta remover a versão com UUID (se existir)
drop function if exists create_lead(text, text, text, uuid, date, text, text);
-- Tenta remover a versão antiga com Integer/Bigint (se existir)
drop function if exists create_lead(text, text, text, bigint, date, text, text);
-- Tenta remover qualquer outra, se possível (comando genérico nem sempre funciona, por isso os específicos acima)

drop table if exists leads cascade;
drop table if exists professionals cascade;

-- 3. Criar Tabela Profissionais (UUID)
create table professionals (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  specialties text[], 
  photo_url text,
  active boolean default true
);

-- 4. Criar Tabela Leads (UUID)
create table leads (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nome text,
  whatsapp text,
  email text,
  service_name text,
  appointment_date date,
  appointment_time text,
  professional_id uuid references professionals(id),
  mensagem_interesse text,
  status_kanban text default 'novo', 
  admin_notes text
);

-- 5. Função RPC Recriada
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

-- 6. Permissões e Segurança
alter table professionals enable row level security;
create policy "public_pros_policy_uuid_v2" on professionals for all using (true) with check (true);

alter table leads enable row level security;
create policy "public_leads_policy_uuid_v2" on leads for all using (true) with check (true);

-- 7. Inserir Dados (Profissionais e Teste)
insert into professionals (name, specialties, photo_url) values 
('Massoterapeuta (Azul)', 
 ARRAY['Massagem Relaxante', 'Ventosa com relaxante', 'Tailandesa', 'Vivência Delirium', 'Nuru', 'Massagem relaxante especial', 'Terapia Tântrica'], 
 '/assets/pros/vestido_azul.jpg'),

('Massoterapeuta (Praia)', 
 ARRAY['Massagem Relaxante', 'Ventosa com relaxante', 'Tailandesa', 'Vivência Delirium', 'Nuru', 'Massagem relaxante especial', 'Terapia Tântrica'], 
 '/assets/pros/praia.jpg'),

('Massoterapeuta (Sol)', 
 ARRAY['Massagem Relaxante', 'Ventosa com relaxante', 'Tailandesa', 'Vivência Delirium', 'Nuru', 'Massagem relaxante especial', 'Terapia Tântrica'], 
 '/assets/pros/tapando_sol.jpg');

-- Inserir Lead de teste para o primeiro profissional encontrado
insert into leads (created_at, nome, whatsapp, service_name, status_kanban, professional_id)
select now(), 'Cliente Teste Sucesso', '79999999999', 'Massagem Tântrica', 'novo', id 
from professionals limit 1;
