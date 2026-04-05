"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';

export type DashboardLeadMetric = {
    created_at: string;
    appointment_date: string | null;
    status_kanban: string;
};

export async function getDashboardLeads(startDateISO: string, endDateISO: string): Promise<DashboardLeadMetric[]> {
    const supabase = createAdminClient();
    
    // Agora buscamos quem criou o lead OU quem tem agendamento para este período
    // Busca leads criados neste mês OU que tem um agendamento neste mês
    const { data, error } = await supabase
        .from('leads')
        .select('created_at, appointment_date, status_kanban')
        .or(`and(created_at.gte.${startDateISO},created_at.lte.${endDateISO}),and(appointment_date.gte.${startDateISO},appointment_date.lte.${endDateISO})`);

    if (error) {
        console.error("Supabase Error [getDashboardLeads]:", error.message);
        throw new Error('Falha ao carregar métricas de leads para o Dashboard.');
    }
    
    return data as DashboardLeadMetric[];
}
