import { NextResponse } from 'next/server';
import {
    ANAMNESIS_RETURN_COOKIE, ANAMNESIS_RETURN_COOKIE_PATH,
    ANAMNESIS_RETURN_MAX_AGE, anamnesisPdfLoginPath, createAnamnesisReturn,
} from '@/lib/anamnesis/short-link';
import { createAnamnesisPdf } from '@/lib/anamnesis/pdf';
import { getAnamnesisDetails } from '@/lib/anamnesis/report';
import { capabilitySecret } from '@/lib/security/server';
import { readAdminAnamnesis } from '@/services/admin/anamnesis';

export const runtime = 'nodejs';

const privateHeaders = {
    'Cache-Control': 'private, no-store, max-age=0',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const query = new URL(request.url).searchParams;
    const fromWhatsApp = query.get('origem') === 'whatsapp';
    const { data, unavailable, restricted, requiresSession } = await readAdminAnamnesis(id);
    if (!data) {
        if (!fromWhatsApp) return new Response(null, { status: unavailable ? 503 : 404, headers: privateHeaders });
        if (requiresSession && query.get('retorno') !== '1') {
            const response = new NextResponse(null, {
                status: 303,
                headers: { ...privateHeaders, Location: anamnesisPdfLoginPath(id) },
            });
            response.cookies.set(ANAMNESIS_RETURN_COOKIE, createAnamnesisReturn(id, capabilitySecret(), 'pdf'), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: ANAMNESIS_RETURN_COOKIE_PATH,
                maxAge: ANAMNESIS_RETURN_MAX_AGE,
            });
            return response;
        }
        if (restricted || requiresSession) {
            return new Response('A sessão ou a conta atual não permite abrir este PDF.', { status: 403, headers: privateHeaders });
        }
        return unavailable
            ? new Response('PDF indisponível no momento. Tente novamente.', { status: 503, headers: privateHeaders })
            : new Response('Ficha indisponível.', { status: 404, headers: privateHeaders });
    }
    const details = getAnamnesisDetails(data);
    if (!details) {
        const message = data.status === 'purged' ? 'A ficha foi descartada.' : 'A ficha ainda não tem um PDF disponível.';
        return new Response(fromWhatsApp ? message : null, { status: 404, headers: privateHeaders });
    }

    try {
        const file = await createAnamnesisPdf(data, details);
        return new Response(new Uint8Array(file).buffer, {
            headers: {
                ...privateHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `${fromWhatsApp ? 'inline' : 'attachment'}; filename="ficha-anamnese-spasmooth.pdf"`,
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch {
        return new Response('PDF indisponível no momento.', { status: 503, headers: privateHeaders });
    }
}
