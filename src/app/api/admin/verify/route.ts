import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
    const result = await verifyAdmin();

    return NextResponse.json({
        isAdmin: result.success,
    });
}
