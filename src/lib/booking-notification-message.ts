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
    links: { confirm: string; decline: string; panel: string; intake?: string },
) {
    const line = (value: string) => value.replace(/[\u0000-\u001f\u007f*_~`]/g, ' ').trim();
    const intake = booking.intakeCompleted === undefined ? '' :
        `📝 *Anamnese:* ${booking.intakeCompleted ? 'Preenchida' : 'Não preenchida'}\n`;
    return `🗓️ *Novo Agendamento*
👤 *Cliente:* ${line(booking.clientName)}
📱 *WhatsApp:* ${line(booking.clientPhone)}
💆 *Serviço:* ${line(booking.serviceName || 'Não informado')}

👩‍⚕️ *Profissional:* ${line(booking.professionalName || 'Não especificado')}
📍 *Local:* ${line(booking.unit)}
📅 *Data:* ${booking.date}
🕐 *Horário:* ${booking.time}
${intake}
Um novo agendamento foi solicitado pelo site. Revise os dados e escolha uma ação abaixo:

✅ *Confirmar agendamento:* ${links.confirm}
❌ *Cancelar / Recusar:* ${links.decline}
⚙️ *Abrir no painel administrativo:* ${links.panel}${links.intake ? `\n📋 *Consultar ficha de anamnese:* ${links.intake}` : ''}`;
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
