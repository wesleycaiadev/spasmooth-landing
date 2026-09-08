import { NextResponse } from 'next/server';
// Notifications originate only from the validated booking workflow on the server.
export async function POST() {
    return NextResponse.json({ error: 'Endpoint desativado.' }, { status: 410 });
}
