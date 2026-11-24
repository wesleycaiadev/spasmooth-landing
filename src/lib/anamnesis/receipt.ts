import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { readCapability } from '../security/policy';

export function readAnamnesisReceipt(token: string | undefined, secret: string) {
    const capability = readCapability(token, secret, 'booking-anamnesis');
    const id = z.uuid().safeParse(capability?.id);
    if (!id.success || !token) return null;
    const formBinding = createHmac('sha256', secret).update('anamnesis-form:').update(token).digest('hex');
    return { id: id.data, formBinding };
}

export function matchesFormBinding(expected: string, submitted: string) {
    return /^[a-f0-9]{64}$/.test(submitted) && timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(submitted, 'hex'));
}
