"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';
import { useLocation } from '@/components/LocationProvider';

export default function Hero() {
    const { location, isLoadingLocation } = useLocation();

    return (
        <section className="hero relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#fafafa]">
            {/* Background Image with Gold Overlay */}
            <div className="absolute inset-0 z-0 text-transparent">
                <Image
                    src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                    alt="Ambiente de massagem luxuoso no SpaSmooth Aracaju"
                    fill
                    priority
                    loading="eager"
                    sizes="100vw"
                    className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-cyan-50/50 to-cyan-100/40"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                {/* Text Content */}
                <div className="space-y-8 animate-slideUp max-w-3xl">
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <span className="text-cyan-700 font-bold tracking-widest uppercase text-base">
                            Bem-vindo ao seu momento
                        </span>
                        <div className="w-12 h-[1px] bg-cyan-300/50"></div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-[#4a4a4a] leading-tight">
                        Spa e Massoterapia de Excelência <span className="text-cyan-700 italic">em {isLoadingLocation ? '...' : location}</span>.
                    </h1>

                    <p className="text-lg md:text-2xl text-[#7a7a7a] leading-relaxed max-w-2xl mx-auto">
                        Redescubra o equilíbrio entre corpo e mente com terapias personalizadas em um ambiente de alto padrão.
                    </p>

                    <div className="flex flex-col items-center gap-6 pt-4">
                        <button
                            onClick={() => document.getElementById('profissionais').scrollIntoView({ behavior: 'smooth' })}
                            className="bg-cyan-700 hover:bg-cyan-800 text-white text-lg font-bold px-10 py-4 rounded-full shadow-xl shadow-cyan-200 transition-all hover:scale-105"
                        >
                            Agendar Minha Sessão
                        </button>

                        <div className="flex items-center gap-4 text-sm text-[#8a8a8a]">
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <span className="font-medium">+2.000 clientes transformados</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
