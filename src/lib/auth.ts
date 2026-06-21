"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

export type AdminCheckResult = {
    success: boolean;
    userId?: string;
    error?: string;
};

// Pega as variáveis (tenta com S ou sem S para garantir)
const envEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";

// Divide por vírgula OU por quebra de linha (\n), limpa os espaços e deixa tudo minúsculo
const ADMIN_EMAILS = envEmails
    .split(/[\n,]+/)
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

    // Se o e-mail do usuário não estiver na lista de admins, bloqueia
    if (!email || (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email))) {
        return { success: false, error: "Acesso negado." };
    }

    return { success: true, userId };
}