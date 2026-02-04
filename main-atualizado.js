/**
 * main-atualizado.js
 * Funcionalidades principais: Menu mobile, Formulário, FAQ
 */

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initMobileMenu();
  initBookingForm();
  initFAQ();
  renderTreatments();
});

// ============================================
// MENU MOBILE
// ============================================

function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let isMenuOpen = false;

  menuBtn.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    mobileMenu.classList.toggle('hidden', !isMenuOpen);
    mobileMenu.classList.toggle('flex', isMenuOpen);
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      isMenuOpen = false;
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('flex');
    });
  });
}

// ============================================
// FORMULÁRIO DE AGENDAMENTO
// ============================================

function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const msgSucesso = document.getElementById('msg-sucesso');

  // Data mínima é hoje
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('data').setAttribute('min', hoje);

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;

    if (!nome || !telefone || !servico || !data || !horario) {
      alert('Por favor, preencha todos os campos obrigatórios (marcados com *).');
      return;
    }

    // Formata data para DD/MM/YYYY
    const dataBR = data.split('-').reverse().join('/');

    // Constrói mensagem para WhatsApp
    const texto =
      `🌟 *Novo Agendamento SpaSmooth*%0A%0A` +
      `👤 *Nome:* ${encodeURIComponent(nome)}%0A` +
      `📄 *CPF:* ${encodeURIComponent(cpf || 'Não informado')}%0A` +
      `📱 *Telefone:* ${encodeURIComponent(telefone)}%0A` +
      `💆 *Tratamento:* ${encodeURIComponent(servico)}%0A` +
      `📅 *Data:* ${encodeURIComponent(dataBR)}%0A` +
      `⏰ *Horário:* ${encodeURIComponent(horario)}%0A%0A` +
      `Por favor, confirme este agendamento!`;

    msgSucesso.classList.remove('hidden');

    setTimeout(() => {
      window.open(`https://wa.me/557991189140?text=${texto}`, '_blank');
      form.reset();
      msgSucesso.classList.add('hidden');
    }, 700);
  });
}

// ============================================
// FAQ ACCORDION
// ============================================

function initFAQ() {
  const faqButtons = document.querySelectorAll('.faq-item button');
  faqButtons.forEach(button => {
    button.addEventListener('click', () => toggleFaq(button));
  });
}

function toggleFaq(button) {
  const content = button.nextElementSibling;
  const icon = button.querySelector('i');
  const isHidden = content.classList.contains('hidden');

  // Fecha todos os itens
  document.querySelectorAll('.faq-item > div:last-child').forEach((div) => div.classList.add('hidden'));
  document.querySelectorAll('.faq-item button i').forEach((i) => i.classList.remove('rotate-180'));

  // Abre o item clicado
  if (isHidden) {
    content.classList.remove('hidden');
    icon.classList.add('rotate-180');
  }
}

// ============================================
// RENDERIZAR SERVIÇOS (TRATAMENTOS)
// ============================================

function renderTreatments() {
  const grid = document.getElementById('servicos-grid');
  
  if (!grid) return;

  const treatments = [
    {
      icon: 'sparkles',
      title: 'Terapia Tântrica',
      prices: ['1h R$ 350', '2h R$ 450'],
      description: 'Sessão dividida em três etapas.',
      details: [
        'Massagem relaxante / meditação',
        'Massagem sensitive',
        'Massagem orgástica'
      ],
      note: 'Obs: terapeuta realiza a sessão com roupas normais.',
      isHighlight: false
    },
    {
      icon: 'wind',
      title: 'Massagem Relaxante Especial',
      prices: ['1h R$ 200'],
      description: 'Sessão dividida em duas etapas.',
      details: [
        'Massagem relaxante',
        'Massagem orgástica'
      ],
      note: 'Obs: terapeuta realiza a sessão com roupas normais.',
      isHighlight: false
    },
    {
      icon: 'droplets',
      title: 'Massagem Nuru',
      prices: ['1h R$ 400'],
      description: 'Massagem sensual dividida em quatro etapas.',
      details: [
        'Massagem relaxante',
        'Massagem sensitive',
        'Massagem corpo a corpo',
        'Massagem orgástica'
      ],
      note: 'Obs: terapeuta realiza a sessão despida.',
      isHighlight: false
    },
    {
      icon: 'flame',
      title: 'Vivência Delirium',
      prices: ['1h R$ 500'],
      description: 'Massagem sensual com troca de massagem, em cinco etapas.',
      details: [
        'Massagem relaxante',
        'Troca de massagem',
        'Massagem sensitive',
        'Massagem corpo a corpo',
        'Massagem orgástica'
      ],
      note: 'Obs: terapeuta começa a sessão de lingerie e em seguida fica despida.',
      isHighlight: true
    },
    {
      icon: 'hand',
      title: 'Tailandesa',
      prices: ['R$ 300'],
      description: 'Relaxante + Sensitive + deslizamento dos seios pelo corpo.',
      details: [
        'Relaxante',
        'Sensitive',
        'Deslizamento dos seios pelo corpo'
      ],
      note: 'Obs: terapeuta fica de lingerie na parte de baixo. Inicia a sessão com roupa.',
      isHighlight: false
    },
    {
      icon: 'circle-dot',
      title: 'Ventosa com relaxante',
      prices: ['40min R$ 150', '60min R$ 250'],
      description: 'Combinação para alívio de tensões e bem-estar.',
      details: [
        '40min: R$ 150',
        '60min (com finalização): R$ 250'
      ],
      note: null,
      isHighlight: false
    }
  ];

  grid.innerHTML = treatments.map(treatment => `
    <div class="glass-card p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 flex flex-col">
      <div class="flex items-start justify-between gap-4 mb-6">
        <div class="bg-[#e2f6fc] w-16 h-16 rounded-2xl flex items-center justify-center">
          <i data-lucide="${treatment.icon}" class="w-8 h-8 text-cyan-600"></i>
        </div>
        <div class="text-right">
          <div class="text-sm text-slate-400">Duração</div>
          ${treatment.prices.map(p => `<div class="font-bold text-slate-700">${p}</div>`).join('')}
        </div>
      </div>
      <h3 class="text-2xl font-bold text-slate-700 mb-3">${treatment.title}</h3>
      <p class="text-slate-500 mb-5 text-sm">${treatment.description}</p>

      <div class="bg-white/60 rounded-2xl p-5 border border-white/40">
        <p class="text-sm font-bold text-slate-700 mb-2">${treatment.prices.length > 1 ? 'Etapas' : 'Detalhes'}</p>
        <ul class="list-disc pl-5 text-sm text-slate-600 space-y-1">
          ${treatment.details.map(detail => `<li>${detail}</li>`).join('')}
        </ul>
        ${treatment.note ? `<p class="text-xs text-slate-500 mt-4">${treatment.note}</p>` : ''}
      </div>

      <a href="#agendamento" class="mt-6 inline-block text-center px-6 py-3 rounded-full font-bold ${treatment.isHighlight ? 'bg-orange-400 hover:bg-orange-500 text-white' : 'bg-[#bddee7] hover:bg-cyan-200 text-slate-700'} transition-colors">
        Agendar
      </a>
    </div>
  `).join('');

  // Reinicializa os ícones Lucide
  lucide.createIcons();
}