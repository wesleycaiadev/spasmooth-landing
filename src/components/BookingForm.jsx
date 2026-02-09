"use client";
import { useState } from 'react';
import { MessageSquare, ShieldCheck, Clock, CheckCircle, Send } from 'lucide-react';

export default function BookingForm() {
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        telefone: '',
        servico: '',
        data: '',
        horario: ''
    });
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { nome, cpf, telefone, servico, data, horario } = formData;

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

        setSuccess(true);

        setTimeout(() => {
            window.open(`https://wa.me/557991189140?text=${texto}`, '_blank');
            setFormData({ nome: '', cpf: '', telefone: '', servico: '', data: '', horario: '' });
            setSuccess(false);
        }, 700);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <section id="agendamento" className="py-20 bg-gradient-to-b from-slate-50 to-white">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100">
                    <div>
                        <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-bold tracking-wide mb-4">
                            📅 Agendamento
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-6">Solicite seu horário</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Escolha o tratamento e informe data/horário desejados. A confirmação final é feita via WhatsApp.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                                <div className="bg-cyan-100 p-3 rounded-full text-cyan-600 flex-shrink-0">
                                    <MessageSquare />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700">Confirmação por WhatsApp</h4>
                                    <p className="text-sm text-slate-400">Rápido e prático</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-green-50 p-4 rounded-xl border border-green-100">
                                <div className="bg-green-100 p-3 rounded-full text-green-600 flex-shrink-0">
                                    <ShieldCheck />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700">Atendimento reservado</h4>
                                    <p className="text-sm text-slate-400">Com discrição e conforto</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <div className="bg-orange-100 p-3 rounded-full text-orange-600 flex-shrink-0">
                                    <Clock />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700">Duração transparente</h4>
                                    <p className="text-sm text-slate-400">Você escolhe o tempo e o tratamento</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl shadow-lg border border-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nome completo *</label>
                                <input type="text" id="nome" required value={formData.nome} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                                    placeholder="Seu nome" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">CPF (opcional)</label>
                                <input type="text" id="cpf" value={formData.cpf} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                                    placeholder="000.000.000-00" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Telefone/WhatsApp *</label>
                                <input type="text" id="telefone" required value={formData.telefone} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                                    placeholder="(79) 9118-9140" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tratamento *</label>
                                <select id="servico" required value={formData.servico} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all appearance-none cursor-pointer">
                                    <option value="" disabled>Escolha um tratamento</option>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Data *</label>
                                    <input type="date" id="data" required value={formData.data} onChange={handleChange} min={today}
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-slate-600" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Horário *</label>
                                    <select id="horario" required value={formData.horario} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all cursor-pointer">
                                        <option value="" disabled>Selecione</option>
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

                            {success && (
                                <div className="text-green-600 text-sm bg-green-50 p-4 rounded-lg flex items-center gap-2 border border-green-200">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" /> Redirecionando para WhatsApp...
                                </div>
                            )}

                            <button type="submit"
                                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-200 transition-all transform hover:-translate-y-1 mt-4 flex justify-center items-center gap-2">
                                <Send className="w-5 h-5" /> Enviar para WhatsApp
                            </button>

                            <p className="text-xs text-slate-400 leading-relaxed">
                                Ao enviar, você será direcionado ao WhatsApp para confirmação do agendamento.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
