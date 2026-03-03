-- Copie e cole este código no SQL Editor do Supabase (https://supabase.com/dashboard/project/_/sql)

-- 1. Adicionar as novas colunas à tabela 'professionals'
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS location text DEFAULT 'Aracaju',
ADD COLUMN IF NOT EXISTS location_start_date date,
ADD COLUMN IF NOT EXISTS location_end_date date;

-- 2. Atualizar todos os profissionais existentes para garantir o padrão
UPDATE public.professionals
SET location = 'Aracaju'
WHERE location IS NULL;
