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
        <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col h-full relative overflow-hidden group transition-all duration-300 hover:-translate-y-1
            ${isPremium || isMagic 
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/30 border border-slate-700 hover:border-slate-500' 
                : 'bg-white text-slate-800 shadow-sm hover:shadow-md border border-slate-100 hover:border-cyan-100'
            }`}
        >
            {isMagic && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
            )}
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center
                        ${isMagic ? 'bg-yellow-500/20 text-yellow-400' : 
                          isPremium ? 'bg-white/10 text-white' : 'bg-cyan-50 text-cyan-600'}`}
                    >
                        {isMagic ? <Gem size={22} /> : <Icon size={22} />}
                    </div>
                    
                    <div className="text-right">
                        <div className={`text-[10px] font-medium uppercase tracking-wider mb-0.5 ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>{timeStr}</div>
                        <div className={`text-base md:text-lg font-light tracking-wide ${isMagic ? 'text-yellow-400' : isPremium ? 'text-white' : 'text-slate-700'}`}>
                            {priceStr}
                        </div>
                    </div>
                </div>

                <div className="flex-grow flex flex-col relative z-10">
                    <h3 className={`text-base md:text-lg font-serif mb-2 ${isPremium ? 'text-white' : 'text-slate-800'}`}>
                        {treatment.name}
                    </h3>
                    
                    <p className={`text-xs md:text-sm leading-relaxed mb-4 font-light ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>
                        {treatment.description}
                    </p>
                </div>

                <div className="mt-auto pt-4">
                    <button
                        type="button"
                        onClick={handleBooking}
                        className={`w-full py-3 px-5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200 active:scale-95
                            ${isMagic 
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-yellow-950 shadow-md shadow-yellow-500/20' 
                                : isPremium 
                                    ? 'bg-white hover:bg-slate-100 text-slate-900 shadow-md shadow-white/5' 
                                    : 'bg-slate-900 hover:bg-cyan-800 text-white shadow-md shadow-slate-900/10'
                            }`}
                    >
                        Reservar Momento
                    </button>
                </div>
            </div>
        </div>
    );
}
