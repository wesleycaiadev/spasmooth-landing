"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Award, Search, Star, Gift, Crown, Clock, History } from 'lucide-react';
import { TREATMENTS } from '@/lib/data';

export default function RewardsPage() {
    const [leads, setLeads] = useState([]);
    const [recurringClients, setRecurringClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    // Configuração de Prêmio Padrão (Pode vir do DB no futuro)
    const REWARD_THRESHOLD = 5; // A cada 5 serviços, ganha um prêmio

    useEffect(() => {
        async function fetchLeads() {
            if (!supabase) { setLoading(false); return; }
            setLoading(true);
            const { data, error } = await supabase
                .from('leads')
                .select('id, nome, whatsapp, service_name, created_at, status_kanban, appointment_date')
                .eq('status_kanban', 'concluido') // Considera apenas serviços concluídos para premiação
                .order('created_at', { ascending: false });

            if (!error && data) {
                setLeads(data);
                processRecurring(data);
            }
            setLoading(false);
        }
        fetchLeads();
    }, []);

    const processRecurring = (allLeads) => {
        const clientMap = {};

        allLeads.forEach(lead => {
            if (!lead.whatsapp) return;
            const phone = lead.whatsapp.replace(/\D/g, '');
            if (!phone) return;

            if (!clientMap[phone]) {
                clientMap[phone] = {
                    phone,
                    name: lead.nome,
                    totalServices: 0,
                    history: [],
                    lastVisit: null
                };
            }

            clientMap[phone].totalServices += 1;
            clientMap[phone].history.push(lead);

            const leadDate = new Date(lead.appointment_date || lead.created_at);
            if (!clientMap[phone].lastVisit || leadDate > clientMap[phone].lastVisit) {
                clientMap[phone].lastVisit = leadDate;
            }
        });

        // Filtrar apenas com 2 ou mais serviços
        const recurring = Object.values(clientMap)
            .filter(c => c.totalServices >= 2)
            .sort((a, b) => b.totalServices - a.totalServices);

        setRecurringClients(recurring);
    };

    const filteredClients = recurringClients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif text-slate-800 tracking-tight flex items-center gap-3">
                        <Crown className="text-amber-500" size={32} />
                        Clube Fidelidade
                    </h1>
                    <p className="text-slate-500 mt-2 font-light">
                        Faça a gestão dos clientes VIPs e acompanhe as premiações.
                    </p>
                </div>

                <div className="relative w-full md:w-auto min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-amber-600 animate-pulse font-medium tracking-widest text-sm">CARREGANDO DADOS...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 text-xs uppercase tracking-wider font-bold border-b border-amber-100/50">
                                            <th className="p-4 pl-6">Cliente VIP</th>
                                            <th className="p-4">WhatsApp</th>
                                            <th className="p-4">Última Visita</th>
                                            <th className="p-4">Serviços Concluídos</th>
                                            <th className="p-4 pr-6 text-center">Progresso Prêmio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredClients.map((client, idx) => {
                                            const progress = client.totalServices % REWARD_THRESHOLD;
                                            const rewardsEarned = Math.floor(client.totalServices / REWARD_THRESHOLD);
                                            const isRewardReady = progress === 0 && client.totalServices > 0;
                                            const displayProgress = isRewardReady ? REWARD_THRESHOLD : progress;

                                            return (
                                                <tr
                                                    key={idx}
                                                    onClick={() => setSelectedClient(client)}
                                                    className={`border-b border-slate-50 hover:bg-amber-50/30 transition-colors group cursor-pointer ${selectedClient?.phone === client.phone ? 'bg-amber-50' : ''}`}
                                                >
                                                    <td className="p-4 pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center font-bold font-serif shadow-sm">
                                                                {client.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800">{client.name}</p>
                                                                {rewardsEarned > 0 && (
                                                                    <div className="flex gap-0.5 mt-0.5" title={`${rewardsEarned} prêmios já alcançados!`}>
                                                                        {[...Array(rewardsEarned)].map((_, i) => (
                                                                            <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-medium text-slate-600">{client.phone}</td>
                                                    <td className="p-4 text-slate-500">
                                                        {client.lastVisit ? client.lastVisit.toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                                                            {client.totalServices} xs
                                                        </span>
                                                    </td>
                                                    <td className="p-4 pr-6">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="flex gap-1 mb-1">
                                                                {[...Array(REWARD_THRESHOLD)].map((_, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`w-2 h-6 rounded-sm transition-all ${i < displayProgress ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-slate-100'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                                                {isRewardReady ? '🔥 PRÊMIO LIBERADO!' : `${displayProgress}/${REWARD_THRESHOLD} para Prêmio`}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredClients.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan="5" className="text-center p-12 text-slate-500 font-medium">Nenhum cliente recorrente encontrado.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumo do Cliente Selecionado */}
                <div className="md:col-span-1">
                    {selectedClient ? (
                        <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/5 p-6 border border-amber-100 sticky top-24 animate-slideInRight">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center font-bold font-serif text-2xl shadow-lg shadow-amber-200 mb-4 mx-auto">
                                {selectedClient.name.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-xl font-serif font-bold text-center text-slate-800 mb-1">{selectedClient.name}</h3>
                            <p className="text-center text-sm text-slate-500 mb-6 font-medium">{selectedClient.phone}</p>

                            {(selectedClient.totalServices % REWARD_THRESHOLD === 0) && selectedClient.totalServices > 0 && (
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl mb-6 shadow-lg shadow-amber-200 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl -mr-5 -mt-5 group-hover:scale-150 transition-transform"></div>
                                    <h4 className="font-bold flex items-center gap-2 mb-1 relative z-10"><Gift size={18} /> Prêmio Disponível!</h4>
                                    <p className="text-xs text-amber-100 relative z-10">O cliente atingiu a marca de {selectedClient.totalServices} serviços e tem direito a um resgate.</p>
                                    <button className="w-full mt-3 bg-white text-orange-600 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-50 transition-colors relative z-10">
                                        Marcar como Resgatado
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-2">
                                    <History size={16} className="text-slate-400" />
                                    Histórico de Serviços
                                </h4>
                                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                    {selectedClient.history.map((lead, idx) => (
                                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="font-bold text-sm text-slate-700 leading-tight mb-1">{lead.service_name || 'Serviço Genérico'}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <Clock size={12} />
                                                {new Date(lead.appointment_date || lead.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50/80 rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Award size={24} className="text-slate-300" />
                            </div>
                            <h3 className="font-bold text-slate-700 mb-2">Selecione um Cliente VIP</h3>
                            <p className="text-sm text-slate-500">Clique em um cliente na tabela para ver o histórico detalhado e gerenciar suas recompensas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
