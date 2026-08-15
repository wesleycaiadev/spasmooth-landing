"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';
import { verifyAdmin } from '@/lib/auth';

export type LayoutSection = {
    id: string;
    label: string;
    visible: boolean;
};

export type FeaturedCarouselConfig = {
    mode: 'manual' | 'promotions';
    serviceIds: string[];
    maxItems: number;
};

export type ActionResult = { success: true } | { success: false; error: string };
export type DataResult<T> = { success: true; data: T } | { success: false; error: string };

const DEFAULT_LAYOUT: LayoutSection[] = [
    { id: 'hero', label: 'Banner Principal', visible: true },
    { id: 'services', label: 'Serviços', visible: true },
    { id: 'professionals', label: 'Profissionais', visible: true },
    { id: 'location', label: 'Localização', visible: true },
    { id: 'testimonials', label: 'Depoimentos', visible: true },
    { id: 'faq', label: 'Dúvidas Frequentes', visible: true }
];

const DEFAULT_CATEGORY_ORDER = ['combo', 'day_spa', 'estetica', 'depilacao', 'tantrica'];

const DEFAULT_CAROUSEL_CONFIG: FeaturedCarouselConfig = {
    mode: 'promotions',
    serviceIds: [],
    maxItems: 3
};

export async function getLayoutConfig(): Promise<DataResult<LayoutSection[]>> {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('site_config')
            .select('sections_layout')
            .eq('id', 'landing_page')
            .single();

        if (error) {
            console.error("Supabase Error [getLayoutConfig]:", error.message);
            // Se a tabela não existir ainda ou der erro, retorna o default
            return { success: true, data: DEFAULT_LAYOUT };
        }

        if (data && data.sections_layout) {
            return { success: true, data: data.sections_layout as LayoutSection[] };
        }

        return { success: true, data: DEFAULT_LAYOUT };
    } catch (e) {
        return { success: true, data: DEFAULT_LAYOUT };
    }
}

export async function updateLayoutConfig(newLayout: LayoutSection[]): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('site_config')
            .upsert({ 
                id: 'landing_page', 
                sections_layout: newLayout,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Supabase Error [updateLayoutConfig]:", error.message);
            return { success: false, error: 'Falha ao salvar configuração de layout.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor ao salvar layout.' };
    }
}

export async function getCategoryLayoutConfig(): Promise<DataResult<string[]>> {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('site_config')
            .select('sections_layout')
            .eq('id', 'service_categories')
            .single();

        if (error) {
            return { success: true, data: DEFAULT_CATEGORY_ORDER };
        }

        if (data && data.sections_layout) {
            return { success: true, data: data.sections_layout as string[] };
        }

        return { success: true, data: DEFAULT_CATEGORY_ORDER };
    } catch (e) {
        return { success: true, data: DEFAULT_CATEGORY_ORDER };
    }
}

export async function updateCategoryLayoutConfig(newOrder: string[]): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('site_config')
            .upsert({ 
                id: 'service_categories', 
                sections_layout: newOrder,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Supabase Error [updateCategoryLayoutConfig]:", error.message);
            return { success: false, error: 'Falha ao salvar ordem das categorias.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno ao salvar ordem das categorias.' };
    }
}

export async function getFeaturedCarouselConfig(): Promise<DataResult<FeaturedCarouselConfig>> {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('site_config')
            .select('sections_layout')
            .eq('id', 'featured_carousel')
            .single();

        if (error) {
            return { success: true, data: DEFAULT_CAROUSEL_CONFIG };
        }

        if (data && data.sections_layout) {
            return { success: true, data: data.sections_layout as FeaturedCarouselConfig };
        }

        return { success: true, data: DEFAULT_CAROUSEL_CONFIG };
    } catch (e) {
        return { success: true, data: DEFAULT_CAROUSEL_CONFIG };
    }
}

export async function updateFeaturedCarouselConfig(config: FeaturedCarouselConfig): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('site_config')
            .upsert({ 
                id: 'featured_carousel', 
                sections_layout: config as any,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Supabase Error [updateFeaturedCarouselConfig]:", error.message);
            return { success: false, error: 'Falha ao salvar configuração do carrossel.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno ao salvar configuração do carrossel.' };
    }
}
