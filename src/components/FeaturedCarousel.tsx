// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Gem, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FeaturedCarousel({ services = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    useEffect(() => {
        if (isHovered || services.length <= 1) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % services.length);
        }, 5000);
        
        return () => clearInterval(timer);
    }, [isHovered, services.length]);

    if (!services || services.length === 0) return null;

    const handleBooking = (service) => {
        const serviceData = {
            id: service.id,
            name: service.name,
            defaultOption: service.durations ? service.durations[0] : { time: 'Experiência', price: service.price }
        };
        sessionStorage.setItem('selected_service', JSON.stringify(serviceData));
        
        const wizardSection = document.getElementById('profissionais');
        if (wizardSection) {
            wizardSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/#profissionais';
        }
    };

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % services.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);

    const service = services[currentIndex];
    const isMagic = service.name.toLowerCase().includes('magic');
    const isTantrica = service.category === 'tantrica';

    return (
        <div 
            className="w-full relative py-8 px-4 md:py-12 md:px-10 overflow-hidden bg-slate-900 text-white rounded-2xl md:rounded-[3rem] my-6 md:my-12 shadow-xl shadow-slate-900/30 border border-slate-800"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-cyan-900 rounded-full mix-blend-screen filter blur-[120px] opacity-40 pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-yellow-900 rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none"></div>

            <div className="text-center mb-10 relative z-10 max-w-2xl mx-auto">
                <span className="text-yellow-500 font-medium tracking-widest uppercase text-xs mb-3 block">Assinatura SpaSmooth</span>
                <h2 className="text-xl md:text-4xl font-serif mb-3">Nossas Experiências Memoráveis</h2>
                <p className="text-slate-400 text-sm">Descubra os momentos de bem-estar mais cobiçados do nosso spa.</p>
            </div>

            <div className="relative max-w-4xl mx-auto z-10">
                {services.length > 1 && (
                    <>
                        <button 
                            onClick={prevSlide}
                            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full items-center justify-center border border-white/10 transition-all z-20 text-white/70 hover:text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full items-center justify-center border border-white/10 transition-all z-20 text-white/70 hover:text-white"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                <div className="relative min-h-[400px] md:min-h-[450px] w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className={`absolute inset-0 w-full h-full p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] flex flex-col md:flex-row gap-4 md:gap-8 justify-between items-center
                                ${isMagic 
                                    ? 'bg-gradient-to-br from-yellow-900/40 to-black border-2 border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.15)]' 
                                    : 'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50'
                                }`}
                        >
                            <div className="flex-1 w-full text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
                                    <div className={`p-4 rounded-2xl inline-flex ${isMagic ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                        {isMagic ? <Gem size={32} /> : isTantrica ? <Flame size={32} /> : <Sparkles size={32} />}
                                    </div>
                                    <div className="flex flex-col items-center md:items-start justify-center">
                                        <h3 className="text-lg md:text-2xl font-serif font-bold mb-1">{service.name}</h3>
                                        <div className="flex gap-2">
                                            {isMagic && (
                                                <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                                    Exclusivo
                                                </div>
                                            )}
                                            {isTantrica && !isMagic && (
                                                <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                                    Vivência VIP
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <p className={`text-xs md:text-base leading-relaxed mb-4 md:mb-6 max-w-xl font-light ${isMagic ? 'text-yellow-100/70' : 'text-slate-400'}`}>
                                    {service.description}
                                </p>
                            </div>

                            <div className="w-full md:w-auto flex flex-col items-center md:items-end md:min-w-[320px]">
                                <div className="text-center md:text-right mb-6 md:mb-10">
                                    <div className="text-slate-500 text-xs md:text-sm uppercase font-medium tracking-widest mb-2">Duração & Valor</div>
                                    <div className={`text-2xl md:text-4xl font-light tracking-wide ${isMagic ? 'text-yellow-400' : 'text-white'}`}>
                                        R$ {Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleBooking(service)}
                                    className={`w-full py-3 md:py-4 px-6 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase transition-all duration-200 active:scale-95 hover:-translate-y-0.5
                                        ${isMagic 
                                            ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-yellow-950 shadow-xl shadow-yellow-500/30' 
                                            : 'bg-white hover:bg-cyan-50 text-slate-900 shadow-xl shadow-white/10'
                                        }`}
                                >
                                    Reservar Momento
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {services.length > 1 && (
                    <div className="flex justify-center gap-3 mt-8">
                        {services.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    idx === currentIndex 
                                        ? `w-10 ${isMagic ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-cyan-400'}` 
                                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                                }`}
                                aria-label={`Ir para o slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

