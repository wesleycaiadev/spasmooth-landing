import { describe, it, expect } from 'vitest';

describe('escapeHtml (booking action)', () => {
    function escapeHtml(str: string | null | undefined): string {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    it('escapa tags HTML', () => {
        expect(escapeHtml('<script>alert("xss")</script>')).toBe(
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
        );
    });

    it('escapa aspas simples e duplas', () => {
        expect(escapeHtml("it's a \"test\"")).toBe("it&#39;s a &quot;test&quot;");
    });

    it('escapa ampersand', () => {
        expect(escapeHtml('A & B')).toBe('A &amp; B');
    });

    it('retorna vazio para null/undefined', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });

    it('não modifica texto seguro', () => {
        expect(escapeHtml('João Silva')).toBe('João Silva');
    });
});

describe('UUID validation regex (booking action)', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    it('aceita UUID v4 válido', () => {
        expect(uuidRegex.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('rejeita string aleatória', () => {
        expect(uuidRegex.test('not-a-uuid')).toBe(false);
    });

    it('rejeita ID sequencial', () => {
        expect(uuidRegex.test('123')).toBe(false);
    });

    it('rejeita SQL injection via token', () => {
        expect(uuidRegex.test("' OR 1=1 --")).toBe(false);
    });

    it('rejeita path traversal via token', () => {
        expect(uuidRegex.test('../../../etc/passwd')).toBe(false);
    });
});
