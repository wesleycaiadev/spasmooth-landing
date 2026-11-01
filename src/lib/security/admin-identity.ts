import { allowedAdmin } from './policy';

type AdminUser = Parameters<typeof allowedAdmin>[0] & { banned: boolean; locked: boolean };
type AdminSession = { id: string; userId: string; status: string; expireAt: number };

export type AdminCheckResult = { success: boolean; userId?: string; sessionId?: string; error: string };
type IdentityProvider = {
    getIdentity: () => Promise<{ userId: string | null; sessionId: string | null }>;
    getUser: () => Promise<AdminUser | null>;
    getSession: (sessionId: string) => Promise<AdminSession>;
};

// Clerk authenticates the session. Application admission adds the server-owned
// allowlist, current account state and a live session lookup. MFA enrollment is
// optional and is managed by Clerk, not required by this application.
export async function checkAdminIdentity(
    provider: IdentityProvider,
    userIds: string,
    emails: string,
    now?: number,
): Promise<AdminCheckResult> {
    const denied = { success: false, error: 'Acesso negado. Entre com uma conta administradora.' };
    try {
        const { userId, sessionId } = await provider.getIdentity();
        if (!userId || !sessionId) return denied;
        const user = await provider.getUser();
        if (!user || user.id !== userId || user.banned || user.locked || !allowedAdmin(user, userIds, emails)) return denied;
        const session = await provider.getSession(sessionId);
        if (session.id !== sessionId || session.userId !== userId || session.status !== 'active'
            || !Number.isFinite(session.expireAt) || session.expireAt <= (now ?? Date.now())) return denied;
        return { success: true, userId, sessionId, error: '' };
    } catch {
        return { success: false, error: 'Não foi possível verificar sua sessão. Tente novamente.' };
    }
}
