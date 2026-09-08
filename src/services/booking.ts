"use server";

import { cookies } from "next/headers";
import { rateLimit, capabilitySecret } from "@/lib/security/server";
import { signCapability, readCapability } from "@/lib/security/policy";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabaseAdmin";
import {
    createBookingSchema,
    availableSlotsSchema,
    type CreateBookingInput,
    type AvailableSlotsInput,
} from "@/lib/validations/booking";

type ServiceResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

type Professional = {
    id: string;
    name: string;
    photo_url: string | null;
    gallery_urls: string[];
    specialties: string[];
    location: string;
    location_start_date: string | null;
    location_end_date: string | null;
    active: boolean;
};

type Service = {
    id: string;
    name: string;
    duration_minutes: number;
    price: number;
    description: string;
    category: string;
    active: boolean;
};

const BUSINESS_HOURS: Record<number, { start: number; end: number } | null> = {
    0: null,
    1: { start: 8, end: 20 },
    2: { start: 8, end: 20 },
    3: { start: 8, end: 20 },
    4: { start: 8, end: 20 },
    5: { start: 8, end: 20 },
    6: { start: 9, end: 16 },
};

export async function getActiveProfessionals(
    unit: string
): Promise<ServiceResponse<Professional[]>> {
    try {
        if (!["Aracaju", "Maceió", "Recife"].includes(unit)) return { success: false, error: "Unidade inválida." };
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("professionals")
            .select("id,name,photo_url,gallery_urls,specialties,location,location_start_date,location_end_date,active")
            .eq("active", true)
            .eq("location", unit)
            .order("name");

        if (error) {
            console.error("[getActiveProfessionals]", error.code);
            return { success: false, error: "Erro ao buscar profissionais." };
        }

        return { success: true, data: data as Professional[] };
    } catch {
        return { success: false, error: "Erro interno do servidor." };
    }
}

export async function getActiveServices(): Promise<ServiceResponse<Service[]>> {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("services")
            .select("id, name, duration_minutes, price, description, category, active")
            .eq("active", true)
            .order("category")
            .order("price");

        if (error) {
            console.error("[getActiveServices]", error.code);
            return { success: false, error: "Erro ao buscar serviços." };
        }

        return { success: true, data: data as Service[] };
    } catch {
        return { success: false, error: "Erro interno do servidor." };
    }
}

export async function getAvailableSlots(
    input: AvailableSlotsInput
): Promise<ServiceResponse<string[]>> {
    try {
        if (!await rateLimit('availability', 60, 60)) return { success: false, error: 'Muitas consultas. Aguarde um minuto.' };
        const parsed = availableSlotsSchema.safeParse(input);
        if (!parsed.success) {
            return { success: false, error: "Parâmetros inválidos." };
        }

        const { professional_id, date, service_id } = parsed.data;
        const supabase = createAdminClient();

        const { data: serviceData, error: svcErr } = await supabase
            .from("services")
            .select("duration_minutes")
            .eq("id", service_id)
            .eq("active", true)
            .single();

        if (svcErr || !serviceData) {
            return { success: false, error: "Serviço não encontrado." };
        }

        const { data: slots, error: slotsError } = await supabase.rpc('available_booking_slots', { p_professional_id: professional_id, p_service_id: service_id, p_date: date });
        if (slotsError) return { success: false, error: 'Falha ao consultar horários.' };
        return { success: true, data: slots };
    } catch {
        return { success: false, error: "Erro interno do servidor." };
    }
}

