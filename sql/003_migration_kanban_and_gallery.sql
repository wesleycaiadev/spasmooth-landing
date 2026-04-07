-- 1. Cria a coluna de Galeria de Fotos nos profissionais
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb;

-- 2. Cria o Bucket 'avatars' caso não exista
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('avatars', 'avatars', true, 5242880) -- 5MB limit
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Remove politicas antigas de teste para evitar erro
DROP POLICY IF EXISTS "Avatar Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public Delete" ON storage.objects;

-- 4. Cria permissoes completas para o bucket 'avatars' (Permite frontend anon subir fotos)
CREATE POLICY "Avatar Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Avatar Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Avatar Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
