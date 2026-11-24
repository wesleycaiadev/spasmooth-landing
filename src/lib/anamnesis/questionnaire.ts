import { z } from 'zod';
import { bodyKinds, detailedBodyRegions, legacyBodyRegions, sensations } from './body-regions';

export const questionnaireVersion = 'spa-1';
export const privacyVersion = 'spa-aviso-1';
export const clinicalQuestionnaireVersion = 'spa-2';
export const clinicalPrivacyVersion = 'spa-aviso-2';

export const goals = {
    relaxation: 'Relaxamento e bem-estar',
    tension: 'Alívio de tensão ou desconforto',
    self_care: 'Autocuidado',
    aesthetics: 'Cuidados estéticos',
} as const;

type QuestionDefinition = {
    label: string;
    options: Readonly<Record<string, string>>;
    group?: 'health' | 'private';
    requires?: { question: string; value: string };
    review?: { values: readonly string[]; message: string };
};

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
        review: { values: ['discuss'], message: 'A cliente pediu para conversar sobre cuidados ou restrições.' },
    },
} satisfies Record<string, QuestionDefinition>;

const healthOptions = { yes: 'Sim', no: 'Não', unsure: 'Não tenho certeza', discuss: 'Prefiro conversar em particular' };
const healthReviewValues = ['yes', 'unsure', 'discuss'];
const health = (label: string, message: string): QuestionDefinition => ({
    label, options: healthOptions, group: 'health', review: { values: healthReviewValues, message },
});
const privateQuestion = (label: string, message: string): QuestionDefinition => ({
    ...health(label, message), group: 'private', requires: { question: 'private_topics', value: 'discuss' },
});
const clinicalQuestions = {
    health_history: health('Você tem ou já teve alguma condição de saúde que valha discutir, como diabetes?', 'Histórico de saúde a conversar.'),
    medications: health('Você está usando algum medicamento que queira informar à profissional antes do atendimento?', 'Uso de medicamentos a conversar.'),
    surgeries: health('Você fez alguma cirurgia recente ou tem alguma cirurgia anterior que queira mencionar?', 'Histórico de cirurgia a conversar.'),
    implants: health('Você tem alguma prótese ou implante relevante para a área do atendimento?', 'Prótese ou implante a conversar.'),
    oncology: health('Há diagnóstico ou tratamento oncológico, atual ou anterior, que você queira mencionar à profissional?', 'Histórico oncológico a conversar.'),
    blood_pressure: health('Você tem ou já teve alguma alteração de pressão arterial que queira informar?', 'Histórico de alteração de pressão a conversar.'),
    skin: health('Existe alguma irritação, lesão ou outra alteração de pele na área do atendimento?', 'Cuidado com a pele a conversar.'),
    veins: health('Você tem varizes ou outra condição circulatória que queira informar?', 'Cuidado circulatório a conversar.'),
    thrombosis: health('Você tem ou já teve trombose?', 'Histórico de trombose a conversar.'),
    allergies: health('Você tem alguma alergia de contato ou respiratória que queira informar?', 'Alergia de contato ou respiratória a conversar.'),
    product_allergy: health('Você tem alergia ou já reagiu a algum produto usado na pele, como creme ou óleo?', 'Alergia ou reação a produto a conversar.'),
    massage_experience: {
        label: 'Você já fez massoterapia, drenagem ou reflexologia?',
        options: { first: 'Ainda não fiz', previous: 'Já fiz pelo menos uma delas' },
    },
    activity: {
        label: 'Você pratica alguma atividade física regularmente?',
        options: { yes: 'Sim', no: 'Não' },
    },
    activity_type: {
        label: 'Que tipo de atividade você pratica com mais frequência?',
        options: { strength: 'Fortalecimento ou musculação', aerobic: 'Caminhada, corrida ou outra atividade aeróbica', movement: 'Alongamento, yoga ou pilates', other: 'Outra atividade ou modalidades variadas' },
        requires: { question: 'activity', value: 'yes' },
    },
    private_topics: {
        label: 'Quer abrir perguntas opcionais sobre assuntos pessoais para conversar com a profissional?',
        options: { discuss: 'Sim, quero ver as perguntas', none: 'Prefiro seguir sem abrir' },
        group: 'private',
    },
    pregnancy: privateQuestion('Há uma gestação confirmada ou possível que você queira informar para conversar sobre ajustes no atendimento?', 'Assunto relacionado à gestação a conversar.'),
    menstruation: privateQuestion('Quer conversar sobre algum ajuste de conforto relacionado à menstruação?', 'Ajuste de conforto relacionado à menstruação a conversar.'),
    iud: privateQuestion('Quer conversar com a profissional sobre uso de DIU em relação a este atendimento?', 'Assunto relacionado ao uso de DIU a conversar.'),
} satisfies Record<string, QuestionDefinition>;

const massageHealth = [
    'health_history', 'medications', 'surgeries', 'implants', 'oncology', 'blood_pressure', 'skin', 'veins',
    'thrombosis', 'allergies', 'product_allergy',
] as const;
const privateTopicsByService: Partial<Record<string, ('pregnancy' | 'menstruation' | 'iud')[]>> = {
    'drenagem-linfatica': ['pregnancy'],
    'mensal-modeladora-10-sessoes': ['pregnancy', 'menstruation', 'iud'],
    'combo-contorno-cuidado': ['pregnancy', 'menstruation', 'iud'],
};

