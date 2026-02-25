import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const action = searchParams.get('action'); // 'confirm' or 'decline'

        if (!token || !action) {
            return new NextResponse('Parâmetros inválidos.', { status: 400 });
        }

        // Verifique o token no banco de dados
        const { data: lead, error: fetchError } = await supabase
            .from('leads')
            .select('*')
            .eq('confirmation_token', token)
            .single();

        if (fetchError || !lead) {
            return new NextResponse(
                `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><title>Erro</title><style>body{font-family:sans-serif; text-align:center; padding-top:50px; color:#475569;}</style></head><body><h2>Link Expirado ou Inválido</h2><p>Esta ação já foi tomada ou o link está incorreto.</p></body></html>`,
                { status: 404, headers: { 'Content-Type': 'text/html' } }
            );
        }

        // Determine target status
        const kanbanStatus = action === 'confirm' ? 'agendado' : 'cancelado';

        // Atualiza o status
        const { error: updateError } = await supabase
            .from('leads')
            .update({
                status_kanban: kanbanStatus,
                confirmation_token: null // Invalida o token para não ser usado 2 vezes
            })
            .eq('id', lead.id);

        if (updateError) {
            console.error('Erro ao atualizar lead:', updateError);
            return new NextResponse('Erro interno ao atualizar agendamento.', { status: 500 });
        }

        // Generate WhatsApp button for the client if confirmed or declined
        let clientActionHtml = '';
        if (lead.whatsapp) {
            const cleanPhone = lead.whatsapp.replace(/\D/g, '');
            const wppNumber = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;

            let textToClient = '';
            let btnColor = '';
            let btnIcon = '';
            let btnText = '';

            if (kanbanStatus === 'agendado') {
                textToClient = encodeURIComponent(`Olá ${lead.nome}! O seu agendamento para ${lead.service_name} foi CONFIRMADO. Te aguardamos! 😊`);
                btnColor = '#25D366';
                btnIcon = '💬';
                btnText = 'Enviar Confirmação para Cliente';
            } else {
                textToClient = encodeURIComponent(`Olá ${lead.nome}! Infelizmente não poderemos confirmar o seu agendamento da especialidade ${lead.service_name} para este momento. Por favor, entre em contato para remarcarmos!`);
                btnColor = '#eab308'; // Amarelo
                btnIcon = '⚠️';
                btnText = 'Avisar Cancelamento ao Cliente';
            }

            clientActionHtml = `
            <div style="margin-top: 30px;">
                <a href="https://wa.me/${wppNumber}?text=${textToClient}" target="_blank" style="display: inline-block; background-color: ${btnColor}; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-family: sans-serif; font-size: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid rgba(0,0,0,0.1);">
                    ${btnIcon} ${btnText}
                </a>
            </div>
            `;
        }

        // Renderiza uma página de sucesso simples
        const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ação Confirmada</title>
          <style>
              body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0fdfa; margin: 0; color: #0f766e; text-align: center; }
              .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; width: 90%; border: 1px solid #ccfbf1;}
              h1 { font-size: 1.5rem; margin-bottom: 1rem; }
              p { font-size: 1rem; color: #475569; }
          </style>
      </head>
      <body>
          <div class="card">
              <h1>${kanbanStatus === 'agendado' ? '✅ Confirmado!' : '❌ Cancelado'}</h1>
              <p>O status do cliente <strong>${lead.nome}</strong> foi atualizado para <b>${kanbanStatus}</b> com sucesso.</p>
              ${clientActionHtml}
              <br/>
              <p style="font-size: 0.8rem; color: #94a3b8">Você já pode voltar para o WhatsApp ou fechar esta tela.</p>
          </div>
      </body>
      </html>
    `;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (err) {
        console.error('Action route error:', err);
        return new NextResponse('Erro interno no servidor.', { status: 500 });
    }
}
