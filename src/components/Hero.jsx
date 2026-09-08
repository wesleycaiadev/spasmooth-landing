"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, SunMedium, Flower2, Hand } from 'lucide-react';
import { useLocation } from '@/components/LocationProvider';

const pillars = [
    { label: 'Massoterapia', detail: 'Alívio e bem-estar', icon: Hand },
    { label: 'Day Spa', detail: 'Experiências completas', icon: SunMedium },
    { label: 'Bronzeamento', detail: 'Beleza e autoestima', icon: Flower2 },
];

function HeroPhoto() {
    return <div className="relative aspect-[4/3] overflow-hidden bg-[#dfd2c0] lg:h-full lg:aspect-auto">
        <Image src="/images/hero/spasmooth-hero.webp" alt="Ambiente SpaSmooTh preparado para uma sessão de massoterapia" fill priority sizes="(max-width: 1023px) 100vw, 52vw" className="object-cover" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[rgb(0_0_0_/_0.15)] to-transparent" aria-hidden="true" />
        <div className="absolute left-5 top-5 flex items-center gap-2 text-white drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.45)] md:left-7 md:top-7" aria-label="SpaSmooTh">
            <svg aria-hidden="true" className="h-9 w-8" viewBox="0 0 40 46" fill="none"><path d="M20 3C12.2 11.2 5.5 21.3 5.5 36.5h29C34.5 21.3 27.8 11.2 20 3Z" stroke="currentColor" strokeWidth="2.2" /><path d="M20 3v33.5M20 3C15.5 14.2 13.5 25.4 13.5 36.5M20 3c4.5 11.2 6.5 22.4 6.5 33.5" stroke="currentColor" strokeWidth="1.4" /></svg>
            <span className="font-semibold text-xl tracking-[-.045em]">Spa<span className="font-extrabold">SmooTh</span></span>
        </div>
    </div>;
}

export default function Hero() {
    const { location, isLoadingLocation } = useLocation();

    return <section className="bg-[var(--spa-cream)] pt-[76px]">
        <div className="spa-shell overflow-hidden border-x border-[var(--spa-line)] bg-white lg:grid lg:min-h-[560px] lg:grid-cols-[.94fr_1.06fr]">
            <div className="order-2 flex flex-col justify-center px-6 py-9 sm:px-10 lg:order-1 lg:px-12 lg:py-14">
                <p className="spa-eyebrow mb-4">Bem-vindo ao seu momento</p>
                <h1 className="spa-display max-w-xl text-[2.75rem] leading-[.98] text-[var(--spa-ink)] sm:text-6xl lg:text-[4.25rem]">SpaSmooTh —<br /><em className="font-normal text-[var(--spa-blue)]">Massoterapia, Day Spa e Bronzeamento.</em></h1>
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-600 md:text-base">Redescubra o equilíbrio entre corpo e mente com terapias personalizadas em um ambiente de alto padrão.</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/#profissionais" className="spa-button-primary rounded-xl"><CalendarDays size={18} aria-hidden="true" /> Agendar minha sessão <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/#servicos" className="spa-button-secondary rounded-xl">Conhecer tratamentos</Link></div>
                <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500"><MapPin size={16} className="shrink-0 text-[var(--spa-blue)]" aria-hidden="true" /> Opções para <strong className="text-[var(--spa-ink)]">{isLoadingLocation ? 'sua unidade' : location}</strong>.</p>
            </div>
            <div className="order-1 min-h-[290px] lg:order-2 lg:min-h-0"><HeroPhoto /></div>
        </div>
        <div className="spa-shell grid border-x border-b border-[var(--spa-line)] bg-white sm:grid-cols-3">
            {pillars.map(({ label, detail, icon: Icon }) => <Link href="/#servicos" key={label} className="flex min-h-[106px] items-center justify-center gap-3 border-b border-[var(--spa-line)] px-5 text-center transition hover:bg-[var(--spa-mist)] sm:border-b-0 sm:border-r sm:last:border-r-0"><Icon size={24} className="text-[var(--spa-blue)]" aria-hidden="true" /><span><span className="spa-display block text-lg text-[var(--spa-ink)]">{label}</span><span className="mt-1 block text-xs text-slate-500">{detail}</span></span></Link>)}
        </div>
    </section>;
}
