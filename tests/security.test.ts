import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { allowedAdmin, isSameOrigin, signCapability, readCapability } from '../src/lib/security/policy';
import { sanitizeImage, MAX_UPLOAD_BYTES } from '../src/lib/security/upload';
import { createBookingSchema } from '../src/lib/validations/booking';
import { professionalSchema, leadSchema, scheduleSchema, layoutSchema, carouselSchema } from '../src/lib/validations/admin';

const user = { id: 'user_test', primaryEmailAddressId: 'email_primary', emailAddresses: [{ id: 'email_primary', emailAddress: 'Admin@example.com', verification: { status: 'verified' } }] };
test('empty allowlist denies authenticated users; verified primary email or explicit ID required', () => {
    assert.equal(allowedAdmin(user, '', ''), false);
    assert.equal(allowedAdmin(user, '', ' admin@example.com\n'), true);
    assert.equal(allowedAdmin(user, 'user_test', ''), true);
    assert.equal(allowedAdmin({ ...user, emailAddresses: [{ ...user.emailAddresses[0], verification: { status: 'unverified' } }] }, '', 'admin@example.com'), false);
    assert.equal(allowedAdmin({ ...user, primaryEmailAddressId: 'other' }, '', 'admin@example.com'), false);
});
test('CORS/CSRF deny missing, null, lookalike and foreign origins', () => {
    const allowed = ['https://spasmooth.com.br'];
    for (const value of [null, 'null', 'http://spasmooth.com.br', 'https://spasmooth.com.br.evil.test', 'https://evil.test', 'https://spasmooth.com.br/path']) assert.equal(isSameOrigin(value, allowed), false);
    assert.equal(isSameOrigin(allowed[0], allowed), true);
});
test('signed capabilities expire, reject tampering and are scoped to their purpose', () => {
    const secret = 'security-test-key-not-a-real-secret-123456789';
    const token = signCapability({ purpose: 'booking', id: 'test', exp: 2000 }, secret);
    assert.equal(readCapability(token, secret, 'booking', 1000)?.id, 'test');
    assert.equal(readCapability(token, secret, 'booking', 2000), null);
    assert.equal(readCapability(token, secret, 'admin', 1000), null);
    assert.equal(readCapability(token, 'wrong-secret', 'booking', 1000), null);
    assert.equal(readCapability(token + '.extra', secret, 'booking', 1000), null);
    assert.equal(readCapability('malformed', secret, 'booking', 1000), null);
    assert.equal(readCapability(token.replace(token[0], token[0] === 'e' ? 'x' : 'e'), secret, 'booking', 1000), null);
});
const validBooking = { unit: 'Aracaju', professional_id: '11111111-1111-4111-8111-111111111111', service_id: '22222222-2222-4222-8222-222222222222', date: '2026-09-10', time: '10:00', client_name: 'Cliente Teste', client_phone: '(82) 99999-0000', notes: '', privacy_acknowledged: true };
test('booking rejects impossible calendar dates, times, missing notice and oversized input', () => {
    assert.equal(createBookingSchema.safeParse(validBooking).success, true);
    for (const patch of [{ date: '2026-02-30' }, { time: '25:99' }, { time: '10:60' }, { professional_id: "' OR 1=1--" }, { privacy_acknowledged: false }, { privacy_acknowledged: undefined }, { notes: 'x'.repeat(501) }]) assert.equal(createBookingSchema.safeParse({ ...validBooking, ...patch }).success, false);
});
test('admin inputs reject mass assignment, invalid prices/URLs and malformed schedules', () => {
    assert.equal(leadSchema.safeParse({ nome: 'Cliente Teste', whatsapp: '82999990000', id: validBooking.professional_id }).success, false);
    const pro = { name: 'Profissional', specialties: [], photo_url: '', gallery_urls: [], location: 'Aracaju', location_start_date: null, location_end_date: null };
    assert.equal(professionalSchema.safeParse(pro).success, true);
    assert.equal(professionalSchema.safeParse({ ...pro, active: true }).success, false);
    assert.equal(professionalSchema.safeParse({ ...pro, photo_url: 'javascript:alert(1)' }).success, false);
    assert.equal(scheduleSchema.safeParse(Array.from({ length: 7 }, () => ({ professional_id: validBooking.professional_id, day_of_week: 1, start_time: '08:00', end_time: '20:00', is_day_off: false }))).success, false);
    assert.equal(layoutSchema.safeParse([]).success, false);
    assert.equal(carouselSchema.safeParse({ mode: 'manual', serviceIds: [], maxItems: 9999 }).success, false);
});
test('upload rejects SVG, fake MIME, empty data and excess size', async () => {
    await assert.rejects(sanitizeImage(Buffer.from('<svg><script>alert(1)</script></svg>'), 'image/png'));
    await assert.rejects(sanitizeImage(Buffer.alloc(0), 'image/jpeg'));
    await assert.rejects(sanitizeImage(Buffer.alloc(MAX_UPLOAD_BYTES + 1), 'image/jpeg'));
    const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer();
    await assert.rejects(sanitizeImage(png, 'image/jpeg'));
    await assert.rejects(sanitizeImage(png, 'text/html'));
});
test('valid image is decoded and re-encoded to WebP with no trailing payload', async () => {
    const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer();
    const image = await sanitizeImage(Buffer.concat([png, Buffer.from('<script>PAYLOAD_TEST</script>')]), 'image/png');
    assert.equal((await sharp(image).metadata()).format, 'webp');
    assert.equal(image.includes(Buffer.from('PAYLOAD_TEST')), false);
});
