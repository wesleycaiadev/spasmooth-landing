import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'professional-photos';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',') : [];

function generateUniqueId() {
    return crypto.randomUUID();
}

function sanitizeFileName(rawName) {
    const dotIdx = rawName.lastIndexOf('.');
    const baseName = dotIdx > 0 ? rawName.slice(0, dotIdx) : rawName;
    const ext = dotIdx > 0 ? rawName.slice(dotIdx + 1).toLowerCase() : '';

    const sanitized = baseName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[()[\]{}]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();

    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    return `${generateUniqueId()}_${sanitized || 'upload'}.${safeExt}`;
}

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
        }

        const user = await currentUser();
        const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

        if (!email || (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email))) {
            return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
        }

        let formData;
        try {
            formData = await request.formData();
        } catch (parseErr) {
            console.error('[Upload] Falha ao parsear FormData:', parseErr);
            return NextResponse.json({ error: 'Falha ao processar dados do formulário.' }, { status: 400 });
        }

        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            console.error('[Upload] Nenhum arquivo recebido.');
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        console.log(`[Upload] Arquivo recebido: "${file.name}" | tipo: ${file.type} | tamanho: ${file.size} bytes`);

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: `Formato inválido (${file.type}). Use JPG, PNG ou WebP.` }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo 5 MB.` }, { status: 400 });
        }

        const fileName = sanitizeFileName(file.name);
        console.log(`[Upload] Nome sanitizado: "${fileName}"`);

        let buffer;
        try {
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } catch (bufferErr) {
            console.error('[Upload] Falha ao converter arquivo para buffer:', bufferErr);
            return NextResponse.json({ error: 'Falha ao processar o arquivo.' }, { status: 500 });
        }

        const supabase = createAdminClient();

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('[Upload] Supabase Storage error:', uploadError);
            return NextResponse.json({ error: 'Falha no processamento do arquivo.' }, { status: 500 });
        }

        console.log('[Upload] Upload bem-sucedido:', uploadData?.path || fileName);

        const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(fileName);

        const publicUrl = urlData?.publicUrl;

        if (!publicUrl) {
            console.error('[Upload] Falha ao gerar URL pública para:', fileName);
            return NextResponse.json({ error: 'Upload concluído mas falha ao gerar URL pública.' }, { status: 500 });
        }

        console.log('[Upload] URL pública:', publicUrl);

        return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName,
        });
    } catch (error) {
        console.error('[Upload] Erro interno não tratado:', error?.message || error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

        const user = await currentUser();
        const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

        if (!email || (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email))) {
            return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
        }

        const { fileName, url } = await request.json();

        let targetFileName = fileName;
        if (url) {
            const urlObj = new URL(url);
            const segments = urlObj.pathname.split('/');
            targetFileName = segments[segments.length - 1];
        }

        if (!targetFileName || typeof targetFileName !== 'string' || targetFileName.includes('/') || targetFileName.includes('..')) {
            return NextResponse.json({ error: 'Nome do arquivo inválido.' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase.storage.from(BUCKET).remove([targetFileName]);

        if (error) {
            console.error('[Delete] Supabase error:', error.message);
            return NextResponse.json({ error: 'Falha ao remover imagem.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Delete] Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
}