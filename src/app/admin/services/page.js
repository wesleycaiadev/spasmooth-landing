"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import * as svcService from '@/services/admin/services';
import {
    Package, Plus, Trash2, Pencil, Check, X, Eye, EyeOff,
    Scissors, Sparkles, Clock, DollarSign, AlertCircle, CheckCircle2, Flame, Flower2, HeartHandshake
} from 'lucide-react';

const CATEGORY_LABELS = {
    combos: { label: 'Combos & Promoções', icon: Package, color: 'emerald' },
    daySpa: { label: 'Day Spa', icon: Flower2, color: 'blue' },
    estetica: { label: 'Estética', icon: HeartHandshake, color: 'pink' },
    depilacao: { label: 'Depilação', icon: Scissors, color: 'violet' },
    tantrica: { label: 'Tântricas', icon: Flame, color: 'red' }
};

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDuration(minutes) {
    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h${m}min` : `${h}h`;
    }
    return `${minutes}min`;
}

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('combos');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [editingPriceValue, setEditingPriceValue] = useState('');
    const [toast, setToast] = useState(null);
    const toastTimeout = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        category: 'combos',
        price: '',
        duration_minutes: '',
        description: '',
    });

    const showToast = useCallback((message, type = 'success') => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        setToast({ message, type });
        toastTimeout.current = setTimeout(() => setToast(null), 3500);
    }, []);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const data = await svcService.getServices();
            setServices(data);
        } catch (err) {
            console.error(err);
            showToast('Erro ao carregar serviços.', 'error');
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const filteredServices = services.filter(s => s.category === activeTab);

    const resetForm = () => {
        setFormData({ name: '', category: 'combos', price: '', duration_minutes: '', description: '' });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name.trim(),
            category: formData.category,
            price: parseFloat(formData.price),
            duration_minutes: parseInt(formData.duration_minutes, 10),
            description: formData.description.trim(),
        };

        if (!payload.name || isNaN(payload.price) || isNaN(payload.duration_minutes)) {
            showToast('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const result = editingId
            ? await svcService.updateService(editingId, payload)
            : await svcService.createService(payload);

        if (!result.success) {
            showToast(result.error || 'Erro ao salvar serviço.', 'error');
            return;
        }

        showToast(editingId ? 'Serviço atualizado com sucesso.' : 'Serviço criado com sucesso.');
        resetForm();
        fetchServices();
    };

    const handleEdit = (svc) => {
        setFormData({
            name: svc.name,
            category: svc.category,
            price: String(svc.price),
            duration_minutes: String(svc.duration_minutes),
            description: svc.description || '',
        });
        setEditingId(svc.id);
        setIsFormOpen(true);
        setActiveTab(svc.category);
    };

    const handlePriceSave = async (id) => {
        const price = parseFloat(editingPriceValue);
        if (isNaN(price) || price < 0) {
            showToast('Preço inválido.', 'error');
            return;
        }

        const result = await svcService.updateServicePrice(id, price);

        if (!result.success) {
            showToast(result.error || 'Erro ao atualizar preço.', 'error');
            return;
        }

        setServices(prev => prev.map(s => s.id === id ? { ...s, price } : s));
        setEditingPriceId(null);
        showToast('Preço atualizado.');
    };

    const toggleActive = async (id, currentStatus) => {
        const result = await svcService.toggleServiceActive(id, currentStatus);

        if (!result.success) {
            showToast(result.error || 'Erro ao alterar status.', 'error');
            return;
        }

        setServices(prev => prev.map(s => s.id === id ? { ...s, active: !currentStatus } : s));
        showToast(currentStatus ? 'Serviço desativado.' : 'Serviço ativado.');
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.')) return;

        const result = await svcService.deleteService(id);

        if (!result.success) {
            showToast(result.error || 'Erro ao remover serviço.', 'error');
            return;
        }

        setServices(prev => prev.filter(s => s.id !== id));
        showToast('Serviço removido.');
    };

    const counts = {
        combos: services.filter(s => s.category === 'combos').length,
        daySpa: services.filter(s => s.category === 'daySpa').length,
        estetica: services.filter(s => s.category === 'estetica').length,
        depilacao: services.filter(s => s.category === 'depilacao').length,
        tantrica: services.filter(s => s.category === 'tantrica').length,
    };

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-12">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold backdrop-blur-xl border transition-all animate-slideDown ${
                        toast.type === 'error'
                            ? 'bg-red-50/90 border-red-200 text-red-700'
                            : 'bg-emerald-50/90 border-emerald-200 text-emerald-700'
                    }`}
                    role="alert"
                >
                    {toast.type === 'error'
                        ? <AlertCircle size={18} />
                        : <CheckCircle2 size={18} />
                    }
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">
                        Gerenciar Serviços
                    </h1>
                    <p className="text-slate-500 mt-2 font-light">
                        Gerencie preços, categorias e visibilidade do catálogo.
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (isFormOpen && !editingId) {
                            resetForm();
                        } else {
                            resetForm();
                            setFormData(prev => ({ ...prev, category: activeTab }));
                            setIsFormOpen(true);
                        }
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    id="btn-new-service"
                >
                    <Plus size={20} />
                    {isFormOpen && !editingId ? 'Fechar Formulário' : 'Novo Serviço'}
                </button>
            </div>

            {/* Form */}
            {isFormOpen && (
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl mb-12 animate-slideDown relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/30 rounded-full blur-3xl -z-10" />

                    <h3 className="font-bold text-slate-800 text-xl mb-6">
                        {editingId ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
                    </h3>

                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="service-name" className="text-xs font-bold text-slate-500 uppercase ml-1">
                                Nome do Serviço *
                            </label>
                            <input
                                id="service-name"
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                placeholder="Ex: Massagem Relaxante Especial"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="service-category" className="text-xs font-bold text-slate-500 uppercase ml-1">
                                Categoria *
                            </label>
                            <select
                                id="service-category"
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-600 font-medium"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="combos">Combos & Promoções</option>
                                <option value="daySpa">Day Spa</option>
                                <option value="estetica">Estética</option>
                                <option value="depilacao">Depilação</option>
                                <option value="tantrica">Tântricas</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="service-price" className="text-xs font-bold text-slate-500 uppercase ml-1">
                                Preço (R$) *
                            </label>
                            <input
                                id="service-price"
                                type="number"
                                step="0.01"
                                min="0"
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                placeholder="Ex: 350.00"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="service-duration" className="text-xs font-bold text-slate-500 uppercase ml-1">
                                Duração (minutos) *
                            </label>
                            <input
                                id="service-duration"
                                type="number"
                                min="1"
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                placeholder="Ex: 60"
                                value={formData.duration_minutes}
                                onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
                                required
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label htmlFor="service-description" className="text-xs font-bold text-slate-500 uppercase ml-1">
                                Descrição (Opcional)
                            </label>
                            <textarea
                                id="service-description"
                                rows={3}
                                className="border border-slate-200 bg-white/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none"
                                placeholder="Breve descrição do serviço..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                maxLength={500}
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-slate-500 hover:bg-slate-100 px-6 py-3 rounded-xl font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-cyan-600 text-white px-8 py-3 rounded-xl hover:bg-cyan-700 font-bold shadow-lg shadow-cyan-200 transition-all"
                                id="btn-save-service"
                            >
                                {editingId ? 'Atualizar Serviço' : 'Salvar Serviço'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Category Tabs */}
            <div className="flex gap-3 mb-8">
                {Object.entries(CATEGORY_LABELS).map(([key, { label, icon: Icon, color }]) => {
                    const count = counts[key];
                    const isActive = activeTab === key;

                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 border ${
                                isActive
                                    ? color === 'cyan'
                                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-200/50'
                                        : 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200/50'
                                    : 'bg-white/60 backdrop-blur-md text-slate-500 border-white/50 hover:bg-white/80 hover:text-slate-700'
                            }`}
                            id={`tab-${key}`}
                        >
                            <Icon size={18} />
                            {label}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Services List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                        <Package size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">Nenhum serviço cadastrado nesta categoria.</p>
                    <button
                        onClick={() => {
                            setFormData(prev => ({ ...prev, category: activeTab }));
                            setIsFormOpen(true);
                        }}
                        className="mt-4 text-cyan-600 hover:text-cyan-700 font-semibold text-sm"
                    >
                        + Adicionar primeiro serviço
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredServices.map((svc) => (
                        <div
                            key={svc.id}
                            className={`group bg-white/60 backdrop-blur-md rounded-2xl p-5 md:p-6 transition-all duration-300 border relative overflow-hidden ${
                                svc.active
                                    ? 'border-white/60 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                                    : 'border-slate-100 opacity-50 grayscale'
                            }`}
                            id={`service-${svc.id}`}
                        >
                            {/* Active indicator */}
                            <div className={`absolute top-0 left-0 w-1 h-full rounded-r-full transition-colors ${
                                svc.active
                                    ? svc.category === 'massage' ? 'bg-cyan-400' : 'bg-violet-400'
                                    : 'bg-slate-200'
                            }`} />

                            <div className="flex flex-col md:flex-row md:items-center gap-4 pl-3">
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-slate-800 text-lg truncate">
                                            {svc.name}
                                        </h4>
                                        {!svc.active && (
                                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                                                Inativo
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {formatDuration(svc.duration_minutes)}
                                        </span>
                                        {svc.description && (
                                            <span className="hidden md:inline truncate max-w-xs">
                                                {svc.description}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {editingPriceId === svc.id ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400 text-sm font-medium">R$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-28 border border-cyan-300 bg-cyan-50/50 rounded-xl px-3 py-2 text-right font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                                                value={editingPriceValue}
                                                onChange={e => setEditingPriceValue(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handlePriceSave(svc.id);
                                                    if (e.key === 'Escape') setEditingPriceId(null);
                                                }}
                                                autoFocus
                                                id={`price-input-${svc.id}`}
                                            />
                                            <button
                                                onClick={() => handlePriceSave(svc.id)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                title="Salvar preço"
                                                aria-label="Salvar preço"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditingPriceId(null)}
                                                className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
                                                title="Cancelar"
                                                aria-label="Cancelar edição de preço"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingPriceId(svc.id);
                                                setEditingPriceValue(String(svc.price));
                                            }}
                                            className="flex items-center gap-2 bg-slate-50/80 hover:bg-cyan-50 px-4 py-2 rounded-xl border border-slate-200/60 hover:border-cyan-200 transition-all group/price cursor-pointer"
                                            title="Clique para editar o preço"
                                            aria-label={`Editar preço de ${svc.name}`}
                                        >
                                            <DollarSign size={14} className="text-slate-300 group-hover/price:text-cyan-500 transition-colors" />
                                            <span className="font-bold text-slate-800 text-lg">
                                                {formatCurrency(svc.price)}
                                            </span>
                                            <Pencil size={12} className="text-slate-300 group-hover/price:text-cyan-500 transition-colors ml-1" />
                                        </button>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0 border-l border-slate-100/50 pl-4 ml-2">
                                    <button
                                        onClick={() => handleEdit(svc)}
                                        className="p-2.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                                        title="Editar serviço"
                                        aria-label={`Editar ${svc.name}`}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => toggleActive(svc.id, svc.active)}
                                        className={`p-2.5 rounded-xl transition-all ${
                                            svc.active
                                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                : 'text-green-400 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                        title={svc.active ? 'Desativar serviço' : 'Ativar serviço'}
                                        aria-label={svc.active ? `Desativar ${svc.name}` : `Ativar ${svc.name}`}
                                    >
                                        {svc.active ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(svc.id)}
                                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Remover serviço"
                                        aria-label={`Remover ${svc.name}`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Footer */}
            {!loading && filteredServices.length > 0 && (
                <div className="mt-8 text-center text-xs text-slate-400 font-medium">
                    {filteredServices.filter(s => s.active).length} serviço(s) ativo(s) de {filteredServices.length} total
                </div>
            )}
        </div>
    );
}
