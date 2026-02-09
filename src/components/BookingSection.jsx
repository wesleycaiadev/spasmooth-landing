"use client";
import BookingWizard from './booking/BookingWizard';
import { Sparkles } from 'lucide-react';

export default function BookingSection() {
    return (
        <section id="agendar" className="py-20 bg-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16 animate-on-scroll">
                    <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-600 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase border border-cyan-100 mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Agendamento Online</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-slate-800 mb-6">
                        Escolha sua <span className="text-cyan-500 italic">profissional</span> e o tratamento ideal.
                    </h2>
                    <p className="text-slate-500 text-lg">
                        Nosso sistema de agendamento é simples e rápido. Selecione quem vai cuidar de você e prepare-se para relaxar.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <BookingWizard />
                </div>
            </div>
        </section>
    );
}
