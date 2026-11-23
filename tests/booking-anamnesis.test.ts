import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getQuestionnaire, parseSubmission, questionnaireVersion } from '../src/lib/anamnesis/questionnaire';
import { matchesFormBinding, readAnamnesisReceipt } from '../src/lib/anamnesis/receipt';
import { signCapability } from '../src/lib/security/policy';
import { bookingNotificationMessage, getNotificationResult } from '../src/lib/booking-notification-message';

const makeQuestionnaire = (category: string, slug: string | null = null) => {
    const result = getQuestionnaire({ category, slug }, questionnaireVersion);
    assert.ok(result);
    return result;
};
const submission = {
    consent: true,
    goals: ['tension'],
    answers: { pressure: 'light', attention: 'discuss' },
    regions: [{ region: 'back-lower', kind: 'discomfort', intensity: 3 }, { region: 'front-arms', kind: 'avoid' }],
};

test('questionnaires use catalog categories and specific offers without inheriting unrelated questions', () => {
    const questionIds = (category: string, slug?: string) => makeQuestionnaire(category, slug).questions.map(question => question.id);
    assert.deepEqual(questionIds('massage'), ['pressure', 'attention']);
    assert.deepEqual(questionIds('day_spa'), ['pressure', 'attention']);
    assert.deepEqual(questionIds('depilacao'), ['experience', 'attention']);
    assert.deepEqual(questionIds('bronzeamento', 'bronze-gelado-corpo-todo'), ['experience', 'tanning', 'attention']);
    assert.deepEqual(questionIds('bronzeamento', 'banho-de-lua-clareador'), ['experience', 'attention']);
    assert.deepEqual(questionIds('estetica'), ['experience', 'attention']);
    assert.deepEqual(questionIds('tantrica'), ['experience', 'attention']);
    assert.equal(makeQuestionnaire('combo', 'combo-contorno-cuidado').showMap, true);
    assert.equal(makeQuestionnaire('combo', 'servico-personalizado').showMap, false);
    assert.equal(makeQuestionnaire('mensal', 'mensal-sueca-4-sessoes').showMap, true);
    assert.equal(getQuestionnaire({ category: 'massage', slug: null }, 'desconhecido'), null);
});

test('map stores the side, region, marking and optional intensity and rejects forbidden values', () => {
    const massage = makeQuestionnaire('massage');
    const parsed = parseSubmission(submission, massage);
    assert.deepEqual(parsed?.submission.regions, submission.regions);
    assert.equal(parsed?.submission.privacyVersion, massage.privacyVersion);
    assert.equal(parsed?.needsReview, true);
    assert.equal(parseSubmission({ ...submission, regions: [...submission.regions, submission.regions[0]] }, massage), null);
    assert.equal(parseSubmission({ ...submission, regions: [{ region: 'wrong', kind: 'avoid' }] }, massage), null);
    assert.equal(parseSubmission({ ...submission, regions: [{ region: 'front-arms', kind: 'avoid', intensity: 5 }] }, massage), null);
    assert.equal(parseSubmission({ ...submission, regions: [{ region: 'back-lower', kind: 'discomfort', intensity: 6 }] }, massage), null);
    assert.equal(parseSubmission({ ...submission, answers: { pressure: 'light', unknown: 'option' } }, massage), null);
    assert.equal(parseSubmission({ ...submission, answers: { pressure: 'light', constructor: 'light' } }, massage), null);
    assert.equal(parseSubmission({ ...submission, consent: false }, massage), null);
    assert.equal(parseSubmission({ ...submission, goals: [], answers: {}, regions: [] }, massage), null);
    assert.equal(parseSubmission({ ...submission, goals: [], answers: {}, regions: submission.regions }, makeQuestionnaire('depilacao')), null);
    assert.equal(parseSubmission({ ...submission, goals: [], answers: {}, regions: [{ region: 'front-arms', kind: 'preference' }] }, massage)?.needsReview, false);
});

test('receipt requires a valid signature and purpose, with form binding unique to the booking', () => {
    const secret = 'test-key-used-only-for-local-validation';
    const id = '75fcb1f4-55e1-42da-8e18-cc2ac8ef9724';
    const otherId = '07b45b0f-8c4b-4da5-a5b4-72ab02246ea5';
    const data = { purpose: 'booking-anamnesis', id, exp: Date.now() + 60_000 };
    const correct = readAnamnesisReceipt(signCapability(data, secret), secret);
    const other = readAnamnesisReceipt(signCapability({ ...data, id: otherId }, secret), secret);
    assert.equal(readAnamnesisReceipt(id, secret), null);
    assert.equal(readAnamnesisReceipt(signCapability(data, 'unexpected-key'), secret), null);
    assert.equal(readAnamnesisReceipt(signCapability({ ...data, purpose: 'booking-action' }, secret), secret), null);
    assert.equal(readAnamnesisReceipt(signCapability({ ...data, exp: 1 }, secret), secret), null);
    assert.equal(correct?.id, id);
    assert.ok(other && correct);
    assert.equal(matchesFormBinding(correct.formBinding, correct.formBinding), true);
    assert.equal(matchesFormBinding(correct.formBinding, other.formBinding), false);
    assert.equal(matchesFormBinding(correct.formBinding, id), false);
});

test('notification only includes booking fields, action links and an optional intake status', () => {
    const booking = {
        clientName: 'Pessoa Teste',
        clientPhone: '82999990000',
        serviceName: 'Massagem de teste',
        professionalName: 'Profissional Teste',
        unit: 'Aracaju',
        date: '2026-12-01',
        time: '10:00',
        notes: 'OBSERVACAO_RESTRITA',
        submission,
    };
    const links = { confirm: 'https://example.test/confirm', decline: 'https://example.test/decline', panel: 'https://example.test/admin' };
    const legacy = bookingNotificationMessage(booking, links);
    assert.doesNotMatch(legacy, /Anamnese|OBSERVACAO_RESTRITA|back-lower|pressure/);
    const intakeLink = 'https://example.test/admin/bookings/anamnese/ficha';
    const completed = bookingNotificationMessage({ ...booking, intakeCompleted: true }, { ...links, intake: intakeLink });
    for (const url of [links.confirm, links.decline, links.panel, intakeLink]) assert.ok(completed.includes(url));
    assert.match(completed, /Anamnese:\* Preenchida/);
    assert.doesNotMatch(completed, /OBSERVACAO_RESTRITA|back-lower|pressure/);
    assert.match(bookingNotificationMessage({ ...booking, intakeCompleted: false }, links), /Anamnese:\* Não preenchida/);
});

test('provider failures distinguish bounded retry, rejection, acceptance and unknown outcomes', async () => {
    const result = (status: number, body = '') => getNotificationResult(async () => ({ status, body }));
    assert.deepEqual(await result(200, '<b>Message queued.</b>'), { status: 'accepted', reason: 'http_200' });
    assert.deepEqual(await result(200, 'Error: message not sent'), { status: 'unknown', reason: 'unrecognized' });
    assert.deepEqual(await result(429), { status: 'retry', reason: 'http_429' });
    assert.deepEqual(await result(403), { status: 'failed', reason: 'http_403' });
    assert.deepEqual(await result(503), { status: 'unknown', reason: 'http_503' });
    const timeout = await getNotificationResult(async () => {
        throw new DOMException('URL text must never appear in the result', 'TimeoutError');
    });
    assert.deepEqual(timeout, { status: 'unknown', reason: 'transport' });
});
