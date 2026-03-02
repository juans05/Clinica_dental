import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CalendarOff, CheckCircle, Save, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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

                            <span className="w-20 text-xs font-black text-slate-700 uppercase tracking-wider">
                                {DAY_NAMES[day.dayOfWeek]}
                            </span>

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

export default SchedulePanel;
