'use server';

import { z } from 'zod';
import { verifyAdmin } from '@/lib/auth';
import { mayAccessQuestionnaire } from '@/lib/anamnesis/config';
import type { AnamnesisReport, AnamnesisStatus } from '@/lib/anamnesis/report';
import { isIntakeMutationAllowed } from '@/lib/anamnesis/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

type AnamnesisSummaryRow = {
    questionnaire_version: string;
    status: AnamnesisStatus;
    submitted_at: string | null;
    deadline_at: string;
};

async function readFormSummary(db: ReturnType<typeof createAdminClient>, id: string) {
    const { data, error } = await db.from('booking_anamneses')
        .select('questionnaire_version,status,submitted_at,deadline_at').eq('booking_id', id).maybeSingle();
    if (error) throw new Error('Anamnesis summary unavailable');
    return data as AnamnesisSummaryRow | null;
}

type AdminAnamnesisSummary =
    | { kind: 'available'; status: AnamnesisStatus; hasSubmission: boolean }
    | { kind: 'missing' | 'restricted' | 'unavailable' };

export async function getAdminAnamnesisSummary(id: string): Promise<AdminAnamnesisSummary> {
    try {
        if (!z.uuid().safeParse(id).success) return { kind: 'missing' };
        const admin = await verifyAdmin();
        if (!admin.success) return { kind: 'unavailable' };
        const summary = await readFormSummary(createAdminClient(), id);
        if (!summary) return { kind: 'missing' };
        if (!mayAccessQuestionnaire(summary.questionnaire_version, admin.userId)) return { kind: 'restricted' };
        return {
            kind: 'available',
            status: summary.status === 'pending' && Date.parse(summary.deadline_at) <= Date.now() ? 'not_filled' : summary.status,
            hasSubmission: Boolean(summary.submitted_at) && summary.status !== 'purged',
        };
    } catch {
        return { kind: 'unavailable' };
    }
}

export async function readAdminAnamnesis(id: string): Promise<{ data: AnamnesisReport | null; unavailable?: boolean; restricted?: boolean }> {
    try {
        if (!z.uuid().safeParse(id).success) return { data: null };
        const admin = await verifyAdmin();
        if (!admin.success) return { data: null };
        const db = createAdminClient();
        const summary = await readFormSummary(db, id);
        if (!summary) return { data: null };
        if (!mayAccessQuestionnaire(summary.questionnaire_version, admin.userId)) return { data: null, restricted: true };
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
        const summary = await readFormSummary(db, id);
        if (!summary || !mayAccessQuestionnaire(summary.questionnaire_version, admin.userId)) return false;
        const { data, error } = await db.rpc('review_booking_anamnesis', {
            p_booking_id: id, p_actor: admin.userId,
        });
        return !error && data === true;
    } catch {
        return false;
    }
}
