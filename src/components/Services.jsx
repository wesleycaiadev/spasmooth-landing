import { TREATMENTS } from '@/lib/data';
import ServiceBookingCard from './booking/ServiceBookingCard';
import { getActiveServices } from '@/services/admin/services';

/**
 * Mapeia ícone com base no nome do serviço.
 * Fallback para 'Sparkles' quando não encontra match.
 */
function inferIcon(name) {
    const lower = name.toLowerCase();
    if (lower.includes('tântrica') || lower.includes('tantrica')) return 'Sparkles';
    if (lower.includes('relaxante especial')) return 'Wind';
    if (lower.includes('nuru')) return 'Droplets';
    if (lower.includes('delirium')) return 'Flame';
    if (lower.includes('tailandesa')) return 'Hand';
    if (lower.includes('ventosa')) return 'CircleDot';
    if (lower.includes('premium black') || lower.includes('premium')) return 'Gem';
    if (lower.includes('meia perna')) return 'Feather';
    if (lower.includes('perna completa')) return 'Sunset';
    if (lower.includes('braço') || lower.includes('bracos')) return 'Target';
    if (lower.includes('costas')) return 'Asterisk';
    if (lower.includes('abdômen') || lower.includes('abdomen')) return 'CircleDot';
    if (lower.includes('íntima') || lower.includes('intima')) return 'ShieldCheck';
    if (lower.includes('corpo todo')) return 'Stars';
    if (lower.includes('depilação') || lower.includes('depilacao')) return 'Scissors';
    return 'Sparkles';
}

function formatDurationLabel(minutes) {
    if (minutes >= 120) return `${minutes / 60}h`;
    if (minutes === 60) return '1h';
    if (minutes === 90) return 'Completa';
    return `${minutes}min`;
}

function formatPrice(value) {
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Adapta um serviço do banco para o formato esperado pelo ServiceBookingCard.
 * Enriquece com dados estáticos (stages, note, featured) quando disponíveis,
 * mas funciona 100% mesmo sem match estático.
 */
function adaptService(dbService) {
    const staticMatch = TREATMENTS.find(
        t => t.name.toLowerCase().trim() === dbService.name.toLowerCase().trim()
    );

    const isPremium = dbService.name.toLowerCase().includes('premium');

    return {
        id: dbService.id,
        category: dbService.category === 'massage' ? 'massage' : 'waxing',
        name: dbService.name,
        icon: staticMatch?.icon ?? inferIcon(dbService.name),
        durations: [{
            time: formatDurationLabel(dbService.duration_minutes),
            price: formatPrice(dbService.price),
        }],
        description: dbService.description || staticMatch?.description || '',
        stages: staticMatch?.stages ?? [],
        note: staticMatch?.note ?? '',
        featured: staticMatch?.featured ?? isPremium,
    };
}

export default async function Services() {
    let massages = [];
    let waxings = [];

    try {
        const dbServices = await getActiveServices();

        massages = dbServices
            .filter(s => s.category === 'massage')
            .map(adaptService);

        waxings = dbServices
            .filter(s => s.category === 'waxing')
            .map(adaptService);
    } catch (error) {
        // Fallback para dados estáticos em caso de falha
        console.error('[Services] Falha ao buscar do banco, usando fallback estático:', error.message);
        massages = TREATMENTS.filter(t => t.category === 'massage');
        waxings = TREATMENTS.filter(t => t.category === 'waxing');
    }

    return (
        <section id="servicos" className="py-24 bg-[#f8fafc] relative overflow-hidden">
            <div className="absolute top-20 left-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-20 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-12 max-w-2xl mx-auto px-4">
                    <span className="text-cyan-700 font-semibold tracking-wider uppercase text-sm mb-2 block">Nosso Menu</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Escolha sua experiência</h2>
                    <div className="w-24 h-1 bg-cyan-200 mx-auto rounded-full"></div>
                </div>

                {massages.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-2xl font-serif text-slate-700 mb-8 border-b border-cyan-100 pb-2 flex items-center gap-2"><span className="text-cyan-600">✦</span> Massagens & Vivências</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="servicos-massagens">
                            {massages.map((treatment) => (
                                <ServiceBookingCard key={treatment.id} treatment={treatment} />
                            ))}
                        </div>
                    </div>
                )}

                {waxings.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-serif text-slate-700 mb-8 border-b border-cyan-100 pb-2 flex items-center gap-2"><span className="text-cyan-600">✦</span> Depilação na Máquina</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="servicos-depilacao">
                            {waxings.map((treatment) => (
                                <ServiceBookingCard key={treatment.id} treatment={treatment} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-16 text-center text-xs text-slate-400">
                    Informações e valores podem ser ajustados conforme disponibilidade e confirmação via WhatsApp.
                </div>
            </div>
        </section>
    );
}
