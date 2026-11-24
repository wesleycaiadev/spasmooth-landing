import 'server-only';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { getAnamnesisDetails, type AnamnesisReport } from '@/lib/anamnesis/report';
import { createAnamnesisPdf } from '@/lib/anamnesis/pdf';

const privateHeaders = {
    'Cache-Control': 'private, no-store, max-age=0',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
};

export async function generateAnamnesisPdfResponse(bookingId: string, actor = 'whatsapp-direct-pdf'): Promise<Response> {
    if (!z.string().uuid().safeParse(bookingId).success) {
        return new Response('Identificador de agendamento inválido.', { status: 400, headers: privateHeaders });
    }

    try {
        const db = createAdminClient();
        const { data, error } = await db.rpc('read_booking_anamnesis', {
            p_booking_id: bookingId,
            p_actor: actor,
        });

        if (error || !data) {
            console.error('[anamnesis-pdf] Erro ao carregar ficha de anamnese:', error);
            return new Response('Ficha de anamnese não encontrada ou indisponível.', { status: 404, headers: privateHeaders });
        }

        const report = data as AnamnesisReport;
        if (!report.submission) {
            return new Response('Ficha de anamnese ainda não foi preenchida pelo cliente.', { status: 404, headers: privateHeaders });
        }

        const details = getAnamnesisDetails(report);
        if (!details) {
            return new Response('Dados da ficha de anamnese incompletos.', { status: 404, headers: privateHeaders });
        }

        const file = await createAnamnesisPdf(report, details);
        const safeName = (report.client_name || 'cliente')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 40);

        return new Response(new Uint8Array(file).buffer, {
            status: 200,
            headers: {
                ...privateHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="anamnese-${safeName}.pdf"`,
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (err) {
        console.error('[anamnesis-pdf] Erro inesperado ao gerar PDF:', err);
        return new Response('PDF indisponível no momento. Tente novamente mais tarde.', { status: 503, headers: privateHeaders });
    }
}

