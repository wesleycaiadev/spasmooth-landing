import { TREATMENTS } from '@/lib/data';
import ServiceBookingCard from './booking/ServiceBookingCard';

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
                    {TREATMENTS.map((treatment) => (
                        <ServiceBookingCard key={treatment.id} treatment={treatment} />
                    ))}
                </div>

                <div className="mt-10 text-center text-xs text-slate-400">
                    Informações e valores podem ser ajustados conforme disponibilidade e confirmação via WhatsApp.
                </div>
            </div>
        </section>
    );
}
