"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function ProfessionalsPage() {
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newPro, setNewPro] = useState({ name: '', specialties: '', photo_url: '' });

    const fetchPros = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('professionals')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setPros(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPros();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newPro.name) return;

        const specialtiesArray = newPro.specialties.split(',').map(s => s.trim());

        const { error } = await supabase
            .from('professionals')
            .insert([{
                name: newPro.name,
                specialties: specialtiesArray,
                photo_url: newPro.photo_url || 'https://ui-avatars.com/api/?name=' + newPro.name
            }]);

        if (!error) {
            setNewPro({ name: '', specialties: '', photo_url: '' });
            setIsAdding(false);
            fetchPros();
        } else {
            alert('Erro ao adicionar profissional');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        const { error } = await supabase
            .from('professionals')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (!error) {
            setPros(pros.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
        }
    };

    const deletePro = async (id) => {
        if (!confirm('Tem certeza que deseja remover este profissional?')) return;

        const { error } = await supabase.from('professionals').delete().eq('id', id);
        if (!error) {
            setPros(pros.filter(p => p.id !== id));
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Equipe Profissional</h1>
                    <p className="text-slate-500 mt-2 font-light">Gerencie os terapeutas e suas especialidades.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <UserPlus size={20} />
                    {isAdding ? 'Fechar Cadastro' : 'Novo Profissional'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl mb-12 animate-slideDown relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/30 rounded-full blur-3xl -z-10"></div>

                    <h3 className="font-bold text-slate-800 text-xl mb-6">Cadastrar Novo Terapeuta</h3>
                    <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                            <input
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                placeholder="Ex: Ana Silva"
                                value={newPro.name}
                                onChange={e => setNewPro({ ...newPro, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Especialidades</label>
                            <input
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                placeholder="Ex: Massagem Relaxante, Ventosa..."
                                value={newPro.specialties}
                                onChange={e => setNewPro({ ...newPro, specialties: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Foto (URL)</label>
                            <input
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                placeholder="Cole o link da imagem aqui"
                                value={newPro.photo_url}
                                onChange={e => setNewPro({ ...newPro, photo_url: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 hover:bg-slate-100 px-6 py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                            <button type="submit" className="bg-cyan-600 text-white px-8 py-3 rounded-xl hover:bg-cyan-700 font-bold shadow-lg shadow-cyan-200 transition-all">Salvar Cadastro</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pros.map(pro => (
                    <div key={pro.id} className={`group bg-white/60 backdrop-blur-md rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${pro.active ? 'border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1' : 'border border-slate-100 opacity-60 grayscale'}`}>
                        {/* Status Indicator */}
                        <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${pro.active ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-slate-300'}`}></div>

                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-cyan-200 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-all"></div>
                                <img
                                    src={pro.photo_url}
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover object-top shadow-2xl border-4 border-white relative z-10 transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <h4 className="font-serif font-bold text-slate-800 text-xl mb-3">{pro.name}</h4>

                            <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[60px]">
                                {pro.specialties?.map((spec, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100/80 text-slate-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-slate-200/50 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-100 transition-colors cursor-default">
                                        {spec}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 w-full pt-4 border-t border-slate-100/50">
                                <button
                                    onClick={() => toggleActive(pro.id, pro.active)}
                                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${pro.active ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                >
                                    {pro.active ? 'Desativar' : 'Ativar'}
                                </button>
                                <button
                                    onClick={() => deletePro(pro.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Remover"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {pros.length === 0 && !loading && (
                <div className="text-center py-20 opacity-50">
                    <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-6 blur-lg"></div>
                    <p className="text-slate-400 font-medium">Nenhum profissional encontrado.</p>
                </div>
            )}
        </div>
    );
}
