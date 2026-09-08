-- Fase 1: Adicionar colunas
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_indexable BOOLEAN DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_description TEXT;
