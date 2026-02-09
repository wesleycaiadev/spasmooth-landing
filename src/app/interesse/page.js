"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowRight } from 'lucide-react';

export default function InterestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [interest, setInterest] = useState('');
    const [leadId, setLeadId] = useState(null);

    useEffect(() => {
        // Retrieve Lead ID stored in Step 1
        const storedId = localStorage.getItem('current_lead_id');
        if (!storedId) {
            router.push('/'); // Redirect to start if no ID found
        } else {
            setLeadId(storedId);
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!leadId) return;

        setLoading(true);

        try {
            const { error } = await supabase
                .rpc('update_lead_interest', {
                    p_id: leadId,
                    p_interest: interest
                });

            if (error) throw error;

            router.push('/obrigado');

        } catch (error) {
            console.error('Erro ao atualizar interesse:', error);
            alert('Erro ao salvar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
            <div className="max-w-xl w-full text-center mb-10 animate-slideUp">
                <span className="text-[#b48e43] font-semibold tracking-wider text-sm uppercase mb-2 block">Passo 2 de 2</span>
                <h1 className="text-3xl md:text-4xl font-serif text-[#4a4a4a] mb-4">
                    Quais são seus principais objetivos?
                </h1>
                <p className="text-[#7a7a7a]">
                    Queremos preparar uma experiência personalizada para você. Conte-nos um pouco sobre o que busca no SpaSmooth.
                </p>
            </div>

            <div className="max-w-xl w-full bg-white p-8 rounded-2xl border border-[#e6dcc5] shadow-xl shadow-[#cfc2a9]/10 animate-slideUp animation-delay-200">
                <form onSubmit={handleSubmit}>
                    <textarea
                        required
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        className="w-full h-40 px-5 py-4 rounded-xl bg-[#f9f9f9] border border-[#e0e0e0] focus:border-[#b48e43] focus:ring-1 focus:ring-[#b48e43] outline-none transition-all text-[#4a4a4a] placeholder:text-[#ccc] resize-none text-lg"
                        placeholder="Ex: Gostaria de aliviar a tensão nas costas e conhecer tratamentos para rejuvenescimento facial..."
                    ></textarea>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-[#b48e43] hover:bg-[#9a7834] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#b48e43]/20 transition-all transform hover:-translate-y-1 flex justify-center items-center gap-2"
                    >
                        {loading ? 'Finalizando...' : 'Finalizar Cadastro'} <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/obrigado')}
                        className="w-full mt-4 text-[#999] text-sm hover:text-[#b48e43] transition-colors"
                    >
                        Pular esta etapa
                    </button>
                </form>
            </div>
        </div>
    );
}
