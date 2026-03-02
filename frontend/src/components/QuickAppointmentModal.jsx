import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const STEPS = [
    { id: 1, label: 'Sede', icon: MapPin },
    { id: 2, label: 'Doctor', icon: User },
    { id: 3, label: 'Fecha', icon: Calendar },
    { id: 4, label: 'Hora', icon: Clock },
];

const DURATION_OPTIONS = [
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1:30 hr' },
];

const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ─── Mini Calendar ────────────────────────────────────────────────────────────
const MiniCalendar = ({ doctorId, branchId, duration, selectedDate, onSelectDate }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-indexed
    const [dayMap, setDayMap] = useState({});     // { 'YYYY-MM-DD': { available, slots, occupancy } }
    const [loading, setLoading] = useState(false);

    const fetchDays = useCallback(() => {
        if (!doctorId || !branchId) return;
        setLoading(true);
        api.get(`appointments/available-days?doctorId=${doctorId}&branchId=${branchId}&year=${viewYear}&month=${viewMonth}&duration=${duration}`)
            .then(r => {
                const map = {};
                (r.data || []).forEach(d => { map[d.date] = d; });
                setDayMap(map);
            })
            .catch(() => setDayMap({}))
            .finally(() => setLoading(false));
    }, [doctorId, branchId, viewYear, viewMonth, duration]);

    useEffect(() => { fetchDays(); }, [fetchDays]);

    const goToPrev = () => {
        if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const goToNext = () => {
        if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Can't go to previous months from today's month
    const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth() + 1;

    // Build calendar grid
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const getDayStr = (d) => `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    return (
        <div className="select-none">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={goToPrev}
                    disabled={!canGoPrev}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-2">
                    {loading && <Loader2 size={12} className="animate-spin text-cyan-500" />}
                    <span className="text-[12px] font-black text-slate-700 uppercase tracking-widest">
                        {MONTHS_ES[viewMonth - 1]} {viewYear}
                    </span>
                </div>
                <button
                    onClick={goToNext}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-all"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => (
                    <div key={d} className={cn('text-center text-[9px] font-black py-1 uppercase tracking-widest', d === 'Do' ? 'text-red-300' : 'text-slate-400')}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, idx) => {
                    if (!day) return <div key={`e${idx}`} />;

                    const dateStr = getDayStr(day);
                    const info = dayMap[dateStr];
                    const isSelected = selectedDate === dateStr;
                    const isAvailable = info?.available;
                    const isUnavailable = info && !info.available;
                    const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const isSunday = new Date(viewYear, viewMonth - 1, day).getDay() === 0;

                    // Occupancy color for available days
                    let availBg = 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100';
                    if (info?.occupancy >= 80) availBg = 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
                    if (info?.occupancy >= 95) availBg = 'bg-red-50 border-red-200 text-red-500 hover:bg-red-50';

                    return (
                        <button
                            key={dateStr}
                            disabled={!isAvailable || loading}
                            onClick={() => onSelectDate(dateStr)}
                            className={cn(
                                'relative h-9 w-full rounded-xl text-[11px] font-black border transition-all flex flex-col items-center justify-center gap-0',
                                isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                    : isAvailable
                                        ? availBg
                                        : isSunday
                                            ? 'bg-slate-50 border-transparent text-red-200 cursor-not-allowed'
                                            : isUnavailable
                                                ? 'bg-slate-50 border-transparent text-slate-300 cursor-not-allowed line-through'
                                                : 'bg-white border-slate-100 text-slate-300 cursor-not-allowed',
                                isToday && !isSelected && 'ring-2 ring-offset-1 ring-cyan-400'
                            )}
                        >
                            <span>{day}</span>
                            {isAvailable && !isSelected && (
                                <span className={cn('text-[7px] leading-none', info?.occupancy >= 80 ? 'text-amber-400' : 'text-emerald-400')}>
                                    {info?.slots}h
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-3 mt-3 justify-center">
                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" /> Disponible
                </span>
                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300 inline-block" /> Pocos turnos
                </span>
                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200 inline-block" /> Sin cupo
                </span>
            </div>
        </div>
    );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
const QuickAppointmentModal = ({ patientId, patientName, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [branches, setBranches] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        branchId: null,
        branchName: '',
        doctorId: null,
        doctorName: '',
        date: '',
        slotTime: null,
        slotLabel: '',
        duration: 30,
        reason: '',
        notes: '',
    });

    // Load branches on mount
    useEffect(() => {
        setLoadingBranches(true);
        api.get('branches')
            .then(r => setBranches(r.data || []))
            .catch(() => setBranches([]))
            .finally(() => setLoadingBranches(false));
    }, []);

    // Load doctors when branch is selected
    useEffect(() => {
        if (!form.branchId) return;
        setLoadingDoctors(true);
        api.get(`appointments/doctors?branchId=${form.branchId}`)
            .then(r => setDoctors(r.data || []))
            .catch(() => setDoctors([]))
            .finally(() => setLoadingDoctors(false));
    }, [form.branchId]);

    // Load slots when doctor+date are set (step 4)
    const fetchSlots = useCallback(() => {
        if (!form.doctorId || !form.date || !form.branchId) return;
        setLoadingSlots(true);
        api.get(`appointments/slots?doctorId=${form.doctorId}&date=${form.date}&branchId=${form.branchId}&duration=${form.duration}`)
            .then(r => setSlots(r.data || []))
            .catch(() => setSlots([]))
            .finally(() => setLoadingSlots(false));
    }, [form.doctorId, form.date, form.branchId, form.duration]);

    useEffect(() => {
        if (step === 4) fetchSlots();
    }, [step, fetchSlots]);

    const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const canProceed = () => {
        if (step === 1) return !!form.branchId;
        if (step === 2) return !!form.doctorId;
        if (step === 3) return !!form.date;
        if (step === 4) return !!form.slotTime;
        return false;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            await api.post('appointments', {
                patientId: parseInt(patientId),
                doctorId: form.doctorId,
                branchId: form.branchId,
                date: form.slotTime,
                duration: form.duration,
                reason: form.reason || null,
                notes: form.notes || null,
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 1800);
        } catch (e) {
            setError(e?.response?.data?.message || 'Error al registrar la cita. Intenta de nuevo.');
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 px-8 pt-8 pb-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Nueva Cita Rápida</p>
                            <h2 className="text-xl font-black leading-tight">{patientName}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center gap-0 mt-6">
                        {STEPS.map((s, idx) => {
                            const done = step > s.id;
                            const active = step === s.id;
                            return (
                                <React.Fragment key={s.id}>
                                    <div className={cn(
                                        'flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all',
                                        done ? 'bg-white/20 text-white' : active ? 'bg-white text-indigo-600' : 'text-white/40'
                                    )}>
                                        {done ? <CheckCircle size={12} /> : <s.icon size={12} />}
                                        <span>{s.label}</span>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className={cn('flex-1 h-px mx-1', step > s.id ? 'bg-white/40' : 'bg-white/20')} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-8 text-center gap-3"
                            >
                                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">¡Cita Registrada!</h3>
                                <p className="text-sm text-slate-400">
                                    {form.slotLabel} · {new Date(form.date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                <p className="text-[10px] text-slate-300 font-medium">Dr. {form.doctorName} · {form.branchName}</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.18 }}
                            >
                                {/* STEP 1: Select Branch */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Seleccionar Sede</h3>
                                        {loadingBranches ? (
                                            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-cyan-500" /></div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2">
                                                {branches.map(b => (
                                                    <button
                                                        key={b.id}
                                                        onClick={() => { update('branchId', b.id); update('branchName', b.name); }}
                                                        className={cn(
                                                            'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                                                            form.branchId === b.id ? 'border-cyan-500 bg-cyan-50 shadow-md shadow-cyan-100' : 'border-slate-100 hover:border-slate-300'
                                                        )}
                                                    >
                                                        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', form.branchId === b.id ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400')}>
                                                            <MapPin size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[13px] text-slate-800">{b.name}</p>
                                                            {b.address && <p className="text-[10px] text-slate-400 mt-0.5">{b.address}</p>}
                                                        </div>
                                                        {form.branchId === b.id && <CheckCircle size={18} className="ml-auto text-cyan-500" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 2: Select Doctor */}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Seleccionar Doctor · <span className="text-cyan-600">{form.branchName}</span></h3>
                                        {loadingDoctors ? (
                                            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-cyan-500" /></div>
                                        ) : doctors.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400">
                                                <User size={32} className="mx-auto mb-2 opacity-30" />
                                                <p className="text-sm font-bold">No hay doctores disponibles</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                                                {doctors.map(d => (
                                                    <button
                                                        key={d.id}
                                                        onClick={() => { update('doctorId', d.id); update('doctorName', d.name); }}
                                                        className={cn(
                                                            'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                                                            form.doctorId === d.id ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100' : 'border-slate-100 hover:border-slate-300'
                                                        )}
                                                    >
                                                        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm', form.doctorId === d.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500')}>
                                                            {d.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[13px] text-slate-800">{d.name}</p>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{d.role === 'DENTIST' ? 'Odontólogo' : 'Admin'}</p>
                                                        </div>
                                                        {form.doctorId === d.id && <CheckCircle size={18} className="ml-auto text-indigo-500" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 3: Select Date via Calendar */}
                                {step === 3 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Seleccionar Fecha · <span className="text-cyan-600">Dr. {form.doctorName}</span>
                                            </h3>
                                            <div className="flex gap-1.5">
                                                {DURATION_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => { update('duration', opt.value); update('date', ''); update('slotTime', null); }}
                                                        className={cn(
                                                            'py-1 px-2 rounded-lg text-[9px] font-black border transition-all',
                                                            form.duration === opt.value ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-400'
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <MiniCalendar
                                            doctorId={form.doctorId}
                                            branchId={form.branchId}
                                            duration={form.duration}
                                            selectedDate={form.date}
                                            onSelectDate={(d) => { update('date', d); update('slotTime', null); update('slotLabel', ''); }}
                                        />

                                        {form.date && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Motivo (opcional)</label>
                                                <input
                                                    type="text"
                                                    value={form.reason}
                                                    onChange={e => update('reason', e.target.value)}
                                                    placeholder="Consulta de rutina, limpieza dental..."
                                                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 rounded-2xl px-5 py-3 text-sm text-slate-600 outline-none transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 4: Select Time Slot */}
                                {step === 4 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Seleccionar Horario</h3>
                                            <p className="text-[11px] text-slate-600 font-black">
                                                {new Date(form.date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </p>
                                        </div>
                                        <div className="flex gap-3 text-[9px] font-black uppercase">
                                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" /> Disponible</span>
                                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-200 inline-block" /> Ocupado</span>
                                        </div>
                                        {loadingSlots ? (
                                            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-cyan-500" /></div>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                                                {slots.map((slot, idx) => (
                                                    <button
                                                        key={idx}
                                                        disabled={!slot.available}
                                                        onClick={() => { update('slotTime', slot.time); update('slotLabel', slot.label); }}
                                                        className={cn(
                                                            'py-2.5 px-1 rounded-xl text-[11px] font-black border-2 transition-all',
                                                            !slot.available && slot.occupied ? 'bg-red-50 border-red-100 text-red-300 cursor-not-allowed' :
                                                                !slot.available ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' :
                                                                    form.slotTime === slot.time ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' :
                                                                        'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                                                        )}
                                                    >
                                                        {slot.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Summary */}
                                        {form.slotTime && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-1"
                                            >
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Resumen</p>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-bold text-slate-700">
                                                    <span className="text-slate-400">Sede:</span><span>{form.branchName}</span>
                                                    <span className="text-slate-400">Doctor:</span><span>Dr. {form.doctorName}</span>
                                                    <span className="text-slate-400">Fecha:</span><span>{new Date(form.date + 'T12:00:00').toLocaleDateString('es-PE')}</span>
                                                    <span className="text-slate-400">Hora:</span><span>{form.slotLabel}</span>
                                                    <span className="text-slate-400">Duración:</span><span>{form.duration} min</span>
                                                    {form.reason && <><span className="text-slate-400">Motivo:</span><span className="truncate">{form.reason}</span></>}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                        >
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <p className="text-[11px] font-bold text-red-600">{error}</p>
                        </motion.div>
                    )}

                    {/* Footer */}
                    {!success && (
                        <div className="flex gap-3 mt-6">
                            {step > 1 && (
                                <button
                                    onClick={() => { setStep(s => s - 1); setError(null); }}
                                    className="flex items-center gap-2 px-5 py-3 border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronLeft size={16} /> Atrás
                                </button>
                            )}
                            <button
                                disabled={!canProceed() || submitting}
                                onClick={() => {
                                    if (step < 4) { setStep(s => s + 1); setError(null); }
                                    else handleSubmit();
                                }}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[12px] font-black transition-all shadow-lg active:scale-95',
                                    canProceed() && !submitting
                                        ? step === 4 && form.slotTime
                                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                                            : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:opacity-90 shadow-indigo-200'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                )}
                            >
                                {submitting ? (
                                    <><Loader2 size={16} className="animate-spin" /> Reservando...</>
                                ) : step === 4 && form.slotTime ? (
                                    <><CheckCircle size={16} /> Confirmar Cita</>
                                ) : (
                                    <>Siguiente <ChevronRight size={16} /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default QuickAppointmentModal;
