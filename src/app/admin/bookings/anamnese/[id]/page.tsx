import { notFound } from 'next/navigation';
import { Download } from 'lucide-react';
import BodyMap from '@/components/anamnesis/BodyMap';
import ReviewButton from '@/components/anamnesis/ReviewButton';
import { anamnesisStatuses, formatAnamnesisDate, getAnamnesisDetails } from '@/lib/anamnesis/report';
import { readAdminAnamnesis } from '@/services/admin/anamnesis';

const notifications = {
    queued: 'Na fila',
    sending: 'Em envio',
    accepted: 'Aceita pelo provedor',
    unknown: 'Resultado desconhecido',
    failed: 'Falhou',
};
export default async function AnamnesisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, unavailable, restricted } = await readAdminAnamnesis(id);
    if (unavailable) return <p role="alert">A ficha está temporariamente indisponível.</p>;
    if (restricted) return <p>A ficha clínica está disponível para a profissional autorizada.</p>;
    if (!data) notFound();

    const details = getAnamnesisDetails(data);

    return (
        <div className="mx-auto max-w-3xl space-y-6 text-slate-700">
            <a href="/admin/bookings" className="text-sm font-bold text-cyan-900 underline">Voltar aos agendamentos</a>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">Ficha de anamnese</h1>
                {details && (
                    <a href={`/admin/bookings/anamnese/${id}/pdf`} download
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 text-sm font-bold text-cyan-950 hover:bg-cyan-50">
                        <Download size={16} aria-hidden="true" /> Baixar PDF
                    </a>
                )}
            </div>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-bold">Agendamento</h2>
                <dl className="grid gap-4 sm:grid-cols-2">
                    <div><dt className="font-semibold">Cliente</dt><dd>{data.client_name}</dd></div>
                    <div><dt className="font-semibold">Data e unidade</dt><dd>{formatAnamnesisDate(data.starts_at)} · {data.unit}</dd></div>
                    <div><dt className="font-semibold">Serviço</dt><dd>{data.service_name ?? 'Serviço indisponível'}</dd></div>
                    <div><dt className="font-semibold">Profissional</dt><dd>{data.professional_name ?? 'Profissional indisponível'}</dd></div>
                    <div><dt className="font-semibold">Estado da ficha</dt><dd>{anamnesisStatuses[data.status]}</dd></div>
                    <div><dt className="font-semibold">Notificação</dt><dd>{data.notification_status ? notifications[data.notification_status] : 'Sem envio programado'}</dd></div>
                    {data.submitted_at && <div><dt className="font-semibold">Preenchimento</dt><dd>{formatAnamnesisDate(data.submitted_at)}</dd></div>}
                    {data.reviewed_at && <div><dt className="font-semibold">Revisão</dt><dd>{formatAnamnesisDate(data.reviewed_at)} · {data.reviewed_by}</dd></div>}
                    {data.purged_at && <div><dt className="font-semibold">Descarte</dt><dd>{formatAnamnesisDate(data.purged_at)}</dd></div>}
                </dl>
            </section>

            {details && (
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-lg font-bold">Respostas</h2>
                    {details.alerts.length > 0 && (
                        <div className="rounded-xl bg-amber-50 p-4 text-amber-950">
                            <h3 className="font-bold">Pontos para avaliação profissional</h3>
                            <ul className="ml-5 list-disc">{details.alerts.map(reason => <li key={reason}>{reason}</li>)}</ul>
                        </div>
                    )}
                    {details.goals.length > 0 && (
                        <div>
                            <h3 className="font-semibold">Objetivos</h3>
                            <ul className="ml-5 list-disc">{details.goals.map(goal => <li key={goal}>{goal}</li>)}</ul>
                        </div>
                    )}
                    <dl className="space-y-3">
                        {details.answers.map(({ key, label, value }) => <div key={key}><dt className="font-semibold">{label}</dt><dd>{value}</dd></div>)}
                    </dl>
                    {details.regions.length > 0 && (
                        <div>
                            <h3 className="mb-3 font-semibold">Mapa corporal</h3>
                            <BodyMap areas={details.areas} detailed={details.clinical} />
                            <ul className="ml-5 mt-4 list-disc">
                                {details.regions.map(({ key, label }) => <li key={key}>{label}</li>)}
                            </ul>
                        </div>
                    )}
                    {details.clinical && <p className="text-sm">A avaliação de edema e cacifo, quando pertinente, é feita presencialmente pela profissional habilitada.</p>}
                    <p className="text-sm">Consentimento registrado no preenchimento · Aviso {details.privacyVersion} · Questionário {data.questionnaire_version}</p>
                    {(data.status === 'needs_review' || data.status === 'completed') && <ReviewButton id={id} />}
                </section>
            )}
        </div>
    );
}
