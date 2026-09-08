import Link from 'next/link';
import { CheckCircle2, Clock3, MessageCircle } from 'lucide-react';
import BrandMark from '@/components/BrandMark';

export const metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function ObrigadoPage() {
    return (
        <div className="min-h-screen bg-[var(--spa-cream)] p-5 pt-24 md:p-10 md:pt-28">
            <div className="mx-auto flex max-w-xl justify-center"><BrandMark /></div>
            <main className="mx-auto mt-8 max-w-xl rounded-[2rem] border border-[var(--spa-line)] bg-white p-7 text-center shadow-2xl shadow-[rgb(6_59_100_/_0.10)] md:p-12 animate-slideUp">
                <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <p className="spa-eyebrow mb-3">Pedido enviado</p>
                <h1 className="spa-display text-4xl text-[var(--spa-ink)]">Solicitação recebida.</h1>
                <p className="mt-5 leading-relaxed text-slate-600">Recebemos seu pedido de agendamento. A disponibilidade do horário será confirmada pela equipe pelo WhatsApp.</p>

                <div className="my-8 grid gap-3 text-left sm:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--spa-line)] bg-[var(--spa-mist)] p-4"><Clock3 className="mb-2 text-[var(--spa-blue)]" size={21} aria-hidden="true" /><p className="text-sm font-extrabold text-[var(--spa-ink)]">Aguarde a confirmação</p><p className="mt-1 text-xs leading-relaxed text-slate-600">O horário escolhido só fica confirmado após o retorno da equipe.</p></div>
                    <div className="rounded-2xl border border-[var(--spa-line)] bg-[var(--spa-mist)] p-4"><MessageCircle className="mb-2 text-[#25D366]" size={21} aria-hidden="true" /><p className="text-sm font-extrabold text-[var(--spa-ink)]">Fique de olho no WhatsApp</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Usaremos o contato informado no seu pedido.</p></div>
                </div>
                <Link
                    href="/"
                    className="spa-button-primary w-full"
                >
                    Voltar para o Início
                </Link>
            </main>
        </div>
    );
}
