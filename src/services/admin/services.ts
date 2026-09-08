"use server";
import { uuid, category as categorySchema } from '@/lib/validations/admin';

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
        console.error("Supabase Error [getServices]:", "DATABASE_OPERATION_FAILED");
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
        console.error("Supabase Error [getActiveServices]:", "DATABASE_OPERATION_FAILED");
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
            console.error("Supabase Error [createService]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao criar serviço.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [createService]:", "OPERATION_FAILED");
        return { success: false, error: 'Erro inesperado ao criar serviço.' };
    }
}

export async function updateService(id: string, input: UpdateServiceInput): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success) return { success: false, error: 'Dados inválidos.' };
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
            console.error("Supabase Error [updateService]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao atualizar serviço.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [updateService]:", "OPERATION_FAILED");
        return { success: false, error: 'Erro inesperado ao atualizar serviço.' };
    }
}

export async function updateServicePrice(id: string, price: number): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success || !Number.isFinite(price) || price < 0 || price > 100000) return { success: false, error: 'Dados inválidos.' };
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
            console.error("Supabase Error [updateServicePrice]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao atualizar preço.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [updateServicePrice]:", "OPERATION_FAILED");
        return { success: false, error: 'Erro inesperado ao atualizar preço.' };
    }
}

export async function toggleServiceActive(id: string, currentStatus: boolean): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success || typeof currentStatus !== 'boolean') return { success: false, error: 'Dados inválidos.' };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('services')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error("Supabase Error [toggleServiceActive]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao alterar status.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [toggleServiceActive]:", "OPERATION_FAILED");
        return { success: false, error: 'Erro inesperado ao alterar status.' };
    }
}

export async function deleteService(id: string): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success) return { success: false, error: 'Dados inválidos.' };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Supabase Error [deleteService]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao remover serviço.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [deleteService]:", "OPERATION_FAILED");
        return { success: false, error: 'Erro inesperado ao remover serviço.' };
    }
}

export async function applyDiscountToCategory(category: string, percent: number): Promise<ActionResult> {
    try {
        if (!categorySchema.safeParse(category).success) return { success: false, error: 'Dados inválidos.' };
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
            console.error("Supabase Error [applyDiscountToCategory]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao salvar descontos.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [applyDiscountToCategory]:", "OPERATION_FAILED");
        return { success: false, error: 'Erro inesperado ao aplicar desconto.' };
    }
}

export async function clearCategoryDiscount(category: string): Promise<ActionResult> {
    try {
        if (!categorySchema.safeParse(category).success) return { success: false, error: 'Dados inválidos.' };
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
            console.error("Supabase Error [clearCategoryDiscount]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao salvar descontos.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [clearCategoryDiscount]:", "OPERATION_FAILED");
        return { success: false, error: 'Erro inesperado ao remover descontos.' };
    }
}

export async function updateServiceDiscount(id: string, percent: number, active: boolean): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success || !Number.isFinite(percent) || percent < 0 || percent > 100 || typeof active !== 'boolean') return { success: false, error: 'Dados inválidos.' };
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
            console.error("Supabase Error [updateServiceDiscount]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao salvar descontos.' };
        }

        revalidatePath('/');
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err) {
        console.error("Exception [updateServiceDiscount]:", "OPERATION_FAILED");
        return { success: false, error: 'Erro inesperado ao atualizar desconto.' };
    }
}


