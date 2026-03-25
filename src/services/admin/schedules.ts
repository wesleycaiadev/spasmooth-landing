"use server";

import { createAdminClient } from '@/lib/supabaseAdmin';

export type ProfessionalSchedule = {
    id: string;
    professional_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_day_off: boolean;
};

export type ScheduleInput = Omit<ProfessionalSchedule, 'id'>;

export async function getScheduleForProfessional(proId: string): Promise<ProfessionalSchedule[]> {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
        .from('professional_schedule')
        .select('*')
        .eq('professional_id', proId);

    if (error) {
        console.error("Supabase Error [getScheduleForProfessional]:", error.message);
        throw new Error('Falha ao buscar agenda do profissional.');
    }
    
    return data as ProfessionalSchedule[];
}

export async function upsertProfessionalSchedule(proId: string, scheduleData: ScheduleInput[]): Promise<void> {
    const supabase = createAdminClient();
    
    const { error: deleteError } = await supabase
        .from('professional_schedule')
        .delete()
        .eq('professional_id', proId);
        
    if (deleteError) {
        throw new Error('Falha ao limpar agenda existente antes de atualizar.');
    }

    const { error: insertError } = await supabase
        .from('professional_schedule')
        .insert(scheduleData);
        
    if (insertError) {
        console.error("Supabase Error [upsertProfessionalSchedule]:", insertError.message);
        throw new Error('Falha ao inserir redefinição de agenda.');
    }
}
