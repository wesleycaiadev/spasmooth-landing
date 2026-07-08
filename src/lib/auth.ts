"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

export type AdminCheckResult = {
    success: boolean;
    userId?: string;
    error?: string;
};

const envEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";

const ADMIN_EMAILS = envEmails
    .split(/[\n,]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);


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