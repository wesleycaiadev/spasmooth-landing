export type BookingNotification = {
    clientName: string;
    clientPhone: string;
    serviceName: string | null;
    professionalName: string | null;
    unit: string;
    date: string;
    time: string;
    intakeCompleted?: boolean;
};

export function bookingNotificationMessage(
    booking: BookingNotification,
    links: { confirm: string; decline: string; panel: string; pdf?: string },
) {
    const line = (value: string) => value.replace(/[\u0000-\u001f\u007f*_~`]/g, ' ').trim();
    const pdf = booking.intakeCompleted ? links.pdf : undefined;
    const pdfLine = pdf ? `\n📄 *Abrir PDF da anamnese*\n${pdf}` : '';
    const intake = booking.intakeCompleted === undefined ? '' :
        `📝 *Anamnese:* ${booking.intakeCompleted ? 'Preenchida' : 'Não preenchida'}${pdfLine}\n`;
    return `🗓️ *Novo Agendamento*
👤 ${line(booking.clientName)} · ${line(booking.clientPhone)}
💆 ${line(booking.serviceName || 'Serviço não informado')}
📍 ${line(booking.professionalName || 'Profissional a definir')} · ${line(booking.unit)}
📅 ${booking.date} às ${booking.time}
${intake}
✅ *Confirmar:* ${links.confirm}
❌ *Cancelar / Recusar:* ${links.decline}${pdf ? '' : `\n⚙️ *Painel:* ${links.panel}`}`;
}

type NotificationResult = { status: 'accepted' | 'retry' | 'failed' | 'unknown'; reason: string };

export async function getNotificationResult(request: () => Promise<{ status: number; body: string }>): Promise<NotificationResult> {
    let response;
    try {
        response = await request();
    } catch {
        return { status: 'unknown', reason: 'transport' };
    }
    const reason = `http_${response.status}`;
    if (response.status === 429) return { status: 'retry', reason };
    if ([400, 401, 403, 404, 405, 413, 414, 422].includes(response.status)) return { status: 'failed', reason };
    if (response.status < 200 || response.status >= 300) return { status: 'unknown', reason };
    const plainText = response.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    if (/\bmessage\s+(?:queued|sent)\b/i.test(plainText) && !/\b(?:error|failed|not sent)\b/i.test(plainText)) {
        return { status: 'accepted', reason };
    }
    return { status: 'unknown', reason: 'unrecognized' };
}
