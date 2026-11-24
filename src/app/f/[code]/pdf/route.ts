import { anamnesisPdfPath, decodeAnamnesisCode } from '@/lib/anamnesis/short-link';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const bookingId = decodeAnamnesisCode(code);
    if (!bookingId) {
        return new Response('O link do PDF é inválido.', { status: 404 });
    }

    const location = anamnesisPdfPath(bookingId);
    // Load a same-origin document before requesting the PDF so a WhatsApp
    // opener can reuse the site's existing SameSite=Strict admin cookie.
    return new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="refresh" content="0;url=${location}">
        <title>PDF da anamnese</title><main><a href="${location}">Abrir PDF da anamnese</a></main></html>`, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
