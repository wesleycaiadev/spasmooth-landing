import { z } from 'zod';
import { readCapability, signCapability } from '../security/policy';

const bookingId = z.string().uuid();
const PDF_TOKEN_TTL_MS = 7 * 24 * 60 * 60_000; // 7 dias

function getSecret(secret?: string): string {
    const s = secret || process.env.APP_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!s || s.length < 32) throw new Error('Configuração de segurança ausente.');
    return s;
}

export function createAnamnesisPdfToken(id: string, secret?: string): string {
    return signCapability({
        purpose: 'anamnesis-pdf',
        id: bookingId.parse(id),
        exp: Date.now() + PDF_TOKEN_TTL_MS,
    }, getSecret(secret));
}

export function readAnamnesisPdfToken(token: string | undefined, secret?: string): string | null {
    try {
        const s = getSecret(secret);
        const result = bookingId.safeParse(
            readCapability(token, s, 'anamnesis-pdf')?.id,
        );
        return result.success ? result.data : null;
    } catch {
        return null;
    }
}

export function anamnesisPdfUrl(token: string): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spasmooth.com.br';
    return new URL(`/api/anamnese-pdf/${encodeURIComponent(token)}`, siteUrl).toString();
}
