import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token'); // leadId
    const action = searchParams.get('action'); // confirm or decline

    if (!token || !action) {
        return NextResponse.json({ error: "Missing token or action" }, { status: 400 });
    }

    try {
        let newStatus = '';
        let message = '';

        if (action === 'confirm') {
            newStatus = 'agendado';
            message = '✅ Agendamento confirmado com sucesso! O cliente agora está na fila de "Agendados".';
        } else if (action === 'decline') {
            newStatus = 'cancelado';
            message = '❌ Agendamento recusado/cancelado com sucesso.';
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Buscar os dados do lead para pegar o WhatsApp e o Nome
        const { data: lead, error: fetchError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', token)
            .single();

        if (fetchError || !lead) {
            console.error("Erro ao buscar lead:", fetchError);
            return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
        }

        // Atualizar no Supabase
        const { error: updateError } = await supabase
            .from('leads')
            .update({ status_kanban: newStatus })
            .eq('id', token);

        if (updateError) throw updateError;

        // Montar link do WhatsApp para o Admin engajar o cliente
        const phone = lead.whatsapp?.replace(/\D/g, '');
        const clientName = lead.nome?.split(' ')[0] || "Cliente";

        let whatsAppMessage = "";
        if (action === 'confirm') {
            const dateStr = lead.appointment_date ? new Date(lead.appointment_date + 'T00:00:00').toLocaleDateString() : 'data a definir';
            const timeStr = lead.appointment_time || 'horário a definir';
            whatsAppMessage = encodeURIComponent(`Olá *${clientName}*, confirmando seu agendamento no SpaSmooth para o dia *${dateStr}* às *${timeStr}*. Estamos te esperando! ✨`);
        } else if (action === 'decline') {
            whatsAppMessage = encodeURIComponent(`Olá *${clientName}*, vimos que houve um imprevisto e seu horário foi cancelado. Deseja reagendar para outro momento no SpaSmooth? 🙌`);
        }

        const whatsappLink = phone ? `https://wa.me/55${phone}?text=${whatsAppMessage}` : null;

        // Retornando uma interface visual simples para o Admin
        const html = `
            <html>
                <head>
                    <title>Ação Confirmada</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8fafc; margin: 0; }
                        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; width: 90%; }
                        h1 { color: #0f172a; font-size: 1.5rem; margin-bottom: 1rem; }
                        p { color: #475569; margin-bottom: 2rem; }
                        .btn-group { display: flex; flex-direction: column; gap: 10px; }
                        a { display: inline-block; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 9999px; font-weight: bold; transition: opacity 0.2s; }
                        a:hover { opacity: 0.9; }
                        .btn-whatsapp { background: #25D366; color: white; }
                        .btn-panel { background: #0891b2; color: white; }
                        .svg-icon { vertical-align: middle; margin-right: 6px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Tudo certo!</h1>
                        <p>${message}</p>
                        <div class="btn-group">
                            ${whatsappLink ? `
                            <a href="${whatsappLink}" target="_blank" class="btn-whatsapp">
                                <svg class="svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Falar com o Cliente
                            </a>
                            ` : ''}
                            <a href="/admin/kanban" class="btn-panel">Voltar ao Painel</a>
                        </div>
                    </div>
                </body>
            </html>
        `;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });

    } catch (error) {
        console.error("Erro ao processar ação de agendamento:", error);
        return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 });
    }
}
