"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';
import { verifyAdmin } from '@/lib/auth';

export type Professional = {
    id: string;
    name: string;
    specialties: string[];
    photo_url: string;
    gallery_urls: string[];
    location: string;
    location_start_date: string | null;
    location_end_date: string | null;
    active: boolean;
    created_at: string;
};

export type ProfessionalInput = Omit<Professional, 'id' | 'active' | 'created_at'>;

type ActionResult = { success: true } | { success: false; error: string };
type DataResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getProfessionals(): Promise<DataResult<Professional[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('professionals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Error [getProfessionals]:", error.message);
            return { success: false, error: 'Falha ao buscar profissionais.' };
        }

        return { success: true, data: data as Professional[] };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function getActiveProfessionals(): Promise<DataResult<Pick<Professional, 'id' | 'name'>[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('professionals')
            .select('id, name')
            .eq('active', true);

        if (error) {
            console.error("Supabase Error [getActiveProfessionals]:", error.message);
            return { success: false, error: 'Falha ao buscar profissionais ativos.' };
        }

        return { success: true, data: data as Pick<Professional, 'id' | 'name'>[] };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function createProfessional(proData: ProfessionalInput): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!proData.name?.trim()) {
            return { success: false, error: 'Nome é obrigatório.' };
        }

        // Auto-sync: photo_url = primeira foto da galeria
        const dataToInsert = {
            ...proData,
            photo_url: proData.gallery_urls?.[0] || proData.photo_url || null,
        };

        const supabase = createAdminClient();

        const { error } = await supabase.from('professionals').insert([dataToInsert]);

        if (error) {
            console.error("Supabase Error [createProfessional]:", error.message);
            return { success: false, error: 'Falha ao cadastrar profissional.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function updateProfessional(id: string, proData: Partial<ProfessionalInput>): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        // Auto-sync: photo_url = primeira foto da galeria
        const dataToUpdate = { ...proData };
        if (dataToUpdate.gallery_urls && dataToUpdate.gallery_urls.length > 0) {
            dataToUpdate.photo_url = dataToUpdate.gallery_urls[0];
        }

        const supabase = createAdminClient();

        const { error } = await supabase.from('professionals').update(dataToUpdate).eq('id', id);

        if (error) {
            console.error("Supabase Error [updateProfessional]:", error.message);
            return { success: false, error: 'Falha ao atualizar profissional.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function toggleProfessionalActive(id: string, currentStatus: boolean): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { error } = await supabase.from('professionals').update({ active: !currentStatus }).eq('id', id);

        if (error) {
            console.error("Supabase Error [toggleProfessionalActive]:", error.message);
            return { success: false, error: 'Falha ao alterar status.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function deleteProfessional(id: string): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { error } = await supabase.from('professionals').delete().eq('id', id);

        if (error) {
            console.error("Supabase Error [deleteProfessional]:", error.message);
            return { success: false, error: 'Falha ao remover profissional.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}
