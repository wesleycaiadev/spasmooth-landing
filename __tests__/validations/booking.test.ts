import { describe, it, expect } from 'vitest';
import { createBookingSchema, availableSlotsSchema, updateBookingStatusSchema } from '@/lib/validations/booking';

describe('createBookingSchema', () => {
    const validInput = {
        unit: 'Aracaju',
        professional_id: '550e8400-e29b-41d4-a716-446655440000',
        service_id: '550e8400-e29b-41d4-a716-446655440001',
        date: '2026-09-15',
        time: '14:00',
        client_name: 'João Silva',
        client_phone: '(79) 99999-9999',
    };

    it('aceita dados válidos', () => {
        const result = createBookingSchema.safeParse(validInput);
        expect(result.success).toBe(true);
    });

    it('rejeita unidade inválida', () => {
        const result = createBookingSchema.safeParse({ ...validInput, unit: 'Salvador' });
        expect(result.success).toBe(false);
    });

    it('rejeita UUID inválido no professional_id', () => {
        const result = createBookingSchema.safeParse({ ...validInput, professional_id: 'nao-e-uuid' });
        expect(result.success).toBe(false);
    });

    it('rejeita UUID inválido no service_id', () => {
        const result = createBookingSchema.safeParse({ ...validInput, service_id: '123' });
        expect(result.success).toBe(false);
    });

    it('rejeita data no formato errado', () => {
        const result = createBookingSchema.safeParse({ ...validInput, date: '15/09/2026' });
        expect(result.success).toBe(false);
    });

    it('rejeita horário no formato errado', () => {
        const result = createBookingSchema.safeParse({ ...validInput, time: '2pm' });
        expect(result.success).toBe(false);
    });

    it('rejeita nome curto demais', () => {
        const result = createBookingSchema.safeParse({ ...validInput, client_name: 'Ab' });
        expect(result.success).toBe(false);
    });

    it('rejeita telefone fora do formato', () => {
        const result = createBookingSchema.safeParse({ ...validInput, client_phone: '123' });
        expect(result.success).toBe(false);
    });

    it('rejeita notas com mais de 500 caracteres', () => {
        const result = createBookingSchema.safeParse({ ...validInput, notes: 'A'.repeat(501) });
        expect(result.success).toBe(false);
    });

    it('aceita notes vazio ou ausente', () => {
        const result = createBookingSchema.safeParse({ ...validInput });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.notes).toBe('');
        }
    });
});

describe('availableSlotsSchema', () => {
    it('aceita dados válidos', () => {
        const result = availableSlotsSchema.safeParse({
            professional_id: '550e8400-e29b-41d4-a716-446655440000',
            date: '2026-09-15',
            service_id: '550e8400-e29b-41d4-a716-446655440001',
        });
        expect(result.success).toBe(true);
    });

    it('rejeita data inválida', () => {
        const result = availableSlotsSchema.safeParse({
            professional_id: '550e8400-e29b-41d4-a716-446655440000',
            date: 'invalid',
            service_id: '550e8400-e29b-41d4-a716-446655440001',
        });
        expect(result.success).toBe(false);
    });
});

describe('updateBookingStatusSchema', () => {
    it('aceita status válido', () => {
        const result = updateBookingStatusSchema.safeParse({
            id: '550e8400-e29b-41d4-a716-446655440000',
            status: 'confirmado',
        });
        expect(result.success).toBe(true);
    });

    it('rejeita status desconhecido', () => {
        const result = updateBookingStatusSchema.safeParse({
            id: '550e8400-e29b-41d4-a716-446655440000',
            status: 'desconhecido',
        });
        expect(result.success).toBe(false);
    });
});
