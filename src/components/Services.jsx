import { getActiveServices } from '@/services/admin/services';
import { getCategoryLayoutConfig, getFeaturedCarouselConfig } from '@/services/admin/layout';
import FeaturedCarousel from './FeaturedCarousel';
import ServiceAccordion from './ServiceAccordion';

export default async function Services() {
    let services = [];
    let categoryOrder = [];
    let carouselConfig = null;

    try {
        const [dbServices, catRes, carRes] = await Promise.all([
            getActiveServices(),
            getCategoryLayoutConfig(),
            getFeaturedCarouselConfig()
        ]);
        services = dbServices || [];
        categoryOrder = catRes.success ? catRes.data : [];
        carouselConfig = carRes.success ? carRes.data : { mode: 'promotions', serviceIds: [], maxItems: 3 };
    } catch (error) {
        console.error('[Services] Falha ao buscar dados:', error.message);
    }

    // Filtragem para o Carrossel
    let featuredServices = [];
    if (carouselConfig?.mode === 'manual') {
        featuredServices = services.filter(s => carouselConfig.serviceIds.includes(s.id));
    } else {
        // Promotions mode
        featuredServices = services.filter(s => {
            if (!s.prices || s.prices.length === 0) return false;
            // Verifica se tem algum preço com desconto
            return s.prices.some(p => p.discount_percentage > 0);
        }).slice(0, carouselConfig?.maxItems || 3);
    }

    // Agrupar por categoria
    const groupedServices = {};
    for (const cat of categoryOrder) {
        groupedServices[cat] = services.filter(s => s.category === cat);
    }

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
                <ServiceAccordion groupedServices={groupedServices} categoryOrder={categoryOrder} />

                <div className="mt-10 md:mt-20 text-center text-xs font-medium text-slate-400 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                    Informações e valores podem ser ajustados conforme disponibilidade. O pagamento é realizado diretamente no local.
                </div>
            </div>
        </section>
    );
}
