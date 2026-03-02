import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token'); // leadId
    const action = searchParams.get('action'); // confirm or decline

    if (!token || !action) {
        return NextResponse.json({ error: "Missing token or action" }, { status: 400 });
    }

    try {
        let newStatus = '';
        let message = '';

        if (action === 'confirm') {
            newStatus = 'agendado';
            message = '✅ Agendamento confirmado com sucesso! O cliente agora está na fila de "Agendados".';
        } else if (action === 'decline') {
            newStatus = 'cancelado';
            message = '❌ Agendamento recusado/cancelado com sucesso.';
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Atualizar no Supabase
        const { error } = await supabase
            .from('leads')
            .update({ status_kanban: newStatus })
            .eq('id', token);

        if (error) throw error;

        // Retornando uma interface visual simples para o Admin
        const html = `
            <html>
                <head>
                    <title>Ação Confirmada</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8fafc; margin: 0; }
                        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; }
                        h1 { color: #0f172a; font-size: 1.5rem; margin-bottom: 1rem; }
                        p { color: #475569; margin-bottom: 2rem; }
                        a { display: inline-block; background: #0891b2; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 9999px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Tudo certo!</h1>
                        <p>${message}</p>
                        <a href="/admin/kanban">Voltar ao Painel</a>
                    </div>
                </body>
            </html>
        `;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });

    } catch (error) {
        console.error("Erro ao processar ação de agendamento:", error);
        return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 });
    }
}
