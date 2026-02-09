"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProfessionalSelector from './ProfessionalSelector';
import TimeSlotPicker from './TimeSlotPicker'; // Import the new component
import { Calendar, Clock, Sparkles } from 'lucide-react';

const SERVICES = [
    {
        id: 'tantrica',
        name: 'Terapia Tântrica',
        description: 'Massagem relaxante/meditação, sensitive e orgástica. Promove autoconhecimento e sensações únicas.',
        options: [
            { label: '1 Hora', price: 'R$ 350,00' },
            { label: '2 Horas', price: 'R$ 450,00' }
        ]
    },
    {
        id: 'relaxante_especial',
        name: 'Massagem Relaxante Especial',
        description: 'Dividida em duas etapas: Massagem relaxante e Massagem orgástica.',
        options: [
            { label: '1 Hora', price: 'R$ 200,00' }
        ]
    },
    {
        id: 'nuru',
        name: 'Massagem Nuru',
        description: 'Relaxante, sensitive, corpo a corpo e orgástica. Terapeuta realiza a sessão despida.',
        options: [
            { label: '1 Hora', price: 'R$ 400,00' }
        ]
    },
    {
        id: 'delirium',
        name: 'Vivência Delirium',
        description: 'Massagem sensual com troca de massagem (5 etapas). Terapeuta inicia de lingerie e fica despida.',
        options: [
            { label: '1 Hora', price: 'R$ 500,00' }
        ]
    },
    {
        id: 'tailandesa',
        name: 'Tailandesa',
        description: 'Relaxante + Sensitive + deslizamento dos seios pelo corpo. Terapeuta de lingerie na parte de baixo.',
        options: [
            { label: 'Sessão Completa', price: 'R$ 300,00' }
        ]
    },
    {
        id: 'ventosa',
        name: 'Ventosa com Relaxante',
        description: 'Terapia com ventosas para alívio de tensão + massagem.',
        options: [
            { label: '40 min', price: 'R$ 150,00' },
            { label: '60 min (com finalização)', price: 'R$ 250,00' }
        ]
    }
];

