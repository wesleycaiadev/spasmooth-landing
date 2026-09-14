import { z } from 'zod';
export const uuid = z.string().uuid();
export const date = z.iso.date();
export const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d(?::00)?$/);
export const category = z.enum(['combo', 'day_spa', 'estetica', 'tantrica', 'depilacao', 'all', 'tudo']);
export const leadStatus = z.enum(['novo', 'interessado', 'agendado', 'concluido', 'cancelado']);
const optionalText = z.string().trim().max(500).nullable().optional();
export const leadSchema = z.object({
    nome: z.string().trim().min(3).max(100), whatsapp: z.string().trim().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/),
    email: z.union([z.email().max(254), z.literal('')]).nullable().optional(), service_name: optionalText,
    professional_id: uuid.nullable().optional(), appointment_date: z.union([date,z.literal('')]).nullable().optional(),
    appointment_time: z.union([time,z.literal('')]).nullable().optional(), mensagem_interesse: optionalText,
    status_kanban: leadStatus.default('novo'), admin_notes: z.string().max(2000).nullable().optional()
}).strict();
const localProfessionalImage = /^\/images\/professionals\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:avif|gif|jpe?g|png|webp)$/;
const imageUrl = z.string().max(2048).refine(value => {
    if (!value || localProfessionalImage.test(value)) return true;
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'images.unsplash.com' || url.hostname === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://invalid.local').hostname); } catch { return false; }
}, 'URL de imagem inválida.');
export const professionalSchema = z.object({ name: z.string().trim().min(2).max(100), specialties: z.array(z.string().trim().max(100)).max(20), photo_url: imageUrl.nullable(), gallery_urls: z.array(imageUrl).max(20), location: z.enum(['Aracaju','Maceió','Recife']), location_start_date: date.nullable(), location_end_date: date.nullable() }).strict();
export const scheduleSchema = z.array(z.object({ professional_id: uuid, day_of_week: z.number().int().min(0).max(6), start_time: time, end_time: time, is_day_off: z.boolean() }).strip().refine(s => s.is_day_off || s.start_time < s.end_time)).length(7).refine(s => new Set(s.map(d => d.day_of_week)).size === 7);
export const layoutSchema = z.array(z.object({ id: z.enum(['hero','services','professionals','location','testimonials','faq']), label: z.string().max(100), visible: z.boolean() }).strict()).length(6).refine(s => new Set(s.map(x => x.id)).size === 6);
export const categoryOrderSchema = z.array(z.enum(['combo','day_spa','estetica','depilacao','tantrica'])).length(5).refine(s => new Set(s).size === 5);
export const carouselSchema = z.object({ mode: z.enum(['manual','promotions']), serviceIds: z.array(uuid).max(30), maxItems: z.number().int().min(1).max(12) }).strict();
