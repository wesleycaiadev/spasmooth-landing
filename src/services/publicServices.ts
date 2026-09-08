import 'server-only';
import { cache } from 'react';
import { createAdminClient } from '@/lib/supabaseAdmin';

export type PublicService = {
  id: string;
  name: string;
  slug: string;
  duration_minutes: number;
  price: number;
  description: string;
  category: string;
  active: boolean;
  seo_indexable: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_content: Record<string, any> | null;
};

// Next.js React cache ensures deduping per-request
export const getServiceBySlug = cache(async (slug: string): Promise<PublicService | null> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('services')
    .select('id, name, slug, duration_minutes, price, description, category, active, seo_indexable, seo_title, seo_description, seo_content')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PublicService;
});

export const getIndexableServices = cache(async (): Promise<PublicService[]> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('services')
    .select('id, name, slug, active, seo_indexable')
    .eq('active', true)
    .eq('seo_indexable', true);

  if (error || !data) {
    return [];
  }

  return data as PublicService[];
});
