"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, Menu, X } from 'lucide-react';
import BrandMark from './BrandMark';
import { useLocation } from './LocationProvider';

const navigation = [
    { href: '/#servicos', label: 'Tratamentos' },
    { href: '/#profissionais', label: 'Agendar' },
    { href: '/#faq', label: 'Dúvidas' },
    { href: '/#localizacao', label: 'Localização' },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [locationOpen, setLocationOpen] = useState(false);
    const { location, changeLocation } = useLocation();
    const selectLocation = (city) => { changeLocation(city); setLocationOpen(false); };

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--spa-line)] bg-white/95 shadow-[0_4px_20px_rgb(6_59_100_/_0.05)] backdrop-blur-xl">
            <div className="spa-shell flex h-[76px] items-center justify-between gap-4">
                <BrandMark />
                <nav aria-label="Navegação principal" className="hidden items-center gap-6 lg:flex">
                    {navigation.map((item) => <Link key={item.href} href={item.href} className="text-xs font-extrabold text-slate-600 transition-colors hover:text-[var(--spa-blue)]">{item.label}</Link>)}
                </nav>
                <div className="hidden items-center gap-3 md:flex">
                    <div className="relative">
                        <button type="button" onClick={() => setLocationOpen((open) => !open)} aria-expanded={locationOpen} className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--spa-line)] bg-white px-3 text-xs font-extrabold text-[var(--spa-ink)] transition hover:bg-[var(--spa-mist)]"><MapPin size={15} className="text-[var(--spa-blue)]" aria-hidden="true" />{location}<ChevronDown size={14} aria-hidden="true" /></button>
                        {locationOpen && <div className="absolute right-0 top-[calc(100%+8px)] w-40 overflow-hidden rounded-xl border border-[var(--spa-line)] bg-white p-1 shadow-xl">{['Aracaju', 'Maceió', 'Recife'].map((city) => <button type="button" key={city} onClick={() => selectLocation(city)} className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-bold ${city === location ? 'bg-[var(--spa-sky)] text-[var(--spa-ink)]' : 'text-slate-600 hover:bg-slate-50'}`}>{city}</button>)}</div>}
                    </div>
                    <Link href="/#profissionais" className="spa-button-primary text-xs">Agendar agora</Link>
                </div>
                <button type="button" aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={isMenuOpen} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--spa-line)] text-[var(--spa-ink)] md:hidden" onClick={() => setIsMenuOpen((open) => !open)}>{isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
            </div>
            {isMenuOpen && <div className="border-t border-[var(--spa-line)] bg-white px-4 py-4 md:hidden"><nav aria-label="Navegação móvel" className="spa-shell flex flex-col">{navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="border-b border-slate-100 py-4 text-sm font-extrabold text-[var(--spa-ink)]">{item.label}</Link>)}<div className="grid grid-cols-3 gap-2 py-4" aria-label="Escolha de unidade">{['Aracaju', 'Maceió', 'Recife'].map((city) => <button type="button" key={city} onClick={() => selectLocation(city)} className={`min-h-11 rounded-lg text-xs font-extrabold ${city === location ? 'bg-[var(--spa-ink)] text-white' : 'bg-[var(--spa-mist)] text-slate-600'}`}>{city}</button>)}</div><Link href="/#profissionais" onClick={() => setIsMenuOpen(false)} className="spa-button-primary mt-1 w-full">Agendar minha sessão</Link></nav></div>}
        </header>
    );
}
