import 'server-only';

import { z } from 'zod';
import { capabilitySecret } from '@/lib/security/server';
import { readCapability, signCapability } from '@/lib/security/policy';

const actionSchema = z.enum(['confirmar', 'recusar']);

export const signedBookingActionSchema = z.object({
    purpose: z.literal('booking-action'),
    id: z.string().uuid(),
    action: actionSchema,
    exp: z.number().int().positive(),
}).strict();

export type BookingAction = z.infer<typeof actionSchema>;
export type SignedBookingAction = z.infer<typeof signedBookingActionSchema>;

export function createBookingActionToken(id: string, action: BookingAction, expiresAt: number): string {
    return signCapability({ purpose: 'booking-action', id, action, exp: expiresAt }, capabilitySecret());
}

export function readBookingActionToken(token: string | undefined): SignedBookingAction | null {
    const capability = readCapability(token, capabilitySecret(), 'booking-action');
    const parsed = signedBookingActionSchema.safeParse(capability);
    return parsed.success ? parsed.data : null;
}

export function bookingActionUrl(token: string): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spasmooth.com.br';
    return new URL(`/agendamento/acao/${encodeURIComponent(token)}`, siteUrl).toString();
}
