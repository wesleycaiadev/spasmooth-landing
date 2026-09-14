"use server";

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { readBookingActionToken, type BookingAction } from '@/lib/booking-actions';
import { isSameOrigin } from '@/lib/security/policy';
import { rateLimit, trustedOrigins } from '@/lib/security/server';

type BookingActionPreview = {
    id: string;
    action: BookingAction;
    status: string;
    clientName: string;
    clientPhone: string;
    serviceName: string;
    professionalName: string;
    unit: string;
    startsAt: string;
};

type BookingActionPageResult =
    | { success: true; data: BookingActionPreview }
    | { success: false; error: 'invalid' | 'not_found' };

const formTokenSchema = z.string().min(1).max(2048);

function actionResultUrl(token: string, result: string) {
    return `/agendamento/acao/${encodeURIComponent(token)}?resultado=${encodeURIComponent(result)}`;
}

function escapeWhatsAppText(value: string) {
    return value.replace(/[\r\n]+/g, ' ').replace(/([*_~`])/g, '\\$1').trim();
}

function clientWhatsAppUrl(data: BookingActionPreview): string {
    const digits = data.clientPhone.replace(/\D/g, '');
    if (!digits) return new URL('/admin/bookings', process.env.NEXT_PUBLIC_SITE_URL || 'https://spasmooth.com.br').toString();

    const startsAt = new Date(data.startsAt);
    const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Maceio' }).format(startsAt);
    const time = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Maceio', hour: '2-digit', minute: '2-digit', hour12: false }).format(startsAt);
    const confirmed = data.action === 'confirmar';
    const message = confirmed
        ? `Olá, ${escapeWhatsAppText(data.clientName)}! 🌿\n\nSeu agendamento no *Spa Smooth* foi confirmado. ✅\n\n💆 *Serviço:* ${escapeWhatsAppText(data.serviceName)}\n👩‍⚕️ *Profissional:* ${escapeWhatsAppText(data.professionalName)}\n📍 *Local:* ${escapeWhatsAppText(data.unit)}\n📅 *Data:* ${date}\n🕐 *Horário:* ${time}\n\nSeu horário está reservado. 💚\n\nCaso precise alterar ou cancelar, entre em contato conosco pelo WhatsApp.`
        : `Olá, ${escapeWhatsAppText(data.clientName)}! 🌿\n\nRecebemos sua solicitação de agendamento para:\n\n💆 *Serviço:* ${escapeWhatsAppText(data.serviceName)}\n📅 *Data:* ${date}\n🕐 *Horário:* ${time}\n\nInfelizmente, não conseguimos confirmar esse horário.\n\nFale conosco por aqui e vamos encontrar outro horário disponível para você. 💚`;
    return `https://wa.me/55${digits}?text=${encodeURIComponent(message)}`;
}

async function loadBookingActionPreview(id: string, action: BookingAction): Promise<BookingActionPageResult> {
    const { data, error } = await createAdminClient()
        .from('bookings')
        .select('id,status,client_name,client_phone,unit,starts_at,professional_id,service_id')
        .eq('id', id)
        .maybeSingle();

    if (error || !data) return { success: false, error: error ? 'invalid' : 'not_found' };

    const row = data as unknown as {
        id: string; status: string; client_name: string; client_phone: string; unit: string; starts_at: string;
        professional_id: string; service_id: string;
    };
    const supabase = createAdminClient();
    const [{ data: professional }, { data: service }] = await Promise.all([
        supabase.from('professionals').select('name').eq('id', row.professional_id).maybeSingle(),
        supabase.from('services').select('name').eq('id', row.service_id).maybeSingle(),
    ]);

    return {
        success: true,
        data: {
            id: row.id,
            action,
            status: row.status,
            clientName: row.client_name,
            clientPhone: row.client_phone,
            serviceName: service?.name || 'Serviço não informado',
            professionalName: professional?.name || 'Profissional não informado',
            unit: row.unit,
            startsAt: row.starts_at,
        },
    };
}

export async function getBookingActionPreview(token: string): Promise<BookingActionPageResult> {
    const capability = readBookingActionToken(token);
    if (!capability) return { success: false, error: 'invalid' };
    return loadBookingActionPreview(capability.id, capability.action);
}

export async function executeSignedBookingAction(formData: FormData) {
    const token = formTokenSchema.safeParse(formData.get('token'));
    if (!token.success) redirect('/agendamento/acao/invalido?resultado=invalido');

    const capability = readBookingActionToken(token.data);
    if (!capability) redirect(actionResultUrl(token.data, 'invalido'));

    const requestHeaders = await headers();
    if (!isSameOrigin(requestHeaders.get('origin'), trustedOrigins())) {
        redirect(actionResultUrl(token.data, 'origem_invalida'));
    }

    if (!await rateLimit('booking-action', 5, 900, capability.id)) {
        redirect(actionResultUrl(token.data, 'limite'));
    }

    const preview = await loadBookingActionPreview(capability.id, capability.action);
    if ('error' in preview) redirect(actionResultUrl(token.data, preview.error));

    const { data: result, error } = await createAdminClient().rpc('apply_signed_booking_action', {
        p_id: capability.id,
        p_action: capability.action,
    });
    if (error || result !== 'applied') {
        redirect(actionResultUrl(token.data, typeof result === 'string' ? result : 'indisponivel'));
    }

    updateTag('public-professionals');
    revalidatePath('/admin/bookings');
    revalidatePath('/admin/kanban');
    redirect(clientWhatsAppUrl(preview.data));
}
