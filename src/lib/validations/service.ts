"use strict";

import { z } from "zod";

const SERVICE_CATEGORIES = ["massage", "waxing"] as const;

export const createServiceSchema = z.object({
    name: z
        .string({ error: "Nome é obrigatório." })
        .min(3, { error: "Nome deve ter no mínimo 3 caracteres." })
        .max(100, { error: "Nome deve ter no máximo 100 caracteres." })
        .transform(v => v.trim()),
    category: z.enum(SERVICE_CATEGORIES, {
        error: "Categoria inválida. Use 'massage' ou 'waxing'.",
    }),
    price: z
        .number({ error: "Preço deve ser um número." })
        .min(0, { error: "Preço não pode ser negativo." }),
    duration_minutes: z
        .number({ error: "Duração deve ser um número." })
        .int({ error: "Duração deve ser um número inteiro." })
        .min(1, { error: "Duração deve ser pelo menos 1 minuto." }),
    description: z
        .string()
        .max(500, { error: "Descrição deve ter no máximo 500 caracteres." })
        .transform(v => v.trim())
        .optional()
        .default(""),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.partial();

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
