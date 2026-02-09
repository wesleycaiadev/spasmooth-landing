"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Clock, Calendar, Check, AlertCircle } from 'lucide-react';

const DAYS = [
    { id: 0, label: 'Domingo' },
    { id: 1, label: 'Segunda-feira' },
    { id: 2, label: 'Terça-feira' },
    { id: 3, label: 'Quarta-feira' },
    { id: 4, label: 'Quinta-feira' },
    { id: 5, label: 'Sexta-feira' },
    { id: 6, label: 'Sábado' },
];

export default function SettingsPage() {
    const [professionals, setProfessionals] = useState([]);
    const [selectedPro, setSelectedPro] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Professionals
            const { data: pros, error: prosError } = await supabase
                .from('professionals')
                .select('*')
                .eq('active', true)
                .order('name');

            if (prosError) throw prosError;
            setProfessionals(pros);
            if (pros?.length > 0 && !selectedPro) setSelectedPro(pros[0].id);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar as configurações.' });
        } finally {
            setLoading(false);
        }
    };

    // Fetch schedule when selectedPro changes
    useEffect(() => {
        if (selectedPro) fetchScheduleForPro(selectedPro);
    }, [selectedPro]);

    const fetchScheduleForPro = async (proId) => {
        try {
            const { data, error } = await supabase
                .from('professional_schedule')
                .select('*')
                .eq('professional_id', proId);

            if (data) {
                // Transform to object key=day_of_week
                const scheduleMap = {};
                DAYS.forEach(day => {
                    const existing = data.find(d => d.day_of_week === day.id);
                    if (existing) {
                        scheduleMap[day.id] = { ...existing };
                    } else {
                        // Default
                        scheduleMap[day.id] = {
                            professional_id: proId,
                            day_of_week: day.id,
                            start_time: '08:00', // truncated for input time
                            end_time: '20:00',
                            is_day_off: day.id === 0 // Sunday off by default
                        };
                    }
                });
                setSchedule(scheduleMap);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleScheduleChange = (dayId, field, value) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // Prepare upsert data
            const upsertData = Object.values(schedule).map(s => ({
                professional_id: selectedPro,
                day_of_week: s.day_of_week,
                start_time: s.start_time,
                end_time: s.end_time,
                is_day_off: s.is_day_off
            }));

            // Upsert doesn't work easily with standard insert unless we have a unique constraint on (professional_id, day_of_week).
            // Let's check table definition. Usually PK is ID.
            // We should delete existing for this pro and insert, or rely on conflict.
            // But 'professional_schedule' has 'id' PK.
            // Better: Delete all for this pro, insert all. (Simple and safe for small data)

            await supabase
                .from('professional_schedule')
                .delete()
                .eq('professional_id', selectedPro);

            const { error } = await supabase
                .from('professional_schedule')
                .insert(upsertData);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Horários atualizados com sucesso!' });

            // Re-fetch to ensure IDs are back if needed (though we rebuild map anyway)
            fetchScheduleForPro(selectedPro);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
        } finally {
            setSaving(false);
            // Clear message after 3s
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-slate-50 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-slate-800">Configurações da Agenda</h1>
                    <p className="text-slate-500">Gerencie os horários e dias de folga de cada profissional.</p>
                </header>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                    {/* Sidebar: Professionals List */}
                    <aside className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block px-2">Profissionais</label>
                        <div className="space-y-1">
                            {loading ? (
                                <div className="text-sm text-slate-400 p-2">Carregando...</div>
                            ) : (
                                professionals.map(pro => (
                                    <button
                                        key={pro.id}
                                        onClick={() => setSelectedPro(pro.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedPro === pro.id
                                                ? 'bg-white text-cyan-700 shadow-md ring-1 ring-cyan-100'
                                                : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {pro.name}
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    {/* Main Content: Schedule Editor */}
                    <main className="flex-1 p-8 relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-700 font-serif">
                                        Horários de <span className="text-cyan-600">{professionals.find(p => p.id === selectedPro)?.name}</span>
                                    </h2>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                                    >
                                        {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />}
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>

                                {message && (
                                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-fadeIn ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                        }`}>
                                        {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                        {message.text}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {DAYS.map(day => {
                                        const daySchedule = schedule[day.id] || {};
                                        const isOff = daySchedule.is_day_off;

                                        return (
                                            <div key={day.id} className={`p-4 rounded-2xl border transition-all duration-300 ${isOff
                                                    ? 'bg-slate-50 border-slate-100 opacity-60'
                                                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-100'
                                                }`}>
                                                <div className="flex items-center justify-between gap-4">

                                                    {/* Day Toggle */}
                                                    <div className="flex items-center gap-4 w-40">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!isOff}
                                                                onChange={(e) => handleScheduleChange(day.id, 'is_day_off', !e.target.checked)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                                        </label>
                                                        <span className={`text-sm font-bold ${isOff ? 'text-slate-400' : 'text-slate-700'}`}>{day.label}</span>
                                                    </div>

                                                    {/* Time Inputs */}
                                                    <div className={`flex items-center gap-4 flex-1 justify-end transition-opacity ${isOff ? 'pointer-events-none opacity-50' : ''}`}>
                                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-50 transition-all">
                                                            <Clock size={14} className="text-slate-400" />
                                                            <input
                                                                type="time"
                                                                value={daySchedule.start_time?.substring(0, 5) || '08:00'}
                                                                onChange={(e) => handleScheduleChange(day.id, 'start_time', e.target.value)}
                                                                className="bg-transparent outline-none text-sm font-medium text-slate-700 w-24"
                                                            />
                                                        </div>
                                                        <span className="text-slate-300 font-bold">até</span>
                                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-50 transition-all">
                                                            <Clock size={14} className="text-slate-400" />
                                                            <input
                                                                type="time"
                                                                value={daySchedule.end_time?.substring(0, 5) || '20:00'}
                                                                onChange={(e) => handleScheduleChange(day.id, 'end_time', e.target.value)}
                                                                className="bg-transparent outline-none text-sm font-medium text-slate-700 w-24"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
