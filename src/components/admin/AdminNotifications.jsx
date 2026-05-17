"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, X } from 'lucide-react';

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!supabase) return;

        // Request notification permission
        if (typeof window !== 'undefined' && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        const channel = supabase
            .channel('realtime-leads')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'leads' },
                (payload) => {
                    handleNewLead(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleNewLead = (lead) => {
        // Play Sound via Speech Synthesis
        try {
            const text = `Novo agendamento de ${lead.nome || 'Cliente'}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            window.speechSynthesis.speak(utterance);
        } catch {
            // Fallback silencioso se audio falhar
        }

        // Show Toast
        const newNotif = {
            id: Date.now(),
            title: 'Novo Agendamento!',
            message: `${lead.nome} - ${lead.service_name?.split('-')[0] ?? ''}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setNotifications(prev => [newNotif, ...prev]);

        // Auto remove after 8s
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, 8000);
    };

    return (
        <>
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {notifications.map(notif => (
                    <div
                        key={notif.id}
                        className="bg-white/90 backdrop-blur-md border-l-4 border-cyan-500 shadow-xl rounded-lg p-4 w-80 transform transition-all animate-slideIn pointer-events-auto flex gap-3"
                    >
                        <div className="bg-cyan-100 p-2 rounded-full h-fit text-cyan-700">
                            <Bell size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-sm">{notif.title}</h4>
                            <p className="text-sm text-slate-600 leading-tight mt-1">{notif.message}</p>
                            <span className="text-xs text-slate-400 mt-2 block">{notif.time}</span>
                        </div>
                        <button
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                            className="text-slate-400 hover:text-slate-600 h-fit"
                            aria-label="Fechar notificação"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
                <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                }
            `}</style>
            </div>
        </>
    );
}
