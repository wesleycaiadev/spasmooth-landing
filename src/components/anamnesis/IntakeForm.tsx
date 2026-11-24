'use client';

import { useState, type FormEvent } from 'react';
import { saveAnamnesis } from '@/services/anamnesis';
import { bodyKinds, sensations, type BodyKind, type BodyRegion } from '@/lib/anamnesis/body-regions';
import { questionIsVisible, type BodySelection, type Questionnaire } from '@/lib/anamnesis/questionnaire';
import BodyMap from './BodyMap';

export default function IntakeForm({ questionnaire, binding }: { questionnaire: Questionnaire; binding: string }) {
    const [goals, setGoals] = useState<string[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [kind, setKind] = useState<BodyKind>('discomfort');
    const [regions, setRegions] = useState<BodySelection[]>([]);
    const [consent, setConsent] = useState(false);
    const [sending, setSending] = useState<'complete' | 'skip'>();
    const busy = sending !== undefined;
    const [error, setError] = useState('');

    function toggleRegion(region: BodyRegion) {
        setRegions(previous => previous.some(area => area.region === region && area.kind === kind)
            ? previous.filter(area => area.region !== region || area.kind !== kind)
            : [...previous, { region, kind }]);
    }

    function updateQuestion(id: string, value: string) {
        setAnswers(previous => {
            const next = { ...previous };
            if (value) next[id] = value;
            else delete next[id];
            for (const question of questionnaire.questions) {
                if (!questionIsVisible(question, next)) delete next[question.id];
            }
            return next;
        });
    }

    function updateDiscomfort(region: BodyRegion, update: (area: BodySelection) => BodySelection) {
        setRegions(previous => previous.map(area => area.region === region && area.kind === 'discomfort' ? update(area) : area));
    }

    function renderQuestions(group?: 'health' | 'private') {
        return questionnaire.questions.filter(question => question.group === group && questionIsVisible(question, answers)).map(question => (
            <label key={question.id} className="block space-y-2">
                <span className="block font-bold text-[var(--spa-ink)]">{question.label}</span>
                <select className="w-full rounded-xl border border-slate-300 bg-white p-3" value={answers[question.id] ?? ''}
                    onChange={event => updateQuestion(question.id, event.target.value)}>
                    <option value="">Prefiro deixar em branco</option>
                    {question.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
            </label>
        ));
    }

    async function save(intent: 'complete' | 'skip', event?: FormEvent) {
        event?.preventDefault();
        if (busy) return;
        setError('');
        const hasAnswers = goals.length || regions.length || Object.keys(answers).some(key => key !== 'private_topics');
        if (intent === 'complete' && !hasAnswers) {
            setError('Escolha pelo menos uma resposta ou região do mapa, ou use “Pular esta etapa”.');
            return;
        }
        setSending(intent);
        try {
            const result = await saveAnamnesis(intent === 'complete'
                ? { intent, binding, answers: { consent, goals, answers, regions } }
                : { intent, binding });
            if (result.success) {
                window.location.replace('/obrigado');
                return;
            }
            setError(result.error);
        } catch {
            setError('Não foi possível salvar. Tente novamente.');
        }
        setSending(undefined);
    }

    return (
        <form onSubmit={event => save('complete', event)} autoComplete="off" aria-busy={busy} className="space-y-7">
            <fieldset disabled={busy} className="space-y-7">
                <fieldset className="space-y-2">
                    <legend className="mb-2 font-bold text-[var(--spa-ink)]">O que você busca neste atendimento?</legend>
                    {questionnaire.goals.map(goal => (
                        <label key={goal.id} className="flex min-h-10 items-center gap-3">
                            <input type="checkbox" checked={goals.includes(goal.id)} onChange={event => {
                                const checked = event.target.checked;
                                setGoals(previous => checked ? [...previous, goal.id] : previous.filter(value => value !== goal.id));
                            }} />
                            {goal.label}
                        </label>
                    ))}
                </fieldset>

                {renderQuestions()}
                {questionnaire.questions.some(question => question.group === 'health') && (
                    <details className="rounded-xl border border-slate-200 p-4">
                        <summary className="cursor-pointer font-bold text-[var(--spa-ink)]">Histórico de saúde e cuidados (opcional)</summary>
                        <div className="mt-4 space-y-4">
                            <p className="text-sm">Responda o que fizer sentido para o atendimento. Você pode conversar sobre detalhes diretamente com a profissional.</p>
                            {renderQuestions('health')}
                        </div>
                    </details>
                )}
                {questionnaire.questions.some(question => question.group === 'private') && (
                    <details className="rounded-xl border border-slate-200 p-4">
                        <summary className="cursor-pointer font-bold text-[var(--spa-ink)]">Assuntos pessoais (opcional)</summary>
                        <div className="mt-4 space-y-4">
                            <p className="text-sm">Use este espaço se quiser conversar em particular sobre conforto, posição ou área de contato neste procedimento.</p>
                            {renderQuestions('private')}
                        </div>
                    </details>
                )}

                {questionnaire.showMap && (
                    <details className="rounded-xl border border-slate-200 p-4">
                        <summary className="cursor-pointer font-bold text-[var(--spa-ink)]">Mapa corporal (opcional)</summary>
                        <p className="mt-3 text-sm">Escolha o tipo de marcação e selecione as regiões. As marcações registram suas preferências e limites. A autorização do procedimento acontece separadamente.</p>
                        <label className="my-4 flex flex-wrap items-center gap-2 font-semibold">
                            Tipo de marcação
                            <select className="rounded-lg border border-slate-300 bg-white p-2" value={kind} onChange={event => setKind(event.target.value as BodyKind)}>
                                {Object.entries(bodyKinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        </label>
                        {questionnaire.clinical && <p className="mb-3 text-sm">Esquerda e direita são os lados do seu corpo.</p>}
                        <BodyMap areas={regions} detailed={questionnaire.clinical} kind={kind} onToggle={busy ? undefined : toggleRegion} />
                        <details className="my-4">
                            <summary className="cursor-pointer font-semibold">Selecionar regiões por nome</summary>
                            <div className="mt-2 grid gap-x-3 sm:grid-cols-2">
                                {Object.entries(questionnaire.regions).map(([id, label]) => (
                                    <label key={id} className="flex min-h-11 items-center gap-2">
                                        <input type="checkbox" checked={regions.some(area => area.region === id && area.kind === kind)} onChange={() => toggleRegion(id)} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </details>
                        {regions.length > 0 && (
                            <ul aria-label="Regiões selecionadas" className="space-y-2">
                                {regions.map(({ region, kind, intensity, sensations: selectedSensations }) => (
                                    <li key={`${region}:${kind}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span>{questionnaire.regions[region]} · {bodyKinds[kind]}</span>
                                            <button type="button" aria-label={`Remover ${bodyKinds[kind]} em ${questionnaire.regions[region]}`} className="min-h-11 px-2 underline" onClick={() => setRegions(previous => previous.filter(area => area.region !== region || area.kind !== kind))}>Remover</button>
                                        </div>
                                        {kind === 'discomfort' && (
                                            <label className="flex flex-wrap items-center gap-2">
                                                <span>Intensidade (opcional)</span>
                                                <select aria-label={`Intensidade em ${questionnaire.regions[region]}`} value={intensity ?? ''} className="max-w-full rounded border border-slate-300 bg-white p-2" onChange={event => {
                                                    const value = event.target.value;
                                                    updateDiscomfort(region, area => ({ ...area, intensity: value ? Number(value) : undefined }));
                                                }}>
                                                    <option value="">Em branco</option>
                                                    {Array.from({ length: questionnaire.intensity.max - questionnaire.intensity.min + 1 }, (_, index) => {
                                                        const value = questionnaire.intensity.min + index;
                                                        const label = questionnaire.clinical && value === 0 ? '0 · sem desconforto'
                                                            : questionnaire.clinical && value === 10 ? '10 · maior desconforto imaginável' : value;
                                                        return <option key={value} value={value}>{label}</option>;
                                                    })}
                                                </select>
                                            </label>
                                        )}
                                        {kind === 'discomfort' && questionnaire.clinical && (
                                            <fieldset className="mt-3">
                                                <legend className="font-semibold">Como é a sensação nesta região? (opcional)</legend>
                                                <div className="grid sm:grid-cols-2">
                                                    {Object.keys(sensations).map((id: keyof typeof sensations) => (
                                                        <label key={id} className="flex min-h-10 items-center gap-2">
                                                            <input type="checkbox" checked={selectedSensations?.includes(id) ?? false}
                                                                onChange={event => {
                                                                    const checked = event.target.checked;
                                                                    updateDiscomfort(region, area => {
                                                                        const previous = area.sensations ?? [];
                                                                        const next = checked ? [...previous, id] : previous.filter(value => value !== id);
                                                                        return { ...area, sensations: next.length ? next : undefined };
                                                                    });
                                                                }} />
                                                            {sensations[id]}
                                                        </label>
                                                    ))}
                                                </div>
                                            </fieldset>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </details>
                )}

                <div className="space-y-3 rounded-xl bg-[var(--spa-mist)] p-4">
                    <p id="intake-privacy" className="text-sm">{questionnaire.clinical
                        ? 'Usamos as respostas que você escolher fornecer, inclusive informações de saúde, para preparar este atendimento e permitir revisão pela profissional autorizada. Você pode pular a ficha e seguir para o agradecimento.'
                        : 'Usamos suas respostas, inclusive informações que possam indicar desconforto, para preparar o atendimento e permitir avaliação pela equipe autorizada. O preenchimento é opcional. O consentimento desta ficha vale para essa finalidade.'} <a href="/privacidade" target="_blank" rel="noreferrer" className="font-bold underline">Aviso de privacidade</a></p>
                    <label className="flex items-start gap-3 text-sm font-semibold">
                        <input type="checkbox" checked={consent} required aria-describedby="intake-privacy" className="mt-1" onChange={event => setConsent(event.target.checked)} />
                        Concordo com o tratamento das respostas da ficha para preparar meu atendimento.
                    </label>
                </div>
            </fieldset>
            {error && (
                <div role="alert" className="text-sm text-red-800">
                    {error} <a href="/obrigado" className="font-bold underline">Ir para a página de agradecimento</a>
                </div>
            )}
            <div className="flex flex-col gap-2">
                <button type="submit" disabled={busy} className="spa-button-primary w-full disabled:opacity-60">
                    {sending === 'complete' ? 'Enviando respostas…' : 'Enviar respostas'}
                </button>
                <button type="button" disabled={busy} onClick={() => save('skip')} className="min-h-11 rounded-xl font-semibold text-[var(--spa-ink)] underline disabled:opacity-60">
                    {sending === 'skip' ? 'Pulando esta etapa…' : 'Pular esta etapa'}
                </button>
            </div>
        </form>
    );
}
