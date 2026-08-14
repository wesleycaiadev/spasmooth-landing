import { describe, it, expect } from 'vitest';
import { createServiceSchema, updateServiceSchema } from '@/lib/validations/service';

describe('createServiceSchema', () => {
    const validInput = {
        name: 'Massagem Relaxante',
        category: 'tantrica' as const,
        price: 350,
        duration_minutes: 60,
    };

    it('aceita dados válidos com defaults', () => {
        const result = createServiceSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.description).toBe('');
            expect(result.data.discount_percent).toBe(0);
            expect(result.data.discount_active).toBe(false);
        }
    });

    it('rejeita nome curto demais', () => {
        const result = createServiceSchema.safeParse({ ...validInput, name: 'Ab' });
        expect(result.success).toBe(false);
    });

    it('rejeita categoria inválida', () => {
        const result = createServiceSchema.safeParse({ ...validInput, category: 'invalida' });
        expect(result.success).toBe(false);
    });

    it('rejeita preço negativo', () => {
        const result = createServiceSchema.safeParse({ ...validInput, price: -10 });
        expect(result.success).toBe(false);
    });

    it('rejeita duração zero', () => {
        const result = createServiceSchema.safeParse({ ...validInput, duration_minutes: 0 });
        expect(result.success).toBe(false);
    });

    it('rejeita desconto acima de 100%', () => {
        const result = createServiceSchema.safeParse({ ...validInput, discount_percent: 150 });
        expect(result.success).toBe(false);
    });

    it('aceita desconto de 0 a 100%', () => {
        const result = createServiceSchema.safeParse({ ...validInput, discount_percent: 50, discount_active: true });
        expect(result.success).toBe(true);
    });

    it('faz trim no nome e descrição', () => {
        const result = createServiceSchema.safeParse({ ...validInput, name: '  Teste Trim  ', description: '  Desc  ' });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.name).toBe('Teste Trim');
            expect(result.data.description).toBe('Desc');
        }
    });
});

describe('updateServiceSchema (partial)', () => {
    it('aceita atualização parcial apenas com preço', () => {
        const result = updateServiceSchema.safeParse({ price: 200 });
        expect(result.success).toBe(true);
    });

    it('aceita objeto vazio', () => {
        const result = updateServiceSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('rejeita preço negativo mesmo em partial', () => {
        const result = updateServiceSchema.safeParse({ price: -5 });
        expect(result.success).toBe(false);
    });
});
