"use server";
import { uuid, date as dateSchema, time as timeSchema, leadSchema, leadStatus } from '@/lib/validations/admin';

import { createAdminClient } from '@/lib/supabaseAdmin';
import { z } from 'zod';
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
            .select('id,nome,whatsapp,email,service_name,professional_id,appointment_date,appointment_time,mensagem_interesse,status_kanban,admin_notes,created_at,professionals(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Error [getLeads]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao buscar leads.' };
        }

        return { success: true, data: (data ?? []).map(row => ({ ...row, professionals: Array.isArray(row.professionals) ? row.professionals[0] ?? null : row.professionals })) };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function updateLeadStatus(id: string, newStatus: string): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success || !leadStatus.safeParse(newStatus).success) return { success: false, error: 'Dados inválidos.' };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!id || !newStatus) {
            return { success: false, error: 'ID e status são obrigatórios.' };
        }

        const supabase = createAdminClient();

        const { error } = await supabase.rpc('admin_set_lead_status', { p_id: id, p_status: newStatus });
        if (error) return { success: false, error: 'Falha ao atualizar status. Verifique conflitos de horário.' };

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function deleteLead(id: string): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success) return { success: false, error: 'Dados inválidos.' };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { error } = await supabase.from('leads').delete().eq('id', id);

        if (error) {
            console.error("Supabase Error [deleteLead]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao excluir lead.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function updateLeadNote(id: string, note: string): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success || !z.string().max(2000).safeParse(note).success) return { success: false, error: 'Dados inválidos.' };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { error } = await supabase.from('leads').update({ admin_notes: note }).eq('id', id);

        if (error) {
            console.error("Supabase Error [updateLeadNote]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao gravar anotação.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function createLead(leadData: Partial<LeadInput>): Promise<ActionResult> {
    try {
        const parsed = leadSchema.safeParse(leadData); if (!parsed.success) return { success: false, error: 'Dados inválidos.' };
        leadData = parsed.data;
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!leadData.nome || !leadData.whatsapp) {
            return { success: false, error: 'Nome e WhatsApp são obrigatórios.' };
        }

        const supabase = createAdminClient();

        const { error } = await supabase.from('leads').insert([leadData]);

        if (error) {
            console.error("Supabase Error [createLead]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao criar lead.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function updateLeadSchedule(id: string, date: string, time: string, professionalId: string): Promise<ActionResult> {
    try {
        if (!uuid.safeParse(id).success || (date && !dateSchema.safeParse(date).success) || (time && !timeSchema.safeParse(time).success) || (professionalId && !uuid.safeParse(professionalId).success)) return { success: false, error: 'Dados inválidos.' };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!id) return { success: false, error: 'ID do agendamento é obrigatório.' };

        const supabase = createAdminClient();

        const { error } = await supabase.rpc('admin_reschedule_lead', { p_id: id, p_date: date || null, p_time: time || null, p_professional_id: professionalId || null });
        if (error) return { success: false, error: 'Horário inválido, indisponível ou falha ao salvar.' };

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function getCalendarEvents(professionalId: string): Promise<DataResult<Lead[]>> {
    try {
        if (professionalId !== 'all' && !uuid.safeParse(professionalId).success) return { success: false, error: 'Dados inválidos.' };
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        let query = supabase.from('leads').select('id,nome,whatsapp,email,service_name,professional_id,appointment_date,appointment_time,mensagem_interesse,status_kanban,admin_notes,created_at').neq('status_kanban', 'cancelado');

        if (professionalId !== 'all') {
            query = query.eq('professional_id', professionalId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase Error [getCalendarEvents]:", "DATABASE_OPERATION_FAILED");
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

export async function getRecentLeadNotifications(since: string) {
    const admin = await verifyAdmin();
    if (!admin.success || !z.iso.datetime().safeParse(since).success) return { success: false as const, data: [] };
    const { data, error } = await createAdminClient().from('leads').select('id,nome,service_name').gt('created_at', since).order('created_at').limit(30);
    return { success: !error, data: data || [] };
}
