"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';

export type DashboardLeadMetric = {
    created_at: string;
    status_kanban: string;
};

export async function getDashboardLeads(startDateISO: string, endDateISO: string): Promise<DashboardLeadMetric[]> {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
        .from('leads')
        .select('created_at, status_kanban')
        .gte('created_at', startDateISO)
        .lte('created_at', endDateISO);

    if (error) {
        console.error("Supabase Error [getDashboardLeads]:", error.message);
        throw new Error('Falha ao carregar métricas de leads para o Dashboard.');
    }
    
    return data as DashboardLeadMetric[];
}
