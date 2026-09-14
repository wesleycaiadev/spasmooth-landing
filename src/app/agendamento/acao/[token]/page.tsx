import { getBookingActionPreview, executeSignedBookingAction } from '@/services/booking-actions';

export const dynamic = 'force-dynamic';

type PageProps = {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ resultado?: string }>;
};

const resultMessages: Record<string, string> = {
    already_confirmado: 'Este agendamento já foi confirmado.',
    already_cancelado: 'Este agendamento já foi cancelado.',
    already_concluido: 'Este agendamento já foi concluído.',
    invalid: 'Este link é inválido ou expirou.',
    invalido: 'Este link é inválido ou expirou.',
    not_found: 'Agendamento não encontrado.',
    origem_invalida: 'Não foi possível validar a origem desta solicitação.',
    limite: 'Muitas tentativas. Aguarde alguns minutos.',
    indisponivel: 'Não foi possível aplicar a ação agora. Tente novamente pelo painel.',
};

export default async function BookingActionPage({ params, searchParams }: PageProps) {
    const { token } = await params;
    const { resultado } = await searchParams;
    const preview = await getBookingActionPreview(token);
    const previewError = 'error' in preview ? preview.error : null;
    const actionLabel = preview.success && preview.data.action === 'confirmar' ? 'Confirmar agendamento' : 'Recusar agendamento';
    const isPending = preview.success && preview.data.status === 'pendente';
    const feedback = resultado
        ? resultMessages[resultado] || 'Não foi possível concluir a ação.'
        : preview.success && !isPending
            ? resultMessages[`already_${preview.data.status}`] || 'Este agendamento não está mais pendente.'
            : null;

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-800">
            <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-700">Spa Smooth</p>
                {!preview.success ? (
                    <>
                        <h1 className="mt-4 text-3xl font-bold">Link indisponível</h1>
                        <p className="mt-3 text-slate-600">{resultMessages[previewError || 'invalid']}</p>
                    </>
                ) : (
                    <>
                        <h1 className="mt-4 text-3xl font-bold">{actionLabel}</h1>
                        <p className="mt-3 text-slate-600">Revise a ação antes de confirmar. Após a confirmação, o WhatsApp do cliente será aberto com a mensagem pronta.</p>
                        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left text-sm leading-7">
                            <p><strong>Cliente:</strong> {preview.data.clientName}</p>
                            <p><strong>Serviço:</strong> {preview.data.serviceName}</p>
                            <p><strong>Profissional:</strong> {preview.data.professionalName}</p>
                            <p><strong>Unidade:</strong> {preview.data.unit}</p>
                        </div>
                        {feedback && <p role="alert" className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{feedback}</p>}
                        {isPending && !feedback && (
                            <form action={executeSignedBookingAction} className="mt-7">
                                <input type="hidden" name="token" value={token} />
                                <button type="submit" className={preview.data.action === 'confirmar' ? 'w-full rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white hover:bg-emerald-700' : 'w-full rounded-xl bg-red-600 px-5 py-4 font-bold text-white hover:bg-red-700'}>
                                    {preview.data.action === 'confirmar' ? '✅ Confirmar agora' : '❌ Recusar agora'}
                                </button>
                            </form>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
