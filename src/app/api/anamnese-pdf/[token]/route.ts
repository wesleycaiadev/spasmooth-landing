import { decodeAnamnesisCode } from '@/lib/anamnesis/short-link';
import { readAnamnesisPdfToken } from '@/lib/anamnesis/pdf-token';
import { generateAnamnesisPdfResponse } from '@/services/anamnesis-pdf';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const bookingId = readAnamnesisPdfToken(token) || decodeAnamnesisCode(token);
    if (!bookingId) {
        return new Response('Token inválido ou expirado.', { status: 404 });
    }
    return generateAnamnesisPdfResponse(bookingId, 'whatsapp-token-pdf');
}

