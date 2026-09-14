import { ArrowUpRight, DoorOpen } from 'lucide-react';

export default function FloatingSubleaseButton() {
    const message = encodeURIComponent('Olá! Sou profissional e gostaria de consultar a disponibilidade e as condições para sublocação de sala no SpaSmooTh.');

    return (
        <a
            href={`https://wa.me/557991189140?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sublocação de sala para profissionais: consultar no WhatsApp (abre em nova aba)"
            className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 z-50 flex h-11 items-center gap-2 rounded-full border border-[var(--spa-line)] bg-white/95 px-2.5 text-[var(--spa-ink)] shadow-[0_4px_18px_rgb(6_59_100_/_0.1)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[var(--spa-blue)] hover:bg-[var(--spa-mist)] md:left-6 md:h-auto md:min-h-14 md:max-w-none md:gap-3 md:rounded-2xl md:px-4 md:py-3"
        >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--spa-sky)] text-[var(--spa-blue)] md:h-9 md:w-9 md:rounded-xl"><DoorOpen size={17} aria-hidden="true" /></span>
            <span className="text-left">
                <span className="hidden text-[9px] font-bold uppercase tracking-[.12em] text-slate-500 md:block">Para profissionais</span>
                <span className="block text-[11px] font-extrabold md:mt-0.5 md:text-sm"><span className="md:hidden">Sublocar sala</span><span className="hidden md:inline">Sublocação de sala</span></span>
            </span>
            <ArrowUpRight size={16} className="hidden shrink-0 text-[var(--spa-blue)] md:block" aria-hidden="true" />
        </a>
    );
}
