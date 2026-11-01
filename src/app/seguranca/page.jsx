import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ClerkProvider, UserProfile } from '@clerk/nextjs';
export const metadata = { robots: { index: false, follow: false } };
export default async function SecurityPage() {
    await auth.protect();
    return <ClerkProvider><main className="p-6 flex flex-col items-center gap-6"><h1 className="text-2xl">Segurança da conta</h1><p>Gerencie seus dados de acesso e os recursos de segurança disponíveis na sua conta.</p><Link href="/entrar" className="underline">Voltar ao acesso administrativo</Link><UserProfile routing="hash" /></main></ClerkProvider>;
}
