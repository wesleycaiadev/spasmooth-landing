'use client';

import { Fragment } from 'react';
import { bodyKinds, bodyMarkColors, bodyMarkOrder, detailedFigures, legacyFigures, type BodyKind, type BodyRegion } from '@/lib/anamnesis/body-regions';
import type { BodySelection } from '@/lib/anamnesis/questionnaire';

export default function BodyMap({ areas, detailed = false, kind = 'discomfort', onToggle }: {
    areas: BodySelection[];
    detailed?: boolean;
    kind?: BodyKind;
    onToggle?: (region: BodyRegion) => void;
}) {
    return (
        <div>
            <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
                {(detailed ? detailedFigures : legacyFigures).map(({ label, regions }) => (
                    <figure key={label} className="text-center">
                        <figcaption className="font-semibold text-slate-700">{label}</figcaption>
                        <svg viewBox="12 10 106 202" className="mx-auto w-full max-w-48" aria-label={label} role={onToggle ? 'group' : 'img'}>
                            {regions.map(({ id, shape, label, mirror }) => {
                                const selected = bodyMarkOrder.filter(value => areas.some(area => area.region === id && area.kind === value));
                                const color = selected[0] ? bodyMarkColors[selected[0]] : '#e2edf0';
                                const transform = mirror ? 'translate(130 0) scale(-1 1)' : undefined;
                                return (
                                    <Fragment key={id}>
                                    <path
                                        d={shape}
                                        transform={transform}
                                        fill={color}
                                        stroke={selected[1] ? bodyMarkColors[selected[1]] : '#617e8a'}
                                        strokeWidth={selected[1] ? 3 : 1.1}
                                        role={onToggle ? 'button' : undefined}
                                        aria-label={onToggle ? label : undefined}
                                        aria-pressed={onToggle ? selected.includes(kind) : undefined}
                                        tabIndex={onToggle ? 0 : undefined}
                                        onClick={onToggle ? () => onToggle(id) : undefined}
                                        onKeyDown={onToggle ? event => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                onToggle(id);
                                            }
                                        } : undefined}
                                        className={onToggle ? 'cursor-pointer hover:opacity-80 focus-visible:stroke-black focus-visible:stroke-[3px]' : undefined}
                                    />
                                    {selected[2] && (
                                        <path d={shape} transform={transform} fill="none" stroke={bodyMarkColors[selected[2]]}
                                            strokeWidth={2} strokeDasharray="2 3" pointerEvents="none" aria-hidden="true" />
                                    )}
                                    </Fragment>
                                );
                            })}
                        </svg>
                    </figure>
                ))}
            </div>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                {bodyMarkOrder.map(value => (
                    <li key={value} className="flex items-center gap-2">
                        <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: bodyMarkColors[value] }} />
                        {bodyKinds[value]}
                    </li>
                ))}
            </ul>
        </div>
    );
}
