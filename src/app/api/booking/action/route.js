import { NextResponse } from 'next/server';
// Old links contain only a database ID. Never treat them as authorization.
export async function GET(request) {
    return NextResponse.redirect(new URL('/admin/kanban', request.url), { status: 303, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
