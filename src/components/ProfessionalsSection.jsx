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
        <section id="profissionais" className="py-24 bg-[#FAF9F6] relative">
            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 animate-on-scroll">
                    <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase border border-rose-100 mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Nossas Terapeutas</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif text-slate-800 mb-6 leading-tight">
                        Conheça quem vai <span className="text-rose-700 italic">cuidar</span> de você
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Profissionais exclusivas e dedicadas a proporcionar as melhores vivências. Clique para conhecer o perfil e agendar.
                    </p>
                </div>

                {/* Location Tabs */}
                <div className="flex bg-slate-50/80 p-1.5 rounded-xl mb-12 shadow-inner max-w-md mx-auto relative z-10 border border-slate-100">
                    {['Aracaju', 'Maceió', 'Recife'].map((city) => (
                        <button
                            key={city}
                            onClick={() => changeLocation(city)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                                location === city
                                    ? 'bg-white text-rose-700 shadow-md transform scale-105'
                                    : 'text-slate-500 hover:text-rose-600 hover:bg-white/50'
                            }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {loading ? (
                        <div className="col-span-full py-16 text-center text-rose-300 animate-pulse font-medium">
                            Buscando especialistas em {location}...
                        </div>
                    ) : pros.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-slate-500 font-medium">
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
