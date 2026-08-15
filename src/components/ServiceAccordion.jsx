"use client";

import { useState } from 'react';
import { ChevronDown, Layers, Sparkles, Palette, Scissors, Flame } from 'lucide-react';
import ServiceBookingCard from './booking/ServiceBookingCard';

const CATEGORY_CONFIG = {
    combo: {
        label: 'Combos de Massagem',
        subtitle: 'Serviços combinados para alívio rápido de tensões musculares.',
        Icon: Layers,
        iconBg: 'bg-cyan-50',
        iconColor: 'text-cyan-600',
        accentColor: 'border-cyan-200',
    },
    day_spa: {
        label: 'Pacotes Day Spa',
        subtitle: 'Experiências imersivas de várias horas para cuidado completo.',
        Icon: Sparkles,
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-500',
        accentColor: 'border-yellow-200',
    },
    estetica: {
        label: 'Estética e Cuidados Avulsos',
        subtitle: 'Tratamentos diretos e essenciais de beleza e cuidado.',
        Icon: Palette,
        iconBg: 'bg-pink-50',
        iconColor: 'text-pink-500',
        accentColor: 'border-pink-200',
    },
    depilacao: {
        label: 'Depilação Suave',
        subtitle: 'Pele lisa e macia com o máximo de conforto.',
        Icon: Scissors,
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
        accentColor: 'border-rose-200',
    },
    tantrica: {
        label: 'Terapias Sensoriais e Tântricas',
        subtitle: 'Desperte sua energia vital e reconecte-se com seu corpo.',
        Icon: Flame,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        accentColor: 'border-red-200',
    },
};

const CATEGORY_ORDER = ['combo', 'day_spa', 'estetica', 'depilacao', 'tantrica'];
const PREMIUM_CATEGORIES = ['day_spa', 'tantrica'];

export default function ServiceAccordion({ groupedServices, categoryOrder = [] }) {
    const orderToUse = categoryOrder.length > 0 ? categoryOrder : CATEGORY_ORDER;
    const [openCategory, setOpenCategory] = useState(orderToUse[0]);

    const toggleCategory = (cat) => {
        setOpenCategory((prev) => (prev === cat ? null : cat));
    };

    return (
        <div className="space-y-3 md:space-y-12">
            {orderToUse.map((catKey) => {
                const services = groupedServices[catKey];
                if (!services || services.length === 0) return null;

                const config = CATEGORY_CONFIG[catKey];
                const { Icon } = config;
                const isOpen = openCategory === catKey;
                const isPremium = PREMIUM_CATEGORIES.includes(catKey);

                return (
                    <div key={catKey}>
                        {/* ── Mobile: Accordion Card ── */}
                        <button
                            onClick={() => toggleCategory(catKey)}
                            className={`
                                md:hidden w-full flex items-center gap-3 p-4 rounded-2xl border bg-white shadow-sm
                                transition-all duration-200 active:scale-[0.97]
                                ${isOpen ? `${config.accentColor} shadow-md` : 'border-slate-100'}
                            `}
                            aria-expanded={isOpen}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg} ${config.iconColor}`}>
                                <Icon size={20} />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h3 className="text-sm font-bold text-slate-800 leading-tight">{config.label}</h3>
                                <p className="text-[11px] text-slate-400 font-light truncate">{config.subtitle}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 rounded-full px-2 py-0.5">
                                    {services.length}
                                </span>
                                <ChevronDown
                                    size={18}
                                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </button>

                        {/* ── Mobile: Collapsible Content ── */}
                        <div
                            className={`md:hidden accordion-content ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                            style={{ maxHeight: isOpen ? `${services.length * 280}px` : '0px' }}
                        >
                            <div className="grid grid-cols-1 gap-3 pt-3">
                                {services.map((treatment) => (
                                    <ServiceBookingCard key={treatment.id} treatment={treatment} isPremium={isPremium} />
                                ))}
                            </div>
                        </div>

                        {/* ── Desktop: Always Open with Header ── */}
                        <div className="hidden md:block">
                            <div className="mb-6 flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.iconBg} ${config.iconColor} shadow-sm border ${config.accentColor}`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{config.label}</h3>
                                    <p className="text-sm text-slate-500 font-light">{config.subtitle}</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {services.map((treatment) => (
                                    <ServiceBookingCard key={treatment.id} treatment={treatment} isPremium={isPremium} />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
