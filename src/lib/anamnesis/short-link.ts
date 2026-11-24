import { z } from 'zod';
import { readCapability, signCapability } from '../security/policy';

const bookingId = z.uuid();
export const ANAMNESIS_RETURN_COOKIE = 'spa_ficha_return';
export const ANAMNESIS_RETURN_COOKIE_PATH = '/api/admin/session';
export const ANAMNESIS_RETURN_MAX_AGE = 600;

export function anamnesisPanelPath(id: string) {
    return `/admin/bookings/anamnese/${bookingId.parse(id)}`;
}

export function anamnesisPdfPath(id: string, afterLogin = false) {
    return `${anamnesisPanelPath(id)}/pdf?origem=whatsapp${afterLogin ? '&retorno=1' : ''}`;
}

export function anamnesisPdfLoginPath(id: string) {
    return `/entrar?ficha=${encodeAnamnesisCode(id)}`;
}

export function encodeAnamnesisCode(id: string) {
    return Buffer.from(bookingId.parse(id).replace(/-/g, ''), 'hex').toString('base64url');
}

export function decodeAnamnesisCode(code: string) {
    if (!/^[A-Za-z0-9_-]{22}$/.test(code)) return null;
    const bytes = Buffer.from(code, 'base64url');
    if (bytes.length !== 16 || bytes.toString('base64url') !== code) return null;
    const hex = bytes.toString('hex');
    const result = bookingId.safeParse(`${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`);
    return result.success ? result.data : null;
}

export function createAnamnesisReturn(id: string, secret: string, destination: 'panel' | 'pdf' = 'panel') {
    return signCapability({
        purpose: 'anamnesis-return',
        id: bookingId.parse(id),
        destination,
        exp: Date.now() + ANAMNESIS_RETURN_MAX_AGE * 1000,
    }, secret);
}

export function readAnamnesisReturn(token: string | undefined, secret: string) {
    const capability = readCapability(token, secret, 'anamnesis-return');
    const id = bookingId.safeParse(capability?.id);
    if (!id.success) return null;
    if (capability?.destination === 'pdf') return anamnesisPdfPath(id.data, true);
    // Older cookies only carried the booking ID and returned to the panel.
    return capability?.destination === undefined || capability.destination === 'panel'
        ? anamnesisPanelPath(id.data)
        : null;
}
