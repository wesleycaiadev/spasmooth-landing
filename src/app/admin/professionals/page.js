"use client";

import { useEffect, useState } from 'react';
import * as proService from '@/services/admin/professionals';
import { UserPlus, Trash2, CheckCircle, XCircle, Pencil, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProfessionalsPage() {
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [newPro, setNewPro] = useState({ name: '', specialties: '', photo_url: '', gallery_urls: [], location: 'Aracaju', location_start_date: '', location_end_date: '' });

    const fetchPros = async () => {
        setLoading(true);
        try {
            const data = await proService.getProfessionals();
            setPros(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPros();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!newPro.name) return;

        const specialtiesArray = newPro.specialties.split(',').map(s => s.trim());
        const proData = {
            name: newPro.name,
            specialties: specialtiesArray,
            photo_url: newPro.photo_url || (newPro.gallery_urls?.length ? newPro.gallery_urls[0] : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(newPro.name)),
            gallery_urls: newPro.gallery_urls || [],
            location: newPro.location,
            location_start_date: newPro.location_start_date || null,
            location_end_date: newPro.location_end_date || null
        };

        try {
            if (editingId) {
                await proService.updateProfessional(editingId, proData);
            } else {
                await proService.createProfessional(proData);
            }
            
            setNewPro({ name: '', specialties: '', photo_url: '', gallery_urls: [], location: 'Aracaju', location_start_date: '', location_end_date: '' });
            setIsAdding(false);
            setEditingId(null);
            fetchPros();
        } catch (error) {
            alert('Erro ao salvar profissional');
            console.error(error);
        }
    };

    const handleEdit = (pro) => {
        setNewPro({
            name: pro.name,
            specialties: pro.specialties ? pro.specialties.join(', ') : '',
            photo_url: pro.photo_url,
            gallery_urls: pro.gallery_urls || [],
            location: pro.location || 'Aracaju',
            location_start_date: pro.location_start_date || '',
            location_end_date: pro.location_end_date || ''
        });
        setEditingId(pro.id);
        setIsAdding(true);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { 
                    upsert: true,
                    contentType: file.type || 'image/jpeg'
                });

            if (error) {
                console.error("Supabase Storage Error Details:", error);
                throw error;
            }

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const newUrl = publicUrlData.publicUrl;
            
            const updatedGallery = [...(newPro.gallery_urls || []), newUrl];
            setNewPro({ 
                ...newPro, 
                gallery_urls: updatedGallery,
                photo_url: newPro.photo_url ? newPro.photo_url : newUrl // Set default cover if empty
            });
        } catch (error) {
            console.error('Erro no upload da imagem:', error);
            alert('Falha ao subir imagem. Tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };

    const makeCoverPhoto = (url) => {
        setNewPro({ ...newPro, photo_url: url });
    };

    const removePhoto = (urlToRemove) => {
        const updatedGallery = (newPro.gallery_urls || []).filter(u => u !== urlToRemove);
        const isCover = newPro.photo_url === urlToRemove;
        
        setNewPro({ 
            ...newPro, 
            gallery_urls: updatedGallery,
            photo_url: isCover ? (updatedGallery.length > 0 ? updatedGallery[0] : '') : newPro.photo_url
        });
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await proService.toggleProfessionalActive(id, currentStatus);
            setPros(pros.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
        } catch (error) {
            console.error(error);
        }
    };

    const deletePro = async (id) => {
        if (!confirm('Tem certeza que deseja remover este profissional?')) return;

        try {
            await proService.deleteProfessional(id);
            setPros(pros.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const closeForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setNewPro({ name: '', specialties: '', photo_url: '', gallery_urls: [], location: 'Aracaju', location_start_date: '', location_end_date: '' });
    };

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Equipe Profissional</h1>
                    <p className="text-slate-500 mt-2 font-light">Gerencie os terapeutas e os álbuns de fotos de cada um.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setNewPro({ name: '', specialties: '', photo_url: '', gallery_urls: [], location: 'Aracaju', location_start_date: '', location_end_date: '' });
                        setIsAdding(!isAdding);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <UserPlus size={20} />
                    {isAdding ? 'Fechar Cadastro' : 'Novo Profissional'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl mb-12 animate-slideDown relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/30 rounded-full blur-3xl -z-10"></div>

                    <h3 className="font-bold text-slate-800 text-xl mb-6">
                        {editingId ? 'Editar Profissional' : 'Cadastrar Novo Terapeuta'}
                    </h3>
                    <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
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
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Localidade</label>
                            <select
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-600 font-medium"
                                value={newPro.location}
                                onChange={e => setNewPro({ ...newPro, location: e.target.value })}
                            >
                                <option value="Aracaju">Aracaju</option>
                                <option value="Maceió">Maceió</option>
                                <option value="Recife">Recife</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Período - Início (Opcional)</label>
                            <input
                                type="date"
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-500"
                                value={newPro.location_start_date}
                                onChange={e => setNewPro({ ...newPro, location_start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Período - Fim (Opcional)</label>
                            <input
                                type="date"
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-500"
                                value={newPro.location_end_date}
                                onChange={e => setNewPro({ ...newPro, location_end_date: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-2 mt-4">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Galeria de Fotos (Escolha a Capa)</label>
                            
                            <div className="flex flex-col gap-4">
                                <label className={`relative border-2 border-dashed border-cyan-200 bg-cyan-50/50 rounded-xl px-4 py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-50 hover:border-cyan-400 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <UploadCloud size={32} className="text-cyan-500 mb-2" />
                                    <div className="text-slate-600 font-bold">
                                        {isUploading ? 'Enviando imagem...' : 'Clique aqui para adicionar mais fotos'}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Imagens JPG, PNG ou WebP. Tamanho máximo 5MB.</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                </label>

                                {(newPro.gallery_urls || []).length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 bg-white/50 p-4 rounded-xl border border-slate-100">
                                        {newPro.gallery_urls.map((url, idx) => (
                                            <div key={idx} className={`relative group rounded-xl overflow-hidden shadow-sm border-2 ${newPro.photo_url === url ? 'border-amber-400 shadow-amber-200/50' : 'border-transparent'}`}>
                                                <img 
                                                    src={url} 
                                                    alt={`Upload ${idx}`} 
                                                    className="w-full h-24 object-cover"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    {newPro.photo_url !== url && (
                                                        <button type="button" onClick={() => makeCoverPhoto(url)} className="text-[10px] uppercase font-bold bg-amber-500 text-white px-2 py-1 rounded shadow hover:bg-amber-600">
                                                            Tornar Capa
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => removePhoto(url)} className="text-[10px] uppercase font-bold bg-red-500 text-white px-2 py-1 rounded shadow hover:bg-red-600">
                                                        Remover
                                                    </button>
                                                </div>
                                                {newPro.photo_url === url && (
                                                    <div className="absolute top-1 right-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                                        ⭐ CAPA
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={closeForm} className="text-slate-500 hover:bg-slate-100 px-6 py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                            <button type="submit" className="bg-cyan-600 text-white px-8 py-3 rounded-xl hover:bg-cyan-700 font-bold shadow-lg shadow-cyan-200 transition-all">
                                {editingId ? 'Atualizar Dados' : 'Salvar Cadastro'}
                            </button>
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
                                    src={pro.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.name)}`}
                                    alt={pro.name}
                                    onError={(e) => {
                                        e.target.onerror = null; // prevents looping
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.name)}&background=random`;
                                    }}
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover object-[center_20%] shadow-2xl border-4 border-white relative z-10 transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <h4 className="font-serif font-bold text-slate-800 text-xl mb-3">{pro.name}</h4>

                            <div className="flex flex-col items-center gap-1 mb-4">
                                <span className="bg-cyan-100/50 text-cyan-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {pro.location || 'Aracaju'}
                                </span>
                                {(pro.location_start_date || pro.location_end_date) && (
                                    <span className="text-[10px] text-slate-500 font-medium">
                                        {pro.location_start_date ? new Date(pro.location_start_date + 'T12:00:00').toLocaleDateString('pt-BR') : '...'} até {pro.location_end_date ? new Date(pro.location_end_date + 'T12:00:00').toLocaleDateString('pt-BR') : '...'}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[60px]">
                                {pro.specialties?.map((spec, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100/80 text-slate-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-slate-200/50 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-100 transition-colors cursor-default">
                                        {spec}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 w-full pt-4 border-t border-slate-100/50">
                                <button
                                    onClick={() => handleEdit(pro)}
                                    className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                                    title="Editar"
                                >
                                    <Pencil size={20} />
                                </button>
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
