import { createHash, timingSafeEqual } from 'node:crypto';
import { retentionPolicy } from '@/lib/anamnesis/config';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { callMeBotConfigured, notificationsEnabled, processDueBookingNotifications } from '@/services/booking-notifications';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
    const secret = process.env.BOOKING_ANAMNESIS_WORKER_SECRET;
    const authorization = request.headers.get('authorization');
    const digest = (value: string) => createHash('sha256').update(value).digest();
    if (!secret || secret.length < 32 || !authorization || !timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`))) {
        return new Response(null, { status: 404 });
    }

    try {
        const { error } = await createAdminClient().rpc('maintain_booking_anamneses', retentionPolicy());
        if (error) throw new Error('Maintenance unavailable');
        if (notificationsEnabled() && !callMeBotConfigured()) throw new Error('Provider configuration missing');
        return Response.json({ processed: await processDueBookingNotifications() });
    } catch {
        console.error('[booking-notifications] Worker unavailable');
        return Response.json({ error: 'Indisponível.' }, { status: 503 });
    }
}
