'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import BookingWizard from './booking/BookingWizard';

/**
 * ProfessionalModal — Overlay premium com galeria de fotos + booking.
 *
 * Features:
 *  - Transição crossfade entre imagens
 *  - Navegação teclado (← → Esc), swipe touch, botões
 *  - Thumbnails horizontais clicáveis
 *  - Dots indicator no topo
 *  - Next/Image otimizado com priority na imagem ativa
 *  - Booking integrado no painel lateral
 */
export default function ProfessionalModal({ pro, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);

    const gallery = pro.gallery || [];
    const hasMultiple = gallery.length > 1;

    // ─── Navegação ────────────────────────────────────────

    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % gallery.length);
    }, [gallery.length]);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }, [gallery.length]);

    // Teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [onClose, goNext, goPrev]);

    // Touch/Swipe
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goNext() : goPrev();
        }
        setTouchStart(null);
    };

    // Checks if image is from Supabase or local (not a placeholder)
    const isRealImage = (url) => !url.includes('ui-avatars.com');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Close Button */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-110 hover:rotate-90 duration-300"
                    aria-label="Fechar álbum"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 my-auto animate-fadeIn relative">

                {/* Galeria */}
                <div className="flex flex-col gap-4">
                    {/* Imagem Principal */}
                    <div
                        className="relative aspect-[4/5] w-full bg-slate-800 rounded-3xl overflow-hidden shadow-2xl"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Crossfade: todas as imagens renderizadas, apenas a ativa visível */}
                        {gallery.map((img, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                                    idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                            >
                                {isRealImage(img) ? (
                                    <Image
                                        src={img}
                                        alt={`${pro.name} - foto ${idx + 1}`}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover object-top"
                                        quality={85}
                                        priority={idx === 0}
                                    />
                                ) : (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url("${img}")`, backgroundColor: '#1e293b' }}
                                    />
                                )}
                            </div>
                        ))}

                        {/* Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-20" />

                        {/* Info Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none z-20">
                            <h2 className="text-4xl font-serif font-bold mb-2">{pro.name}</h2>
                            <p className="text-rose-300 uppercase tracking-widest text-sm font-bold mb-4">{pro.role}</p>
                            <p className="text-white/80 leading-relaxed text-sm backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/10">
                                {pro.bio}
                            </p>
                        </div>

                        {/* Navigation Buttons */}
                        {hasMultiple && (
                            <>
                                <button
                                    onClick={goPrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110"
                                    aria-label="Foto anterior"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={goNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110"
                                    aria-label="Próxima foto"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Dots */}
                        {hasMultiple && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                                {gallery.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            idx === currentIndex
                                                ? 'w-8 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                                                : 'w-2 bg-white/50 hover:bg-white/80'
                                        }`}
                                        aria-label={`Ir para foto ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {hasMultiple && (
                        <div className="grid grid-cols-5 gap-3">
                            {gallery.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                                        idx === currentIndex
                                            ? 'border-rose-500 scale-95 opacity-100 shadow-lg shadow-rose-500/20'
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/30'
                                    }`}
                                    aria-label={`Ver foto ${idx + 1}`}
                                >
                                    {isRealImage(img) ? (
                                        <Image
                                            src={img}
                                            alt={`Miniatura ${idx + 1}`}
                                            fill
                                            sizes="120px"
                                            className="object-cover object-top"
                                            quality={40}
                                        />
                                    ) : (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url("${img}")`, backgroundColor: '#1e293b' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Booking Panel */}
                <div className="bg-white rounded-3xl overflow-hidden p-6 md:p-8 flex flex-col shadow-2xl">
                    <div className="mb-6">
                        <h3 className="text-2xl font-serif text-slate-800 mb-2">
                            Agendar com a {pro.name}
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Selecione o serviço, data e horário ideais para sua experiência.
                        </p>
                    </div>

                    <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-y-auto custom-scrollbar p-2">
                        <BookingWizard
                            initialProfessional={{ id: pro.id, name: pro.name, location: pro.location }}
                            hideHeader={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
