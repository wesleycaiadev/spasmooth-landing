"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';
import { verifyAdmin } from '@/lib/auth';

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

type ActionResult = { success: true } | { success: false; error: string };
type DataResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getLeads(): Promise<DataResult<Lead[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('leads')
            .select('*, professionals(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Error [getLeads]:", error.message);
            return { success: false, error: 'Falha ao buscar leads.' };
        }

        return { success: true, data: data as Lead[] };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function updateLeadStatus(id: string, newStatus: string): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!id || !newStatus) {
            return { success: false, error: 'ID e status são obrigatórios.' };
        }

        const supabase = createAdminClient();

        const { error } = await supabase.from('leads').update({ status_kanban: newStatus }).eq('id', id);

        if (error) {
            console.error("Supabase Error [updateLeadStatus]:", error.message);
            return { success: false, error: 'Falha ao atualizar status.' };
        }

        // Sincronizar com tabela bookings se existir
        await supabase
            .from('bookings')
            .update({ status: mapLeadStatusToBooking(newStatus) })
            .eq('id', id);

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function deleteLead(id: string): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { error } = await supabase.from('leads').delete().eq('id', id);

        if (error) {
            console.error("Supabase Error [deleteLead]:", error.message);
            return { success: false, error: 'Falha ao excluir lead.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function updateLeadNote(id: string, note: string): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { error } = await supabase.from('leads').update({ admin_notes: note }).eq('id', id);

        if (error) {
            console.error("Supabase Error [updateLeadNote]:", error.message);
            return { success: false, error: 'Falha ao gravar anotação.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function createLead(leadData: Partial<LeadInput>): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!leadData.nome || !leadData.whatsapp) {
            return { success: false, error: 'Nome e WhatsApp são obrigatórios.' };
        }

        const supabase = createAdminClient();

        const { error } = await supabase.from('leads').insert([leadData]);

        if (error) {
            console.error("Supabase Error [createLead]:", error.message);
            return { success: false, error: 'Falha ao criar lead.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function updateLeadSchedule(id: string, date: string, time: string, professionalId: string): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!id) return { success: false, error: 'ID do agendamento é obrigatório.' };

        const supabase = createAdminClient();

        // 1. Atualizar lead
        const updateData: any = {
            appointment_date: date || null,
            appointment_time: time || null,
        };
        if (professionalId) {
            updateData.professional_id = professionalId;
        }

        const { error: leadError } = await supabase.from('leads').update(updateData).eq('id', id);

        if (leadError) {
            console.error("Supabase Error [updateLeadSchedule - leads]:", leadError.message);
            return { success: false, error: 'Falha ao atualizar agendamento do lead.' };
        }

        // 2. Atualizar bookings, caso o cliente também acompanhe por essa tabela
        const bookingUpdateData: any = {
            appointment_date: date || null,
            appointment_time: time || null,
        };
        if (professionalId) {
            bookingUpdateData.professional_id = professionalId;
        }

        const { error: bookingError } = await supabase.from('bookings').update(bookingUpdateData).eq('id', id);
        
        if (bookingError) {
            // Logamos mas não falhamos a request se o booking não existir (pode ser só lead)
            console.warn("Aviso ao atualizar booking vinculado:", bookingError.message);
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function getCalendarEvents(professionalId: string): Promise<DataResult<Lead[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        let query = supabase.from('leads').select('*').neq('status_kanban', 'cancelado');

        if (professionalId !== 'all') {
            query = query.eq('professional_id', professionalId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase Error [getCalendarEvents]:", error.message);
            return { success: false, error: 'Falha ao buscar eventos do calendário.' };
        }

        return { success: true, data: data as Lead[] };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

/** Mapeia status do kanban de leads para status da tabela bookings */
function mapLeadStatusToBooking(leadStatus: string): string {
    const map: Record<string, string> = {
        'novo': 'pendente',
        'agendado': 'confirmado',
        'concluido': 'concluido',
        'cancelado': 'cancelado',
    };
    return map[leadStatus] ?? 'pendente';
}
