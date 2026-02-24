import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, X, Search, MoreHorizontal, Hash, Info, ClipboardList, Trash2, Activity
} from 'lucide-react';
import useOdontogramStore from '../store/useOdontogramStore';
import useBudgetStore from '../store/useBudgetStore';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// ─── Constants & Helpers ──────────────────────────────────────────
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

const PRIMARY_UPPER_RIGHT = [55, 54, 53, 52, 51];
const PRIMARY_UPPER_LEFT = [61, 62, 63, 64, 65];
const PRIMARY_LOWER_LEFT = [71, 72, 73, 74, 75];
const PRIMARY_LOWER_RIGHT = [85, 84, 83, 82, 81];

const isMolar = n => [16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48, 54, 55, 64, 65, 74, 75, 84, 85].includes(n);
const isPremolar = n => [14, 15, 24, 25, 34, 35, 44, 45].includes(n);
const isCanine = n => [13, 23, 33, 43, 53, 63, 73, 83].includes(n);
const isWisdom = n => [18, 28, 38, 48].includes(n);
const isUpper = n => (n >= 11 && n <= 28) || (n >= 51 && n <= 65);
const isPrimary = n => n >= 51 && n <= 85;

const toothType = n => {
    if (isWisdom(n)) return 'Cordal';
    if (isMolar(n)) return 'Molar';
    if (isPremolar(n)) return 'Premolar';
    if (isCanine(n)) return 'Canino';
    return 'Incisivo';
};

const FINDINGS_LIST = [
    { id: 'CARIES', label: 'Caries', visual: 'surface_filled', color: '#ef4444' },
    { id: 'FILLING', label: 'Obturación', visual: 'surface_filled', color: '#3b82f6' },
    { id: 'CROWN', label: 'Corona', visual: 'circle_full', color: '#facc15' },
    { id: 'EXTRACTION', label: 'Extracción indicada', visual: 'arrow_down_red', color: '#ef4444' },
    { id: 'MISSING', label: 'Diente ausente', visual: 'cross_gray', color: '#94a3b8' },
    { id: 'ROOTCANAL', label: 'Endodoncia', visual: 'root_line', color: '#22c55e' },
    { id: 'IMPLANT', label: 'Implante', visual: 'screw', color: '#06b6d4' },
    { id: 'BRIDGE', label: 'Puente', visual: 'bridge_line', color: '#f97316' },
    { id: 'ORTHO_FIXED', label: 'Aparato ortodóntico fijo', visual: 'ortho_violet', color: '#a855f7' },
    { id: 'FRACTURE', label: 'Fractura', visual: 'slash_black', color: '#000000' },
    { id: 'IMPACTED', label: 'Diente retenido/impactado', visual: 'd_circle', color: '#78350f' },
    { id: 'SEALANT', label: 'Sellante', visual: 'surface_mark', color: '#86efac' },
    { id: 'REM_PROSTHESIS', label: 'Prótesis removible', visual: 'dotted_line', color: '#f472b6' },
    // Otros hallazgos adicionales (opcionales pero útiles)
    { id: 'VENEER', label: 'Carillas', visual: 'veneer', color: '#3b82f6' },
    { id: 'GINGIVITIS', label: 'Gingivitis', visual: 'gingivitis', color: '#ef4444' },
    { id: 'DIASTEMA', label: 'Diastema', visual: 'diastema', color: '#3b82f6' },
];

const EXPERT_COLORS = {
    CARIES: '#ef4444',
    FILLING: '#3b82f6',
    CROWN: '#facc15',
    EXTRACTION: '#ef4444',
    MISSING: '#94a3b8',
    ROOTCANAL: '#22c55e',
    IMPLANT: '#06b6d4',
    BRIDGE: '#f97316',
    ORTHO_FIXED: '#a855f7',
    FRACTURE: '#000000',
    IMPACTED: '#78350f',
    SEALANT: '#86efac',
    REM_PROSTHESIS: '#f472b6',
};

const getConditionData = (condId) => {
    if (typeof condId !== 'string' || !condId || condId === 'HEALTHY') return null;

    // Handle Evolution States
    if (condId === 'CURADO') return { label: 'Curado', color: '#22c55e', bg: '#22c55e15', status: 'GOOD' };
    if (condId === 'PENDIENTE') return { label: 'Pendiente', color: '#facc15', bg: '#facc1515', status: 'NEUTRAL' };
    if (condId === 'CANCELADO') return { label: 'Cancelado', color: '#ef4444', bg: '#ef444415', status: 'BAD' };

    // Check for status suffix for backward compatibility if needed, 
    // but preference is the expert list now
    const parts = condId.split('_');
    const status = parts[parts.length - 1];
    const isStatus = ['GOOD', 'BAD'].includes(status);
    const baseId = isStatus ? parts.slice(0, -1).join('_') : condId;

    const finding = FINDINGS_LIST.find(f => f.id === baseId);
    if (!finding) return null;

    // Expert color has preference
    const color = EXPERT_COLORS[baseId] || finding.color || '#64748b';
    const bg = color + '15'; // 8% opacity for background

    return {
        ...finding,
        color,
        bg,
        status: isStatus ? status : (baseId === 'CARIES' ? 'BAD' : 'NEUTRAL')
    };
};

