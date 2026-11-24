export const legacyBodyRegions = {
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

type View = 'front' | 'back';
type Segment = { id: string; label: string; shape: string; mirror: boolean };

const frontSegments = [
    ['head', 'Cabeça', 'M65 19 C45 19 48 51 59 56 L65 57 Z'],
    ['chest', 'Tórax', 'M44 67 L54 64 Q60 68 65 68 L65 91 L49 91 Z'],
    ['abdomen', 'Abdômen', 'M49 91 L65 91 L65 116 L51 116 Q54 105 49 91 Z'],
    ['hip', 'Quadril (frente)', 'M51 116 L65 116 L65 134 L47 134 Z'],
    ['thigh', 'Coxa (frente)', 'M47 134 L65 134 L63 154 L50 154 Z'],
    ['knee', 'Joelho (frente)', 'M50 154 L63 154 L63 165 L51 165 Z'],
    ['shin', 'Canela', 'M51 165 L63 165 L63 192 L53 192 Z'],
    ['foot', 'Pé (frente)', 'M53 192 L63 192 L63 201 Q60 207 49 206 Q44 205 47 201 Z'],
] as const;
const backSegments = [
    ['head', 'Cabeça (costas)', 'M65 19 C45 19 48 51 59 56 L65 57 Z'],
    ['shoulder', 'Ombro e parte superior das costas', 'M44 67 L54 64 Q60 68 65 68 L65 88 L49 88 Z'],
    ['mid', 'Meio das costas', 'M49 88 L65 88 L65 103 L52 103 Z'],
    ['lower', 'Lombar', 'M52 103 L65 103 L65 119 L50 119 Q53 111 52 103 Z'],
    ['hip', 'Quadril e glúteo', 'M50 119 L65 119 L65 134 L47 134 Z'],
    ['thigh', 'Coxa (costas)', 'M47 134 L65 134 L63 154 L50 154 Z'],
    ['knee', 'Atrás do joelho', 'M50 154 L63 154 L63 165 L51 165 Z'],
    ['calf', 'Panturrilha', 'M51 165 L63 165 L63 192 L53 192 Z'],
    ['foot', 'Calcanhar e pé', 'M53 192 L63 192 L63 201 Q60 207 49 206 Q44 205 47 201 Z'],
] as const;
const armSegments = [
    ['upper-arm', 'Braço', 'M44 67 Q36 68 33 79 L29 94 L42 95 L48 86 Z'],
    ['forearm', 'Antebraço', 'M29 94 L42 95 L33 117 L24 115 Z'],
    ['hand', 'Mão', 'M24 115 L33 117 Q29 130 25 127 Q19 126 24 115 Z'],
] as const;
const neck = 'M57 56 Q65 59 73 56 L76 64 Q65 71 54 64 Z';

function figure(view: View, segments: ReadonlyArray<readonly [string, string, string]>) {
    const regions: Segment[] = [{ id: `${view}-neck`, label: view === 'front' ? 'Pescoço (frente)' : 'Nuca', shape: neck, mirror: false }];
    for (const [key, label, shape] of [...segments, ...armSegments]) {
        for (const side of ['left', 'right'] as const) {
            regions.push({
                id: `${view}-${key}-${side}`,
                label: `${label} · lado ${side === 'left' ? 'esquerdo' : 'direito'}${armSegments.some(([arm]) => arm === key) ? (view === 'front' ? ' (frente)' : ' (costas)') : ''}`,
                shape,
                mirror: side !== (view === 'front' ? 'right' : 'left'),
            });
        }
    }
    return regions;
}

export const detailedFigures = [
    { label: 'Frente', regions: figure('front', frontSegments) },
    { label: 'Costas', regions: figure('back', backSegments) },
];
export const detailedBodyRegions: Record<string, string> = Object.fromEntries(
    detailedFigures.flatMap(view => view.regions.map(({ id, label }) => [id, label])),
);
export const bodyKinds = { discomfort: 'Dor ou desconforto', preference: 'Priorizar', avoid: 'Evitar contato' } as const;
export const sensations = {
    tension: 'Tensão ou rigidez',
    pressure: 'Pressão',
    aching: 'Dor em peso',
    sharp: 'Pontada',
    burning: 'Queimação',
    tingling: 'Formigamento',
    other: 'Outra sensação',
} as const;
export type BodyKind = keyof typeof bodyKinds;
export type BodyRegion = string;
