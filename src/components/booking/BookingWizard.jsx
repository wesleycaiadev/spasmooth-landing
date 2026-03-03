"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProfessionalSelector from './ProfessionalSelector';
import TimeSlotPicker from './TimeSlotPicker'; // Import the new component
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { useLocation } from '@/components/LocationProvider';

import { TREATMENTS } from '@/lib/data';

const SERVICES = TREATMENTS.map(treatment => ({
    id: treatment.id,
    category: treatment.category,
    name: treatment.name,
    description: treatment.description,
    options: treatment.durations.map(d => ({
        label: d.time,
        price: d.price
    }))
}));

export default function BookingWizard() {
    const router = useRouter();
    const { location: contextLocation, changeLocation, isLoadingLocation } = useLocation();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [bookedIntervals, setBookedIntervals] = useState([]);
    const [currentLockId, setCurrentLockId] = useState(null); // ID of the lock currently held by the user

    const [booking, setBooking] = useState({
        location: 'Aracaju',
        professional: null,
        professional_id: null,
        service: null,
        service_option: null,
        date: '',
        time: '',
        name: '',
        whatsapp: ''
    });

    // Update internal location state when context location changes (usually on first load / geolocation detect)
    useEffect(() => {
        setBooking(prev => ({ ...prev, location: contextLocation || 'Aracaju' }));
    }, [contextLocation]);

    // Validar se há serviço pré-selecionado vindo dos cards
    useEffect(() => {
        const savedService = sessionStorage.getItem('selected_service');
        if (savedService) {
            try {
                const parsed = JSON.parse(savedService);
                // Pre-fill booking with service info, but retain null professional
                // This will make Step 2 automatically "open" that service once reached
                setBooking(prev => ({
                    ...prev,
                    service: parsed.name,
                    service_option: {
                        label: parsed.defaultOption.time,
                        price: parsed.defaultOption.price
                    }
                }));
                // Clear validation
                sessionStorage.removeItem('selected_service');
            } catch (e) {
                console.error('Error parsing saved service', e);
            }
        }
    }, []);

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
                }

                // 4. Fetch Temporary Locks (from other users within the last 5 minutes)
                const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString();
                const { data: locksData, error: locksError } = await supabase
                    .from('booking_locks')
                    .select('id, appointment_time')
                    .eq('appointment_date', booking.date)
                    .eq('professional_id', booking.professional_id)
                    .gte('created_at', fiveMinsAgo);

                if (locksError) {
                    console.error('Error fetching locks:', locksError);
                }

                if (!leadsError) {
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

                    // Add Locks as temporary 60min blocked slots, ignoring our own lock
                    if (locksData) {
                        locksData.forEach(lock => {
                            if (lock.id !== currentLockId) {
                                const [lh, lm] = lock.appointment_time.split(':').map(Number);
                                const lStart = lh * 60 + lm;
                                intervals.push({
                                    start: lStart,
                                    end: lStart + 60 // Assume locks block at least 60 mins contextually
                                });
                            }
                        });
                    }

                    setBookedIntervals(intervals);
                }

            } catch (err) {
                console.error("Error loading data:", err);
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchData();
    }, [booking.date, booking.professional_id, currentLockId]);

    // Cleanup lock when unmounting or changing step to avoid ghost locks
    useEffect(() => {
        return () => {
            if (currentLockId) {
                supabase.from('booking_locks').delete().eq('id', currentLockId).then(() => { });
            }
        };
    }, [currentLockId]);

    const handleSelectTime = async (time) => {
        setBooking(prev => ({ ...prev, time }));

        // Se já tinha um lock antes, deletá-lo pra não segurar slots extras
        if (currentLockId) {
            await supabase.from('booking_locks').delete().eq('id', currentLockId);
            setCurrentLockId(null);
        }

        // Criar o novo lock
        if (time && booking.date && booking.professional_id) {
            const { data, error } = await supabase
                .from('booking_locks')
                .insert([{
                    professional_id: booking.professional_id,
                    appointment_date: booking.date,
                    appointment_time: time
                }])
                .select();

            if (!error && data && data.length > 0) {
                setCurrentLockId(data[0].id);
            }
        }
    };

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

            // Disparar notificação do CallMeBot em background (com acentos e formatação correta)
            fetch('/api/booking/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadId: data || '',
                    name: booking.name,
                    whatsapp: booking.whatsapp,
                    service: fullServiceName,
                    date: booking.date,
                    time: booking.time,
                    professionalName: booking.professional?.name,
                    location: booking.location
                })
            }).catch(e => console.error('Erro ao chamar notificação:', e));

            // Remover o lock após agendamento concluído
            if (currentLockId) {
                await supabase.from('booking_locks').delete().eq('id', currentLockId);
                setCurrentLockId(null);
            }

            router.push('/obrigado');

        } catch (error) {
            console.error(error);
            alert(error.message || "Erro ao realizar agendamento.");
        } finally {
            setLoading(false);
        }
    };

    const todayIso = new Date().toISOString().split('T')[0];
    let minDate = todayIso;
    let maxDate = undefined;
    if (booking.professional) {
        if (booking.professional.location_start_date && booking.professional.location_start_date > todayIso) {
            minDate = booking.professional.location_start_date;
        }
        if (booking.professional.location_end_date) {
            maxDate = booking.professional.location_end_date;
        }
    }

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-cyan-600/10 border border-slate-200/50 overflow-hidden max-w-4xl w-[95%] md:w-full mx-auto animate-slideUp my-4">
            {/* Header Steps */}
            <div className="bg-[#FFFDF9] p-4 md:p-6 flex justify-between items-end border-b border-[#f0e6d2]">
                <div>
                    <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest block mb-1">
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
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 mx-auto max-w-sm relative z-10 flex-wrap">
                            <button
                                onClick={() => {
                                    setBooking({ ...booking, location: 'Aracaju', professional_id: null, professional: null });
                                    changeLocation('Aracaju');
                                }}
                                className={`flex-1 min-w-[30%] py-2 rounded-lg text-sm font-bold transition-all ${booking.location === 'Aracaju' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-cyan-600'}`}
                            >
                                Aracaju
                            </button>
                            <button
                                onClick={() => {
                                    setBooking({ ...booking, location: 'Maceió', professional_id: null, professional: null });
                                    changeLocation('Maceió');
                                }}
                                className={`flex-1 min-w-[30%] py-2 rounded-lg text-sm font-bold transition-all ${booking.location === 'Maceió' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-cyan-600'}`}
                            >
                                Maceió
                            </button>
                            <button
                                onClick={() => {
                                    setBooking({ ...booking, location: 'Recife', professional_id: null, professional: null });
                                    changeLocation('Recife');
                                }}
                                className={`flex-1 min-w-[30%] py-2 rounded-lg text-sm font-bold transition-all ${booking.location === 'Recife' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-cyan-600'}`}
                            >
                                Recife
                            </button>
                        </div>

                        <ProfessionalSelector
                            location={booking.location}
                            selectedId={booking.professional_id}
                            onSelect={(pro) => {
                                setBooking({ ...booking, professional_id: pro.id, professional: pro });
                                setStep(2);
                            }}
                        />
                        <div className="text-center text-xs text-slate-400 mt-4">
                            Clique na profissional para continuar
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={14} /> Menu de Experiências
                            </label>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-3 border-b border-cyan-100 pb-2 text-sm uppercase tracking-wider">Massagens & Vivências</h3>
                                    <div className="space-y-3">
                                        {SERVICES.filter(s => s.category === 'massage').map(service => (
                                            <div key={service.id} className={`bg-[#fcfbf9] border rounded-xl transition-all duration-300 ${booking.service === service.name ? 'border-cyan-600 ring-1 ring-cyan-600/30' : 'border-[#f0e6d2] hover:border-cyan-600/50'}`}>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-[#4a4a4a] text-sm mb-1">{service.name}</h4>
                                                    <p className="text-xs text-[#888] mb-3 leading-relaxed">{service.description}</p>

                                                    <div className="flex flex-wrap gap-2">
                                                        {service.options.map((option, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleServiceSelect(service, option)}
                                                                className={`text-xs px-3 py-2 rounded-lg border transition-all ${booking.service === service.name && booking.service_option?.label === option.label
                                                                    ? 'bg-cyan-700 text-white border-cyan-700 shadow-md'
                                                                    : 'bg-white text-[#666] border-[#e0e0e0] hover:border-cyan-600'
                                                                    }`}
                                                            >
                                                                {option.label} <span className="font-bold ml-1">{option.price}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Render Booking Details INSIDE the card if selected */}
                                                {booking.service === service.name && (
                                                    <div className="animate-slideUp border-t border-[#f0e6d2] bg-white rounded-b-xl p-4 md:p-6">
                                                        <h4 className="text-sm font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
                                                            <Clock size={16} className="text-cyan-700" />
                                                            Escolha Data e Horário
                                                        </h4>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                                            <div>
                                                                <label className="block text-xs font-bold text-[#999] uppercase mb-2">Selecione a Data</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="date"
                                                                        aria-label="Data do agendamento"
                                                                        required
                                                                        min={minDate}
                                                                        max={maxDate}
                                                                        value={booking.date}
                                                                        onChange={(e) => setBooking({ ...booking, date: e.target.value, time: '' })}
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
                                                                    onSelect={handleSelectTime}
                                                                    isLoading={slotsLoading}
                                                                />
                                                            </div>
                                                        </div>

                                                        {booking.time && (
                                                            <div className="animate-slideUp pt-6 border-t border-[#f0e6d2]">
                                                                <h4 className="text-sm font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
                                                                    <Sparkles size={16} className="text-cyan-700" />
                                                                    Seus Dados para Confirmação
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <input
                                                                        type="text"
                                                                        aria-label="Seu nome completo"
                                                                        placeholder="Nome Completo"
                                                                        required
                                                                        value={booking.name}
                                                                        onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                                                                        className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a]"
                                                                    />

                                                                    <input
                                                                        type="tel"
                                                                        aria-label="Seu WhatsApp (com DDD)"
                                                                        placeholder="WhatsApp (com DDD)"
                                                                        required
                                                                        value={booking.whatsapp}
                                                                        onChange={(e) => setBooking({ ...booking, whatsapp: e.target.value })}
                                                                        className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a]"
                                                                    />
                                                                </div>

                                                                <div className="flex gap-3 pt-6 mt-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleSubmit}
                                                                        disabled={loading || !booking.name || !booking.whatsapp}
                                                                        className="w-full bg-gradient-to-r from-cyan-700 to-cyan-800 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                                                    >
                                                                        {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-700 mb-3 border-b border-cyan-100 pb-2 text-sm uppercase tracking-wider mt-6">Depilação na Máquina</h3>
                                    <div className="space-y-3">
                                        {SERVICES.filter(s => s.category === 'waxing').map(service => (
                                            <div key={service.id} className={`bg-[#fcfbf9] border rounded-xl transition-all duration-300 ${booking.service === service.name ? 'border-cyan-600 ring-1 ring-cyan-600/30' : 'border-[#f0e6d2] hover:border-cyan-600/50'}`}>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-[#4a4a4a] text-sm mb-1">{service.name}</h4>
                                                    <p className="text-xs text-[#888] mb-3 leading-relaxed">{service.description}</p>

                                                    <div className="flex flex-wrap gap-2">
                                                        {service.options.map((option, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleServiceSelect(service, option)}
                                                                className={`text-xs px-3 py-2 rounded-lg border transition-all ${booking.service === service.name && booking.service_option?.label === option.label
                                                                    ? 'bg-cyan-700 text-white border-cyan-700 shadow-md'
                                                                    : 'bg-white text-[#666] border-[#e0e0e0] hover:border-cyan-600'
                                                                    }`}
                                                            >
                                                                {option.label} <span className="font-bold ml-1">{option.price}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Render Booking Details INSIDE the card if selected */}
                                                {booking.service === service.name && (
                                                    <div className="animate-slideUp border-t border-[#f0e6d2] bg-white rounded-b-xl p-4 md:p-6">
                                                        <h4 className="text-sm font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
                                                            <Clock size={16} className="text-cyan-700" />
                                                            Escolha Data e Horário
                                                        </h4>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                                            <div>
                                                                <label className="block text-xs font-bold text-[#999] uppercase mb-2">Selecione a Data</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="date"
                                                                        aria-label="Data do agendamento"
                                                                        required
                                                                        min={minDate}
                                                                        max={maxDate}
                                                                        value={booking.date}
                                                                        onChange={(e) => setBooking({ ...booking, date: e.target.value, time: '' })}
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
                                                                    onSelect={handleSelectTime}
                                                                    isLoading={slotsLoading}
                                                                />
                                                            </div>
                                                        </div>

                                                        {booking.time && (
                                                            <div className="animate-slideUp pt-6 border-t border-[#f0e6d2]">
                                                                <h4 className="text-sm font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
                                                                    <Sparkles size={16} className="text-cyan-700" />
                                                                    Seus Dados para Confirmação
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <input
                                                                        type="text"
                                                                        aria-label="Seu nome completo"
                                                                        placeholder="Nome Completo"
                                                                        required
                                                                        value={booking.name}
                                                                        onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                                                                        className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a]"
                                                                    />

                                                                    <input
                                                                        type="tel"
                                                                        aria-label="Seu WhatsApp (com DDD)"
                                                                        placeholder="WhatsApp (com DDD)"
                                                                        required
                                                                        value={booking.whatsapp}
                                                                        onChange={(e) => setBooking({ ...booking, whatsapp: e.target.value })}
                                                                        className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a]"
                                                                    />
                                                                </div>

                                                                <div className="flex gap-3 pt-6 mt-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleSubmit}
                                                                        disabled={loading || !booking.name || !booking.whatsapp}
                                                                        className="w-full bg-gradient-to-r from-cyan-700 to-cyan-800 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                                                    >
                                                                        {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-[#f0e6d2]">
                            <button onClick={handleBack} className="px-6 py-3 rounded-xl border border-[#e0e0e0] text-[#666] font-bold hover:bg-[#f5f5f5] transition-colors">
                                Voltar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
