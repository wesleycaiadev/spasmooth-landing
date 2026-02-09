/**
 * Objeto com dados de tratamentos
 * Mantém os dados separados da lógica de renderização
 */
const TREATMENTS = [
  {
    id: 'tantrica-1h',
    name: 'Terapia Tântrica',
    icon: 'sparkles',
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
    icon: 'wind',
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
    icon: 'droplets',
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
    icon: 'flame',
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
    icon: 'hand',
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
    icon: 'circle-dot',
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

/**
 * Seção Hero
 */
const HERO_HTML = `
  <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#e2f6fc]">
    <div class="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alt="Ambiente de massagem"
        class="w-full h-full object-cover opacity-90"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-[#e2f6fc]/40"></div>
    </div>

    <div class="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
      <div class="space-y-6 animate-slideUp">
        <div class="inline-block bg-cyan-100 text-cyan-700 px-4 py-1 rounded-full text-sm font-bold tracking-wide mb-2">
          🌿 Bem-estar em Aracaju
        </div>

        <h2 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-700 leading-tight">
          Renove suas energias e <span class="text-cyan-500">alivie tensões</span> sem sair da cidade.
        </h2>

        <p class="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
          Experiências personalizadas para relaxamento profundo e equilíbrio. Agende e confirme pelo WhatsApp.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <a href="#agendamento"
             class="px-10 py-3 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-orange-200/50 bg-orange-400 hover:bg-orange-500 text-white text-center flex items-center justify-center gap-2">
            Quero Agendar Minha Sessão
          </a>

          <a href="https://maps.app.goo.gl/F8keaZv4bWuJSz3u8" target="_blank"
             class="flex items-center justify-center gap-2 text-slate-500 hover:text-cyan-600 transition-colors font-semibold px-6 py-3">
            <i data-lucide="map-pin" class="w-5 h-5"></i> Ver no Mapa
          </a>
        </div>

        <div class="flex items-center gap-2 pt-4 text-sm text-slate-500">
          <div class="flex text-yellow-400">
            <i data-lucide="star" class="w-4 h-4 fill-current"></i>
            <i data-lucide="star" class="w-4 h-4 fill-current"></i>
            <i data-lucide="star" class="w-4 h-4 fill-current"></i>
            <i data-lucide="star" class="w-4 h-4 fill-current"></i>
            <i data-lucide="star" class="w-4 h-4 fill-current"></i>
          </div>
          <span class="font-semibold">4.9/5.0</span> baseado em avaliações reais
        </div>
      </div>

      <div class="hidden md:block"></div>
    </div>
  </section>
`;

/**
 * Seção PAS (Problem-Agitation-Solution)
 */
const PAS_HTML = `
  <section class="py-20 bg-white">
    <div class="container mx-auto px-6">
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-slate-50 p-8 rounded-3xl hover:bg-red-50 transition-colors duration-300 group">
          <div class="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 text-red-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-700 mb-3">Tensão acumulada?</h3>
          <p class="text-slate-500 leading-relaxed">Dores, rigidez e cansaço mental podem reduzir seu rendimento e seu bem-estar.</p>
        </div>

        <div class="bg-slate-50 p-8 rounded-3xl hover:bg-orange-50 transition-colors duration-300 group">
          <div class="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 text-orange-400 group-hover:scale-110 transition-transform">
            <i data-lucide="wind" class="w-8 h-8"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-700 mb-3">Mente sobrecarregada?</h3>
          <p class="text-slate-500 leading-relaxed">Estresse e ansiedade podem te deixar exausto mesmo depois de dormir.</p>
        </div>

        <div class="bg-[#e2f6fc] p-8 rounded-3xl border border-cyan-100 group relative overflow-hidden">
          <div class="relative z-10">
            <div class="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 text-cyan-500 group-hover:scale-110 transition-transform">
              <i data-lucide="check-circle" class="w-8 h-8"></i>
            </div>
            <h3 class="text-xl font-bold text-cyan-800 mb-3">Um refúgio pra você</h3>
            <p class="text-cyan-700 leading-relaxed mb-4">Sessões com foco em relaxamento, sensibilidade e experiência completa.</p>
            <a href="#servicos" class="font-bold text-cyan-600 hover:text-cyan-800 underline decoration-2 underline-offset-4">
              Ver tratamentos &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
`;

/**
 * Renderizar Tratamentos Dinamicamente
 */
function renderTreatments() {
  const treatmentsHTML = TREATMENTS.map(treatment => `
    <div class="glass-card p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 flex flex-col ${treatment.featured ? 'border-2 border-cyan-300' : ''}">
      <div class="flex items-start justify-between gap-4 mb-6">
        <div class="bg-[#e2f6fc] w-16 h-16 rounded-2xl flex items-center justify-center">
          <i data-lucide="${treatment.icon}" class="w-8 h-8 text-cyan-600"></i>
        </div>
        <div class="text-right">
          ${treatment.durations.map(d => `
            <div>
              <div class="text-sm text-slate-400">${d.time}</div>
              <div class="font-bold text-slate-700">${d.price}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <h3 class="text-2xl font-bold text-slate-700 mb-3">${treatment.name}</h3>
      <p class="text-slate-500 mb-5 text-sm">${treatment.description}</p>

      <div class="bg-white/60 rounded-2xl p-5 border border-white/40">
        <p class="text-sm font-bold text-slate-700 mb-2">Etapas</p>
        <ul class="list-disc pl-5 text-sm text-slate-600 space-y-1">
          ${treatment.stages.map(stage => `<li>${stage}</li>`).join('')}
        </ul>
        ${treatment.note ? `<p class="text-xs text-slate-500 mt-4">${treatment.note}</p>` : ''}
      </div>

      <a href="#agendamento" class="mt-6 inline-block text-center px-6 py-3 rounded-full font-bold transition-colors ${treatment.featured ? 'bg-orange-400 hover:bg-orange-500 text-white' : 'bg-[#bddee7] hover:bg-cyan-200 text-slate-700'}">
        Agendar
      </a>
    </div>
  `).join('');

  return `
    <section id="servicos" class="py-24 bg-[#f8fafc] relative overflow-hidden">
      <div class="absolute top-20 left-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div class="absolute bottom-20 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center mb-12 max-w-2xl mx-auto px-4">
          <span class="text-cyan-600 font-semibold tracking-wider uppercase text-sm mb-2 block">Tratamentos</span>
          <h2 class="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Escolha sua experiência</h2>
          <div class="w-24 h-1 bg-cyan-200 mx-auto rounded-full"></div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${treatmentsHTML}
        </div>

        <div class="mt-10 text-center text-xs text-slate-400">
          Informações e valores podem ser ajustados conforme disponibilidade e confirmação via WhatsApp.
        </div>
      </div>
    </section>
  `;
}