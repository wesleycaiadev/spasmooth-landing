"use strict";

import { z } from "zod";

import { SERVICE_CATEGORIES } from '@/lib/constants';

export const createServiceSchema = z.object({
    name: z
        .string({ error: "Nome é obrigatório." })
        .min(3, { error: "Nome deve ter no mínimo 3 caracteres." })
        .max(100, { error: "Nome deve ter no máximo 100 caracteres." })
        .transform(v => v.trim()),
    category: z.enum(SERVICE_CATEGORIES, {
        error: "Categoria de serviço inválida.",
    }),
    price: z
        .number({ error: "Preço deve ser um número." })
        .min(0, { error: "Preço não pode ser negativo." }).max(100000),
    duration_minutes: z
        .number({ error: "Duração deve ser um número." })
        .int({ error: "Duração deve ser um número inteiro." })
        .min(1, { error: "Duração deve ser pelo menos 1 minuto." }).max(720),
    description: z
        .string()
        .max(500, { error: "Descrição deve ter no máximo 500 caracteres." })
        .transform(v => v.trim())
        .optional()
        .default(""),
    discount_percent: z
        .number({ error: "Percentual de desconto deve ser um número." })
        .min(0, { error: "Desconto não pode ser negativo." })
        .max(100, { error: "Desconto não pode ser maior que 100%." })
        .optional()
        .default(0),
    discount_active: z
        .boolean()
        .optional()
        .default(false),
    reference_price: z.number().min(0).max(100000).nullable().optional(),
    session_count: z.number().int().min(1).max(100).optional().default(1),
    validity_days: z.number().int().min(1).max(365).nullable().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

// Updates must not inject create-time defaults: editing the duration must
// preserve an existing discount, description and monthly session count.
export const updateServiceSchema = createServiceSchema.partial().extend({
    description: createServiceSchema.shape.description.removeDefault().optional(),
    discount_percent: createServiceSchema.shape.discount_percent.removeDefault().optional(),
    discount_active: createServiceSchema.shape.discount_active.removeDefault().optional(),
    session_count: createServiceSchema.shape.session_count.removeDefault().optional(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

