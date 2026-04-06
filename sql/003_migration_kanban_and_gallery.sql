-- 1. Cria a coluna de Galeria de Fotos nos profissionais
-- Adicione este código no SQL Editor do Supabase e clique em RUN.
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb;
