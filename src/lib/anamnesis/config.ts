import 'server-only';
import { clinicalQuestionnaireVersion, questionnaireVersion } from './questionnaire';

function clinicalReviewers() {
    return (process.env.BOOKING_ANAMNESIS_CLINICAL_REVIEWERS ?? '').split(/[\n,]+/).map(id => id.trim()).filter(id => /^user_[a-z0-9_]+$/i.test(id));
}

export function activeQuestionnaireVersion() {
    return process.env.BOOKING_ANAMNESIS_APPROVED_VERSION === clinicalQuestionnaireVersion && clinicalReviewers().length
        ? clinicalQuestionnaireVersion
        : questionnaireVersion;
}

export function mayAccessQuestionnaire(version: string, adminId: string | undefined) {
    return version === questionnaireVersion
        || (version === clinicalQuestionnaireVersion && Boolean(adminId && clinicalReviewers().includes(adminId)));
}

function boundedInteger(value: string | undefined, min: number, max: number, fallback: number) {
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max ? number : fallback;
}

export function anamnesisEnabled() {
    return process.env.BOOKING_ANAMNESIS_ENABLED === 'true';
}

export function temporaryAnamnesisPdfLinksEnabled() {
    return process.env.BOOKING_ANAMNESIS_TEMPORARY_PDF_LINKS === 'true';
}

export function notificationDelay() {
    return boundedInteger(process.env.BOOKING_ANAMNESIS_DELAY_SECONDS, 60, 1200, 300);
}

export function retentionPolicy() {
    return {
        p_payload_days: boundedInteger(process.env.BOOKING_ANAMNESIS_RETENTION_DAYS, 1, 365, 30),
        p_audit_days: boundedInteger(process.env.BOOKING_ANAMNESIS_AUDIT_DAYS, 1, 730, 90),
    };
}
