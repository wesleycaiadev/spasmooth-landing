import { getActiveServices } from '@/services/admin/services';
import FeaturedCarousel from './FeaturedCarousel';
import ServiceAccordion from './ServiceAccordion';

export default async function Services() {
    let services = [];

    try {
        const dbServices = await getActiveServices();
        services = dbServices;
    } catch (error) {
        console.error('[Services] Falha ao buscar do banco:', error.message);
    }

    // Filtragem para o Carrossel
    const featuredServices = services.filter(s => 
        s.name.includes('Spa Magic Plus') || 
        s.name.includes('Vivência') || 
        s.name.includes('Day Spa Standard')
    );

    // Agrupar por categoria
    const groupedServices = {
        combo: services.filter(s => s.category === 'combo'),
        day_spa: services.filter(s => s.category === 'day_spa'),
        estetica: services.filter(s => s.category === 'estetica'),
        depilacao: services.filter(s => s.category === 'depilacao'),
        tantrica: services.filter(s => s.category === 'tantrica'),
    };

    return (
        <section id="servicos" className="py-12 md:py-24 bg-[#fafafa] relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Carrossel de Destaques */}
                {featuredServices.length > 0 && (
                    <FeaturedCarousel services={featuredServices} />
                )}

                {/* Título da Seção do Cardápio */}
                <div className="text-center mb-8 md:mb-16 mt-10 md:mt-20 max-w-2xl mx-auto px-2">
                    <span className="text-cyan-700 font-bold tracking-wider uppercase text-xs mb-2 block">Menu Completo</span>
                    <h2 className="text-xl md:text-4xl font-serif text-[#4a4a4a] mb-4">Explore nossas Terapias</h2>
                    <div className="w-16 md:w-24 h-0.5 bg-cyan-200 mx-auto rounded-full"></div>
                </div>

                {/* Blocos de Serviços — Accordion no mobile, Grid no desktop */}
                <ServiceAccordion groupedServices={groupedServices} />

                <div className="mt-10 md:mt-20 text-center text-xs font-medium text-slate-400 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                    Informações e valores podem ser ajustados conforme disponibilidade. O pagamento é realizado diretamente no local.
                </div>
            </div>
        </section>
    );
}
