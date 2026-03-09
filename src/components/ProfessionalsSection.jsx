"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import BookingWizard from './booking/BookingWizard';
import { useLocation } from '@/components/LocationProvider';
import { PROFESSIONALS as oldProsFallback } from '@/lib/data';

export default function ProfessionalsSection() {
    const { location, changeLocation } = useLocation();
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPro, setSelectedPro] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        async function fetchProfessionals() {
            setLoading(true);
            const { data, error } = await supabase
                .from('professionals')
                .select('*')
                .eq('active', true)
                .eq('location', location)
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Ensure specialties and gallery are parsed correctly if needed, or if empty fallback
                setPros(data.map(p => {
                    const fallbackData = oldProsFallback.find(old => old.id === p.id);
                    let finalGallery = p.gallery || [];

                    if (finalGallery.length === 0) {
                        if (fallbackData && fallbackData.gallery && fallbackData.gallery.length > 0) {
                            finalGallery = fallbackData.gallery;
                        } else if (p.photo_url) {
                            finalGallery = [p.photo_url];
                        }
                    }

                    return {
                        ...p,
                        specialties: p.specialties || fallbackData?.specialties || [],
                        gallery: finalGallery,
                        avatar: p.photo_url || fallbackData?.avatar || 'https://ui-avatars.com/api/?name=' + p.name,
                        bio: p.bio || fallbackData?.bio || 'Especialista dedicada a proporcionar a melhor experiência de bem-estar.',
                        role: p.role || fallbackData?.role || 'Terapeuta',
                    };
                }));
            }
            setLoading(false);
        }

        fetchProfessionals();
    }, [location]);

    const openAlbum = (pro) => {
        setSelectedPro(pro);
        setCurrentImageIndex(0);
        document.body.style.overflow = 'hidden'; // Evita scroll do fundo
    };

    const closeAlbum = () => {
        setSelectedPro(null);
        document.body.style.overflow = 'unset';
    };

    const nextImage = () => {
        if (!selectedPro) return;
        setCurrentImageIndex((prev) => (prev + 1) % selectedPro.gallery.length);
    };

    const prevImage = () => {
        if (!selectedPro) return;
        setCurrentImageIndex((prev) => (prev - 1 + selectedPro.gallery.length) % selectedPro.gallery.length);
    };

    return (
        <section id="profissionais" className="py-24 bg-[#FAF9F6] relative">
            <div className="container mx-auto px-6 relative z-10">
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

                <div className="flex bg-slate-50/80 p-1.5 rounded-xl mb-12 shadow-inner max-w-md mx-auto relative z-10 border border-slate-100">
                    <button
                        onClick={() => changeLocation('Aracaju')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${location === 'Aracaju' ? 'bg-white text-rose-700 shadow-md transform scale-105' : 'text-slate-500 hover:text-rose-600 hover:bg-white/50'}`}
                    >
                        Aracaju
                    </button>
                    <button
                        onClick={() => changeLocation('Maceió')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${location === 'Maceió' ? 'bg-white text-rose-700 shadow-md transform scale-105' : 'text-slate-500 hover:text-rose-600 hover:bg-white/50'}`}
                    >
                        Maceió
                    </button>
                    <button
                        onClick={() => changeLocation('Recife')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${location === 'Recife' ? 'bg-white text-rose-700 shadow-md transform scale-105' : 'text-slate-500 hover:text-rose-600 hover:bg-white/50'}`}
                    >
                        Recife
                    </button>
                </div>

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
                        pros.map((pro) => (
                            <div
                                key={pro.id}
                                className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl hover:border-rose-200 transition-all duration-500 transform hover:-translate-y-2 opacity-0 animate-slideUp"
                                style={{ animationFillMode: 'forwards' }}
                                onClick={() => openAlbum(pro)}
                            >
                                <div className="relative h-96 w-full overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-cover transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${pro.avatar})`, backgroundColor: '#e2e8f0', backgroundPosition: 'center 20%' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                                    <div className="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-2xl font-serif font-bold mb-1">{pro.name}</h3>
                                        <p className="text-rose-300 font-medium text-sm tracking-wider uppercase mb-3">{pro.role}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {pro.specialties.slice(0, 2).map((spec, i) => (
                                                <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                                                    {spec}
                                                </span>
                                            ))}
                                            {pro.specialties.length > 2 && (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                                                    +{pro.specialties.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Álbum + Agendamento */}
            {selectedPro && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-sm overflow-y-auto">
                    <div className="absolute top-6 right-6 z-50">
                        <button
                            onClick={closeAlbum}
                            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-110"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 my-auto animate-fadeIn relative">

                        {/* Lado Esquerdo: Álbum de Fotos */}
                        <div className="flex flex-col gap-4">
                            <div className="relative aspect-[4/5] w-full bg-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                                    style={{ backgroundImage: `url(${selectedPro.gallery[currentImageIndex]})`, backgroundColor: '#1e293b' }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                                <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                                    <h2 className="text-4xl font-serif font-bold mb-2">{selectedPro.name}</h2>
                                    <p className="text-rose-300 uppercase tracking-widest text-sm font-bold mb-4">{selectedPro.role}</p>
                                    <p className="text-white/80 leading-relaxed text-sm backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/10">{selectedPro.bio}</p>
                                </div>

                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md border border-white/20 transition-all">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md border border-white/20 transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {selectedPro.gallery.map((_, idx) => (
                                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-8 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'w-2 bg-white/50'}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Miniaturas */}
                            <div className="grid grid-cols-3 gap-4">
                                {selectedPro.gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-rose-500 scale-95 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${img})`, backgroundColor: '#1e293b' }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Lado Direito: Agendamento */}
                        <div className="bg-white rounded-3xl overflow-hidden p-6 md:p-8 flex flex-col shadow-2xl">
                            <div className="mb-6">
                                <h3 className="text-2xl font-serif text-slate-800 mb-2">Agendar com a {selectedPro.name}</h3>
                                <p className="text-slate-500 text-sm">Selecione o serviço, data e horário ideais para sua experiência.</p>
                            </div>

                            <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-y-auto custom-scrollbar p-2">
                                <BookingWizard
                                    // Hack: pass professional id to wizard so it auto-sets and skips to step 2
                                    initialProfessional={{ id: selectedPro.id, name: selectedPro.name }}
                                    hideHeader={true}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </section>
    );
}
