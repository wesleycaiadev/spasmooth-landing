import 'server-only';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { readCapability } from '@/lib/security/policy';
import { configuredAdminEmails } from '@/lib/security/admin-config';
import { checkAdminIdentity, type AdminCheckResult } from '@/lib/security/admin-identity';
import { capabilitySecret, rateLimit } from '@/lib/security/server';

export type { AdminCheckResult } from '@/lib/security/admin-identity';
export const ADMIN_COOKIE = 'spa_admin';

export async function verifyAdminIdentity(): Promise<AdminCheckResult> {
    return checkAdminIdentity({
        getIdentity: auth,
        getUser: currentUser,
        getSession: async sessionId => (await clerkClient()).sessions.getSession(sessionId),
    }, process.env.ADMIN_USER_IDS || '', configuredAdminEmails(process.env.ADMIN_EMAILS, process.env.ADMIN_EMAIL));
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
