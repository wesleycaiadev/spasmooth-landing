import { describe, it, expect } from 'vitest';
import { notifyBookingSchema } from '@/lib/validations/notify';

describe('notifyBookingSchema', () => {
    const validInput = {
        leadId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Maria Santos',
        whatsapp: '79999999999',
        service: 'Terapia Tântrica',
        date: '2026-09-15',
        time: '14:00',
        professionalName: 'Ana',
        location: 'Aracaju',
    };

    it('aceita dados válidos', () => {
        const result = notifyBookingSchema.safeParse(validInput);
        expect(result.success).toBe(true);
    });

    it('rejeita leadId que não é UUID', () => {
        const result = notifyBookingSchema.safeParse({ ...validInput, leadId: '123' });
        expect(result.success).toBe(false);
    });

    it('rejeita nome vazio', () => {
        const result = notifyBookingSchema.safeParse({ ...validInput, name: '' });
        expect(result.success).toBe(false);
    });

    it('rejeita whatsapp curto demais', () => {
        const result = notifyBookingSchema.safeParse({ ...validInput, whatsapp: '123' });
        expect(result.success).toBe(false);
    });

    it('rejeita data em formato inválido', () => {
        const result = notifyBookingSchema.safeParse({ ...validInput, date: '15-09-2026' });
        expect(result.success).toBe(false);
    });

    it('rejeita horário em formato inválido', () => {
        const result = notifyBookingSchema.safeParse({ ...validInput, time: '2:00PM' });
        expect(result.success).toBe(false);
    });

    it('aceita campos opcionais ausentes', () => {
        const minimal = {
            leadId: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Maria Santos',
            whatsapp: '79999999999',
            date: '2026-09-15',
            time: '14:00',
        };
        const result = notifyBookingSchema.safeParse(minimal);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.service).toBe('');
            expect(result.data.professionalName).toBe('');
            expect(result.data.location).toBe('');
        }
    });

    it('rejeita nome longo demais (>100 chars)', () => {
        const result = notifyBookingSchema.safeParse({ ...validInput, name: 'A'.repeat(101) });
        expect(result.success).toBe(false);
    });
});
