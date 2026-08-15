-- Migration: Criação da tabela de configuração de layout do site
-- Este script adiciona a tabela "site_config" para gerenciar as seções dinâmicas da página inicial.

CREATE TABLE IF NOT EXISTS public.site_config (
    id TEXT PRIMARY KEY,
    sections_layout JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (opcional, dependendo do seu esquema)
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Permite leitura para todos (anônimos e autenticados) para que a landing page consiga ler
CREATE POLICY "Permitir leitura pública em site_config" 
    ON public.site_config FOR SELECT 
    USING (true);

-- Permite atualizações apenas por usuários autenticados (ou defina conforme sua política de admin)
CREATE POLICY "Permitir update por administradores" 
    ON public.site_config FOR ALL 
    USING (auth.role() = 'authenticated');

-- Inserir o registro padrão com a ordem inicial das seções
INSERT INTO public.site_config (id, sections_layout) 
VALUES (
    'landing_page', 
    '[
        {"id": "hero", "label": "Banner Principal", "visible": true},
        {"id": "services", "label": "Serviços", "visible": true},
        {"id": "professionals", "label": "Profissionais", "visible": true},
        {"id": "location", "label": "Localização", "visible": true},
        {"id": "testimonials", "label": "Depoimentos", "visible": true},
        {"id": "faq", "label": "Dúvidas Frequentes", "visible": true}
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
