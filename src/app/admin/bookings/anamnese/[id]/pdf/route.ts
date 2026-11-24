import { createAnamnesisPdf } from '@/lib/anamnesis/pdf';
import { getAnamnesisDetails } from '@/lib/anamnesis/report';
import { readAdminAnamnesis } from '@/services/admin/anamnesis';

export const runtime = 'nodejs';

const privateHeaders = {
    'Cache-Control': 'private, no-store, max-age=0',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, unavailable } = await readAdminAnamnesis(id);
    if (!data) return new Response(null, { status: unavailable ? 503 : 404, headers: privateHeaders });
    const details = getAnamnesisDetails(data);
    if (!details) return new Response(null, { status: 404, headers: privateHeaders });

    try {
        const file = await createAnamnesisPdf(data, details);
        return new Response(new Uint8Array(file).buffer, {
            headers: {
                ...privateHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="ficha-anamnese-spasmooth.pdf"',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch {
        return new Response('PDF indisponível no momento.', { status: 503, headers: privateHeaders });
    }
}
