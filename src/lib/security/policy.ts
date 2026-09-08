import { createHmac, timingSafeEqual } from 'node:crypto';

export function allowedAdmin(user: { id: string; primaryEmailAddressId: string | null; emailAddresses: { id: string; emailAddress: string; verification: { status: string } | null }[] }, ids: string, emails: string): boolean {
    const list = (value: string) => value.split(/[\n,]+/).map(v => v.trim()).filter(Boolean);
    if (list(ids).includes(user.id)) return true;
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    return email?.verification?.status === 'verified' && list(emails).map(e => e.toLowerCase()).includes(email.emailAddress.toLowerCase());
}

export function isSameOrigin(origin: string | null, allowed: string[]): boolean {
    if (!origin || origin === 'null') return false;
    try { return new URL(origin).origin === origin && allowed.includes(origin); } catch { return false; }
}

export function signCapability(payload: Record<string, unknown>, secret: string): string {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}

export function readCapability(token: string | undefined, secret: string, purpose: string, now = Date.now()): Record<string, unknown> | null {
    if (!token || token.length > 2048) return null;
    try {
        const [body, signature, extra] = token.split('.');
        if (extra || !signature) return null;
        const actual = Buffer.from(signature, 'base64url');
        const expected = createHmac('sha256', secret).update(body).digest();
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
        return payload.purpose === purpose && typeof payload.exp === 'number' && payload.exp > now ? payload : null;
    } catch { return null; }
}
