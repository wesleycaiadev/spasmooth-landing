"use client";

import { useState } from 'react';
import { Layers, Sparkles, Palette, Scissors, Flame } from 'lucide-react';
import ServiceBookingCard from './booking/ServiceBookingCard';

const CATEGORY_CONFIG = {
    combo: { label: 'Combos de Massagem', subtitle: 'Serviços combinados para alívio rápido de tensões musculares.', Icon: Layers, iconBg: 'bg-cyan-50', iconColor: 'text-cyan-700', accentColor: 'border-cyan-200' },
    day_spa: { label: 'Pacotes Day Spa', subtitle: 'Experiências imersivas de várias horas para cuidado completo.', Icon: Sparkles, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', accentColor: 'border-amber-200' },
    estetica: { label: 'Estética e Cuidados Avulsos', subtitle: 'Tratamentos diretos e essenciais de beleza e cuidado.', Icon: Palette, iconBg: 'bg-rose-50', iconColor: 'text-rose-600', accentColor: 'border-rose-200' },
    depilacao: { label: 'Depilação Suave', subtitle: 'Pele lisa e macia com o máximo de conforto.', Icon: Scissors, iconBg: 'bg-sky-50', iconColor: 'text-sky-700', accentColor: 'border-sky-200' },
    tantrica: { label: 'Terapias Sensoriais e Tântricas', subtitle: 'Experiências disponíveis conforme o catálogo atual.', Icon: Flame, iconBg: 'bg-orange-50', iconColor: 'text-orange-600', accentColor: 'border-orange-200' },
};

const CATEGORY_ORDER = ['combo', 'day_spa', 'estetica', 'depilacao', 'tantrica'];

export default function ServiceAccordion({ groupedServices, categoryOrder = [] }) {
    const orderToUse = categoryOrder.length > 0 ? categoryOrder : CATEGORY_ORDER;
    const [activeCategory, setActiveCategory] = useState('all');
    const visibleCategories = activeCategory === 'all' ? orderToUse : [activeCategory];

    return <div>
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar" role="tablist" aria-label="Categorias de tratamento">
            <button type="button" role="tab" aria-selected={activeCategory === 'all'} onClick={() => setActiveCategory('all')} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-extrabold transition ${activeCategory === 'all' ? 'bg-[var(--spa-ink)] text-white' : 'border border-[var(--spa-line)] bg-white text-slate-600 hover:bg-[var(--spa-sky)]'}`}>Todos</button>
            {orderToUse.map((key) => {
                const config = CATEGORY_CONFIG[key];
                if (!config || !groupedServices[key]?.length) return null;
                return <button type="button" role="tab" key={key} aria-selected={activeCategory === key} onClick={() => setActiveCategory(key)} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-extrabold transition ${activeCategory === key ? 'bg-[var(--spa-ink)] text-white' : 'border border-[var(--spa-line)] bg-white text-slate-600 hover:bg-[var(--spa-sky)]'}`}>{config.label.replace(' de Massagem', '').replace(' e Cuidados Avulsos', '')}</button>;
            })}
        </div>
        <div className="space-y-10 md:space-y-14">
            {visibleCategories.map((catKey) => {
                const services = groupedServices[catKey];
                const config = CATEGORY_CONFIG[catKey];
                if (!services?.length || !config) return null;
                const { Icon } = config;
                return <section key={catKey} aria-label={config.label}>
                    <div className="mb-5 flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${config.iconBg} ${config.iconColor} ${config.accentColor}`}><Icon size={22} aria-hidden="true" /></div>
                        <div><h3 className="spa-display text-2xl text-[var(--spa-ink)]">{config.label}</h3><p className="text-sm text-slate-500">{config.subtitle}</p></div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{services.map((treatment) => <ServiceBookingCard key={treatment.id} treatment={treatment} />)}</div>
                </section>;
            })}
        </div>
    </div>;
}