function question(id: string, definition: QuestionDefinition) {
    return {
        ...definition,
        id,
        options: Object.entries(definition.options).map(([value, label]) => ({ value, label })),
    };
}

const aestheticMassage = new Set(['combo-contorno-cuidado', 'mensal-modeladora-10-sessoes', 'drenagem-linfatica']);
const massageOffers = new Set(['combo-desacelera', 'combo-leveza', 'combo-recupera', 'mensal-sueca-4-sessoes']);
const massageCategories = new Set(['massage', 'massagem', 'day_spa']);

export function getQuestionnaire(service: { category: string; slug: string | null }, version: string) {
    if (version !== questionnaireVersion && version !== clinicalQuestionnaireVersion) return null;
    const clinical = version === clinicalQuestionnaireVersion;
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
    if ((skinService || service.category === 'tantrica') && (!clinical || !massage)) questionIds.push('experience');
    if (tanning) questionIds.push('tanning');
    const activeQuestions = questionIds.map(id => question(id, questions[id]));
    if (clinical && massage) {
        activeQuestions.push(...(['massage_experience', 'activity', 'activity_type', ...massageHealth] as const)
            .map(id => question(id, clinicalQuestions[id])));
        const topics = Object.hasOwn(privateTopicsByService, slug) ? privateTopicsByService[slug] : undefined;
        if (topics) {
            activeQuestions.push(...(['private_topics', ...topics] as const).map(id => question(id, clinicalQuestions[id])));
        }
    } else if (clinical && skinService) {
        activeQuestions.push(...(['skin', 'allergies', 'product_allergy'] as const).map(id => question(id, clinicalQuestions[id])));
    }
    activeQuestions.push(question('attention', questions.attention));

    return {
        version,
        privacyVersion: clinical ? clinicalPrivacyVersion : privacyVersion,
        clinical,
        showMap: massage,
        regions: clinical ? detailedBodyRegions : legacyBodyRegions,
        intensity: clinical ? { min: 0, max: 10 } : { min: 1, max: 5 },
        goals: goalIds.map(id => ({ id, label: goals[id] })),
        questions: activeQuestions,
    };
}

export type Questionnaire = NonNullable<ReturnType<typeof getQuestionnaire>>;
type IntakeQuestion = Questionnaire['questions'][number];

export function questionIsVisible(question: IntakeQuestion, answers: Record<string, string>): boolean {
    return !question.requires || answers[question.requires.question] === question.requires.value;
}

const regionSchema = z.strictObject({
    region: z.string().max(40),
    kind: z.enum(Object.keys(bodyKinds) as (keyof typeof bodyKinds)[]),
    intensity: z.number().int().min(0).max(10).optional(),
    sensations: z.array(z.enum(Object.keys(sensations) as (keyof typeof sensations)[])).min(1).max(Object.keys(sensations).length).optional(),
}).refine(area => (area.intensity === undefined && area.sensations === undefined) || area.kind === 'discomfort');
export type BodySelection = z.infer<typeof regionSchema>;

const intakeSchema = z.strictObject({
    consent: z.literal(true),
    goals: z.array(z.enum(['relaxation', 'tension', 'self_care', 'aesthetics'])).max(4),
    answers: z.record(z.string().max(32), z.string().max(20)),
    regions: z.array(regionSchema).max(Object.keys(detailedBodyRegions).length * Object.keys(bodyKinds).length),
});

export function reviewReasons(questionnaire: Questionnaire, { answers, regions }: Pick<IntakeSubmission, 'answers' | 'regions'>) {
    const reasons = questionnaire.questions.flatMap(({ id, review }) => review?.values.includes(answers[id]) ? [review.message] : []);
    if (regions.some(area => area.kind === 'discomfort')) reasons.push('Há regiões marcadas com dor ou desconforto.');
    if (regions.some(area => area.kind === 'avoid')) reasons.push('A cliente indicou regiões em que prefere evitar contato.');
    return reasons;
}

export function parseSubmission(input: unknown, questionnaire: Questionnaire) {
    const parsed = intakeSchema.safeParse(input);
    if (!parsed.success) return null;
    const submission = parsed.data;
    const { goals, answers, regions } = submission;
    if (goals.length !== new Set(goals).size || goals.some(goal => !questionnaire.goals.some(option => option.id === goal))) return null;
    if (Object.entries(answers).some(([key, value]) => !questionnaire.questions.some(
        question => question.id === key && questionIsVisible(question, answers) && question.options.some(option => option.value === value),
    ))) return null;
    if ((!questionnaire.showMap && regions.length) || new Set(regions.map(area => `${area.region}:${area.kind}`)).size !== regions.length) return null;
    if (regions.some(area => !Object.hasOwn(questionnaire.regions, area.region)
        || (area.intensity !== undefined && (area.intensity < questionnaire.intensity.min || area.intensity > questionnaire.intensity.max))
        || (area.sensations && (!questionnaire.clinical || new Set(area.sensations).size !== area.sensations.length)))) return null;
    const recordedAnswers = { ...answers };
    delete recordedAnswers.private_topics;
    if (!goals.length && !Object.keys(recordedAnswers).length && !regions.length) return null;

    return {
        submission: { ...submission, answers: recordedAnswers, privacyVersion: questionnaire.privacyVersion },
        needsReview: reviewReasons(questionnaire, submission).length > 0,
    };
}

export type IntakeSubmission = z.infer<typeof intakeSchema> & { privacyVersion: string };
