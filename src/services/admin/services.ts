"use server";

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

export type ServiceInput = Omit<Service, 'id' | 'active' | 'created_at'>;

export async function getServices(): Promise<Service[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error("Supabase Error [getServices]:", error.message);
        throw new Error('Falha ao buscar serviços.');
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
        throw new Error('Falha ao buscar serviços ativos.');
    }

    return data as Service[];
}

export async function createService(input: CreateServiceInput): Promise<void> {
    const parsed = createServiceSchema.safeParse(input);

    if (!parsed.success) {
        throw new Error(parsed.error.issues.map(i => i.message).join(', '));
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from('services').insert([parsed.data]);

    if (error) {
        console.error("Supabase Error [createService]:", error.message);
        throw new Error('Falha ao criar serviço.');
    }
}

export async function updateService(id: string, input: UpdateServiceInput): Promise<void> {
    const parsed = updateServiceSchema.safeParse(input);

    if (!parsed.success) {
        throw new Error(parsed.error.issues.map(i => i.message).join(', '));
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('services')
        .update(parsed.data)
        .eq('id', id);

    if (error) {
        console.error("Supabase Error [updateService]:", error.message);
        throw new Error('Falha ao atualizar serviço.');
    }
}

export async function updateServicePrice(id: string, price: number): Promise<void> {
    if (typeof price !== 'number' || price < 0) {
        throw new Error('Preço inválido.');
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('services')
        .update({ price })
        .eq('id', id);

    if (error) {
        console.error("Supabase Error [updateServicePrice]:", error.message);
        throw new Error('Falha ao atualizar preço do serviço.');
    }
}

export async function toggleServiceActive(id: string, currentStatus: boolean): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('services')
        .update({ active: !currentStatus })
        .eq('id', id);

    if (error) {
        console.error("Supabase Error [toggleServiceActive]:", error.message);
        throw new Error('Falha ao alterar o status do serviço.');
    }
}

export async function deleteService(id: string): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Supabase Error [deleteService]:", error.message);
        throw new Error('Falha ao remover o serviço.');
    }
}
