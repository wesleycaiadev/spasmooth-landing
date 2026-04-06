"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';

export type Professional = {
    id: string;
    name: string;
    specialties: string[];
    photo_url: string;
    gallery_urls: string[] | null;
    location: string;
    location_start_date: string | null;
    location_end_date: string | null;
    active: boolean;
    created_at: string;
};

export type ProfessionalInput = Omit<Professional, 'id' | 'active' | 'created_at'>;

export async function getProfessionals(): Promise<Professional[]> {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase Error [getProfessionals]:", error.message);
        throw new Error('Falha ao buscar profissionais.');
    }
    
    return data as Professional[];
}

export async function getActiveProfessionals(): Promise<Pick<Professional, 'id' | 'name'>[]> {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
        .from('professionals')
        .select('id, name')
        .eq('active', true);

    if (error) {
        console.error("Supabase Error [getActiveProfessionals]:", error.message);
        throw new Error('Falha ao buscar profissionais ativos.');
    }
    
    return data as Pick<Professional, 'id' | 'name'>[];
}

export async function createProfessional(proData: ProfessionalInput): Promise<void> {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('professionals').insert([proData]);
    
    if (error) {
        console.error("Supabase Error [createProfessional]:", error.message);
        throw new Error('Falha ao cadastrar profissional.');
    }
}

export async function updateProfessional(id: string, proData: Partial<ProfessionalInput>): Promise<void> {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('professionals').update(proData).eq('id', id);
    
    if (error) {
        console.error("Supabase Error [updateProfessional]:", error.message);
        throw new Error('Falha ao atualizar profissional.');
    }
}

export async function toggleProfessionalActive(id: string, currentStatus: boolean): Promise<void> {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('professionals').update({ active: !currentStatus }).eq('id', id);
    
    if (error) {
        console.error("Supabase Error [toggleProfessionalActive]:", error.message);
        throw new Error('Falha ao alterar o status do profissional.');
    }
}

export async function deleteProfessional(id: string): Promise<void> {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('professionals').delete().eq('id', id);
    
    if (error) {
        console.error("Supabase Error [deleteProfessional]:", error.message);
        throw new Error('Falha ao remover o profissional.');
    }
}
