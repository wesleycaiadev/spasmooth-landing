"use strict";

import { z } from "zod";

export const notifyBookingSchema = z.object({
    leadId: z.string().uuid("ID do lead inválido."),
    name: z
        .string()
        .trim()
        .min(1, "Nome é obrigatório.")
        .max(100, "Nome deve ter no máximo 100 caracteres."),
    whatsapp: z
        .string()
        .trim()
        .min(10, "Telefone deve ter no mínimo 10 caracteres.")
        .max(20, "Telefone deve ter no máximo 20 caracteres."),
    service: z
        .string()
        .trim()
        .max(200, "Nome do serviço muito longo.")
        .optional()
        .default(""),
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD."),
    time: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:mm."),
    professionalName: z
        .string()
        .trim()
        .max(100, "Nome do profissional muito longo.")
        .optional()
        .default(""),
    location: z
        .string()
        .trim()
        .max(100, "Local muito longo.")
        .optional()
        .default(""),
});

export type NotifyBookingInput = z.infer<typeof notifyBookingSchema>;
