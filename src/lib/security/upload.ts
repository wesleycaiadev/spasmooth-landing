import sharp from 'sharp';
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export async function sanitizeImage(buffer: Buffer, declaredType: string): Promise<Buffer> {
    if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) throw new Error('Tamanho inválido.');
    const expected: Record<string, string> = { 'image/jpeg': 'jpeg', 'image/jpg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' };
    if (!expected[declaredType]) throw new Error('Formato inválido.');
    const image = sharp(buffer, { limitInputPixels: 16_000_000, failOn: 'warning', animated: false });
    const meta = await image.metadata();
    if (meta.format !== expected[declaredType] || (meta.pages || 1) !== 1) throw new Error('Conteúdo inválido.');
    // Decode and re-encode; remove metadata and appended payloads.
    const result = await image.rotate().resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    if (result.length > MAX_UPLOAD_BYTES) throw new Error('Imagem muito grande.');
    return result;
}
