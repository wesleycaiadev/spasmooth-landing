import { createHmac, timingSafeEqual } from 'node:crypto';
import { encodeAnamnesisCode } from './short-link';

const ttlSeconds = 24 * 60 * 60;

function pdfSignature(code: string, expires: Buffer, secret: string) {
    return createHmac('sha256', secret).update('spasmooth:temporary-anamnesis-pdf:v1:').update(code).update(expires).digest();
}

export function temporaryAnamnesisPdfUrl(id: string, siteUrl: string, secret: string, now = Date.now()) {
    const code = encodeAnamnesisCode(id);
    const expires = Buffer.alloc(4);
    expires.writeUInt32BE(Math.floor(now / 1000) + ttlSeconds);
    const token = Buffer.concat([expires, pdfSignature(code, expires, secret)]).toString('base64url');
    return new URL(`/f/${code}/pdf#${token}`, siteUrl).toString();
}

export function validTemporaryAnamnesisPdfToken(code: string, token: string | null, secret: string, now = Date.now()) {
    if (!token || !/^[A-Za-z0-9_-]{48}$/.test(token)) return false;
    const bytes = Buffer.from(token, 'base64url');
    const expires = bytes.subarray(0, 4);
    const secondsLeft = expires.readUInt32BE() - now / 1000;
    return secondsLeft > 0 && secondsLeft <= ttlSeconds
        && timingSafeEqual(bytes.subarray(4), pdfSignature(code, expires, secret));
}
