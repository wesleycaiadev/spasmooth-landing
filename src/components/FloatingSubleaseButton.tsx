"use client";

import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';

export default function FloatingSubleaseButton() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleClick = (e) => {
        if (isMobile && !isExpanded) {
            e.preventDefault();
            setIsExpanded(true);
            
            // Auto-ocultar após 5 segundos no mobile se o cliente não clicar de novo
            setTimeout(() => {
                setIsExpanded(false);
            }, 5000);
            return;
        }

        const message = encodeURIComponent("Olá! Gostaria de saber mais sobre a Sublocação de Sala (R$ 80,00).");
        // Substitua pelo número real de WhatsApp se necessário
        window.open(`https://wa.me/557991189140?text=${message}`, '_blank');
        if (isMobile) setIsExpanded(false);
    };

    return (
        <div className="fixed bottom-6 left-4 md:left-6 z-50 flex items-end">
            <button
                onMouseEnter={() => !isMobile && setIsExpanded(true)}
                onMouseLeave={() => !isMobile && setIsExpanded(false)}
                onClick={handleClick}
                className="group flex items-center gap-0 bg-white/90 backdrop-blur-md shadow-2xl shadow-slate-200/50 rounded-full p-2 md:p-3 border-2 border-slate-100 hover:border-rose-200 hover:bg-white transition-all duration-300 md:hover:-translate-y-1"
            >
                <div className={`bg-rose-50 p-2 md:p-2.5 rounded-full text-rose-500 transition-colors duration-300 ${!isMobile && 'group-hover:bg-rose-500 group-hover:text-white'} ${isExpanded && isMobile ? 'bg-rose-500 text-white' : ''}`}>
                    <Home size={20} className="md:w-6 md:h-6" />
                </div>
                
                <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out flex flex-col justify-center text-left
                        ${isExpanded ? 'max-w-[200px] ml-3 opacity-100 pr-3' : 'max-w-0 opacity-0 ml-0 pr-0'}`}
                >
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Para Profissionais</span>
                    <span className="text-xs md:text-sm font-serif text-slate-800 whitespace-nowrap leading-none">Sublocação de Sala</span>
                    <span className="text-rose-500 font-bold text-xs md:text-sm whitespace-nowrap mt-1 leading-none">R$ 80,00</span>
                </div>
            </button>
        </div>
    );
}
