"use client";

import { useEffect, useState, useCallback } from 'react';
import * as proService from '@/services/admin/professionals';
import { PROFESSIONALS as oldProsFallback } from '@/lib/data';
import { UserPlus, Trash2, Pencil, Upload, X, ImagePlus, GripVertical, Camera } from 'lucide-react';

const MAX_PHOTOS = 5;

export default function ProfessionalsPage() {
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newPro, setNewPro] = useState({
        name: '', specialties: '', location: 'Aracaju',
        location_start_date: '', location_end_date: '',
        gallery_urls: [],
    });

    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const fetchPros = async () => {
        setLoading(true);
        try {
            const result = await proService.getProfessionals();
            if (result.success && result.data) {
                const mappedPros = result.data.map(p => {
                    const fallbackData = oldProsFallback.find(old => old.name.trim().toLowerCase() === p.name.trim().toLowerCase());
                    const normalizeUrl = (url) => {
                        if (!url) return url;
                        if (typeof url === 'string' && url.includes('day (')) {
                            return url.replace(/\s*\((\d+)\)/g, '-$1');
                        }
                        return url;
                    };
                    const dbGallery = (p.gallery_urls || []).map(normalizeUrl).filter(url => url && !url.includes('ui-avatars.com') && !url.includes('/assets/pros/'));
                    let photoUrl = dbGallery[0] || fallbackData?.avatar || normalizeUrl(p.photo_url) || null;
                    if (photoUrl && (photoUrl.includes('/assets/pros/') || photoUrl.includes('ui-avatars.com'))) photoUrl = null;
                    if (!photoUrl && fallbackData?.avatar) {
                        photoUrl = fallbackData.avatar;
                    }
                    return {
                        ...p,
                        photo_url: photoUrl,
                        gallery_urls: dbGallery.length > 0 ? dbGallery : (fallbackData?.gallery || [])
                    };
                });
                setPros(mappedPros);
            } else {
                setPros([]);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPros();
    }, []);

    // ─── Upload de Arquivo ────────────────────────────────────
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Falha no upload');
        return data.url;
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1080;
                    const MAX_HEIGHT = 1080;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('Falha ao comprimir imagem.'));
                            return;
                        }
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', 0.8);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleFilesSelected = useCallback(async (files) => {
        const fileList = Array.from(files);
        const remaining = MAX_PHOTOS - newPro.gallery_urls.length;

        if (remaining <= 0) {
            alert(`Máximo de ${MAX_PHOTOS} fotos atingido.`);
            return;
        }

        const toUpload = fileList.slice(0, remaining);
        setUploading(true);

        try {
            const compressedFiles = await Promise.all(toUpload.map(compressImage));
            const uploadPromises = compressedFiles.map(uploadFile);
            const urls = await Promise.all(uploadPromises);
            setNewPro(prev => ({
                ...prev,
                gallery_urls: [...prev.gallery_urls, ...urls],
            }));
        } catch (err) {
            alert(err.message || 'Erro ao fazer upload.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    }, [newPro.gallery_urls.length]);

    const removePhoto = (index) => {
        setNewPro(prev => ({
            ...prev,
            gallery_urls: prev.gallery_urls.filter((_, i) => i !== index),
        }));
    };

    // ─── Drag & Drop ──────────────────────────────────────────
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFilesSelected(files);
    };

    // ─── Salvar ───────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        if (!newPro.name) return;

        const specialtiesArray = newPro.specialties.split(',').map(s => s.trim()).filter(Boolean);
        const proData = {
            name: newPro.name.trim(),
            specialties: specialtiesArray,
            photo_url: newPro.gallery_urls[0] || null,
            gallery_urls: newPro.gallery_urls,
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

            closeForm();
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
            location: pro.location || 'Aracaju',
            location_start_date: pro.location_start_date || '',
            location_end_date: pro.location_end_date || '',
            gallery_urls: (pro.gallery_urls || []).filter(url => url && !url.includes('ui-avatars.com')),
        });
        setEditingId(pro.id);
        setIsAdding(true);
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
        setNewPro({
            name: '', specialties: '', location: 'Aracaju',
            location_start_date: '', location_end_date: '',
            gallery_urls: [],
        });
    };

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Equipe Profissional</h1>
                    <p className="text-slate-500 mt-2 font-light">Gerencie os terapeutas e suas especialidades.</p>
                </div>
                <button
                    onClick={() => {
                        if (isAdding) {
                            closeForm();
                        } else {
                            setEditingId(null);
                            setNewPro({
                                name: '', specialties: '', location: 'Aracaju',
                                location_start_date: '', location_end_date: '',
                                gallery_urls: [],
                            });
                            setIsAdding(true);
                        }
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
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Período - Início</label>
                                    <input
                                        type="date"
                                        className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-500"
                                        value={newPro.location_start_date}
                                        onChange={e => setNewPro({ ...newPro, location_start_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Período - Fim</label>
                                    <input
                                        type="date"
                                        className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-500"
                                        value={newPro.location_end_date}
                                        onChange={e => setNewPro({ ...newPro, location_end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                                    <Camera size={14} />
                                    Galeria de Fotos
                                </label>
                                <span className="text-xs text-slate-400 font-medium">
                                    {newPro.gallery_urls.length}/{MAX_PHOTOS} fotos
                                </span>
                            </div>

                            {newPro.gallery_urls.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {newPro.gallery_urls.map((url, index) => (
                                        <div
                                            key={index}
                                            className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-cyan-400 transition-all shadow-sm"
                                        >
                                            <img
                                                src={url}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=Erro&background=fee2e2&color=ef4444&size=200`;
                                                }}
                                            />
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-cyan-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                                                    Principal
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg transform hover:scale-110"
                                                title="Remover foto"
                                            >
                                                <X size={12} />
                                            </button>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Área de Drag & Drop */}
                            {newPro.gallery_urls.length < MAX_PHOTOS && (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                                        dragOver
                                            ? 'border-cyan-500 bg-cyan-50/50 scale-[1.01]'
                                            : 'border-slate-200 bg-slate-50/30 hover:border-cyan-300 hover:bg-cyan-50/20'
                                    } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                                    onClick={() => {
                                        if (!uploading) document.getElementById('photo-input')?.click();
                                    }}
                                >
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-3 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
                                            <p className="text-sm text-cyan-600 font-bold">Enviando fotos...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 bg-cyan-100/60 rounded-2xl flex items-center justify-center">
                                                <ImagePlus size={24} className="text-cyan-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-600">
                                                    Arraste fotos aqui ou <span className="text-cyan-600 underline">clique para selecionar</span>
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    JPG, PNG ou WebP · Máximo 5 MB por foto · Até {MAX_PHOTOS - newPro.gallery_urls.length} foto{MAX_PHOTOS - newPro.gallery_urls.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        id="photo-input"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.length) handleFilesSelected(e.target.files);
                                            e.target.value = '';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeForm} className="text-slate-500 hover:bg-slate-100 px-6 py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="bg-cyan-600 text-white px-8 py-3 rounded-xl hover:bg-cyan-700 font-bold shadow-lg shadow-cyan-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingId ? 'Atualizar Dados' : 'Salvar Cadastro'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pros.map(pro => {
                    const galleryCount = (pro.gallery_urls || []).filter(u => u && !u.includes('ui-avatars.com')).length;
                    const validGallery = (pro.gallery_urls || []).filter(u => u && !u.includes('ui-avatars.com'));
                    const avatarUrl = validGallery[0]
                        || (pro.photo_url && !pro.photo_url.includes('ui-avatars.com') ? pro.photo_url : null)
                        || `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.name)}&background=f8fafc&color=334155&size=400&bold=true`;

                    return (
                        <div key={pro.id} className={`group bg-white/60 backdrop-blur-md rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${pro.active ? 'border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1' : 'border border-slate-100 opacity-60 grayscale'}`}>
                            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${pro.active ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-slate-300'}`}></div>

                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-cyan-200 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-all"></div>
                                    <img
                                        src={avatarUrl}
                                        alt={pro.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.name)}&background=f1f5f9&color=64748b&bold=true`;
                                        }}
                                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover object-[center_20%] shadow-2xl border-4 border-white relative z-10 transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {galleryCount > 0 && (
                                        <div className="absolute -bottom-1 right-2 bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 shadow-md z-20 flex items-center gap-1">
                                            <Camera size={10} />
                                            {galleryCount}
                                        </div>
                                    )}
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
                    );
                })}
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
