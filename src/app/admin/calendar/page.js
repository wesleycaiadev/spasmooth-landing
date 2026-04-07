"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ptBR from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";
import * as proService from "@/services/admin/professionals";
import * as leadsService from "@/services/admin/leads";
import {
    Filter, ChevronLeft, ChevronRight, X, Phone, Copy,
    User, Clock, Scissors, Check
} from "lucide-react";

// ─── Localizer ───────────────────────────────────────────────────────────────
const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
    getDay,
    locales,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getDuration = (text) => {
    if (!text) return 60;
    const lower = text.toLowerCase();
    if (lower.includes("2 horas")) return 120;
    if (lower.includes("1 hora") || lower.includes("60 min")) return 60;
    if (lower.includes("40 min")) return 40;
    if (lower.includes("sessão completa")) return 90;
    return 60;
};

const STATUS_META = {
    novo:        { label: "Novo",        color: "#06b6d4", bg: "#ecfeff" },
    em_contato:  { label: "Em Contato",  color: "#f59e0b", bg: "#fffbeb" },
    confirmado:  { label: "Confirmado",  color: "#10b981", bg: "#f0fdf4" },
    cancelado:   { label: "Cancelado",   color: "#ef4444", bg: "#fff1f2" },
    concluido:   { label: "Concluído",   color: "#6b7280", bg: "#f9fafb" },
};

const PRO_PALETTES = [
    { dot: "#f472b6", bg: "#fdf2f8", border: "#f9a8d4" },
    { dot: "#a78bfa", bg: "#f5f3ff", border: "#c4b5fd" },
    { dot: "#fb923c", bg: "#fff7ed", border: "#fdba74" },
    { dot: "#facc15", bg: "#fefce8", border: "#fde047" },
    { dot: "#4ade80", bg: "#f0fdf4", border: "#86efac" },
    { dot: "#60a5fa", bg: "#eff6ff", border: "#93c5fd" },
];

const getPalette = (professionalId) => {
    if (!professionalId) return PRO_PALETTES[0];
    const code = String(professionalId).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return PRO_PALETTES[code % PRO_PALETTES.length];
};

// ─── Compact Pill (Month view) ────────────────────────────────────────────────
function MonthPill({ event }) {
    const palette = getPalette(event.resource?.professional_id);
    const startTime = format(event.start, "HH:mm");

    return (
        <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold truncate w-full"
            style={{ backgroundColor: palette.bg, color: palette.dot, border: `1px solid ${palette.border}` }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: palette.dot }}
            />
            <span className="shrink-0">{startTime}</span>
            <span className="truncate opacity-80">{event.client?.split(" ")[0]}</span>
        </div>
    );
}

// ─── Detailed Card (Week/Day view) ────────────────────────────────────────────
function DetailedCard({ event }) {
    const palette = getPalette(event.resource?.professional_id);
    const startTime = format(event.start, "HH:mm");
    const endTime = format(event.end, "HH:mm");

    return (
        <div
            className="h-full w-full p-2 flex flex-col gap-0.5"
            style={{ borderLeft: `3px solid ${palette.dot}` }}
        >
            <span className="text-[10px] font-bold opacity-70">{startTime} – {endTime}</span>
            <span className="text-xs font-semibold truncate leading-tight">{event.client}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-60 truncate">{event.title}</span>
        </div>
    );
}

