import { NextResponse } from 'next/server';
import {
    ANAMNESIS_RETURN_COOKIE,
    ANAMNESIS_RETURN_COOKIE_PATH,
    ANAMNESIS_RETURN_MAX_AGE,
    anamnesisPanelPath,
    createAnamnesisReturn,
    decodeAnamnesisCode,
} from '@/lib/anamnesis/short-link';
import { capabilitySecret } from '@/lib/security/server';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const id = decodeAnamnesisCode(code);
    if (!id) return new Response(null, { status: 404 });

    const location = anamnesisPanelPath(id);
    // Start a same-origin navigation after the WhatsApp opener lands here so
    // the authorized panel can receive its existing SameSite=Strict cookie.
    const response = new NextResponse(`<!doctype html><html lang="pt-BR"><meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="refresh" content="0;url=${location}">
        <title>Ficha SpaSmooth</title><main><a href="${location}">Abrir ficha no painel SpaSmooth</a></main></html>`, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
    response.cookies.set(ANAMNESIS_RETURN_COOKIE, createAnamnesisReturn(id, capabilitySecret()), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: ANAMNESIS_RETURN_COOKIE_PATH,
        maxAge: ANAMNESIS_RETURN_MAX_AGE,
    });
    return response;
}
