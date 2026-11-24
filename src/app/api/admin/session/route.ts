import { NextResponse, type NextRequest } from 'next/server';
import { ANAMNESIS_RETURN_COOKIE, ANAMNESIS_RETURN_COOKIE_PATH, readAnamnesisReturn } from '@/lib/anamnesis/short-link';
import { verifyAdminIdentity, ADMIN_COOKIE } from '@/lib/auth';
import { capabilitySecret, requireSameOrigin, rateLimit } from '@/lib/security/server';
import { signCapability } from '@/lib/security/policy';

export async function POST(request: NextRequest) {
    try { requireSameOrigin(request); } catch { return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 }); }
    try {
        if (!await rateLimit('admin-session', 10, 300)) return NextResponse.json({ error: 'Muitas tentativas. Aguarde.' }, { status: 429, headers: { 'Retry-After': '300' } });
        const identity = await verifyAdminIdentity();
        if (!identity.success) return NextResponse.json({ error: identity.error }, { status: 403 });
        const secret = capabilitySecret();
        const returnToken = request.cookies.get(ANAMNESIS_RETURN_COOKIE)?.value;
        const redirectTo = readAnamnesisReturn(returnToken, secret);
        const response = NextResponse.json({ success: true, redirectTo }, { headers: { 'Cache-Control': 'no-store' } });
        response.cookies.set(ADMIN_COOKIE, signCapability({ purpose: 'admin', userId: identity.userId, sessionId: identity.sessionId, exp: Date.now() + 8 * 3600_000 }, secret), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 3600 });
        if (returnToken) {
            response.cookies.set(ANAMNESIS_RETURN_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: ANAMNESIS_RETURN_COOKIE_PATH, maxAge: 0 });
        }
        return response;
    } catch { return NextResponse.json({ error: 'Serviço temporariamente indisponível.' }, { status: 503 }); }
}
