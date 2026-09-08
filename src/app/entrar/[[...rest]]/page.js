"use client";
import { SignIn, useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function EntrarPage() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function openAdmin() {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/session', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      window.location.assign('/admin/kanban');
    } catch { setError('Não foi possível abrir a sessão. Tente novamente.'); } finally { setBusy(false); }
  }
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 gap-4">
        <h1 className="text-2xl font-bold text-green-800">Você já está logado!</h1>
        <p className="text-green-600">Usuário: {user.primaryEmailAddress.emailAddress}</p>
        {error && <p role="alert" className="text-red-700 max-w-md">{error}</p>}
        <Link href="/seguranca" className="underline">Configurar autenticação em duas etapas</Link>
        <div className="flex gap-4">
          <button onClick={openAdmin} disabled={busy} className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
            {busy ? 'Verificando...' : 'Ir para o Painel Admin'}
          </button>
          <SignOutButton>
            <button className="px-6 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200">
              Sair (Resetar)
            </button>
          </SignOutButton>
        </div>
        <p className="text-sm text-slate-400 mt-4 max-w-xs text-center">
          Se você clicar em &quot;Ir para o Painel&quot; e voltar para esta tela, clique em &quot;Sair&quot; e faça login novamente para renovar sua sessão.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Login do Admin</h1>
        <SignIn
          path="/entrar"
          routing="path"
          forceRedirectUrl="/entrar"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none"
            }
          }}
        />
      </div>
    </div>
  );
}
