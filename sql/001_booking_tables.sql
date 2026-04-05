CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS public.services (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name             text NOT NULL,
    duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
    price            numeric(10, 2) NOT NULL CHECK (price >= 0),
    description      text DEFAULT '',
    category         text NOT NULL DEFAULT 'massage',
    active           boolean NOT NULL DEFAULT true,
    created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de serviços" ON public.services;
CREATE POLICY "Leitura pública de serviços"
    ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin acesso total em serviços" ON public.services;
CREATE POLICY "Admin acesso total em serviços"
    ON public.services FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.bookings (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      timestamptz NOT NULL DEFAULT now(),
    unit            text NOT NULL CHECK (unit IN ('Aracaju', 'Maceió', 'Recife')),
    professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
    service_id      uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    client_name     text NOT NULL CHECK (char_length(client_name) BETWEEN 3 AND 100),
    client_phone    text NOT NULL CHECK (char_length(client_phone) BETWEEN 10 AND 20),
    starts_at       timestamptz NOT NULL,
    ends_at         timestamptz NOT NULL,
    status          text NOT NULL DEFAULT 'pendente'
                        CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'concluido')),
    notes           text DEFAULT '' CHECK (char_length(notes) <= 500),
    CONSTRAINT booking_time_order CHECK (ends_at > starts_at)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inserção pública de booking" ON public.bookings;
CREATE POLICY "Inserção pública de booking"
    ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role acesso total em bookings" ON public.bookings;
CREATE POLICY "Service role acesso total em bookings"
    ON public.bookings FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Admin leitura de bookings" ON public.bookings;
CREATE POLICY "Admin leitura de bookings"
    ON public.bookings FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_bookings_professional_timerange
    ON public.bookings
    USING GIST (professional_id, tstzrange(starts_at, ends_at));

CREATE INDEX IF NOT EXISTS idx_bookings_starts_at_status
    ON public.bookings (starts_at, status);

INSERT INTO public.services (name, duration_minutes, price, description, category) VALUES
    ('Terapia Tântrica - 1h',          60,   350.00, 'Massagem relaxante/meditação, sensitive e orgástica.', 'massage'),
    ('Terapia Tântrica - 2h',         120,   450.00, 'Sessão estendida em três etapas.', 'massage'),
    ('Massagem Relaxante Especial',    60,   200.00, 'Massagem relaxante e orgástica.', 'massage'),
    ('Massagem Nuru',                   60,   400.00, 'Massagem sensual em quatro etapas.', 'massage'),
    ('Vivência Delirium',              60,   500.00, 'Massagem sensual com troca, em cinco etapas.', 'massage'),
    ('Tailandesa',                      90,   300.00, 'Relaxante, sensitive e deslizamento.', 'massage'),
    ('Ventosa com Relaxante - 40min',  40,   150.00, 'Combinação para alívio de tensões.', 'massage'),
    ('Ventosa com Relaxante - 60min',  60,   250.00, 'Combinação com finalização.', 'massage'),
    ('Vivência Premium Black',         120,  1850.00, 'Vinho + 30min SPA + 80min vivência premium.', 'massage'),
    ('Depilação - Meia Perna',         20,    25.00, 'Apara da meia perna.', 'waxing'),
    ('Depilação - Perna Completa',     30,    50.00, 'Apara de toda a perna.', 'waxing'),
    ('Depilação - Braços',             20,    25.00, 'Apara de ambos os braços.', 'waxing'),
    ('Depilação - Costas',             20,    25.00, 'Remoção de pelos das costas e ombros.', 'waxing'),
    ('Depilação - Abdômen',            20,    25.00, 'Remoção da região abdominal e peito.', 'waxing'),
    ('Depilação - Íntima',             20,    25.00, 'Apara da região íntima.', 'waxing'),
    ('Depilação - Corpo Todo',         60,   125.00, 'Pacote completo.', 'waxing')
ON CONFLICT DO NOTHING;