const FindingIcon = ({ type, color = '#3b82f6' }) => {
    switch (type) {
        case 'ortho_fixed':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
                    <rect x="4" y="10" width="4" height="4" />
                    <rect x="16" y="10" width="4" height="4" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="6" y1="10" x2="6" y2="14" strokeWidth="1" />
                    <line x1="18" y1="10" x2="18" y2="14" strokeWidth="1" />
                    <text x="6" y="13.5" fontSize="3" textAnchor="middle" fill={color} fontWeight="bold">+</text>
                    <text x="18" y="13.5" fontSize="3" textAnchor="middle" fill={color} fontWeight="bold">+</text>
                </svg>
            );
        case 'ortho_rem':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
                    <path d="M5 15 L12 8 L19 15" />
                </svg>
            );
        case 'veneer':
            return (
                <div className="w-5 h-5 rounded-b-full border-2" style={{ borderColor: color, backgroundColor: color }} />
            );
        case 'veneer_multi':
            return (
                <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-b-full border-2" style={{ borderColor: color, backgroundColor: color }} />
                    <div className="w-1 h-3 flex items-center justify-center text-[8px]" style={{ color }}>--</div>
                    <div className="w-3 h-3 rounded-b-full border-2" style={{ borderColor: color, backgroundColor: color }} />
                </div>
            );
        case 'crown':
            return <div className="w-5 h-5 border-2" style={{ borderColor: color }} />;
        case 'crown_temp':
            return <div className="w-5 h-5 border-2" style={{ borderColor: '#ef4444' }} />;
        case 'circle_yellow':
            return <div className="w-4 h-4 rounded-full bg-yellow-400" />;
        case 'diastema':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
                    <path d="M8 8 C 12 10, 12 14, 8 16" />
                    <path d="M16 8 C 12 10, 12 14, 16 16" />
                </svg>
            );
        case 'bar':
            return <div className="w-6 h-1 mt-2" style={{ backgroundColor: color }} />;
        case 'root_canal':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
                    <path d="M12 7 Q 14 12, 12 18" />
                    <path d="M12 18 L10 21 L14 21 Z" fill={color} stroke="none" />
                </svg>
            );
        case 'post_core':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <rect x="10" y="16" width="4" height="3" fill={color} stroke="none" />
                </svg>
            );
        case 'cross_red':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
            );
        case 'ffp':
            return <span className="text-[10px] font-black" style={{ color }}>FFP</span>;
        case 'slash_red':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1">
                    <line x1="8" y1="18" x2="16" y2="6" />
                </svg>
            );
        case 'frenulum':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                    <path d="M8 18 C 8 12, 11 12, 11 18" />
                    <path d="M16 18 C 16 12, 13 12, 13 18" />
                </svg>
            );
        case 'fusion':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
                    <ellipse cx="9" cy="12" rx="5" ry="3" />
                    <ellipse cx="15" cy="12" rx="5" ry="3" />
                </svg>
            );
        case 'gemination':
            return <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: color }} />;
        case 'gingivitis':
            return (
                <div className="relative flex flex-col items-center">
                    <span className="text-[8px] font-black absolute -top-3" style={{ color }}>G</span>
                    <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke={color} strokeWidth="1.5">
                        <path d="M4 10 Q 12 2, 20 10" />
                    </svg>
                </div>
            );
        case 'giroversion':
            return (
                <div className="flex gap-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3" />
                        <polyline points="17 16 21 12 17 8" />
                    </svg>
                </div>
            );
        case 'imp':
            return <span className="text-[10px] font-black" style={{ color }}>IMP</span>;
        case 'post_fiber':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M10 18 L14 18 L13 6 L11 6 Z" fill={color} />
                    <line x1="10.5" y1="17" x2="13.5" y2="17" stroke="yellow" strokeWidth="1.5" />
                </svg>
            );
        case 'post_metal':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M10 18 L14 18 L13 6 L11 6 Z" fill={color} />
                    <g stroke="white" strokeWidth="0.5">
                        <line x1="11" y1="8" x2="13" y2="10" />
                        <line x1="11" y1="11" x2="13" y2="13" />
                        <line x1="11" y1="14" x2="13" y2="16" />
                    </g>
                </svg>
            );
        case 'arrow_down':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
                    <path d="M12 20 L6 12 L11 12 L11 4 L13 4 L13 12 L18 12 Z" />
                </svg>
            );
        case 'arrow_up':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
                    <path d="M12 4 L18 12 L13 12 L13 20 L11 20 L11 12 L6 12 Z" />
                </svg>
            );
        case 'supernumerary':
            return (
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center font-black text-[12px]" style={{ borderColor: color, color }}>
                    S
                </div>
            );
        case 'cross_blue':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
            );
        case 'peg':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                    <path d="M12 4 L20 18 L4 18 Z" />
                </svg>
            );
        case 'erupting':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
                    <path d="M12 4 L14 8 L10 12 L14 16 L12 20" />
                    <polyline points="10 18 12 20 14 18" />
                </svg>
            );
        case 'fixed_prost':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                    <path d="M5 16 V8 H19 V16" />
                </svg>
            );
        case 'temp_restoration':
            return (
                <div className="relative w-6 h-6 border-2 flex items-center justify-center border-slate-100" style={{ boxShadow: '0 0 0 1px #cbd5e1' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="0.5">
                        <line x1="0" y1="0" x2="24" y2="24" />
                        <line x1="24" y1="0" x2="0" y2="24" />
                    </svg>
                    <div className="absolute w-3 h-3 border-2 rounded-sm" style={{ borderColor: color }} />
                </div>
            );
        case 'sealant':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
                    <path d="M12 4 L14 10 L20 12 L14 14 L12 20 L10 14 L4 12 L10 10 Z" />
                </svg>
            );
        case 'click':
            return <span className="text-[10px] font-black border border-slate-200 px-2 py-1 rounded" style={{ color: '#475569' }}>Click</span>;
        default:
            return <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />;
    }
};

