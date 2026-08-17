import { describe, it, expect } from 'vitest';

/**
 * Replica da função sanitizeFileName do upload/route.js
 * para validar o comportamento isoladamente.
 */
function sanitizeFileName(rawName: string): string {
    const dotIdx = rawName.lastIndexOf('.');
    const baseName = dotIdx > 0 ? rawName.slice(0, dotIdx) : (dotIdx === 0 ? '' : rawName);
    const ext = dotIdx >= 0 ? rawName.slice(dotIdx + 1).toLowerCase() : '';

    const sanitized = baseName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[()[\]{}]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();

    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    return `${sanitized || 'upload'}.${safeExt}`;
}

describe('sanitizeFileName', () => {
    it('mantém nome simples', () => {
        expect(sanitizeFileName('foto.jpg')).toBe('foto.jpg');
    });

    it('remove acentos', () => {
        expect(sanitizeFileName('café.png')).toBe('cafe.png');
    });

    it('remove parênteses e colchetes', () => {
        expect(sanitizeFileName('foto (1) [cópia].webp')).toBe('foto_1_copia.webp');
    });

    it('substitui espaços por underscore', () => {
        expect(sanitizeFileName('minha foto linda.jpg')).toBe('minha_foto_linda.jpg');
    });

    it('colapsa múltiplos underscores', () => {
        expect(sanitizeFileName('foto___teste.png')).toBe('foto_teste.png');
    });

    it('força extensão jpg quando extensão desconhecida', () => {
        expect(sanitizeFileName('arquivo.exe')).toBe('arquivo.jpg');
    });

    it('trata arquivo sem extensão', () => {
        expect(sanitizeFileName('semextensao')).toBe('semextensao.jpg');
    });

    it('previne path traversal', () => {
        const result = sanitizeFileName('../../../etc/passwd');
        expect(result).not.toContain('..');
        expect(result).not.toContain('/');
    });

    it('trata nome vazio', () => {
        expect(sanitizeFileName('.jpg')).toBe('upload.jpg');
    });

    it('preserva extensões válidas', () => {
        expect(sanitizeFileName('test.webp')).toBe('test.webp');
        expect(sanitizeFileName('test.jpeg')).toBe('test.jpeg');
        expect(sanitizeFileName('test.png')).toBe('test.png');
    });

    it('não é vulnerável a ReDoS (executa rápido com input grande)', () => {
        const start = performance.now();
        const longName = '_'.repeat(10000) + 'a'.repeat(10000) + '.jpg';
        sanitizeFileName(longName);
        const elapsed = performance.now() - start;
        expect(elapsed).toBeLessThan(100);
    });
});
