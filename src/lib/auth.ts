"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

export type AdminCheckResult = {
    success: boolean;
    userId?: string;
    error?: string;
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/**
 * Verifica se o usuário autenticado é admin.
 * Checa userId via Clerk + email contra ADMIN_EMAILS (env var).
 */
export async function verifyAdmin(): Promise<AdminCheckResult> {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: "Acesso negado." };
    }

    const user = await currentUser();

    if (!user) {
        return { success: false, error: "Acesso negado." };
    }

    const email = user.emailAddresses[0]?.emailAddress?.toLowerCase();

    if (!email || (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email))) {
        return { success: false, error: "Acesso negado." };
    }

    return { success: true, userId };
}
