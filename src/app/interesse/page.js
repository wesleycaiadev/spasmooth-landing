import { redirect } from 'next/navigation';
import { anamnesisEnabled } from '@/lib/anamnesis/config';
import { loadBookingQuestionnaire, requestAnamnesisReceipt } from '@/lib/anamnesis/server';
import IntakeForm from '@/components/anamnesis/IntakeForm';
import LegacyInterestForm from '@/components/booking/LegacyInterestForm';

export const dynamic = 'force-dynamic';

export default async function InterestPage() {
    let receipt;
    let record;
    try {
        receipt = await requestAnamnesisReceipt();
        if (receipt) record = await loadBookingQuestionnaire(receipt.id);
    } catch {
        return <IntakeUnavailable />;
    }

    if (!record) return receipt || anamnesisEnabled() ? <IntakeUnavailable /> : <LegacyInterestForm />;
    if (['completed', 'needs_review', 'reviewed', 'purged'].includes(record.status)) redirect('/obrigado');

    return (
        <main className="min-h-screen bg-[var(--spa-cream)] px-4 py-10 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-xl rounded-[2rem] border border-[var(--spa-line)] bg-white p-5 shadow-xl sm:p-9">
                <h1 className="spa-display text-3xl text-[var(--spa-ink)] sm:text-4xl">Avaliação antes do atendimento</h1>
                <p className="mb-7 mt-3 leading-relaxed">Conte o que ajuda você a se sentir confortável. Você pode responder só o que quiser ou seguir direto para o agradecimento.</p>
                <IntakeForm questionnaire={record.questionnaire} binding={receipt.formBinding} />
            </div>
        </main>
    );
}

function IntakeUnavailable() {
    return (
        <main className="mx-auto max-w-xl px-5 py-16">
            <h1 className="spa-display text-3xl text-[var(--spa-ink)]">Avaliação indisponível</h1>
            <p className="my-5">A ficha está indisponível ou a sessão de preenchimento expirou.</p>
            <a href="/obrigado" className="spa-button-primary">Ir para a página de agradecimento</a>
        </main>
    );
}
