"use client";

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLocation } from '@/components/LocationProvider';
import { getActiveProfessionals } from '@/services/booking';
import { normalizeProfessional } from '@/lib/professionals';
import ProfessionalCard from './ProfessionalCard';
import ProfessionalModal from './ProfessionalModal';

export default function ProfessionalsSection() {
    const { location, changeLocation } = useLocation();
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPro, setSelectedPro] = useState(null);

    useEffect(() => {
        async function fetchProfessionals() {
            setLoading(true);
            const result = await getActiveProfessionals(location);

            if (result.success && result.data) {
                setPros(result.data.map(normalizeProfessional));
            } else {
                setPros([]);
            }
            setLoading(false);
        }

        fetchProfessionals();
    }, [location]);

    return (
        <section id="profissionais" className="py-12 md:py-24 bg-[#FAF9F6] relative">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-8 md:mb-16 animate-on-scroll">
                    <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-rose-100 mb-4">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Nossas Terapeutas</span>
                    </div>
                    <h2 className="text-xl md:text-4xl font-serif text-slate-800 mb-4 leading-tight">
                        Conheça quem vai <span className="text-rose-700 italic">cuidar</span> de você
                    </h2>
                    <p className="text-slate-500 text-sm md:text-base font-light">
                        Profissionais exclusivas e dedicadas a proporcionar as melhores vivências. Toque para conhecer o perfil e agendar.
                    </p>
                </div>

                {/* Location Tabs */}
                <div className="flex bg-slate-50/80 p-1 rounded-xl mb-8 md:mb-12 shadow-inner max-w-sm mx-auto relative z-10 border border-slate-100">
                    {['Aracaju', 'Maceió', 'Recife'].map((city) => (
                        <button
                            key={city}
                            onClick={() => changeLocation(city)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 ${
                                location === city
                                    ? 'bg-white text-rose-700 shadow-md'
                                    : 'text-slate-500 hover:text-rose-600 hover:bg-white/50'
                            }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>

                {/* Carousel (mobile) / Grid (desktop) */}
                <div className="
                    flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 no-scrollbar
                    md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible
                    max-w-5xl md:mx-auto
                ">
                    {loading ? (
                        <div className="min-w-full py-12 text-center text-rose-300 animate-pulse font-medium text-sm">
                            Buscando especialistas em {location}...
                        </div>
                    ) : pros.length === 0 ? (
                        <div className="min-w-full py-12 text-center text-slate-500 font-medium text-sm">
                            Nenhuma terapeuta disponível em {location} no momento.
                        </div>
                    ) : (
                        pros.map((pro, index) => (
                            <ProfessionalCard
                                key={pro.id}
                                pro={pro}
                                index={index}
                                onClick={() => setSelectedPro(pro)}
                            />
                        ))
                    )}
                </div>

                {/* Swipe hint (mobile only) */}
                {!loading && pros.length > 1 && (
                    <p className="md:hidden text-center text-[10px] text-slate-400 font-medium mt-2 tracking-wide">
                        ← Deslize para ver mais →
                    </p>
                )}
            </div>

            {/* Modal */}
            {selectedPro && (
                <ProfessionalModal
                    pro={selectedPro}
                    onClose={() => setSelectedPro(null)}
                />
            )}
        </section>
    );
}
