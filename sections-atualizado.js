/**
 * sections-atualizado.js
 * Arquivo reservado para futuras extensões/seções dinâmicas
 * Atualmente, as seções estão renderizadas diretamente no HTML
 */

// Espaço para adicionar novas funcionalidades de seções conforme necessário
// Este arquivo pode ser usado para renderização dinâmica de conteúdo no futuro
    <div class="container mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-12 items-center bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100">
        <div>
          <div class="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-bold tracking-wide mb-4">
            📅 Agendamento
          </div>
          <h2 class="text-3xl md:text-4xl font-bold text-slate-700 mb-6">Solicite seu horário</h2>
          <p class="text-slate-500 mb-8 leading-relaxed">
            Escolha o tratamento e informe data/horário desejados. A confirmação final é feita via WhatsApp.
          </p>

          <div class="space-y-4">
            <div class="flex items-center gap-4 bg-cyan-50 p-4 rounded-xl border border-cyan-100">
              <div class="bg-cyan-100 p-3 rounded-full text-cyan-600 flex-shrink-0">
                <i data-lucide="message-square"></i>
              </div>
              <div>
                <h4 class="font-bold text-slate-700">Confirmação por WhatsApp</h4>
                <p class="text-sm text-slate-400">Rápido e prático</p>
              </div>
            </div>

            <div class="flex items-center gap-4 bg-green-50 p-4 rounded-xl border border-green-100">
              <div class="bg-green-100 p-3 rounded-full text-green-600 flex-shrink-0">
                <i data-lucide="shield-check"></i>
              </div>
              <div>
                <h4 class="font-bold text-slate-700">Atendimento reservado</h4>
                <p class="text-sm text-slate-400">Com discrição e conforto</p>
              </div>
            </div>

            <div class="flex items-center gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
              <div class="bg-orange-100 p-3 rounded-full text-orange-600 flex-shrink-0">
                <i data-lucide="clock"></i>
              </div>
              <div>
                <h4 class="font-bold text-slate-700">Duração transparente</h4>
                <p class="text-sm text-slate-400">Você escolhe o tempo e o tratamento</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl shadow-lg border border-slate-100">
          <form id="bookingForm" class="space-y-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Nome completo *</label>
              <input type="text" id="nome" required
                     class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                     placeholder="Seu nome" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">CPF (opcional)</label>
              <input type="text" id="cpf"
                     class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                     placeholder="000.000.000-00" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Telefone/WhatsApp *</label>
              <input type="text" id="telefone" required
                     class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                     placeholder="(79) 99999-9999" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Tratamento *</label>
              <select id="servico" required
                      class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all appearance-none cursor-pointer">
                <option value="" disabled selected>Escolha um tratamento</option>
                <option value="Terapia Tântrica (1h • R$ 350)">Terapia Tântrica (1h) • R$ 350</option>
                <option value="Terapia Tântrica (2h • R$ 450)">Terapia Tântrica (2h) • R$ 450</option>
                <option value="Massagem Relaxante Especial (1h • R$ 200)">Massagem Relaxante Especial (1h) • R$ 200</option>
                <option value="Massagem Nuru (1h • R$ 400)">Massagem Nuru (1h) • R$ 400</option>
                <option value="Vivência Delirium (1h • R$ 500)">Vivência Delirium (1h) • R$ 500</option>
                <option value="Tailandesa (R$ 300)">Tailandesa • R$ 300</option>
                <option value="Ventosa + Relaxante (40min • R$ 150)">Ventosa + Relaxante (40min) • R$ 150</option>
                <option value="Ventosa + Relaxante com finalização (60min • R$ 250)">Ventosa + Relaxante com finalização (60min) • R$ 250</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Data *</label>
                <input type="date" id="data" required
                       class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-slate-600" />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Horário *</label>
                <select id="horario" required
                        class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all cursor-pointer">
                  <option value="" disabled selected>Selecione</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>

            <div id="msg-sucesso" class="hidden text-green-600 text-sm bg-green-50 p-4 rounded-lg flex items-center gap-2 border border-green-200">
              <i data-lucide="check-circle" class="w-5 h-5 flex-shrink-0"></i> Redirecionando para WhatsApp...
            </div>

            <button type="submit"
                    class="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-200 transition-all transform hover:-translate-y-1 mt-4 flex justify-center items-center gap-2">
              <i data-lucide="send" class="w-5 h-5"></i> Enviar para WhatsApp
            </button>

            <p class="text-xs text-slate-400 leading-relaxed">
              Ao enviar, você será direcionado ao WhatsApp para confirmação do agendamento.
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
`;

/**
 * Seção Depoimentos
 */
const TESTIMONIALS_HTML = `
  <section id="depoimentos" class="py-20 bg-white">
    <div class="container mx-auto px-6">
      <div class="text-center mb-12 max-w-2xl mx-auto px-4">
        <span class="text-cyan-600 font-semibold tracking-wider uppercase text-sm mb-2 block">O que dizem</span>
        <h2 class="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Histórias de Renovação</h2>
        <div class="w-24 h-1 bg-cyan-200 mx-auto rounded-full"></div>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
          <div class="flex text-yellow-400 mb-4">
            <i data-lucide="star" class="w-5 h-5 fill-current"></i><i data-lucide="star" class="w-5 h-5 fill-current"></i>
            <i data-lucide="star" class="w-5 h-5 fill-current"></i><i data-lucide="star" class="w-5 h-5 fill-current"></i>
            <i data-lucide="star" class="w-5 h-5 fill-current"></i>
          </div>
          <p class="text-slate-600 italic mb-6">"Ambiente acolhedor e experiência incrível. Saí renovada!"</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">M</div>
            <div>
              <h4 class="font-bold text-slate-800">Mariana Costa</h4>
              <p class="text-xs text-slate-400">Cliente Verificado</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
          <div class="flex text-yellow-400 mb-4">
            <i data-lucide="star" class="w-5 h-5 fill-current"></i><i data-lucide="star" class="w-5 h-5 fill-current"></i>
            <i data-lucide="star" class="w-5 h-5 fill-current"></i><i data-lucide="star" class="w-5 h-5 fill-current"></i>
            <i data-lucide="star" class="w-5 h-5 fill-current"></i>
          </div>
          <p class="text-slate-600 italic mb-6">"Atendimento impecável e muito profissional. Recomendo!"</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">R</div>
            <div>
              <h4 class="font-bold text-slate-800">Roberto Alves</h4>
              <p class="text-xs text-slate-400">Cliente Verificado</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
          <div class="flex text-yellow-400 mb-4">
            <i data-lucide="star" class="w-5 h-5 fill-current"></i><i data-lucide="star" class="w-5 h-5 fill-current"></i>
            <i data-lucide="star" class="w-5 h-5 fill-current"></i><i data-lucide="star" class="w-5 h-5 fill-current"></i>
            <i data-lucide="star" class="w-5 h-5 fill-current"></i>
          </div>
          <p class="text-slate-600 italic mb-6">"Do agendamento ao pós-sessão, tudo muito organizado."</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">F</div>
            <div>
              <h4 class="font-bold text-slate-800">Fernanda Lima</h4>
              <p class="text-xs text-slate-400">Cliente Verificado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;

