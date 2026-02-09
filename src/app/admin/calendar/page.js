"use client";

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const locales = {
    'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Helper to calculate end time based on service
const getDuration = (text) => {
    if (!text) return 60;
    const lower = text.toLowerCase();
    if (lower.includes('2 horas')) return 120;
    if (lower.includes('1 hora') || lower.includes('60 min')) return 60;
    if (lower.includes('40 min')) return 40;
    if (lower.includes('sessão completa')) return 90;
    return 60;
};

// Custom Toolbar Component
const CustomToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };

    const label = () => {
        const date = toolbar.date;
        return (
            <span className="capitalize font-serif text-xl font-bold text-slate-700">
                {date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
        );
    };

    return (
        <div className="flex justify-between items-center mb-6 p-1">
            <div className="flex items-center gap-4">
                <button onClick={goToCurrent} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                    Hoje
                </button>
                <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                    <button onClick={goToBack} className="p-2 hover:bg-slate-50 rounded-md text-slate-500 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={goToNext} className="p-2 hover:bg-slate-50 rounded-md text-slate-500 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2">
                {label()}
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => toolbar.onView('month')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${toolbar.view === 'month' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Mês
                </button>
                <button
                    onClick={() => toolbar.onView('week')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${toolbar.view === 'week' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Semana
                </button>
                <button
                    onClick={() => toolbar.onView('day')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${toolbar.view === 'day' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Dia
                </button>
            </div>
        </div>
    );
};

export default function AdminCalendar() {
    const [events, setEvents] = useState([]);
    const [selectedPro, setSelectedPro] = useState('all');
    const [loading, setLoading] = useState(true);
    const [prosList, setProsList] = useState([]);

    useEffect(() => {
        fetchProfessionals();
        fetchEvents();
    }, [selectedPro]);

    const fetchProfessionals = async () => {
        try {
            const { data, error } = await supabase
                .from('professionals')
                .select('id, name')
                .eq('active', true);

            if (error) throw error;
            if (data) setProsList([{ id: 'all', name: 'Todos' }, ...data]);
        } catch (error) {
            console.error("Erro ao buscar profissionais:", error);
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('leads')
                .select('*')
                .neq('status_kanban', 'cancelado');

            if (selectedPro !== 'all') {
                query = query.eq('professional_id', selectedPro);
            }

            const { data, error } = await query;

            if (error) throw error;

            const calendarEvents = data.map(lead => {
                if (!lead.appointment_date || !lead.appointment_time) return null;

                const [y, m, d] = lead.appointment_date.split('-');
                const [h, min] = lead.appointment_time.split(':');
                const startDate = new Date(y, m - 1, d, h, min);

                const durationMinutes = getDuration(lead.service_name);
                const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

                return {
                    id: lead.id,
                    title: lead.service_name,
                    client: lead.nome,
                    whatsapp: lead.whatsapp,
                    start: startDate,
                    end: endDate,
                    resource: lead
                };
            }).filter(Boolean);

            setEvents(calendarEvents);
        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Custom Toolbar defined logic inside to access state
    const CustomToolbar = (toolbar) => {
        const goToBack = () => toolbar.onNavigate('PREV');
        const goToNext = () => toolbar.onNavigate('NEXT');
        const goToCurrent = () => toolbar.onNavigate('TODAY');

        const label = () => {
            // Capitalize first letter logic handled by CSS or generic format
            const date = toolbar.date;
            const month = date.toLocaleString('pt-BR', { month: 'long' });
            const year = date.toLocaleString('pt-BR', { year: 'numeric' });
            return (
                <span className="font-serif text-3xl font-bold text-stone-700 capitalize">
                    {month} <span className="font-sans text-stone-400 text-xl font-normal opacity-60 ml-2">{year}</span>
                </span>
            );
        };

        return (
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-6">

                {/* 1. Navigation & Title */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white/80 backdrop-blur rounded-full p-1 border border-stone-200/60 shadow-sm">
                            <button onClick={goToBack} className="p-2.5 hover:bg-stone-100 rounded-full text-stone-500 hover:text-stone-800 transition-all">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={goToCurrent} className="px-4 text-xs font-bold text-stone-500 hover:text-stone-800 uppercase tracking-wider transition-colors">
                                Hoje
                            </button>
                            <button onClick={goToNext} className="p-2.5 hover:bg-stone-100 rounded-full text-stone-500 hover:text-stone-800 transition-all">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        {label()}
                    </div>
                </div>

                {/* 2. Avatar Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                    {prosList.map(p => {
                        const isSelected = selectedPro === p.id;
                        const initial = p.name ? p.name[0] : '?';
                        // Simple pastel color per pro for the avatar bg
                        const colors = ['bg-rose-200 text-rose-800', 'bg-violet-200 text-violet-800', 'bg-emerald-200 text-emerald-800', 'bg-amber-200 text-amber-800', 'bg-sky-200 text-sky-800'];
                        const colorClass = p.id === 'all' ? 'bg-stone-200 text-stone-600' : colors[p.name.charCodeAt(0) % colors.length];

                        return (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPro(p.id)}
                                className={`
                                    group flex items-center gap-2 px-1 pr-3 py-1 rounded-full transition-all duration-300 border
                                    ${isSelected
                                        ? 'bg-white border-cyan-500 shadow-md ring-1 ring-cyan-200 scale-105'
                                        : 'bg-white/50 border-transparent hover:bg-white hover:border-stone-200 hover:shadow-sm grayscale hover:grayscale-0'
                                    }
                                `}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colorClass}`}>
                                    {p.id === 'all' ? <Filter size={14} /> : initial}
                                </div>
                                <span className={`text-sm font-medium ${isSelected ? 'text-stone-800' : 'text-stone-500 group-hover:text-stone-700'}`}>
                                    {p.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Style Getter for the "Slot" wrapper
    const eventPropGetter = (event) => {
        // Pastel colors based on professional mapping
        // We'll trust the Tailwind classes in CustomEvent for the internal layout, 
        // but we need to remove the default blue background of RBC.

        let bgColor = '#ecfeff'; // cyan-50 (fallback)
        let borderColor = '#22d3ee'; // cyan-400

        // Simple deterministic pastel mapping
        const nameCode = event.resource.professional_id?.charCodeAt(0) || 0;
        const palettes = [
            { bg: '#fdf2f8', border: '#f472b6' }, // pink (Ana)
            { bg: '#f5f3ff', border: '#a78bfa' }, // violet (Julia)
            { bg: '#fff7ed', border: '#fdba74' }, // orange (Rebeca)
            { bg: '#fefce8', border: '#facc15' }, // yellow (Sol)
            { bg: '#f0fdf4', border: '#4ade80' }, // green
            { bg: '#eff6ff', border: '#60a5fa' }  // blue
        ];

        const palette = palettes[nameCode % palettes.length];

        if (event.resource.professional_id) {
            bgColor = palette.bg;
            borderColor = palette.border;
        }

        return {
            style: {
                backgroundColor: bgColor,
                borderLeft: `4px solid ${borderColor}`,
                borderRadius: '12px',
                color: '#334155', // slate-700
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                padding: '0px',
                overflow: 'hidden'
            }
        };
    };

    const CustomEvent = ({ event }) => {
        // Calculate end time string for display
        const startTime = format(event.start, 'HH:mm');
        const endTime = format(event.end, 'HH:mm');

        return (
            <div className="h-full w-full p-2 flex flex-col justify-center transition-all hover:bg-white/40">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs tracking-tight">{startTime} - {endTime}</span>
                    {/* Tiny initial badge if space permits? */}
                </div>
                <div className="font-medium text-xs truncate leading-tight opacity-90">
                    {event.client}
                </div>
                <div className="text-[10px] uppercase tracking-wider opacity-60 mt-1 truncate">
                    {event.title}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 min-h-screen bg-stone-50 font-sans relative">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] bg-sky-200/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[0%] left-[0%] w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Calendar Container - Glassmorphism */}
            <div className="relative z-10 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 h-[calc(100vh-4rem)] flex flex-col">

                {/* CSS Overrides for visual cleanup */}
                <style jsx global>{`
                    .rbc-calendar { font-family: 'Inter', sans-serif; }
                    .rbc-header { padding: 12px; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; border-bottom: 1px solid rgba(0,0,0,0.05) !important; }
                    .rbc-month-view { border: none !important; }
                    .rbc-month-row { border-top: 1px solid rgba(0,0,0,0.03) !important; min-height: 120px; }
                    .rbc-day-bg { border-left: 1px solid rgba(0,0,0,0.03) !important; }
                    .rbc-off-range-bg { background: rgba(245, 245, 244, 0.4) !important; }
                    .rbc-today { background: rgba(6, 182, 212, 0.03) !important; }
                    .rbc-date-cell { padding: 8px; font-size: 0.85rem; font-weight: 500; color: #57534e; opacity: 0.7; }
                    .rbc-event { padding: 0 !important; transition: transform 0.2s; }
                    .rbc-event:hover { transform: translateY(-2px); z-index: 50; }
                    .rbc-event-label { display: none !important; } /* Hide default label */
                 `}</style>

                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[2rem]">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
                            <span className="text-sm font-medium text-slate-500 animate-pulse">Carregando agenda...</span>
                        </div>
                    </div>
                )}

                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%', fontFamily: 'inherit' }}
                    culture='pt-BR'
                    components={{
                        toolbar: CustomToolbar,
                        event: CustomEvent
                    }}
                    eventPropGetter={eventPropGetter}
                    onSelectEvent={event => {
                        // Could open a nice modal here
                        const message = encodeURIComponent(`Olá ${event.client}, confirmando seu agendamento: ${event.title} dia ${format(event.start, 'dd/MM')} às ${format(event.start, 'HH:mm')}.`);
                        const link = `https://wa.me/55${event.whatsapp?.replace(/\D/g, '')}?text=${message}`;
                        if (confirm(`Abrir WhatsApp para confirmar com ${event.client}?`)) {
                            window.open(link, '_blank');
                        }
                    }}
                />
            </div>
        </div>
    );
}
