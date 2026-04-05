"use server";

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
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("professionals")
            .select("*")
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

        const durationMinutes = serviceData.duration_minutes;

        const { data: proData, error: proErr } = await supabase
            .from("professionals")
            .select("active")
            .eq("id", professional_id)
            .eq("active", true)
            .single();

        if (proErr || !proData) {
            return { success: false, error: "Profissional não encontrado." };
        }

        const dateObj = new Date(date + "T12:00:00");
        const dayOfWeek = dateObj.getDay();
        const hours = BUSINESS_HOURS[dayOfWeek];

        if (!hours) {
            return { success: true, data: [] };
        }

        const dayStart = `${date}T${String(hours.start).padStart(2, "0")}:00:00-03:00`;
        const dayEnd = `${date}T${String(hours.end).padStart(2, "0")}:00:00-03:00`;

        const { data: bookings, error: bookErr } = await supabase
            .from("bookings")
            .select("starts_at, ends_at")
            .eq("professional_id", professional_id)
            .neq("status", "cancelado")
            .gte("starts_at", dayStart)
            .lt("starts_at", dayEnd);

        if (bookErr) {
            console.error("[getAvailableSlots]", bookErr.code);
            return { success: false, error: "Erro ao verificar disponibilidade." };
        }

        const bookedIntervals = (bookings ?? []).map((b) => ({
            start: new Date(b.starts_at).getTime(),
            end: new Date(b.ends_at).getTime(),
        }));

        const { data: scheduleData } = await supabase
            .from("professional_schedule")
            .select("start_time, end_time, is_day_off")
            .eq("professional_id", professional_id)
            .eq("day_of_week", dayOfWeek)
            .single();

        let schedStartHour = hours.start;
        let schedEndHour = hours.end;
        let isDayOff = false;

        if (scheduleData) {
            if (scheduleData.is_day_off) {
                isDayOff = true;
            } else {
                const [sh] = scheduleData.start_time.split(":").map(Number);
                const [eh] = scheduleData.end_time.split(":").map(Number);
                schedStartHour = sh;
                schedEndHour = eh;
            }
        }

        if (isDayOff) {
            return { success: true, data: [] };
        }

        const nowSp = new Date(
            new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
        );
        const todayIso = nowSp.toLocaleDateString("en-CA");
        const isToday = date === todayIso;
        const currentMinutes = nowSp.getHours() * 60 + nowSp.getMinutes();
        const MINIMUM_ADVANCE = 30;

        const slots: string[] = [];

        for (let hour = schedStartHour; hour <= schedEndHour; hour++) {
            const timeStr = `${String(hour).padStart(2, "0")}:00`;
            const slotStartMinutes = hour * 60;

            if (isToday && slotStartMinutes < currentMinutes + MINIMUM_ADVANCE) {
                continue;
            }

            const slotStartTs = new Date(`${date}T${timeStr}:00-03:00`).getTime();
            const slotEndTs = slotStartTs + durationMinutes * 60 * 1000;

            const hasConflict = bookedIntervals.some(
                (interval) => slotStartTs < interval.end && slotEndTs > interval.start
            );

            if (!hasConflict) {
                slots.push(timeStr);
            }
        }

        return { success: true, data: slots };
    } catch {
        return { success: false, error: "Erro interno do servidor." };
    }
}

export async function createBooking(
    input: CreateBookingInput
): Promise<ServiceResponse<{ id: string }>> {
    try {
        const parsed = createBookingSchema.safeParse(input);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos.";
            return { success: false, error: firstError };
        }

        const { unit, professional_id, service_id, date, time, client_name, client_phone, notes } =
            parsed.data;

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
        if (startsAt.getTime() < now.getTime() - 5 * 60 * 1000) {
            return { success: false, error: "Não é possível agendar no passado." };
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

        try {
            const { data: proData } = await supabase
                .from("professionals")
                .select("name, location")
                .eq("id", professional_id)
                .single();

            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://spasmooth.com.br";

            await fetch(`${baseUrl}/api/booking/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leadId: bookingId ?? "",
                    name: client_name,
                    whatsapp: client_phone,
                    service: serviceData.name,
                    date,
                    time,
                    professionalName: proData?.name ?? "Profissional",
                    location: proData?.location ?? unit,
                }),
            });
        } catch (notifyErr) {
            console.error("[createBooking notify]", notifyErr);
        }

        return { success: true, data: { id: bookingId as string } };
    } catch {
        return { success: false, error: "Erro interno do servidor." };
    }
}
