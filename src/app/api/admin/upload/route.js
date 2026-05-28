import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'professional-photos';

export async function POST(request) {
    try {
        // 1. Verificar auth admin
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
        }

        const user = await currentUser();
        const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

        if (!email || !ADMIN_EMAILS.includes(email)) {
            return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
        }

        // 2. Parse do FormData
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        // 3. Validações de segurança
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Formato inválido. Use JPG, PNG ou WebP.' },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'Arquivo muito grande. Máximo 5 MB.' },
                { status: 400 }
            );
        }

        // 4. Gerar nome único para o arquivo
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const sanitizedExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
        const fileName = `${crypto.randomUUID()}.${sanitizedExt}`;

        // 5. Upload para Supabase Storage
        const supabase = createAdminClient();

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('[Upload] Supabase Storage error:', uploadError.message);
            return NextResponse.json(
                { error: 'Falha ao fazer upload da imagem.' },
                { status: 500 }
            );
        }

        // 6. Retornar URL pública
        const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            fileName,
        });
    } catch (error) {
        console.error('[Upload] Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        // 1. Verificar auth admin
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
        }

        const user = await currentUser();
        const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

        if (!email || !ADMIN_EMAILS.includes(email)) {
            return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
        }

        // 2. Obter o fileName a ser deletado
        const { fileName } = await request.json();

        if (!fileName || typeof fileName !== 'string') {
            return NextResponse.json({ error: 'Nome do arquivo inválido.' }, { status: 400 });
        }

        // 3. Validar formato do fileName (prevenir path traversal)
        if (fileName.includes('/') || fileName.includes('..')) {
            return NextResponse.json({ error: 'Nome do arquivo inválido.' }, { status: 400 });
        }

        // 4. Deletar do Supabase Storage
        const supabase = createAdminClient();
        const { error } = await supabase.storage
            .from(BUCKET)
            .remove([fileName]);

        if (error) {
            console.error('[Delete] Supabase Storage error:', error.message);
            return NextResponse.json(
                { error: 'Falha ao remover imagem.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Delete] Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
}
