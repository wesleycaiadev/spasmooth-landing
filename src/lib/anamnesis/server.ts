import 'server-only';

import { cookies, headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { capabilitySecret, trustedOrigins } from '@/lib/security/server';
import { isSameOrigin } from '@/lib/security/policy';
import { readAnamnesisReceipt } from './receipt';
import { getQuestionnaire } from './questionnaire';

export async function requestAnamnesisReceipt() {
    const token = (await cookies()).get('spa_booking')?.value;
    return token ? readAnamnesisReceipt(token, capabilitySecret()) : null;
}

export async function isIntakeMutationAllowed() {
    return isSameOrigin((await headers()).get('origin'), trustedOrigins());
}

export async function loadBookingQuestionnaire(id: string) {
    const { data, error } = await createAdminClient().from('booking_anamneses')
        .select('status,questionnaire_version,service_slug,service_category')
        .eq('booking_id', id)
        .maybeSingle();
    if (error) throw new Error('Questionnaire unavailable');
    if (!data) return null;
    const questionnaire = getQuestionnaire({ category: data.service_category, slug: data.service_slug }, data.questionnaire_version);
    return questionnaire ? { status: data.status, questionnaire } : null;
}
