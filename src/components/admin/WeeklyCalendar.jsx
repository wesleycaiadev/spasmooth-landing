"use client";

import { useState, useTransition, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getWeeklyCalendar } from "@/services/admin/bookings";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

const STATUS_COLORS = {
    pendente: "bg-amber-200 border-amber-300 text-amber-900",
    confirmado: "bg-emerald-200 border-emerald-300 text-emerald-900",
    cancelado: "bg-red-200 border-red-300 text-red-900",
    concluido: "bg-slate-200 border-slate-300 text-slate-700",
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
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (!selectedPro) return;

        startTransition(async () => {
            const result = await getWeeklyCalendar(selectedPro, weekStart);
            if (result.success && result.data) {
                setBookings(result.data);
            } else {
                setBookings([]);
            }
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
            dayLabel: DAY_LABELS[d.getDay()],
            dayNum: d.getDate(),
            month: d.toLocaleDateString("pt-BR", { month: "short" }),
        };
    });

    const getBookingsForSlot = (dateStr, hour) => {
        return bookings.filter((bk) => {
            const startDate = new Date(bk.starts_at);
            const endDate = new Date(bk.ends_at);
            const spStart = new Date(
                startDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
            );
            const bookingDateStr = spStart.toLocaleDateString("en-CA");
            const bookingHour = spStart.getHours();
            return bookingDateStr === dateStr && bookingHour === hour;
        });
    };

    const getBookingSpan = (bk) => {
        const startDate = new Date(bk.starts_at);
        const endDate = new Date(bk.ends_at);
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationHours = durationMs / (60 * 60 * 1000);
        return Math.max(1, Math.ceil(durationHours));
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
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
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
                    <span className="text-sm font-medium text-slate-700 min-w-[160px] text-center">
                        {new Date(weekStart + "T12:00:00").toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                        })}{" "}
                        –{" "}
                        {(() => {
                            const end = new Date(weekStart + "T12:00:00");
                            end.setDate(end.getDate() + 6);
                            return end.toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
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
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {isPending && (
                    <div className="h-1 bg-cyan-100 overflow-hidden">
                        <div className="h-full bg-cyan-500 animate-pulse w-full" />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="w-16 px-2 py-3 text-slate-500 font-bold text-center">
                                    <Clock size={14} className="mx-auto" />
                                </th>
                                {weekDates.map((wd) => (
                                    <th
                                        key={wd.dateStr}
                                        className="px-2 py-3 text-center font-bold text-slate-600"
                                    >
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                                            {wd.dayLabel}
                                        </div>
                                        <div className="text-sm">{wd.dayNum}</div>
                                        <div className="text-[10px] text-slate-400">{wd.month}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map((hour) => (
                                <tr key={hour} className="border-b border-slate-100">
                                    <td className="px-2 py-2 text-center text-slate-400 font-mono text-[11px] bg-slate-50/50">
                                        {String(hour).padStart(2, "0")}:00
                                    </td>
                                    {weekDates.map((wd) => {
                                        const slotBookings = getBookingsForSlot(wd.dateStr, hour);

                                        return (
                                            <td
                                                key={`${wd.dateStr}-${hour}`}
                                                className="px-1 py-1 align-top min-h-[2.5rem] relative"
                                            >
                                                {slotBookings.map((bk) => {
                                                    const colorClass =
                                                        STATUS_COLORS[bk.status] ||
                                                        STATUS_COLORS.pendente;

                                                    return (
                                                        <div
                                                            key={bk.id}
                                                            className={`${colorClass} rounded-md px-1.5 py-1 mb-0.5 border text-[10px] leading-tight truncate cursor-default`}
                                                            title={`${bk.client_name} — ${bk.services?.name ?? "Serviço"} (${bk.status})`}
                                                        >
                                                            <div className="font-bold truncate">
                                                                {bk.client_name?.split(" ")[0]}
                                                            </div>
                                                            <div className="truncate opacity-75">
                                                                {bk.services?.name
                                                                    ?.split(" ")
                                                                    .slice(0, 2)
                                                                    .join(" ") ?? ""}
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
                        <div className={`w-3 h-3 rounded ${colorClass} border`} />
                        <span className="text-slate-500 capitalize">{status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Clock({ size = 16, className = "" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
