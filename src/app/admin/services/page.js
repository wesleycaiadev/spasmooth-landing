"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import * as svcService from '@/services/admin/services';
import { calculateDiscount } from '@/lib/discounts';
import {
    Package, Plus, Trash2, Pencil, Check, X, Eye, EyeOff,
    Scissors, Sparkles, Clock, DollarSign, AlertCircle, CheckCircle2, Flame, Flower2, HeartHandshake,
    Tag, Percent, Zap
} from 'lucide-react';

const CATEGORY_LABELS = {
    combo: { label: 'Combos & Promoções', icon: Package, color: 'emerald' },
    day_spa: { label: 'Day Spa', icon: Flower2, color: 'blue' },
    estetica: { label: 'Estética', icon: HeartHandshake, color: 'pink' },
    depilacao: { label: 'Depilação', icon: Scissors, color: 'violet' },
    tantrica: { label: 'Tântricas', icon: Flame, color: 'red' },
    outros: { label: 'Serviços Antigos', icon: AlertCircle, color: 'slate' }
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
    const [activeTab, setActiveTab] = useState('combo');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [editingPriceValue, setEditingPriceValue] = useState('');
    const [toast, setToast] = useState(null);
    const toastTimeout = useRef(null);

    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [discountTargetCategory, setDiscountTargetCategory] = useState('combo');
    const [discountInputPercent, setDiscountInputPercent] = useState('15');

    const [formData, setFormData] = useState({
        name: '',
        category: 'combo',
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
            setServices(data || []);
        } catch (err) {
            console.error(err);
            showToast('Erro ao carregar serviços.', 'error');
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const filteredServices = services.filter(s => 
        activeTab === 'outros' 
            ? !['combo', 'day_spa', 'estetica', 'depilacao', 'tantrica'].includes(s.category)
            : s.category === activeTab
    );

    const resetForm = () => {
        setFormData({ name: '', category: 'combo', price: '', duration_minutes: '', description: '' });
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

    const handleApplyDiscount = async (categoryTarget, percentVal) => {
        if (isNaN(percentVal) || percentVal < 0 || percentVal > 100) {
            showToast('Digite um percentual de desconto válido entre 0 e 100%.', 'error');
            return;
        }

        const result = await svcService.applyDiscountToCategory(categoryTarget, percentVal);

        if (!result.success) {
            showToast(result.error || 'Erro ao aplicar desconto.', 'error');
            return;
        }

        const categoryLabel = categoryTarget === 'all' || categoryTarget === 'tudo'
            ? 'todos os serviços'
            : `serviços da categoria ${CATEGORY_LABELS[categoryTarget]?.label || categoryTarget}`;

        showToast(`Desconto de ${percentVal}% aplicado com sucesso para ${categoryLabel}!`);
        setIsDiscountModalOpen(false);
        fetchServices();
    };

    const handleClearDiscount = async (categoryTarget) => {
        const result = await svcService.clearCategoryDiscount(categoryTarget);

        if (!result.success) {
            showToast(result.error || 'Erro ao remover descontos.', 'error');
            return;
        }

        const categoryLabel = categoryTarget === 'all' || categoryTarget === 'tudo'
            ? 'todos os serviços'
            : `serviços da categoria ${CATEGORY_LABELS[categoryTarget]?.label || categoryTarget}`;

        showToast(`Descontos removidos com sucesso de ${categoryLabel}.`);
        fetchServices();
    };

    const handleToggleSingleDiscount = async (svc, percentVal, active) => {
        const result = await svcService.updateServiceDiscount(svc.id, percentVal, active);

        if (!result.success) {
            showToast(result.error || 'Erro ao atualizar desconto do serviço.', 'error');
            return;
        }

        setServices(prev => prev.map(s => s.id === svc.id ? { ...s, discount_percent: percentVal, discount_active: active } : s));
        showToast(active ? `Desconto de ${percentVal}% ativado em "${svc.name}".` : `Desconto desativado em "${svc.name}".`);
    };

    const counts = {
        combo: services.filter(s => s.category === 'combo').length,
        day_spa: services.filter(s => s.category === 'day_spa').length,
        estetica: services.filter(s => s.category === 'estetica').length,
        depilacao: services.filter(s => s.category === 'depilacao').length,
        tantrica: services.filter(s => s.category === 'tantrica').length,
        outros: services.filter(s => !['combo', 'day_spa', 'estetica', 'depilacao', 'tantrica'].includes(s.category)).length,
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">
                        Gerenciar Serviços
                    </h1>
                    <p className="text-slate-500 mt-2 font-light">
                        Gerencie preços, categorias, promoções e visibilidade do catálogo.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => {
                            setDiscountTargetCategory(activeTab === 'outros' ? 'all' : activeTab);
                            setIsDiscountModalOpen(true);
                        }}
                        className="flex-1 md:flex-initial bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        id="btn-open-discount-modal"
                    >
                        <Tag size={18} />
                        Promover / Desconto
                    </button>

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
                        className="flex-1 md:flex-initial bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        id="btn-new-service"
                    >
                        <Plus size={20} />
                        {isFormOpen && !editingId ? 'Fechar' : 'Novo Serviço'}
                    </button>
                </div>
            </div>

            {/* Modal de Desconto */}
            {isDiscountModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative animate-scaleUp">
                        <button
                            onClick={() => setIsDiscountModalOpen(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Aplicar Desconto</h3>
                                <p className="text-xs text-slate-400 font-medium">Aplicação em lote por categoria ou catálogo completo</p>
                            </div>
                        </div>

                        <div className="space-y-4 my-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                                    Alvo do Desconto
                                </label>
                                <select
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    value={discountTargetCategory}
                                    onChange={(e) => setDiscountTargetCategory(e.target.value)}
                                >
                                    <option value="all">🔥 TODOS OS SERVIÇOS (Catálogo Completo)</option>
                                    <option value="combo">Combos & Promoções</option>
                                    <option value="day_spa">Day Spa</option>
                                    <option value="estetica">Estética</option>
                                    <option value="depilacao">Depilação</option>
                                    <option value="tantrica">Tântricas</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                                    Percentual de Desconto (% OFF)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        placeholder="Ex: 15"
                                        className="w-full border border-slate-200 rounded-xl pl-4 pr-12 py-3 bg-slate-50 font-extrabold text-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        value={discountInputPercent}
                                        onChange={(e) => setDiscountInputPercent(e.target.value)}
                                    />
                                    <Percent size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {[5, 10, 15, 20, 25, 30].map(pct => (
                                    <button
                                        key={pct}
                                        type="button"
                                        onClick={() => setDiscountInputPercent(String(pct))}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                            discountInputPercent === String(pct)
                                                ? 'bg-amber-500 text-white border-amber-500'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <button
                                onClick={() => handleApplyDiscount(discountTargetCategory, parseFloat(discountInputPercent))}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Aplicar Desconto de {discountInputPercent}%
                            </button>

                            <button
                                onClick={() => handleClearDiscount(discountTargetCategory)}
                                className="w-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={14} />
                                Removendo / Zerar Descontos deste Alvo
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                <option value="combo">Combos & Promoções</option>
                                <option value="day_spa">Day Spa</option>
                                <option value="estetica">Estética</option>
                                <option value="depilacao">Depilação</option>
                                <option value="tantrica">Tântricas</option>
                                {!['combo', 'day_spa', 'estetica', 'depilacao', 'tantrica'].includes(formData.category) && (
                                    <option value={formData.category}>Categoria Antiga ({formData.category})</option>
                                )}
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
                    {filteredServices.map((svc) => {
                        const disc = calculateDiscount(svc);

                        return (
                            <div
                                key={svc.id}
                                className={`group bg-white/60 backdrop-blur-md rounded-2xl p-5 md:p-6 transition-all duration-300 border relative overflow-hidden ${
                                    svc.active
                                        ? disc.hasDiscount
                                            ? 'border-amber-200/80 shadow-md hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-amber-50/20 via-white/80 to-white/60'
                                            : 'border-white/60 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                                        : 'border-slate-100 opacity-50 grayscale'
                                }`}
                                id={`service-${svc.id}`}
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full rounded-r-full transition-colors ${
                                    svc.active
                                        ? disc.hasDiscount ? 'bg-amber-500' : svc.category === 'combo' ? 'bg-cyan-400' : 'bg-violet-400'
                                        : 'bg-slate-200'
                                }`} />

                                <div className="flex flex-col md:flex-row md:items-center gap-4 pl-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-2.5 mb-1">
                                            <h4 className="font-bold text-slate-800 text-lg truncate">
                                                {svc.name}
                                            </h4>

                                            {disc.hasDiscount && (
                                                <span className="text-[11px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 shadow-sm flex items-center gap-1 animate-pulse">
                                                    🔥 {disc.discountPercent}% OFF
                                                </span>
                                            )}

                                            {!svc.active && (
                                                <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                                                    Inativo
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <span className="flex items-center gap-1 font-medium">
                                                <Clock size={14} />
                                                {formatDuration(svc.duration_minutes)}
                                            </span>
                                            {svc.description && (
                                                <span className="hidden md:inline truncate max-w-xs font-light">
                                                    {svc.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => handleToggleSingleDiscount(svc, svc.discount_percent && svc.discount_percent > 0 ? svc.discount_percent : 15, !svc.discount_active)}
                                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                                                disc.hasDiscount
                                                    ? 'bg-amber-100/80 text-amber-800 border-amber-300 hover:bg-amber-200'
                                                    : 'bg-slate-50 text-slate-400 border-slate-200/60 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'
                                            }`}
                                            title={disc.hasDiscount ? 'Desativar desconto neste serviço' : 'Ativar desconto rápido neste serviço'}
                                        >
                                            <Tag size={13} />
                                            {disc.hasDiscount ? `${disc.discountPercent}%` : 'Desconto'}
                                        </button>

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
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all group/price cursor-pointer ${
                                                    disc.hasDiscount
                                                        ? 'bg-amber-50/60 border-amber-200/80 hover:bg-amber-100/60'
                                                        : 'bg-slate-50/80 hover:bg-cyan-50 border-slate-200/60 hover:border-cyan-200'
                                                }`}
                                                title="Clique para editar o preço base"
                                                aria-label={`Editar preço de ${svc.name}`}
                                            >
                                                <DollarSign size={14} className="text-slate-300 group-hover/price:text-cyan-500 transition-colors" />
                                                <div className="flex flex-col text-right">
                                                    {disc.hasDiscount && (
                                                        <span className="text-[11px] line-through text-slate-400 font-medium">
                                                            {disc.formattedOriginalPrice}
                                                        </span>
                                                    )}
                                                    <span className={`font-extrabold text-lg ${disc.hasDiscount ? 'text-emerald-700' : 'text-slate-800'}`}>
                                                        {disc.formattedFinalPrice}
                                                    </span>
                                                </div>
                                                <Pencil size={12} className="text-slate-300 group-hover/price:text-cyan-500 transition-colors ml-1" />
                                            </button>
                                        )}
                                    </div>

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
                        );
                    })}
                </div>
            )}

            {!loading && filteredServices.length > 0 && (
                <div className="mt-8 text-center text-xs text-slate-400 font-medium">
                    {filteredServices.filter(s => s.active).length} serviço(s) ativo(s) de {filteredServices.length} total
                </div>
            )}
        </div>
    );
}

