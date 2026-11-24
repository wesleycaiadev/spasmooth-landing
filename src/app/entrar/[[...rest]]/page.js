"use client";
import { SignIn, useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

export default function EntrarPage() {
  return <Suspense fallback={<p>Carregando…</p>}><EntrarContent /></Suspense>;
}

function EntrarContent() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const attempted = useRef(null);
  const requestInFlight = useRef(false);
  const pdfCode = useSearchParams().get('ficha');
  const pdfQuery = pdfCode === null ? '' : `?ficha=${encodeURIComponent(pdfCode)}`;
  const { isSignedIn, user, isLoaded } = useUser();

  const openAdmin = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setError('');
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/session${pdfQuery}`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) { setError(typeof result.error === 'string' ? result.error : 'Não foi possível autorizar o acesso. Tente novamente.'); return; }
      window.location.assign(result.redirectTo || '/admin/kanban');
    } catch { setError('Não foi possível abrir a sessão. Tente novamente.'); } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }, [pdfQuery]);

  useEffect(() => {
    if (!isSignedIn || !pdfQuery || attempted.current === pdfQuery) return;
    attempted.current = pdfQuery;
    void openAdmin();
  }, [isSignedIn, pdfQuery, openAdmin]);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 gap-4">
        <h1 className="text-2xl font-bold text-green-800">Você já está logado!</h1>
        <p className="text-green-600">Usuário: {user?.primaryEmailAddress?.emailAddress || 'Conta sem e-mail principal'}</p>
        {error && <p role="alert" className="text-red-700 max-w-md">{error}</p>}
        <Link href="/seguranca" className="underline">Gerenciar segurança da conta</Link>
        <div className="flex gap-4">
          <button onClick={openAdmin} disabled={busy} className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
            {busy ? 'Verificando...' : pdfQuery ? 'Abrir PDF' : 'Ir para o Painel Admin'}
          </button>
          <SignOutButton redirectUrl={pdfQuery ? `/entrar${pdfQuery}` : undefined}>
            <button className="px-6 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200">
              {pdfQuery ? 'Trocar de conta' : 'Sair (Resetar)'}
            </button>
          </SignOutButton>
        </div>
        {!pdfQuery && <p className="text-sm text-slate-400 mt-4 max-w-xs text-center">
          Se você clicar em &quot;Ir para o Painel&quot; e voltar para esta tela, clique em &quot;Sair&quot; e faça login novamente para renovar sua sessão.
        </p>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          {pdfQuery ? 'Entre para abrir o PDF' : 'Login do Admin'}
        </h1>
        <SignIn
          path="/entrar"
          routing="path"
          forceRedirectUrl={`/entrar${pdfQuery}`}
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
