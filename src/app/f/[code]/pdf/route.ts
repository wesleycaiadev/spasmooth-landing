import { decodeAnamnesisCode } from '@/lib/anamnesis/short-link';
import { generateAnamnesisPdfResponse } from '@/services/anamnesis-pdf';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const bookingId = decodeAnamnesisCode(code);
    if (!bookingId) {
        return new Response('Código de ficha inválido ou expirado.', { status: 404 });
    }
    return generateAnamnesisPdfResponse(bookingId, 'whatsapp-shortlink-pdf');
}

