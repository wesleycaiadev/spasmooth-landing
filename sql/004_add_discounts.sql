ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS discount_percent numeric(5, 2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
ADD COLUMN IF NOT EXISTS discount_active boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.services.discount_percent IS 'Percentual de desconto promocional (0 a 100)';
COMMENT ON COLUMN public.services.discount_active IS 'Indica se o desconto promocional está ativo';
