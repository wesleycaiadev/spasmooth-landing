"use client";

import Image from 'next/image';
import { ArrowRight, Sparkles, Layers, Palette, Flame, Scissors } from 'lucide-react';
import { calculateDiscount } from '@/lib/discounts';
import { categoryLabels, getServiceImage } from '@/lib/serviceImages';

const iconMap = { combo: Layers, day_spa: Sparkles, estetica: Palette, tantrica: Flame, depilacao: Scissors };

export default function ServiceBookingCard({ treatment }) {
    const Icon = iconMap[treatment.category] || Sparkles;
    const disc = calculateDiscount(treatment);
    const originalPrice = treatment.price ? `R$ ${Number(treatment.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : (treatment.durations?.[0]?.price || 'Sob consulta');
    const price = disc.hasDiscount ? disc.formattedFinalPrice : originalPrice;
    const duration = treatment.duration_minutes ? `${treatment.duration_minutes} min` : (treatment.durations?.[0]?.time || '');

    const handleBooking = () => {
        sessionStorage.setItem('selected_service', JSON.stringify({ id: treatment.id, name: treatment.name, defaultOption: { time: duration, price } }));
        const wizard = document.getElementById('profissionais');
        if (wizard) wizard.scrollIntoView({ behavior: 'smooth' });
        else window.location.href = '/#profissionais';
    };

    const image = getServiceImage(treatment.slug);

    return <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--spa-line)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[rgb(6_59_100_/_0.10)]">
        {image ? <div className="relative h-40 overflow-hidden"><Image src={image} alt={`Imagem ilustrativa para ${treatment.name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /></div> : <div className="flex h-24 items-center gap-3 border-b border-[var(--spa-line)] bg-[var(--spa-mist)] px-5 text-[var(--spa-blue)]"><Icon size={23} aria-hidden="true" /><span className="text-xs font-extrabold">Imagem do tratamento em preparação</span></div>}
        <div className="flex flex-1 flex-col p-5">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--spa-blue)]">{categoryLabels[treatment.category] || 'Experiência SpaSmooTh'}</p>
            <div className="flex items-start justify-between gap-3"><h3 className="spa-display text-xl leading-tight text-[var(--spa-ink)]">{treatment.name}</h3><span className="shrink-0 text-right text-xs font-extrabold text-[var(--spa-ink)]">{duration}</span></div>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{treatment.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--spa-line)] pt-4"><div>{disc.hasDiscount && <span className="mr-2 text-xs text-slate-400 line-through">{disc.formattedOriginalPrice}</span>}<span className="text-base font-extrabold text-[var(--spa-ink)]">{price}</span></div><button type="button" onClick={handleBooking} className="inline-flex min-h-10 items-center gap-1 text-xs font-extrabold text-[var(--spa-blue)] hover:text-[var(--spa-ink)]">Reservar <ArrowRight size={15} aria-hidden="true" /></button></div>
        </div>
    </article>;
}
