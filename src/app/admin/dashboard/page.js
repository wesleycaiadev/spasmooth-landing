"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Calendar, TrendingUp, Activity, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [stats, setStats] = useState({
        total: 0,
        scheduled: 0,
        conversion: 0
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            // Start date: 1st of the month at 00:00:00
            const [year, month] = selectedMonth.split('-');
            const startDate = new Date(year, month - 1, 1, 0, 0, 0);

            // End date: Last day of the month at 23:59:59
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);

            console.log('Querying Range:', startDate.toISOString(), 'to', endDate.toISOString());

            // Adjust query to filter by created_at range
            const { data: leads, error } = await supabase
                .from('leads')
                .select('created_at, status_kanban')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (error) {
                console.error('Erro ao buscar leads:', error);
            }

            if (leads) {
                // 1. Stats Calculation
                const total = leads.length;
                const scheduled = leads.filter(l => l.status_kanban === 'agendado' || l.status_kanban === 'concluido').length;
                const conversion = total > 0 ? Math.round((scheduled / total) * 100) : 0;
                setStats({ total, scheduled, conversion });

                // 2. Chart Data Calculation (Leads per day in selected month)
                // Initialize array for all days in month
                const daysInMonth = endDate.getDate();
                const dailyCounts = new Array(daysInMonth).fill(0);

                leads.forEach(lead => {
                    const day = new Date(lead.created_at).getDate();
                    if (day >= 1 && day <= daysInMonth) {
                        dailyCounts[day - 1]++;
                    }
                });

                setChartData(dailyCounts);
            }
            setLoading(false);
        }
        fetchStats();
    }, [selectedMonth]);

    const maxChartValue = Math.max(...chartData, 1);

    return (
        <div className="space-y-10 animate-fadeIn pb-12">
            {/* Header com Filtro Estilizado */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif text-slate-800 tracking-tight">
                        Visão Geral
                    </h1>
                    <p className="text-slate-500 mt-2 font-light">
                        Performance e métricas do seu spa.
                    </p>
                </div>

                <div className="relative group">
                    <div className="absolute inset-0 bg-cyan-200 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full border border-white/50 shadow-sm hover:shadow-md transition-all">
                        <Calendar size={18} className="text-cyan-600" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Mês:</span>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="outline-none text-slate-700 font-bold bg-transparent cursor-pointer font-sans"
                        />
                    </div>
                </div>
            </header>

            {/* Stats Cards com Identidade Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(6,182,212,0.15)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-blue-100/50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                <Users size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase tracking-wider">
                                Total
                            </span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Leads Gerados</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-800">{stats.total}</p>
                            <span className="text-sm text-slate-400 font-light">contatos</span>
                        </div>
                    </div>
                </div>

                <div className="relative group p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(6,182,212,0.15)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-cyan-50 rounded-full blur-3xl opacity-50 group-hover:bg-cyan-100 transition-colors"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-cyan-100/50 rounded-2xl text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-cyan-50 text-cyan-600 px-2 py-1 rounded-full uppercase tracking-wider">
                                Sucesso
                            </span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Agendamentos</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-800">{stats.scheduled}</p>
                            <span className="text-sm text-slate-400 font-light">confirmados</span>
                        </div>
                    </div>
                </div>

                <div className="relative group p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(6,182,212,0.15)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-50 group-hover:bg-purple-100 transition-colors"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-purple-100/50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-full uppercase tracking-wider">
                                Taxa
                            </span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Conversão</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-800">{stats.conversion}%</p>
                            <span className="text-sm text-slate-400 font-light">efetividade</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico Estilizado e Dinâmico */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-cyan-50/50 to-transparent rounded-full blur-3xl -z-10"></div>

                {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center animate-pulse">
                    <span className="text-cyan-600 font-bold text-sm tracking-widest">ATUALIZANDO...</span>
                </div>}

                <div className="flex items-end justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                                <Activity size={20} />
                            </div>
                            <h3 className="font-serif font-bold text-slate-800 text-xl">
                                Ritmo de Chegada
                            </h3>
                        </div>
                        <p className="text-slate-500 text-sm font-light pl-1">
                            Distribuição de leads ao longo de <span className="font-bold text-cyan-600">{new Date(selectedMonth + '-02').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                        </p>
                    </div>
                </div>

                {/* Área do Gráfico */}
                <div className="relative h-72 w-full">
                    {/* Linhas de Grade Sutis */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-px bg-slate-100 border-t border-dashed border-slate-200/50 last:border-0"></div>
                        ))}
                    </div>

                    <div className="h-full flex items-end justify-between gap-2 overflow-x-auto pb-6 px-2 custom-scrollbar z-10 relative">
                        {chartData.map((value, index) => {
                            const heightPercentage = Math.max((value / maxChartValue) * 100, 2); // Mínimo de 2% para visual
                            const isToday = false; // Lógica futura se quiser destacar hoje

                            return (
                                <div
                                    key={index}
                                    className="flex-1 min-w-[20px] h-full flex flex-col justify-end group/bar relative cursor-pointer"
                                >
                                    {/* Tooltip Flutuante Moderno */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 pointer-events-none z-50">
                                        <div className="bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap font-bold flex flex-col items-center">
                                            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider mb-0.5">Dia {index + 1}</span>
                                            <span>{value} {value === 1 ? 'Lead' : 'Leads'}</span>
                                            {/* Triângulo */}
                                            <div className="w-2 h-2 bg-slate-800 rotate-45 absolute -bottom-1"></div>
                                        </div>
                                    </div>

                                    {/* A Barra */}
                                    <div
                                        className={`w-full max-w-[40px] mx-auto rounded-t-xl transition-all duration-500 ease-out relative overflow-hidden ${value > 0 ? 'group-hover/bar:brightness-110 shadow-lg group-hover/bar:shadow-cyan-200/50' : ''}`}
                                        style={{ height: `${heightPercentage}%` }}
                                    >
                                        {/* Gradiente da Barra */}
                                        <div className={`absolute inset-0 bg-gradient-to-t ${value > 0 ? 'from-cyan-500 to-cyan-300' : 'from-slate-100 to-slate-50'}`}></div>

                                        {/* Brilho Superior */}
                                        {value > 0 && <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>}
                                    </div>

                                    {/* Número do Dia (Sutil) */}
                                    <span className="text-[10px] text-slate-300 group-hover/bar:text-cyan-600 font-bold text-center mt-2 transition-colors">
                                        {index + 1}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
