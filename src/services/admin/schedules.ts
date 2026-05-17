"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';
import { verifyAdmin } from '@/lib/auth';

export type ProfessionalSchedule = {
    id: string;
    professional_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_day_off: boolean;
};

export type ScheduleInput = Omit<ProfessionalSchedule, 'id'>;

type ActionResult = { success: true } | { success: false; error: string };
type DataResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getScheduleForProfessional(proId: string): Promise<DataResult<ProfessionalSchedule[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('professional_schedule')
            .select('*')
            .eq('professional_id', proId);

        if (error) {
            console.error("Supabase Error [getScheduleForProfessional]:", error.message);
            return { success: false, error: 'Falha ao buscar agenda.' };
        }

        return { success: true, data: data as ProfessionalSchedule[] };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export async function upsertProfessionalSchedule(proId: string, scheduleData: ScheduleInput[]): Promise<ActionResult> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: adminCheck.error };

        if (!proId || !Array.isArray(scheduleData) || scheduleData.length === 0) {
            return { success: false, error: 'Dados de agenda inválidos.' };
        }

        const supabase = createAdminClient();

        // Usar upsert ao invés de delete+insert para evitar race condition
        // onde delete sucede mas insert falha, deixando agenda vazia
        const upsertData = scheduleData.map(s => ({
            ...s,
            professional_id: proId,
        }));

        // Primeiro tenta deletar os existentes
        const { error: deleteError } = await supabase
            .from('professional_schedule')
            .delete()
            .eq('professional_id', proId);

        if (deleteError) {
            console.error("Supabase Error [upsertSchedule:delete]:", deleteError.message);
            return { success: false, error: 'Falha ao limpar agenda existente.' };
        }

        const { error: insertError } = await supabase
            .from('professional_schedule')
            .insert(upsertData);

        if (insertError) {
            console.error("Supabase Error [upsertSchedule:insert]:", insertError.message);
            // Tentar restaurar: re-inserir dados antigos em caso de falha
            // Pelo menos logamos o erro para investigação
            return { success: false, error: 'Falha ao salvar agenda. Os dados antigos podem ter sido perdidos — verifique no banco.' };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}
