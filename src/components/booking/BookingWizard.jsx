"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import ProfessionalSelector from "./ProfessionalSelector";
import TimeSlotPicker from "./TimeSlotPicker";
import { Calendar, Clock, Sparkles, CheckCircle, AlertCircle, ChevronLeft, User, Phone, FileText } from "lucide-react";
import { useLocation } from "@/components/LocationProvider";
import {
    getActiveProfessionals,
    getActiveServices,
    getAvailableSlots,
    createBooking,
} from "@/services/booking";

export default function BookingWizard({ initialProfessional = null, hideHeader = false }) {
    const router = useRouter();
    const { location: contextLocation, changeLocation } = useLocation();

    const [step, setStep] = useState(initialProfessional ? 2 : 1);
    const [isPending, startTransition] = useTransition();

    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [prosLoading, setProsLoading] = useState(false);

    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const [booking, setBooking] = useState({
        location: initialProfessional?.location || contextLocation || "Aracaju",
        professional: initialProfessional,
        professional_id: initialProfessional?.id || null,
        service: null,
        service_id: null,
        date: "",
        time: "",
        client_name: "",
        client_phone: "",
        notes: "",
    });

    useEffect(() => {
        if (contextLocation && !initialProfessional) {
            setBooking((prev) => ({ ...prev, location: contextLocation }));
        }
    }, [contextLocation, initialProfessional]);

    useEffect(() => {
        async function loadProfessionals() {
            setProsLoading(true);
            const result = await getActiveProfessionals(booking.location);
            if (result.success && result.data) {
                setProfessionals(result.data);
            } else {
                setProfessionals([]);
            }
            setProsLoading(false);
        }
        loadProfessionals();
    }, [booking.location]);

    useEffect(() => {
        async function loadServices() {
            const result = await getActiveServices();
            if (result.success && result.data) {
                setServices(result.data);
            }
        }
        loadServices();
    }, []);

    useEffect(() => {
        async function loadSlots() {
            if (!booking.date || !booking.professional_id || !booking.service_id) {
                setAvailableSlots([]);
                return;
            }

            setSlotsLoading(true);
            const result = await getAvailableSlots({
                professional_id: booking.professional_id,
                date: booking.date,
                service_id: booking.service_id,
            });

            if (result.success && result.data) {
                setAvailableSlots(result.data);
            } else {
                setAvailableSlots([]);
            }
            setSlotsLoading(false);
        }
        loadSlots();
    }, [booking.date, booking.professional_id, booking.service_id]);

    const handleLocationChange = (loc) => {
        setBooking({
            ...booking,
            location: loc,
            professional_id: null,
            professional: null,
            service: null,
            service_id: null,
            date: "",
            time: "",
        });
        changeLocation(loc);
        setStep(1);
    };

    const handleSelectProfessional = (pro) => {
        setBooking({
            ...booking,
            professional_id: pro.id,
            professional: pro,
            service: null,
            service_id: null,
            date: "",
            time: "",
        });
        setStep(2);
    };

    const handleSelectService = (svc) => {
        setBooking({
            ...booking,
            service: svc,
            service_id: svc.id,
            date: "",
            time: "",
        });
        setStep(3);
    };

    const handleSelectTime = (time) => {
        setBooking((prev) => ({ ...prev, time }));
        setStep(4);
    };

    const handleSubmit = () => {
        if (!booking.client_name.trim() || !booking.client_phone.trim()) {
            setFeedback({ type: "error", message: "Preencha seu nome e WhatsApp." });
            return;
        }

        setFeedback({ type: "", message: "" });

        startTransition(async () => {
            const result = await createBooking({
                unit: booking.location,
                professional_id: booking.professional_id,
                service_id: booking.service_id,
                date: booking.date,
                time: booking.time,
                client_name: booking.client_name.trim(),
                client_phone: booking.client_phone.trim(),
                notes: booking.notes?.trim() ?? "",
            });

            if (result.success) {
                setFeedback({
                    type: "success",
                    message: "Agendamento realizado com sucesso!",
                });
                setTimeout(() => router.push("/obrigado"), 1500);
            } else {
                setFeedback({
                    type: "error",
                    message: result.error || "Erro ao realizar agendamento.",
                });
            }
        });
    };

    const nowBr = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const todayIso = nowBr.toLocaleDateString("en-CA");

    let minDate = todayIso;
    const maxDateObj = new Date(nowBr);
    maxDateObj.setDate(maxDateObj.getDate() + 60);
    let maxDate = maxDateObj.toLocaleDateString("en-CA");

    if (booking.professional) {
        if (booking.professional.location_start_date && booking.professional.location_start_date > todayIso) {
            minDate = booking.professional.location_start_date;
        }
        if (booking.professional.location_end_date) {
            maxDate = booking.professional.location_end_date;
        }
    }

    const massageServices = services.filter((s) => s.category === "massage");
    const waxingServices = services.filter((s) => s.category === "waxing");

    const stepLabels = ["Unidade", "Experiência", "Data & Horário", "Finalização"];
    const totalSteps = 4;
    const currentStepLabel = stepLabels[step - 1] || "";

    return (
        <div
            className={`bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden max-w-4xl w-[95%] md:w-full mx-auto animate-slideUp my-4 ${
                hideHeader
                    ? "shadow-none border-none"
                    : "shadow-2xl shadow-cyan-600/10 border border-slate-200/50"
            }`}
        >
            {!hideHeader && (
                <div className="bg-[#FFFDF9] p-4 md:p-6 flex justify-between items-end border-b border-[#f0e6d2]">
                    <div>
                        <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest block mb-1">
                            PASSO {step} DE {totalSteps}
                        </span>
                        <h2 className="text-xl font-serif text-[#4a4a4a] leading-tight">
                            {currentStepLabel}
                        </h2>
                    </div>
                    <div className="flex gap-1.5 pb-1">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    step >= i ? "w-6 bg-cyan-600" : "w-2 bg-[#e0e0e0]"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className={`p-4 md:p-8 overflow-y-auto custom-scrollbar ${hideHeader ? "max-h-none" : "max-h-[600px]"}`}>
                {/* ========== STEP 1: Unidade + Profissional ========== */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 mx-auto max-w-sm relative z-10 flex-wrap">
                            {["Aracaju", "Maceió", "Recife"].map((loc) => (
                                <button
                                    key={loc}
                                    type="button"
                                    onClick={() => handleLocationChange(loc)}
                                    className={`flex-1 min-w-[30%] py-2 rounded-lg text-sm font-bold transition-all ${
                                        booking.location === loc
                                            ? "bg-white text-cyan-700 shadow-sm"
                                            : "text-slate-500 hover:text-cyan-600"
                                    }`}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>

                        <ProfessionalSelector
                            professionals={professionals}
                            selectedId={booking.professional_id}
                            onSelect={handleSelectProfessional}
                            isLoading={prosLoading}
                        />

                        <div className="text-center text-xs text-slate-400 mt-4">
                            Clique na profissional para continuar
                        </div>
                    </div>
                )}

                {/* ========== STEP 2: Serviço ========== */}
                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={14} /> Menu de Experiências
                            </label>

                            <div className="space-y-6">
                                {massageServices.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-slate-700 mb-3 border-b border-cyan-100 pb-2 text-sm uppercase tracking-wider">
                                            Massagens & Vivências
                                        </h3>
                                        <div className="space-y-3">
                                            {massageServices.map((svc) => (
                                                <ServiceCard
                                                    key={svc.id}
                                                    service={svc}
                                                    isSelected={booking.service_id === svc.id}
                                                    onSelect={() => handleSelectService(svc)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {waxingServices.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-slate-700 mb-3 border-b border-cyan-100 pb-2 text-sm uppercase tracking-wider mt-6">
                                            Depilação na Máquina
                                        </h3>
                                        <div className="space-y-3">
                                            {waxingServices.map((svc) => (
                                                <ServiceCard
                                                    key={svc.id}
                                                    service={svc}
                                                    isSelected={booking.service_id === svc.id}
                                                    onSelect={() => handleSelectService(svc)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-[#f0e6d2]">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-6 py-3 rounded-xl border border-[#e0e0e0] text-[#666] font-bold hover:bg-[#f5f5f5] transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={16} /> Voltar
                            </button>
                        </div>
                    </div>
                )}

                {/* ========== STEP 3: Data & Horário ========== */}
                {step === 3 && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="bg-cyan-50/50 rounded-xl p-4 border border-cyan-100">
                            <p className="text-sm text-cyan-800">
                                <span className="font-bold">{booking.professional?.name}</span>
                                {" · "}
                                <span>{booking.service?.name}</span>
                                {" · "}
                                <span className="font-bold">
                                    {booking.service?.duration_minutes}min — R${" "}
                                    {Number(booking.service?.price).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label
                                    htmlFor="booking-date"
                                    className="block text-xs font-bold text-[#999] uppercase mb-2"
                                >
                                    <Calendar size={14} className="inline mr-1" />
                                    Selecione a Data
                                </label>
                                <input
                                    id="booking-date"
                                    type="date"
                                    aria-label="Data do agendamento"
                                    required
                                    min={minDate}
                                    max={maxDate}
                                    value={booking.date}
                                    onChange={(e) =>
                                        setBooking({ ...booking, date: e.target.value, time: "" })
                                    }
                                    className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a] text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#999] uppercase mb-2">
                                    <Clock size={14} className="inline mr-1" />
                                    Horários Disponíveis
                                </label>
                                <TimeSlotPicker
                                    slots={availableSlots}
                                    selectedDate={booking.date}
                                    selectedTime={booking.time}
                                    onSelect={handleSelectTime}
                                    isLoading={slotsLoading}
                                    duration={booking.service?.duration_minutes ?? 60}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-[#f0e6d2]">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-6 py-3 rounded-xl border border-[#e0e0e0] text-[#666] font-bold hover:bg-[#f5f5f5] transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={16} /> Voltar
                            </button>
                        </div>
                    </div>
                )}

                {/* ========== STEP 4: Dados Pessoais + Confirmação ========== */}
                {step === 4 && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="bg-cyan-50/50 rounded-xl p-4 border border-cyan-100">
                            <p className="text-sm text-cyan-800">
                                <span className="font-bold">{booking.professional?.name}</span>
                                {" · "}
                                <span>{booking.service?.name}</span>
                                {" · "}
                                <span>
                                    {booking.date
                                        ? new Date(booking.date + "T12:00:00").toLocaleDateString("pt-BR")
                                        : ""}
                                </span>
                                {" às "}
                                <span className="font-bold">{booking.time}</span>
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
                                <User size={16} className="text-cyan-700" />
                                Seus Dados para Confirmação
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="client-name" className="sr-only">
                                        Nome Completo
                                    </label>
                                    <div className="relative">
                                        <User
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            id="client-name"
                                            type="text"
                                            aria-label="Seu nome completo"
                                            placeholder="Nome Completo"
                                            required
                                            maxLength={100}
                                            value={booking.client_name}
                                            onChange={(e) =>
                                                setBooking({ ...booking, client_name: e.target.value })
                                            }
                                            className="w-full pl-10 pr-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="client-phone" className="sr-only">
                                        WhatsApp
                                    </label>
                                    <div className="relative">
                                        <Phone
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            id="client-phone"
                                            type="tel"
                                            aria-label="Seu WhatsApp (com DDD)"
                                            placeholder="(DD) 99999-9999"
                                            required
                                            maxLength={20}
                                            value={booking.client_phone}
                                            onChange={(e) =>
                                                setBooking({ ...booking, client_phone: e.target.value })
                                            }
                                            className="w-full pl-10 pr-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label htmlFor="client-notes" className="sr-only">
                                    Observações
                                </label>
                                <div className="relative">
                                    <FileText
                                        size={16}
                                        className="absolute left-3 top-3 text-slate-400"
                                    />
                                    <textarea
                                        id="client-notes"
                                        aria-label="Observações opcionais"
                                        placeholder="Observações (opcional)"
                                        maxLength={500}
                                        rows={3}
                                        value={booking.notes}
                                        onChange={(e) =>
                                            setBooking({ ...booking, notes: e.target.value })
                                        }
                                        className="w-full pl-10 pr-4 py-3 bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl outline-none focus:border-cyan-600 text-[#4a4a4a] text-sm resize-none"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 text-right mt-1">
                                    {booking.notes.length}/500
                                </p>
                            </div>
                        </div>

                        {feedback.message && (
                            <div
                                role="alert"
                                className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium ${
                                    feedback.type === "success"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                            >
                                {feedback.type === "success" ? (
                                    <CheckCircle size={18} />
                                ) : (
                                    <AlertCircle size={18} />
                                )}
                                {feedback.message}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-[#f0e6d2]">
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                disabled={isPending}
                                className="px-6 py-3 rounded-xl border border-[#e0e0e0] text-[#666] font-bold hover:bg-[#f5f5f5] transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} /> Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={
                                    isPending ||
                                    !booking.client_name.trim() ||
                                    !booking.client_phone.trim()
                                }
                                className="flex-1 bg-gradient-to-r from-cyan-700 to-cyan-800 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Confirmando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Confirmar Agendamento
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ServiceCard({ service, isSelected, onSelect }) {
    const priceFormatted = Number(service.price).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full text-left bg-[#fcfbf9] border rounded-xl transition-all duration-300 p-4 ${
                isSelected
                    ? "border-cyan-600 ring-1 ring-cyan-600/30 bg-cyan-50/30"
                    : "border-[#f0e6d2] hover:border-cyan-600/50"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#4a4a4a] text-sm mb-1">{service.name}</h4>
                    <p className="text-xs text-[#888] leading-relaxed line-clamp-2">
                        {service.description}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400">{service.duration_minutes}min</div>
                    <div className="font-bold text-slate-700 text-sm">{priceFormatted}</div>
                </div>
            </div>
            {isSelected && (
                <div className="mt-2 flex items-center gap-1 text-cyan-700 text-xs font-bold">
                    <CheckCircle size={14} /> Selecionado
                </div>
            )}
        </button>
    );
}
