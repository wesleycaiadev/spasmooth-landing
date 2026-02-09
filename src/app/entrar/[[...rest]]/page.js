"use client";
import { SignIn, useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default function EntrarPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 gap-4">
        <h1 className="text-2xl font-bold text-green-800">Você já está logado!</h1>
        <p className="text-green-600">Usuário: {user.primaryEmailAddress.emailAddress}</p>
        <div className="flex gap-4">
          <Link href="/admin/kanban" className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
            Ir para o Painel Admin
          </Link>
          <SignOutButton>
            <button className="px-6 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200">
              Sair (Resetar)
            </button>
          </SignOutButton>
        </div>
        <p className="text-sm text-slate-400 mt-4 max-w-xs text-center">
          Se você clicar em "Ir para o Painel" e voltar para esta tela, clique em "Sair" e faça login novamente para renovar sua sessão.
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
          forceRedirectUrl="/admin/kanban"
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
