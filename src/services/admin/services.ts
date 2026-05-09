"use server";

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { createServiceSchema, updateServiceSchema } from '@/lib/validations/service';
import type { CreateServiceInput, UpdateServiceInput } from '@/lib/validations/service';

export type Service = {
    id: string;
    name: string;
    category: 'massage' | 'waxing';
    price: number;
    duration_minutes: number;
    description: string;
    active: boolean;
    created_at: string;
};

type ActionResult = { success: true } | { success: false; error: string };

export async function getServices(): Promise<Service[]> {
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
        return { success: true };
    } catch (err) {
        console.error("Exception [createService]:", err);
        return { success: false, error: 'Erro inesperado ao criar serviço.' };
    }
}

export async function updateService(id: string, input: UpdateServiceInput): Promise<ActionResult> {
    try {
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
        return { success: true };
    } catch (err) {
        console.error("Exception [updateService]:", err);
        return { success: false, error: 'Erro inesperado ao atualizar serviço.' };
    }
}

export async function updateServicePrice(id: string, price: number): Promise<ActionResult> {
    try {
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
        return { success: true };
    } catch (err) {
        console.error("Exception [updateServicePrice]:", err);
        return { success: false, error: 'Erro inesperado ao atualizar preço.' };
    }
}

export async function toggleServiceActive(id: string, currentStatus: boolean): Promise<ActionResult> {
    try {
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
        return { success: true };
    } catch (err) {
        console.error("Exception [toggleServiceActive]:", err);
        return { success: false, error: 'Erro inesperado ao alterar status.' };
    }
}

export async function deleteService(id: string): Promise<ActionResult> {
    try {
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
        return { success: true };
    } catch (err) {
        console.error("Exception [deleteService]:", err);
        return { success: false, error: 'Erro inesperado ao remover serviço.' };
    }
}
