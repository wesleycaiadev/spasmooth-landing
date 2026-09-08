import Link from 'next/link';

export const metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="max-w-md">
        <p className="text-6xl font-bold text-cyan-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">
          Página não encontrada
        </h1>
        <p className="text-slate-500 mb-8">
          A página que você procura não existe ou foi removida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-cyan-700 text-white rounded-full font-bold hover:bg-cyan-800 transition-colors"
          >
            Voltar ao Início
          </Link>
          <Link
            href="/#servicos"
            className="px-8 py-3 border border-slate-200 text-slate-600 rounded-full font-bold hover:bg-slate-50 transition-colors"
          >
            Ver Serviços
          </Link>
        </div>
      </div>
    </main>
  );
}
