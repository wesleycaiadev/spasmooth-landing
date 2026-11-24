import { temporaryAnamnesisPdfLinksEnabled } from '@/lib/anamnesis/config';
import { anamnesisPdfPrivateHeaders, anamnesisPdfResponse } from '@/lib/anamnesis/pdf';
import { getAnamnesisDetails } from '@/lib/anamnesis/report';
import { anamnesisPdfPath, decodeAnamnesisCode } from '@/lib/anamnesis/short-link';
import { validTemporaryAnamnesisPdfToken } from '@/lib/anamnesis/temporary-pdf-link';
import { readRequestBody, RequestBodyError } from '@/lib/security/request-body';
import { capabilitySecret } from '@/lib/security/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type RouteParams = { params: Promise<{ code: string }> };

function pdfPage(content: string, status = 200) {
    return new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>PDF da anamnese</title>${content}`, {
        status,
        headers: { ...anamnesisPdfPrivateHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
}

export async function GET(_request: Request, { params }: RouteParams) {
    const { code } = await params;
    const bookingId = decodeAnamnesisCode(code);
    if (!bookingId) {
        return pdfPage('<main><p>O link do PDF é inválido.</p></main>', 404);
    }

    const location = anamnesisPdfPath(bookingId);
    const open = temporaryAnamnesisPdfLinksEnabled()
        ? `<form id="pdf-access" method="post" action="/f/${code}/pdf"><input type="hidden" name="token"></form>
            <script defer src="/open-anamnesis-pdf.js"></script>`
        : `<meta http-equiv="refresh" content="0;url=${location}">`;
    return pdfPage(`${open}<main><a id="pdf-panel" href="${location}">Abrir PDF pelo painel</a></main>`);
}

export async function POST(request: Request, { params }: RouteParams) {
    const { code } = await params;
    const bookingId = decodeAnamnesisCode(code);
    if (!bookingId) return pdfPage('<main><p>O link do PDF é inválido.</p></main>', 404);

    const fallback = `<a href="${anamnesisPdfPath(bookingId)}">Abrir PDF pelo painel</a>`;
    const expired = () => pdfPage(`<main><p>Este link expirou ou está indisponível.</p>${fallback}</main>`, 410);
    if (!temporaryAnamnesisPdfLinksEnabled()) return expired();

    try {
        const body = new URLSearchParams((await readRequestBody(request, 96)).toString());
        if (!validTemporaryAnamnesisPdfToken(code, body.get('token'), capabilitySecret())) return expired();

        const { data, error } = await createAdminClient().rpc('read_booking_anamnesis', {
            p_booking_id: bookingId,
            p_actor: 'link-temporario-whatsapp',
        });
        if (error) throw new Error('Anamnesis unavailable');
        const details = data && getAnamnesisDetails(data);
        if (!details) return pdfPage(`<main><p>A ficha está indisponível.</p>${fallback}</main>`, 404);
        return await anamnesisPdfResponse(data, details, 'inline');
    } catch (error) {
        if (error instanceof RequestBodyError) return expired();
        return pdfPage(`<main><p>PDF indisponível no momento. Tente novamente.</p>${fallback}</main>`, 503);
    }
}
