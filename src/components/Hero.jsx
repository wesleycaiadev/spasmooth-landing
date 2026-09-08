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
    return <div className="relative h-full min-h-[292px] overflow-hidden bg-[#dfd2c0] sm:min-h-[360px] lg:min-h-0">
        <Image src="/images/hero/spasmooth-hero-v2.webp" alt="Sala SpaSmooTh preparada para uma sessão de massoterapia" fill priority sizes="(max-width: 1023px) 100vw, 52vw" className="object-cover object-center" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgb(20_13_8_/_0.16)] to-transparent" aria-hidden="true" />
        <div className="absolute right-[10%] top-[14%] flex items-center gap-2 text-[#123b50]/75 drop-shadow-[0_1px_1px_rgb(255_255_255_/_0.55)] sm:right-[14%] sm:top-[17%]" aria-label="SpaSmooTh">
            <svg aria-hidden="true" className="h-9 w-8" viewBox="0 0 40 46" fill="none"><path d="M20 3C12.2 11.2 5.5 21.3 5.5 36.5h29C34.5 21.3 27.8 11.2 20 3Z" stroke="currentColor" strokeWidth="2.2" /><path d="M20 3v33.5M20 3C15.5 14.2 13.5 25.4 13.5 36.5M20 3c4.5 11.2 6.5 22.4 6.5 33.5" stroke="currentColor" strokeWidth="1.4" /></svg>
            <span className="font-semibold text-xl tracking-[-.045em]">Spa<span className="font-extrabold">SmooTh</span></span>
        </div>
    </div>;
}

export default function Hero() {
    const { location, isLoadingLocation } = useLocation();

    return <section className="bg-[var(--spa-cream)] pt-[70px]">
        <div className="grid min-h-[calc(100svh-70px-106px)] overflow-hidden bg-white lg:grid-cols-[minmax(0,.94fr)_minmax(0,1.06fr)]">
            <div className="order-2 flex flex-col justify-center px-6 py-10 sm:px-10 lg:order-1 lg:px-[clamp(2.5rem,7vw,9rem)] lg:py-14">
                <p className="spa-eyebrow mb-4">Bem-vindo ao seu momento</p>
                <h1 className="spa-display max-w-xl text-[2.75rem] leading-[.98] text-[var(--spa-ink)] sm:text-6xl lg:text-[clamp(3.9rem,5vw,5.7rem)]">SpaSmooTh —<br /><em className="font-normal text-[var(--spa-blue)]">Massoterapia, Day Spa e Bronzeamento.</em></h1>
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-600 md:text-base">Redescubra o equilíbrio entre corpo e mente com terapias personalizadas em um ambiente de alto padrão.</p>
                <div className="mt-7">
                    <Link href="/#profissionais" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--spa-ink)] px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgb(7_52_73_/_0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--spa-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--spa-blue)]"><CalendarDays size={18} aria-hidden="true" /> Agendar minha sessão <ArrowRight size={17} aria-hidden="true" /></Link>
                    <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500"><CalendarDays size={15} className="shrink-0 text-[var(--spa-blue)]" aria-hidden="true" /> Escolha a unidade, o tratamento e o horário.</p>
                </div>
                <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500"><MapPin size={16} className="shrink-0 text-[var(--spa-blue)]" aria-hidden="true" /> Atendimento em <strong className="text-[var(--spa-ink)]">{isLoadingLocation ? 'sua unidade' : location}</strong>.</p>
            </div>
            <div className="order-1 lg:order-2"><HeroPhoto /></div>
        </div>
        <div className="grid border-t border-[var(--spa-line)] bg-white sm:grid-cols-3">
            {pillars.map(({ label, detail, icon: Icon }) => <Link href="/#servicos" key={label} className="flex min-h-[106px] items-center justify-center gap-3 border-b border-[var(--spa-line)] px-5 text-center transition hover:bg-[var(--spa-mist)] sm:border-b-0 sm:border-r sm:last:border-r-0"><Icon size={24} className="text-[var(--spa-blue)]" aria-hidden="true" /><span><span className="spa-display block text-lg text-[var(--spa-ink)]">{label}</span><span className="mt-1 block text-xs text-slate-500">{detail}</span></span></Link>)}
        </div>
    </section>;
}
