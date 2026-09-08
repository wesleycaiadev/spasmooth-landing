"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Sparkles } from 'lucide-react';
import { useLocation } from '@/components/LocationProvider';

export default function Hero() {
    const { location, isLoadingLocation } = useLocation();

    return (
        <section className="relative overflow-hidden bg-[var(--spa-cream)] pb-10 pt-28 md:pb-16 md:pt-36">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/ambiente.webp"
                    alt="Ambiente de massagem luxuoso no SpaSmooth"
                    fill
                    priority
                    loading="eager"
                    sizes="100vw"
                    className="object-cover object-center opacity-30 md:object-right"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--spa-cream)] via-[var(--spa-cream)]/90 to-white/25" />
            </div>
            <div className="spa-shell relative z-10 grid min-h-[610px] items-center gap-10 lg:grid-cols-[.95fr_1.05fr]">
                <div className="max-w-2xl py-8 animate-slideUp">
                    <p className="spa-eyebrow mb-5 flex items-center gap-2"><Sparkles size={15} aria-hidden="true" /> Bem-vindo ao seu momento</p>
                    <h1 className="spa-display max-w-xl text-5xl leading-[.98] text-[var(--spa-ink)] sm:text-6xl lg:text-7xl">Mais que relaxamento, <em className="font-normal text-[var(--spa-blue)]">uma nova versão de você.</em></h1>
                    <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600 md:text-lg">Massoterapia, Day Spa e cuidados pensados para transformar uma pausa em um momento só seu.</p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link href="/#profissionais" className="spa-button-primary"><CalendarDays size={18} aria-hidden="true" /> Agendar minha sessão <ArrowRight size={17} aria-hidden="true" /></Link>
                        <Link href="/#servicos" className="spa-button-secondary">Conhecer tratamentos</Link>
                    </div>
                    <div className="mt-9 flex max-w-md items-start gap-3 border-t border-[var(--spa-line)] pt-5 text-sm text-slate-600"><MapPin size={18} className="mt-.5 shrink-0 text-[var(--spa-blue)]" aria-hidden="true" /><span>Você está vendo as opções para <strong className="text-[var(--spa-ink)]">{isLoadingLocation ? 'sua unidade' : location}</strong>. Escolha sua terapeuta, experiência e horário em poucos passos.</span></div>
                </div>
                <div className="relative hidden min-h-[550px] lg:block">
                    <div className="absolute inset-2 overflow-hidden rounded-[2.5rem] border border-white/80 bg-[var(--spa-ink)] shadow-2xl shadow-[rgb(6_59_100_/_0.25)]">
                        <Image src="/images/ambiente.webp" alt="Sala preparada para receber uma experiência SpaSmooTh" fill sizes="50vw" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(6_59_100_/_0.72)] via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/20 bg-white/90 p-5 backdrop-blur"><p className="spa-eyebrow">Corpo · mente · equilíbrio</p><p className="spa-display mt-2 text-2xl text-[var(--spa-ink)]">Seu tempo merece cuidado.</p></div>
                    </div>
                    <div className="absolute -right-4 top-16 h-24 w-24 rounded-full border-[10px] border-[var(--spa-sky)] bg-[var(--spa-coral)]" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
}
