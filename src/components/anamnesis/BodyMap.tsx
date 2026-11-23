'use client';

import { bodyKinds, bodyRegions, type BodyKind, type BodyRegion, type BodySelection } from '@/lib/anamnesis/questionnaire';

const armShape = 'M44 67 Q36 68 33 79 L23 119 Q21 125 26 126 Q30 128 33 122 L48 86 Z M86 67 Q94 68 97 79 L107 119 Q109 125 104 126 Q100 128 97 122 L82 86 Z';
const legShape = 'M49 126 L81 126 Q86 135 82 151 L76 192 L66 192 L65 150 L64 150 L63 192 L53 192 L47 151 Q43 135 49 126 Z';
const feetShape = 'M53 192 L63 192 L63 201 Q60 207 49 206 Q44 205 47 201 Z M66 192 L76 192 L82 201 Q85 205 80 206 Q69 207 66 201 Z';
const headShape = 'M48 39 C48 12 82 12 82 39 C82 51 75 57 65 57 C55 57 48 51 48 39 Z';
const neckShape = 'M57 56 Q65 59 73 56 L76 64 Q65 71 54 64 Z';
const upperShape = 'M54 64 Q65 71 76 64 L86 67 L81 92 Q78 98 78 101 L52 101 Q52 98 49 92 L44 67 Z';
const lowerShape = 'M52 101 L78 101 Q77 110 81 126 L49 126 Q53 110 52 101 Z';

const silhouettes: { label: string; regions: [BodyRegion, string][] }[] = [
    {
        label: 'Frente',
        regions: [['front-head', headShape], ['front-neck', neckShape], ['front-arms', armShape], ['front-chest', upperShape], ['front-abdomen', lowerShape], ['front-legs', legShape], ['front-feet', feetShape]],
    },
    {
        label: 'Costas',
        regions: [['back-head', headShape], ['back-neck', neckShape], ['back-arms', armShape], ['back-upper', upperShape], ['back-lower', lowerShape], ['back-legs', legShape], ['back-feet', feetShape]],
    },
];
const colors = { discomfort: '#c62c38', preference: '#00766b', avoid: '#6d4598' };
const kindOrder = ['discomfort', 'avoid', 'preference'] as const;

export default function BodyMap({ areas, kind = 'discomfort', onToggle }: {
    areas: BodySelection[];
    kind?: BodyKind;
    onToggle?: (region: BodyRegion) => void;
}) {
    return (
        <div>
            <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
                {silhouettes.map(({ label, regions }) => (
                    <figure key={label} className="text-center">
                        <figcaption className="font-semibold text-slate-700">{label}</figcaption>
                        <svg viewBox="12 10 106 202" className="mx-auto w-full max-w-40" aria-label={label} role={onToggle ? 'group' : 'img'}>
                            {regions.map(([id, shape]) => {
                                const selected = kindOrder.filter(value => areas.some(area => area.region === id && area.kind === value));
                                const color = selected[0] ? colors[selected[0]] : '#e2edf0';
                                return (
                                    <path
                                        key={id}
                                        d={shape}
                                        fill={color}
                                        stroke={selected[1] ? colors[selected[1]] : '#617e8a'}
                                        strokeWidth={selected[1] ? 3 : 1.1}
                                        role={onToggle ? 'button' : undefined}
                                        aria-label={onToggle ? bodyRegions[id] : undefined}
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
                                );
                            })}
                        </svg>
                    </figure>
                ))}
            </div>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                {kindOrder.map(value => (
                    <li key={value} className="flex items-center gap-2">
                        <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: colors[value] }} />
                        {bodyKinds[value]}
                    </li>
                ))}
            </ul>
        </div>
    );
}
