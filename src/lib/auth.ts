import 'server-only';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { allowedAdmin, readCapability } from '@/lib/security/policy';
import { capabilitySecret, rateLimit } from '@/lib/security/server';

export type AdminCheckResult = { success: boolean; userId?: string; sessionId?: string; error: string };
export const ADMIN_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-spa_admin' : 'spa_admin';

export async function verifyAdminIdentity(): Promise<AdminCheckResult> {
    const denied = { success: false, error: 'Acesso negado. Entre com uma conta administradora e autenticação em duas etapas.' };
    try {
        const { userId, sessionId, sessionClaims } = await auth();
        if (!userId || !sessionId) return denied;
        const user = await currentUser();
        if (!user || !allowedAdmin(user, process.env.ADMIN_USER_IDS || '', process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')) return denied;
        const age = sessionClaims?.fva?.[1];
        if (!user.twoFactorEnabled || typeof age !== 'number' || age < 0 || age > 480) return denied;
        const session = await (await clerkClient()).sessions.getSession(sessionId);
        if (session.status !== 'active' || session.userId !== userId || session.expireAt <= Date.now()) return denied;
        return { success: true, userId, sessionId, error: '' };
    } catch { return denied; }
}

export async function verifyAdmin(): Promise<AdminCheckResult> {
    // An absent HttpOnly grant is rejected before any external identity lookup.
    const grant = readCapability((await cookies()).get(ADMIN_COOKIE)?.value, capabilitySecret(), 'admin');
    if (!grant) return { success: false, error: 'Sessão administrativa expirada. Entre novamente.' };
    const identity = await verifyAdminIdentity();
    if (!identity.success) return identity;
    if (grant.userId !== identity.userId || grant.sessionId !== identity.sessionId) return { success: false, error: 'Sessão administrativa expirada. Entre novamente.' };
    if (!await rateLimit('admin', 180, 60, identity.userId)) return { success: false, error: 'Muitas solicitações. Aguarde um minuto.' };
    return identity;
}
