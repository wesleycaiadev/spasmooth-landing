import { notFound } from 'next/navigation';
import BodyMap from '@/components/anamnesis/BodyMap';
import ReviewButton from '@/components/anamnesis/ReviewButton';
import { bodyKinds, detailedBodyRegions, legacyBodyRegions, sensations } from '@/lib/anamnesis/body-regions';
import { getQuestionnaire, goals, reviewReasons } from '@/lib/anamnesis/questionnaire';
import { readAdminAnamnesis } from '@/services/admin/anamnesis';

const statuses = {
    pending: 'Pendente',
    not_filled: 'Não preenchida',
    completed: 'Concluída',
    needs_review: 'Aguardando revisão profissional',
    reviewed: 'Revisada',
    purged: 'Respostas descartadas',
};
const notifications = {
    queued: 'Na fila',
    sending: 'Em envio',
    accepted: 'Aceita pelo provedor',
    unknown: 'Resultado desconhecido',
    failed: 'Falhou',
};
const dateFormat = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Maceio',
});

export default async function AnamnesisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, unavailable, restricted } = await readAdminAnamnesis(id);
    if (unavailable) return <p role="alert">A ficha está temporariamente indisponível.</p>;
    if (restricted) return <p>A ficha clínica está disponível para a profissional autorizada.</p>;
    if (!data) notFound();

    const questionnaire = getQuestionnaire({ category: data.service_category, slug: data.service_slug }, data.questionnaire_version);
    const submission = data.submission;
    const reasons = questionnaire && submission ? reviewReasons(questionnaire, submission) : [];
    const regions = questionnaire?.regions ?? { ...legacyBodyRegions, ...detailedBodyRegions };

    return (
        <div className="mx-auto max-w-3xl space-y-6 text-slate-700">
            <a href="/admin/bookings" className="text-sm font-bold text-cyan-900 underline">Voltar aos agendamentos</a>
            <h1 className="text-2xl font-bold text-slate-900">Ficha de anamnese</h1>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-bold">Agendamento</h2>
                <dl className="grid gap-4 sm:grid-cols-2">
                    <div><dt className="font-semibold">Cliente</dt><dd>{data.client_name}</dd></div>
                    <div><dt className="font-semibold">Data e unidade</dt><dd>{dateFormat.format(new Date(data.starts_at))} · {data.unit}</dd></div>
                    <div><dt className="font-semibold">Serviço</dt><dd>{data.service_name ?? 'Serviço indisponível'}</dd></div>
                    <div><dt className="font-semibold">Profissional</dt><dd>{data.professional_name ?? 'Profissional indisponível'}</dd></div>
                    <div><dt className="font-semibold">Estado da ficha</dt><dd>{statuses[data.status]}</dd></div>
                    <div><dt className="font-semibold">Notificação</dt><dd>{data.notification_status ? notifications[data.notification_status] : 'Sem envio programado'}</dd></div>
                    {data.submitted_at && <div><dt className="font-semibold">Preenchimento</dt><dd>{dateFormat.format(new Date(data.submitted_at))}</dd></div>}
                    {data.reviewed_at && <div><dt className="font-semibold">Revisão</dt><dd>{dateFormat.format(new Date(data.reviewed_at))} · {data.reviewed_by}</dd></div>}
                    {data.purged_at && <div><dt className="font-semibold">Descarte</dt><dd>{dateFormat.format(new Date(data.purged_at))}</dd></div>}
                </dl>
            </section>

            {submission && (
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-lg font-bold">Respostas</h2>
                    {reasons.length > 0 && (
                        <div className="rounded-xl bg-amber-50 p-4 text-amber-950">
                            <h3 className="font-bold">Pontos para avaliação profissional</h3>
                            <ul className="ml-5 list-disc">{reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
                        </div>
                    )}
                    {submission.goals.length > 0 && (
                        <div>
                            <h3 className="font-semibold">Objetivos</h3>
                            <ul className="ml-5 list-disc">{submission.goals.map(goal => <li key={goal}>{goals[goal]}</li>)}</ul>
                        </div>
                    )}
                    <dl className="space-y-3">
                        {Object.entries(submission.answers).map(([key, value]) => {
                            const question = questionnaire?.questions.find(item => item.id === key);
                            return <div key={key}><dt className="font-semibold">{question?.label ?? key}</dt><dd>{question?.options.find(option => option.value === value)?.label ?? value}</dd></div>;
                        })}
                    </dl>
                    {submission.regions.length > 0 && (
                        <div>
                            <h3 className="mb-3 font-semibold">Mapa corporal</h3>
                            <BodyMap areas={submission.regions} detailed={questionnaire?.clinical} />
                            <ul className="ml-5 mt-4 list-disc">
                                {submission.regions.map(({ region, kind, intensity, sensations: selectedSensations }) => (
                                    <li key={`${region}:${kind}`}>{bodyKinds[kind]} · {regions[region] ?? region}
                                        {intensity !== undefined && ` · intensidade ${intensity}/${questionnaire?.intensity.max ?? 5}`}
                                        {selectedSensations?.length > 0 && ` · ${selectedSensations.map(value => sensations[value]).join(', ')}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {questionnaire?.clinical && <p className="text-sm">A avaliação de edema e cacifo, quando pertinente, é feita presencialmente pela profissional habilitada.</p>}
                    <p className="text-sm">Consentimento registrado no preenchimento · Aviso {submission.privacyVersion} · Questionário {data.questionnaire_version}</p>
                    {(data.status === 'needs_review' || data.status === 'completed') && <ReviewButton id={id} />}
                </section>
            )}
        </div>
    );
}
