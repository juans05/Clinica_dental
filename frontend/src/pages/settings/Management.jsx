import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, UserPlus, Building2, Edit2, Plus,
    CheckCircle, X, Shield, Phone, Mail, Power,
    Activity, Clock, Save, Loader2, CalendarOff,
    FileText, Trash2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// ── Días de la semana ────────────────────────────────────────────────────────
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ── Panel de configuración de horarios ──────────────────────────────────────
const SchedulePanel = ({ doctors, branches }) => {
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [saved, setSaved] = useState(false);

    const loadSchedule = useCallback(async () => {
        if (!selectedDoctor || !selectedBranch) return;
        setLoadingSchedule(true);
        try {
            const res = await api.get(`schedule?doctorId=${selectedDoctor}&branchId=${selectedBranch}`);
            setSchedule(res.data);
        } catch (e) {
            console.error('Error loading schedule:', e);
        } finally {
            setLoadingSchedule(false);
        }
    }, [selectedDoctor, selectedBranch]);

    useEffect(() => { loadSchedule(); }, [loadSchedule]);

    const toggleDay = (dayOfWeek) => {
        setSchedule(s => s.map(d => d.dayOfWeek === dayOfWeek ? { ...d, active: !d.active } : d));
    };

    const setTime = (dayOfWeek, field, value) => {
        setSchedule(s => s.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d));
    };

    const handleSave = async () => {
        if (!selectedDoctor || !selectedBranch) return;
        setSaving(true);
        try {
            await api.post('schedule', { doctorId: selectedDoctor, branchId: selectedBranch, days: schedule });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            alert('Error al guardar horario: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Médico</label>
                    <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="premium-input bg-white border-slate-200">
                        <option value="">Seleccionar médico...</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede</label>
                    <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="premium-input bg-white border-slate-200">
                        <option value="">Seleccionar sede...</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Grid de horarios */}
            {!selectedDoctor || !selectedBranch ? (
                <div className="h-48 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                    <div className="text-center">
                        <Clock size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-bold">Selecciona un médico y una sede</p>
                    </div>
                </div>
            ) : loadingSchedule ? (
                <div className="h-48 flex items-center justify-center">
                    <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
                </div>
            ) : (
                <div className="space-y-3">
                    {schedule.map(day => (
                        <div key={day.dayOfWeek}
                            className={cn(
                                'flex items-center gap-4 p-4 rounded-2xl border transition-all',
                                day.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                            )}
                        >
                            {/* Toggle */}
                            <button
                                onClick={() => toggleDay(day.dayOfWeek)}
                                className={cn(
                                    'relative w-10 h-6 rounded-full transition-colors shrink-0',
                                    day.active ? 'bg-cyan-500' : 'bg-slate-200'
                                )}
                            >
                                <span className={cn(
                                    'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all',
                                    day.active ? 'left-5' : 'left-1'
                                )} />
                            </button>

                            {/* Día */}
                            <span className="w-20 text-xs font-black text-slate-700 uppercase tracking-wider">
                                {DAY_NAMES[day.dayOfWeek]}
                            </span>

                            {/* Horas */}
                            <div className="flex items-center gap-3 flex-1">
                                <input
                                    type="time"
                                    value={day.startTime}
                                    onChange={e => setTime(day.dayOfWeek, 'startTime', e.target.value)}
                                    disabled={!day.active}
                                    className="premium-input bg-slate-50 border-slate-200 py-2 text-sm w-32 disabled:opacity-40"
                                />
                                <span className="text-slate-400 text-xs font-bold">a</span>
                                <input
                                    type="time"
                                    value={day.endTime}
                                    onChange={e => setTime(day.dayOfWeek, 'endTime', e.target.value)}
                                    disabled={!day.active}
                                    className="premium-input bg-slate-50 border-slate-200 py-2 text-sm w-32 disabled:opacity-40"
                                />
                            </div>

                            {!day.active && (
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <CalendarOff size={12} /> Libre
                                </span>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <CheckCircle size={16} className="text-emerald-400" /> : <Save size={16} />}
                        {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar Horario'}
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Panel de configuración de series por sede ────────────────────────────────
const SeriesPanel = ({ branches }) => {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ branchId: '', type: 'BOLETA', serie: '' });
    const [saving, setSaving] = useState(false);

    const loadSeries = async () => {
        setLoading(true);
        try {
            const res = await api.get('billing/invoice-series');
            setSeries(res.data);
        } catch (e) {
            console.error('Error loading invoice series:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSeries(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.branchId || !form.serie.trim()) return;
        setSaving(true);
        try {
            await api.post('billing/invoice-series', form);
            setShowForm(false);
            setForm({ branchId: '', type: 'BOLETA', serie: '' });
            loadSeries();
        } catch (err) {
            alert('Error al guardar serie: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta serie? Los comprobantes ya emitidos no se verán afectados.')) return;
        try {
            await api.delete(`billing/invoice-series/${id}`);
            loadSeries();
        } catch (err) {
            alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
        }
    };

    // Derive next correlativo preview for a serie
    const getPreview = (serieCode) => `${serieCode}-${String(1).padStart(8, '0')}`;

    return (
        <div className="space-y-6">
            {/* Header & add button */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400 font-medium">
                        Configura el prefijo de serie para cada sede. El correlativo se asigna automáticamente.
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1">
                        Ejemplo: Sede San Miguel Boleta → <span className="font-mono font-bold text-cyan-500">SM1</span> → SM1-00000001, SM1-00000002…
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-800/20 active:scale-95 transition-all whitespace-nowrap"
                >
                    <Plus size={16} /> Nueva Serie
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 border border-slate-200 rounded-3xl p-6"
                >
                    <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede</label>
                            <select
                                required
                                value={form.branchId}
                                onChange={e => setForm({ ...form, branchId: e.target.value })}
                                className="premium-input bg-white border-slate-200"
                            >
                                <option value="">Seleccionar sede...</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                                className="premium-input bg-white border-slate-200"
                            >
                                <option value="BOLETA">Boleta</option>
                                <option value="FACTURA">Factura</option>
                                <option value="NC_BOLETA">Nota de Crédito Boleta</option>
                                <option value="NC_FACTURA">Nota de Crédito Factura</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Código de Serie <span className="text-slate-300 normal-case">(ej: SM1, B001)</span>
                            </label>
                            <input
                                required
                                type="text"
                                value={form.serie}
                                onChange={e => setForm({ ...form, serie: e.target.value.toUpperCase() })}
                                className="premium-input bg-white border-slate-200 font-mono"
                                placeholder="Ej: SM1"
                                maxLength={10}
                            />
                        </div>
                        {form.serie && (
                            <div className="sm:col-span-3 flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-100 rounded-2xl">
                                <FileText size={14} className="text-cyan-500" />
                                <span className="text-xs text-cyan-700 font-medium">
                                    El primer comprobante será: <span className="font-mono font-black">{getPreview(form.serie)}</span>
                                </span>
                            </div>
                        )}
                        <div className="sm:col-span-3 flex gap-3 justify-end pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-60">
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                {saving ? 'Guardando...' : 'Guardar Serie'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Table */}
            {loading ? (
                <div className="h-32 flex items-center justify-center">
                    <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
                </div>
            ) : series.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                    <div className="text-center">
                        <FileText size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-bold">Sin series configuradas</p>
                        <p className="text-xs mt-1">Se usarán B001 / F001 por defecto</p>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Sede</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Serie</th>
                                <th className="px-6 py-4">Formato</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {series.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                                                <Building2 size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{s.branch?.name || `Sede #${s.branchId}`}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border',
                                            s.type === 'FACTURA' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                s.type === 'BOLETA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    s.type === 'NC_FACTURA' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-rose-50 text-rose-600 border-rose-100'
                                        )}>
                                            {s.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-black text-slate-800 text-sm">{s.serie}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-500">{s.serie}-00000001, {s.serie}-00000002…</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            title="Eliminar serie"
                                            className="opacity-0 group-hover:opacity-100 p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    <strong>Importante:</strong> La sede debe tener series configuradas para poder emitir comprobantes.
                    Si no hay series, el sistema impedirá la generación del documento para evitar errores correlativos.
                    Las series de Nota de Crédito (NC) deben empezar con <span className="font-mono font-black">B</span> para boletas y <span className="font-mono font-black">F</span> para facturas (Ej: BNC1, FNC1).
                </p>
            </div>
        </div>
    );
};

const Management = () => {
    const { user: currentUser } = useAuth();
    const [branches, setBranches] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [consultories, setConsultories] = useState([]);
    const [activeTab, setActiveTab] = useState('BRANCHES');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form States
    const [branchForm, setBranchForm] = useState({ name: '', address: '', phone: '' });
    const [doctorForm, setDoctorForm] = useState({ name: '', email: '', password: '', role: 'DENTIST', branchId: '' });
    const [consultoryForm, setConsultoryForm] = useState({ name: '', branchId: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bRes, dRes, cRes] = await Promise.all([
                api.get('branches'),
                api.get('auth/users?role=DENTIST'),
                api.get('consultories')
            ]);
            setBranches(bRes.data);
            setDoctors(dRes.data);
            setConsultories(cRes.data);
        } catch (error) {
            console.error('Error fetching management data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBranch = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`branches/${editingItem.id}`, branchForm);
            } else {
                await api.post('branches', branchForm);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message;
            alert('Error al guardar sede: ' + msg);
        }
    };

    const handleSaveDoctor = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`auth/users/${editingItem.id}`, doctorForm);
            } else {
                await api.post('auth/register', { ...doctorForm, companyId: currentUser.companyId });
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message;
            alert('Error al guardar doctor: ' + msg);
        }
    };

    const handleSaveConsultory = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.patch(`consultories/${editingItem.id}`, consultoryForm);
            } else {
                await api.post('consultories', consultoryForm);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message;
            alert('Error al guardar consultorio: ' + msg);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('¿Está seguro de desactivar este registro?')) return;
        try {
            if (type === 'BRANCH') await api.delete(`branches/${id}`);
            else if (type === 'DOCTOR') await api.delete(`auth/users/${id}`);
            else if (type === 'CONSULTORY') await api.patch(`consultories/${id}`, { active: false });
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert('Error al desactivar: ' + msg);
        }
    };

    const handleToggleActive = async (type, item) => {
        const action = item.active ? 'desactivar' : 'activar';
        if (!window.confirm(`¿Está seguro de ${action} este registro?`)) return;
        try {
            if (type === 'BRANCH') {
                await api.put(`branches/${item.id}`, { ...item, active: !item.active });
            } else {
                await api.put(`auth/users/${item.id}`, { active: !item.active });
            }
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert(`Error al ${action}: ` + msg);
        }
    };

    const openModal = (type, item = null) => {
        setEditingItem(item);
        if (type === 'BRANCH') {
            setBranchForm(item ? { name: item.name, address: item.address || '', phone: item.phone || '' } : { name: '', address: '', phone: '' });
        } else if (type === 'DOCTOR') {
            setDoctorForm(item ? { name: item.name, email: item.email, role: item.role, branchId: item.branchId || '' } : { name: '', email: '', password: '', role: 'DENTIST', branchId: '' });
        } else {
            setConsultoryForm(item ? { name: item.name, branchId: item.branchId } : { name: '', branchId: '' });
        }
        setShowModal(true);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuración Administrativa</span>
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Gestión de Clínica</h1>
                </div>

                {activeTab !== 'SCHEDULES' && activeTab !== 'SERIES' && (
                    <button
                        onClick={() => {
                            const type = activeTab === 'BRANCHES' ? 'BRANCH' : (activeTab === 'DOCTORS' ? 'DOCTOR' : 'CONSULTORY');
                            openModal(type);
                        }}
                        className="premium-button-primary w-full md:w-auto"
                    >
                        <Plus size={20} /> {activeTab === 'BRANCHES' ? 'Nueva Sede' : (activeTab === 'DOCTORS' ? 'Nuevo Personal' : 'Nuevo Consultorio')}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 p-1.5 bg-slate-100 w-fit rounded-2xl border border-slate-200">
                <button
                    onClick={() => setActiveTab('BRANCHES')}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === 'BRANCHES' ? "bg-white text-cyan-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Building2 size={16} className="inline mr-2" /> Sedes / Sucursales
                </button>
                <button
                    onClick={() => setActiveTab('DOCTORS')}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === 'DOCTORS' ? "bg-white text-indigo-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Shield size={16} className="inline mr-2" /> Médicos & Personal
                </button>
                <button
                    onClick={() => setActiveTab('CONSULTORIES')}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === 'CONSULTORIES' ? "bg-white text-emerald-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Activity size={16} className="inline mr-2" /> Consultorios
                </button>
                <button
                    onClick={() => setActiveTab('SCHEDULES')}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === 'SCHEDULES' ? "bg-white text-violet-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Clock size={16} className="inline mr-2" /> Horarios
                </button>
                <button
                    onClick={() => setActiveTab('SERIES')}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === 'SERIES' ? "bg-white text-amber-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <FileText size={16} className="inline mr-2" /> Series
                </button>
            </div>

            {/* List Section */}
            {activeTab !== 'SCHEDULES' && activeTab !== 'SERIES' && (<div className="glass-card rounded-[32px] overflow-hidden border border-white/40 shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                {activeTab === 'BRANCHES' ? (
                                    <>
                                        <th className="px-8 py-6 uppercase">Denominación / Sede</th>
                                        <th className="px-8 py-6 uppercase">Contacto / Dirección</th>
                                        <th className="px-8 py-6 uppercase">Estado</th>
                                        <th className="px-8 py-6 text-right uppercase">Acciones</th>
                                    </>
                                ) : activeTab === 'DOCTORS' ? (
                                    <>
                                        <th className="px-8 py-6 uppercase">Médico / Especialista</th>
                                        <th className="px-8 py-6 uppercase">Acceso / Email</th>
                                        <th className="px-8 py-6 uppercase">Sede Asignada</th>
                                        <th className="px-8 py-6 text-right uppercase">Acciones</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-6 uppercase">Nombre Consultorio</th>
                                        <th className="px-8 py-6 uppercase">Sede</th>
                                        <th className="px-8 py-6 uppercase">Estado</th>
                                        <th className="px-8 py-6 text-right uppercase">Acciones</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : (activeTab === 'BRANCHES' ? branches : (activeTab === 'DOCTORS' ? doctors : consultories)).map(item => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-50/50 transition-all group"
                                >
                                    {activeTab === 'BRANCHES' ? (
                                        <>
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
                                        </>
                                    ) : activeTab === 'DOCTORS' ? (
                                        <>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm uppercase">
                                                        {item.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                                                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{item.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <Mail size={14} className="text-slate-300" /> {item.email}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <MapPin size={14} className="text-slate-300" /> {branches.find(b => b.id === item.branchId)?.name || 'Sin asignar'}
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
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
                                        </>
                                    )}
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    const type = activeTab === 'BRANCHES' ? 'BRANCH' : (activeTab === 'DOCTORS' ? 'DOCTOR' : 'CONSULTORY');
                                                    openModal(type, item);
                                                }}
                                                title="Editar"
                                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const type = activeTab === 'BRANCHES' ? 'BRANCH' : (activeTab === 'DOCTORS' ? 'DOCTOR' : 'CONSULTORY');
                                                    handleDelete(type, item.id);
                                                }}
                                                title={item.active ? 'Desactivar' : 'Activar'}
                                                className={cn(
                                                    "p-2 bg-white border rounded-lg transition-all",
                                                    item.active
                                                        ? "border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                                                        : "border-emerald-200 text-emerald-500 hover:bg-emerald-50"
                                                )}
                                            >
                                                <Power size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            {/* Horarios tab */}
            {activeTab === 'SCHEDULES' && (
                <div className="glass-card rounded-[32px] p-8 border border-white/40 shadow-xl shadow-slate-200/50">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-1">Horario de Trabajo</h3>
                        <p className="text-xs text-slate-400 font-medium">Configura los días y horarios en que cada médico atiende en cada sede. El sistema solo ofrecerá citas dentro de estos horarios.</p>
                    </div>
                    <SchedulePanel doctors={doctors} branches={branches} />
                </div>
            )}

            {/* Series tab */}
            {activeTab === 'SERIES' && (
                <div className="glass-card rounded-[32px] p-8 border border-white/40 shadow-xl shadow-slate-200/50">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-1">Series de Comprobantes</h3>
                        <p className="text-xs text-slate-400 font-medium">Asigna el prefijo de serie de facturación por sede para Boletas y Facturas.</p>
                    </div>
                    <SeriesPanel branches={branches} />
                </div>
            )}

            {/* Control Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-white/20">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                    {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'BRANCHES' ? 'Sede' : (activeTab === 'DOCTORS' ? 'Médico' : 'Consultorio')}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500"><X size={24} /></button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    if (activeTab === 'BRANCHES') handleSaveBranch(e);
                                    else if (activeTab === 'DOCTORS') handleSaveDoctor(e);
                                    else handleSaveConsultory(e);
                                }}
                                className="p-8 space-y-6"
                            >
                                {activeTab === 'BRANCHES' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Sede</label>
                                            <input required type="text" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. Miraflores Centro" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección</label>
                                            <input type="text" value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. Calle Las Lilas 456" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                            <input type="tel" value={branchForm.phone} onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. +51 987 654 321" />
                                        </div>
                                    </>
                                ) : activeTab === 'DOCTORS' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                            <input required type="text" value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} className="premium-input bg-slate-50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                            <input required type="email" value={doctorForm.email} onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })} className="premium-input bg-slate-50" />
                                        </div>
                                        {!editingItem && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña Inicial</label>
                                                <input required type="password" value={doctorForm.password} onChange={e => setDoctorForm({ ...doctorForm, password: e.target.value })} className="premium-input bg-slate-50" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol</label>
                                                <select value={doctorForm.role} onChange={e => setDoctorForm({ ...doctorForm, role: e.target.value })} className="premium-input bg-slate-50">
                                                    <option value="DENTIST">Médico / Dentista</option>
                                                    <option value="ADMIN">Administrador</option>
                                                    <option value="RECEPTIONIST">Recepción</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede Principal</label>
                                                <select required value={doctorForm.branchId} onChange={e => setDoctorForm({ ...doctorForm, branchId: e.target.value })} className="premium-input bg-slate-50">
                                                    <option value="">Seleccionar Sede...</option>
                                                    {branches.map(b => (
                                                        <option key={b.id} value={b.id}>{b.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Consultorio / Sillón</label>
                                            <input required type="text" value={consultoryForm.name} onChange={e => setConsultoryForm({ ...consultoryForm, name: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. Sillón 01, Consultorio Dental A" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede del Consultorio</label>
                                            <select required value={consultoryForm.branchId} onChange={e => setConsultoryForm({ ...consultoryForm, branchId: e.target.value })} className="premium-input bg-slate-50">
                                                <option value="">Seleccionar Sede...</option>
                                                {branches.map(b => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="pt-6 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-[2] py-4 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-800/20 active:scale-95 transition-all">
                                        <CheckCircle size={16} className="inline mr-2" /> {editingItem ? 'Actualizar' : 'Guardar Registro'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Management;
