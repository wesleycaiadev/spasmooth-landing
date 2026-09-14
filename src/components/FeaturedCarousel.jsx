"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Clock3, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateDiscount } from '@/lib/discounts';
import { getServiceImage } from '@/lib/serviceImages';

export default function FeaturedCarousel({ services = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    useEffect(() => {
        if (isHovered || services.length <= 1) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % services.length);
        }, 5000);
        
        return () => clearInterval(timer);
    }, [isHovered, services.length]);

    if (!services || services.length === 0) return null;

    const handleBooking = (service) => {
        const disc = calculateDiscount(service);
        const serviceData = {
            id: service.id,
            name: service.name,
            defaultOption: service.durations ? service.durations[0] : { time: 'Experiência', price: disc.hasDiscount ? disc.formattedFinalPrice : service.price }
        };
        sessionStorage.setItem('selected_service', JSON.stringify(serviceData));
        
        const wizardSection = document.getElementById('profissionais');
        if (wizardSection) {
            wizardSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/#profissionais';
        }
    };

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % services.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);

    const service = services[currentIndex];
    const disc = calculateDiscount(service);
    const image = getServiceImage(service.slug) || '/images/treatments/day-spa-standard.webp';

    return (
        <section
            aria-label="Experiências em destaque"
            className="relative overflow-hidden rounded-[2rem] border border-[rgb(6_59_100_/_0.12)] bg-[var(--spa-ink)] text-white shadow-xl shadow-[rgb(6_59_100_/_0.18)] md:rounded-[2.5rem]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative z-10">
                {services.length > 1 && (
                    <>
                        <button 
                            onClick={prevSlide}
                            className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[rgb(6_59_100_/_0.65)] text-white transition hover:bg-white hover:text-[var(--spa-ink)] md:grid"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[rgb(6_59_100_/_0.65)] text-white transition hover:bg-white hover:text-[var(--spa-ink)] md:grid"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                <div className="relative min-h-[470px] w-full md:min-h-[430px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute inset-0 grid h-full w-full md:grid-cols-2"
                        >
                            <div className="order-2 flex flex-col justify-center p-7 sm:p-10 md:order-1 md:p-12">
                                <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#86d9ea]">Experiência em destaque</p>
                                <h2 className="spa-display max-w-md text-4xl leading-tight md:text-5xl">{service.name}</h2>
                                <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300 md:text-base">{service.description}</p>
                                <div className="mt-6 flex items-center gap-2 text-sm text-[#bde8f0]"><Clock3 size={16} aria-hidden="true" /> {service.duration_minutes ? `${service.duration_minutes} min` : 'Duração conforme opção'}</div>
                                <div className="mt-5 flex items-end gap-3">
                                    {disc.hasDiscount ? (
                                        <><span className="text-sm text-slate-400 line-through">{disc.formattedOriginalPrice}</span><span className="text-2xl font-bold text-white">{disc.formattedFinalPrice}</span></>
                                    ) : (
                                        <span className="text-2xl font-bold text-white">
                                            R$ {Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => handleBooking(service)} className="mt-7 flex min-h-12 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-[var(--spa-ink)] transition hover:bg-[var(--spa-sky)]">Reservar momento <ArrowRight size={17} aria-hidden="true" /></button>
                            </div>
                            <div className="relative order-1 min-h-[210px] overflow-hidden md:order-2 md:min-h-full"><Image src={image} alt={`Ambiente que representa ${service.name}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[rgb(6_59_100_/_0.5)] via-transparent to-transparent md:bg-gradient-to-r" /></div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {services.length > 1 && (
                    <div className="absolute bottom-5 left-8 flex gap-2 md:bottom-7 md:left-12">
                        {services.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                                }`}
                                aria-label={`Ir para o slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
