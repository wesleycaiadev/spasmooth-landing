"use client";

import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
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
        <section id="profissionais" className="relative bg-[var(--spa-cream)] py-16 md:py-24">
            <div className="spa-shell relative z-10">
                <div className="mb-8 grid gap-4 md:mb-12 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="max-w-2xl"><p className="spa-eyebrow mb-3 flex items-center gap-2"><Sparkles size={15} aria-hidden="true" /> Nossa equipe</p><h2 className="spa-display text-4xl leading-tight text-[var(--spa-ink)] md:text-5xl">Terapeutas que cuidam de você.</h2><p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">Conheça os perfis disponíveis na unidade escolhida e selecione quem conduzirá seu atendimento.</p></div>
                    <a href="#profissionais" className="hidden items-center gap-2 text-sm font-extrabold text-[var(--spa-blue)] hover:text-[var(--spa-ink)] md:inline-flex">Escolha uma terapeuta para agendar <ArrowRight size={16} aria-hidden="true" /></a>
                </div>

                <div className="mb-8 flex max-w-sm rounded-full border border-[var(--spa-line)] bg-white p-1 shadow-sm md:mb-10">
                    {['Aracaju', 'Maceió', 'Recife'].map((city) => (
                        <button
                            key={city}
                            onClick={() => changeLocation(city)}
                            className={`min-h-10 flex-1 rounded-full text-xs font-extrabold transition-all duration-200 ${
                                location === city
                                    ? 'bg-[var(--spa-ink)] text-white shadow-md'
                                    : 'text-slate-500 hover:bg-[var(--spa-mist)] hover:text-[var(--spa-ink)]'
                            }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>

                {/* Carousel (mobile) / Grid (desktop) */}
                <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
                    {loading ? (
                        <div className="min-w-full py-12 text-center text-[var(--spa-blue)] animate-pulse font-medium text-sm">
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
                    <p className="md:hidden mt-2 text-center text-[10px] font-medium tracking-wide text-slate-400">
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
