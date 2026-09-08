"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, Menu, X } from 'lucide-react';
import BrandMark from './BrandMark';
import { useLocation } from './LocationProvider';

const navigation = [
    { href: '/#servicos', label: 'Tratamentos' },
    { href: '/#profissionais', label: 'Agendar' },
    { href: '/#depoimentos', label: 'Depoimentos' },
    { href: '/#faq', label: 'Dúvidas' },
    { href: '/#localizacao', label: 'Localização' },
];

const units = [
    { city: 'Aracaju', state: 'Sergipe' },
    { city: 'Maceió', state: 'Alagoas' },
    { city: 'Recife', state: 'Pernambuco' },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [locationOpen, setLocationOpen] = useState(false);
    const { location, changeLocation } = useLocation();
    const selectLocation = (city) => { changeLocation(city); setLocationOpen(false); };

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--spa-line)] bg-white/95 backdrop-blur-xl">
            <div className="spa-shell flex h-[70px] items-center justify-between gap-4">
                <BrandMark />
                <nav aria-label="Navegação principal" className="hidden items-center gap-5 xl:flex">
                    {navigation.map((item) => <Link key={item.href} href={item.href} className="text-[11px] font-extrabold text-slate-600 transition-colors hover:text-[var(--spa-blue)]">{item.label}</Link>)}
                </nav>
                <div className="hidden items-center gap-3 md:flex">
                    <div className="relative">
                        <button type="button" onClick={() => setLocationOpen((open) => !open)} aria-expanded={locationOpen} className="flex h-11 items-center gap-2 rounded-xl border border-[var(--spa-line)] bg-white px-3 text-xs font-extrabold text-[var(--spa-ink)] transition hover:bg-[var(--spa-mist)]"><MapPin size={15} className="text-[var(--spa-blue)]" aria-hidden="true" />{location}<ChevronDown size={14} aria-hidden="true" /></button>
                        {locationOpen && <div className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-2xl border border-[var(--spa-line)] bg-white p-2 shadow-lg"><p className="px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">Selecione sua unidade</p>{units.map(({ city, state }) => <button type="button" key={city} onClick={() => selectLocation(city)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${city === location ? 'bg-[var(--spa-sky)] text-[var(--spa-ink)]' : 'text-slate-600 hover:bg-[var(--spa-mist)]'}`}><MapPin size={17} className="shrink-0 text-[var(--spa-blue)]" aria-hidden="true" /><span><span className="block text-xs font-extrabold">{city}</span><span className="mt-0.5 block text-[11px] text-slate-500">{state}</span></span></button>)}</div>}
                    </div>
                    <Link href="/#profissionais" className="spa-button-primary text-xs">Agendar agora</Link>
                </div>
                <button type="button" aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={isMenuOpen} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--spa-line)] text-[var(--spa-ink)] md:hidden" onClick={() => setIsMenuOpen((open) => !open)}>{isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
            </div>
            {isMenuOpen && <div className="border-t border-[var(--spa-line)] bg-white px-4 py-4 md:hidden"><nav aria-label="Navegação móvel" className="spa-shell flex flex-col">{navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="border-b border-slate-100 py-4 text-sm font-extrabold text-[var(--spa-ink)]">{item.label}</Link>)}<Link href="/#profissionais" onClick={() => setIsMenuOpen(false)} className="border-b border-slate-100 py-4 text-sm font-extrabold text-[var(--spa-ink)]">Terapeutas</Link><Link href="/unidades" onClick={() => setIsMenuOpen(false)} className="border-b border-slate-100 py-4 text-sm font-extrabold text-[var(--spa-ink)]">Unidades</Link><div className="grid grid-cols-3 gap-2 py-4" aria-label="Escolha de unidade">{units.map(({ city }) => <button type="button" key={city} onClick={() => selectLocation(city)} className={`min-h-11 rounded-xl text-xs font-extrabold ${city === location ? 'bg-[var(--spa-ink)] text-white' : 'bg-[var(--spa-mist)] text-slate-600'}`}>{city}</button>)}</div><Link href="/#profissionais" onClick={() => setIsMenuOpen(false)} className="spa-button-primary mt-1 w-full rounded-xl">Agendar minha sessão</Link></nav></div>}
        </header>
    );
}
