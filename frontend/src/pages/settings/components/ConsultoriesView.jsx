import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Building2, Edit2, Power, Plus, X, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const ConsultoriesView = ({ branches }) => {
    const [consultories, setConsultories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ name: '', branchId: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('consultories');
            setConsultories(res.data);
        } catch (error) {
            console.error('Error fetching consultories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingItem) {
                await api.patch(`consultories/${editingItem.id}`, form);
            } else {
                await api.post('consultories', form);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message;
            alert('Error al guardar consultorio: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (item) => {
        const action = item.active ? 'desactivar' : 'activar';
        if (!window.confirm(`¿Está seguro de ${action} este registro?`)) return;
        try {
            await api.patch(`consultories/${item.id}`, { active: !item.active });
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert(`Error al ${action}: ` + msg);
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        setForm(item ? { name: item.name, branchId: item.branchId } : { name: '', branchId: '' });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Consultorios</h3>
                <button onClick={() => openModal()} className="premium-button-primary py-2.5 px-6">
                    <Plus size={18} /> Nuevo Consultorio
                </button>
            </div>

            <div className="glass-card rounded-[32px] overflow-hidden border border-white/40 shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 uppercase">Nombre Consultorio</th>
                                <th className="px-8 py-6 uppercase">Sede</th>
                                <th className="px-8 py-6 uppercase">Estado</th>
                                <th className="px-8 py-6 text-right uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <Loader2 className="animate-spin text-emerald-500 w-10 h-10 mx-auto" />
                                    </td>
                                </tr>
                            ) : consultories.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                                                <Activity size={20} />
                                            </div>
                                            <span className="font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs font-bold text-slate-500">
                                            <Building2 size={14} className="inline mr-2 text-slate-300" />
                                            {branches.find(b => b.id === item.branchId)?.name || 'Sin sede'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            item.active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                            {item.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(item)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleToggleActive(item)} className={cn("p-2 bg-white border rounded-lg transition-all", item.active ? "border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200" : "border-emerald-200 text-emerald-500 hover:bg-emerald-50")}>
                                                <Power size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-white/20">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingItem ? 'Editar' : 'Nuevo'} Consultorio</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Consultorio</label>
                                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. Consultorio 01" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede</label>
                                <select required value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} className="premium-input bg-slate-50">
                                    <option value="">Seleccionar sede...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Cancelar</button>
                                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    {editingItem ? 'Actualizar Consultorio' : 'Crear Consultorio'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ConsultoriesView;
