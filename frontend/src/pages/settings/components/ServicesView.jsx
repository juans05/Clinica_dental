import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Power, X, Stethoscope, Tag, Clock, DollarSign, Loader2, CheckCircle, FlaskConical } from 'lucide-react';
import api from '../../../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import RecipeModal from './RecipeModal';

const cn = (...inputs) => twMerge(clsx(inputs));

const CATEGORIES = [
    { value: 'PREVENTIVO', label: 'Preventivo', color: 'emerald' },
    { value: 'RESTAURATIVO', label: 'Restaurativo', color: 'blue' },
    { value: 'ENDODONCIA', label: 'Endodoncia', color: 'purple' },
    { value: 'ORTODONCIA', label: 'Ortodoncia', color: 'indigo' },
    { value: 'CIRUGIA', label: 'Cirugía', color: 'rose' },
    { value: 'ESTETICO', label: 'Estético', color: 'amber' },
    { value: 'OTRO', label: 'Otro', color: 'slate' },
];

const CATEGORY_COLORS = {
    PREVENTIVO: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    RESTAURATIVO: 'bg-blue-50 text-blue-700 border-blue-100',
    ENDODONCIA: 'bg-purple-50 text-purple-700 border-purple-100',
    ORTODONCIA: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    CIRUGIA: 'bg-rose-50 text-rose-700 border-rose-100',
    ESTETICO: 'bg-amber-50 text-amber-700 border-amber-100',
    OTRO: 'bg-slate-50 text-slate-700 border-slate-100',
};

const emptyForm = { name: '', category: 'PREVENTIVO', description: '', price: '', duration: '30' };

const ServicesView = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [saving, setSaving] = useState(false);
    const [recipeService, setRecipeService] = useState(null); // { id, name }

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await api.get('services', { params: { active: true } });
            setServices(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const openModal = (item = null) => {
        setEditingItem(item);
        setForm(item ? { name: item.name, category: item.category, description: item.description || '', price: item.price, duration: item.duration } : emptyForm);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingItem) {
                await api.put(`services/${editingItem.id}`, form);
            } else {
                await api.post('services', form);
            }
            setShowModal(false);
            fetchServices();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (item) => {
        if (!window.confirm(`¿${item.active ? 'Desactivar' : 'Activar'} este servicio?`)) return;
        try {
            await api.put(`services/${item.id}`, { active: !item.active });
            fetchServices();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const filtered = filterCategory === 'ALL' ? services : services.filter(s => s.category === filterCategory);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Catálogo de Servicios</h3>
                <button onClick={() => openModal()} className="premium-button-primary py-2.5 px-6">
                    <Plus size={18} /> Nuevo Servicio
                </button>
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
                <button
                    onClick={() => setFilterCategory('ALL')}
                    className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        filterCategory === 'ALL' ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300")}
                >
                    Todos ({services.length})
                </button>
                {CATEGORIES.map(cat => {
                    const count = services.filter(s => s.category === cat.value).length;
                    if (count === 0) return null;
                    return (
                        <button
                            key={cat.value}
                            onClick={() => setFilterCategory(cat.value)}
                            className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                filterCategory === cat.value ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300")}
                        >
                            {cat.label} ({count})
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-card rounded-3xl p-6 animate-pulse bg-white/40 border border-white/60">
                            <div className="h-4 bg-slate-100 rounded w-3/4 mb-3"></div>
                            <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[40px] bg-slate-50/30">
                        <Stethoscope className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay servicios registrados</p>
                    </div>
                ) : filtered.map(service => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-[32px] p-6 border border-white/40 shadow-xl shadow-slate-200/40 group hover:shadow-2xl hover:-translate-y-1 transition-all bg-white"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", CATEGORY_COLORS[service.category] || CATEGORY_COLORS.OTRO)}>
                                {service.category}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setRecipeService({ id: service.id, name: service.name })} title="Configurar Receta"
                                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm">
                                    <FlaskConical size={13} />
                                </button>
                                <button onClick={() => openModal(service)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all shadow-sm">
                                    <Edit2 size={13} />
                                </button>
                                <button onClick={() => handleToggle(service)} title={service.active ? 'Desactivar' : 'Activar'}
                                    className={cn("p-2 bg-white border rounded-lg transition-all shadow-sm",
                                        service.active ? "border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200" : "border-emerald-200 text-emerald-500 hover:bg-emerald-50")}>
                                    <Power size={13} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-black text-slate-800 text-base uppercase tracking-tight leading-tight mb-1">{service.name}</h3>
                        {service.description && <p className="text-[11px] text-slate-400 font-medium mb-4 line-clamp-2 leading-relaxed">{service.description}</p>}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-emerald-600">
                                <DollarSign size={14} />
                                <span className="font-black text-lg">S/ {parseFloat(service.price).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                <Clock size={12} />
                                {service.duration} min
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-white/20">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingItem ? 'Editar' : 'Nuevo'} Servicio</h2>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-8 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Nombre del Procedimiento</label>
                                    <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="premium-input bg-slate-50" placeholder="Ej. Limpieza Dental Completa" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Categoría</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="premium-input bg-slate-50">
                                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Descripción</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="premium-input bg-slate-50 resize-none h-24" placeholder="Breve descripción..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Precio (S/)</label>
                                        <input required type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                                            className="premium-input bg-slate-50" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Duración (min)</label>
                                        <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="premium-input bg-slate-50">
                                            {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-6 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={saving} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                        {editingItem ? 'Actualizar' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Recipe Modal */}
            <RecipeModal
                open={!!recipeService}
                onClose={() => setRecipeService(null)}
                service={recipeService}
            />
        </div>
    );
};

export default ServicesView;
