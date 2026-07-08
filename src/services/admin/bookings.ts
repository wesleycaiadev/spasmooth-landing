"use server";

import { createAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/auth";
import {
    updateBookingStatusSchema,
    listBookingsFilterSchema,
    type UpdateBookingStatusInput,
    type ListBookingsFilter,
} from "@/lib/validations/booking";

import type { ServiceResponse, BookingWithRelations } from "@/types";
import { BOOKING_TO_LEAD_STATUS } from "@/lib/constants";

// verifyAdmin importado de @/lib/auth

export async function listBookings(
    filters?: ListBookingsFilter
): Promise<ServiceResponse<BookingWithRelations[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: "Acesso negado." };

        let parsedFilters: ListBookingsFilter = {};

        if (filters) {
            const result = listBookingsFilterSchema.safeParse(filters);
            if (!result.success) {
                return { success: false, error: "Filtros inválidos." };
            }
            parsedFilters = result.data;
        }

        const supabase = createAdminClient();

        let query = supabase
            .from("bookings")
            .select("*, professionals(name, location), services(name, duration_minutes, price)")
            .order("starts_at", { ascending: false })
            .limit(200);

        if (parsedFilters.unit) {
            query = query.eq("unit", parsedFilters.unit);
        }

        if (parsedFilters.status) {
            query = query.eq("status", parsedFilters.status);
        }

        if (parsedFilters.professional_id) {
            query = query.eq("professional_id", parsedFilters.professional_id);
        }

        if (parsedFilters.date_from) {
            query = query.gte("starts_at", `${parsedFilters.date_from}T00:00:00-03:00`);
        }

        if (parsedFilters.date_to) {
            query = query.lte("starts_at", `${parsedFilters.date_to}T23:59:59-03:00`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("[listBookings]", error.code);
            return { success: false, error: "Erro ao buscar agendamentos." };
        }

        return { success: true, data: data as BookingWithRelations[] };
    } catch (e: any) {
        console.error("[listBookings exception]:", e);
        return { success: false, error: "Erro interno: " + (e.message || "") };
    }
}

export async function updateBookingStatus(
    input: UpdateBookingStatusInput
): Promise<ServiceResponse<null>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: "Acesso negado." };

        const parsed = updateBookingStatusSchema.safeParse(input);
        if (!parsed.success) {
            return { success: false, error: "Dados inválidos." };
        }

        const { id, status } = parsed.data;
        const supabase = createAdminClient();

        const { error } = await supabase
            .from("bookings")
            .update({ status })
            .eq("id", id);

        if (error) {
            console.error("[updateBookingStatus]", error.code);
            return { success: false, error: "Erro ao atualizar status." };
        }

        // Sincronizar com tabela leads
        const leadStatus = BOOKING_TO_LEAD_STATUS[status as keyof typeof BOOKING_TO_LEAD_STATUS] || 'novo';
        await supabase
            .from("leads")
            .update({ status_kanban: leadStatus })
            .eq("id", id);

        return { success: true };
    } catch {
        return { success: false, error: "Erro interno do servidor." };
    }
}

export async function getWeeklyCalendar(
    professionalId: string,
    weekStartDate: string
): Promise<ServiceResponse<BookingWithRelations[]>> {
    try {
        const adminCheck = await verifyAdmin();
        if (!adminCheck.success) return { success: false, error: "Acesso negado." };

        if (!professionalId || !/^[0-9a-f-]{36}$/i.test(professionalId)) {
            return { success: false, error: "ID de profissional inválido." };
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
            return { success: false, error: "Data inválida." };
        }

        const startDate = new Date(`${weekStartDate}T00:00:00-03:00`);
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("bookings")
            .select("*, professionals(name, location), services(name, duration_minutes, price)")
            .eq("professional_id", professionalId)
            .gte("starts_at", startDate.toISOString())
            .lt("starts_at", endDate.toISOString())
            .order("starts_at");

        if (error) {
            console.error("[getWeeklyCalendar]", error.code);
            return { success: false, error: "Erro ao buscar grade semanal." };
        }

        return { success: true, data: data as BookingWithRelations[] };
    } catch {
        return { success: false, error: "Erro interno do servidor." };
    }
}

