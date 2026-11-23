'use server';

import { after } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { matchesFormBinding } from '@/lib/anamnesis/receipt';
import { isIntakeMutationAllowed, loadBookingQuestionnaire, requestAnamnesisReceipt } from '@/lib/anamnesis/server';
import { parseSubmission } from '@/lib/anamnesis/questionnaire';
import { rateLimit } from '@/lib/security/server';
import { processDueBookingNotifications } from './booking-notifications';

const requestSchema = z.discriminatedUnion('intent', [
    z.strictObject({ intent: z.literal('skip'), binding: z.string().length(64) }),
    z.strictObject({ intent: z.literal('complete'), binding: z.string().length(64), answers: z.unknown() }),
]);

export async function saveAnamnesis(input: unknown) {
    try {
        const parsed = requestSchema.safeParse(input);
        if (!parsed.success || !await isIntakeMutationAllowed()) return { success: false, error: 'Solicitação inválida.' };

        const receipt = await requestAnamnesisReceipt();
        if (!receipt || !matchesFormBinding(receipt.formBinding, parsed.data.binding)) {
            return { success: false, error: 'Esta ficha expirou ou pertence a outra sessão.' };
        }
        if (!await rateLimit('anamnesis', 12, 900, receipt.id)) {
            return { success: false, error: 'Muitas tentativas. Aguarde antes de tentar novamente.' };
        }

        const record = await loadBookingQuestionnaire(receipt.id);
        if (!record) return { success: false, error: 'Ficha indisponível.' };
        const result = parsed.data.intent === 'complete' ? parseSubmission(parsed.data.answers, record.questionnaire) : null;
        if (parsed.data.intent === 'complete' && !result) {
            return { success: false, error: 'Escolha pelo menos uma resposta e confirme o consentimento.' };
        }
        const { data, error } = await createAdminClient().rpc('save_booking_anamnesis', {
            p_booking_id: receipt.id,
            p_version: record.questionnaire.version,
            p_submission: result?.submission ?? null,
            p_needs_review: result?.needsReview ?? false,
        });
        if (error || !data) return { success: false, error: 'Não foi possível salvar. Tente novamente.' };

        after(async () => {
            try {
                await processDueBookingNotifications(receipt.id);
            } catch {
                console.error('[booking-notifications] Deferred processing unavailable');
            }
        });
        return { success: true };
    } catch {
        return { success: false, error: 'Serviço temporariamente indisponível.' };
    }
}
