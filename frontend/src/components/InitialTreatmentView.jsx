import React, { useEffect } from 'react';
import {
    ClipboardList, CheckCircle2, Circle, Loader2, Plus, X,
    ChevronDown, ChevronUp, DollarSign, User, Activity,
    Receipt, Save, Trash2, MoreHorizontal
} from 'lucide-react';
import useTreatmentStore from '../store/useTreatmentStore';
import usePatientStore from '../store/usePatientStore';
import Odontograma from './Odontograma';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const STATUS_COLORS = {
    PENDING: 'bg-slate-400',
    IN_PROGRESS: 'bg-blue-500',
    COMPLETED: 'bg-emerald-500',
    CANCELLED: 'bg-rose-500',
};

const InitialTreatmentView = ({ patientId, onBack }) => {
    const {
        plan,
        loading: treatmentLoading,
        fetchTreatmentData,
        addItem,
        deleteItem,
        getTotals
    } = useTreatmentStore();

    const {
        patient,
        fetchPatient,
        loading: patientLoading
    } = usePatientStore();

    useEffect(() => {
        if (patientId) {
            fetchTreatmentData(patientId);
        }
    }, [patientId, fetchTreatmentData]);

    const totals = getTotals();
    const loading = treatmentLoading || patientLoading;

    const handleAddItem = (serviceId, toothNumber = null) => {
        addItem(patientId, serviceId, toothNumber);
    };

    const handleDeleteItem = (itemId) => {
        deleteItem(patientId, itemId);
    };

    const getAge = (birthDate) => {
        if (!birthDate) return '—';
        const birth = new Date(birthDate);
        const today = new Date();
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
            years--;
            months = (months + 12) % 12;
        }
        return `${years} años y ${months} meses`;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Cargando Tratamiento...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 min-h-screen bg-white text-slate-700 p-2 rounded-[40px]">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-2">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-blue-600 border border-slate-100 shadow-sm">
                        <X size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                            Tratamiento Inicial
                        </h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Expediente Clínico Digital</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                        <Receipt size={14} /> Cobrar
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
                        <DollarSign size={14} /> Abono
                    </button>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
                        <MoreHorizontal size={20} className="rotate-90" />
                    </button>
                </div>
            </div>

            {/* ── Info Summary Bar ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6">
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Paciente</span>
                    <span className="text-sm font-bold text-slate-700">{patient?.firstName} {patient?.paternalSurname}</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Edad</span>
                    <span className="text-sm font-bold text-slate-700">{getAge(patient?.birthDate)}</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Presupuesto</span>
                    <span className="text-sm font-bold text-blue-600">S/ {totals.total.toFixed(2)}</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Saldo Pendiente</span>
                    <span className="text-sm font-bold text-rose-500">S/ {totals.balance.toFixed(2)}</span>
                </div>
            </div>

            {/* ── Main Odontogram Area ── */}
            <div className="bg-white px-6">
                <Odontograma patientId={patientId} />
            </div>
        </div>
    );
};

export default InitialTreatmentView;
