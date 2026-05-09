import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const revalidate = 60;

export async function GET(request: NextRequest) {
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json(
            { error: 'Configuração do Supabase ausente.' },
            { status: 500 }
        );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
        .from('services')
        .select('id, name, category, price, duration_minutes, description')
        .eq('active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

    if (category === 'massage' || category === 'waxing') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error("API Error [GET /api/services]:", error.message);
        return NextResponse.json(
            { error: 'Falha ao buscar serviços.' },
            { status: 500 }
        );
    }

    return NextResponse.json(data, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
    });
}
