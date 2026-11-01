import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAdminIdentity } from '../src/lib/security/admin-identity';
import { configuredAdminEmails } from '../src/lib/security/admin-config';

const now = 10_000;
const user = {
    id: 'user_admin', banned: false, locked: false, twoFactorEnabled: false,
    primaryEmailAddressId: 'email_main',
    emailAddresses: [{ id: 'email_main', emailAddress: 'layararenata123@gmail.com', verification: { status: 'verified' } }],
};
const session = { id: 'session_admin', userId: user.id, status: 'active', expireAt: now + 60_000 };
const provider = () => ({
    getIdentity: async () => ({ userId: user.id, sessionId: session.id }),
    getUser: async () => user,
    getSession: async () => session,
});
const check = (value = provider()) => checkAdminIdentity(value, '', configuredAdminEmails(), now);

test('approved verified administrator can enter with active Clerk session and no MFA enrollment or claims', async () => {
    assert.deepEqual(await check(), { success: true, userId: user.id, sessionId: session.id, error: '' });
    assert.equal((await check({ ...provider(), getUser: async () => ({ ...user, twoFactorEnabled: true }) })).success, true);
});

test('missing authenticated identity is denied before user or live session lookup', async () => {
    let lookups = 0;
    const result = await checkAdminIdentity({
        getIdentity: async () => ({ userId: null, sessionId: null }),
        getUser: async () => { lookups++; return user; },
        getSession: async () => { lookups++; return session; },
    }, '', configuredAdminEmails(), now);
    assert.equal(result.success, false);
    assert.equal(lookups, 0);
});

test('removing mandatory MFA preserves account state, primary-email verification and admin allowlist checks', async () => {
    for (const candidate of [
        { ...user, id: 'another_user' },
        { ...user, banned: true }, { ...user, locked: true },
        { ...user, primaryEmailAddressId: 'another_email' },
        { ...user, emailAddresses: [{ ...user.emailAddresses[0], verification: { status: 'unverified' } }] },
        { ...user, emailAddresses: [{ ...user.emailAddresses[0], emailAddress: 'visitor@example.com' }] },
    ]) {
        let sessionReads = 0;
        const result = await check({ ...provider(), getUser: async () => candidate, getSession: async () => { sessionReads++; return session; } });
        assert.equal(result.success, false);
        assert.equal(sessionReads, 0);
    }
});

test('revoked, pending, expired, mismatched or invalid live sessions cannot open the admin panel', async () => {
    for (const invalid of [
        { ...session, status: 'revoked' }, { ...session, status: 'pending' },
        { ...session, expireAt: now }, { ...session, expireAt: NaN },
        { ...session, id: 'different_session' }, { ...session, userId: 'different_user' },
    ]) assert.equal((await check({ ...provider(), getSession: async () => invalid })).success, false);
});

test('identity provider failures deny admission and never expose provider errors', async () => {
    for (const method of ['getIdentity', 'getUser', 'getSession']) {
        const broken = { ...provider(), [method]: async () => { throw new Error('PRIVATE_PROVIDER_DETAIL'); } };
        const result = await check(broken);
        assert.equal(result.success, false);
        assert.equal(result.error.includes('PRIVATE_PROVIDER_DETAIL'), false);
    }
});
