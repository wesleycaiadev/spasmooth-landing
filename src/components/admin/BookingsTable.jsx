"use client";

import { useState, useTransition } from "react";
import {
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Phone,
    User,
    Calendar,
    AlertCircle,
    ChevronDown,
    RefreshCw,
    CheckCheck,
    Undo2,
} from "lucide-react";
import { listBookings, updateBookingStatus } from "@/services/admin/bookings";

const STATUS_CONFIG = {
    pendente: {
        label: "Pendente",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        dot: "bg-amber-400",
    },
    confirmado: {
        label: "Confirmado",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        dot: "bg-emerald-500",
    },
    cancelado: {
        label: "Cancelado",
        color: "bg-red-100 text-red-700 border-red-200",
        dot: "bg-red-400",
    },
    concluido: {
        label: "Concluído",
        color: "bg-slate-100 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
    },
};

// Mapa de transições de status válidas
const STATUS_TRANSITIONS = {
    pendente: [
        { to: "confirmado", icon: CheckCircle, label: "Confirmar", style: "text-emerald-600 hover:bg-emerald-50 border border-emerald-200" },
        { to: "cancelado",  icon: XCircle,     label: "Cancelar",  style: "text-red-600 hover:bg-red-50 border border-red-200" },
    ],
    confirmado: [
        { to: "concluido", icon: CheckCheck, label: "Concluir",  style: "text-slate-600 hover:bg-slate-100 border border-slate-200" },
        { to: "cancelado", icon: XCircle,    label: "Cancelar",  style: "text-red-600 hover:bg-red-50 border border-red-200" },
    ],
    cancelado: [
        { to: "pendente", icon: Undo2, label: "Reabrir", style: "text-amber-600 hover:bg-amber-50 border border-amber-200" },
    ],
    concluido: [],
};

export default function BookingsTable({ initialBookings = [], professionals = [] }) {
    const [bookings, setBookings] = useState(initialBookings);
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        unit: "", status: "", professional_id: "", date_from: "", date_to: "",
    });

    const handleRefresh = () => {
        setFeedback({ type: "", message: "" });
        startTransition(async () => {
            const payload = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== "")
            );
            const result = await listBookings(Object.keys(payload).length > 0 ? payload : undefined);
            if (result.success && result.data) {
                setBookings(result.data);
            } else {
                setFeedback({ type: "error", message: result.error || "Erro ao buscar agendamentos." });
            }
        });
    };

    const handleStatusChange = (bookingId, newStatus) => {
        startTransition(async () => {
            const result = await updateBookingStatus({ id: bookingId, status: newStatus });
            if (result.success) {
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
                setFeedback({ type: "success", message: `Status atualizado para "${STATUS_CONFIG[newStatus]?.label}".` });
            } else {
                setFeedback({ type: "error", message: result.error || "Erro ao atualizar status." });
            }
            setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
        });
    };

    const fmt = (isoStr, type = "date") => {
        if (!isoStr) return "—";
        const opts = type === "date"
            ? { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "America/Sao_Paulo" }
            : { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" };
        return new Date(isoStr).toLocaleString("pt-BR", opts);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <Filter size={16} />
                    Filtros
                    <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
                    {isPending ? "Carregando..." : "Atualizar"}
                </button>

                <span className="text-xs text-slate-400 ml-auto">
                    {bookings.length} agendamento{bookings.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {[
                        { id: "filter-unit", label: "Unidade", key: "unit", options: [["", "Todas"], ["Aracaju", "Aracaju"], ["Maceió", "Maceió"], ["Recife", "Recife"]] },
                        { id: "filter-status", label: "Status", key: "status", options: [["", "Todos"], ["pendente", "Pendente"], ["confirmado", "Confirmado"], ["cancelado", "Cancelado"], ["concluido", "Concluído"]] },
                    ].map(({ id, label, key, options }) => (
                        <div key={key}>
                            <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase mb-1 block">{label}</label>
                            <select
                                id={id}
                                value={filters[key]}
                                onChange={e => setFilters({ ...filters, [key]: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700"
                            >
                                {options.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
                            </select>
                        </div>
                    ))}

                    <div>
                        <label htmlFor="filter-pro" className="text-xs font-bold text-slate-500 uppercase mb-1 block">Profissional</label>
                        <select
                            id="filter-pro"
                            value={filters.professional_id}
                            onChange={e => setFilters({ ...filters, professional_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700"
                        >
                            <option value="">Todos</option>
                            {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    {[["date_from", "filter-date-from", "De"], ["date_to", "filter-date-to", "Até"]].map(([key, id, label]) => (
                        <div key={key}>
                            <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase mb-1 block">{label}</label>
                            <input
                                id={id}
                                type="date"
                                value={filters[key]}
                                onChange={e => setFilters({ ...filters, [key]: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Feedback */}
            {feedback.message && (
                <div
                    role="alert"
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                        feedback.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    {feedback.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {feedback.message}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {["Cliente", "Serviço", "Profissional", "Data / Hora", "Status", "Ações"].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-slate-400">
                                        <Calendar size={32} className="mx-auto mb-3 opacity-40" />
                                        <p className="font-medium">Nenhum agendamento encontrado.</p>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map(bk => {
                                    const statusInfo = STATUS_CONFIG[bk.status] ?? STATUS_CONFIG.pendente;
                                    const transitions = STATUS_TRANSITIONS[bk.status] ?? [];

                                    return (
                                        <tr key={bk.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Cliente */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                        <User size={14} className="text-slate-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 truncate">{bk.client_name}</p>
                                                        <a
                                                            href={`https://wa.me/${bk.client_phone?.replace(/\D/g, "")}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-slate-400 flex items-center gap-1 hover:text-emerald-600 transition-colors"
                                                        >
                                                            <Phone size={10} />
                                                            {bk.client_phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Serviço */}
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-700 truncate max-w-[160px]">{bk.services?.name ?? "—"}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {bk.services?.duration_minutes}min · {bk.unit}
                                                </p>
                                            </td>

                                            {/* Profissional */}
                                            <td className="px-5 py-4">
                                                <span className="font-medium text-slate-700">{bk.professionals?.name ?? "—"}</span>
                                            </td>

                                            {/* Data/Hora */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <Calendar size={13} className="text-slate-400 shrink-0" />
                                                    <span className="font-medium">{fmt(bk.starts_at, "date")}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                                    <Clock size={11} className="text-slate-400 shrink-0" />
                                                    <span>{fmt(bk.starts_at, "time")} – {fmt(bk.ends_at, "time")}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                                    {statusInfo.label}
                                                </span>
                                            </td>

                                            {/* Ações */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {transitions.length === 0 ? (
                                                        <span className="text-xs text-slate-400 italic">Finalizado</span>
                                                    ) : (
                                                        transitions.map(({ to, icon: Icon, label, style }) => (
                                                            <button
                                                                key={to}
                                                                type="button"
                                                                onClick={() => handleStatusChange(bk.id, to)}
                                                                disabled={isPending}
                                                                title={label}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${style}`}
                                                            >
                                                                <Icon size={13} />
                                                                {label}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
