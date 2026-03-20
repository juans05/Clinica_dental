import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Edit2, Power, Plus, X, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const emptyForm = { name: '', address: '', phone: '' };

const BranchesView = ({ onRefresh }) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const res = await api.get('branches');
            setBranches(res.data);
            // No llamar a onRefresh aquí durante el montaje inicial para evitar bucle infinito con Settings.jsx
        } catch (error) {
            console.error('Error fetching branches:', error);
        } finally {
            setLoading(false);
        }
                                                                                                                                                                                                                                                                                                                                                                                    };

                                                                                                                                                                                                                                                                                                                                                                                    const handleSave = async (e) => {
                                                                                                                                                                                                                                                                                                                                                                                        e.preventDefault();
                                                                                                                                                                                                                                                                                                                                                                                        setSaving(true);
        try {
            if (editingItem) {
                await api.put(`branches/${editingItem.id}`, form);
            } else {
                await api.post('branches', form);
            }
            setShowModal(false);
            fetchBranches();
            if (onRefresh) onRefresh(); // Notificar a los padres solo cuando hay un cambio real
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message;
            alert('Error al guardar sede: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (item) => {
        const action = item.active ? 'desactivar' : 'activar';
        if (!window.confirm(`¿Está seguro de ${action} este registro?`)) return;
        try {
            await api.put(`branches/${item.id}`, { ...item, active: !item.active });
            fetchBranches();
            if (onRefresh) onRefresh();
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert(`Error al ${action}: ` + msg);
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        setForm(item ? { name: item.name, address: item.address || '', phone: item.phone || '' } : { name: '', address: '', phone: '' });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Sedes / Sucursales</h3>
                <button onClick={() => openModal()} className="premium-button-primary py-2.5 px-6">
                    <Plus size={18} /> Nueva Sede
                </button>
            </div>

            <div className="glass-card rounded-[32px] overflow-hidden border border-white/40 shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 uppercase">Denominación / Sede</th>
                                <th className="px-8 py-6 uppercase">Contacto / Dirección</th>
                                <th className="px-8 py-6 uppercase">Estado</th>
                                <th className="px-8 py-6 text-right uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <Loader2 className="animate-spin text-cyan-500 w-10 h-10 mx-auto" />
                                    </td>
                                </tr>
                            ) : branches.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black">
                                                <Building2 size={20} />
                                            </div>
                                            <span className="font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs space-y-1">
                                            <p className="font-bold text-slate-600"><MapPin size={12} className="inline mr-1 text-slate-400" /> {item.address || 'Sin dirección'}</p>
                                            <p className="text-slate-400 font-medium"><Phone size={12} className="inline mr-1 text-slate-300" /> {item.phone || 'Sin teléfono'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            item.active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                            {item.active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(item)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all">
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
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingItem ? 'Editar' : 'Nueva'} Sede</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Sede</label>
                                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. Miraflores Centro" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección</label>
                                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. Calle Las Lilas 456" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. +51 987 654 321" />
                            </div>
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Cancelar</button>
                                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    {editingItem ? 'Actualizar Sede' : 'Crear Sede'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default BranchesView;