export async function createBooking(
    input: CreateBookingInput
): Promise<ServiceResponse<{ id: string }>> {
    try {
        if (!await rateLimit('booking', 5, 900)) return { success: false, error: 'Muitas tentativas. Aguarde 15 minutos.' };
        const parsed = createBookingSchema.safeParse(input);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos.";
            return { success: false, error: firstError };
        }

        const { unit, professional_id, service_id, date, time, client_name, client_phone, notes } =
            parsed.data;

        if (!await rateLimit('booking-phone', 3, 3600, client_phone.replace(/\D/g, ''))) return { success: false, error: 'Limite de agendamentos atingido. Tente mais tarde.' };
        const supabase = createAdminClient();

        const { data: serviceData, error: svcErr } = await supabase
            .from("services")
            .select("duration_minutes, name, price")
            .eq("id", service_id)
            .eq("active", true)
            .single();

        if (svcErr || !serviceData) {
            return { success: false, error: "Serviço não encontrado ou indisponível." };
        }

        const startsAt = new Date(`${date}T${time}:00-03:00`);
        const endsAt = new Date(startsAt.getTime() + serviceData.duration_minutes * 60 * 1000);

        if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
            return { success: false, error: "Data ou horário inválido." };
        }

        const now = new Date();
        if (startsAt.getTime() < now.getTime() + 30 * 60 * 1000) {
            return { success: false, error: "Agende com pelo menos 30 minutos de antecedência." };
        }

        const dateObj = new Date(date + "T12:00:00");
        const dayOfWeek = dateObj.getDay();
        const businessHours = BUSINESS_HOURS[dayOfWeek];

        if (!businessHours) {
            return { success: false, error: "Não atendemos neste dia da semana." };
        }

        const { data: bookingId, error: rpcError } = await supabase.rpc(
            "check_and_create_booking",
            {
                p_unit: unit,
                p_professional_id: professional_id,
                p_service_id: service_id,
                p_client_name: client_name,
                p_client_phone: client_phone,
                p_starts_at: startsAt.toISOString(),
                p_ends_at: endsAt.toISOString(),
                p_notes: notes ?? "",
            }
        );

        if (rpcError) {
            const msg = rpcError.message ?? "";

            if (msg.includes("SLOT_UNAVAILABLE")) {
                return {
                    success: false,
                    error: "Este horário acabou de ser reservado. Por favor, escolha outro.",
                };
            }

            if (msg.includes("PROFESSIONAL_NOT_FOUND") || msg.includes("PROFESSIONAL_INACTIVE")) {
                return { success: false, error: "Profissional indisponível." };
            }

            if (msg.includes("SERVICE_NOT_FOUND") || msg.includes("SERVICE_INACTIVE")) {
                return { success: false, error: "Serviço indisponível." };
            }

            console.error("[createBooking RPC]", rpcError.code);
            return { success: false, error: "Erro ao processar agendamento." };
        }

        // Receipt binds this browser to this booking for 30 minutes; IDs alone grant no access.
        try {
            (await cookies()).set('spa_booking', signCapability({ purpose: 'booking', id: bookingId, exp: Date.now() + 30 * 60_000 }, capabilitySecret()), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 1800 });
        } catch { console.error('[booking] Receipt could not be issued'); }
        // Notification delivery is opt-in operational configuration, never a public relay.
        // Do not include client data in URLs or logs.
        if (process.env.BOOKING_NOTIFICATIONS_ENABLED === 'true' && process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY) {
            try {
                const url = new URL('https://api.callmebot.com/whatsapp.php');
                url.searchParams.set('phone', process.env.CALLMEBOT_PHONE);
                url.searchParams.set('apikey', process.env.CALLMEBOT_APIKEY);
                url.searchParams.set('text', 'Novo agendamento recebido. Acesse o painel administrativo do SpaSmooth para revisar.');
                await fetch(url, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
            } catch { console.error('[booking] Notification delivery failed'); }
        }

        return { success: true, data: { id: bookingId as string } };
    } catch {
        return { success: false, error: "Erro interno do servidor." };
    }
}

export async function updateBookingInterest(interest: string): Promise<ServiceResponse> {
    try {
        const value = z.string().trim().min(1).max(500).parse(interest);
        if (!await rateLimit('interest', 5, 900)) return { success: false, error: 'Muitas solicitações. Aguarde.' };
        const receipt = readCapability((await cookies()).get('spa_booking')?.value, capabilitySecret(), 'booking');
        if (!receipt || !z.string().uuid().safeParse(receipt.id).success) return { success: false, error: 'Sessão expirada. Faça um novo agendamento.' };
        const { error } = await createAdminClient().from('leads').update({ mensagem_interesse: value }).eq('id', receipt.id);
        return error ? { success: false, error: 'Falha ao salvar observação.' } : { success: true };
    } catch { return { success: false, error: 'Dados inválidos ou serviço indisponível.' }; }
}
