"use client";

import { useState } from 'react';
import { Sparkles, Wind, Droplets, Flame, Hand, CircleDot, CheckCircle, Gem, Wine, Scissors, Feather, Asterisk, Target, Sunset, ShieldCheck, Stars } from 'lucide-react';

const iconMap = {
    Sparkles,
    Wind,
    Droplets,
    Flame,
    Hand,
    CircleDot,
    'check-circle': CheckCircle,
    Gem,
    Wine,
    Scissors,
    Feather,
    Asterisk,
    Target,
    Sunset,
    ShieldCheck,
    Stars
};

export default function ServiceBookingCard({ treatment }) {
    const Icon = iconMap[treatment.icon] || Sparkles;

    const handleBooking = () => {
        // Salva dados do serviço para o BookingWizard
        const serviceData = {
            id: treatment.id,
            name: treatment.name,
            defaultOption: treatment.durations[0]
        };
        sessionStorage.setItem('selected_service', JSON.stringify(serviceData));

        // Scroll até a seção de profissionais/agendamento
        const wizardSection = document.getElementById('profissionais');
        if (wizardSection) {
            wizardSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/#profissionais';
        }
    };

    const isPremiumBlack = treatment.featured && treatment.name.toLowerCase().includes('premium');
    const hasStages = treatment.stages && treatment.stages.length > 0;

    return (
        <div className={`${isPremiumBlack ? 'bg-gradient-to-br from-slate-900 to-black text-white border-2 border-yellow-500/50 shadow-yellow-500/20' : 'glass-card text-slate-700 ' + (treatment.featured ? 'border-2 border-cyan-300' : '')} p-8 rounded-[2rem] shadow-lg flex flex-col h-full relative overflow-hidden group`}>
            {isPremiumBlack && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
            )}

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className={`${isPremiumBlack ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-[#e2f6fc]'} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                        <Icon className={`w-8 h-8 ${isPremiumBlack ? 'text-yellow-400' : 'text-cyan-700'}`} />
                    </div>
                    <div className="text-right">
                        {treatment.durations.map((d, idx) => (
                            <div key={idx}>
                                <div className={`text-sm ${isPremiumBlack ? 'text-slate-300' : 'text-slate-400'}`}>{d.time}</div>
                                <div className={`font-bold ${isPremiumBlack ? 'text-yellow-400 text-lg tracking-wide' : 'text-slate-700'}`}>{d.price}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {isPremiumBlack && (
                    <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 w-max border border-yellow-500/20">
                        <Flame className="w-3 h-3" /> Exclusivo
                    </div>
                )}

                <div className="flex-grow flex flex-col">
                    <h3 className={`text-2xl font-bold mb-3 mt-4 ${isPremiumBlack ? 'text-white' : 'text-slate-700'}`}>{treatment.name}</h3>
                    <p className={`mb-5 text-sm ${isPremiumBlack ? 'text-slate-300' : 'text-slate-500'}`}>{treatment.description}</p>

                    {hasStages ? (
                        <div className={`${isPremiumBlack ? 'bg-slate-900/60 border-yellow-500/20' : 'bg-white/60 border-white/40'} rounded-2xl p-5 border flex-grow mb-6`}>
                            <p className={`text-sm font-bold mb-2 ${isPremiumBlack ? 'text-yellow-400' : 'text-slate-700'}`}>Etapas</p>
                            <ul className={`list-disc pl-5 text-sm space-y-2 ${isPremiumBlack ? 'text-slate-300' : 'text-slate-600'}`}>
                                {treatment.stages.map((stage, i) => (
                                    <li key={i}>{stage}</li>
                                ))}
                            </ul>
                            {treatment.note && <p className={`text-xs mt-4 ${isPremiumBlack ? 'text-yellow-500/70' : 'text-slate-500'}`}>{treatment.note}</p>}
                        </div>
                    ) : (
                        treatment.description && (
                            <div className={`${isPremiumBlack ? 'bg-slate-900/60 border-yellow-500/20' : 'bg-white/60 border-white/40'} rounded-2xl p-5 border flex-grow mb-6`}>
                                <p className={`text-sm ${isPremiumBlack ? 'text-slate-300' : 'text-slate-600'}`}>{treatment.description}</p>
                                {treatment.note && <p className={`text-xs mt-4 ${isPremiumBlack ? 'text-yellow-500/70' : 'text-slate-500'}`}>{treatment.note}</p>}
                            </div>
                        )
                    )}
                </div>

                <div className="mt-auto">
                    <button
                        type="button"
                        onClick={handleBooking}
                        className={`inline-block text-center px-6 py-4 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 w-full ${isPremiumBlack ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 shadow-xl shadow-yellow-500/20' : 'bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg shadow-cyan-200/50'}`}
                    >
                        Agendar Experiência
                    </button>
                </div>
            </div>
        </div>
    );
}
