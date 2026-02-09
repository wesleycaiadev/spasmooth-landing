export const TREATMENTS = [
    {
        id: 'tantrica-1h',
        name: 'Terapia Tântrica',
        icon: 'Sparkles',
        durations: [
            { time: '1h', price: 'R$ 350' },
            { time: '2h', price: 'R$ 450' }
        ],
        description: 'Sessão dividida em três etapas.',
        stages: [
            'Massagem relaxante / meditação',
            'Massagem sensitive',
            'Massagem orgástica'
        ],
        note: 'Obs: terapeuta realiza a sessão com roupas normais.'
    },
    {
        id: 'relaxante-especial',
        name: 'Massagem Relaxante Especial',
        icon: 'Wind',
        durations: [{ time: '1h', price: 'R$ 200' }],
        description: 'Sessão dividida em duas etapas.',
        stages: [
            'Massagem relaxante',
            'Massagem orgástica'
        ],
        note: 'Obs: terapeuta realiza a sessão com roupas normais.'
    },
    {
        id: 'nuru',
        name: 'Massagem Nuru',
        icon: 'Droplets',
        durations: [{ time: '1h', price: 'R$ 400' }],
        description: 'Massagem sensual dividida em quatro etapas.',
        stages: [
            'Massagem relaxante',
            'Massagem sensitive',
            'Massagem corpo a corpo',
            'Massagem orgástica'
        ],
        note: 'Obs: terapeuta realiza a sessão despida.'
    },
    {
        id: 'delirium',
        name: 'Vivência Delirium',
        icon: 'Flame',
        durations: [{ time: '1h', price: 'R$ 500' }],
        description: 'Massagem sensual com troca de massagem, em cinco etapas.',
        stages: [
            'Massagem relaxante',
            'Troca de massagem',
            'Massagem sensitive',
            'Massagem corpo a corpo',
            'Massagem orgástica'
        ],
        note: 'Obs: terapeuta começa a sessão de lingerie e em seguida fica despida.',
        featured: true
    },
    {
        id: 'tailandesa',
        name: 'Tailandesa',
        icon: 'Hand',
        durations: [{ time: 'Completa', price: 'R$ 300' }],
        description: 'Relaxante + Sensitive + deslizamento dos seios pelo corpo.',
        stages: [
            'Relaxante',
            'Sensitive',
            'Deslizamento dos seios pelo corpo'
        ],
        note: 'Obs: terapeuta fica de lingerie na parte de baixo. Inicia a sessão com roupa.'
    },
    {
        id: 'ventosa',
        name: 'Ventosa com Relaxante',
        icon: 'CircleDot',
        durations: [
            { time: '40min', price: 'R$ 150' },
            { time: '60min (com finalização)', price: 'R$ 250' }
        ],
        description: 'Combinação para alívio de tensões e bem-estar.',
        stages: [
            '40min: R$ 150',
            '60min (com finalização): R$ 250'
        ],
        note: ''
    }
];
