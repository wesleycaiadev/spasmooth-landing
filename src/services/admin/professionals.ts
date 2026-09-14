"use server";
import { uuid, professionalSchema } from '@/lib/validations/admin';
import { revalidatePath, updateTag } from 'next/cache';

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

function validationErrorMessage(error: { issues: Array<{ message: string }> }) {
    return error.issues[0]?.message || 'Dados inválidos.';
}

function revalidatePublicProfessionals() {
    updateTag('public-professionals');
    revalidatePath('/');
}

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
            console.error("Supabase Error [getProfessionals]:", "DATABASE_OPERATION_FAILED");
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
            console.error("Supabase Error [getActiveProfessionals]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao buscar profissionais ativos.' };
        }

        return { success: true, data: data as Pick<Professional, 'id' | 'name'>[] };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function createProfessional(proData: ProfessionalInput): Promise<ActionResult> {
    try {
        const parsed = professionalSchema.safeParse(proData); if (!parsed.success) { console.error('Create error:', parsed.error); return { success: false, error: validationErrorMessage(parsed.error) }; }
        proData = { ...parsed.data, photo_url: parsed.data.photo_url ?? '', location_start_date: parsed.data.location_start_date ?? null, location_end_date: parsed.data.location_end_date ?? null };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!proData.name?.trim()) {
            return { success: false, error: 'Nome é obrigatório.' };
        }

        const dataToInsert = {
            ...proData,
            photo_url: proData.gallery_urls?.[0] || proData.photo_url || null,
        };

        const supabase = createAdminClient();

        const { error } = await supabase.from('professionals').insert([dataToInsert]);

        if (error) {
            console.error("Supabase Error [createProfessional]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao cadastrar profissional.' };
        }

        revalidatePublicProfessionals();
        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function updateProfessional(id: string, proData: Partial<ProfessionalInput>): Promise<ActionResult> {
    try {
        const parsed = professionalSchema.partial().safeParse(proData); if (!uuid.safeParse(id).success || !parsed.success) { console.error('Update error:', !parsed.success ? parsed.error : 'uuid'); return { success: false, error: !parsed.success ? validationErrorMessage(parsed.error) : 'Identificador inválido.' }; }
        proData = parsed.data;
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const dataToUpdate = { ...proData };
        if (dataToUpdate.gallery_urls && dataToUpdate.gallery_urls.length > 0) {
            dataToUpdate.photo_url = dataToUpdate.gallery_urls[0];
        }

        const supabase = createAdminClient();

        const { error } = await supabase.from('professionals').update(dataToUpdate).eq('id', id);

        if (error) {
            console.error("Supabase Error [updateProfessional]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao atualizar profissional.' };
        }

        revalidatePublicProfessionals();
        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function toggleProfessionalActive(id: string, currentStatus: boolean): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success || typeof currentStatus !== 'boolean') return { success: false, error: 'Dados inválidos.' };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { error } = await supabase.from('professionals').update({ active: !currentStatus }).eq('id', id);

        if (error) {
            console.error("Supabase Error [toggleProfessionalActive]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao alterar status.' };
        }

        revalidatePublicProfessionals();
        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function deleteProfessional(id: string): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success) return { success: false, error: 'Dados inválidos.' };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { error } = await supabase.from('professionals').delete().eq('id', id);

        if (error) {
            console.error("Supabase Error [deleteProfessional]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao remover profissional.' };
        }

        revalidatePublicProfessionals();
        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}