export default function BookingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [bookedIntervals, setBookedIntervals] = useState([]); // Changed from bookedSlots

    const [booking, setBooking] = useState({
        professional_id: null,
        service: null, // Entire object or string
        service_option: null, // { label, price }
        date: '',
        time: '',
        name: '',
        whatsapp: ''
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleServiceSelect = (service, option) => {
        setBooking({
            ...booking,
            service: service.name,
            service_option: option
        });
    };

    // Helper to get minutes from label or service string
    const getDurationFromText = (text) => {
        if (!text) return 60;
        const lower = text.toLowerCase();
        if (lower.includes('2 horas')) return 120;
        if (lower.includes('1 hora') || lower.includes('60 min')) return 60;
        if (lower.includes('40 min')) return 40;
        if (lower.includes('sessão completa')) return 90; // Default for Thai
        return 60; // Fallback
    };

    // Get current selected duration
    const currentDuration = booking.service_option ? getDurationFromText(booking.service_option.label) : 60;
    const BUFFER_MINUTES = 15; // Hygiene interval

    // Schedule State
    const [dailySchedule, setDailySchedule] = useState(null); // { start: '08:00', end: '20:00', is_off: false }

    // Fetch booked slots AND schedule when date or professional changes
    useEffect(() => {
        const fetchData = async () => {
            if (!booking.date || !booking.professional_id) return;

            setSlotsLoading(true);
            setDailySchedule(null); // Reset schedule while loading

            try {
                // 1. Determine Day of Week (0-6)
                // Note: new Date('2024-02-08') might be UTC. Ensure we get correct local day or consistent day.
                // Adding 'T12:00:00' helps avoid timezone shifts for simple date strings
                const dateObj = new Date(booking.date + 'T12:00:00');
                const dayOfWeek = dateObj.getDay(); // 0 = Sunday

                // 2. Fetch Schedule Rules
                const { data: scheduleData, error: scheduleError } = await supabase
                    .from('professional_schedule')
                    .select('start_time, end_time, is_day_off')
                    .eq('professional_id', booking.professional_id)
                    .eq('day_of_week', dayOfWeek)
                    .single();

                if (scheduleError && scheduleError.code !== 'PGRST116') { // Ignore 'row not found' if checking/defaulting
                    console.error('Error fetching schedule:', scheduleError);
                }

                // Default if no rule found: 08:00 - 20:00
                const schedule = scheduleData || { start_time: '08:00:00', end_time: '20:00:00', is_day_off: false };
                setDailySchedule(schedule);

                // 3. Fetch Booked Slots
                const { data: leadsData, error: leadsError } = await supabase
                    .from('leads')
                    .select('appointment_time, service_name')
                    .eq('appointment_date', booking.date)
                    .eq('professional_id', booking.professional_id)
                    .neq('status_kanban', 'cancelado');

                if (leadsError) {
                    console.error('Error fetching slots:', leadsError);
                } else {
                    // Calculate intervals with BUFFER
                    const intervals = leadsData.map(lead => {
                        const [hours, minutes] = lead.appointment_time.split(':').map(Number);
                        const startTotal = hours * 60 + minutes;
                        const duration = getDurationFromText(lead.service_name);
                        return {
                            start: startTotal,
                            end: startTotal + duration + BUFFER_MINUTES
                        };
                    });
                    setBookedIntervals(intervals);
                }

            } catch (err) {
                console.error("Error loading data:", err);
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchData();
    }, [booking.date, booking.professional_id]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const fullServiceName = `${booking.service} - ${booking.service_option.label} (${booking.service_option.price})`;
        const [h, m] = booking.time.split(':').map(Number);
        const newStart = h * 60 + m;
        const newEnd = newStart + currentDuration + BUFFER_MINUTES;

        try {
            // ROBUST SECURITY CHECK
            // Fetch all active appointments for the day to check for overlaps
            const { data: existingBookings, error: fetchError } = await supabase
                .from('leads')
                .select('appointment_time, service_name')
                .eq('appointment_date', booking.date)
                .eq('professional_id', booking.professional_id)
                .neq('status_kanban', 'cancelado');

            if (fetchError) throw fetchError;

            // Check for overlaps locally
            const hasConflict = existingBookings.some(lead => {
                const [eh, em] = lead.appointment_time.split(':').map(Number);
                const existingStart = eh * 60 + em;
                const existingDuration = getDurationFromText(lead.service_name);
                const existingEnd = existingStart + existingDuration + BUFFER_MINUTES;

                // Overlap logic: (StartA < EndB) and (EndA > StartB)
                return (newStart < existingEnd) && (newEnd > existingStart);
            });

            if (hasConflict) {
                throw new Error("Ops! Este horário já foi reservado ou está muito próximo de outro atendimento. Por favor, atualize a página e escolha outro horário.");
            }

            const { data, error } = await supabase.rpc('create_lead', {
                p_nome: booking.name,
                p_whatsapp: booking.whatsapp,
                p_email: null,
                p_professional_id: booking.professional_id,
                p_date: booking.date,
                p_time: booking.time,
                p_service: fullServiceName
            });

            if (error) throw error;

            if (data) localStorage.setItem('current_lead_id', data);
            router.push('/obrigado');

        } catch (error) {
            console.error(error);
            alert(error.message || "Erro ao realizar agendamento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-cyan-600/10 border border-slate-200/50 overflow-hidden max-w-4xl w-[95%] md:w-full mx-auto animate-slideUp my-4">
            {/* Header Steps */}
            <div className="bg-[#FFFDF9] p-4 md:p-6 flex justify-between items-end border-b border-[#f0e6d2]">
                <div>
                    <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest block mb-1">
                        PASSO {step} DE 3
                    </span>
                    <h2 className="text-xl font-serif text-[#4a4a4a] leading-tight">
                        {step === 1 ? 'Solicite seu horário' : step === 2 ? 'Experiência' : 'Finalização'}
                    </h2>
                </div>
                <div className="flex gap-1.5 pb-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-6 bg-cyan-600' : 'w-2 bg-[#e0e0e0]'}`} />
                    ))}
                </div>
            </div>

            <div className="p-4 md:p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <ProfessionalSelector
                            selectedId={booking.professional_id}
                            onSelect={(id) => setBooking({ ...booking, professional_id: id })}
                        />
                        <button
                            onClick={handleNext}
                            disabled={!booking.professional_id}
                            className="w-full bg-[#1a1a1a] text-cyan-400 font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors shadow-lg uppercase tracking-wide text-sm"
                        >
                            Escolher Profissional
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-cyan-600 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={14} /> Menu de Experiências
                            </label>

                            <div className="space-y-3">
                                {SERVICES.map(service => (
                                    <div key={service.id} className="bg-[#fcfbf9] border border-[#f0e6d2] rounded-xl p-4 hover:border-cyan-600/50 transition-colors">
                                        <h4 className="font-bold text-[#4a4a4a] text-sm mb-1">{service.name}</h4>
                                        <p className="text-xs text-[#888] mb-3 leading-relaxed">{service.description}</p>

                                        <div className="flex flex-wrap gap-2">
                                            {service.options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleServiceSelect(service, option)}
                                                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${booking.service === service.name && booking.service_option?.label === option.label
                                                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                                                        : 'bg-white text-[#666] border-[#e0e0e0] hover:border-cyan-600'
                                                        }`}
                                                >
                                                    {option.label} <span className="font-bold ml-1">{option.price}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#f0e6d2]">
                            <div>
                                <label className="block text-xs font-bold text-[#999] uppercase mb-2">Selecione a Data</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={booking.date}
                                        onChange={(e) => setBooking({ ...booking, date: e.target.value, time: '' })} // Reset time on date change
                                        className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a] text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#999] uppercase mb-2">Horários Disponíveis</label>
                                <TimeSlotPicker
                                    selectedDate={booking.date}
                                    bookedIntervals={bookedIntervals}
                                    duration={currentDuration}
                                    schedule={dailySchedule}
                                    selectedTime={booking.time}
                                    onSelect={(time) => setBooking({ ...booking, time })}
                                    isLoading={slotsLoading}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button onClick={handleBack} className="px-6 py-3 rounded-xl border border-[#e0e0e0] text-[#666] font-bold hover:bg-[#f5f5f5] transition-colors">
                                Voltar
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!booking.service || !booking.date || !booking.time}
                                className="flex-1 bg-cyan-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-cyan-700 transition-colors shadow-lg"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">

                        <div className="bg-[#fcfbf9] p-4 rounded-xl border border-[#f0e6d2] flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-full bg-cyan-600/10 flex items-center justify-center shrink-0">
                                <Sparkles className="text-cyan-600 w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#4a4a4a] text-sm">Resumo do Pedido</h4>
                                <p className="text-xs text-[#666] mt-1">
                                    <span className="font-bold">{booking.service}</span> • {booking.service_option?.label}
                                </p>
                                <p className="text-xs text-[#666]">
                                    {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {booking.time}
                                </p>
                                <p className="text-sm font-bold text-cyan-600 mt-2">{booking.service_option?.price}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nome Completo"
                                required
                                value={booking.name}
                                onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                                className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a]"
                            />

                            <input
                                type="tel"
                                placeholder="WhatsApp (com DDD)"
                                required
                                value={booking.whatsapp}
                                onChange={(e) => setBooking({ ...booking, whatsapp: e.target.value })}
                                className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a]"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={handleBack} className="px-6 py-3 rounded-xl border border-[#e0e0e0] text-[#666] font-bold hover:bg-[#f5f5f5] transition-colors">
                                Voltar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                {loading ? 'Confirmando...' : 'Finalizar Agendamento'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
