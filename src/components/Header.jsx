"use client";
import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <button aria-label="Voltar ao início" className="flex flex-col items-center leading-none select-none cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                    <div className="relative mb-1">
                        <svg aria-hidden="true" width="40" height="30" viewBox="0 0 100 80" fill="none" stroke="#bddee7" strokeWidth="3">
                            <path d="M50 10 C30 30, 10 50, 10 80 H90 C90 50, 70 30, 50 10" />
                            <path d="M50 10 C40 40, 30 60, 30 80" strokeWidth="2" />
                            <path d="M50 10 C60 40, 70 60, 70 80" strokeWidth="2" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-light text-slate-500 tracking-wide">
                        Spa<span className="font-bold text-slate-700">SmooTh</span>
                    </h1>
                    <span className="text-xs text-cyan-700 tracking-[0.2em] uppercase mt-1">Massoterapia</span>
                </button>

                {/* Desktop Nav */}
                <nav aria-label="Navegação Principal" className="hidden md:flex items-center gap-8 text-slate-600 font-semibold">
                    <a href="#servicos" title="Ver Tratamentos" className="hover:text-cyan-700 transition-colors">Tratamentos</a>
                    <a href="#agendar" title="Agendar Sessão" className="hover:text-cyan-700 transition-colors">Agendar</a>
                    <a href="#depoimentos" title="Ler Depoimentos" className="hover:text-cyan-700 transition-colors">Depoimentos</a>
                    <a href="#faq" title="Dúvidas Frequentes" className="hover:text-cyan-700 transition-colors">Dúvidas</a>
                    <a href="#localizacao" title="Nossa Localização" className="hover:text-cyan-700 transition-colors">Localização</a>
                    <a href="#agendar" title="Agendar Sessão Agora" className="px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-md bg-orange-400 hover:bg-orange-500 text-white shadow-orange-200">
                        Agendar Agora
                    </a>
                </nav>

                {/* Mobile Toggle */}
                <button aria-label="Abrir Menu" id="menu-btn" className="md:hidden p-2 text-slate-600" onClick={toggleMenu}>
                    <Menu className="w-7 h-7" aria-hidden="true" />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div id="mobile-menu" role="menu" className="md:hidden bg-white w-full border-b border-slate-100 shadow-lg py-6 px-6 flex flex-col gap-4 absolute top-full left-0">
                    <a href="#servicos" role="menuitem" className="mobile-link text-lg py-4 border-b border-slate-50" onClick={closeMenu}>Tratamentos</a>
                    <a href="#agendar" role="menuitem" className="mobile-link text-lg py-4 border-b border-slate-50" onClick={closeMenu}>Agendar</a>
                    <a href="#depoimentos" role="menuitem" className="mobile-link text-lg py-4 border-b border-slate-50" onClick={closeMenu}>Depoimentos</a>
                    <a href="#localizacao" role="menuitem" className="mobile-link text-lg py-4 border-b border-slate-50" onClick={closeMenu}>Localização</a>
                    <a href="#agendar" role="menuitem" className="w-full mt-2 px-8 py-4 rounded-full font-bold bg-orange-400 text-white text-center shadow-md" onClick={closeMenu}>
                        Agendar Sessão
                    </a>
                </div>
            )}
        </header>
    );
}
