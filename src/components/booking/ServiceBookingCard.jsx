"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, check, Sparkles, Wind, Droplets, Flame, Hand, CircleDot, CheckCircle, ChevronLeft, User, Phone } from 'lucide-react';
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
    'check-circle': CheckCircle
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
    const BUFFER_MINUTES = 15;

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


    const handleBooking = () => {
        // Save the service details to localStorage to be picked up by BookingWizard
        const serviceData = {
            id: treatment.id,
            name: treatment.name,
            // We pass the first option as default, user can change later if needed
            defaultOption: treatment.durations[0]
        };
        sessionStorage.setItem('selected_service', JSON.stringify(serviceData));

        // Scroll to the booking wizard section
        const wizardSection = document.getElementById('agendamento');
        if (wizardSection) {
            wizardSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback if ID not found immediately (e.g. different page)
            window.location.href = '/#agendamento';
        }
    };

    return (
        <div className={`glass-card p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 flex flex-col h-full ${treatment.featured ? 'border-2 border-cyan-300' : ''}`}>
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="bg-[#e2f6fc] w-16 h-16 rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-cyan-600" />
                </div>
                <div className="text-right">
                    {treatment.durations.map((d, idx) => (
                        <div key={idx}>
                            <div className="text-sm text-slate-400">{d.time}</div>
                            <div className="font-bold text-slate-700">{d.price}</div>
                        </div>
                    ))}
                </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-3">{treatment.name}</h3>
            <p className="text-slate-500 mb-5 text-sm">{treatment.description}</p>

            <div className="bg-white/60 rounded-2xl p-5 border border-white/40">
                <p className="text-sm font-bold text-slate-700 mb-2">Etapas</p>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    {treatment.stages.map((stage, i) => (
                        <li key={i}>{stage}</li>
                    ))}
                </ul>
                {treatment.note && <p className="text-xs text-slate-500 mt-4">{treatment.note}</p>}
            </div>

            <button
                onClick={handleBooking} // Changed to trigger scroll & save
                className="mt-auto inline-block text-center px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-200/50 w-full"
            >
                Agendar
            </button>
        </div>
    );
}
