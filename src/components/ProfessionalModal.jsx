'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import BookingWizard from './booking/BookingWizard';

/**
 * ProfessionalModal — Bottom Sheet no mobile, overlay premium no desktop.
 *
 * Mobile: fixed bottom-0, 90vh, rounded-t-3xl, slide-up animation
 * Desktop: centered overlay 2-col layout
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

    const isRealImage = (url) => !url.includes('ui-avatars.com');

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/80 md:bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* ═══ MOBILE: Bottom Sheet ═══ */}
            <div className="md:hidden fixed inset-x-0 bottom-0 z-50 h-[90vh] bg-white rounded-t-3xl overflow-hidden animate-slideUpSheet flex flex-col">
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-10 h-1 bg-slate-300 rounded-full" />
                </div>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 z-20 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                    aria-label="Fechar"
                >
                    <X className="w-5 h-5 text-slate-600" />
                </button>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Gallery */}
                    <div
                        className="relative aspect-[3/4] w-full bg-slate-800 overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {gallery.map((img, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 transition-opacity duration-400 ease-in-out ${
                                    idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                            >
                                {isRealImage(img) ? (
                                    <Image
                                        src={img}
                                        alt={`${pro.name} - foto ${idx + 1}`}
                                        fill
                                        sizes="100vw"
                                        className="object-cover object-top"
                                        quality={80}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-20" />

                        {/* Info overlay */}
                        <div className="absolute bottom-0 left-0 w-full p-4 text-white pointer-events-none z-20">
                            <h2 className="text-xl font-serif font-bold mb-0.5">{pro.name}</h2>
                            <p className="text-rose-300 uppercase tracking-widest text-[10px] font-bold">{pro.role}</p>
                        </div>

                        {/* Dots */}
                        {hasMultiple && (
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                                {gallery.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-1 rounded-full transition-all duration-300 ${
                                            idx === currentIndex
                                                ? 'w-6 bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                                                : 'w-1.5 bg-white/40'
                                        }`}
                                        aria-label={`Ir para foto ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    {pro.bio && (
                        <div className="px-4 py-3">
                            <p className="text-xs text-slate-500 font-light leading-relaxed">{pro.bio}</p>
                        </div>
                    )}

                    {/* Booking Panel */}
                    <div className="px-4 pb-6">
                        <div className="mb-3">
                            <h3 className="text-base font-serif text-slate-800 mb-0.5">
                                Agendar com {pro.name}
                            </h3>
                            <p className="text-slate-400 text-[11px] font-light">
                                Selecione o serviço, data e horário.
                            </p>
                        </div>

                        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-2">
                            <BookingWizard
                                initialProfessional={{ id: pro.id, name: pro.name, location: pro.location }}
                                hideHeader={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ DESKTOP: Centered Overlay ═══ */}
            <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-6 pointer-events-none">
                {/* Close Button */}
                <div className="absolute top-6 right-6 z-50 pointer-events-auto">
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 hover:rotate-90 duration-300"
                        aria-label="Fechar álbum"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="w-full max-w-6xl mx-auto grid grid-cols-2 gap-6 animate-fadeIn pointer-events-auto">
                    {/* Galeria */}
                    <div className="flex flex-col gap-3">
                        {/* Imagem Principal */}
                        <div
                            className="relative aspect-[4/5] w-full bg-slate-800 rounded-2xl overflow-hidden shadow-xl"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
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
                                            sizes="50vw"
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
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none z-20" />

                            {/* Info Overlay */}
                            <div className="absolute bottom-5 left-5 right-5 text-white pointer-events-none z-20">
                                <h2 className="text-3xl font-serif font-bold mb-1">{pro.name}</h2>
                                <p className="text-rose-300 uppercase tracking-widest text-xs font-bold mb-3">{pro.role}</p>
                                <p className="text-white/80 leading-relaxed text-sm backdrop-blur-sm bg-black/20 p-3 rounded-xl border border-white/10">
                                    {pro.bio}
                                </p>
                            </div>

                            {/* Navigation Buttons */}
                            {hasMultiple && (
                                <>
                                    <button
                                        onClick={goPrev}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110"
                                        aria-label="Foto anterior"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={goNext}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110"
                                        aria-label="Próxima foto"
                                    >
                                        <ChevronRight className="w-5 h-5" />
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
                            <div className="grid grid-cols-5 gap-2">
                                {gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                            idx === currentIndex
                                                ? 'border-rose-500 scale-95 opacity-100 shadow-md shadow-rose-500/20'
                                                : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/30'
                                        }`}
                                        aria-label={`Ver foto ${idx + 1}`}
                                    >
                                        {isRealImage(img) ? (
                                            <Image
                                                src={img}
                                                alt={`Miniatura ${idx + 1}`}
                                                fill
                                                sizes="100px"
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
                    <div className="bg-white rounded-2xl overflow-hidden p-6 flex flex-col shadow-xl max-h-[85vh]">
                        <div className="mb-4">
                            <h3 className="text-xl font-serif text-slate-800 mb-1">
                                Agendar com {pro.name}
                            </h3>
                            <p className="text-slate-400 text-xs font-light">
                                Selecione o serviço, data e horário ideais para sua experiência.
                            </p>
                        </div>

                        <div className="flex-1 bg-slate-50/50 rounded-xl border border-slate-100 overflow-y-auto custom-scrollbar p-2">
                            <BookingWizard
                                initialProfessional={{ id: pro.id, name: pro.name, location: pro.location }}
                                hideHeader={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
