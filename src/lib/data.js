export const TREATMENTS = [
    {
        id: 'tantrica-1h',
        category: 'massage',
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
        category: 'massage',
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
        category: 'massage',
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
        category: 'massage',
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
        category: 'massage',
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
        category: 'massage',
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
    },
    {
        id: 'premium-black',
        category: 'massage',
        name: 'Vivência Premium Black',
        icon: 'Gem', // Alterado para Gem para dar ar premium/exclusivo
        durations: [{ time: '2h', price: 'R$ 1.850,00' }],
        description: 'A experiência definitiva com 2 horas de duração.',
        stages: [
            'Garrafa de Vinho',
            '30 minutos de SPA com a terapeuta',
            '80 minutos de Vivência Premium'
        ],
        note: 'Obs: Duração Total Aprox. 2 Horas',
        featured: true
    },
    {
        id: 'depilacao-meia-perna',
        category: 'waxing',
        name: 'Depilação - Meia Perna',
        icon: 'Feather',
        durations: [{ time: 'Sessão', price: 'R$ 25' }],
        description: 'Apara higiênica e cuidadosa dos pelos da meia perna.',
        stages: ['Apara dos pelos da meia perna.'],
        note: ''
    },
    {
        id: 'depilacao-perna-completa',
        category: 'waxing',
        name: 'Depilação - Perna Completa',
        icon: 'Sunset',
        durations: [{ time: 'Sessão', price: 'R$ 50' }],
        description: 'Apara dos pelos de toda a perna.',
        stages: ['Apara de coxas, joelhos e panturrilhas.'],
        note: ''
    },
    {
        id: 'depilacao-bracos',
        category: 'waxing',
        name: 'Depilação - Braços',
        icon: 'Target',
        durations: [{ time: 'Sessão', price: 'R$ 25' }],
        description: 'Apara dos pelos de ambos os braços.',
        stages: ['Apara cuidadosa dos braços.'],
        note: ''
    },
    {
        id: 'depilacao-costas',
        category: 'waxing',
        name: 'Depilação - Costas',
        icon: 'Asterisk',
        durations: [{ time: 'Sessão', price: 'R$ 25' }],
        description: 'Remoção de pelos das costas e ombros.',
        stages: ['Costas e ombros totalmente limpos.'],
        note: ''
    },
    {
        id: 'depilacao-abdomen',
        category: 'waxing',
        name: 'Depilação - Abdômen',
        icon: 'CircleDot',
        durations: [{ time: 'Sessão', price: 'R$ 25' }],
        description: 'Remoção de pelos da região abdominal e peito.',
        stages: ['Limpeza abdominal e peitoral.'],
        note: ''
    },
    {
        id: 'depilacao-intima',
        category: 'waxing',
        name: 'Depilação - Íntima',
        icon: 'ShieldCheck',
        durations: [{ time: 'Sessão', price: 'R$ 25' }],
        description: 'Apara higiênica e cuidadosa da região íntima.',
        stages: ['Apara cuidadosa da região íntima.'],
        note: ''
    },
    {
        id: 'depilacao-corpo-todo',
        category: 'waxing',
        name: 'Depilação - Corpo Todo',
        icon: 'Stars',
        durations: [{ time: 'Sessão', price: 'R$ 125' }],
        description: 'Pacote completo para corpo todo.',
        stages: ['Pacote completo com todas as 5 áreas acima.'],
        note: ''
    }
];

export const PROFESSIONALS = [
    {
        id: 'clara',
        name: 'Clara',
        role: 'Terapeuta Especialista',
        bio: 'Atendimentos focados no relaxamento profundo e liberação de tensões, proporcionando uma experiência única e sensorial.',
        specialties: ['Terapia Tântrica', 'Massagem Relaxante Especial', 'Vivência Delirium'],
        avatar: '/images/professionals/clara/avatar.jpg',
        gallery: [
            '/images/professionals/clara/1.jpg',
            '/images/professionals/clara/2.jpg'
        ]
    },
    {
        id: 'maria',
        name: 'Maria',
        role: 'Terapeuta Sensorial',
        bio: 'Especialista em toques sutis e intensos, criando uma conexão autêntica que revitaliza o corpo e a mente.',
        specialties: ['Terapia Tântrica', 'Massagem Nuru', 'Tailandesa'],
        avatar: '/images/professionals/maria/avatar.jpg',
        gallery: [
            '/images/professionals/maria/1.jpg'
        ]
    },
    {
        id: 'anne',
        name: 'Anne',
        role: 'Terapeuta Holística',
        bio: 'Combinando técnicas de relaxamento e terapia íntima para alcançar o ápice do seu bem-estar físico e energético.',
        specialties: ['Massagem Relaxante Especial', 'Ventosa com Relaxante', 'Vivência Premium Black'],
        avatar: '/images/professionals/anne/avatar.jpg',
        gallery: [
            '/images/professionals/anne/1.jpg',
            '/images/professionals/anne/2.jpg',
            '/images/professionals/anne/3.jpg',
            '/images/professionals/anne/4.jpeg',
            '/images/professionals/anne/5.jpeg'
        ]
    },
    {
        id: 'bella',
        name: 'Bella',
        role: 'Terapeuta Especialista',
        bio: 'Proporcionando uma experiência relaxante e inesquecível com técnicas exclusivas de bem-estar e conexões profundas.',
        specialties: ['Massagem Relaxante Especial', 'Terapia Tântrica'],
        avatar: '/images/professionals/bella/avatar.jpeg',
        gallery: [
            '/images/professionals/bella/1.jpeg',
            '/images/professionals/bella/2.jpeg'
        ]
    }
];
