"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle } from 'lucide-react';

export default function ProfessionalSelector({ onSelect, selectedId }) {
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadPros() {
            try {
                const { data, error } = await supabase.from('professionals').select('*').eq('active', true);
                if (error) throw error;
                if (data) setPros(data);
            } catch (err) {
                console.error("Erro ao carregar profissionais:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadPros();
    }, []);

    if (loading) return <div className="text-center py-10 text-[#b48e43] animate-pulse">Carregando especialistas...</div>;
    if (error) return <div className="text-center py-10 text-red-400 text-sm">Erro ao carregar: {error}</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {pros.map(pro => (
                <div
                    key={pro.id}
                    onClick={() => onSelect(pro.id)}
                    className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${selectedId === pro.id ? 'border-cyan-500 shadow-lg ring-2 ring-cyan-500/20' : 'border-transparent hover:border-cyan-200'}`}
                >
                    <div className="aspect-square relative">
                        <img src={pro.photo_url} alt={pro.name} className="w-full h-full object-cover object-top" />
                        {selectedId === pro.id && (
                            <div className="absolute inset-0 bg-cyan-500/40 flex items-center justify-center">
                                <CheckCircle className="text-white w-10 h-10 drop-shadow-lg" />
                            </div>
                        )}
                    </div>
                    <div className="p-2 text-center bg-white">
                        <p className="font-bold text-sm text-[#4a4a4a]">{pro.name}</p>
                        <p className="text-[10px] text-[#999] truncate">{pro.specialties?.join(', ')}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
