-- ============================================================
-- 003: Adiciona coluna gallery_urls (array de até 5 fotos)
-- na tabela professionals + cria bucket no Supabase Storage
-- ============================================================

-- 1. Nova coluna: array de URLs de fotos (máx. 5)
ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}';

-- 2. Migrar photo_url existentes para gallery_urls (apenas se gallery_urls vazio)
UPDATE public.professionals
SET gallery_urls = ARRAY[photo_url]
WHERE photo_url IS NOT NULL
  AND photo_url != ''
  AND photo_url NOT LIKE '%ui-avatars.com%'
  AND (gallery_urls IS NULL OR array_length(gallery_urls, 1) IS NULL);

-- 3. Constraint: máximo de 5 URLs no array
ALTER TABLE public.professionals
DROP CONSTRAINT IF EXISTS gallery_urls_max_5;

ALTER TABLE public.professionals
ADD CONSTRAINT gallery_urls_max_5
CHECK (array_length(gallery_urls, 1) IS NULL OR array_length(gallery_urls, 1) <= 5);

-- 4. Criar bucket público para fotos dos profissionais
INSERT INTO storage.buckets (id, name, public)
VALUES ('professional-photos', 'professional-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Política de leitura pública (qualquer visitante do site)
DROP POLICY IF EXISTS "Leitura pública de fotos profissionais" ON storage.objects;
CREATE POLICY "Leitura pública de fotos profissionais"
ON storage.objects FOR SELECT
USING (bucket_id = 'professional-photos');

-- 6. Política de upload/delete para service_role (admin via backend)
DROP POLICY IF EXISTS "Admin upload de fotos profissionais" ON storage.objects;
CREATE POLICY "Admin upload de fotos profissionais"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'professional-photos');

DROP POLICY IF EXISTS "Admin delete de fotos profissionais" ON storage.objects;
CREATE POLICY "Admin delete de fotos profissionais"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'professional-photos');
