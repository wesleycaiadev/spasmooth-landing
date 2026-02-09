import { TREATMENTS } from '@/lib/data';
import { Sparkles, Wind, Droplets, Flame, Hand, CircleDot, CheckCircle } from 'lucide-react';

const iconMap = {
    Sparkles,
    Wind,
    Droplets,
    Flame,
    Hand,
    CircleDot,
    'check-circle': CheckCircle
};

export default function Services() {
    return (
        <section id="servicos" className="py-24 bg-[#f8fafc] relative overflow-hidden">
            <div className="absolute top-20 left-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-20 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-12 max-w-2xl mx-auto px-4">
                    <span className="text-cyan-600 font-semibold tracking-wider uppercase text-sm mb-2 block">Tratamentos</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Escolha sua experiência</h2>
                    <div className="w-24 h-1 bg-cyan-200 mx-auto rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="servicos-grid">
                    {TREATMENTS.map((treatment) => {
                        const Icon = iconMap[treatment.icon] || Sparkles;
                        return (
                            <div key={treatment.id} className={`glass-card p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 flex flex-col h-full ${treatment.featured ? 'border-2 border-cyan-300' : ''}`}>
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div className="bg-[#e2f6fc] w-16 h-16 rounded-2xl flex items-center justify-center">
                                        <Icon className="w-8 h-8 text-cyan-600" />
                                    </div>
                                    <div className="text-right">
                                        {treatment.durations.map((d, idx) => (
                                            <div key={idx}>
                                                <div className="text-sm text-slate-400">{d.time}</div>
                                                <div className="font-bold text-slate-700">{d.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700 mb-3">{treatment.name}</h3>
                                <p className="text-slate-500 mb-5 text-sm">{treatment.description}</p>

                                <div className="bg-white/60 rounded-2xl p-5 border border-white/40">
                                    <p className="text-sm font-bold text-slate-700 mb-2">Etapas</p>
                                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                                        {treatment.stages.map((stage, i) => (
                                            <li key={i}>{stage}</li>
                                        ))}
                                    </ul>
                                    {treatment.note && <p className="text-xs text-slate-500 mt-4">{treatment.note}</p>}
                                </div>

                                <a href="#agendar" className="mt-auto inline-block text-center px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-200/50 w-full animate-fadeIn animation-delay-4000">
                                    Agendar
                                </a>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 text-center text-xs text-slate-400">
                    Informações e valores podem ser ajustados conforme disponibilidade e confirmação via WhatsApp.
                </div>
            </div>
        </section>
    );
}
