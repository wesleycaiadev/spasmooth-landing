"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';
import { verifyAdmin } from '@/lib/auth';

export type DashboardLeadMetric = {
    created_at: string;
    appointment_date: string | null;
    status_kanban: string;
};

type DataResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getDashboardLeads(startDateISO: string, endDateISO: string): Promise<DataResult<DashboardLeadMetric[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!startDateISO || !endDateISO) {
            return { success: false, error: 'Datas de início e fim são obrigatórias.' };
        }

        const supabase = createAdminClient();

        // Busca leads criados neste período OU que tem um agendamento neste período
        const { data, error } = await supabase
            .from('leads')
            .select('created_at, appointment_date, status_kanban')
            .or(`and(created_at.gte.${startDateISO},created_at.lte.${endDateISO}),and(appointment_date.gte.${startDateISO},appointment_date.lte.${endDateISO})`);

        if (error) {
            console.error("Supabase Error [getDashboardLeads]:", error.message);
            return { success: false, error: 'Falha ao carregar métricas.' };
        }

        return { success: true, data: data as DashboardLeadMetric[] };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}
