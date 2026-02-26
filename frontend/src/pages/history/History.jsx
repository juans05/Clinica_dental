import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, User, Phone, Smartphone, Mail, Calendar, FileText,
    ChevronRight, ClipboardList, X, Clock, MapPin, Activity,
    AlertCircle, CheckCircle2, XCircle, Hourglass, Maximize2, Stethoscope
} from 'lucide-react';
import api from '../../services/api';
import TreatmentPlans from '../../components/TreatmentPlans';
import Odontograma from '../../components/Odontograma';
import AttendModal from '../../components/AttendModal';
import InitialTreatmentView from '../../components/InitialTreatmentView';
import { ErrorBoundary } from 'react-error-boundary';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const TABS = [
    { id: 'info', label: 'Información', icon: User },
    { id: 'appointments', label: 'Historial de Citas', icon: Calendar },
    { id: 'odontogram', label: 'Odontograma', icon: Activity },
    { id: 'treatments', label: 'Plan de Tratamiento', icon: ClipboardList },
];

const STATUS_CONFIG = {
    SCHEDULED: { label: 'Programada', class: 'bg-blue-50 text-blue-600 border-blue-100', icon: Hourglass },
    CONFIRMED: { label: 'Confirmada', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
    ATTENDED: { label: 'Atendida', class: 'bg-slate-50 text-slate-600 border-slate-200', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelada', class: 'bg-rose-50 text-rose-600 border-rose-100', icon: XCircle },
};

const URGENCY_CONFIG = {
    NORMAL: { label: 'Normal', class: 'bg-slate-100 text-slate-600' },
    URGENT: { label: 'Urgente', class: 'bg-amber-100 text-amber-700' },
    EMERGENCY: { label: 'Emergencia', class: 'bg-rose-100 text-rose-700' },
};

const getAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const History = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const [appointments, setAppointments] = useState([]);
    const [aptsLoading, setAptsLoading] = useState(false);
    const [showOdontogramModal, setShowOdontogramModal] = useState(false);
    const [odontogramPreview, setOdontogramPreview] = useState(null);
    const [odontogramPreviewLoading, setOdontogramPreviewLoading] = useState(false);
    const [attendTarget, setAttendTarget] = useState(null); // appointment being attended/edited
    const [viewTarget, setViewTarget] = useState(null);     // appointment being viewed (read-only)

    useEffect(() => {
        api.get('patients')
            .then(r => setPatients(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const fetchPatientAppointments = async (patientId) => {
        setAptsLoading(true);
        try {
            const res = await api.get('appointments');
            const filtered = res.data.filter(a => a.patientId === patientId);
            setAppointments(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (e) {
            console.error(e);
        } finally {
            setAptsLoading(false);
        }
    };

    const handleSelectPatient = (patient) => {
        setSelected(patient);
        setActiveTab('info');
        setOdontogramPreview(null);
        fetchPatientAppointments(patient.id);
        // Pre-fetch odontogram summary
        setOdontogramPreviewLoading(true);
        api.get(`odontograms/${patient.id}`)
            .then(r => setOdontogramPreview(r.data?.data || null))
            .catch(() => setOdontogramPreview(null))
            .finally(() => setOdontogramPreviewLoading(false));
    };

    const closeOdontogramModal = () => {
        setShowOdontogramModal(false);
        if (selected) {
            api.get(`odontograms/${selected.id}`)
                .then(r => setOdontogramPreview(r.data?.data || null))
                .catch(() => { });
        }
    };

    const filtered = patients.filter(p => {
        const q = search.toLowerCase();
        return (
            p.firstName?.toLowerCase().includes(q) ||
            p.paternalSurname?.toLowerCase().includes(q) ||
            p.maternalSurname?.toLowerCase().includes(q) ||
            p.documentId?.includes(q)
        );
    });

    return (
        <>
            {/* Header */}
            <div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Archivo Clínico Digital</span>
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Historias Clínicas</h1>
                <p className="text-sm text-slate-400 mt-2 font-medium">Expediente completo por paciente</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* ── Patient List Panel ─────────────────────────── */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/40 shadow-lg shadow-slate-100/50">
                    {/* Search */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar paciente o DNI..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-300 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Patient rows */}
                    <div className="overflow-y-auto max-h-[70vh]">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="p-4 border-b border-slate-50 animate-pulse flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-slate-100"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                                        <div className="h-2 bg-slate-50 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="p-8 text-center">
                                <User className="mx-auto text-slate-200 mb-3" size={36} />
                                <p className="text-slate-400 text-sm font-bold">No se encontraron pacientes</p>
                            </div>
                        ) : filtered.map(patient => {
                            const isActive = selected?.id === patient.id;
                            const fullName = `${patient.firstName} ${patient.paternalSurname}${patient.maternalSurname ? ' ' + patient.maternalSurname : ''}`;
                            const initials = `${patient.firstName?.[0] || ''}${patient.paternalSurname?.[0] || ''}`;
                            return (
                                <motion.button
                                    key={patient.id}
                                    onClick={() => handleSelectPatient(patient)}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "w-full p-4 border-b border-slate-50 flex items-center gap-3 text-left transition-all group",
                                        isActive ? "bg-indigo-50" : "hover:bg-slate-50/60"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0",
                                        isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("font-black text-sm truncate uppercase", isActive ? "text-indigo-800" : "text-slate-800")}>{fullName}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{patient.documentType}: {patient.documentId}</p>
                                    </div>
                                    <ChevronRight size={14} className={cn("shrink-0 transition-colors", isActive ? "text-indigo-400" : "text-slate-200 group-hover:text-slate-400")} />
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} paciente{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* ── Detail Panel ────────────────────────────────── */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {!selected ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="glass-card rounded-3xl p-16 text-center border border-white/40 shadow-lg shadow-slate-100/50">
                                <div className="h-24 w-24 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mx-auto mb-6">
                                    <FileText size={48} strokeWidth={1} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2">Selecciona un Paciente</h3>
                                <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                                    Elige un paciente de la lista para ver su expediente completo, historial de citas y plan de tratamiento.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div key={selected.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                                className="glass-card rounded-3xl overflow-hidden border border-white/40 shadow-lg shadow-slate-100/50">

                                {/* Patient Header */}
                                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                                                {selected.firstName?.[0]}{selected.paternalSurname?.[0]}
                                            </div>
                                            <div>
                                                <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                                                    {selected.firstName} {selected.paternalSurname} {selected.maternalSurname}
                                                </h2>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">{selected.documentType}: {selected.documentId}</span>
                                                    <span className="text-[10px] font-black text-slate-400">
                                                        {selected.birthDate ? `${getAge(selected.birthDate)} años` : '—'}
                                                    </span>
                                                    <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black border",
                                                        selected.active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100")}>
                                                        {selected.active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-rose-400 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-slate-100 bg-slate-50/30">
                                    {TABS.map(tab => {
                                        const Icon = tab.icon;
                                        return (
                                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2",
                                                    activeTab === tab.id
                                                        ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                                )}>
                                                <Icon size={14} />
                                                <span className="hidden md:inline">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'info' && (
                                            <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="space-y-6">
                                                {/* Contact */}
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Datos de Contacto</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {[
                                                            { icon: Smartphone, label: 'Celular', value: selected.phoneMobile },
                                                            { icon: Phone, label: 'Teléfono', value: selected.phoneHome },
                                                            { icon: Mail, label: 'Correo', value: selected.email },
                                                            { icon: MapPin, label: 'Dirección', value: selected.address },
                                                        ].map(({ icon: Icon, label, value }) => value && (
                                                            <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                                <div className="h-8 w-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                                    <Icon size={14} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                                                    <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Personal */}
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Datos Personales</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {[
                                                            { label: 'Género', value: selected.gender },
                                                            { label: 'Estado Civil', value: selected.civilStatus },
                                                            { label: 'Nacionalidad', value: selected.nationality },
                                                            { label: 'F. Nacimiento', value: selected.birthDate ? new Date(selected.birthDate).toLocaleDateString('es-PE') : '—' },
                                                        ].map(({ label, value }) => (
                                                            <div key={label} className="p-3 bg-slate-50 rounded-2xl">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                                                <p className="text-sm font-black text-slate-700 mt-0.5">{value || '—'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Medical History */}
                                                {selected.medicalHistory && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Antecedentes Médicos</p>
                                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                                                            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                                            <p className="text-sm text-amber-800 font-medium">{selected.medicalHistory}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'appointments' && (
                                            <motion.div key="appointments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="space-y-3">
                                                {aptsLoading ? (
                                                    <div className="flex justify-center py-8">
                                                        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                ) : appointments.length === 0 ? (
                                                    <div className="text-center py-10 bg-slate-50 rounded-3xl">
                                                        <Calendar className="mx-auto text-slate-200 mb-3" size={36} />
                                                        <p className="text-slate-400 text-sm font-bold">Sin historial de citas</p>
                                                    </div>
                                                ) : appointments.map(apt => {
                                                    const S = STATUS_CONFIG[apt.status] || STATUS_CONFIG.SCHEDULED;
                                                    const U = URGENCY_CONFIG[apt.urgency] || URGENCY_CONFIG.NORMAL;
                                                    const StatusIcon = S.icon;
                                                    const canAttend = apt.status === 'CONFIRMED';
                                                    const CATEGORY_CHIPS = {
                                                        PREVENTIVO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                                        RESTAURATIVO: 'bg-blue-50 text-blue-700 border-blue-200',
                                                        ENDODONCIA: 'bg-violet-50 text-violet-700 border-violet-200',
                                                        ORTODONCIA: 'bg-pink-50 text-pink-700 border-pink-200',
                                                        CIRUGIA: 'bg-red-50 text-red-700 border-red-200',
                                                        ESTETICO: 'bg-amber-50 text-amber-700 border-amber-200',
                                                    };
                                                    return (
                                                        <div key={apt.id} className="flex flex-col gap-3 p-4 bg-slate-50/60 rounded-2xl border border-slate-100">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border", S.class)}>
                                                                    <StatusIcon size={16} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className="font-black text-slate-800 text-sm">
                                                                            {new Date(apt.date).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                                                        </p>
                                                                        <span className="text-slate-400 text-xs font-bold">
                                                                            {new Date(apt.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                        {apt.urgency && apt.urgency !== 'NORMAL' && (
                                                                            <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black", U.class)}>{U.label}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                                        {apt.reason && <p className="text-xs text-slate-500 font-bold">{apt.reason}</p>}
                                                                        {apt.doctor && <p className="text-xs text-indigo-500 font-bold">Dr. {apt.doctor.name}</p>}
                                                                        {apt.duration && (
                                                                            <span className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                                                                                <Clock size={10} /> {apt.duration} min
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {apt.notes && <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-1">{apt.notes}</p>}
                                                                </div>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {canAttend && (
                                                                        <button
                                                                            onClick={() => setAttendTarget(apt)}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black shadow-sm transition-all hover:scale-105 active:scale-95">
                                                                            <Stethoscope size={11} />
                                                                            Atender
                                                                        </button>
                                                                    )}
                                                                    {apt.status === 'ATTENDED' && (
                                                                        <button
                                                                            onClick={() => setViewTarget(apt)}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black transition-all border border-slate-200">
                                                                            <FileText size={11} />
                                                                            Ver
                                                                        </button>
                                                                    )}
                                                                    {apt.status === 'ATTENDED' && !apt.paid && (
                                                                        <button
                                                                            onClick={() => setAttendTarget(apt)}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black transition-all hover:scale-105 active:scale-95 border border-indigo-200">
                                                                            <Stethoscope size={11} />
                                                                            Editar
                                                                        </button>
                                                                    )}
                                                                    <span className={cn("px-2.5 py-1 rounded-xl text-[9px] font-black border shrink-0", S.class)}>
                                                                        {S.label}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Service chips */}
                                                            {apt.treatmentItems && apt.treatmentItems.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5 pl-14">
                                                                    {apt.treatmentItems.map(item => {
                                                                        const chipClass = CATEGORY_CHIPS[item.service?.category] || 'bg-slate-50 text-slate-600 border-slate-200';
                                                                        return (
                                                                            <span key={item.id}
                                                                                title={item.notes || item.service?.name}
                                                                                className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-black', chipClass)}>
                                                                                {item.toothNumber && (
                                                                                    <span className="opacity-60">#{item.toothNumber}</span>
                                                                                )}
                                                                                {item.service?.name}
                                                                                <span className="opacity-60 font-bold">S/ {parseFloat(item.price).toFixed(0)}</span>
                                                                            </span>
                                                                        );
                                                                    })}
                                                                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-black border border-slate-200">
                                                                        Total: S/ {apt.treatmentItems.reduce((a, i) => a + parseFloat(i.price), 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}


                                        {activeTab === 'odontogram' && (() => {
                                            // Compute summary from preview data
                                            const CONDITIONS_META = [
                                                { id: 'CARIES', label: 'Caries', color: '#ef4444', bg: '#fef2f2' },
                                                { id: 'FILLING', label: 'Obturación', color: '#3b82f6', bg: '#eff6ff' },
                                                { id: 'CROWN', label: 'Corona', color: '#f59e0b', bg: '#fffbeb' },
                                                { id: 'MISSING', label: 'Ausente', color: '#94a3b8', bg: '#f8fafc' },
                                                { id: 'EXTRACTION', label: 'Exodoncia', color: '#f97316', bg: '#fff7ed' },
                                                { id: 'ROOTCANAL', label: 'Endodoncia', color: '#8b5cf6', bg: '#f5f3ff' },
                                                { id: 'IMPLANT', label: 'Implante', color: '#10b981', bg: '#ecfdf5' },
                                                { id: 'BRIDGE', label: 'Puente', color: '#06b6d4', bg: '#ecfeff' },
                                                { id: 'FRACTURE', label: 'Fractura', color: '#dc2626', bg: '#fff1f2' },
                                                { id: 'WEAR', label: 'Desgaste', color: '#78716c', bg: '#fafaf9' },
                                                { id: 'ERUPTING', label: 'En erupción', color: '#84cc16', bg: '#f7fee7' },
                                            ];
                                            const teeth = odontogramPreview;
                                            const stats = teeth ? CONDITIONS_META.map(c => ({
                                                ...c,
                                                count: Object.values(teeth).filter(t => t.condition === c.id).length,
                                            })).filter(c => c.count > 0) : [];
                                            const totalAffected = teeth
                                                ? Object.values(teeth).filter(t => t.condition !== 'HEALTHY').length
                                                : 0;

                                            return (
                                                <motion.div key="odontogram" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                    className="space-y-5">

                                                    {/* Top row: icon + title + open button */}
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center shrink-0">
                                                                <Activity size={26} className="text-indigo-500" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-800 text-base">Odontograma FDI</p>
                                                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                                                    {odontogramPreviewLoading ? 'Cargando...' :
                                                                        totalAffected > 0
                                                                            ? `${totalAffected} diente${totalAffected !== 1 ? 's' : ''} con hallazgos`
                                                                            : 'Sin hallazgos registrados'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowOdontogramModal(true)}
                                                            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-md shadow-indigo-200 transition-all hover:scale-105 active:scale-95 shrink-0">
                                                            <Maximize2 size={14} />
                                                            Abrir completo
                                                        </button>
                                                    </div>

                                                    {/* Condition badges summary */}
                                                    {!odontogramPreviewLoading && teeth && (
                                                        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                                                            {stats.length === 0 ? (
                                                                <div className="flex items-center gap-3 py-2">
                                                                    <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                                                    </div>
                                                                    <p className="text-sm font-bold text-slate-500">Dentición completa en buen estado</p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hallazgos registrados</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {stats.map(c => (
                                                                            <div key={c.id}
                                                                                style={{ backgroundColor: c.bg, borderColor: c.color + '40' }}
                                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border">
                                                                                <span style={{ backgroundColor: c.color }}
                                                                                    className="h-2.5 w-2.5 rounded-full shrink-0" />
                                                                                <span style={{ color: c.color }}
                                                                                    className="text-[11px] font-black">
                                                                                    {c.count} {c.label}{c.count !== 1 ? 's' : ''}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* No data yet */}
                                                    {!odontogramPreviewLoading && !teeth && (
                                                        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                                                            <p className="text-sm text-slate-400 font-bold">Aún no hay datos guardados para este paciente</p>
                                                            <p className="text-xs text-slate-300 font-medium mt-1">Abre el odontograma para comenzar el registro</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })()}

                                        {activeTab === 'treatments' && (
                                            <motion.div key="treatments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                                <InitialTreatmentView
                                                    patientId={selected.id}
                                                    onBack={() => setActiveTab('info')}
                                                />
                                            </motion.div>
                                        )}

                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ══ View Appointment (read-only) ══ */}
            {viewTarget && (
                <AttendModal
                    appointment={viewTarget}
                    readOnly={true}
                    onClose={() => setViewTarget(null)}
                    onSaved={() => { }}
                />
            )}

            {/* ══ Attend Appointment Modal ══ */}
            {attendTarget && (
                <AttendModal
                    appointment={attendTarget}
                    onClose={() => setAttendTarget(null)}
                    onSaved={(updated) => {
                        // Replace the appointment in the list in-place
                        setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
                        setAttendTarget(null);
                    }}
                />
            )}

            {/* ══ Fullscreen Odontogram Modal ══ */}
            <AnimatePresence>
                {showOdontogramModal && selected && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="odo-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeOdontogramModal}
                            style={{
                                position: 'fixed', inset: 0,
                                backgroundColor: 'rgba(15,23,42,0.7)',
                                backdropFilter: 'blur(6px)',
                                zIndex: 9998,
                            }}
                        />

                        {/* Modal panel — full screen */}
                        <motion.div
                            key="odo-modal"
                            initial={{ opacity: 0, scale: 0.96, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 24 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            style={{
                                position: 'fixed', inset: 0, zIndex: 9999,
                                display: 'flex', flexDirection: 'column',
                                backgroundColor: '#f8fafc', overflow: 'hidden',
                            }}
                        >
                            {/* Sticky header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px 28px',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                flexShrink: 0,
                                boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        height: 44, width: 44, borderRadius: 14,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Activity size={22} color="#fff" />
                                    </div>
                                    <div>
                                        <p style={{ color: '#fff', fontWeight: 900, fontSize: 17, margin: 0, letterSpacing: -0.3 }}>
                                            Odontograma FDI — {selected.firstName} {selected.paternalSurname}
                                        </p>
                                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, margin: '2px 0 0', fontWeight: 600 }}>
                                            Notación Internacional · {selected.documentType}: {selected.documentId}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeOdontogramModal}
                                    style={{
                                        height: 44, width: 44, borderRadius: 14, border: 'none',
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                        cursor: 'pointer', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable body */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
                                <ErrorBoundary fallbackRender={({ error }) => <div className="p-10 text-red-600 bg-red-50 border border-red-200 m-10 whitespace-pre-wrap"><h1 className="text-2xl font-bold mb-4">Component Crash</h1>{error.message}{"\n\n"}{error.stack}</div>}>
                                    <Odontograma
                                        patientId={selected.id}
                                        patientName={`${selected.firstName} ${selected.paternalSurname}`}
                                        patient={selected}
                                    />
                                </ErrorBoundary>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default History;
