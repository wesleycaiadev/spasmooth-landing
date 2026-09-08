import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { requireSameOrigin, rateLimit } from '@/lib/security/server';
import { sanitizeImage, MAX_UPLOAD_BYTES } from '@/lib/security/upload';
import { z } from 'zod';
export const runtime = 'nodejs';
const BUCKET = 'professional-photos';

async function guard(request) {
    try { requireSameOrigin(request); } catch { return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 }); }
    const admin = await verifyAdmin();
    if (!admin.success) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    if (!await rateLimit('upload', 20, 300, admin.userId)) return NextResponse.json({ error: 'Muitas solicitações.' }, { status: 429, headers: { 'Retry-After': '300' } });
    return null;
}
export async function POST(request) {
    try {
        const denied = await guard(request); if (denied) return denied;
        const length = Number(request.headers.get('content-length'));
        if (!Number.isSafeInteger(length) || length <= 0 || length > MAX_UPLOAD_BYTES + 65536) return NextResponse.json({ error: 'Arquivo excede o limite de 4 MB ou tamanho ausente.' }, { status: 413 });
        let buffer;
        try {
            const form = await request.formData();
            const file = form.get('file');
            if (!file || typeof file === 'string' || file.size > MAX_UPLOAD_BYTES) throw new Error();
            buffer = await sanitizeImage(Buffer.from(await file.arrayBuffer()), file.type);
        } catch { return NextResponse.json({ error: 'Imagem inválida. Use JPEG, PNG ou WebP estático de até 4 MB.' }, { status: 400 }); }
        const fileName = `${crypto.randomUUID()}.webp`;
        const db = createAdminClient();
        const { error } = await db.storage.from(BUCKET).upload(fileName, buffer, { contentType: 'image/webp', upsert: false });
        if (error) return NextResponse.json({ error: 'Falha ao salvar imagem.' }, { status: 500 });
        return NextResponse.json({ success: true, url: db.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl, fileName });
    } catch { return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 }); }
}
export async function DELETE(request) {
    try {
        const denied = await guard(request); if (denied) return denied;
        const length = Number(request.headers.get('content-length'));
        if (length > 4096) return NextResponse.json({ error: 'Dados excedem o limite.' }, { status: 413 });
        let target;
        try {
            const input = z.object({ fileName: z.string().max(255).optional(), url: z.string().max(2048).optional() }).strict().parse(await request.json());
            target = input.fileName;
            if (input.url) {
                const url = new URL(input.url);
                const prefix = `/storage/v1/object/public/${BUCKET}/`;
                if (url.origin !== new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin || !url.pathname.startsWith(prefix)) throw new Error();
                target = decodeURIComponent(url.pathname.slice(prefix.length));
            }
            if (!target || !/^[a-zA-Z0-9_-][a-zA-Z0-9_. -]{0,250}\.(?:jpe?g|png|webp)$/.test(target) || target.includes('..')) throw new Error();
        } catch { return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 }); }
        const { error } = await createAdminClient().storage.from(BUCKET).remove([target]);
        return error ? NextResponse.json({ error: 'Falha ao remover imagem.' }, { status: 500 }) : NextResponse.json({ success: true });
    } catch { return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 }); }
}
