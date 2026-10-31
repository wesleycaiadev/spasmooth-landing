import 'server-only';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { allowedAdmin, hasVerifiedSecondFactor, readCapability } from '@/lib/security/policy';
import { configuredAdminEmails } from '@/lib/security/admin-config';
import { capabilitySecret, rateLimit } from '@/lib/security/server';

export type AdminCheckResult = { success: boolean; userId?: string; sessionId?: string; error: string };
export const ADMIN_COOKIE = 'spa_admin';

export async function verifyAdminIdentity(): Promise<AdminCheckResult> {
    const denied = { success: false, error: 'Acesso negado. Entre com uma conta administradora e autenticação em duas etapas.' };
    try {
        const { userId, sessionId, sessionClaims } = await auth();
        if (!userId || !sessionId) {
            console.error('[verifyAdminIdentity] Missing userId or sessionId');
            return denied;
        }
        const user = await currentUser();
        if (!user || user.id !== userId || user.banned || user.locked) {
            console.error('[verifyAdminIdentity] User unavailable');
            return denied;
        }
        if (!allowedAdmin(user, process.env.ADMIN_USER_IDS || '', configuredAdminEmails(process.env.ADMIN_EMAILS, process.env.ADMIN_EMAIL))) {
            console.error('[verifyAdminIdentity] Identity not authorized');
            return denied;
        }
        
        // Enrollment alone is insufficient: the signed session must also prove
        // that both factors were verified. Missing claims and -1 deny access.
        if (!hasVerifiedSecondFactor(user.twoFactorEnabled, sessionClaims?.fva)) {
            return { success: false, error: 'Ative a autenticação em duas etapas em Segurança da conta e entre novamente usando o segundo fator.' };
        }
        
        const session = await (await clerkClient()).sessions.getSession(sessionId);
        if (session.id !== sessionId || session.status !== 'active' || session.userId !== userId || !Number.isFinite(session.expireAt) || session.expireAt <= Date.now()) {
            console.error('[verifyAdminIdentity] Session invalid or expired');
            return denied;
        }
        return { success: true, userId, sessionId, error: '' };
    } catch {
        console.error('[verifyAdminIdentity] Identity verification unavailable');
        return denied; 
    }
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
