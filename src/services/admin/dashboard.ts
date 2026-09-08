"use server";

import { z } from 'zod';
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

        const dateInput = z.union([z.iso.date(), z.iso.datetime({ offset: true })]);
        if (!dateInput.safeParse(startDateISO).success || !dateInput.safeParse(endDateISO).success || new Date(startDateISO) > new Date(endDateISO)) {
            return { success: false, error: 'Datas de início e fim são obrigatórias.' };
        }

        const supabase = createAdminClient();

        // Each filter is a parameter; never interpolate user input into PostgREST grammar.
        const fields = 'id, created_at, appointment_date, status_kanban';
        const [created, scheduled] = await Promise.all([
            supabase.from('leads').select(fields).gte('created_at', startDateISO).lte('created_at', endDateISO).limit(1000),
            supabase.from('leads').select(fields).gte('appointment_date', startDateISO.slice(0, 10)).lte('appointment_date', endDateISO.slice(0, 10)).limit(1000),
        ]);
        const error = created.error || scheduled.error;
        const data = Array.from(new Map([...(created.data || []), ...(scheduled.data || [])].map(row => [row.id, row])).values());

        if (error) {
            console.error("Supabase Error [getDashboardLeads]:", "DATABASE_OPERATION_FAILED");
            return { success: false, error: 'Falha ao carregar métricas.' };
        }

        return { success: true, data: data as DashboardLeadMetric[] };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}
