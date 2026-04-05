"use strict";

import { z } from "zod";

const UNITS = ["Aracaju", "Maceió", "Recife"] as const;
const BOOKING_STATUSES = ["pendente", "confirmado", "cancelado", "concluido"] as const;

const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

export const createBookingSchema = z.object({
    unit: z.enum(UNITS, {
        errorMap: () => ({ message: "Unidade inválida." }),
    }),
    professional_id: z
        .string()
        .uuid("ID de profissional inválido."),
    service_id: z
        .string()
        .uuid("ID de serviço inválido."),
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD."),
    time: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:mm."),
    client_name: z
        .string()
        .trim()
        .min(3, "Nome deve ter no mínimo 3 caracteres.")
        .max(100, "Nome deve ter no máximo 100 caracteres."),
    client_phone: z
        .string()
        .trim()
        .min(10, "Telefone deve ter no mínimo 10 caracteres.")
        .max(20, "Telefone deve ter no máximo 20 caracteres.")
        .regex(phoneRegex, "Formato de telefone inválido. Use (DD) XXXXX-XXXX."),
    notes: z
        .string()
        .trim()
        .max(500, "Observações devem ter no máximo 500 caracteres.")
        .optional()
        .default(""),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
    id: z.string().uuid("ID de agendamento inválido."),
    status: z.enum(BOOKING_STATUSES, {
        errorMap: () => ({ message: "Status inválido." }),
    }),
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

export const listBookingsFilterSchema = z.object({
    unit: z.enum(UNITS).optional(),
    status: z.enum(BOOKING_STATUSES).optional(),
    professional_id: z.string().uuid().optional(),
    date_from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    date_to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
});

export type ListBookingsFilter = z.infer<typeof listBookingsFilterSchema>;

export const availableSlotsSchema = z.object({
    professional_id: z.string().uuid("ID de profissional inválido."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
    service_id: z.string().uuid("ID de serviço inválido."),
});

export type AvailableSlotsInput = z.infer<typeof availableSlotsSchema>;
