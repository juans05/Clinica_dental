import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Plus, Trash2, CheckCircle2, PackageCheck,
    Stethoscope, ChevronDown, Loader2
} from 'lucide-react';
import api from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const CATEGORY_COLORS = {
    PREVENTIVO: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    RESTAURATIVO: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    ENDODONCIA: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
    ORTODONCIA: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', dot: 'bg-pink-500' },
    CIRUGIA: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
    ESTETICO: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
};
const defaultColor = { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' };

/**
 * AttendModal – Register services performed in an appointment.
 *
 * Props:
 *   appointment  – the appointment object (must have id, patient, doctor)
 *   onClose()   – called when modal is dismissed
 *   onSaved(updatedAppointment) – called after successful save
 */
export default function AttendModal({ appointment, onClose, onSaved, readOnly = false }) {
    const [catalog, setCatalog] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCatalog, setShowCatalog] = useState(false);

    // Selected services: [{ serviceId, name, category, price, toothNumber, notes }]
    const [selected, setSelected] = useState([]);
    const [clinicalNotes, setClinicalNotes] = useState(appointment?.notes || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Pre-populate if appointment already has treatmentItems (editing)
    useEffect(() => {
        if (appointment?.treatmentItems?.length) {
            setSelected(appointment.treatmentItems.map(item => ({
                serviceId: item.service.id,
                name: item.service.name,
                category: item.service.category,
                price: item.price,
                toothNumber: item.toothNumber || '',
                notes: item.notes || '',
            })));
        }
    }, [appointment]);

    // Load service catalog
    useEffect(() => {
        api.get('services')
            .then(r => setCatalog(r.data || []))
            .catch(() => setCatalog([]))
            .finally(() => setCatalogLoading(false));
    }, []);

    const filteredCatalog = useMemo(() => {
        const q = search.toLowerCase();
        return catalog.filter(s =>
            s.active &&
            (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
        );
    }, [catalog, search]);

    const addService = (svc) => {
        if (selected.some(s => s.serviceId === svc.id)) return; // already added
        setSelected(prev => [...prev, {
            serviceId: svc.id,
            name: svc.name,
            category: svc.category,
            price: svc.price,
            toothNumber: '',
            notes: '',
        }]);
        setSearch('');
        setShowCatalog(false);
    };

    const removeService = (serviceId) => {
        setSelected(prev => prev.filter(s => s.serviceId !== serviceId));
    };

    const updateService = (serviceId, field, value) => {
        setSelected(prev => prev.map(s =>
            s.serviceId === serviceId ? { ...s, [field]: value } : s
        ));
    };

    const total = selected.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0);

    const handleSave = async () => {
        if (readOnly) return;
        if (selected.length === 0) {
            setError('Agrega al menos un servicio realizado.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await api.put(`appointments/${appointment.id}/attend`, {
                notes: clinicalNotes,
                services: selected.map(s => ({
                    serviceId: s.serviceId,
                    price: parseFloat(s.price) || 0,
                    toothNumber: s.toothNumber || null,
                    notes: s.notes || null,
                })),
            });
            onSaved(res.data);
            onClose();
        } catch (e) {
            setError(e?.response?.data?.message || 'Error al guardar la atención.');
            setSaving(false);
        }
    };

    const apt = appointment;

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                key="attend-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9000]"
            />

            {/* Panel */}
            <motion.div
                key="attend-panel"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="fixed inset-0 z-[9001] flex items-center justify-center p-4 pointer-events-none"
            >
                <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                                <Stethoscope size={18} color="#fff" />
                            </div>
                            <div>
                                <p className="font-black text-slate-800 text-sm leading-tight">{readOnly ? 'Detalle de Atención' : 'Registrar Atención'}</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    {apt?.patient
                                        ? `${apt.patient.firstName} ${apt.patient.paternalSurname}`
                                        : '—'}
                                    {apt?.doctor ? ` · Dr. ${apt.doctor.name}` : ''}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="h-8 w-8 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                        {/* Service selector */}
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                {readOnly ? 'Servicios Realizados' : 'Servicios Realizados'}
                            </p>
                            {readOnly && (
                                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-100 rounded-xl mb-3">
                                    <span className="text-[10px] text-amber-700 font-bold">🔒 Vista de solo lectura — Esta atención ya fue registrada.</span>
                                </div>
                            )}

                            {/* Search dropdown */}
                            <div className="relative">
                                <div
                                    className={cn("flex items-center gap-3 p-2.5 border-2 rounded-xl transition-colors bg-white", readOnly ? "border-slate-100 opacity-50 cursor-not-allowed" : "border-slate-200 hover:border-indigo-300 cursor-pointer")}
                                    onClick={() => !readOnly && setShowCatalog(v => !v)}
                                >
                                    <Search size={14} className="text-slate-400 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Buscar servicio del catálogo..."
                                        value={search}
                                        onChange={e => { setSearch(e.target.value); setShowCatalog(true); }}
                                        onClick={e => { e.stopPropagation(); setShowCatalog(true); }}
                                        className="flex-1 outline-none text-xs font-medium text-slate-700 placeholder:text-slate-400 bg-transparent"
                                    />
                                    <ChevronDown size={12} className={cn("text-slate-400 transition-transform shrink-0", showCatalog && "rotate-180")} />
                                </div>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {showCatalog && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                            className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto"
                                        >
                                            {catalogLoading ? (
                                                <div className="flex justify-center items-center py-6 gap-2 text-slate-400">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    <span className="text-sm font-medium">Cargando catálogo...</span>
                                                </div>
                                            ) : filteredCatalog.length === 0 ? (
                                                <p className="text-center py-6 text-sm text-slate-400 font-medium">Sin resultados</p>
                                            ) : filteredCatalog.map(svc => {
                                                const col = CATEGORY_COLORS[svc.category] || defaultColor;
                                                const isAdded = selected.some(s => s.serviceId === svc.id);
                                                return (
                                                    <button key={svc.id}
                                                        onClick={() => addService(svc)}
                                                        disabled={isAdded}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0",
                                                            isAdded && "opacity-40 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <span className={cn("h-2 w-2 rounded-full shrink-0", col.dot)} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 truncate">{svc.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-semibold">{svc.category}</p>
                                                        </div>
                                                        <span className="text-sm font-black text-slate-600 shrink-0">
                                                            S/ {svc.price.toFixed(2)}
                                                        </span>
                                                        {isAdded && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Selected services list */}
                        {selected.length > 0 && (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {selected.map((svc) => {
                                        const col = CATEGORY_COLORS[svc.category] || defaultColor;
                                        return (
                                            <motion.div
                                                key={svc.serviceId}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={cn("rounded-xl border p-3 space-y-2", col.bg, col.border)}
                                            >
                                                {/* Service header */}
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", col.dot)} />
                                                        <p className={cn("text-sm font-black", col.text)}>{svc.name}</p>
                                                        <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg border", col.bg, col.border, col.text)}>
                                                            {svc.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-slate-700">S/ {parseFloat(svc.price).toFixed(2)}</span>
                                                        <button onClick={() => removeService(svc.serviceId)}
                                                            className="h-7 w-7 rounded-xl bg-white/70 border border-white hover:bg-red-50 hover:border-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Extra fields */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                            Diente (FDI) — opcional
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="ej. 11, 21, 36..."
                                                            value={svc.toothNumber}
                                                            onChange={e => updateService(svc.serviceId, 'toothNumber', e.target.value)}
                                                            className="w-full bg-white/70 border border-white rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                            Precio (S/)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={svc.price}
                                                            onChange={e => updateService(svc.serviceId, 'price', e.target.value)}
                                                            className="w-full bg-white/70 border border-white rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                        Observaciones del procedimiento
                                                    </label>
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Ej: Se realizó profilaxis completa, se indicó uso de hilo dental..."
                                                        value={svc.notes}
                                                        onChange={e => updateService(svc.serviceId, 'notes', e.target.value)}
                                                        className="w-full bg-white/70 border border-white rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Empty state */}
                        {selected.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 gap-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <PackageCheck size={32} className="text-slate-300" />
                                <p className="text-sm font-bold text-slate-400">Busca y agrega los servicios realizados</p>
                            </div>
                        )}

                        {/* Clinical notes */}
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Notas Clínicas Generales
                            </p>
                            <textarea
                                rows={2}
                                readOnly={readOnly}
                                placeholder={readOnly && !clinicalNotes ? 'Sin notas registradas.' : 'Observaciones generales de la consulta, indicaciones para el paciente, próximas citas...'}
                                value={clinicalNotes}
                                onChange={e => !readOnly && setClinicalNotes(e.target.value)}
                                className={cn("w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-700 outline-none resize-none transition-all", readOnly ? "cursor-default opacity-70" : "focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300")}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50">
                        {/* Total */}
                        <div>
                            {selected.length > 0 && (
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total {readOnly ? 'cobrado' : 'a cobrar'}</p>
                                    <p className="text-xl font-black text-slate-800">S/ {total.toFixed(2)}</p>
                                </div>
                            )}
                            {!readOnly && error && <p className="text-xs font-bold text-red-500">{error}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                {readOnly ? 'Cerrar' : 'Cancelar'}
                            </button>
                            {!readOnly && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving || selected.length === 0}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all",
                                        selected.length === 0
                                            ? "bg-slate-300 cursor-not-allowed"
                                            : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95"
                                    )}
                                >
                                    {saving
                                        ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                                        : <><CheckCircle2 size={15} /> Guardar Atención</>
                                    }
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
