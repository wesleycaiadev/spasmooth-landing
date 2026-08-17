"use server";

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { verifyAdmin } from '@/lib/auth';
import { createServiceSchema, updateServiceSchema } from '@/lib/validations/service';
import type { CreateServiceInput, UpdateServiceInput } from '@/lib/validations/service';

export type Service = {
    id: string;
    name: string;
    category: 'combo' | 'day_spa' | 'estetica' | 'tantrica' | 'depilacao';
    price: number;
    duration_minutes: number;
    description: string;
    active: boolean;
    created_at: string;
};

type ActionResult = { success: true } | { success: false; error: string };

export async function getServices(): Promise<Service[]> {
    const adminCheck = await verifyAdmin();
    if (!adminCheck.success) return [];

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error("Supabase Error [getServices]:", error.message);
        return [];
    }

    return data as Service[];
}

export async function getActiveServices(): Promise<Service[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error("Supabase Error [getActiveServices]:", error.message);
        return [];
    }

    return data as Service[];
}

export async function createService(input: CreateServiceInput): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const parsed = createServiceSchema.safeParse(input);

        if (!parsed.success) {
            return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
        }

        const supabase = createAdminClient();
        const { error } = await supabase.from('services').insert([parsed.data]);

        if (error) {
            console.error("Supabase Error [createService]:", error.message);
            return { success: false, error: 'Falha ao criar serviço.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [createService]:", err);
        return { success: false, error: 'Erro inesperado ao criar serviço.' };
    }
}

export async function updateService(id: string, input: UpdateServiceInput): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const parsed = updateServiceSchema.safeParse(input);

        if (!parsed.success) {
            return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('services')
            .update(parsed.data)
            .eq('id', id);

        if (error) {
            console.error("Supabase Error [updateService]:", error.message);
            return { success: false, error: 'Falha ao atualizar serviço.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [updateService]:", err);
        return { success: false, error: 'Erro inesperado ao atualizar serviço.' };
    }
}

export async function updateServicePrice(id: string, price: number): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (typeof price !== 'number' || price < 0 || isNaN(price)) {
            return { success: false, error: 'Preço inválido.' };
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('services')
            .update({ price })
            .eq('id', id);

        if (error) {
            console.error("Supabase Error [updateServicePrice]:", error.message);
            return { success: false, error: 'Falha ao atualizar preço.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [updateServicePrice]:", err);
        return { success: false, error: 'Erro inesperado ao atualizar preço.' };
    }
}

export async function toggleServiceActive(id: string, currentStatus: boolean): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('services')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error("Supabase Error [toggleServiceActive]:", error.message);
            return { success: false, error: 'Falha ao alterar status.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [toggleServiceActive]:", err);
        return { success: false, error: 'Erro inesperado ao alterar status.' };
    }
}

export async function deleteService(id: string): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Supabase Error [deleteService]:", error.message);
            return { success: false, error: 'Falha ao remover serviço.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [deleteService]:", err);
        return { success: false, error: 'Erro inesperado ao remover serviço.' };
    }
}

export async function applyDiscountToCategory(category: string, percent: number): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error || "Acesso negado." };

        if (typeof percent !== 'number' || percent < 0 || percent > 100 || isNaN(percent)) {
            return { success: false, error: 'Percentual de desconto inválido (deve ser entre 0% e 100%).' };
        }

        const supabase = createAdminClient();
        const discount_active = percent > 0;

        let query = supabase
            .from('services')
            .update({
                discount_percent: percent,
                discount_active,
            });

        if (category !== 'all' && category !== 'tudo') {
            query = query.eq('category', category);
        } else {
            query = query.not('id', 'is', null);
        }

        const { error } = await query;

        if (error) {
            console.error("Supabase Error [applyDiscountToCategory]:", error.message);
            const userMsg = error.message.includes('column') || error.message.includes('discount')
                ? 'Colunas de desconto não encontradas. Execute o SQL "sql/004_add_discounts.sql" no Supabase.'
                : 'Falha ao aplicar desconto.';
            return { success: false, error: userMsg };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [applyDiscountToCategory]:", err);
        return { success: false, error: 'Erro inesperado ao aplicar desconto.' };
    }
}

export async function clearCategoryDiscount(category: string): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error || "Acesso negado." };

        const supabase = createAdminClient();
        let query = supabase
            .from('services')
            .update({
                discount_percent: 0,
                discount_active: false,
            });

        if (category !== 'all' && category !== 'tudo') {
            query = query.eq('category', category);
        } else {
            query = query.not('id', 'is', null);
        }

        const { error } = await query;

        if (error) {
            console.error("Supabase Error [clearCategoryDiscount]:", error.message);
            const userMsg = error.message.includes('column') || error.message.includes('discount')
                ? 'Colunas de desconto não encontradas. Execute o SQL "sql/004_add_discounts.sql" no Supabase.'
                : 'Falha ao remover descontos.';
            return { success: false, error: userMsg };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [clearCategoryDiscount]:", err);
        return { success: false, error: 'Erro inesperado ao remover descontos.' };
    }
}

export async function updateServiceDiscount(id: string, percent: number, active: boolean): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error || "Acesso negado." };

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('services')
            .update({
                discount_percent: percent,
                discount_active: active,
            })
            .eq('id', id);

        if (error) {
            console.error("Supabase Error [updateServiceDiscount]:", error.message);
            const userMsg = error.message.includes('column') || error.message.includes('discount')
                ? 'Colunas de desconto não encontradas. Execute o SQL "sql/004_add_discounts.sql" no Supabase.'
                : 'Falha ao atualizar desconto.';
            return { success: false, error: userMsg };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [updateServiceDiscount]:", err);
        return { success: false, error: 'Erro inesperado ao atualizar desconto.' };
    }
}


