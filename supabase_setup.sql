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

-- 3. Criar Tabela de Bloqueios/Locks Temporários de Horários
CREATE TABLE IF NOT EXISTS public.booking_locks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id text NOT NULL,
    appointment_date date NOT NULL,
    appointment_time text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Ativar segurança da linha para booking_locks e permitir todo acesso anônimo (para o fluxo de agendamento no site cliente)
ALTER TABLE public.booking_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura anonima" ON public.booking_locks FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anonima" ON public.booking_locks FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir exclusao anonima" ON public.booking_locks FOR DELETE USING (true);
