import 'server-only';

import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabaseAdmin';

const PUBLIC_UNITS = ['Aracaju', 'Maceió', 'Recife'] as const;

export type PublicProfessional = {
    id: string;
    name: string;
    photo_url: string | null;
    gallery_urls: string[];
    specialties: string[];
    location: string;
    location_start_date: string | null;
    location_end_date: string | null;
    active: boolean;
    bio?: string;
    role?: string;
};

async function readPublicProfessionals(unit: string): Promise<PublicProfessional[]> {
    if (!PUBLIC_UNITS.includes(unit as (typeof PUBLIC_UNITS)[number])) return [];

    try {
        const { data, error } = await createAdminClient()
            .from('professionals')
            .select('id,name,photo_url,gallery_urls,specialties,location,location_start_date,location_end_date,active,bio,role')
            .eq('active', true)
            .eq('location', unit)
            .order('name');

        return error || !data ? [] : data as PublicProfessional[];
    } catch {
        return [];
    }
}

// O primeiro paint da home inclui a equipe padrão. A alteração no painel usa
// updateTag para invalidar todas as unidades sem transformar a home em SSR.
export const getCachedPublicProfessionals = unstable_cache(
    readPublicProfessionals,
    ['public-professionals'],
    { revalidate: 3600, tags: ['public-professionals'] }
);
