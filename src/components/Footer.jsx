import Link from 'next/link';
import { Instagram, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import BrandMark from './BrandMark';

export default function Footer() {
    return <footer className="bg-[var(--spa-ink)] py-14 text-white">
        <div className="spa-shell">
            <div className="grid gap-10 md:grid-cols-[1.25fr_1fr_1fr]">
                <div><BrandMark inverted /><p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">Um espaço para reservar tempo, atenção e uma experiência do seu jeito.</p><div className="mt-5 flex gap-2"><a href="https://www.instagram.com/spa_smooth/" target="_blank" rel="noopener noreferrer" aria-label="Instagram do SpaSmooth" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white hover:text-[var(--spa-ink)]"><Instagram size={18} aria-hidden="true" /></a><a href="https://wa.me/557991189140" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp do SpaSmooth" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white hover:text-[var(--spa-ink)]"><MessageCircle size={18} aria-hidden="true" /></a></div></div>
                <div><h2 className="text-sm font-extrabold">Navegação</h2><nav aria-label="Rodapé" className="mt-4 flex flex-col gap-3 text-sm text-white/70"><Link href="/servicos" className="hover:text-white">Tratamentos</Link><Link href="/#profissionais" className="hover:text-white">Agendar</Link><Link href="/#localizacao" className="hover:text-white">Localização</Link><Link href="/privacidade" className="hover:text-white">Privacidade</Link></nav></div>
                <div><h2 className="text-sm font-extrabold">Seu agendamento</h2><p className="mt-4 text-sm leading-relaxed text-white/70">As opções de profissionais e horários são atualizadas no momento do agendamento.</p><Link href="/#profissionais" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#86d9ea] hover:text-white"><MapPin size={16} aria-hidden="true" /> Escolher unidade e horário</Link></div>
            </div>
            <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 SpaSmooth Massoterapia. Todos os direitos reservados.</p><div className="flex items-center gap-2"><ShieldCheck size={14} aria-hidden="true" /><span>Informações tratadas conforme o aviso de privacidade.</span></div><Link href="/admin/dashboard" className="sr-only">Acesso administrativo</Link></div>
        </div>
    </footer>;
}
