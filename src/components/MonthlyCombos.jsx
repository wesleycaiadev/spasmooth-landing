import ServiceBookingCard from './booking/ServiceBookingCard';

export default function MonthlyCombos({ services = [] }) {
    if (!services.length) return null;
    return (
        <section id="combos-mensais" aria-labelledby="monthly-heading" className="relative mt-12 overflow-hidden rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-amber-50 p-5 shadow-sm md:mt-16 md:p-10">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
                <div className="max-w-xl">
                    <span className="spa-eyebrow">Seu cuidado, mês inteiro</span>
                    <h2 id="monthly-heading" className="spa-display mt-3 text-3xl text-[var(--spa-ink)] md:text-4xl">Mais sessões. Mais tempo para você.</h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">Escolha seu combo mensal e organize seus momentos de cuidado. Valores do pacote completo, com sessões agendadas individualmente.</p>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-extrabold text-amber-900">Combos mensais</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                {services.map(service => <ServiceBookingCard key={service.id} treatment={service} />)}
            </div>
        </section>
    );
}
