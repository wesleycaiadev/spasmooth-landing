'use server';

import { z } from 'zod';
import { verifyAdmin } from '@/lib/auth';
import { mayAccessQuestionnaire } from '@/lib/anamnesis/config';
import { isIntakeMutationAllowed } from '@/lib/anamnesis/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import type { IntakeSubmission } from '@/lib/anamnesis/questionnaire';

type AnamnesisReport = {
    questionnaire_version: string;
    service_slug: string | null;
    service_category: string;
    status: 'pending' | 'not_filled' | 'completed' | 'needs_review' | 'reviewed' | 'purged';
    submission: IntakeSubmission | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    reviewed_by: string | null;
    purged_at: string | null;
    client_name: string;
    starts_at: string;
    unit: string;
    service_name: string | null;
    professional_name: string | null;
    notification_status: 'queued' | 'sending' | 'accepted' | 'unknown' | 'failed' | null;
};

async function readFormVersion(db: ReturnType<typeof createAdminClient>, id: string) {
    const { data, error } = await db.from('booking_anamneses').select('questionnaire_version').eq('booking_id', id).maybeSingle();
    if (error) throw new Error('Anamnesis version unavailable');
    return data?.questionnaire_version as string | undefined;
}

export async function readAdminAnamnesis(id: string): Promise<{ data: AnamnesisReport | null; unavailable?: boolean; restricted?: boolean }> {
    try {
        if (!z.uuid().safeParse(id).success) return { data: null };
        const admin = await verifyAdmin();
        if (!admin.success) return { data: null };
        const db = createAdminClient();
        const version = await readFormVersion(db, id);
        if (!version) return { data: null };
        if (!mayAccessQuestionnaire(version, admin.userId)) return { data: null, restricted: true };
        const { data, error } = await db.rpc('read_booking_anamnesis', {
            p_booking_id: id, p_actor: admin.userId,
        });
        return error ? { data: null, unavailable: true } : { data };
    } catch {
        return { data: null, unavailable: true };
    }
}

export async function reviewAdminAnamnesis(id: string) {
    try {
        if (!z.uuid().safeParse(id).success || !await isIntakeMutationAllowed()) return false;
        const admin = await verifyAdmin();
        if (!admin.success) return false;
        const db = createAdminClient();
        const version = await readFormVersion(db, id);
        if (!version || !mayAccessQuestionnaire(version, admin.userId)) return false;
        const { data, error } = await db.rpc('review_booking_anamnesis', {
            p_booking_id: id, p_actor: admin.userId,
        });
        return !error && data === true;
    } catch {
        return false;
    }
}
