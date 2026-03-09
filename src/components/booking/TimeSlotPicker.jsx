"use client";

import { Clock, AlertCircle } from 'lucide-react';

export default function TimeSlotPicker({ selectedDate, selectedTime, onSelect, bookedIntervals = [], duration = 60, schedule, isLoading }) {

    // Helper: Parse time string (HH:MM:SS or HH:MM) to minutes
    const toMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const startMinutesSchedule = schedule ? toMinutes(schedule.start_time) : 8 * 60; // Default 08:00
    const endMinutesSchedule = schedule ? toMinutes(schedule.end_time) : 20 * 60; // Default 20:00

    // Generate slots based on Schedule
    const generateSlots = () => {
        if (!schedule) return []; // Should calculate after loading
        if (schedule.is_day_off) return [];

        const slots = [];
        const startHour = Math.floor(startMinutesSchedule / 60);
        // Permitimos gerar o bloco até o exato horário final (ex: 20:00)
        // Isso habilita a opção "20:00" na tela.
        const endHour = Math.floor(endMinutesSchedule / 60);

        for (let i = startHour; i <= endHour; i++) {
            const hour = i.toString().padStart(2, '0');
            const timeStr = `${hour}:00`;

            // Double check if this specific slot start is >= start time (simple hourly loop works for X:00 starts)
            // If we had minutes in start_time (e.g. 08:30), we'd need a minutes loop.
            // For now assume hourly slots.
            if (i * 60 >= startMinutesSchedule) {
                slots.push(timeStr);
            }
        }
        return slots;
    };

    const slots = generateSlots();

    // Setup datetime base para checar antecedência (Fuso: América/Sao_Paulo / Brasília)
    const MINIMUM_ADVANCE_MINUTES = 30; // Tempo mínimo de antecedência em minutos

    // Pegar agora no fuso de SP para comparação justa
    const nowSp = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const isToday = selectedDate === nowSp.toLocaleDateString("en-CA"); // "YYYY-MM-DD" no fuso local
    const currentMinutesSp = nowSp.getHours() * 60 + nowSp.getMinutes();

    const isSlotAvailable = (time) => {
        const [h, m] = time.split(':').map(Number);
        const startMinutes = h * 60 + m;
        // Check if THIS slot + duration + buffer overlaps with anything
        // effectively: we need a gap of 'duration + buffer' before the next appt starts.
        const buffer = 0;
        const endMinutes = startMinutes + duration + buffer;

        // Se o horário de início for ESTRITAMENTE maior que o horário de término, bloqueia.
        // Se quisermos que ela POSSA começar às 20:00 e terminar as 21:00,
        // apenas avaliamos se o startMinutes está dentro do horário permitido para começar.
        if (startMinutes > endMinutesSchedule) return false;

        // SE FOR HOJE, checar antecedência mínima (bloquear agendamento "em cima da hora")
        if (isToday) {
            if (startMinutes < (currentMinutesSp + MINIMUM_ADVANCE_MINUTES)) {
                return false;
            }
        }

        // Check collision with ANY booked interval
        const hasCollision = bookedIntervals.some(interval => {
            // Overlap formula: (StartA < EndB) and (EndA > StartB)
            return (startMinutes < interval.end) && (endMinutes > interval.start);
        });

        return !hasCollision;
    };

    if (!selectedDate) {
        return (
            <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Selecione uma data para ver os horários disponíveis.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 animate-pulse">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (schedule && schedule.is_day_off) {
        return (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl text-sm justify-center border border-rose-100">
                <AlertCircle size={18} />
                <span className="font-bold">Profissional não atende neste dia (Folga).</span>
            </div>
        );
    }

    const availableSlots = slots.filter(time => isSlotAvailable(time));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                {slots.map((time) => {
                    const available = isSlotAvailable(time);
                    const isSelected = selectedTime === time;

                    return (
                        <button
                            key={time}
                            type="button"
                            disabled={!available}
                            onClick={() => onSelect(time)}
                            className={`
                                relative py-2 px-1 text-sm font-bold rounded-lg border transition-all duration-200
                                ${!available
                                    ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed decoration-slice line-through'
                                    : isSelected
                                        ? 'bg-cyan-700 text-white border-cyan-700 shadow-md transform scale-105'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-500 hover:text-cyan-700 hover:shadow-sm'
                                }
                            `}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>

            {availableSlots.length === 0 && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                    <AlertCircle size={16} />
                    <span>Nenhum horário disponível para esta duração. Tente outro dia.</span>
                </div>
            )}

            <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded bg-white border border-slate-200"></div> Disponível
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded bg-cyan-600"></div> Selecionado
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded bg-slate-100 border border-slate-100"></div> Ocupado (<span className="font-bold">{duration} min</span>)
                </div>
            </div>
        </div>
    );
}
