"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';
import { verifyAdmin } from '@/lib/auth';
import type { Lead, LeadInput, ActionResult, DataResult } from '@/types';
import { LEAD_TO_BOOKING_STATUS } from '@/lib/constants';

export async function getLeads(): Promise<DataResult<Lead[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error || "Acesso negado." };

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
        if (!adminCheck.success) return { success: false, error: adminCheck.error || "Acesso negado." };

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
        const bookingStatus = LEAD_TO_BOOKING_STATUS[newStatus as keyof typeof LEAD_TO_BOOKING_STATUS] || 'pendente';
        await supabase
            .from('bookings')
            .update({ status: bookingStatus })
            .eq('id', id);

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function deleteLead(id: string): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error || "Acesso negado." };

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
        if (!adminCheck.success) return { success: false, error: adminCheck.error || "Acesso negado." };

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
        if (!adminCheck.success) return { success: false, error: adminCheck.error || "Acesso negado." };

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

export async function getCalendarEvents(professionalId: string): Promise<DataResult<Lead[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error || "Acesso negado." };

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

