import { getCachedPublicHomeCatalog } from '@/services/publicHomeCatalog';
import FeaturedCarousel from './FeaturedCarousel';
import ServiceAccordion from './ServiceAccordion';

export default async function Services() {
    let services = [];
    let categoryOrder = [];
    let carouselConfig = null;

    try {
        const catalog = await getCachedPublicHomeCatalog();
        services = catalog.services;
        categoryOrder = catalog.categoryOrder;
        carouselConfig = catalog.carouselConfig;
    } catch (error) {
        console.error('[Services] Falha ao buscar dados:', error.message);
    }

    // O admin pode escolher destaques. Sem configuração, mostramos apenas uma
    // amostra dos serviços ativos para a página não ficar sem contexto visual.
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
    if (featuredServices.length === 0) featuredServices = services.slice(0, carouselConfig?.maxItems || 3);

    // Agrupar por categoria
    const groupedServices = {};
    for (const cat of categoryOrder) {
        groupedServices[cat] = services.filter(s => s.category === cat);
    }

    return (
        <section id="servicos" className="relative overflow-hidden bg-[var(--spa-mist)] py-16 md:py-24">
            <div className="spa-shell relative z-10">
                {featuredServices.length > 0 && <FeaturedCarousel services={featuredServices} />}

                <div className="mb-9 mt-16 grid max-w-3xl gap-4 md:mb-14 md:mt-24">
                    <span className="spa-eyebrow">Nossos tratamentos</span>
                    <h2 className="spa-display text-4xl text-[var(--spa-ink)] md:text-5xl">Experiências para cada momento.</h2>
                    <p className="max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">Escolha uma experiência, veja o tempo previsto e inicie o agendamento quando fizer sentido para você.</p>
                </div>

                {/* Blocos de Serviços — Accordion no mobile, Grid no desktop */}
                <ServiceAccordion groupedServices={groupedServices} categoryOrder={categoryOrder} />

                <div className="mt-10 rounded-2xl border border-[var(--spa-line)] bg-white p-4 text-center text-xs font-medium text-slate-500 md:mt-16 md:p-6">
                    Informações e valores podem ser ajustados conforme disponibilidade. O pagamento é realizado diretamente no local.
                </div>
            </div>
        </section>
    );
}
