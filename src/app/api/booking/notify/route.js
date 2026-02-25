import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request) {
    try {
        const { lead_id } = await request.json();

        if (!lead_id) {
            return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 });
        }

        // Fetch lead details
        const { data: lead, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', lead_id)
            .single();

        if (error || !lead) {
            console.error('Lead not found for notification:', error);
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Prepare WhatsApp Message
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // Check if token exists
        const token = lead.confirmation_token;

        if (!token) {
            console.warn('No confirmation token provided by DB. Skipping secure link generation. Did you run the SQL script?');
            return NextResponse.json({ error: 'No token available (SQL not run yet)' }, { status: 400 });
        }

        const confirmUrl = `${siteUrl}/api/booking/action?token=${token}&action=confirm`;
        const declineUrl = `${siteUrl}/api/booking/action?token=${token}&action=decline`;

        // Remove accents from the text to prevent CallMeBot from dropping characters
        const removeAccents = (str) => {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

        const message = removeAccents(
            `🔔 *Novo Agendamento*\n\n` +
            `👤 *Cliente:* ${lead.nome}\n` +
            `☎️ *WhatsApp:* ${lead.whatsapp || 'N/A'}\n` +
            `💆‍♀️ *Servico:* ${lead.service_name || 'N/A'}\n` +
            `📅 *Data:* ${lead.appointment_date || 'N/A'} as ${lead.appointment_time || 'N/A'}\n\n` +
            `👇 *Escolha uma acao:*\n\n` +
            `✅ *[ CONFIRMAR HORARIO ]*\n` +
            `${confirmUrl}\n\n` +
            `❌ *[ RECUSAR / CANCELAR ]*\n` +
            `${declineUrl}`
        );

        // Send the message
        const success = await sendWhatsAppMessage(process.env.CALLMEBOT_PHONE, message);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 });
        }

    } catch (err) {
        console.error('Error in notify API:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
