"use client";

import { Clock, AlertCircle } from "lucide-react";

export default function TimeSlotPicker({
    slots = [],
    selectedDate,
    selectedTime,
    onSelect,
    isLoading = false,
    duration = 60,
}) {
    if (!selectedDate) {
        return (
            <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                    Selecione uma data para ver os horários disponíveis.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 animate-pulse">
                {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-lg" />
                ))}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-xl text-sm justify-center border border-amber-100">
                <AlertCircle size={18} />
                <span className="font-bold">
                    Nenhum horário disponível neste dia. Tente outra data.
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                {slots.map((time) => {
                    const isSelected = selectedTime === time;

                    return (
                        <button
                            key={time}
                            type="button"
                            onClick={() => onSelect(time)}
                            className={`
                                relative py-2 px-1 text-sm font-bold rounded-lg border transition-all duration-200
                                ${
                                    isSelected
                                        ? "bg-cyan-700 text-white border-cyan-700 shadow-md transform scale-105"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-cyan-500 hover:text-cyan-700 hover:shadow-sm"
                                }
                            `}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded bg-white border border-slate-200" /> Disponível
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded bg-cyan-600" /> Selecionado
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    <span className="font-bold">{duration} min</span>
                </div>
            </div>
        </div>
    );
}
