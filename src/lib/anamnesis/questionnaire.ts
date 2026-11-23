import { z } from 'zod';

export const questionnaireVersion = 'spa-1';
export const privacyVersion = 'spa-aviso-1';
export const bodyKinds = { discomfort: 'Desconforto', preference: 'Preferência', avoid: 'Evitar' } as const;
export const bodyRegions = {
    'front-head': 'Cabeça · frente',
    'front-neck': 'Pescoço · frente',
    'front-arms': 'Braços · frente',
    'front-chest': 'Tórax · frente',
    'front-abdomen': 'Abdômen · frente',
    'front-legs': 'Pernas · frente',
    'front-feet': 'Pés · frente',
    'back-head': 'Cabeça · costas',
    'back-neck': 'Nuca',
    'back-arms': 'Braços · costas',
    'back-upper': 'Ombros e parte superior das costas',
    'back-lower': 'Lombar',
    'back-legs': 'Pernas · costas',
    'back-feet': 'Pés · costas',
} as const;

export const goals = {
    relaxation: 'Relaxamento e bem-estar',
    tension: 'Alívio de tensão ou desconforto',
    self_care: 'Autocuidado',
    aesthetics: 'Cuidados estéticos',
} as const;

const questions = {
    pressure: {
        label: 'Qual pressão você prefere?',
        options: { light: 'Leve', medium: 'Moderada', discuss: 'Prefiro conversar no atendimento' },
    },
    experience: {
        label: 'Você já fez este procedimento?',
        options: { first: 'Será minha primeira vez', previous: 'Já fiz antes' },
    },
    tanning: {
        label: 'Qual acabamento você prefere?',
        options: { subtle: 'Mais discreto', defined: 'Mais marcado', discuss: 'Prefiro conversar no atendimento' },
    },
    attention: {
        label: 'Há algum cuidado ou restrição que você quer conversar com a profissional antes do atendimento?',
        options: { discuss: 'Sim, gostaria de conversar', none: 'Não tenho nada a informar agora' },
    },
} as const;

const aestheticMassage = new Set(['combo-contorno-cuidado', 'mensal-modeladora-10-sessoes', 'drenagem-linfatica']);
const massageOffers = new Set(['combo-desacelera', 'combo-leveza', 'combo-recupera', 'mensal-sueca-4-sessoes']);
const massageCategories = new Set(['massage', 'massagem', 'day_spa']);

export function getQuestionnaire(service: { category: string; slug: string | null }, version: string) {
    if (version !== questionnaireVersion) return null;
    const slug = service.slug ?? '';
    const aesthetic = aestheticMassage.has(slug);
    const massage = aesthetic || massageCategories.has(service.category) || massageOffers.has(slug);
    const skinService = ['depilacao', 'bronzeamento', 'estetica'].includes(service.category);
    const tanning = service.category === 'bronzeamento' && /^(bronze-gelado-|realce-bronze-)/.test(slug);
    const goalIds: (keyof typeof goals)[] = ['self_care'];
    if (massage || service.category === 'tantrica') goalIds.unshift('relaxation');
    if (massage) goalIds.push('tension');
    if (aesthetic || skinService) goalIds.push('aesthetics');

    const questionIds: (keyof typeof questions)[] = [];
    if (massage) questionIds.push('pressure');
    if (skinService || service.category === 'tantrica') questionIds.push('experience');
    if (tanning) questionIds.push('tanning');
    questionIds.push('attention');

    return {
        version,
        privacyVersion,
        showMap: massage,
        goals: goalIds.map(id => ({ id, label: goals[id] })),
        questions: questionIds.map(id => ({
            id,
            label: questions[id].label,
            options: Object.entries(questions[id].options).map(([value, label]) => ({ value, label })),
        })),
    };
}

export type Questionnaire = NonNullable<ReturnType<typeof getQuestionnaire>>;
export type BodyRegion = keyof typeof bodyRegions;
export type BodyKind = keyof typeof bodyKinds;

const regionSchema = z.strictObject({
    region: z.enum(Object.keys(bodyRegions) as BodyRegion[]),
    kind: z.enum(['discomfort', 'preference', 'avoid']),
    intensity: z.number().int().min(1).max(5).optional(),
}).refine(area => area.intensity === undefined || area.kind === 'discomfort');
export type BodySelection = z.infer<typeof regionSchema>;

const intakeSchema = z.strictObject({
    consent: z.literal(true),
    goals: z.array(z.enum(['relaxation', 'tension', 'self_care', 'aesthetics'])).max(4),
    answers: z.record(z.string().max(20), z.string().max(20)),
    regions: z.array(regionSchema).max(Object.keys(bodyRegions).length * Object.keys(bodyKinds).length),
});

export function parseSubmission(input: unknown, questionnaire: Questionnaire) {
    const parsed = intakeSchema.safeParse(input);
    if (!parsed.success) return null;
    const submission = parsed.data;
    const { goals, answers, regions } = submission;
    if (goals.length !== new Set(goals).size || goals.some(goal => !questionnaire.goals.some(option => option.id === goal))) return null;
    if (Object.entries(answers).some(([key, value]) => !questionnaire.questions.some(question => question.id === key && question.options.some(option => option.value === value)))) return null;
    if ((!questionnaire.showMap && regions.length) || new Set(regions.map(area => `${area.region}:${area.kind}`)).size !== regions.length) return null;
    if (!goals.length && !Object.keys(answers).length && !regions.length) return null;

    return {
        submission: { ...submission, privacyVersion: questionnaire.privacyVersion },
        needsReview: answers.attention === 'discuss' || regions.some(area => area.kind !== 'preference'),
    };
}

export type IntakeSubmission = NonNullable<ReturnType<typeof parseSubmission>>['submission'];
