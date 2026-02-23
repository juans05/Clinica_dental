import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, ChevronUp, ClipboardList, CheckCircle2, Loader2, Circle } from 'lucide-react';
import api from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const STATUS_CONFIG = {
    PENDING: { label: 'Pendiente', class: 'bg-slate-100 text-slate-600 border-slate-200', icon: Circle },
    IN_PROGRESS: { label: 'En Proceso', class: 'bg-blue-50 text-blue-600 border-blue-100', icon: Loader2 },
    COMPLETED: { label: 'Completado', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelado', class: 'bg-rose-50 text-rose-600 border-rose-100', icon: X },
};

const ITEM_STATUS = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const TreatmentPlans = ({ patientId, patientName }) => {
    const [plans, setPlans] = useState([]);
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPlan, setExpandedPlan] = useState(null);
    const [showNewPlan, setShowNewPlan] = useState(false);
    const [showAddItem, setShowAddItem] = useState(null); // planId
    const [newPlan, setNewPlan] = useState({ doctorId: '', notes: '' });
    const [newItem, setNewItem] = useState({ serviceId: '', toothNumber: '', price: '', notes: '' });

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const [plansRes, servicesRes, doctorsRes] = await Promise.all([
                api.get('treatments', { params: { patientId } }),
                api.get('services', { params: { active: true } }),
                api.get('auth/users'),
            ]);
            setPlans(plansRes.data);
            setServices(servicesRes.data);
            setDoctors(doctorsRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (patientId) fetchPlans(); }, [patientId]);

    const handleServiceChange = (serviceId) => {
        const svc = services.find(s => s.id === parseInt(serviceId));
        setNewItem(prev => ({ ...prev, serviceId, price: svc ? svc.price : '' }));
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        try {
            await api.post('treatments', { patientId, doctorId: newPlan.doctorId, notes: newPlan.notes });
            setShowNewPlan(false);
            setNewPlan({ doctorId: '', notes: '' });
            fetchPlans();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAddItem = async (e, planId) => {
        e.preventDefault();
        try {
            await api.post(`treatments/${planId}/items`, newItem);
            setShowAddItem(null);
            setNewItem({ serviceId: '', toothNumber: '', price: '', notes: '' });
            fetchPlans();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleItemStatus = async (itemId, status) => {
        try {
            await api.patch(`treatments/items/${itemId}`, { status });
            fetchPlans();
        } catch (err) {
            alert('Error al actualizar: ' + (err.response?.data?.message || err.message));
        }
    };

    const handlePlanStatus = async (planId, status) => {
        try {
            await api.patch(`treatments/${planId}`, { status });
            fetchPlans();
        } catch (err) {
            alert('Error al actualizar plan: ' + (err.response?.data?.message || err.message));
        }
    };

    const totalCost = (items) => items.reduce((acc, i) => acc + parseFloat(i.price || 0), 0);
    const completedCost = (items) => items.filter(i => i.status === 'COMPLETED').reduce((acc, i) => acc + parseFloat(i.price || 0), 0);

    if (loading) return (
        <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Planes de Tratamiento</h3>
                <button onClick={() => setShowNewPlan(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-colors">
                    <Plus size={14} /> Nuevo Plan
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl">
                    <ClipboardList className="mx-auto text-slate-200 mb-3" size={40} />
                    <p className="text-slate-400 text-sm font-bold">Sin planes de tratamiento</p>
                    <p className="text-slate-300 text-xs mt-1">Crea el primer plan para este paciente</p>
                </div>
            ) : plans.map(plan => {
                const PlanStatus = STATUS_CONFIG[plan.status] || STATUS_CONFIG.PENDING;
                const isExpanded = expandedPlan === plan.id;
                const total = totalCost(plan.items);
                const completed = completedCost(plan.items);

                return (
                    <motion.div key={plan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                        {/* Plan Header */}
                        <div className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                            onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <ClipboardList size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-sm">Dr. {plan.doctor?.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">
                                        {new Date(plan.createdAt).toLocaleDateString('es-PE')} · {plan.items.length} procedimiento{plan.items.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <p className="text-xs font-black text-slate-800">S/ {total.toFixed(2)}</p>
                                    <p className="text-[10px] text-emerald-600 font-bold">S/ {completed.toFixed(2)} completado</p>
                                </div>
                                <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border", PlanStatus.class)}>
                                    {PlanStatus.label}
                                </span>
                                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </div>
                        </div>

                        {/* Plan Items */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-slate-50">
                                    <div className="p-4 space-y-2">
                                        {plan.items.length === 0 && (
                                            <p className="text-xs text-slate-300 text-center py-4 font-bold">Sin ítems — agrega procedimientos</p>
                                        )}
                                        {plan.items.map(item => {
                                            const ItemStatus = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
                                            return (
                                                <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-50/60 rounded-xl group">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-black text-slate-800 text-xs">{item.service?.name}</p>
                                                            {item.toothNumber && (
                                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black border border-indigo-100">
                                                                    Pieza {item.toothNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.notes && <p className="text-[10px] text-slate-400 mt-0.5">{item.notes}</p>}
                                                    </div>
                                                    <span className="font-black text-slate-700 text-sm whitespace-nowrap">S/ {parseFloat(item.price).toFixed(2)}</span>
                                                    <select
                                                        value={item.status}
                                                        onChange={e => handleItemStatus(item.id, e.target.value)}
                                                        className={cn("text-[9px] font-black uppercase border rounded-lg px-2 py-1 focus:outline-none cursor-pointer", ItemStatus.class)}
                                                    >
                                                        {ITEM_STATUS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
                                                    </select>
                                                </div>
                                            );
                                        })}

                                        {/* Add Item */}
                                        {showAddItem === plan.id ? (
                                            <form onSubmit={e => handleAddItem(e, plan.id)} className="border border-dashed border-purple-200 rounded-xl p-3 space-y-3 bg-purple-50/30">
                                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Agregar Procedimiento</p>
                                                <select required value={newItem.serviceId} onChange={e => handleServiceChange(e.target.value)} className="premium-input bg-white text-sm">
                                                    <option value="">— Seleccionar servicio —</option>
                                                    {services.map(s => <option key={s.id} value={s.id}>{s.name} (S/ {s.price})</option>)}
                                                </select>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input type="text" placeholder="Pieza dental (FDI, ej. 21)" value={newItem.toothNumber}
                                                        onChange={e => setNewItem({ ...newItem, toothNumber: e.target.value })} className="premium-input bg-white text-sm" />
                                                    <input required type="number" step="0.01" placeholder="Precio (S/)" value={newItem.price}
                                                        onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="premium-input bg-white text-sm" />
                                                </div>
                                                <input type="text" placeholder="Notas (opcional)" value={newItem.notes}
                                                    onChange={e => setNewItem({ ...newItem, notes: e.target.value })} className="premium-input bg-white text-sm" />
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => setShowAddItem(null)} className="premium-button-secondary flex-1 py-2 text-xs">Cancelar</button>
                                                    <button type="submit" className="premium-button-primary flex-1 py-2 text-xs">Agregar</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button onClick={() => setShowAddItem(plan.id)}
                                                className="w-full py-3 border border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 hover:border-purple-300 hover:text-purple-500 transition-colors flex items-center justify-center gap-2">
                                                <Plus size={14} /> Agregar Procedimiento
                                            </button>
                                        )}

                                        {/* Plan Actions */}
                                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                                            {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
                                                <button key={s} onClick={() => handlePlanStatus(plan.id, s)}
                                                    disabled={plan.status === s}
                                                    className={cn("flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                                        plan.status === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300")}>
                                                    {STATUS_CONFIG[s]?.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}

            {/* New Plan Modal */}
            <AnimatePresence>
                {showNewPlan && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewPlan(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-md relative z-10 border border-white/20">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Nuevo Plan</h2>
                                <button onClick={() => setShowNewPlan(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreatePlan} className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doctor a Cargo</label>
                                    <select required value={newPlan.doctorId} onChange={e => setNewPlan({ ...newPlan, doctorId: e.target.value })} className="premium-input bg-slate-50">
                                        <option value="">— Seleccionar doctor —</option>
                                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.role})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observaciones Iniciales</label>
                                    <textarea value={newPlan.notes} onChange={e => setNewPlan({ ...newPlan, notes: e.target.value })}
                                        className="premium-input bg-slate-50 resize-none text-xs" rows={2} placeholder="Diagnóstico inicial..." />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowNewPlan(false)} className="premium-button-secondary flex-1">Cancelar</button>
                                    <button type="submit" className="premium-button-primary flex-1">Crear Plan</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TreatmentPlans;
