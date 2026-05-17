import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

/** Escapa HTML para prevenir XSS */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Normaliza telefone para link wa.me (remove DDI 55 duplicado) */
function formatWhatsAppPhone(phone) {
    const digits = (phone || '').replace(/\D/g, '');
    // Se já começa com 55 e tem 12-13 dígitos, não duplicar
    if (digits.startsWith('55') && digits.length >= 12) return digits;
    return `55${digits}`;
}

export async function GET(request) {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token || !action) {
        return NextResponse.json({ error: "Missing token or action" }, { status: 400 });
    }

    // Validar formato UUID para prevenir injection
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
        return NextResponse.json({ error: "Token inválido" }, { status: 400 });
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

        // Buscar os dados do lead
        const { data: lead, error: fetchError } = await supabase
            .from('leads')
            .select(`
                *,
                professionals (
                    name,
                    location
                )
            `)
            .eq('id', token)
            .single();

        if (fetchError || !lead) {
            return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
        }

        // Verificar se a transição é válida (prevenir replay)
        if (lead.status_kanban === newStatus) {
            return buildHtmlResponse(`⚠️ Este agendamento já está com status "${newStatus}".`, null);
        }

        // Atualizar lead
        const { error: updateError } = await supabase
            .from('leads')
            .update({ status_kanban: newStatus })
            .eq('id', token);

        if (updateError) throw updateError;

        // Sincronizar com tabela bookings
        const bookingStatus = newStatus === 'agendado' ? 'confirmado' : newStatus;
        await supabase
            .from('bookings')
            .update({ status: bookingStatus })
            .eq('id', token);

        // Montar link do WhatsApp para o Admin engajar o cliente
        const phone = formatWhatsAppPhone(lead.whatsapp);
        const clientName = escapeHtml(lead.nome?.split(' ')[0] || "Cliente");

        const professionalName = escapeHtml(lead.professionals?.name || 'nossa equipe');
        const locationName = escapeHtml(lead.professionals?.location || 'SpaSmooth');

        let whatsAppMessage = "";
        if (action === 'confirm') {
            const dateStr = lead.appointment_date ? new Date(lead.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'data a definir';
            const timeStr = lead.appointment_time ? lead.appointment_time.slice(0, 5) : 'horário a definir';
            const serviceName = lead.service_name ? lead.service_name.split(' - ')[0] : '';
            const serviceStr = serviceName ? ` para *${serviceName}*` : '';
            whatsAppMessage = encodeURIComponent(`Olá *${lead.nome?.split(' ')[0] || 'Cliente'}*, confirmando seu agendamento${serviceStr} com *${lead.professionals?.name || 'nossa equipe'}* (*${lead.professionals?.location || 'SpaSmooth'}*) para o dia *${dateStr}* às *${timeStr}*. Estamos te esperando! ✨`);
        } else if (action === 'decline') {
            whatsAppMessage = encodeURIComponent(`Olá *${lead.nome?.split(' ')[0] || 'Cliente'}*, vimos que houve um imprevisto e seu horário foi cancelado. Deseja reagendar para outro momento no SpaSmooth? 🙌`);
        }

        const whatsappLink = phone ? `https://wa.me/${phone}?text=${whatsAppMessage}` : null;

        return buildHtmlResponse(escapeHtml(message), whatsappLink);

    } catch (error) {
        console.error("Erro ao processar ação de agendamento:", error);
        return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 });
    }
}

function buildHtmlResponse(message, whatsappLink) {
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
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Tudo certo!</h1>
                    <p>${message}</p>
                    <div class="btn-group">
                        ${whatsappLink ? `<a href="${escapeHtml(whatsappLink)}" target="_blank" class="btn-whatsapp">📱 Falar com o Cliente</a>` : ''}
                        <a href="/admin/kanban" class="btn-panel">Voltar ao Painel</a>
                    </div>
                </div>
            </body>
        </html>
    `;

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
