import { NextResponse } from 'next/server';
import { notifyBookingSchema } from '@/lib/validations/notify';

export async function POST(request) {
    try {
        const body = await request.json();

        const parsed = notifyBookingSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados de notificação inválidos.' }, { status: 400 });
        }

        const { leadId, name, whatsapp, service, date, time, professionalName, location } = parsed.data;

        const adminPhone = process.env.CALLMEBOT_PHONE;
        const apiKey = process.env.CALLMEBOT_APIKEY;

        const reqUrl = new URL(request.url);
        const siteUrl = `${reqUrl.protocol}//${reqUrl.host}`;

        if (!adminPhone || !apiKey) {
            console.warn("CallMeBot Admin Phone or API Key not found in environment.");
            return NextResponse.json({ success: true, warning: 'Notificação não configurada.' });
        }

        const cleanName = (name || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanService = (service || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanProfessional = (professionalName || 'Nao especificado').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanLocation = (location || 'Nao especificada').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const messageText = `*Novo Agendamento*\\n\\n*Cliente:* ${cleanName}\\n*WhatsApp:* ${whatsapp}\\n*Servico:* ${cleanService}\\n*Profissional:* ${cleanProfessional}\\n*Local:* ${cleanLocation}\\n*Data:* ${date} as ${time}\\n\\n*Escolha uma acao clicando no link desejado:*\\n\\n✅ CONFIRMAR:\\n${siteUrl}/api/booking/action?token=${leadId}&action=confirm\\n\\n❌ CANCELAR/RECUSAR:\\n${siteUrl}/api/booking/action?token=${leadId}&action=decline`;

        const encodedMessage = encodeURIComponent(messageText);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodedMessage}&apikey=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error("Erro ao enviar mensagem para CallMeBot:", await response.text());
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erro no Webhook de Notificação:", error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
