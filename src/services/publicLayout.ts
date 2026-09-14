import 'server-only';

import { unstable_cache } from 'next/cache';
import { DEFAULT_LAYOUT, type LayoutSection } from '@/lib/layoutConfig';
import { createAdminClient } from '@/lib/supabaseAdmin';

export type PublicLayoutResult = { success: true; data: LayoutSection[] };

async function readPublicLayoutConfig(): Promise<PublicLayoutResult> {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('site_config')
            .select('sections_layout')
            .eq('id', 'landing_page')
            .single();

        if (error || !data?.sections_layout) {
            return { success: true, data: DEFAULT_LAYOUT };
        }

        return { success: true, data: data.sections_layout as LayoutSection[] };
    } catch {
        // A página pública segue disponível com a composição padrão durante uma indisponibilidade.
        return { success: true, data: DEFAULT_LAYOUT };
    }
}

// Conteúdo público, igual para todos os visitantes. A edição no painel usa updateTag
// para invalidar esta leitura imediatamente, sem expor uma consulta administrativa ao cliente.
export const getCachedPublicLayoutConfig = unstable_cache(
    readPublicLayoutConfig,
    ['site-config', 'landing-page'],
    { revalidate: 3600, tags: ['site-config:landing-page'] }
);
