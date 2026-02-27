"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, check, Sparkles, Wind, Droplets, Flame, Hand, CircleDot, CheckCircle, ChevronLeft, User, Phone, Gem, Wine, Scissors, Feather, Asterisk, Target, Sunset, ShieldCheck, Stars } from 'lucide-react';
import ProfessionalSelector from './ProfessionalSelector';
import TimeSlotPicker from './TimeSlotPicker';
import { useRouter } from 'next/navigation';

const iconMap = {
    Sparkles,
    Wind,
    Droplets,
    Flame,
    Hand,
    CircleDot,
    'check-circle': CheckCircle,
    Gem,
    Wine,
    Scissors,
    Feather,
    Asterisk,
    Target,
    Sunset,
    ShieldCheck,
    Stars
};

export default function ServiceBookingCard({ treatment }) {
    const router = useRouter();
    const [isBooking, setIsBooking] = useState(false);
    const [step, setStep] = useState(1); // 1: Professional, 2: Date/Time, 3: Form
    const [loading, setLoading] = useState(false);

    // Booking State
    const [booking, setBooking] = useState({
        professional_id: null,
        date: '',
        time: '',
        name: '',
        whatsapp: ''
    });

    // Schedule Data
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [dailySchedule, setDailySchedule] = useState(null);
    const [bookedIntervals, setBookedIntervals] = useState([]);

    const Icon = iconMap[treatment.icon] || Sparkles;

    // Helper: Parse duration
    const getDuration = () => {
        // Simple logic for now, taking the first duration or defaulting to 60
        // Adjust based on your specific requirements if services vary significantly
        const text = treatment.durations[0]?.time || '';
        if (text.toLowerCase().includes('2h')) return 120;
        if (text.toLowerCase().includes('40min')) return 40;
        if (text.toLowerCase().includes('completa')) return 90;
        return 60;
    };
    const duration = getDuration();
    const BUFFER_MINUTES = 0;

    // Fetch Slots Effect (similar to BookingWizard)
    useEffect(() => {
        const fetchData = async () => {
            if (!booking.date || !booking.professional_id) return;

            setSlotsLoading(true);
            setDailySchedule(null);

            try {
                const dateObj = new Date(booking.date + 'T12:00:00');
                const dayOfWeek = dateObj.getDay();

                // 1. Schedule Rules
                const { data: scheduleData } = await supabase
                    .from('professional_schedule')
                    .select('start_time, end_time, is_day_off')
                    .eq('professional_id', booking.professional_id)
                    .eq('day_of_week', dayOfWeek)
                    .single();

                const schedule = scheduleData || { start_time: '08:00:00', end_time: '20:00:00', is_day_off: false };
                setDailySchedule(schedule);

                // 2. Booked Slots
                const { data: leadsData } = await supabase
                    .from('leads')
                    .select('appointment_time, service_name')
                    .eq('appointment_date', booking.date)
                    .eq('professional_id', booking.professional_id)
                    .neq('status_kanban', 'cancelado');

                if (leadsData) {
                    const intervals = leadsData.map(lead => {
                        const [h, m] = lead.appointment_time.split(':').map(Number);
                        const startTotal = h * 60 + m;
                        // Estimate duration of existing appt - simpler fallback
                        let existDur = 60;
                        if (lead.service_name.toLowerCase().includes('2h')) existDur = 120;
                        return { start: startTotal, end: startTotal + existDur + BUFFER_MINUTES };
                    });
                    setBookedIntervals(intervals);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchData();
    }, [booking.date, booking.professional_id]);


    const handleBooking = (e) => {
        if (e) e.preventDefault();

        // Save the service details to localStorage to be picked up by BookingWizard
        const serviceData = {
            id: treatment.id,
            name: treatment.name,
            // We pass the first option as default, user can change later if needed
            defaultOption: treatment.durations[0]
        };
        sessionStorage.setItem('selected_service', JSON.stringify(serviceData));

        // Scroll to the booking wizard section
        const wizardSection = document.getElementById('agendar');
        if (wizardSection) {
            wizardSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback if ID not found immediately (e.g. different page)
            window.location.href = '/#agendar';
        }
    };

    const isPremiumBlack = treatment.id === 'premium-black';

    return (
        <div className={`${isPremiumBlack ? 'bg-gradient-to-br from-slate-900 to-black text-white border-2 border-yellow-500/50 shadow-yellow-500/20' : 'glass-card text-slate-700 ' + (treatment.featured ? 'border-2 border-cyan-300' : '')} p-8 rounded-[2rem] shadow-lg flex flex-col h-full relative overflow-hidden group`}>
            {isPremiumBlack && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
            )}

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className={`${isPremiumBlack ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-[#e2f6fc]'} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                        <Icon className={`w-8 h-8 ${isPremiumBlack ? 'text-yellow-400' : 'text-cyan-700'}`} />
                    </div>
                    <div className="text-right">
                        {treatment.durations.map((d, idx) => (
                            <div key={idx}>
                                <div className={`text-sm ${isPremiumBlack ? 'text-slate-300' : 'text-slate-400'}`}>{d.time}</div>
                                <div className={`font-bold ${isPremiumBlack ? 'text-yellow-400 text-lg tracking-wide' : 'text-slate-700'}`}>{d.price}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {isPremiumBlack && (
                    <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 w-max border border-yellow-500/20">
                        <Flame className="w-3 h-3" /> Exclusivo
                    </div>
                )}

                <div className="flex-grow flex flex-col">
                    <h3 className={`text-2xl font-bold mb-3 mt-4 ${isPremiumBlack ? 'text-white' : 'text-slate-700'}`}>{treatment.name}</h3>
                    <p className={`mb-5 text-sm ${isPremiumBlack ? 'text-slate-300' : 'text-slate-500'}`}>{treatment.description}</p>

                    <div className={`${isPremiumBlack ? 'bg-slate-900/60 border-yellow-500/20' : 'bg-white/60 border-white/40'} rounded-2xl p-5 border flex-grow mb-6`}>
                        <p className={`text-sm font-bold mb-2 ${isPremiumBlack ? 'text-yellow-400' : 'text-slate-700'}`}>Etapas</p>
                        <ul className={`list-disc pl-5 text-sm space-y-2 ${isPremiumBlack ? 'text-slate-300' : 'text-slate-600'}`}>
                            {treatment.stages.map((stage, i) => (
                                <li key={i}>{stage}</li>
                            ))}
                        </ul>
                        {treatment.note && <p className={`text-xs mt-4 ${isPremiumBlack ? 'text-yellow-500/70' : 'text-slate-500'}`}>{treatment.note}</p>}
                    </div>
                </div>

                <div className="mt-auto">
                    <button
                        type="button"
                        onClick={handleBooking} // Changed to trigger scroll & save
                        className={`inline-block text-center px-6 py-4 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 w-full ${isPremiumBlack ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 shadow-xl shadow-yellow-500/20' : 'bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg shadow-cyan-200/50'}`}
                    >
                        Agendar Experiência
                    </button>
                </div>
            </div>
        </div>
    );
}
