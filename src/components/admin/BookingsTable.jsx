"use client";

import { useState, useTransition } from "react";
import {
    Search,
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
} from "lucide-react";
import { listBookings, updateBookingStatus } from "@/services/admin/bookings";

const STATUS_MAP = {
    pendente: {
        label: "Pendente",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        dot: "bg-amber-400",
    },
    confirmado: {
        label: "Confirmado",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        dot: "bg-emerald-400",
    },
    cancelado: {
        label: "Cancelado",
        color: "bg-red-100 text-red-800 border-red-200",
        dot: "bg-red-400",
    },
    concluido: {
        label: "Concluído",
        color: "bg-slate-100 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
    },
};

export default function BookingsTable({ initialBookings = [], professionals = [] }) {
    const [bookings, setBookings] = useState(initialBookings);
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const [filters, setFilters] = useState({
        unit: "",
        status: "",
        professional_id: "",
        date_from: "",
        date_to: "",
    });

    const [showFilters, setShowFilters] = useState(false);

    const handleRefresh = () => {
        setFeedback({ type: "", message: "" });

        startTransition(async () => {
            const filterPayload = {};
            if (filters.unit) filterPayload.unit = filters.unit;
            if (filters.status) filterPayload.status = filters.status;
            if (filters.professional_id) filterPayload.professional_id = filters.professional_id;
            if (filters.date_from) filterPayload.date_from = filters.date_from;
            if (filters.date_to) filterPayload.date_to = filters.date_to;

            const result = await listBookings(
                Object.keys(filterPayload).length > 0 ? filterPayload : undefined
            );

            if (result.success && result.data) {
                setBookings(result.data);
            } else {
                setFeedback({
                    type: "error",
                    message: result.error || "Erro ao buscar agendamentos.",
                });
            }
        });
    };

    const handleStatusChange = (bookingId, newStatus) => {
        startTransition(async () => {
            const result = await updateBookingStatus({ id: bookingId, status: newStatus });

            if (result.success) {
                setBookings((prev) =>
                    prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
                );
                setFeedback({
                    type: "success",
                    message: `Status atualizado para "${STATUS_MAP[newStatus]?.label}".`,
                });
            } else {
                setFeedback({
                    type: "error",
                    message: result.error || "Erro ao atualizar status.",
                });
            }

            setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
        });
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return "—";
        return new Date(isoStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            timeZone: "America/Sao_Paulo",
        });
    };

    const formatTime = (isoStr) => {
        if (!isoStr) return "—";
        return new Date(isoStr).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
        });
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
                    <ChevronDown
                        size={14}
                        className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                    />
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
                <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-fadeIn">
                    <div>
                        <label htmlFor="filter-unit" className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Unidade
                        </label>
                        <select
                            id="filter-unit"
                            value={filters.unit}
                            onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700"
                        >
                            <option value="">Todas</option>
                            <option value="Aracaju">Aracaju</option>
                            <option value="Maceió">Maceió</option>
                            <option value="Recife">Recife</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filter-status" className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Status
                        </label>
                        <select
                            id="filter-status"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700"
                        >
                            <option value="">Todos</option>
                            <option value="pendente">Pendente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="cancelado">Cancelado</option>
                            <option value="concluido">Concluído</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filter-pro" className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Profissional
                        </label>
                        <select
                            id="filter-pro"
                            value={filters.professional_id}
                            onChange={(e) =>
                                setFilters({ ...filters, professional_id: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700"
                        >
                            <option value="">Todos</option>
                            {professionals.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filter-date-from" className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            De
                        </label>
                        <input
                            id="filter-date-from"
                            type="date"
                            value={filters.date_from}
                            onChange={(e) =>
                                setFilters({ ...filters, date_from: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                        />
                    </div>

                    <div>
                        <label htmlFor="filter-date-to" className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Até
                        </label>
                        <input
                            id="filter-date-to"
                            type="date"
                            value={filters.date_to}
                            onChange={(e) =>
                                setFilters({ ...filters, date_to: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                        />
                    </div>
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
                    {feedback.type === "success" ? (
                        <CheckCircle size={16} />
                    ) : (
                        <AlertCircle size={16} />
                    )}
                    {feedback.message}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">
                                    Serviço
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">
                                    Profissional
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">
                                    Data / Hora
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400">
                                        <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                        Nenhum agendamento encontrado.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((bk) => {
                                    const statusInfo = STATUS_MAP[bk.status] || STATUS_MAP.pendente;

                                    return (
                                        <tr
                                            key={bk.id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-slate-400 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-800 truncate">
                                                            {bk.client_name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Phone size={10} />
                                                            {bk.client_phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-700 truncate">
                                                        {bk.services?.name ?? "—"}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {bk.services?.duration_minutes}min ·{" "}
                                                        {bk.unit}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {bk.professionals?.name ?? "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-slate-700">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span>{formatDate(bk.starts_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                    <Clock size={12} className="text-slate-400" />
                                                    <span>
                                                        {formatTime(bk.starts_at)} –{" "}
                                                        {formatTime(bk.ends_at)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
                                                    />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {bk.status === "pendente" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        bk.id,
                                                                        "confirmado"
                                                                    )
                                                                }
                                                                disabled={isPending}
                                                                title="Confirmar"
                                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        bk.id,
                                                                        "cancelado"
                                                                    )
                                                                }
                                                                disabled={isPending}
                                                                title="Cancelar"
                                                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {bk.status === "confirmado" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        bk.id,
                                                                        "concluido"
                                                                    )
                                                                }
                                                                disabled={isPending}
                                                                title="Marcar como concluído"
                                                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        bk.id,
                                                                        "cancelado"
                                                                    )
                                                                }
                                                                disabled={isPending}
                                                                title="Cancelar"
                                                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {(bk.status === "cancelado" ||
                                                        bk.status === "concluido") && (
                                                        <span className="text-xs text-slate-400 italic">
                                                            Finalizado
                                                        </span>
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
