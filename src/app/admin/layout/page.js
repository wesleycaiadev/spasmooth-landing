"use client";

import { useState, useEffect } from 'react';
import { getLayoutConfig, updateLayoutConfig, LayoutSection, getCategoryLayoutConfig, updateCategoryLayoutConfig, getFeaturedCarouselConfig, updateFeaturedCarouselConfig } from '@/services/admin/layout';
import { GripVertical, Eye, EyeOff, Save, Check, Star, Settings2 } from 'lucide-react';
import { getActiveServices } from '@/services/admin/services';

export default function LayoutAdminPage() {
    const [sections, setSections] = useState([]);
    const [categoryOrder, setCategoryOrder] = useState([]);
    const [carouselConfig, setCarouselConfig] = useState({ mode: 'promotions', serviceIds: [], maxItems: 3 });
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const CATEGORY_LABELS = {
        combo: 'Combos de Massagem',
        day_spa: 'Pacotes Day Spa',
        estetica: 'Estética e Cuidados Avulsos',
        depilacao: 'Depilação Suave',
        tantrica: 'Terapias Sensoriais e Tântricas'
    };

    useEffect(() => {
        fetchLayout();
    }, []);

    const fetchLayout = async () => {
        setLoading(true);
        try {
            const [layoutRes, catRes, carRes, servicesRes] = await Promise.all([
                getLayoutConfig(),
                getCategoryLayoutConfig(),
                getFeaturedCarouselConfig(),
                getActiveServices()
            ]);

            if (layoutRes.success) setSections(layoutRes.data);
            if (catRes.success) setCategoryOrder(catRes.data);
            if (carRes.success) setCarouselConfig(carRes.data);
            setAllServices(servicesRes || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = (id) => {
        setSections(sections.map(sec => 
            sec.id === id ? { ...sec, visible: !sec.visible } : sec
        ));
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const newSections = [...sections];
        const temp = newSections[index - 1];
        newSections[index - 1] = newSections[index];
        newSections[index] = temp;
        setSections(newSections);
    };

    const moveDown = (index) => {
        if (index === sections.length - 1) return;
        const newSections = [...sections];
        const temp = newSections[index + 1];
        newSections[index + 1] = newSections[index];
        newSections[index] = temp;
        setSections(newSections);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const [layoutRes, catRes, carRes] = await Promise.all([
                updateLayoutConfig(sections),
                updateCategoryLayoutConfig(categoryOrder),
                updateFeaturedCarouselConfig(carouselConfig)
            ]);

            if (layoutRes.success && catRes.success && carRes.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                alert('Erro ao salvar algumas configurações.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro inesperado ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const moveCategoryUp = (index) => {
        if (index === 0) return;
        const newOrder = [...categoryOrder];
        const temp = newOrder[index - 1];
        newOrder[index - 1] = newOrder[index];
        newOrder[index] = temp;
        setCategoryOrder(newOrder);
    };

    const moveCategoryDown = (index) => {
        if (index === categoryOrder.length - 1) return;
        const newOrder = [...categoryOrder];
        const temp = newOrder[index + 1];
        newOrder[index + 1] = newOrder[index];
        newOrder[index] = temp;
        setCategoryOrder(newOrder);
    };

    const toggleServiceSelection = (serviceId) => {
        setCarouselConfig(prev => {
            const isSelected = prev.serviceIds.includes(serviceId);
            return {
                ...prev,
                serviceIds: isSelected 
                    ? prev.serviceIds.filter(id => id !== serviceId)
                    : [...prev.serviceIds, serviceId]
            };
        });
    };

    if (loading) {
        return <div className="p-8 text-slate-500">Carregando configurações de layout...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800">Layout do Site</h1>
                    <p className="text-slate-500 mt-2">Controle a visibilidade e a ordem em que as seções aparecem na página principal.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-cyan-200 transition-all active:scale-[0.98]"
                >
                    {saved ? <Check size={20} /> : <Save size={20} />}
                    {saving ? 'Salvando...' : saved ? 'Salvo com sucesso!' : 'Salvar Alterações'}
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-[auto_1fr_auto] gap-4 items-center font-bold text-slate-500 text-xs uppercase tracking-wider">
                    <div className="w-8"></div>
                    <div>Seção da Landing Page</div>
                    <div>Visibilidade / Ordem</div>
                </div>

                <div className="divide-y divide-slate-100">
                    {sections.map((section, index) => (
                        <div 
                            key={section.id} 
                            className={`p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center transition-colors hover:bg-slate-50 ${!section.visible ? 'opacity-60 bg-slate-50/50' : ''}`}
                        >
                            <div className="text-slate-300 cursor-move" title="A ordem pode ser alterada usando os botões à direita">
                                <GripVertical size={20} />
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{section.label}</h3>
                                <p className="text-xs text-slate-400 font-mono mt-1">ID: {section.id}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => toggleVisibility(section.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                        section.visible 
                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                                >
                                    {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    {section.visible ? 'Visível' : 'Oculto'}
                                </button>
                                
                                <div className="flex flex-col gap-1">
                                    <button 
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100"
                                        title="Mover para cima"
                                    >
                                        ▲
                                    </button>
                                    <button 
                                        onClick={() => moveDown(index)}
                                        disabled={index === sections.length - 1}
                                        className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100"
                                        title="Mover para baixo"
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* SEÇÃO 2: ORDEM DAS CATEGORIAS DE SERVIÇOS */}
            <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-[auto_1fr_auto] gap-4 items-center font-bold text-slate-500 text-xs uppercase tracking-wider">
                    <div className="w-8"></div>
                    <div>Ordem das Categorias de Serviços</div>
                    <div>Ordem</div>
                </div>

                <div className="divide-y divide-slate-100">
                    {categoryOrder.map((catKey, index) => (
                        <div key={catKey} className="p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center transition-colors hover:bg-slate-50">
                            <div className="text-slate-300 cursor-move" title="A ordem pode ser alterada usando os botões à direita">
                                <GripVertical size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{CATEGORY_LABELS[catKey] || catKey}</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1">
                                    <button 
                                        onClick={() => moveCategoryUp(index)}
                                        disabled={index === 0}
                                        className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100"
                                        title="Mover para cima"
                                    >
                                        ▲
                                    </button>
                                    <button 
                                        onClick={() => moveCategoryDown(index)}
                                        disabled={index === categoryOrder.length - 1}
                                        className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100"
                                        title="Mover para baixo"
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEÇÃO 3: BANNER DE DESTAQUES */}
            <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Star className="text-yellow-500" size={24} />
                    <h2 className="text-xl font-bold text-slate-800">Banner de Destaques (Carrossel)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div 
                        onClick={() => setCarouselConfig({ ...carouselConfig, mode: 'promotions' })}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            carouselConfig.mode === 'promotions' 
                                ? 'border-cyan-500 bg-cyan-50' 
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                    >
                        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="text-xl">🔥</span> Promoções (Automático)
                        </h3>
                        <p className="text-sm text-slate-500">
                            Exibe no banner todos os serviços que atualmente possuem algum desconto cadastrado.
                        </p>
                        
                        {carouselConfig.mode === 'promotions' && (
                            <div className="mt-4 pt-4 border-t border-cyan-200">
                                <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-2">Máximo de Itens a Exibir</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="10"
                                    value={carouselConfig.maxItems}
                                    onChange={(e) => setCarouselConfig({ ...carouselConfig, maxItems: parseInt(e.target.value) || 3 })}
                                    className="w-full bg-white border border-cyan-300 rounded-xl px-4 py-2 text-slate-700"
                                />
                            </div>
                        )}
                    </div>

                    <div 
                        onClick={() => setCarouselConfig({ ...carouselConfig, mode: 'manual' })}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            carouselConfig.mode === 'manual' 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                    >
                        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <Settings2 className="text-indigo-500" size={20} /> Seleção Manual
                        </h3>
                        <p className="text-sm text-slate-500">
                            Escolha manualmente quais serviços exatos você quer destacar no banner principal.
                        </p>
                    </div>
                </div>

                {carouselConfig.mode === 'manual' && (
                    <div className="border border-indigo-100 rounded-2xl overflow-hidden bg-white">
                        <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                            <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-wider">Selecione os Serviços</h4>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {allServices.length === 0 ? (
                                <p className="p-4 text-center text-slate-500 text-sm">Nenhum serviço cadastrado.</p>
                            ) : (
                                <div className="space-y-1">
                                    {allServices.map(service => {
                                        const isSelected = carouselConfig.serviceIds.includes(service.id);
                                        return (
                                            <div 
                                                key={service.id}
                                                onClick={() => toggleServiceSelection(service.id)}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                                                    isSelected ? 'bg-indigo-100/50' : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                                    isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300'
                                                }`}>
                                                    {isSelected && <Check size={14} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">{service.name}</div>
                                                    <div className="text-xs text-slate-400">{CATEGORY_LABELS[service.category] || service.category}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                <h4 className="font-bold text-blue-800 mb-2">Como funciona?</h4>
                <p className="text-sm text-blue-700/80 leading-relaxed mb-2">
                    <strong>Seções:</strong> A página principal (landing page) lerá esta configuração toda vez que for carregada. Seções marcadas como ocultas não serão exibidas para o cliente. A ordem mostrada acima reflete a ordem em que os blocos aparecerão na tela, de cima para baixo.
                </p>
                <p className="text-sm text-blue-700/80 leading-relaxed">
                    <strong>Categorias e Banner:</strong> Aplicam-se na tela de navegação de serviços do cliente. As configurações determinam o que aparece primeiro no topo do menu.
                </p>
            </div>
        </div>
    );
}