/**
 * Seção FAQ
 */
const FAQ_HTML = `
  <section id="faq" class="py-20 bg-[#f8fafc]">
    <div class="container mx-auto px-6 max-w-3xl">
      <div class="text-center mb-12 max-w-2xl mx-auto px-4">
        <span class="text-cyan-600 font-semibold tracking-wider uppercase text-sm mb-2 block">Dúvidas Frequentes</span>
        <h2 class="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Ficou alguma questão?</h2>
        <div class="w-24 h-1 bg-cyan-200 mx-auto rounded-full"></div>
      </div>

      <div class="space-y-4">
        <div class="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white faq-item">
          <button class="w-full flex justify-between items-center p-6 hover:bg-slate-50 transition-colors text-left font-bold text-slate-700" onclick="toggleFaq(this)">
            Qual a forma de pagamento?
            <i data-lucide="chevron-down" class="text-slate-400 transition-transform duration-300"></i>
          </button>
          <div class="hidden p-6 bg-slate-50 text-slate-600 border-t border-slate-100">
            Aceitamos PIX e dinheiro. Outras formas podem ser combinadas no atendimento via WhatsApp.
          </div>
        </div>

        <div class="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white faq-item">
          <button class="w-full flex justify-between items-center p-6 hover:bg-slate-50 transition-colors text-left font-bold text-slate-700" onclick="toggleFaq(this)">
            Preciso levar algo?
            <i data-lucide="chevron-down" class="text-slate-400 transition-transform duration-300"></i>
          </button>
          <div class="hidden p-6 bg-slate-50 text-slate-600 border-t border-slate-100">
            Não se preocupe: o espaço é preparado para sua experiência. Se houver alguma orientação específica, enviamos na confirmação.
          </div>
        </div>

        <div class="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white faq-item">
          <button class="w-full flex justify-between items-center p-6 hover:bg-slate-50 transition-colors text-left font-bold text-slate-700" onclick="toggleFaq(this)">
            Como funciona a confirmação?
            <i data-lucide="chevron-down" class="text-slate-400 transition-transform duration-300"></i>
          </button>
          <div class="hidden p-6 bg-slate-50 text-slate-600 border-t border-slate-100">
            Você envia a solicitação pelo formulário e a equipe confirma pelo WhatsApp conforme disponibilidade.
          </div>
        </div>
      </div>
    </div>
  </section>
`;