import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function GET(request) {
    try {
        const supabase = createAdminClient();
        
        const proData = {
            name: 'Day',
            specialties: ['Terapia Tântrica', 'Massagem Relaxante Especial'],
            photo_url: '/images/professionals/day/day (1).jpeg',
            gallery_urls: [
                '/images/professionals/day/day (1).jpeg',
                '/images/professionals/day/day (2).jpeg',
                '/images/professionals/day/day (3).jpeg'
            ],
            location: 'Aracaju',
            active: true
        };
        
        // Verifica se já existe para evitar duplicação
        const { data: existing } = await supabase
            .from('professionals')
            .select('id')
            .eq('name', 'Day')
            .single();

        if (existing) {
            return NextResponse.json({ success: true, message: 'Day já existe no banco', data: existing });
        }

        const { data, error } = await supabase
            .from('professionals')
            .insert([proData]);

        if (error) {
            console.error('Erro ao inserir Day:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Day inserida com sucesso!', data });
    } catch (err) {
        console.error('Erro interno:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
