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
                <div className="flex flex-col items-center leading-none select-none cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                    <div className="relative mb-1">
                        <svg width="40" height="30" viewBox="0 0 100 80" fill="none" stroke="#bddee7" strokeWidth="3">
                            <path d="M50 10 C30 30, 10 50, 10 80 H90 C90 50, 70 30, 50 10" />
                            <path d="M50 10 C40 40, 30 60, 30 80" strokeWidth="2" />
                            <path d="M50 10 C60 40, 70 60, 70 80" strokeWidth="2" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-light text-slate-500 tracking-wide">
                        Spa<span className="font-bold text-slate-600">SmooTh</span>
                    </h1>
                    <span className="text-xs text-cyan-400 tracking-[0.2em] uppercase mt-1">Massoterapia</span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-slate-600 font-semibold">
                    <a href="#servicos" className="hover:text-cyan-500 transition-colors">Tratamentos</a>
                    <a href="#agendar" className="hover:text-cyan-500 transition-colors">Agendar</a>
                    <a href="#depoimentos" className="hover:text-cyan-500 transition-colors">Depoimentos</a>
                    <a href="#faq" className="hover:text-cyan-500 transition-colors">Dúvidas</a>
                    <a href="#agendar" className="px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-md bg-orange-400 hover:bg-orange-500 text-white shadow-orange-200">
                        Agendar Agora
                    </a>
                </nav>

                {/* Mobile Toggle */}
                <button id="menu-btn" className="md:hidden text-slate-600" onClick={toggleMenu}>
                    <Menu className="w-7 h-7" />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div id="mobile-menu" className="md:hidden bg-white w-full border-b border-slate-100 shadow-lg py-6 px-6 flex flex-col gap-4 absolute top-full left-0">
                    <a href="#servicos" className="mobile-link text-lg py-2 border-b border-slate-50" onClick={closeMenu}>Tratamentos</a>
                    <a href="#agendar" className="mobile-link text-lg py-2 border-b border-slate-50" onClick={closeMenu}>Agendar</a>
                    <a href="#depoimentos" className="mobile-link text-lg py-2 border-b border-slate-50" onClick={closeMenu}>Depoimentos</a>
                    <a href="#agendar" className="w-full mt-2 px-8 py-3 rounded-full font-bold bg-orange-400 text-white text-center shadow-md" onClick={closeMenu}>
                        Agendar Sessão
                    </a>
                </div>
            )}
        </header>
    );
}
