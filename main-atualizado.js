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
  initGSAPAnimations();
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

// ============================================
// GSAP ANIMATIONS
// ============================================

function initGSAPAnimations() {
  // Registra ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // ========== HERO ANIMATIONS ==========
  // Headline e texto do hero aparecem com fade in e slide up
  gsap.to('.hero h1, .hero p, .hero .cta-buttons', {
    duration: 0.8,
    y: 0,
    opacity: 1,
    delay: 0.2,
    ease: 'power2.out'
  });

  // Blob gradient animação contínua e suave
  gsap.to('.blob-gradient', {
    duration: 15,
    rotation: 360,
    repeat: -1,
    ease: 'none'
  });

  // ========== SERVICES CARDS ANIMATIONS ==========
  // Stagger animation das cards ao entrar na viewport
  gsap.utils.toArray('.glass-card').forEach((card, index) => {
    gsap.fromTo(card, 
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.1 * index,
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );

    // Hover animation
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        duration: 0.4,
        scale: 1.05,
        boxShadow: '0 20px 40px rgba(6, 182, 212, 0.3)',
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        duration: 0.4,
        scale: 1,
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
        ease: 'power2.out'
      });
    });
  });

  // ========== TESTIMONIALS ANIMATIONS ==========
  // Fade in dos depoimentos ao rolar
  gsap.utils.toArray('.testimonial-card').forEach((card) => {
    gsap.fromTo(card,
      {
        opacity: 0,
        x: -30
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ========== FAQ ANIMATIONS ==========
  // Animação suave ao abrir e fechar FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item, index) => {
    gsap.fromTo(item,
      {
        opacity: 0,
        y: 20
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: 0.1 * index,
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ========== BUTTONS ANIMATIONS ==========
  // Hover effect em todos os botões
  gsap.utils.toArray('button, a[class*="bg-"], .cta-buttons a').forEach((btn) => {
    if (!btn.classList.contains('w-6') && !btn.classList.contains('h-6')) {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, {
          duration: 0.3,
          scale: 1.05,
          ease: 'back.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          duration: 0.3,
          scale: 1,
          ease: 'back.out'
        });
      });
    }
  });

  // ========== SCROLL ANIMATIONS COUNTERS ==========
  // Números dos serviços com contagem
  const stats = document.querySelectorAll('[data-number]');
  stats.forEach((stat) => {
    const finalValue = parseInt(stat.getAttribute('data-number'), 10);
    gsap.fromTo(stat,
      { textContent: 0 },
      {
        textContent: finalValue,
        duration: 2,
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: stat,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ========== WHATSAPP FLOAT BUTTON ==========
  // Animação contínua de pulse suave
  const whatsappBtn = document.querySelector('.fixed.bottom-6.right-6');
  if (whatsappBtn) {
    gsap.to(whatsappBtn, {
      duration: 1.5,
      boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Hover effect
    whatsappBtn.addEventListener('mouseenter', () => {
      gsap.to(whatsappBtn, {
        duration: 0.3,
        scale: 1.1
      });
    });

    whatsappBtn.addEventListener('mouseleave', () => {
      gsap.to(whatsappBtn, {
        duration: 0.3,
        scale: 1
      });
    });
  }

  // ========== HEADER SCROLL ANIMATION ==========
  // Header ficando mais compacto ao rolar
  const header = document.querySelector('header');
  if (header) {
    gsap.to(header, {
      scrollTrigger: {
        trigger: 'body',
        start: 'top 0',
        onUpdate: (self) => {
          if (self.getVelocity() > 0) {
            gsap.to(header, { y: -100, duration: 0.3 });
          } else {
            gsap.to(header, { y: 0, duration: 0.3 });
          }
        }
      }
    });
  }

  // ========== PARALLAX EFFECT ==========
  // Efeito paralax suave em seções
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  parallaxElements.forEach((element) => {
    gsap.fromTo(element,
      {
        y: 0
      },
      {
        y: -50,
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
          markers: false
        }
      }
    );
  });
}