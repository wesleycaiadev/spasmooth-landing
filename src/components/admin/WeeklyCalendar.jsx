"use client";

import { useState, useTransition, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCalendarEvents } from "@/services/admin/leads";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

const STATUS_COLORS = {
    novo: "bg-cyan-100 border-l-4 border-cyan-500 text-cyan-900",
    em_contato: "bg-amber-100 border-l-4 border-amber-500 text-amber-900",
    confirmado: "bg-emerald-100 border-l-4 border-emerald-500 text-emerald-900",
    cancelado: "bg-red-100 border-l-4 border-red-400 text-red-800",
    concluido: "bg-slate-100 border-l-4 border-slate-400 text-slate-700",
};

function getMonday(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toLocaleDateString("en-CA");
}

export default function WeeklyCalendar({ professionals = [] }) {
    const [isPending, startTransition] = useTransition();
    const [selectedPro, setSelectedPro] = useState(professionals[0]?.id ?? "");
    const [weekStart, setWeekStart] = useState(() => {
        const now = new Date(
            new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
        );
        return getMonday(now.toLocaleDateString("en-CA"));
    });
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!selectedPro) return;

        startTransition(async () => {
            const data = await getCalendarEvents(selectedPro);
            setEvents(data ?? []);
        });
    }, [selectedPro, weekStart]);

    const navigateWeek = (delta) => {
        const d = new Date(weekStart + "T12:00:00");
        d.setDate(d.getDate() + delta * 7);
        setWeekStart(d.toLocaleDateString("en-CA"));
    };

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart + "T12:00:00");
        d.setDate(d.getDate() + i);
        return {
            dateStr: d.toLocaleDateString("en-CA"),
            dayLabel: DAY_LABELS[i],
            dayNum: d.getDate(),
            month: d.toLocaleDateString("pt-BR", { month: "short" }),
            isToday: d.toLocaleDateString("en-CA") === new Date().toLocaleDateString("en-CA"),
        };
    });

    const getEventsForSlot = (dateStr, hour) => {
        return events.filter((ev) => {
            if (!ev.appointment_date || !ev.appointment_time) return false;
            if (ev.appointment_date !== dateStr) return false;
            const [h] = ev.appointment_time.split(":").map(Number);
            return h === hour;
        });
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div>
                    <label htmlFor="cal-pro" className="sr-only">Profissional</label>
                    <select
                        id="cal-pro"
                        value={selectedPro}
                        onChange={(e) => setSelectedPro(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 font-medium"
                    >
                        {professionals.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <button
                        type="button"
                        onClick={() => navigateWeek(-1)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                        aria-label="Semana anterior"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-slate-700 min-w-[200px] text-center">
                        {new Date(weekStart + "T12:00:00").toLocaleDateString("pt-BR", {
                            day: "2-digit", month: "short",
                        })}{" "}–{" "}
                        {(() => {
                            const end = new Date(weekStart + "T12:00:00");
                            end.setDate(end.getDate() + 6);
                            return end.toLocaleDateString("pt-BR", {
                                day: "2-digit", month: "short", year: "numeric",
                            });
                        })()}
                    </span>
                    <button
                        type="button"
                        onClick={() => navigateWeek(1)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                        aria-label="Próxima semana"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {isPending && (
                    <div className="h-1 bg-cyan-100 overflow-hidden">
                        <div className="h-full bg-cyan-500 animate-pulse w-full" />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="w-16 px-2 py-3 text-slate-400 font-bold text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </th>
                                {weekDates.map((wd) => (
                                    <th key={wd.dateStr} className={`px-2 py-3 text-center font-bold ${wd.isToday ? "text-cyan-700" : "text-slate-600"}`}>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400">{wd.dayLabel}</div>
                                        <div className={`text-sm ${wd.isToday ? "bg-cyan-600 text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto" : ""}`}>
                                            {wd.dayNum}
                                        </div>
                                        <div className="text-[10px] text-slate-400">{wd.month}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map((hour) => (
                                <tr key={hour} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                    <td className="px-2 py-3 text-center text-slate-400 font-mono text-[11px] bg-slate-50/50 border-r border-slate-100">
                                        {String(hour).padStart(2, "0")}:00
                                    </td>
                                    {weekDates.map((wd) => {
                                        const slotEvents = getEventsForSlot(wd.dateStr, hour);

                                        return (
                                            <td key={`${wd.dateStr}-${hour}`} className="px-1 py-1 align-top min-h-[3rem] border-r border-slate-50 last:border-r-0">
                                                {slotEvents.map((ev) => {
                                                    const colorClass = STATUS_COLORS[ev.status_kanban] ?? STATUS_COLORS.novo;
                                                    const [h, m] = (ev.appointment_time || "00:00").split(":");
                                                    const startStr = `${h}:${m}`;

                                                    return (
                                                        <div
                                                            key={ev.id}
                                                            className={`${colorClass} rounded-lg px-2 py-1.5 mb-1 text-[10px] leading-tight cursor-default shadow-sm hover:shadow-md transition-shadow`}
                                                            title={`${ev.nome} — ${ev.service_name ?? "Serviço"} (${ev.status_kanban})`}
                                                        >
                                                            <div className="font-bold truncate">{startStr} · {ev.nome?.split(" ")[0]}</div>
                                                            <div className="truncate opacity-70 uppercase tracking-wider mt-0.5">
                                                                {ev.service_name?.split(" ").slice(0, 2).join(" ") ?? ""}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-xs">
                {Object.entries(STATUS_COLORS).map(([status, colorClass]) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded ${colorClass}`} />
                        <span className="text-slate-500 capitalize">{status.replace("_", " ")}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