const sc = (tooth, s) => {
    if (!tooth || !tooth.surfaces) return null;
    const items = tooth.surfaces[s] || [];
    if (items.length === 0) return null;

    // Prioridad: BAD (Rojo) > GOOD (Azul) > NEUTRAL
    const dataList = items.map(id => getConditionData(id)).filter(Boolean);
    const bad = dataList.find(d => d.status === 'BAD' || d.id === 'CARIES' || d.id === 'FRACTURE');
    if (bad) return bad.color;
    const good = dataList.find(d => d.status === 'GOOD');
    if (good) return good.color;
    return dataList[0]?.color || null;
};

const ToothDetailModal = ({ tooth, number, onClose, onMarkTooth, onMarkSurface, onSetNote, patientId }) => {
    if (!tooth) return null;

    const { fetchToothHistory, toothHistory } = useOdontogramStore();
    const { syncToothToBudget, fetchServices } = useBudgetStore();
    const { user } = useAuth();
    const [note, setNote] = React.useState(tooth.notes || '');
    const [syncing, setSyncing] = React.useState(false);

    React.useEffect(() => {
        fetchToothHistory(patientId, number);
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [number]);

    const handleSync = async () => {
        setSyncing(true);
        const res = await syncToothToBudget(patientId, user.id, number, tooth);
        setSyncing(false);
        alert(res.message);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 bg-gradient-to-r from-slate-50 to-white border-b flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">
                            {number}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">Gestión de Pieza Dental</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Detalle Clínico FDI
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600 active:scale-95">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 custom-scrollbar">
                    {/* Left Column: Interactive Map */}
                    <div className="space-y-6">
                        <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Mapa de Superficies</h3>
                            <div className="flex justify-center py-4">
                                <div className="relative w-36 h-36 flex items-center justify-center">
                                    {['V', 'L', 'M', 'D', 'O'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => onMarkSurface(number, s)}
                                            className={cn(
                                                "absolute border-2 transition-all flex items-center justify-center text-[11px] font-black shadow-sm",
                                                tooth.surfaces[s]?.length > 0
                                                    ? "bg-blue-600 border-blue-700 text-white shadow-blue-200 scale-105"
                                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:scale-105"
                                            )}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                top: s === 'V' ? '0' : (s === 'L' ? 'auto' : '50%'),
                                                bottom: s === 'L' ? '0' : 'auto',
                                                left: s === 'M' ? '0' : (s === 'D' ? 'auto' : '50%'),
                                                right: s === 'D' ? '0' : 'auto',
                                                transform: (s === 'V' || s === 'L') ? 'translateX(-50%)' : ((s === 'M' || s === 'D') ? 'translateY(-50%)' : 'translate(-50%, -50%)'),
                                                zIndex: s === 'O' ? 10 : 5
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[9px] text-center text-slate-400 mt-6 font-bold uppercase tracking-tight">V: Vestibular | L: Lingual | M: Mesial | D: Distal</p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Notas Clínicas</h3>
                            <textarea
                                value={note}
                                onChange={e => {
                                    setNote(e.target.value);
                                    onSetNote(number, e.target.value);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-300 resize-none h-32 transition-all"
                                placeholder="Añadir observaciones sobre la pieza..."
                            />
                        </div>
                    </div>

                    {/* Middle Column: Findings & Selector */}
                    <div className="space-y-6 lg:border-x lg:px-8 border-slate-100">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Añadir Condición</h3>
                            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar content-start">
                                {FINDINGS_LIST.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => onMarkTooth(number, f.id)}
                                        className={cn(
                                            "p-3 rounded-xl border text-[10px] font-bold transition-all text-left flex flex-col gap-1.5",
                                            tooth.conditions.includes(f.id)
                                                ? "bg-slate-800 border-slate-900 text-white shadow-lg shadow-slate-200"
                                                : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                                            <span className="truncate">{f.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <ClipboardList size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-400 uppercase italic">Acción Rápida</p>
                                    <button
                                        onClick={handleSync}
                                        disabled={syncing}
                                        className={cn(
                                            "text-[11px] font-bold text-blue-700 hover:underline",
                                            syncing && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {syncing ? 'Sincronizando...' : 'Sincronizar con Presupuesto'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: History & Current */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                                Historial Clínico <Activity size={14} className="text-indigo-400" />
                            </h3>
                            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar bg-slate-50/30 rounded-3xl p-4 border border-slate-50 shadow-inner">
                                {toothHistory && toothHistory.length > 0 ? (
                                    toothHistory.map((log, idx) => (
                                        <div key={log.id} className="flex gap-4 relative pb-5 last:pb-0">
                                            {idx !== toothHistory.length - 1 && (
                                                <div className="absolute top-2 left-[5px] w-[1px] h-full bg-slate-200" />
                                            )}
                                            <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-400 z-10 mt-1 shadow-sm" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="text-[10px] font-black text-slate-700 leading-tight flex-1">{log.description}</p>
                                                    <span className="text-[8px] font-medium text-slate-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{log.doctor?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center bg-white/50 rounded-2xl border border-dashed border-slate-100">
                                        <p className="text-[10px] text-slate-300 italic">Sin registros de evolución anteriores.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Hallazgos Activos</h3>
                            <div className="space-y-2">
                                {(() => {
                                    const allIds = [...(tooth.conditions || [])];
                                    Object.values(tooth.surfaces || {}).forEach(arr => {
                                        if (Array.isArray(arr)) allIds.push(...arr);
                                    });
                                    const uniqueIds = [...new Set(allIds)].filter(id => id !== 'SELECT');

                                    if (uniqueIds.length === 0) {
                                        return <p className="text-[10px] text-slate-300 italic pl-2">No hay hallazgos activos.</p>;
                                    }

                                    return uniqueIds.map(id => {
                                        const cond = getConditionData(id);
                                        return (
                                            <motion.div
                                                layout
                                                key={id}
                                                className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cond?.color }} />
                                                    <span className="text-xs font-bold text-slate-700">{cond?.label}</span>
                                                </div>
                                                <button onClick={() => onMarkTooth(number, id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </motion.div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[12px] font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        LISTO
                    </button>
                </div>
            </motion.div>
        </div>
    );
};



const EvolutionPopover = ({ anchor, onClose, onSelect, currentState }) => {
    const states = [
        { id: 'CURADO', label: 'Curado', color: '#22c55e', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
        { id: 'PENDIENTE', label: 'Pendiente de curar', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
        { id: 'CANCELADO', label: 'Cancelado', color: '#94a3b8', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed z-[100] w-64 rounded-2xl shadow-2xl border bg-white border-slate-200 overflow-hidden"
            style={{ top: anchor.y, left: anchor.x }}
        >
            <div className="p-4 bg-slate-50 border-b">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de Evolución</h4>
            </div>
            <div className="p-2 space-y-1">
                {states.map(s => (
                    <button
                        key={s.id}
                        onClick={() => onSelect(s.id)}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all border",
                            currentState === s.id
                                ? `${s.bg} ${s.border} ${s.text} shadow-sm`
                                : "bg-white border-transparent hover:bg-slate-50 text-slate-600"
                        )}
                    >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-xs font-bold">{s.label}</span>
                    </button>
                ))}
                <button
                    onClick={() => onSelect(null)}
                    className="w-full h-10 flex items-center gap-3 px-3 rounded-xl transition-all border border-transparent hover:bg-red-50 group"
                >
                    <Trash2 size={14} className="text-red-300 group-hover:text-red-500" />
                    <span className="text-xs font-bold text-red-400 group-hover:text-red-500">Quitar estado</span>
                </button>
            </div>
        </motion.div>
    );
};

const ToothSVG = ({ number, data, isSelected, onTooth, onSurface, mode = 'INITIAL' }) => {
    const isUpperTooth = isUpper(number);
    const isMolarTooth = isMolar(number);
    const isPremolarTooth = isPremolar(number);

    const W = 55;
    const H = 100;
    const padding = 2;

    // Crown dimensions
    const cH = 45;
    const cW = W - (padding * 2);
    const cY = isUpperTooth ? H - cH : 0;

    // Root dimensions
    const rH = H - cH;
    const rY = isUpperTooth ? 0 : cH;

    const missing = (data?.conditions || []).some(c => c.startsWith('MISSING'));
    const allConditions = (data?.conditions || []).map(c => getConditionData(c)).filter(Boolean);

    // Choose main icon to display (priority to BAD/Critical)
    const badCond = allConditions.find(d => d.status === 'BAD' || d.id === 'EXTRACTION' || d.id === 'FRACTURE');
    const cond = badCond || allConditions[0];

    // Crown Center
    const mx = W / 2;
    const my = cY + (cH / 2);
    const offset = 10;

    // Surfaces polygons
    const surf = {
        V: isUpperTooth
            ? `${padding},${cY} ${W - padding},${cY} ${mx},${my}` // Top for upper
            : `${padding},${cY + cH} ${W - padding},${cY + cH} ${mx},${my}`, // Bottom for lower
        L: isUpperTooth
            ? `${padding},${cY + cH} ${W - padding},${cY + cH} ${mx},${my}`
            : `${padding},${cY} ${W - padding},${cY} ${mx},${my}`,
        M: `${padding},${cY} ${padding},${cY + cH} ${mx},${my}`,
        D: `${W - padding},${cY} ${W - padding},${cY + cH} ${mx},${my}`,
        O: `${mx - offset},${my - offset} ${mx + offset},${my - offset} ${mx + offset},${my + offset} ${mx - offset},${my + offset}`,
    };

    // Root Polygons (Schematic)
    let rootPoints = "";
    if (isUpperTooth) {
        if (isMolarTooth) {
            // 3 roots for upper molars
            rootPoints = `${padding},${cY} ${padding + cW / 6},${0} ${padding + cW / 3},${cY} ${mx},${0} ${padding + 2 * cW / 3},${cY} ${padding + 5 * cW / 6},${0} ${W - padding},${cY}`;
        } else if ([14, 24].includes(number)) {
            // 2 roots for premolars 14 and 24
            rootPoints = `${padding},${cY} ${mx - 8},${0} ${mx},${cY} ${mx + 8},${0} ${W - padding},${cY}`;
        } else {
            // 1 root for others
            rootPoints = `${mx - 15},${cY} ${mx},${0} ${mx + 15},${cY}`;
        }
    } else {
        if (isMolarTooth) {
            // 2 roots for lower molars
            rootPoints = `${padding},${cY + cH} ${mx - 8},${H} ${mx},${cY + cH} ${mx + 8},${H} ${W - padding},${cY + cH}`;
        } else {
            // 1 root for others
            rootPoints = `${mx - 15},${cY + cH} ${mx},${H} ${mx + 15},${cY + cH}`;
        }
    }

    const borderColor = isSelected ? '#3b82f6' : '#64748b';
    const borderWidth = isSelected ? 2 : 1;

    // Build tooltip text
    const tooltipText = `Diente ${number}\n${allConditions.map(c => c.label).join(', ')}`;

    return (
        <div className="flex flex-col items-center select-none group" title={tooltipText}>
            {/* Tooth Number Box */}
            <div className={cn(
                "w-full py-1 mb-2 border-x flex justify-center transition-all",
                data?.evolutionState === 'CURADO' ? "bg-green-500 border-green-600 text-white shadow-lg" :
                    data?.evolutionState === 'PENDIENTE' ? "bg-amber-500 border-amber-600 text-white shadow-lg" :
                        data?.evolutionState === 'CANCELADO' ? "bg-slate-400 border-slate-500 text-white shadow-lg" :
                            "bg-slate-100 border-slate-200 text-slate-600"
            )}>
                <span className="text-[11px] font-black">{number}</span>
            </div>

            <svg
                width={W} height={H}
                viewBox={`0 0 ${W} ${H}`}
                className={cn("block cursor-pointer overflow-visible")}
                onClick={(e) => onTooth(number, e)}
            >
                {/* Root */}
                {isMolarTooth && isUpperTooth ? (
                    <polyline points={rootPoints} fill="none" stroke={borderColor} strokeWidth={borderWidth} />
                ) : (
                    <polygon points={rootPoints} fill="none" stroke={borderColor} strokeWidth={borderWidth} />
                )}

                {/* Crown Border */}
                <rect
                    x={padding} y={cY} width={cW} height={cH}
                    fill="white"
                    stroke={borderColor} strokeWidth={borderWidth}
                />

                {missing || (data?.conditions || []).includes('MISSING') ? (
                    <g stroke="#94a3b8" strokeWidth={2} strokeLinecap="round">
                        <line x1={padding + 5} y1={cY + 5} x2={W - padding - 5} y2={cY + cH - 5} />
                        <line x1={W - padding - 5} y1={cY + 5} x2={padding + 5} y2={cY + cH - 5} />
                    </g>
                ) : (
                    <g>
                        {['V', 'L', 'M', 'D', 'O'].map(s => {
                            const fill = sc(data, s);
                            const items = data?.surfaces[s] || [];
                            const isSealant = items.includes('SEALANT');

                            return (
                                <g key={s}>
                                    <polygon points={surf[s]}
                                        fill={fill || "transparent"}
                                        onClick={e => { e.stopPropagation(); onSurface(number, s, e); }}
                                        className="hover:fill-slate-100 transition-colors"
                                    />
                                    {isSealant && (
                                        <circle cx={s === 'O' ? mx : (s === 'M' ? padding + 5 : (s === 'D' ? W - padding - 5 : mx))}
                                            cy={s === 'O' ? my : (s === 'V' ? (isUpperTooth ? cY + 5 : cY + cH - 5) : my)}
                                            r="3" fill="#86efac" className="pointer-events-none" />
                                    )}
                                </g>
                            );
                        })}

                        {/* Surface Inner Borders */}
                        {['V', 'L', 'M', 'D'].map(s => (
                            <polygon key={`b${s}`} points={surf[s]}
                                fill="none" stroke="#cbd5e1" strokeWidth="0.5"
                                className="pointer-events-none"
                            />
                        ))}
                        <polygon points={surf.O} fill="none" stroke="#cbd5e1" strokeWidth="0.5" className="pointer-events-none" />

                        {/* Oclusal Grid Lines */}
                        {isMolarTooth ? (
                            <g stroke="#cbd5e1" strokeWidth="0.5" className="pointer-events-none">
                                <line x1={mx - offset / 3} y1={my - offset} x2={mx - offset / 3} y2={my + offset} />
                                <line x1={mx + offset / 3} y1={my - offset} x2={mx + offset / 3} y2={my + offset} />
                                <line x1={mx - offset} y1={my} x2={mx + offset} y2={my} />
                            </g>
                        ) : isPremolarTooth ? (
                            <g stroke="#cbd5e1" strokeWidth="0.5" className="pointer-events-none">
                                <line x1={mx - offset} y1={my - offset / 3} x2={mx + offset} y2={my - offset / 3} />
                                <line x1={mx - offset} y1={my + offset / 3} x2={mx + offset} y2={my + offset / 3} />
                            </g>
                        ) : (
                            <g stroke="#cbd5e1" strokeWidth="0.5" className="pointer-events-none">
                                <line x1={mx - offset} y1={my} x2={mx + offset} y2={my} />
                            </g>
                        )}

                        {/* Overlays Section */}
                        {allConditions.map((cond, idx) => {
                            const color = cond.color;
                            const isUpper = isUpperTooth;

                            // Expert Condition-specific overlays
                            switch (cond.id) {
                                case 'CROWN':
                                    return (
                                        <circle key={idx} cx={mx} cy={my} r={cH / 1.8}
                                            fill="none" stroke={color} strokeWidth="3" />
                                    );
                                case 'EXTRACTION':
                                    return (
                                        <g key={idx}>
                                            <path d={`M${mx},${isUpper ? cY - 10 : cY + cH + 10} v${isUpper ? 20 : -20} l-5,${isUpper ? -6 : 6} m5,${isUpper ? 6 : -6} l5,${isUpper ? -6 : 6}`}
                                                fill="none" stroke={color} strokeWidth="3" />
                                        </g>
                                    );
                                case 'IMPACTED':
                                    return (
                                        <g key={idx}>
                                            <circle cx={mx} cy={my} r={cH / 2.5} fill="none" stroke={color} strokeWidth="1.5" />
                                            <text x={mx} y={my + 4} fontSize="12" textAnchor="middle" fill={color} fontWeight="bold">D</text>
                                        </g>
                                    );
                                case 'IMPLANT':
                                    return (
                                        <g key={idx}>
                                            <path d={`M${mx - 4},${isUpper ? 5 : H - 25} h8 v15 l-4,5 l-4,-5 z`} fill={color} />
                                            <line x1={mx - 4} y1={isUpper ? 10 : H - 20} x2={mx + 4} y2={isUpper ? 10 : H - 20} stroke="white" strokeWidth="1" />
                                            <line x1={mx - 4} y1={isUpper ? 15 : H - 15} x2={mx + 4} y2={isUpper ? 15 : H - 15} stroke="white" strokeWidth="1" />
                                        </g>
                                    );
                                case 'BRIDGE':
                                    return (
                                        <line key={idx} x1={-10} y1={my} x2={W + 10} y2={my} stroke={color} strokeWidth="3" />
                                    );
                                case 'REM_PROSTHESIS':
                                    return (
                                        <line key={idx} x1={-10} y1={my} x2={W + 10} y2={my} stroke={color} strokeWidth="2.5" strokeDasharray="4,4" />
                                    );
                                case 'ORTHO_FIXED':
                                    return (
                                        <g key={idx}>
                                            <line x1={-5} y1={my} x2={W + 5} y2={my} stroke={color} strokeWidth="2" />
                                            <rect x={mx - 3} y={my - 3} width={6} height={6} fill={color} />
                                            <rect x={mx - 1} y={my - 1} width={2} height={2} fill="white" />
                                        </g>
                                    );
                                case 'ROOTCANAL':
                                    const jY = isUpper ? cY : cY + cH;
                                    const dY = isUpper ? -5 : 5;
                                    return (
                                        <g key={idx}>
                                            <line x1={mx} y1={jY} x2={mx} y2={jY + dY * 8} stroke={color} strokeWidth="3" />
                                        </g>
                                    );
                                case 'FRACTURE':
                                    return (
                                        <line key={idx} x1={padding} y1={cY} x2={W - padding} y2={cY + cH} stroke={color} strokeWidth="3" />
                                    );
                                case 'VENEER':
                                    return (
                                        <path key={idx} d={isUpper
                                            ? `M${padding},${cY + cH} V${cY + 10} Q${mx},${cY} ${W - padding},${cY + 10} V${cY + cH} Z`
                                            : `M${padding},${cY} V${cY + cH - 10} Q${mx},${cY + cH} ${W - padding},${cY + cH - 10} V${cY} Z`
                                        } fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.5" />
                                    );
                                case 'DIASTEMA':
                                    return (
                                        <g key={idx} stroke={color} strokeWidth="2">
                                            <path d={`M${padding},${my - 5} Q${padding - 5},${my} ${padding},${my + 5}`} fill="none" />
                                            <path d={`M${W - padding},${my - 5} Q${W - padding + 5},${my} ${W - padding},${my + 5}`} fill="none" />
                                        </g>
                                    );
                                case 'GINGIVITIS':
                                    return (
                                        <path key={idx} d={isUpper
                                            ? `M${padding},${cY} Q${mx},${cY + 10} ${W - padding},${cY}`
                                            : `M${padding},${cY + cH} Q${mx},${cY + cH - 10} ${W - padding},${cY + cH}`
                                        } fill="none" stroke={color} strokeWidth="2.5" />
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </g>
                )}
            </svg>
        </div>
    );
};

const Odontograma = ({ patientId }) => {
    const {
        teeth,
        selected,
        isTemporary,
        loading,
        saving,
        dirty,
        fetchOdontogram,
        saveOdontogram,
        resetOdontogram,
        markTooth,
        markSurface,
        setNote,
        setIsTemporary,
        setSelected,
        activeMode,
        setActiveMode,
        setEvolutionState
    } = useOdontogramStore();

    const { user } = useAuth();
    const { createBudgetFromOdontogram } = useBudgetStore();
    const navigate = useNavigate();

    const [activeOdoTab, setActiveOdoTab] = React.useState('initial');
    const [saved, setSaved] = React.useState(false);
    const [evolutionPopover, setEvolutionPopover] = React.useState(null);
    const [detailTooth, setDetailTooth] = React.useState(null);

    React.useEffect(() => {
        if (patientId) fetchOdontogram(patientId);
    }, [patientId]);

    const handleSave = async () => {
        if (patientId) {
            await saveOdontogram(patientId);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const onToothClick = (n, e) => {
        if (activeMode === 'EVOLUTION') {
            const rect = e.currentTarget.getBoundingClientRect();
            setEvolutionPopover({
                anchor: { x: rect.left, y: rect.top + rect.height + 5 },
                number: n
            });
            setSelected(n);
        } else {
            setDetailTooth({ number: n, data: teeth[n] });
            setSelected(n);
        }
    };

    const onSurfaceClick = (n, s, e) => {
        if (activeMode === 'EVOLUTION') {
            onToothClick(n, e); // In evolution mode, surface click acts like tooth click
            return;
        }
        // Redirect surface click to the main tooth detail modal as requested
        onToothClick(n, e);
    };


    const handleEvolutionSelect = (state) => {
        if (!evolutionPopover) return;
        setEvolutionState(evolutionPopover.number, state);
        setEvolutionPopover(null);
    };

    const handleExportPDF = () => {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            import('jspdf').then(({ default: jsPDF }) => {
                const doc = new jsPDF();
                generatePDF(doc);
            });
        } else {
            const doc = new jsPDF();
            generatePDF(doc);
        }
    };

    const generatePDF = (doc) => {
        doc.setFontSize(20);
        doc.text('REPORTE DE ODONTOGRAMA', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`Modo: ${activeMode === 'INITIAL' ? 'Inicial' : 'Evolución'}`, 20, 35);

        // Simplified visual representation
        let y = 50;
        doc.text('REPRESENTACIÓN VISUAL (ESQUEMÁTICA)', 20, y);
        y += 10;

        const drawRow = (nums, rowY) => {
            nums.forEach((n, i) => {
                const tooth = teeth[n];
                const x = 20 + (i * 12);
                doc.setDrawColor(200);
                doc.rect(x, rowY, 10, 15);
                doc.setFontSize(6);
                doc.text(n.toString(), x + 2, rowY + 5);

                if (activeMode === 'EVOLUTION' && tooth.evolutionState) {
                    const color = tooth.evolutionState === 'CURADO' ? [34, 197, 94] : (tooth.evolutionState === 'PENDIENTE' ? [245, 158, 11] : [148, 163, 184]);
                    doc.setFillColor(color[0], color[1], color[2]);
                    doc.rect(x + 1, rowY + 6, 8, 8, 'F');
                } else if (tooth.conditions.length > 0) {
                    doc.setFillColor(239, 68, 68);
                    doc.rect(x + 1, rowY + 6, 8, 8, 'F');
                }
            });
        };

        drawRow(UPPER_RIGHT.concat(UPPER_LEFT), y);
        drawRow(LOWER_RIGHT.concat(LOWER_LEFT), y + 25);

        y += 60;
        doc.setFontSize(12);
        doc.text('DETALLE DE HALLAZGOS', 20, y);
        y += 10;

        const tableDataPDF = tableData.map(item => [
            item.n,
            getConditionData(item.cond)?.label || item.cond,
            item.surface || 'Pieza',
            item.notes || '-'
        ]);

        if (window.jspdf?.autoTable) {
            window.jspdf.autoTable(doc, {
                startY: y,
                head: [['Diente', 'Hallazgo', 'Ubicación', 'Notas']],
                body: tableDataPDF,
                theme: 'grid'
            });
        } else {
            tableDataPDF.forEach(row => {
                doc.text(`${row[0]} - ${row[1]} (${row[2]})`, 20, y);
                y += 7;
            });
        }

        doc.save(`Odontograma_${patientId}_${activeMode}.pdf`);
    };


    const renderRow = (nums, upper) => (
        <div className="flex gap-[1px]">
            {nums.map(n => (
                <ToothSVG key={n} number={n} data={teeth[n]}
                    mode={activeMode}
                    isSelected={selected === n}
                    onTooth={onToothClick} onSurface={onSurfaceClick} />
            ))}
        </div>
    );

    // Filter findings for the table
    const tableData = Object.entries(teeth).flatMap(([n, t]) => {
        const findings = [];
        if (!t) return findings;

        // Add Evolution State if relevant
        if (t.evolutionState && t.evolutionState !== 'NONE' && activeMode === 'EVOLUTION') {
            findings.push({ n, type: 'EVOLUTION', cond: t.evolutionState, notes: t.notes });
        }

        // Conditions (Tooth level)
        (t.conditions || []).forEach(cond => {
            findings.push({ n, type: 'TOOTH', cond, notes: t.notes });
        });
        // Surfaces level
        Object.entries(t.surfaces || {}).forEach(([s, items]) => {
            (items || []).forEach(cond => {
                findings.push({ n, type: 'SURFACE', surface: s, cond, notes: t.notes });
            });
        });
        return findings;
    });

    return (
        <div className="pt-2">
            <AnimatePresence>
                {evolutionPopover && (
                    <div onClick={e => e.stopPropagation()}>
                        <EvolutionPopover
                            anchor={evolutionPopover.anchor}
                            onClose={() => setEvolutionPopover(null)}
                            currentState={teeth[evolutionPopover.number]?.evolutionState}
                            onSelect={handleEvolutionSelect}
                        />
                    </div>
                )}
                {detailTooth && (
                    <ToothDetailModal
                        number={detailTooth.number}
                        tooth={teeth[detailTooth.number]}
                        patientId={patientId}
                        onClose={() => setDetailTooth(null)}
                        onMarkTooth={markTooth}
                        onMarkSurface={markSurface}
                        onSetNote={setNote}
                    />
                )}
            </AnimatePresence>

            {/* ── Top Tabs & Legend ── */}
            <div className="flex items-center justify-between border-b border-slate-200 mb-8">
                <div className="flex gap-8 items-center">
                    {[
                        { id: 'INITIAL', label: 'Odo. Inicial' },
                        { id: 'EVOLUTION', label: 'Odo. Evolución' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMode(tab.id)}
                            className={cn(
                                "pb-3 text-[13px] font-bold transition-all relative",
                                activeMode === tab.id ? "text-blue-600" : "text-slate-400"
                            )}>
                            {tab.label}
                            {activeMode === tab.id && <div className="absolute bottom-0 inset-x-0 h-1 bg-cyan-400" />}
                        </button>
                    ))}

                    <div className="h-4 w-[1px] bg-slate-200 mx-2" />

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setIsTemporary(false)}
                            className={cn("px-4 py-1.5 rounded-lg text-[11px] font-black transition-all", !isTemporary ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}>
                            ADULTO
                        </button>
                        <button
                            onClick={() => setIsTemporary(true)}
                            className={cn("px-4 py-1.5 rounded-lg text-[11px] font-black transition-all", isTemporary ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}>
                            NIÑO
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6 pb-2">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="text-[11px] font-bold text-slate-500">Mal estado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <span className="text-[11px] font-bold text-slate-500">Buen estado</span>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm('¿Estás seguro de que deseas limpiar todo el odontograma? Esta acción no se puede deshacer.')) {
                                resetOdontogram();
                            }
                        }}
                        className="px-4 py-1.5 bg-red-50 rounded-lg text-[12px] font-bold text-red-500 hover:bg-red-100 transition-colors border border-red-100">
                        Nuevo odontog.
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={20} className="rotate-90" />
                    </button>
                </div>
            </div>

            {/* ── Sub Header Buttons ── */}
            <div className="flex justify-end gap-3 mb-8">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                    <Hash size={14} /> Marcado múltiple
                </button>
                <button
                    onClick={async () => {
                        if (window.confirm('¿Deseas generar un presupuesto automático basado en los hallazgos actuales?')) {
                            const budget = await createBudgetFromOdontogram(patientId, user?.id, teeth);
                            if (budget) {
                                navigate(`/expediente/${patientId}/budgets`);
                            } else {
                                alert('No se encontraron hallazgos que requieran tratamiento o no hay servicios configurados.');
                            }
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <span className="text-blue-600 font-black">$</span> Crear presupuesto
                </button>
                <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <ClipboardList size={14} /> Exportar PDF
                </button>
                <button className="p-2 text-slate-400 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Info size={16} />
                </button>
            </div>

            {/* ── Dental Chart ── */}
            <div className="flex flex-col items-center gap-10 mb-12 overflow-x-auto py-4 min-h-[500px] justify-center">
                {isTemporary ? (
                    <>
                        {/* Pediatric Upper Row */}
                        <div className="flex gap-4">
                            {renderRow([55, 54, 53, 52, 51], true)}
                            <div className="w-[1px] bg-slate-200 self-stretch my-2" />
                            {renderRow([61, 62, 63, 64, 65], true)}
                        </div>
                        {/* Pediatric Lower Row */}
                        <div className="flex gap-4">
                            {renderRow([85, 84, 83, 82, 81], false)}
                            <div className="w-[1px] bg-slate-200 self-stretch my-2" />
                            {renderRow([71, 72, 73, 74, 75], false)}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Adult Upper Row */}
                        <div className="flex gap-4">
                            {renderRow(UPPER_RIGHT, true)}
                            <div className="w-[1px] bg-slate-200 self-stretch my-2" />
                            {renderRow(UPPER_LEFT, true)}
                        </div>
                        {/* Adult Lower Row */}
                        <div className="flex gap-4">
                            {renderRow(LOWER_RIGHT, false)}
                            <div className="w-[1px] bg-slate-200 self-stretch my-2" />
                            {renderRow(LOWER_LEFT, false)}
                        </div>
                    </>
                )}
            </div>

            {/* ── Treatment Plan Table ── */}
            <div className="mt-12">
                <h3 className="text-[18px] font-bold text-slate-700 mb-4">Plan de tratamiento</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#334e68] text-white">
                            <tr>
                                <th className="px-6 py-4 text-[13px] font-bold border-r border-slate-600">N° diente</th>
                                <th className="px-6 py-4 text-[13px] font-bold border-r border-slate-600">Hallazgo / Estado</th>
                                <th className="px-6 py-4 text-[13px] font-bold border-r border-slate-600">Servicios / Pago</th>
                                <th className="px-6 py-4 text-[13px] font-bold">Nota</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {tableData.length > 0 ? tableData.map((item, idx) => {
                                const cond = getConditionData(item.cond);
                                return (
                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-[12px] font-bold text-slate-600">{item.n} {item.surface ? `(${item.surface})` : ''}</td>
                                        <td className="px-6 py-3">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: cond?.bg, color: cond?.color }}>
                                                {cond?.label || item.cond}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-[12px] font-medium text-slate-500">
                                            {item.cond === 'CURADO' ? (
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase">Por cobrar</span>
                                                    <button
                                                        onClick={() => navigate(`/expediente/${patientId}/budgets`)}
                                                        className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all flex items-center gap-1"
                                                    >
                                                        <Activity size={12} /> Facturar
                                                    </button>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-[12px] font-medium text-slate-500 italic">{item.notes || 'Sin nota'}</td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <ClipboardList size={40} className="text-slate-400" />
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay hallazgos registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Float Save Button */}
            {
                dirty && (
                    <div className="fixed bottom-8 right-8 z-[50]">
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                await handleSave();
                            }}
                            disabled={saving}
                            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-2xl hover:bg-blue-700 transition-all active:scale-95 font-black uppercase text-[12px] tracking-widest">
                            {saving ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
                        </button>
                    </div>
                )
            }
        </div>
    );
};

export default Odontograma;
