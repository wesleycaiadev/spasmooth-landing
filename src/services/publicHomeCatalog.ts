import 'server-only';

import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabaseAdmin';

type PublicHomeService = {
    id: string;
    category: string;
    prices?: Array<{ discount_percentage?: number }>;
    [key: string]: unknown;
};

type FeaturedCarouselConfig = {
    mode: 'manual' | 'promotions';
    serviceIds: string[];
    maxItems: number;
};

export type PublicHomeCatalog = {
    services: PublicHomeService[];
    categoryOrder: string[];
    carouselConfig: FeaturedCarouselConfig;
};

const DEFAULT_CATEGORY_ORDER = ['combo', 'day_spa', 'estetica', 'depilacao', 'tantrica'];
const DEFAULT_CAROUSEL_CONFIG: FeaturedCarouselConfig = {
    mode: 'promotions',
    serviceIds: [],
    maxItems: 3,
};

async function readPublicHomeCatalog(): Promise<PublicHomeCatalog> {
    try {
        const supabase = createAdminClient();
        const [servicesResult, categoriesResult, carouselResult] = await Promise.all([
            supabase.from('services').select('*').eq('active', true).order('category').order('name'),
            supabase.from('site_config').select('sections_layout').eq('id', 'service_categories').single(),
            supabase.from('site_config').select('sections_layout').eq('id', 'featured_carousel').single(),
        ]);

        return {
            services: servicesResult.error || !servicesResult.data ? [] : servicesResult.data as PublicHomeService[],
            categoryOrder: categoriesResult.error || !categoriesResult.data?.sections_layout
                ? DEFAULT_CATEGORY_ORDER
                : categoriesResult.data.sections_layout as string[],
            carouselConfig: carouselResult.error || !carouselResult.data?.sections_layout
                ? DEFAULT_CAROUSEL_CONFIG
                : carouselResult.data.sections_layout as FeaturedCarouselConfig,
        };
    } catch {
        return {
            services: [],
            categoryOrder: DEFAULT_CATEGORY_ORDER,
            carouselConfig: DEFAULT_CAROUSEL_CONFIG,
        };
    }
}

// O catálogo mostrado na home é o mesmo para todos os visitantes. O painel o
// invalida por tag após cada alteração para que não haja atraso editorial.
export const getCachedPublicHomeCatalog = unstable_cache(
    readPublicHomeCatalog,
    ['public-home-catalog'],
    { revalidate: 3600, tags: ['public-home-catalog'] }
);
