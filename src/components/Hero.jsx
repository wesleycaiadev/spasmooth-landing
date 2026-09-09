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

export default function Hero() {
    const { location, isLoadingLocation } = useLocation();

    return <section className="bg-[var(--spa-cream)] pt-[70px]">
        <div className="relative flex min-h-[calc(100svh-70px-106px)] overflow-hidden bg-[var(--spa-cream)]">
            <div className="spa-hero-photo">
                <Image data-spa-hero-image src="/images/hero/spasmooth-hero-original.webp" alt="Sala SpaSmooTh preparada para uma sessão de massoterapia" fill preload unoptimized className="object-cover object-[65%_center] lg:object-contain lg:object-right-top" />
                <div className="spa-hero-blend" aria-hidden="true" />
            </div>
            <div className="relative z-10 flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:max-w-[60%] lg:px-[clamp(2.5rem,7vw,9rem)] lg:py-14">
                <p className="spa-eyebrow mb-4">Bem-vindo ao seu momento</p>
                <h1 className="spa-display max-w-xl text-[2.75rem] leading-[.98] text-[var(--spa-ink)] sm:text-6xl lg:text-[clamp(3.9rem,5vw,5.7rem)]">SpaSmooTh<br /><em className="font-normal text-[var(--spa-blue)]">Massoterapia, Day Spa e Bronzeamento.</em></h1>
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-600 md:text-base">Redescubra o equilíbrio entre corpo e mente com terapias personalizadas em um ambiente de alto padrão.</p>
                <div className="mt-7">
                    <Link href="/#profissionais" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--spa-ink)] px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgb(7_52_73_/_0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--spa-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--spa-blue)]"><CalendarDays size={18} aria-hidden="true" /> Agendar minha sessão <ArrowRight size={17} aria-hidden="true" /></Link>
                    <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500"><CalendarDays size={15} className="shrink-0 text-[var(--spa-blue)]" aria-hidden="true" /> Escolha a unidade, o tratamento e o horário.</p>
                </div>
                <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500"><MapPin size={16} className="shrink-0 text-[var(--spa-blue)]" aria-hidden="true" /> Atendimento em <strong className="text-[var(--spa-ink)]">{isLoadingLocation ? 'sua unidade' : location}</strong>.</p>
            </div>
        </div>
        <div className="grid border-t border-[var(--spa-line)] bg-white sm:grid-cols-3">
            {pillars.map(({ label, detail, icon: Icon }) => <Link href="/#servicos" key={label} className="flex min-h-[106px] items-center justify-center gap-3 border-b border-[var(--spa-line)] px-5 text-center transition hover:bg-[var(--spa-mist)] sm:border-b-0 sm:border-r sm:last:border-r-0"><Icon size={24} className="text-[var(--spa-blue)]" aria-hidden="true" /><span><span className="spa-display block text-lg text-[var(--spa-ink)]">{label}</span><span className="mt-1 block text-xs text-slate-500">{detail}</span></span></Link>)}
        </div>
    </section>;
}
