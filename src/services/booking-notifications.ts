import 'server-only';

import { get } from 'node:https';
import { bookingActionUrl, createBookingActionToken } from '@/lib/booking-actions';
import { encodeAnamnesisCode } from '@/lib/anamnesis/short-link';
import { bookingNotificationMessage, getNotificationResult, type BookingNotification } from '@/lib/booking-notification-message';
import { createAdminClient } from '@/lib/supabaseAdmin';

type NotificationBooking = BookingNotification & { id: string; startsAt: string };
type Claim = NotificationBooking & { claimId: string };

export function callMeBotConfigured() {
    return Boolean(process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY);
}

export function notificationsEnabled() {
    return process.env.BOOKING_NOTIFICATIONS_ENABLED === 'true';
}

function buildMessage(booking: NotificationBooking) {
    const expiresAt = Math.min(Date.now() + 24 * 60 * 60_000, new Date(booking.startsAt).getTime());
    const confirm = bookingActionUrl(createBookingActionToken(booking.id, 'confirmar', expiresAt));
    const decline = bookingActionUrl(createBookingActionToken(booking.id, 'recusar', expiresAt));
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spasmooth.com.br';
    const panel = new URL('/admin/bookings', siteUrl).toString();
    const intake = booking.intakeCompleted === undefined ? undefined : new URL(`/f/${encodeAnamnesisCode(booking.id)}`, siteUrl).toString();
    const pdf = booking.intakeCompleted ? new URL(`/f/${encodeAnamnesisCode(booking.id)}/pdf`, siteUrl).toString() : undefined;
    return bookingNotificationMessage(booking, { confirm, decline, panel, intake, pdf });
}

function requestCallMeBot(message: string) {
    const url = new URL('https://api.callmebot.com/whatsapp.php');
    url.searchParams.set('phone', process.env.CALLMEBOT_PHONE!);
    url.searchParams.set('apikey', process.env.CALLMEBOT_APIKEY!);
    url.searchParams.set('text', message);

    // Avoid Next's fetch tracing for this provider URL, which includes credentials
    // and message contents. Native HTTPS also leaves redirects unfollowed.
    return new Promise<{ status: number; body: string }>((resolve, reject) => {
        const request = get(url, { signal: AbortSignal.timeout(5000) }, response => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', chunk => {
                body += chunk;
                if (body.length > 8192) response.destroy(new Error('Provider response limit'));
            });
            response.on('end', () => resolve({ status: response.statusCode ?? 0, body }));
            response.on('error', reject);
        });
        request.on('error', reject);
    });
}

export async function sendImmediateBookingNotification(booking: NotificationBooking) {
    if (!notificationsEnabled() || !callMeBotConfigured()) {
        if (notificationsEnabled() || process.env.NODE_ENV === 'production') console.error('[booking] Admin notification unavailable by configuration');
        return;
    }
    const result = await getNotificationResult(() => requestCallMeBot(buildMessage(booking)));
    if (result.status !== 'accepted') console.error('[booking] Admin notification', result.status, result.reason);
}

export async function processDueBookingNotifications(bookingId?: string) {
    if (!notificationsEnabled() || !callMeBotConfigured()) return 0;
    const supabase = createAdminClient();
    let processed = 0;
    for (let index = 0; index < (bookingId ? 1 : 4); index++) {
        const { data, error } = await supabase.rpc('claim_booking_notification', { p_booking_id: bookingId ?? null });
        if (error) throw new Error('Notification claim unavailable');
        if (!data) break;

        const claim: Claim = data;
        let result: Awaited<ReturnType<typeof getNotificationResult>>;
        try {
            if (Date.parse(claim.startsAt) <= Date.now()) {
                result = { status: 'failed', reason: 'stale' };
            } else {
                const message = buildMessage(claim);
                result = await getNotificationResult(() => requestCallMeBot(message));
            }
        } catch {
            result = { status: 'retry', reason: 'preflight' };
        }

        const { data: finalized, error: finishError } = await supabase.rpc('finish_booking_notification', {
            p_id: claim.id,
            p_claim_id: claim.claimId,
            p_result: result.status,
            p_reason: result.reason,
        });
        if (finishError || !finalized) throw new Error('Notification outcome write unavailable');
        processed++;
    }
    return processed;
}
