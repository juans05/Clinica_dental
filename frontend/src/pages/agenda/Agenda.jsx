import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Search,
    AlertCircle,
    Ban,
    Trash2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => {
    return twMerge(clsx(inputs));
}

const Agenda = () => {
    const { user } = useAuth();
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('DAY'); // 'DAY', 'WEEK', 'MONTH'
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedConsultory, setSelectedConsultory] = useState(null);
    const [consultories, setConsultories] = useState([]);
    const [searchPatient, setSearchPatient] = useState('');
    const [showPatientResults, setShowPatientResults] = useState(false);

    // ── Bloqueo de horarios ──────────────────────────────────────────────────
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [blockForm, setBlockForm] = useState({
        doctorId: '', date: '', startTime: '08:00', endTime: '09:00', reason: ''
    });
    const [blockSaving, setBlockSaving] = useState(false);

    const initialFormState = {
        date: '',
        time: '08:00',
        patientId: '',
        doctorId: '',
        consultoryId: '',
        reason: 'Primera visita',
        urgency: 'NORMAL',
        duration: '30',
        notes: '',
        patientName: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
        fetchPatients();
        fetchBranches();
        fetchConsultories();
    }, [viewDate, viewMode, selectedBranch, selectedDoctor, selectedConsultory]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let start, end;

            if (viewMode === 'DAY') {
                // Use local midnight to correctly capture appointments for the selected local day
                const startOfDay = new Date(viewDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(viewDate);
                endOfDay.setHours(23, 59, 59, 999);
                start = startOfDay.toISOString();
                end = endOfDay.toISOString();
            } else if (viewMode === 'WEEK') {
                const curr = new Date(viewDate);
                const day = curr.getDay();

                const firstDay = new Date(curr);
                firstDay.setDate(curr.getDate() - day);
                firstDay.setHours(0, 0, 0, 0);

                const lastDay = new Date(firstDay);
                lastDay.setDate(firstDay.getDate() + 6);
                lastDay.setHours(23, 59, 59, 999);

                start = firstDay.toISOString();
                end = lastDay.toISOString();
            } else { // MONTH
                const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
                const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

                start = new Date(firstDay.setHours(0, 0, 0, 0)).toISOString();
                end = new Date(lastDay.setHours(23, 59, 59, 999)).toISOString();
            }

            const params = { start, end };
            if (selectedBranch) params.branchId = selectedBranch;
            if (selectedDoctor) params.doctorId = selectedDoctor;
            if (selectedConsultory) params.consultoryId = selectedConsultory;

            const response = await api.get('appointments', {
                params: params
            });
            setAppointments(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateDate = (direction) => {
        const nextDate = new Date(viewDate);
        if (viewMode === 'DAY') {
            nextDate.setDate(viewDate.getDate() + direction);
        } else if (viewMode === 'WEEK') {
            nextDate.setDate(viewDate.getDate() + (direction * 7));
        } else if (viewMode === 'MONTH') {
            nextDate.setMonth(viewDate.getMonth() + direction);
        }
        setViewDate(nextDate);
    };

    const fetchDoctors = async () => {
        try {
            const response = await api.get('auth/users?role=DENTIST');
            setDoctors(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            if (user?.id) {
                setDoctors([{ id: user.id, name: user.name, role: user.role || 'ADMIN' }]);
            } else {
                setDoctors([]);
            }
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('patients');
            setPatients(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setPatients([]);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await api.get('branches');
            setBranches(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
        }
    };

    const fetchConsultories = async () => {
        try {
            const response = await api.get('consultories');
            setConsultories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching consultories:', error);
        }
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        try {
            const combinedString = `${formData.date}T${formData.time}`;
            const dateTime = new Date(combinedString);

            if (isNaN(dateTime.getTime())) {
                throw new Error("Fecha o hora inválida");
            }

            await api.post('appointments', {
                date: dateTime.toISOString(),
                notes: formData.notes,
                reason: formData.reason,
                urgency: formData.urgency,
                duration: parseInt(formData.duration),
                patientId: formData.patientId,
                doctorId: formData.doctorId || user.id,
                consultoryId: formData.consultoryId
            });

            setShowModal(false);
            setFormData(initialFormState);
            setSearchPatient('');
            fetchAppointments();
        } catch (error) {
            alert('Error al crear la cita: ' + (error.response?.data?.message || error.message));
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`appointments/${id}`, { status });
            fetchAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const fetchBlockedSlots = async (branchId) => {
        if (!branchId) return;
        try {
            const res = await api.get(`schedule/blocked?branchId=${branchId}`);
            setBlockedSlots(res.data);
        } catch (e) { console.error('Error fetching blocked slots:', e); }
    };

    const handleCreateBlock = async (e) => {
        e.preventDefault();
        if (!selectedBranch) return alert('Selecciona una sede primero');
        setBlockSaving(true);
        try {
            const startAt = new Date(`${blockForm.date}T${blockForm.startTime}`).toISOString();
            const endAt   = new Date(`${blockForm.date}T${blockForm.endTime}`).toISOString();
            await api.post('schedule/blocked', {
                doctorId:  blockForm.doctorId || null,
                branchId:  selectedBranch,
                startAt, endAt,
                reason: blockForm.reason || null
            });
            setBlockForm({ doctorId: '', date: '', startTime: '08:00', endTime: '09:00', reason: '' });
            fetchBlockedSlots(selectedBranch);
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        } finally {
            setBlockSaving(false);
        }
    };

    const handleDeleteBlock = async (id) => {
        if (!window.confirm('¿Eliminar este bloqueo?')) return;
        try {
            await api.delete(`schedule/blocked/${id}`);
            setBlockedSlots(s => s.filter(b => b.id !== id));
        } catch (e) { alert('Error al eliminar bloqueo'); }
    };

    const filteredPatients = patients.filter(p =>
        (p.firstName?.toLowerCase().includes(searchPatient.toLowerCase()) || false) ||
        (p.paternalSurname?.toLowerCase().includes(searchPatient.toLowerCase()) || false) ||
        (p.documentId?.includes(searchPatient) || false)
    );

    const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

    const formatDate = (date) => {
        const options = {
            DAY: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
            WEEK: { month: 'long', year: 'numeric' },
            MONTH: { month: 'long', year: 'numeric' }
        };

        let label = new Intl.DateTimeFormat('es-PE', options[viewMode]).format(date);

        if (viewMode === 'WEEK') {
            const first = date.getDate() - date.getDay();
            const last = first + 6;
            const firstDay = new Date(new Date(date).setDate(first));
            const lastDay = new Date(new Date(date).setDate(last));
            label = `Semana ${firstDay.getDate()} - ${lastDay.getDate()} de ${label}`;
        }

        return label;
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
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestión de Agenda</span>
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Citas Programadas</h1>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => {
                            fetchBlockedSlots(selectedBranch);
                            setShowBlockModal(true);
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all shadow-sm"
                    >
                        <Ban size={18} /> Bloquear Horario
                    </button>
                    <button
                        onClick={() => {
                            setFormData({ ...initialFormState, date: viewDate.toISOString().split('T')[0] });
                            setShowModal(true);
                        }}
                        className="flex-1 md:flex-none premium-button-primary"
                    >
                        <Plus size={20} /> Nueva Cita
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar / Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-[32px] border border-white/40 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Calendario</h3>
                            <div className="flex gap-1">
                                <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft size={16} /></button>
                                <button onClick={() => setViewDate(new Date())} className="px-2 text-[10px] font-black uppercase text-cyan-600 hover:bg-cyan-50 rounded-lg">Hoy</button>
                                <button onClick={() => navigateDate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{viewDate.toLocaleDateString('es-PE', { month: 'long' })}</span>
                                <span className="text-4xl font-black text-slate-800 leading-none">{viewDate.getDate()}</span>
                                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic">{viewDate.toLocaleDateString('es-PE', { weekday: 'short' })}</span>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede Clínica</label>
                                <select
                                    value={selectedBranch || ''}
                                    onChange={(e) => setSelectedBranch(e.target.value || null)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 uppercase focus:ring-2 focus:ring-cyan-500 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Todas las Sedes</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialista / Doctor</label>
                                <select
                                    value={selectedDoctor || ''}
                                    onChange={(e) => setSelectedDoctor(e.target.value || null)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 uppercase focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Todos los Doctores</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultorio / Sillón</label>
                                <select
                                    value={selectedConsultory || ''}
                                    onChange={(e) => setSelectedConsultory(e.target.value || null)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 uppercase focus:ring-2 focus:ring-emerald-500 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Todos los Sillones</option>
                                    {consultories
                                        .filter(c => !selectedBranch || c.branchId === selectedBranch)
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-[32px] border border-white/40 bg-indigo-900 text-white shadow-xl shadow-indigo-900/20">
                        <AlertCircle className="mb-4 text-indigo-300" size={24} />
                        <h4 className="font-black text-sm uppercase tracking-wider mb-2">Recordatorio</h4>
                        <p className="text-xs text-indigo-100 font-medium leading-relaxed opacity-80 italic">Confirmar las citas de ortodoncia 24h antes para optimizar el rack dental de la sede.</p>
                    </div>
                </div>

                {/* Main Schedule Container */}
                <div className="lg:col-span-3">
                    <div className="glass-card rounded-[40px] overflow-hidden border border-white/40 shadow-2xl shadow-slate-200/40">
                        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg"><CalendarIcon size={24} /></div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight capitalize">{formatDate(viewDate)}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Punto de Control Operativo</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                                {[
                                    { label: 'Día', value: 'DAY' },
                                    { label: 'Semana', value: 'WEEK' },
                                    { label: 'Mes', value: 'MONTH' }
                                ].map(v => (
                                    <button
                                        key={v.value}
                                        onClick={() => setViewMode(v.value)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            viewMode === v.value ? "bg-slate-800 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white relative min-h-[600px] overflow-x-auto">
                            {loading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Sincronizando Agenda...</p>
                                    </div>
                                </div>
                            )}

                            {viewMode === 'DAY' && (
                                <div className="divide-y divide-slate-100 min-w-[600px]">
                                    {timeSlots.map(hour => (
                                        <div key={hour} className="flex h-32 group hover:bg-slate-50/30 transition-all">
                                            <div className="w-24 p-6 border-r border-slate-100 flex flex-col items-center justify-start bg-slate-50/30">
                                                <span className="text-[11px] font-black text-slate-400 uppercase tabular-nums">{hour}:00</span>
                                                <span className="text-[8px] font-black text-slate-300">{hour < 12 ? 'AM' : 'PM'}</span>
                                            </div>
                                            <div
                                                className="flex-1 p-2 relative cursor-cell"
                                                onClick={() => {
                                                    const dateStr = viewDate.toISOString().split('T')[0];
                                                    const timeStr = String(hour).padStart(2, '0') + ':00';
                                                    setFormData({ ...initialFormState, date: dateStr, time: timeStr });
                                                    setShowModal(true);
                                                }}
                                            >
                                                <AnimatePresence>
                                                    {appointments.filter(a => new Date(a.date).getHours() === hour).map((apt, idx) => (
                                                        <motion.div
                                                            key={apt.id}
                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={cn(
                                                                "absolute inset-x-2 rounded-3xl p-5 text-white shadow-2xl flex flex-col justify-between cursor-pointer group/card transition-all hover:-translate-y-1 z-10",
                                                                apt.status === 'CONFIRMED' ? "bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-emerald-500/20" :
                                                                    apt.status === 'CANCELLED' ? "bg-gradient-to-br from-rose-600 to-rose-500 shadow-rose-500/20" :
                                                                        "bg-gradient-to-br from-cyan-600 to-cyan-500 shadow-cyan-500/20"
                                                            )}
                                                            style={{ top: 8 + (idx * 20), height: '110px' }}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <div className="px-2 py-0.5 bg-white/20 rounded-md text-[8px] font-black uppercase tracking-[0.1em]">{apt.status}</div>
                                                                        <div className="flex items-center gap-1 text-[9px] font-bold opacity-80">
                                                                            <Clock size={10} /> {new Date(apt.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                                        </div>
                                                                    </div>
                                                                    <h4 className="font-black text-sm tracking-tight leading-tight uppercase truncate max-w-[150px]">
                                                                        {apt.patient?.firstName} {apt.patient?.paternalSurname}
                                                                    </h4>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    {apt.status === 'SCHEDULED' && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); updateStatus(apt.id, 'CONFIRMED'); }}
                                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white text-emerald-600 text-[9px] font-black uppercase tracking-wide shadow-sm hover:bg-emerald-50 transition-all"
                                                                        >
                                                                            <CheckCircle size={12} /> Confirmar
                                                                        </button>
                                                                    )}
                                                                    {['SCHEDULED', 'CONFIRMED'].includes(apt.status) && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); updateStatus(apt.id, 'CANCELLED'); }}
                                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-rose-600 text-[9px] font-black uppercase tracking-wide transition-all"
                                                                        >
                                                                            <XCircle size={12} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-2 border-t border-white/10 pt-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black leading-none">
                                                                        {apt.doctor?.name?.[0] || 'D'}
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-white/90 truncate max-w-[80px]">{apt.doctor?.name}</span>
                                                                </div>
                                                                <span className="text-[10px] font-bold italic opacity-70 truncate max-w-[80px]">{apt.notes || 'Consulta General'}</span>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(viewMode === 'WEEK' || viewMode === 'MONTH') && (
                                <div className="p-4 grid grid-cols-7 gap-2 min-w-[800px]">
                                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                                        <div key={d} className="text-center p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                                    ))}

                                    {(() => {
                                        const days = [];
                                        const start = new Date(viewDate);

                                        if (viewMode === 'WEEK') {
                                            start.setDate(start.getDate() - start.getDay());
                                            for (let i = 0; i < 7; i++) {
                                                const d = new Date(start);
                                                d.setDate(start.getDate() + i);
                                                days.push(d);
                                            }
                                        } else {
                                            const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
                                            const startPadding = first.getDay();
                                            first.setDate(first.getDate() - startPadding);
                                            for (let i = 0; i < 35; i++) {
                                                const d = new Date(first);
                                                d.setDate(first.getDate() + i);
                                                days.push(d);
                                            }
                                        }

                                        return days.map((d, i) => {
                                            const isToday = d.toDateString() === new Date().toDateString();
                                            const isSelectedMonth = d.getMonth() === viewDate.getMonth();
                                            const dayApts = appointments.filter(a => new Date(a.date).toDateString() === d.toDateString());

                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => { setViewDate(d); setViewMode('DAY'); }}
                                                    className={cn(
                                                        "min-h-[120px] p-3 rounded-2xl border transition-all cursor-pointer",
                                                        isSelectedMonth ? "bg-white border-slate-100 hover:border-cyan-200" : "bg-slate-50 border-transparent opacity-40",
                                                        isToday ? "ring-2 ring-cyan-500 ring-inset" : ""
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "text-xs font-black",
                                                        isToday ? "text-cyan-600" : "text-slate-800"
                                                    )}>{d.getDate()}</span>

                                                    <div className="mt-2 space-y-1">
                                                        {dayApts.slice(0, 3).map(a => (
                                                            <div key={a.id} className={cn(
                                                                "h-1.5 w-full rounded-full",
                                                                a.status === 'CONFIRMED' ? "bg-emerald-500" :
                                                                    a.status === 'CANCELLED' ? "bg-rose-500" : "bg-cyan-500"
                                                            )} />
                                                        ))}
                                                        {dayApts.length > 3 && (
                                                            <div className="text-[8px] font-black text-slate-400">+{dayApts.length - 3} más</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Agendamiento */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] w-full max-w-2xl relative z-10 overflow-hidden border border-white/20 flex flex-col"
                        >
                            <div className="p-8 pb-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nueva Cita Médica</h2>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 italic">Módulo de Programación Clínica</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-rose-500 transition-all"
                                >
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateAppointment} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                                {/* Paciente Selector */}
                                <div className="space-y-3 relative">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Paciente a tratar</label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Buscar por Nombre o DNI..."
                                            value={searchPatient}
                                            onChange={(e) => {
                                                setSearchPatient(e.target.value);
                                                setShowPatientResults(true);
                                                setFormData({ ...formData, patientName: e.target.value, patientId: '' });
                                            }}
                                            className="premium-input pl-12 bg-slate-50 border-slate-200/60"
                                            required
                                        />

                                        {showPatientResults && searchPatient.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 max-h-60 overflow-y-auto overflow-x-hidden">
                                                {filteredPatients.length > 0 ? filteredPatients.map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, patientId: p.id, patientName: `${p.firstName} ${p.paternalSurname}` });
                                                            setSearchPatient(`${p.firstName} ${p.paternalSurname}`);
                                                            setShowPatientResults(false);
                                                        }}
                                                        className="w-full px-5 py-3 hover:bg-cyan-50 flex items-center justify-between text-left transition-colors group"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 uppercase tabular-nums">{p.firstName} {p.paternalSurname}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">DNI: {p.documentId}</p>
                                                        </div>
                                                        <Plus size={14} className="text-cyan-400 opacity-0 group-hover:opacity-100" />
                                                    </button>
                                                )) : (
                                                    <p className="text-[10px] text-slate-400 font-bold italic px-5 py-4">No se encontraron resultados...</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="premium-input bg-slate-50/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hora de inicio</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                            className="premium-input bg-slate-50/50"
                                        />
                                    </div>
                                </div>

                                {/* Doctor selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Especialista / Doctor</label>
                                    <select
                                        value={formData.doctorId}
                                        onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
                                        className="premium-input bg-slate-50/50"
                                        required
                                    >
                                        <option value="">Seleccionar Doctor...</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} {d.role === 'ADMIN' ? '(Admin)' : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Consultorio selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Consultorio / Sillón</label>
                                    <select
                                        value={formData.consultoryId}
                                        onChange={e => setFormData({ ...formData, consultoryId: e.target.value })}
                                        className="premium-input bg-slate-50/50"
                                        required
                                    >
                                        <option value="">Seleccionar Sillón...</option>
                                        {consultories
                                            .filter(c => {
                                                const doc = doctors.find(d => d.id === formData.doctorId);
                                                return !doc?.branchId || c.branchId === doc.branchId;
                                            })
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {/* Motivo + Urgencia + Duración */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Motivo de Consulta</label>
                                        <select value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className="premium-input bg-slate-50/50">
                                            <option value="Primera visita">Primera visita</option>
                                            <option value="Control">Control / Seguimiento</option>
                                            <option value="Urgencia">Urgencia</option>
                                            <option value="Procedimiento">Procedimiento programado</option>
                                            <option value="Consulta">Consulta</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duración estimada</label>
                                        <select value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="premium-input bg-slate-50/50">
                                            <option value="15">15 min</option>
                                            <option value="30">30 min</option>
                                            <option value="45">45 min</option>
                                            <option value="60">60 min</option>
                                            <option value="90">90 min</option>
                                            <option value="120">2 horas</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Urgencia */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nivel de Urgencia</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[{ v: 'NORMAL', l: 'Normal', c: 'border-slate-200 bg-slate-50 text-slate-600', a: 'border-slate-800 bg-slate-800 text-white' },
                                        { v: 'URGENT', l: 'Urgente', c: 'border-amber-200 bg-amber-50 text-amber-600', a: 'border-amber-500 bg-amber-500 text-white' },
                                        { v: 'EMERGENCY', l: 'Emergencia', c: 'border-rose-200 bg-rose-50 text-rose-600', a: 'border-rose-600 bg-rose-600 text-white' }].map(opt => (
                                            <button key={opt.v} type="button"
                                                onClick={() => setFormData({ ...formData, urgency: opt.v })}
                                                className={cn("py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                                    formData.urgency === opt.v ? opt.a : opt.c)}>
                                                {opt.l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notas Adicionales</label>
                                    <textarea
                                        placeholder="Observaciones, indicaciones especiales del paciente..."
                                        rows="3"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        className="premium-input bg-slate-50/50 resize-none py-4"
                                    ></textarea>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 rounded-2xl border-2 border-slate-800 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 transition-all hover:bg-slate-700 active:scale-95"
                                    >
                                        Agendar Cita
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div >
                )}
            </AnimatePresence >

            {/* ── Modal: Bloquear Horario ──────────────────────────────── */}
            <AnimatePresence>
                {showBlockModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowBlockModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-white/20"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                        <Ban size={20} />
                                    </div>
                                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Bloquear Horario</h2>
                                </div>
                                <button onClick={() => setShowBlockModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Formulario */}
                                <form onSubmit={handleCreateBlock} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Médico (opcional — vacío = bloquear toda la sede)</label>
                                        <select
                                            value={blockForm.doctorId}
                                            onChange={e => setBlockForm(f => ({ ...f, doctorId: e.target.value }))}
                                            className="premium-input bg-slate-50"
                                        >
                                            <option value="">Todos los médicos de la sede</option>
                                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                                        <input
                                            type="date" required
                                            value={blockForm.date}
                                            onChange={e => setBlockForm(f => ({ ...f, date: e.target.value }))}
                                            className="premium-input bg-slate-50"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desde</label>
                                            <input type="time" required value={blockForm.startTime}
                                                onChange={e => setBlockForm(f => ({ ...f, startTime: e.target.value }))}
                                                className="premium-input bg-slate-50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasta</label>
                                            <input type="time" required value={blockForm.endTime}
                                                onChange={e => setBlockForm(f => ({ ...f, endTime: e.target.value }))}
                                                className="premium-input bg-slate-50" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo</label>
                                        <input type="text" placeholder="Ej: Reunión, Vacaciones, Mantenimiento..."
                                            value={blockForm.reason}
                                            onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                                            className="premium-input bg-slate-50" />
                                    </div>

                                    <button type="submit" disabled={blockSaving}
                                        className="w-full py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all disabled:opacity-60">
                                        <Ban size={16} /> {blockSaving ? 'Guardando...' : 'Registrar Bloqueo'}
                                    </button>
                                </form>

                                {/* Lista de bloqueos activos */}
                                {blockedSlots.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bloqueos registrados</p>
                                        {blockedSlots.map(b => (
                                            <div key={b.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-2xl border border-rose-100">
                                                <div className="text-xs space-y-0.5">
                                                    <p className="font-black text-rose-700">
                                                        {b.doctor ? b.doctor.name : 'Toda la sede'}
                                                    </p>
                                                    <p className="text-rose-500 font-medium">
                                                        {new Date(b.startAt).toLocaleDateString('es-PE')} · {new Date(b.startAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} — {new Date(b.endAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {b.reason && <p className="text-rose-400 italic">{b.reason}</p>}
                                                </div>
                                                <button onClick={() => handleDeleteBlock(b.id)}
                                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Agenda;
