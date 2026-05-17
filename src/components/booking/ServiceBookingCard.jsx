"use client";

import { Sparkles, Layers, Palette, Flame, Scissors, Gem, Check } from 'lucide-react';

const iconMap = {
    combo: Layers,
    day_spa: Sparkles,
    estetica: Palette,
    tantrica: Flame,
    depilacao: Scissors
};

export default function ServiceBookingCard({ treatment, isPremium = false }) {
    const Icon = iconMap[treatment.category] || Sparkles;
    
    // Tratamento híbrido para suportar dados antigos e novos
    const priceStr = treatment.price 
        ? `R$ ${Number(treatment.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
        : (treatment.durations && treatment.durations[0] ? treatment.durations[0].price : 'Sob Consulta');
        
    const timeStr = treatment.duration_minutes 
        ? `${treatment.duration_minutes} min` 
        : (treatment.durations && treatment.durations[0] ? treatment.durations[0].time : '');

    const handleBooking = () => {
        const serviceData = {
            id: treatment.id,
            name: treatment.name,
            defaultOption: { time: timeStr, price: priceStr }
        };
        sessionStorage.setItem('selected_service', JSON.stringify(serviceData));

        const wizardSection = document.getElementById('profissionais');
        if (wizardSection) {
            wizardSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/#profissionais';
        }
    };

    const isMagic = treatment.name.toLowerCase().includes('magic');

    return (
        <div className={`p-8 rounded-[2.5rem] flex flex-col h-full relative overflow-hidden group transition-all duration-500 hover:-translate-y-2
            ${isPremium || isMagic 
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl shadow-slate-900/40 border-2 border-slate-700 hover:border-slate-500' 
                : 'bg-white text-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border-2 border-slate-100 hover:border-cyan-100 hover:shadow-[0_20px_50px_-10px_rgba(6,182,212,0.15)]'
            }`}
        >
            {isMagic && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
            )}
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                        ${isMagic ? 'bg-yellow-500/20 text-yellow-400' : 
                          isPremium ? 'bg-white/10 text-white' : 'bg-cyan-50 text-cyan-600'}`}
                    >
                        {isMagic ? <Gem size={28} /> : <Icon size={28} />}
                    </div>
                    
                    <div className="text-right">
                        <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>{timeStr}</div>
                        <div className={`text-xl font-light tracking-wide ${isMagic ? 'text-yellow-400' : isPremium ? 'text-white' : 'text-slate-700'}`}>
                            {priceStr}
                        </div>
                    </div>
                </div>

                <div className="flex-grow flex flex-col relative z-10">
                    <h3 className={`text-2xl font-serif mb-4 ${isPremium ? 'text-white' : 'text-slate-800'}`}>
                        {treatment.name}
                    </h3>
                    
                    <p className={`text-sm leading-relaxed mb-6 ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>
                        {treatment.description}
                    </p>
                </div>

                <div className="mt-auto pt-6">
                    <button
                        type="button"
                        onClick={handleBooking}
                        className={`w-full py-4 px-6 rounded-2xl text-sm font-bold tracking-widest uppercase transition-all duration-300 transform group-hover:scale-[1.02]
                            ${isMagic 
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-yellow-950 shadow-lg shadow-yellow-500/20' 
                                : isPremium 
                                    ? 'bg-white hover:bg-slate-100 text-slate-900 shadow-lg shadow-white/5' 
                                    : 'bg-slate-900 hover:bg-cyan-800 text-white shadow-lg shadow-slate-900/10'
                            }`}
                    >
                        Reservar Momento
                    </button>
                </div>
            </div>
        </div>
    );
}
