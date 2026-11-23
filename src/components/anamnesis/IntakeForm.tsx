'use client';

import { useState, type FormEvent } from 'react';
import { saveAnamnesis } from '@/services/anamnesis';
import { bodyKinds, bodyRegions, type BodyKind, type BodyRegion, type BodySelection, type Questionnaire } from '@/lib/anamnesis/questionnaire';
import BodyMap from './BodyMap';

export default function IntakeForm({ questionnaire, binding }: { questionnaire: Questionnaire; binding: string }) {
    const [goals, setGoals] = useState<string[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [kind, setKind] = useState<BodyKind>('discomfort');
    const [regions, setRegions] = useState<BodySelection[]>([]);
    const [consent, setConsent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    function toggleRegion(region: BodyRegion) {
        setRegions(previous => previous.some(area => area.region === region && area.kind === kind)
            ? previous.filter(area => area.region !== region || area.kind !== kind)
            : [...previous, { region, kind }]);
    }

    async function save(intent: 'complete' | 'skip', event?: FormEvent) {
        event?.preventDefault();
        setError('');
        setBusy(true);
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
        setBusy(false);
    }

    return (
        <form onSubmit={event => save('complete', event)} autoComplete="off" className="space-y-7">
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

                {questionnaire.questions.map(question => (
                    <label key={question.id} className="block space-y-2">
                        <span className="block font-bold text-[var(--spa-ink)]">{question.label}</span>
                        <select className="w-full rounded-xl border border-slate-300 bg-white p-3" value={answers[question.id] ?? ''} onChange={event => {
                            const value = event.target.value;
                            setAnswers(previous => {
                                const next = { ...previous };
                                if (value) next[question.id] = value;
                                else delete next[question.id];
                                return next;
                            });
                        }}>
                            <option value="">Prefiro deixar em branco</option>
                            {question.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>
                ))}

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
                        <BodyMap areas={regions} kind={kind} onToggle={busy ? undefined : toggleRegion} />
                        <details className="my-4">
                            <summary className="cursor-pointer font-semibold">Selecionar regiões por nome</summary>
                            <div className="mt-2 grid gap-x-3 sm:grid-cols-2">
                                {(Object.entries(bodyRegions) as [BodyRegion, string][]).map(([id, label]) => (
                                    <label key={id} className="flex min-h-11 items-center gap-2">
                                        <input type="checkbox" checked={regions.some(area => area.region === id && area.kind === kind)} onChange={() => toggleRegion(id)} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </details>
                        {regions.length > 0 && (
                            <ul aria-label="Regiões selecionadas" className="space-y-2">
                                {regions.map(({ region, kind, intensity }) => (
                                    <li key={`${region}:${kind}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span>{bodyRegions[region]} · {bodyKinds[kind]}</span>
                                            <button type="button" aria-label={`Remover ${bodyKinds[kind]} em ${bodyRegions[region]}`} className="min-h-11 px-2 underline" onClick={() => setRegions(previous => previous.filter(area => area.region !== region || area.kind !== kind))}>Remover</button>
                                        </div>
                                        {kind === 'discomfort' && (
                                            <label className="flex items-center gap-2">
                                                <span>Intensidade (opcional)</span>
                                                <select aria-label={`Intensidade em ${bodyRegions[region]}`} value={intensity ?? ''} className="rounded border border-slate-300 bg-white p-2" onChange={event => {
                                                    const value = event.target.value;
                                                    setRegions(previous => previous.map(area => area.region === region && area.kind === 'discomfort' ? { ...area, intensity: value ? Number(value) : undefined } : area));
                                                }}>
                                                    <option value="">Em branco</option>
                                                    {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value}</option>)}
                                                </select>
                                            </label>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </details>
                )}

                <div className="space-y-3 rounded-xl bg-[var(--spa-mist)] p-4">
                    <p id="intake-privacy" className="text-sm">Usamos suas respostas, inclusive informações que possam indicar desconforto, para preparar o atendimento e permitir avaliação pela equipe autorizada. O preenchimento é opcional. O consentimento desta ficha vale para essa finalidade. <a href="/privacidade" target="_blank" rel="noreferrer" className="font-bold underline">Aviso de privacidade</a></p>
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
                <button type="submit" disabled={busy} className="spa-button-primary w-full disabled:opacity-60">{busy ? 'Aguarde…' : 'Salvar avaliação'}</button>
                <button type="button" disabled={busy} onClick={() => save('skip')} className="min-h-11 rounded-xl font-semibold text-[var(--spa-ink)] underline disabled:opacity-60">Pular esta etapa</button>
            </div>
        </form>
    );
}
