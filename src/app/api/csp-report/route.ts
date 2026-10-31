import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security/server';
import { readRequestBody, RequestBodyError } from '@/lib/security/request-body';

const DEDUPLICATION_WINDOW_MS = 15 * 60 * 1000;
const MAX_REPORT_FINGERPRINTS = 1000;
const seenReports = new Map<string, number>();

function safeOrigin(value: unknown): string {
    if (typeof value !== 'string') return 'unknown';
    if (value === 'inline' || value === 'eval' || value === 'data') return value;
    try { return new URL(value).origin; } catch { return 'unknown'; }
}

function safeDirective(value: unknown): string {
    return typeof value === 'string' ? value.slice(0, 120) : 'unknown';
}

function removeExpiredReports(now: number) {
    for (const [fingerprint, expiry] of seenReports) {
        if (expiry <= now) seenReports.delete(fingerprint);
    }
}

export async function POST(request: Request) {
    try {
        if (!await rateLimit('csp-report', 30, 300)) return new NextResponse(null, { status: 429 });

        const payload = JSON.parse((await readRequestBody(request, 16_384)).toString('utf8'));
        const report = payload?.['csp-report'] ?? payload?.body ?? payload;
        const summary = {
            documentOrigin: safeOrigin(report?.['document-uri'] ?? payload?.url),
            blockedOrigin: safeOrigin(report?.['blocked-uri'] ?? report?.blockedURL),
            effectiveDirective: safeDirective(report?.['effective-directive'] ?? report?.effectiveDirective ?? report?.['violated-directive']),
        };
        const fingerprint = createHash('sha256').update(JSON.stringify(summary)).digest('hex');
        const now = Date.now();
        removeExpiredReports(now);

        if (!seenReports.has(fingerprint)) {
            if (seenReports.size >= MAX_REPORT_FINGERPRINTS) {
                const oldest = seenReports.keys().next().value;
                if (oldest !== undefined) seenReports.delete(oldest);
            }
            seenReports.set(fingerprint, now + DEDUPLICATION_WINDOW_MS);
            console.warn('[csp-report]', summary);
        }
    } catch (error) {
        if (error instanceof RequestBodyError) return new NextResponse(null, { status: error.status });
        // CSP reports are advisory. Never reflect report data or affect the visitor response.
    }

    return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
