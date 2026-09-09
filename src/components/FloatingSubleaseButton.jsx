import { ArrowUpRight, DoorOpen } from 'lucide-react';

export default function FloatingSubleaseButton() {
    const message = encodeURIComponent('Olá! Sou profissional e gostaria de consultar a disponibilidade e as condições para sublocação de sala no SpaSmooTh.');

    return (
        <a
            href={`https://wa.me/557991189140?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sublocação de sala para profissionais: consultar no WhatsApp (abre em nova aba)"
            className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 z-50 flex min-h-14 max-w-[calc(100vw-6rem)] items-center gap-3 rounded-2xl border border-[var(--spa-line)] bg-white/95 px-3 py-3 text-[var(--spa-ink)] shadow-[0_4px_20px_rgb(6_59_100_/_0.08)] backdrop-blur-sm transition-colors hover:border-[var(--spa-blue)] hover:bg-[var(--spa-mist)] md:left-6 md:px-4"
        >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--spa-sky)] text-[var(--spa-blue)]"><DoorOpen size={19} aria-hidden="true" /></span>
            <span className="text-left">
                <span className="block text-[9px] font-bold uppercase tracking-[.12em] text-slate-500">Para profissionais</span>
                <span className="mt-0.5 block text-xs font-extrabold md:text-sm">Sublocação de sala</span>
            </span>
            <ArrowUpRight size={16} className="shrink-0 text-[var(--spa-blue)]" aria-hidden="true" />
        </a>
    );
}