// ─── Custom Toolbar ───────────────────────────────────────────────────────────
function CustomToolbar({ date, view, onNavigate, onView, selectedPro, setSelectedPro, prosList }) {
    const month = date.toLocaleString("pt-BR", { month: "long" });
    const year = date.toLocaleString("pt-BR", { year: "numeric" });

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/80 backdrop-blur rounded-full p-1 border border-slate-200/60 shadow-sm">
                    <button
                        onClick={() => onNavigate("PREV")}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-all"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => onNavigate("TODAY")}
                        className="px-3 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider transition-colors"
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => onNavigate("NEXT")}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-all"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
                <span className="font-serif text-2xl font-bold text-slate-700 capitalize">
                    {month}{" "}
                    <span className="text-slate-400 text-lg font-normal">{year}</span>
                </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                {/* View switcher */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {[
                        { key: Views.MONTH, label: "Mês" },
                        { key: Views.WEEK, label: "Semana" },
                        { key: Views.DAY, label: "Dia" },
                    ].map((v) => (
                        <button
                            key={v.key}
                            onClick={() => onView(v.key)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                view === v.key
                                    ? "bg-white text-cyan-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>

                {/* Pro filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    {prosList.map((p) => {
                        const isSelected = selectedPro === p.id;
                        const palette = p.id === "all" ? null : getPalette(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPro(p.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                                    isSelected
                                        ? "bg-white shadow-md ring-1 ring-cyan-300 border-cyan-400 text-cyan-800"
                                        : "bg-white/60 border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm"
                                }`}
                            >
                                {p.id === "all" ? (
                                    <Filter size={11} />
                                ) : (
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: palette?.dot }}
                                    />
                                )}
                                {p.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────
function EventModal({ event, onClose }) {
    const [copied, setCopied] = useState(false);

    if (!event) return null;

    const resource = event.resource || {};
    const palette = getPalette(resource.professional_id);
    const startTime = format(event.start, "HH:mm");
    const endTime = format(event.end, "HH:mm");
    const dateStr = format(event.start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const statusMeta = STATUS_META[resource.status_kanban] || STATUS_META.novo;

    const waMessage = encodeURIComponent(
        `Olá ${event.client}, confirmando seu agendamento:\n✨ ${event.title}\n📅 ${format(event.start, "dd/MM")} às ${startTime}`
    );
    const waLink = `https://wa.me/55${resource.whatsapp?.replace(/\D/g, "")}?text=${waMessage}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(event.client);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />

            {/* Card */}
            <div
                className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Color header strip */}
                <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: palette.dot }}
                />

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm"
                                style={{ backgroundColor: palette.bg, color: palette.dot, border: `1px solid ${palette.border}` }}
                            >
                                {event.client?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-base leading-tight">{event.client}</h3>
                                <span
                                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full mt-0.5 inline-block"
                                    style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}
                                >
                                    {statusMeta.label}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Scissors size={15} className="text-slate-400 shrink-0" />
                            <span className="font-medium">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Clock size={15} className="text-slate-400 shrink-0" />
                            <span>
                                {startTime} – {endTime}{" "}
                                <span className="text-slate-400 text-xs capitalize">({dateStr})</span>
                            </span>
                        </div>
                        {resource.professional_name && (
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <User size={15} className="text-slate-400 shrink-0" />
                                <span>{resource.professional_name}</span>
                            </div>
                        )}
                        {resource.whatsapp && (
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Phone size={15} className="text-slate-400 shrink-0" />
                                <span>{resource.whatsapp}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        {resource.whatsapp && (
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                                style={{ backgroundColor: "#25d366" }}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.888l6.196-1.624A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.523-5.21-1.432l-.373-.22-3.874 1.016 1.033-3.77-.243-.387A9.97 9.97 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                                Chamar no WhatsApp
                            </a>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                            >
                                {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                                {copied ? "Copiado!" : "Copiar nome"}
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminCalendar() {
    const [events, setEvents] = useState([]);
    const [selectedPro, setSelectedPro] = useState("all");
    const [loading, setLoading] = useState(true);
    const [prosList, setProsList] = useState([]);
    const [currentView, setCurrentView] = useState(Views.MONTH);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await proService.getActiveProfessionals();
                if (data) setProsList([{ id: "all", name: "Todos" }, ...data]);
            } catch (e) {
                console.error("Erro ao buscar profissionais:", e);
            }
        })();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [selectedPro]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await leadsService.getCalendarEvents(selectedPro);
            const mapped = data
                .map((lead) => {
                    if (!lead.appointment_date || !lead.appointment_time) return null;
                    const [y, m, d] = lead.appointment_date.split("-");
                    const [h, min] = lead.appointment_time.split(":");
                    const start = new Date(y, m - 1, d, h, min);
                    const end = new Date(start.getTime() + getDuration(lead.service_name) * 60000);
                    return {
                        id: lead.id,
                        title: lead.service_name || "Serviço",
                        client: lead.nome,
                        start,
                        end,
                        resource: lead,
                    };
                })
                .filter(Boolean);
            setEvents(mapped);
        } catch (e) {
            console.error("Erro ao buscar eventos:", e);
        } finally {
            setLoading(false);
        }
    };

    const eventPropGetter = useCallback(
        (event) => {
            const palette = getPalette(event.resource?.professional_id);
            return {
                style: {
                    backgroundColor:
                        currentView === Views.MONTH ? "transparent" : palette.bg,
                    borderLeft:
                        currentView === Views.MONTH ? "none" : `3px solid ${palette.dot}`,
                    border: currentView === Views.MONTH ? "none" : undefined,
                    borderRadius: "10px",
                    padding: 0,
                    color: "#334155",
                    boxShadow:
                        currentView !== Views.MONTH
                            ? "0 1px 4px rgba(0,0,0,0.06)"
                            : "none",
                },
            };
        },
        [currentView]
    );

    const components = {
        toolbar: (props) => (
            <CustomToolbar
                {...props}
                selectedPro={selectedPro}
                setSelectedPro={setSelectedPro}
                prosList={prosList}
            />
        ),
        event: ({ event }) =>
            currentView === Views.MONTH ? (
                <MonthPill event={event} />
            ) : (
                <DetailedCard event={event} />
            ),
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-stone-50 relative">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] bg-sky-200/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-200/15 rounded-full blur-[100px]" />
            </div>

            {/* Calendar Container */}
            <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/70 rounded-3xl shadow-xl p-4 md:p-8" style={{ minHeight: "80vh" }}>
                {/* RBC CSS overrides */}
                <style>{`
                    .rbc-calendar { font-family: 'Inter', sans-serif; background: transparent; }
                    .rbc-toolbar { display: none !important; }
                    .rbc-header { padding: 10px 6px; font-weight: 700; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; border-bottom: 1px solid #f1f5f9 !important; }
                    .rbc-month-view { border: none !important; background: transparent; }
                    .rbc-month-row { border-top: 1px solid #f1f5f9 !important; min-height: 100px; }
                    .rbc-day-bg { border-left: 1px solid #f1f5f9 !important; }
                    .rbc-off-range-bg { background: rgba(248,250,252,0.6) !important; }
                    .rbc-today { background: rgba(6, 182, 212, 0.04) !important; }
                    .rbc-date-cell { padding: 6px 8px; font-size: 0.78rem; font-weight: 600; color: #64748b; }
                    .rbc-date-cell.rbc-now button { background: #0891b2; color: #fff; border-radius: 9999px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
                    .rbc-event { padding: 1px 2px !important; background: transparent !important; border: none !important; box-shadow: none !important; }
                    .rbc-event:focus { outline: none; }
                    .rbc-event-content { overflow: visible; }
                    .rbc-show-more { font-size: 0.7rem; font-weight: 700; color: #0891b2; padding: 2px 6px; background: #ecfeff; border-radius: 999px; margin-top: 2px; }
                    .rbc-show-more:hover { background: #cffafe; }
                    .rbc-popup { border-radius: 16px !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important; padding: 12px !important; background: white !important; }
                    .rbc-popup-header { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; margin-bottom: 6px; }
                    .rbc-time-view { border: 1px solid #f1f5f9 !important; border-radius: 16px; overflow: hidden; }
                    .rbc-time-header { border-bottom: 1px solid #f1f5f9 !important; }
                    .rbc-time-content { border-top: none !important; }
                    .rbc-timeslot-group { border-bottom: 1px solid #f8fafc !important; }
                    .rbc-time-slot { font-size: 0.65rem; color: #94a3b8; }
                    .rbc-current-time-indicator { background: #0891b2; height: 2px; }
                `}</style>

                {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-cyan-600" />
                            <span className="text-sm font-medium text-slate-500 animate-pulse">Carregando agenda...</span>
                        </div>
                    </div>
                )}

                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ minHeight: "72vh" }}
                    culture="pt-BR"
                    view={currentView}
                    onView={setCurrentView}
                    eventPropGetter={eventPropGetter}
                    components={components}
                    popup
                    messages={{
                        showMore: (total) => `+${total} mais`,
                        noEventsInRange: "Sem agendamentos neste período.",
                        today: "Hoje",
                        previous: "Anterior",
                        next: "Próximo",
                        month: "Mês",
                        week: "Semana",
                        day: "Dia",
                        agenda: "Agenda",
                    }}
                    onSelectEvent={(event) => setSelectedEvent(event)}
                />
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}
        </div>
    );
}
