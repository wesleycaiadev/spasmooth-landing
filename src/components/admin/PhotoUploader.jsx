'use client';

import { useState, useCallback, useRef } from 'react';
import { ImagePlus, X, Camera, GripVertical, Loader2 } from 'lucide-react';
import { compressImage, extractFileNameFromUrl } from '@/lib/image';

const UPLOAD_ENDPOINT = '/api/admin/upload';

/**
 * PhotoUploader — Componente de upload, preview, reordenação e remoção de fotos.
 *
 * Props:
 *  - photos: string[]         → URLs atuais das fotos
 *  - onChange: (urls[]) => void → Callback quando o array muda
 *  - maxPhotos: number         → Limite máximo (default 5)
 *  - disabled: boolean         → Desabilita interações
 */
export default function PhotoUploader({
    photos = [],
    onChange,
    maxPhotos = 5,
    disabled = false,
}) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState([]); // { name, status: 'compressing'|'uploading'|'done'|'error' }
    const [dragOver, setDragOver] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const fileInputRef = useRef(null);

    // ─── Upload de Arquivo ────────────────────────────────

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(UPLOAD_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Falha no upload');
        return data.url;
    };

    const handleFilesSelected = useCallback(
        async (files) => {
            const fileList = Array.from(files);
            const remaining = maxPhotos - photos.length;

            if (remaining <= 0) {
                alert(`Máximo de ${maxPhotos} fotos atingido.`);
                return;
            }

            const toUpload = fileList.slice(0, remaining);
            setUploading(true);

            // Inicializar progress
            const progressItems = toUpload.map((f) => ({
                name: f.name,
                status: 'compressing',
            }));
            setUploadProgress(progressItems);

            const newUrls = [];

            for (let i = 0; i < toUpload.length; i++) {
                try {
                    // Comprimir
                    setUploadProgress((prev) =>
                        prev.map((p, idx) =>
                            idx === i ? { ...p, status: 'compressing' } : p
                        )
                    );
                    const compressed = await compressImage(toUpload[i]);

                    // Upload
                    setUploadProgress((prev) =>
                        prev.map((p, idx) =>
                            idx === i ? { ...p, status: 'uploading' } : p
                        )
                    );
                    const url = await uploadFile(compressed);
                    newUrls.push(url);

                    setUploadProgress((prev) =>
                        prev.map((p, idx) =>
                            idx === i ? { ...p, status: 'done' } : p
                        )
                    );
                } catch (err) {
                    console.error(`Erro ao processar ${toUpload[i].name}:`, err);
                    setUploadProgress((prev) =>
                        prev.map((p, idx) =>
                            idx === i
                                ? { ...p, status: 'error', error: err.message }
                                : p
                        )
                    );
                }
            }

            if (newUrls.length > 0) {
                onChange([...photos, ...newUrls]);
            }

            setUploading(false);
            // Limpar progress após breve delay para UX
            setTimeout(() => setUploadProgress([]), 1500);
        },
        [photos, maxPhotos, onChange]
    );

    // ─── Remover Foto ─────────────────────────────────────

    const removePhoto = useCallback(
        async (index) => {
            const url = photos[index];
            const newPhotos = photos.filter((_, i) => i !== index);
            onChange(newPhotos);

            // Tentar deletar do Storage (fire and forget para não travar UX)
            const fileName = extractFileNameFromUrl(url);
            if (fileName) {
                try {
                    await fetch(UPLOAD_ENDPOINT, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url }),
                    });
                } catch (err) {
                    console.error('Erro ao deletar do Storage:', err);
                }
            }
        },
        [photos, onChange]
    );

    // ─── Drag & Drop (Zona de Upload) ─────────────────────

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

    // ─── Drag & Drop (Reordenar) ──────────────────────────

    const handleReorderDragStart = (e, index) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Definir dados para evitar conflito com drop zone
        e.dataTransfer.setData('text/plain', `reorder-${index}`);
    };

    const handleReorderDragOver = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragIndex === null) return;
        setDragOverIndex(index);
    };

    const handleReorderDrop = (e, targetIndex) => {
        e.preventDefault();
        e.stopPropagation();

        if (dragIndex === null || dragIndex === targetIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...photos];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        onChange(reordered);
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleReorderDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    // ─── Render ───────────────────────────────────────────

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                    <Camera size={14} />
                    Galeria de Fotos
                </label>
                <span className="text-xs text-slate-400 font-medium">
                    {photos.length}/{maxPhotos} fotos
                </span>
            </div>

            {/* Preview Grid com Reorder */}
            {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {photos.map((url, index) => (
                        <div
                            key={`${url}-${index}`}
                            draggable={!disabled}
                            onDragStart={(e) => handleReorderDragStart(e, index)}
                            onDragOver={(e) => handleReorderDragOver(e, index)}
                            onDrop={(e) => handleReorderDrop(e, index)}
                            onDragEnd={handleReorderDragEnd}
                            className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm cursor-grab active:cursor-grabbing ${
                                dragOverIndex === index && dragIndex !== null
                                    ? 'border-cyan-500 scale-105 shadow-lg shadow-cyan-100'
                                    : dragIndex === index
                                      ? 'border-cyan-300 opacity-50 scale-95'
                                      : 'border-slate-200 hover:border-cyan-400'
                            }`}
                        >
                            <img
                                src={url}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=Erro&background=fee2e2&color=ef4444&size=200`;
                                }}
                            />

                            {/* Badge Principal */}
                            {index === 0 && (
                                <div className="absolute top-2 left-2 bg-cyan-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                                    Principal
                                </div>
                            )}

                            {/* Grip Icon */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none">
                                <GripVertical size={16} className="text-white drop-shadow-lg" />
                            </div>

                            {/* Botão Remover */}
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                disabled={disabled}
                                className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg transform hover:scale-110 disabled:opacity-50"
                                title="Remover foto"
                            >
                                <X size={12} />
                            </button>

                            {/* Overlay hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none" />
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
                <div className="space-y-2">
                    {uploadProgress.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 text-xs bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100"
                        >
                            {item.status === 'done' ? (
                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : item.status === 'error' ? (
                                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                    <X size={10} className="text-white" />
                                </div>
                            ) : (
                                <Loader2 size={14} className="text-cyan-600 animate-spin" />
                            )}
                            <span className="truncate flex-1 text-slate-600 font-medium">{item.name}</span>
                            <span
                                className={`font-bold uppercase tracking-wider text-[10px] ${
                                    item.status === 'done'
                                        ? 'text-green-600'
                                        : item.status === 'error'
                                          ? 'text-red-500'
                                          : 'text-cyan-600'
                                }`}
                            >
                                {item.status === 'compressing' && 'Comprimindo...'}
                                {item.status === 'uploading' && 'Enviando...'}
                                {item.status === 'done' && 'Concluído'}
                                {item.status === 'error' && 'Falhou'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Zona de Drop/Seleção */}
            {photos.length < maxPhotos && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                        dragOver
                            ? 'border-cyan-500 bg-cyan-50/50 scale-[1.01]'
                            : 'border-slate-200 bg-slate-50/30 hover:border-cyan-300 hover:bg-cyan-50/20'
                    } ${uploading || disabled ? 'pointer-events-none opacity-60' : ''}`}
                    onClick={() => {
                        if (!uploading && !disabled) fileInputRef.current?.click();
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
                                    Arraste fotos aqui ou{' '}
                                    <span className="text-cyan-600 underline">clique para selecionar</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    JPG, PNG ou WebP · Máximo 5 MB por foto · Até{' '}
                                    {maxPhotos - photos.length} foto
                                    {maxPhotos - photos.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
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
    );
}
