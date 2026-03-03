"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { CheckCircle } from 'lucide-react';

export default function ProfessionalSelector({ onSelect, selectedId, location }) {
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadPros() {
            setLoading(true);
            try {
                const query = supabase.from('professionals').select('*').eq('active', true);
                if (location) {
                    query.eq('location', location);
                }
                const { data, error } = await query;
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
    }, [location]);

    if (loading) return <div className="text-center py-10 text-[#b48e43] animate-pulse">Carregando especialistas...</div>;
    if (error) return <div className="text-center py-10 text-red-400 text-sm">Erro ao carregar: {error}</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {pros.map(pro => (
                <div
                    key={pro.id}
                    onClick={() => onSelect(pro)}
                    className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${selectedId === pro.id ? 'border-cyan-500 shadow-lg ring-2 ring-cyan-500/20' : 'border-transparent hover:border-cyan-200'}`}
                >
                    <div className="aspect-square relative flex items-center justify-center bg-slate-100">
                        {pro.photo_url ? (
                            <Image
                                src={pro.photo_url}
                                alt={pro.name}
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="object-cover object-top"
                            />
                        ) : (
                            <span className="text-slate-300 text-xs">Sem foto</span>
                        )}
                        {selectedId === pro.id && (
                            <div className="absolute inset-0 bg-cyan-500/40 flex items-center justify-center">
                                <CheckCircle className="text-white w-10 h-10 drop-shadow-lg" />
                            </div>
                        )}
                    </div>
                    <div className="p-2 text-center bg-white">
                        <p className="font-bold text-sm text-[#4a4a4a]">{pro.name}</p>
                        <p className="text-[10px] text-[#999] truncate">{pro.specialties?.join(', ')}</p>
                        {(pro.location_start_date || pro.location_end_date) && (
                            <p className="text-[9px] text-cyan-600 font-medium mt-1 bg-cyan-50 rounded-full inline-block px-2 py-0.5 border border-cyan-100/50">
                                {pro.location_start_date ? new Date(pro.location_start_date + 'T12:00:00').toLocaleDateString('pt-BR').slice(0, 5) : '...'} - {pro.location_end_date ? new Date(pro.location_end_date + 'T12:00:00').toLocaleDateString('pt-BR').slice(0, 5) : '...'}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
