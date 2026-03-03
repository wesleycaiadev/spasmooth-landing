"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Filter, MoreVertical, MessageCircle, RefreshCw, Send, Trash2, LayoutList, KanbanSquare } from 'lucide-react';

import StatusDropdown from '@/components/StatusDropdown';

const COLUMNS = {
    novo: { label: 'Novos Lead', color: 'bg-yellow-100 text-yellow-800' },
    agendado: { label: 'Agendados', color: 'bg-blue-100 text-blue-800' },
    concluido: { label: 'Concluídos', color: 'bg-green-100 text-green-800' },
    cancelado: { label: 'Cancelados', color: 'bg-red-50 text-red-800' }
};

export default function KanbanPage() {
    const [leads, setLeads] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newLead, setNewLead] = useState({
        nome: '',
        whatsapp: '',
        email: '',
        service_name: '',
        professional_id: '',
        appointment_date: '',
        appointment_time: '',
        mensagem_interesse: ''
    });

    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
    const [draggedLeadId, setDraggedLeadId] = useState(null);

    const [whatsappModal, setWhatsappModal] = useState(null); // { isOpen: false, lead: null, type: '' }

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('leads')
            .select('*, professionals(name)')
            .order('created_at', { ascending: false });

        if (!error) {
            setLeads(data);
        }
        setLoading(false);
    };

    const fetchProfessionals = async () => {
        const { data } = await supabase.from('professionals').select('id, name');
        if (data) setProfessionals(data);
    };

    useEffect(() => {
        fetchLeads();
        fetchProfessionals();
    }, []);

    // Calcula telefones recorrentes (mais de 1 agendamento)
    const getRecurringPhones = () => {
        const phoneCounts = {};
        leads.forEach(lead => {
            const phone = lead.whatsapp?.replace(/\D/g, '');
            if (phone) {
                phoneCounts[phone] = (phoneCounts[phone] || 0) + 1;
            }
        });

        const recurring = new Set();
        Object.keys(phoneCounts).forEach(phone => {
            if (phoneCounts[phone] > 1) recurring.add(phone);
        });
        return recurring;
    };
    const recurringPhones = getRecurringPhones();

    const isRecurring = (whatsapp) => {
        const phone = whatsapp?.replace(/\D/g, '');
        return phone && recurringPhones.has(phone);
    };

    const updateStatus = async (id, newStatus) => {
        const { error } = await supabase
            .from('leads')
            .update({ status_kanban: newStatus })
            .eq('id', id);

        if (!error) {
            const updatedLeads = leads.map(lead => lead.id === id ? { ...lead, status_kanban: newStatus } : lead);
            setLeads(updatedLeads);

            // Trigger WhatsApp Modal Logic
            const lead = leads.find(l => l.id === id);
            if (['agendado', 'concluido', 'cancelado'].includes(newStatus)) {
                setWhatsappModal({ isOpen: true, lead: lead, type: newStatus, newStatus: newStatus });
            }
        }
    };



    const handleSendWhatsApp = () => {
        if (!whatsappModal?.lead) return;

        const { lead, type } = whatsappModal;
        const phone = lead.whatsapp?.replace(/\D/g, '');
        if (!phone) return alert('Lead sem WhatsApp cadastrado.');

        let message = '';
        const name = lead.nome.split(' ')[0];
        const date = lead.appointment_date ? new Date(lead.appointment_date + 'T00:00:00').toLocaleDateString() : 'data a definir';
        const time = lead.appointment_time || 'horário a definir';
        const service = lead.service_name || 'atendimento';

        if (type === 'agendado') {
            message = `Olá *${name}*, tudo bem? Passando para confirmar seu agendamento de *${service}* para o dia *${date}* às *${time}*. Estamos ansiosos para recebê-lo(a)! 🗓️`;
        } else if (type === 'concluido') {
            message = `Olá *${name}*! Esperamos que tenha gostado da sua experiência no SpaSmooth. 🌟 Poderia nos contar como foi? Seu feedback é muito importante para nós!`;
        } else if (type === 'cancelado') {
            message = `Poxa *${name}*, vimos que seu agendamento foi cancelado. Deseja reagendar para outro dia? Não deixe de tirar esse tempo para você! 🙌`;
        }

        const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        setWhatsappModal(null);
    };

    const getLeadsByStatus = (status) => leads.filter(lead => (lead.status_kanban || 'novo') === status);

    const [selectedLead, setSelectedLead] = useState(null);
    const [note, setNote] = useState('');

    const handleDeleteLead = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) return;

        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir lead.');
        } else {
            setLeads(leads.filter(lead => lead.id !== id));
            if (selectedLead?.id === id) setSelectedLead(null);
        }
    };

    const handleCardClick = (lead) => {
        setSelectedLead(lead);
        setNote(lead.admin_notes || '');
    };

    const saveNote = async () => {
        if (!selectedLead) return;
        const { error } = await supabase
            .from('leads')
            .update({ admin_notes: note })
            .eq('id', selectedLead.id);

        if (!error) {
            setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, admin_notes: note } : l));
            alert('Nota salva!');
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e, leadId) => {
        setDraggedLeadId(leadId);
        e.dataTransfer.effectAllowed = 'move';
        // Hide ghost image by creating empty element or styling
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        if (draggedLeadId) {
            updateStatus(draggedLeadId, newStatus);
            setDraggedLeadId(null);
        }
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        if (!newLead.nome || !newLead.whatsapp) return alert('Nome e WhatsApp são obrigatórios!');

        const { data, error } = await supabase
            .from('leads')
            .insert([{
                ...newLead,
                status_kanban: 'novo',
                professional_id: newLead.professional_id || null // Ensure null if empty string
            }])
            .select();

        if (error) {
            console.error(error);
            alert('Erro ao criar lead: ' + error.message);
        } else {
            alert('Lead criado com sucesso!');
            setIsCreating(false);
            setNewLead({ nome: '', whatsapp: '', email: '', service_name: '', professional_id: '', appointment_date: '', appointment_time: '', mensagem_interesse: '' });
            fetchLeads(); // Refresh list
        }
    };

    return (
        <div className="min-h-screen relative animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Gestão de Leads</h1>
                    <p className="text-slate-500 mt-2 font-light">Organize e acompanhe seus atendimentos.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl mr-2 border border-slate-200 shadow-inner">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <KanbanSquare size={18} /> Kanban
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutList size={18} /> Todos
                        </button>
                    </div>

                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-3 bg-slate-800 text-white shadow-sm rounded-xl hover:shadow-md hover:bg-slate-700 transition-all flex items-center gap-2 font-bold px-5"
                    >
                        <Plus size={20} /> Novo Lead
                    </button>
                    <button
                        onClick={fetchLeads}
                        className="p-3 bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm rounded-xl hover:shadow-md hover:scale-105 transition-all text-cyan-700"
                        title="Atualizar lista"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {viewMode === 'kanban' ? (
                <div className="flex overflow-x-auto gap-8 pb-12 custom-scrollbar snap-x snap-mandatory">
                    {Object.entries(COLUMNS).map(([statusKey, config]) => (
                        <div
                            key={statusKey}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, statusKey)}
                            className={`min-w-[350px] shrink-0 snap-center bg-white/60 backdrop-blur-md rounded-3xl p-5 h-auto border-2 ${draggedLeadId ? 'border-dashed border-cyan-300 transition-colors' : 'border-white/50 border-solid shadow-sm'} flex flex-col max-h-[calc(100vh-200px)]`}
                        >
                            {/* Column Header */}
                            <div className={`flex items-center justify-between mb-6 p-4 rounded-2xl ${config.color} bg-opacity-80 backdrop-blur-sm shadow-sm`}>
                                <span className="font-bold tracking-wide text-xs uppercase">{config.label}</span>
                                <span className="bg-white/60 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                                    {getLeadsByStatus(statusKey).length}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                                {getLeadsByStatus(statusKey).map(lead => (
                                    <div
                                        key={lead.id}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, lead.id)}
                                        onClick={() => handleCardClick(lead)}
                                        className="group bg-white/95 p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-transparent hover:border-cyan-200 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] transition-all duration-300 cursor-grab active:cursor-grabbing relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-cyan-400 transition-colors"></div>

                                        <div className="pl-2">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-lg leading-tight flex items-center gap-2">
                                                        {lead.nome}
                                                        {isRecurring(lead.whatsapp) && (
                                                            <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shadow-sm border border-amber-200" title="Cliente Recorrente">
                                                                💎 Repete
                                                            </span>
                                                        )}
                                                    </h4>
                                                    {lead.professionals?.name && (
                                                        <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-slate-500">
                                                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                                            {lead.professionals.name}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                                                    {new Date(lead.created_at).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                                                </span>
                                            </div>

                                            {lead.service_name ? (
                                                <div className="mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100/50">
                                                    <p className="text-sm font-semibold text-slate-700 truncate">{lead.service_name}</p>
                                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                        📅 {new Date(lead.appointment_date + 'T00:00:00').toLocaleDateString()} at {lead.appointment_time}
                                                    </p>
                                                </div>
                                            ) : (
                                                lead.mensagem_interesse && (
                                                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 bg-slate-50/50 p-3 rounded-xl italic font-serif border border-slate-100/50">
                                                        "{lead.mensagem_interesse}"
                                                    </p>
                                                )
                                            )}

                                            <div className="flex items-center justify-between pt-3" onClick={e => e.stopPropagation()}>
                                                <a
                                                    href={`https://wa.me/55${lead.whatsapp?.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    className="text-[#25D366] hover:bg-green-50 p-2 rounded-full transition-colors flex items-center gap-2 text-xs font-bold relative group/wa"
                                                    title="WhatsApp"
                                                >
                                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                </a>

                                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                                    <span className="font-medium text-slate-700">📱 {lead.whatsapp}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const phone = lead.whatsapp.replace(/\D/g, '');
                                                            const message = encodeURIComponent(`Olá ${lead.nome}, confirmando seu agendamento no SpaSmooth:\n\n💆‍♀️ *${lead.service_name}*\n📅 *${new Date(lead.appointment_date + 'T00:00:00').toLocaleDateString()}* às *${lead.appointment_time}*\n\nEstamos te esperando! ✨`);
                                                            window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
                                                        }}
                                                        className="p-1 hover:bg-green-50 rounded-full text-green-600 transition-colors"
                                                        title="Enviar Confirmação no WhatsApp"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => handleDeleteLead(e, lead.id)}
                                                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                                        title="Excluir Lead"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <StatusDropdown
                                                        currentStatus={lead.status_kanban || 'novo'}
                                                        onStatusChange={(newStatus) => updateStatus(lead.id, newStatus)}
                                                        options={Object.entries(COLUMNS).map(([key, col]) => ({ value: key, label: col.label }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {getLeadsByStatus(statusKey).length === 0 && (
                                    <div className="text-center py-12 flex flex-col items-center justify-center opacity-40 border-2 border-dashed border-slate-300 rounded-2xl">
                                        <div className="w-12 h-12 bg-slate-200 rounded-full mb-3 blur-sm"></div>
                                        <p className="text-slate-500 text-sm font-medium">Arraste para cá</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                                    <th className="p-4 pl-6">Cliente</th>
                                    <th className="p-4">Contato</th>
                                    <th className="p-4">Serviço/Interesse</th>
                                    <th className="p-4">Data/Hora</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {leads.map(lead => (
                                    <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => handleCardClick(lead)}>
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-800">{lead.nome}</p>
                                                {isRecurring(lead.whatsapp) && (
                                                    <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shadow-sm border border-amber-200" title="Cliente Recorrente">
                                                        💎 Repete
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400">{new Date(lead.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium text-slate-700">{lead.whatsapp}</p>
                                            <p className="text-xs text-slate-400 truncate w-32">{lead.email || '-'}</p>
                                        </td>
                                        <td className="p-4">
                                            {lead.service_name ? (
                                                <div>
                                                    <p className="font-medium text-slate-700">{lead.service_name}</p>
                                                    <p className="text-xs text-slate-500">{lead.professionals?.name || 'Qualquer Prof.'}</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs italic text-slate-500 truncate w-40">"{lead.mensagem_interesse}"</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {lead.appointment_date ? (
                                                <div>
                                                    <p className="font-medium text-slate-700">{new Date(lead.appointment_date + 'T00:00:00').toLocaleDateString()}</p>
                                                    <p className="text-xs text-slate-500">{lead.appointment_time}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${COLUMNS[lead.status_kanban || 'novo']?.color}`}>
                                                {COLUMNS[lead.status_kanban || 'novo']?.label}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`https://wa.me/55${lead.whatsapp?.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    className="p-2 text-[#25D366] hover:bg-green-50 rounded-full transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <MessageCircle size={18} />
                                                </a>
                                                <button
                                                    onClick={(e) => handleDeleteLead(e, lead.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center p-12 text-slate-500 font-medium">Nenhum lead encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Lead Details Modal - Premium Design */}
            {selectedLead && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300" onClick={() => setSelectedLead(null)}>
                    <div className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto animate-slideInRight flex flex-col" onClick={e => e.stopPropagation()}>

                        {/* Modal Header with Gradient */}
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h2 className="text-3xl font-serif font-bold mb-1">{selectedLead.nome}</h2>
                                    <p className="text-cyan-100 text-sm font-medium flex items-center gap-2">
                                        <MessageCircle size={14} /> {selectedLead.whatsapp}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedLead(null)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">✕</button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8 flex-1">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email</label>
                                    <p className="text-slate-800 font-medium text-sm truncate">{selectedLead.email || 'Não informado'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Status Atual</label>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${COLUMNS[selectedLead.status_kanban]?.color}`}>
                                        {COLUMNS[selectedLead.status_kanban]?.label}
                                    </span>
                                </div>
                            </div>

                            {selectedLead.service_name ? (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-100/50 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-full blur-xl -mr-5 -mt-5"></div>

                                    <h3 className="text-amber-900 font-bold mb-4 flex items-center gap-2 relative z-10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Detalhes do Agendamento
                                    </h3>

                                    <div className="space-y-4 relative z-10">
                                        <div>
                                            <label className="text-amber-800/60 text-xs font-bold uppercase">Serviço</label>
                                            <p className="text-amber-900 font-serif text-lg leading-tight">{selectedLead.service_name}</p>
                                        </div>

                                        <div className="flex gap-4 border-t border-amber-200/30 pt-4">
                                            <div>
                                                <label className="text-amber-800/60 text-xs font-bold uppercase">Profissional</label>
                                                <p className="text-amber-900 font-medium">{selectedLead.professionals?.name || '---'}</p>
                                            </div>
                                            <div>
                                                <label className="text-amber-800/60 text-xs font-bold uppercase">Data & Hora</label>
                                                <p className="text-amber-900 font-medium">
                                                    {new Date(selectedLead.appointment_date + 'T00:00:00').toLocaleDateString()} às {selectedLead.appointment_time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-cyan-50 p-6 rounded-3xl border border-cyan-100 relative">
                                    <label className="text-xs font-bold text-cyan-700 uppercase mb-2 block tracking-widest">Mensagem de Interesse</label>
                                    <p className="text-slate-700 italic font-serif leading-relaxed">"{selectedLead.mensagem_interesse}"</p>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anotações Internas</label>
                                    <span className="text-[10px] text-slate-300">Privado</span>
                                </div>
                                <textarea
                                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all resize-none"
                                    placeholder="Escreva observações sobre este lead..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={saveNote}
                                        className="text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-lg shadow-slate-200"
                                    >
                                        Salvar Anotação
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            <a
                                href={`https://wa.me/55${selectedLead.whatsapp?.replace(/\D/g, '')}`}
                                target="_blank"
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5"
                            >
                                <MessageCircle size={20} /> Iniciar Conversa
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Lead Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsCreating(false)}>
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scaleIn relative" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
                            <h2 className="text-2xl font-serif font-bold text-slate-800">Novo Agendamento Manual</h2>
                            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleCreateLead} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome do Cliente *</label>
                                    <input
                                        required
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                        placeholder="Ex: Maria Oliveira"
                                        value={newLead.nome}
                                        onChange={e => setNewLead({ ...newLead, nome: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">WhatsApp *</label>
                                    <input
                                        required
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                        placeholder="Ex: 11999999999"
                                        value={newLead.whatsapp}
                                        onChange={e => setNewLead({ ...newLead, whatsapp: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Serviço de Interesse</label>
                                <input
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                    placeholder="Ex: Massagem Relaxante"
                                    value={newLead.service_name}
                                    onChange={e => setNewLead({ ...newLead, service_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Profissional</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 bg-white"
                                        value={newLead.professional_id}
                                        onChange={e => setNewLead({ ...newLead, professional_id: e.target.value })}
                                    >
                                        <option value="">Qualquer / Indefinido</option>
                                        {professionals.map(pro => (
                                            <option key={pro.id} value={pro.id}>{pro.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Data</label>
                                    <input
                                        type="date"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                        value={newLead.appointment_date}
                                        onChange={e => setNewLead({ ...newLead, appointment_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Horário</label>
                                    <input
                                        type="time"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                        value={newLead.appointment_time}
                                        onChange={e => setNewLead({ ...newLead, appointment_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Observações / Mensagem</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 h-24 resize-none"
                                    placeholder="Alguma observação inicial?"
                                    value={newLead.mensagem_interesse}
                                    onChange={e => setNewLead({ ...newLead, mensagem_interesse: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                                <button type="submit" className="px-8 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200 transition-all">Criar Agendamento</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* WhatsApp Prompt Modal */}
            {whatsappModal?.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-white/50 animate-scaleIn text-center">
                        <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Enviar Mensagem?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            O status mudou para <span className="font-bold text-slate-700 uppercase">{COLUMNS[whatsappModal.type]?.label}</span>. Deseja enviar a mensagem padrão para o cliente?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setWhatsappModal(null)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Não
                            </button>
                            <button
                                onClick={handleSendWhatsApp}
                                className="flex-1 py-3 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={18} /> Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
