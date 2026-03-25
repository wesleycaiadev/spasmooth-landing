"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';

export type Lead = {
    id: string;
    nome: string;
    whatsapp: string;
    email: string | null;
    service_name: string | null;
    professional_id: string | null;
    appointment_date: string | null;
    appointment_time: string | null;
    mensagem_interesse: string | null;
    status_kanban: string;
    admin_notes: string | null;
    created_at: string;
    professionals?: { name: string } | null;
};

export type LeadInput = Omit<Lead, 'id' | 'created_at' | 'professionals'>;

export async function getLeads(): Promise<Lead[]> {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
        .from('leads')
        .select('*, professionals(name)')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error('Falha ao buscar leads ativos.');
    }
    
    return data as Lead[];
}

export async function updateLeadStatus(id: string, newStatus: string): Promise<void> {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('leads').update({ status_kanban: newStatus }).eq('id', id);
    
    if (error) {
        throw new Error('Falha ao atualizar o status do agendamento.');
    }
}

export async function deleteLead(id: string): Promise<void> {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('leads').delete().eq('id', id);
    
    if (error) {
        throw new Error('Falha vital ao excluir o lead. Permissões podem ter sido negadas.');
    }
}

export async function updateLeadNote(id: string, note: string): Promise<void> {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('leads').update({ admin_notes: note }).eq('id', id);
    
    if (error) {
        throw new Error('Falha ao gravar anotação de negócios administrativa.');
    }
}

export async function createLead(leadData: Partial<LeadInput>): Promise<void> {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('leads').insert([leadData]);
    
    if (error) {
        throw new Error('Conflito de schema remoto ao tentar injetar novo agendamento.');
    }
}

export async function getCalendarEvents(professionalId: string): Promise<Lead[]> {
    const supabase = createAdminClient();
    
    let query = supabase.from('leads').select('*').neq('status_kanban', 'cancelado');
    
    if (professionalId !== 'all') {
        query = query.eq('professional_id', professionalId);
    }
    
    const { data, error } = await query;
    if (error) throw new Error('Falha corporativa ao buscar eventos para calendário.');
    
    return data as Lead[];
}
