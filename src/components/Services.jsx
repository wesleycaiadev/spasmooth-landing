import { getActiveServices } from '@/services/admin/services';
import ServiceBookingCard from './booking/ServiceBookingCard';
import FeaturedCarousel from './FeaturedCarousel';
import { Sparkles, Layers, Palette, Flame, Scissors } from 'lucide-react';

export default async function Services() {
    let services = [];

    try {
        const dbServices = await getActiveServices();
        services = dbServices;
    } catch (error) {
        console.error('[Services] Falha ao buscar do banco:', error.message);
        // Sem fallback estático complexo, pois os dados já estão no banco
    }

    // Filtragem para o Carrossel
    const featuredServices = services.filter(s => 
        s.name.includes('Spa Magic Plus') || 
        s.name.includes('Vivência') || 
        s.name.includes('Day Spa Standard')
    );

    // Filtragem para os 5 Blocos
    const combos = services.filter(s => s.category === 'combo');
    const daySpa = services.filter(s => s.category === 'day_spa');
    const estetica = services.filter(s => s.category === 'estetica');
    const tantrica = services.filter(s => s.category === 'tantrica');
    const depilacao = services.filter(s => s.category === 'depilacao');

    return (
        <section id="servicos" className="py-24 bg-[#fafafa] relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                {/* Carrossel de Destaques */}
                {featuredServices.length > 0 && (
                    <FeaturedCarousel services={featuredServices} />
                )}

                {/* Título da Seção do Cardápio */}
                <div className="text-center mb-16 mt-20 max-w-2xl mx-auto px-4">
                    <span className="text-cyan-700 font-bold tracking-wider uppercase text-sm mb-2 block">Menu Completo</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-[#4a4a4a] mb-6">Explore nossas Terapias</h2>
                    <div className="w-24 h-1 bg-cyan-200 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-24">
                    {/* Bloco 1: Combos */}
                    {combos.length > 0 && (
                        <div>
                            <div className="mb-10 text-center md:text-left">
                                <h3 className="text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3 mb-2">
                                    <Layers className="text-cyan-600 w-8 h-8" /> Combos de Massagem
                                </h3>
                                <p className="text-slate-500 font-medium">Serviços combinados para alívio rápido de tensões musculares.</p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {combos.map((treatment) => (
                                    <ServiceBookingCard key={treatment.id} treatment={treatment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bloco 2: Day Spa */}
                    {daySpa.length > 0 && (
                        <div>
                            <div className="mb-10 text-center md:text-left">
                                <h3 className="text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3 mb-2">
                                    <Sparkles className="text-yellow-500 w-8 h-8" /> Pacotes Day Spa
                                </h3>
                                <p className="text-slate-500 font-medium">Experiências imersivas de várias horas para cuidado completo.</p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {daySpa.map((treatment) => (
                                    <ServiceBookingCard key={treatment.id} treatment={treatment} isPremium={true} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bloco 3: Estética */}
                    {estetica.length > 0 && (
                        <div>
                            <div className="mb-10 text-center md:text-left">
                                <h3 className="text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3 mb-2">
                                    <Palette className="text-pink-500 w-8 h-8" /> Estética e Cuidados Avulsos
                                </h3>
                                <p className="text-slate-500 font-medium">Tratamentos diretos e essenciais de beleza e cuidado.</p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {estetica.map((treatment) => (
                                    <ServiceBookingCard key={treatment.id} treatment={treatment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. DEPILAÇÃO */}
                    {depilacao.length > 0 && (
                        <div className="mb-20">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="bg-rose-50 p-4 rounded-2xl text-rose-600 shadow-inner border border-rose-100">
                                    <Scissors size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-serif text-slate-800">Depilação Suave</h2>
                                    <p className="text-slate-500">Pele lisa e macia com o máximo de conforto.</p>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {depilacao.map((treatment) => (
                                    <ServiceBookingCard key={treatment.id} treatment={treatment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 5. EXPERIÊNCIAS TÂNTRICAS (Movido para o final) */}
                    {tantrica.length > 0 && (
                        <div className="mb-20">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="bg-red-50 p-4 rounded-2xl text-red-600 shadow-inner border border-red-100">
                                    <Flame size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-serif text-slate-800">Terapias Sensoriais e Tântricas</h2>
                                    <p className="text-slate-500">Desperte sua energia vital e reconecte-se com seu corpo.</p>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {tantrica.map((treatment) => (
                                    <ServiceBookingCard key={treatment.id} treatment={treatment} isPremium={true} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-20 text-center text-sm font-bold text-slate-400 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    Informações e valores podem ser ajustados conforme disponibilidade. O pagamento é realizado diretamente no local.
                </div>
            </div>
        </section>
    );
}
