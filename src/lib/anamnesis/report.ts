import { bodyKinds, detailedBodyRegions, legacyBodyRegions, sensations } from './body-regions';
import { getQuestionnaire, goals, reviewReasons, type IntakeSubmission } from './questionnaire';

export const anamnesisStatuses = {
    pending: 'Pendente',
    not_filled: 'Não preenchida',
    completed: 'Concluída',
    needs_review: 'Aguardando revisão profissional',
    reviewed: 'Revisada',
    purged: 'Respostas descartadas',
} as const;

export type AnamnesisStatus = keyof typeof anamnesisStatuses;

export type AnamnesisReport = {
    questionnaire_version: string;
    service_slug: string | null;
    service_category: string;
    status: AnamnesisStatus;
    submission: IntakeSubmission | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    reviewed_by: string | null;
    purged_at: string | null;
    client_name: string;
    starts_at: string;
    unit: string;
    service_name: string | null;
    professional_name: string | null;
    notification_status: 'queued' | 'sending' | 'accepted' | 'unknown' | 'failed' | null;
};

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Maceio',
});

export function formatAnamnesisDate(value: string) {
    return dateFormat.format(new Date(value));
}

export function getAnamnesisDetails(report: AnamnesisReport) {
    const submission = report.submission;
    if (!submission) return null;
    const questionnaire = getQuestionnaire({ category: report.service_category, slug: report.service_slug }, report.questionnaire_version);
    const regionLabels = questionnaire?.regions ?? { ...legacyBodyRegions, ...detailedBodyRegions };
    return {
        clinical: questionnaire?.clinical ?? false,
        areas: submission.regions,
        alerts: questionnaire ? reviewReasons(questionnaire, submission) : [],
        goals: submission.goals.map(goal => goals[goal]),
        answers: Object.entries(submission.answers).map(([key, value]) => {
            const question = questionnaire?.questions.find(item => item.id === key);
            return { key, label: question?.label ?? key, value: question?.options.find(option => option.value === value)?.label ?? value };
        }),
        regions: submission.regions.map(({ region, kind, intensity, sensations: selectedSensations }) => ({
            key: `${region}:${kind}`,
            kind,
            label: [
                bodyKinds[kind],
                regionLabels[region] ?? region,
                intensity === undefined ? '' : `intensidade ${intensity}/${questionnaire?.intensity.max ?? 5}`,
                selectedSensations?.map(value => sensations[value]).join(', '),
            ].filter(Boolean).join(' · '),
        })),
        privacyVersion: submission.privacyVersion,
    };
}
