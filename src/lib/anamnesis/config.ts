import 'server-only';

function boundedInteger(value: string | undefined, min: number, max: number, fallback: number) {
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max ? number : fallback;
}

export function anamnesisEnabled() {
    return process.env.BOOKING_ANAMNESIS_ENABLED === 'true';
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
