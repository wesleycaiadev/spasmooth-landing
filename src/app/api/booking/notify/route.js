import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { leadId, name, whatsapp, service, date, time } = body;

        const adminPhone = process.env.CALLMEBOT_PHONE;
        const apiKey = process.env.CALLMEBOT_APIKEY;

        // Dynamically get the base URL from the incoming request
        const reqUrl = new URL(request.url);
        const siteUrl = `${reqUrl.protocol}//${reqUrl.host}`;

        if (!adminPhone || !apiKey) {
            console.warn("CallMeBot Admin Phone or API Key not found in environment.");
            return NextResponse.json({ success: true, warning: 'CallMeBot configurado de forma incompleta, mas salvo no DB.' });
        }

        // Como a API do CallMeBot costuma "engolir" os caracteres com acento (fazendo "Serviço" virar "Servio" e "Ação" virar "Acao"), 
        // a solução mais robusta é remover todos os acentos e usar palavras equivalentes (Servico, Acao, Horario).
        const cleanName = (name || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanService = (service || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const messageText = `*Novo Agendamento*\n\n*Cliente:* ${cleanName}\n*WhatsApp:* ${whatsapp}\n*Servico:* ${cleanService}\n*Data:* ${date} as ${time}\n\n*Escolha uma acao clicando no link desejado:*\n\n✅ CONFIRMAR:\n${siteUrl}/api/booking/action?token=${leadId}&action=confirm\n\n❌ CANCELAR/RECUSAR:\n${siteUrl}/api/booking/action?token=${leadId}&action=decline`;

        const encodedMessage = encodeURIComponent(messageText);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodedMessage}&apikey=${apiKey}`;

        // Enviar a requisição para o CallMeBot
        const response = await fetch(url);

        if (!response.ok) {
            console.error("Erro ao enviar mensagem para CallMeBot:", await response.text());
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erro no Webhook de Notificação:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
