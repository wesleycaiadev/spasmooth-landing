import 'server-only';
import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { isSameOrigin } from './policy';

export function capabilitySecret(): string {
    const secret = process.env.APP_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret || secret.length < 32) throw new Error('Configuração de segurança ausente.');
    return secret;
}

export function trustedOrigins(): string[] {
    const origins = [process.env.NEXT_PUBLIC_SITE_URL, 'https://spasmooth.com.br', 'https://www.spasmooth.com.br', process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`, process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`];
    if (process.env.NODE_ENV !== 'production') origins.push('http://localhost:3000', 'http://127.0.0.1:3000');
    return origins.filter((o): o is string => Boolean(o)).map(o => new URL(o).origin);
}

export function requireSameOrigin(request: Request): void {
    if (!isSameOrigin(request.headers.get('origin'), trustedOrigins())) throw new Error('Origem não permitida.');
}

// Atomic, shared between serverless instances. Failure closes access.
export async function rateLimit(scope: string, limit: number, seconds: number, identity?: string): Promise<boolean> {
    const h = await headers();
    const ip = process.env.VERCEL === '1' ? h.get('x-vercel-forwarded-for') : (process.env.NODE_ENV !== 'production' ? h.get('x-forwarded-for') || 'local' : null);
    const subject = identity || ip?.split(',')[0]?.trim() || 'unknown';
    const key = createHmac('sha256', capabilitySecret()).update(`${scope}:${subject}`).digest('hex');
    const { data, error } = await createAdminClient().rpc('consume_rate_limit', { p_key: key, p_limit: limit, p_window_seconds: seconds });
    return !error && data === true;
}
