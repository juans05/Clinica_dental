import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, X, Search, MoreHorizontal, Hash, Info, ClipboardList, Trash2, Activity,
    History, Lock, Check, CheckCircle, AlertCircle, Box, Calendar
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

const ALL_TEETH = [
    ...UPPER_RIGHT, ...UPPER_LEFT,
    ...LOWER_LEFT, ...LOWER_RIGHT,
    ...PRIMARY_UPPER_RIGHT, ...PRIMARY_UPPER_LEFT,
    ...PRIMARY_LOWER_LEFT, ...PRIMARY_LOWER_RIGHT
];

const toothType = n => {
    if (isWisdom(n)) return 'Cordal';
    if (isMolar(n)) return 'Molar';
    if (isPremolar(n)) return 'Premolar';
    if (isCanine(n)) return 'Canino';
    return 'Incisivo';
};

const PROTOCOL_COLORS = {
    RED: '#DC2626',
    BLUE: '#2563EB',
};

const MINSA_FINDINGS = [
    // GRUPO: Lesión de Caries (ROJO)
    { id: 'MB', label: 'Mancha Blanca', sigla: 'MB', group: 'CARIES', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled' },
    { id: 'CE', label: 'Caries Esmalte', sigla: 'CE', group: 'CARIES', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled' },
    { id: 'CD', label: 'Caries Dentina', sigla: 'CD', group: 'CARIES', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled' },
    { id: 'CDP', label: 'Caries Dentina/Pulpa', sigla: 'CDP', group: 'CARIES', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled' },

    // GRUPO: Defectos de Desarrollo del Esmalte (ROJO)
    { id: 'HP', label: 'Hipoplasia', sigla: 'HP', group: 'DDE', color: PROTOCOL_COLORS.RED, type: 'box' },
    { id: 'HM', label: 'Hipomineralización', sigla: 'HM', group: 'DDE', color: PROTOCOL_COLORS.RED, type: 'box' },
    { id: 'O', label: 'Opacidad Esmalte', sigla: 'O', group: 'DDE', color: PROTOCOL_COLORS.RED, type: 'box' },
    { id: 'D', label: 'Decoloración Esmalte', sigla: 'D', group: 'DDE', color: PROTOCOL_COLORS.RED, type: 'box' },

    // GRUPO: Restauraciones (A/R)
    { id: 'AM', label: 'Amalgama Dental', sigla: 'AM', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled' },
    { id: 'R', label: 'Resina Compuesta', sigla: 'R', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled' },
    { id: 'IV', label: 'Ionómero de Vidrio', sigla: 'IV', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled' },
    { id: 'IM', label: 'Incrustación Metálica', sigla: 'IM', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled' },
    { id: 'IE', label: 'Incrustación Estética', sigla: 'IE', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled' },
    { id: 'C', label: 'Carilla Estética', sigla: 'C', group: 'RESTORATION', type: 'drawing', visual: 'veneer' },
    { id: 'RT', label: 'Restauración Temporal', sigla: 'RT', group: 'RESTORATION', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled' },

    // GRUPO: Sellante (A/R)
    { id: 'S', label: 'Sellante', sigla: 'S', group: 'SEALANT', type: 'drawing', visual: 'surface_mark' },
    { id: 'FFP', label: 'Fosas y Fisuras Prof.', sigla: 'FFP', group: 'SEALANT', color: PROTOCOL_COLORS.BLUE, type: 'box' },

    // GRUPO: Tratamiento Pulpar (A/R)
    { id: 'TC', label: 'Tratamiento de Conductos', sigla: 'TC', group: 'PULPAR', type: 'drawing', visual: 'root_line' },
    { id: 'PC', label: 'Pulpectomía', sigla: 'PC', group: 'PULPAR', type: 'drawing', visual: 'root_line' },
    { id: 'PP', label: 'Pulpotomía', sigla: 'PP', group: 'PULPAR', type: 'drawing', visual: 'coronal_pulp' },

    // GRUPO: Prótesis y Coronas (A/R)
    { id: 'CM', label: 'Corona Metálica', sigla: 'CM', group: 'PROSTHESIS', type: 'drawing', visual: 'rect_full' },
    { id: 'CF', label: 'Corona Fenestrada', sigla: 'CF', group: 'PROSTHESIS', type: 'drawing', visual: 'rect_full' },
    { id: 'CMC', label: 'Corona Metal Cerámica', sigla: 'CMC', group: 'PROSTHESIS', type: 'drawing', visual: 'rect_full' },
    { id: 'CV', label: 'Corona Veneer', sigla: 'CV', group: 'PROSTHESIS', type: 'drawing', visual: 'rect_full' },
    { id: 'CJ', label: 'Corona Jacket', sigla: 'CJ', group: 'PROSTHESIS', type: 'drawing', visual: 'rect_full' },
    { id: 'CT', label: 'Corona Temporal', sigla: 'CT', group: 'PROSTHESIS', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'rect_full' },
    { id: 'PF', label: 'Prótesis Fija (Puente)', sigla: 'PF', group: 'PROSTHESIS', type: 'drawing', visual: 'bridge_range' },
    { id: 'PR', label: 'Prótesis Removible', sigla: 'PR', group: 'PROSTHESIS', type: 'drawing', visual: 'parallel_lines_apex' },
    { id: 'PT', label: 'Prótesis Total', sigla: 'PT', group: 'PROSTHESIS', type: 'drawing', visual: 'parallel_lines_crown' },
    { id: 'EM', label: 'Espigo-Muñón', sigla: 'EM', group: 'PROSTHESIS', type: 'drawing', visual: 'root_line' },
    { id: 'IMP', label: 'Implante Dental', sigla: 'IMP', group: 'PROSTHESIS', type: 'drawing', visual: 'screw' },

    // GRUPO: Anomalías y Posición (Siempre AZUL)
    { id: 'MISSING', label: 'Pieza Ausente (Aspa)', sigla: 'X', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'cross_big' },
    { id: 'EDENTULO', label: 'Edéntulo Total', sigla: 'ET', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'edentulous_range' },
    { id: 'ERUPTION', label: 'Pieza en Erupción', sigla: '↑zigzag', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'zigzag_arrow' },
    { id: 'EXTRUDED', label: 'Pieza Extruida', sigla: '↓', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'arrow_extrude' },
    { id: 'INTRUDED', label: 'Pieza Intruida', sigla: '↑', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'arrow_intrude' },
    { id: 'SUPERNUMERARY', label: 'Pieza Supernumeraria', sigla: 'S', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'supernumerary_partner' },
    { id: 'ECT', label: 'Pieza Ectópica', sigla: 'E', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'box' },
    { id: 'IMPACTED', label: 'Impactación', sigla: 'I', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'box' },
    { id: 'MAC', label: 'Macrodoncia', sigla: 'MAC', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'box' },
    { id: 'MIC', label: 'Microdoncia', sigla: 'MIC', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'box' },
    { id: 'FUS', label: 'Fusión', sigla: 'FUS', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'number_fusion' },
    { id: 'GEM', label: 'Geminación', sigla: 'GEM', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'circle_over_number' },
    { id: 'GIR', label: 'Giroversión', sigla: 'GIR', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'curve_arrow' },
    { id: 'TRA', label: 'Transposición', sigla: 'TRA', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'cross_arrows' },
    { id: 'CLAV', label: 'Pieza en Clavija', sigla: 'Δ', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'box' },
    { id: 'DIAST', label: 'Diastema', sigla: ')(', group: 'POSITION', color: PROTOCOL_COLORS.BLUE, type: 'drawing', visual: 'diastema_parenthesis' },

    // GRUPO: Otros hallazgos (ROJO)
    { id: 'FX', label: 'Fractura', sigla: 'FX', group: 'OTHERS', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'slash_line' },
    { id: 'DES', label: 'Superficie Desgastada', sigla: 'DES', group: 'OTHERS', color: PROTOCOL_COLORS.RED, type: 'box' },
    { id: 'RR', label: 'Remanente Radicular', sigla: 'RR', group: 'OTHERS', color: PROTOCOL_COLORS.RED, type: 'box' },
    { id: 'MOB', label: 'Movilidad Patológica', sigla: 'M', group: 'OTHERS', color: PROTOCOL_COLORS.RED, type: 'text_grado' },

    // GRUPO: Ortodoncia (A/R)
    { id: 'OFJ', label: 'Aparato Ortodóntico Fijo', sigla: 'OFJ', group: 'ORTHO', type: 'drawing', visual: 'ortho_range' },
    { id: 'ORE', label: 'Aparato Ortodóntico Removible', sigla: 'ORE', group: 'ORTHO', type: 'drawing', visual: 'ortho_zigzag' },
];

const getStatusLetter = (data) => {
    const conditions = data?.conditions || [];
    const surfaceConditions = Object.values(data?.surfaces || {}).flat();
    const allIds = [...new Set([...conditions, ...surfaceConditions])];

    const sigles = allIds
        .map(c => {
            if (typeof c !== 'string') return null;
            const [id, state, extra] = c.split(':');

            // Skip _L (Lines) for sigla boxes, only show for explicit anchors
            if (id === 'OFJ_L' || id === 'ORE_L' || id === 'PF_L' || id === 'PR_L' || id === 'PT_L') return null;

            const finding = MINSA_FINDINGS.find(f => f.id === id);

            if (!finding) return null;

            // Priority: EXTRA (M1, M2, TC, etc) > Finding Sigla
            let label = finding.sigla;
            if (extra) {
                if (id === 'MOB') label = extra; // M1, M2, M3
                if (['TC', 'PC', 'PP'].includes(id)) label = extra; // TC, PC, PP
                if (id === 'TRA') label = `${finding.sigla} ${extra}`;
                else if (finding.group === 'POSITION') label = `${finding.sigla}(${extra})`;
            }

            const isCaries = finding.group === 'CARIES';
            const isDDE = finding.group === 'DDE';

            if (id === 'CLAV' || id === 'GEM') return null; // Exclude from sigla box as they have dedicated graphics

            if (finding.type === 'box' || finding.type === 'text_grado' || isCaries || isDDE || ['TC', 'PC', 'PP', 'CT', 'CM', 'CMC', 'CV', 'CJ', 'CF', 'IMP', 'OFJ', 'TRA', 'ECT', 'SEAL', 'MAC', 'MIC', 'IMPACTED', 'DES'].includes(id)) {
                return {
                    sigla: label,
                    color: (isCaries || isDDE || state === 'BAD') ? PROTOCOL_COLORS.RED : PROTOCOL_COLORS.BLUE
                };
            }
            return null;
        })
        .filter(Boolean);

    return sigles;
};

const getConditionData = (condStr) => {
    if (typeof condStr !== 'string' || !condStr) return null;
    const [id, state, extra] = condStr.split(':');
    const lookupId = id === 'OFJ_L' ? 'OFJ' : id;
    const finding = MINSA_FINDINGS.find(f => f.id === lookupId);
    if (!finding) return null;

    let color = finding.color;
    if (!color) {
        color = state === 'BAD' ? PROTOCOL_COLORS.RED : PROTOCOL_COLORS.BLUE;
    }

    return { ...finding, id: condStr, baseId: lookupId, color, state, extra };
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

    const dataList = items.map(id => getConditionData(id)).filter(Boolean);
    // Pathologies (Red) take precedence over healthy states/restorations (Blue)
    const redItem = dataList.find(d => d.group === 'CARIES' || d.group === 'DDE' || d.id === 'FX' || d.state === 'BAD' || d.color === PROTOCOL_COLORS.RED);
    if (redItem) return PROTOCOL_COLORS.RED;

    const blueItem = dataList.find(d => d.state === 'GOOD' || d.color === PROTOCOL_COLORS.BLUE);
    if (blueItem) return PROTOCOL_COLORS.BLUE;

    return dataList[0]?.color || null;
};

const ToothDetailModal = ({ tooth, number, onClose, onMarkTeeth, onMarkTooth, onMarkSurface, onSetNote, patientId, activeMode }) => {
    if (!tooth) return null;

    const { fetchToothHistory, toothHistory } = useOdontogramStore();
    const { budgets, fetchBudgets, updateBudgetItem } = useBudgetStore();
    const [search, setSearch] = React.useState('');
    const [selectedFinding, setSelectedFinding] = React.useState(null);
    const [findingState, setFindingState] = React.useState('BAD');
    const [subSelection, setSubSelection] = React.useState([]); // Multi or single

    React.useEffect(() => {
        fetchToothHistory(patientId, number);
        fetchBudgets(patientId);
    }, [number, patientId]);

    const approvedItems = React.useMemo(() => {
        return budgets
            .filter(b => b.status === 'APPROVED' || b.status === 'PENDING') // Allow pending for direct execution if doc wants
            .flatMap(b => (b.items || []).map(i => ({ ...i, budgetId: b.id })))
            .filter(i => i.toothNumber === number.toString());
    }, [budgets, number]);

    const handleCompleteItem = async (item) => {
        const ok = await updateBudgetItem(item.id, { status: 'COMPLETED' });
        if (ok) {
            // Also update odontogram state to CURADO
            useOdontogramStore.getState().setEvolutionState(number, 'CURADO');
            fetchBudgets(patientId);
        }
    };

    const filteredFindings = MINSA_FINDINGS.filter(f =>
        f.label.toLowerCase().includes(search.toLowerCase()) ||
        f.sigla.toLowerCase().includes(search.toLowerCase())
    );

    const handleApplyFinding = () => {
        if (!selectedFinding) return;

        let finalId = selectedFinding.id;

        if (['OFJ', 'ORE', 'PF', 'PR', 'PT', 'EDENTULO'].includes(finalId) && subSelection.length > 0) {
            // Atomic update for the whole range
            onMarkTeeth(subSelection.map(Number), `${finalId}:${findingState}`);
        } else if ((finalId === 'FUS' || finalId === 'TRA' || finalId === 'SUPERNUMERARY') && subSelection.length > 0) {
            // Bidirectional partner finding
            onMarkTooth(number, `${finalId}:${findingState}:${subSelection[0]}`);
        } else {
            // Final string: "ID:STATUS:SUB1,SUB2..."
            onMarkTooth(number, `${finalId}:${findingState}${subSelection.length > 0 ? `:${subSelection.join(',')}` : ''}`);
        }

        setSelectedFinding(null);
        setSubSelection([]);
        onClose(); // Close the modal after applying
    };

    const isReadOnly = activeMode === 'INITIAL' && tooth.saved;

    // Sub-select configurations
    const getSubOptions = () => {
        if (!selectedFinding) return null;
        if (selectedFinding.id === 'MOB') return ['M1', 'M2', 'M3'];
        if (['TC', 'PC', 'PP'].includes(selectedFinding.id)) return ['TC', 'PC', 'PP'];
        if (selectedFinding.id === 'FUS' || selectedFinding.id === 'TRA' || selectedFinding.id === 'SUPERNUMERARY') {
            const neighbors = [];
            const pos = ALL_TEETH.indexOf(number);

            // Basic neighbors in the list
            if (pos > 0) neighbors.push(ALL_TEETH[pos - 1]);
            if (pos < ALL_TEETH.length - 1) neighbors.push(ALL_TEETH[pos + 1]);

            // Filter to only kept neighbors in same row (upper vs lower)
            const isU = isUpper(number);
            const validNeighbors = neighbors.filter(n => isUpper(n) === isU);

            // Manual overlaps for center teeth
            if (number === 11 && !validNeighbors.includes(21)) validNeighbors.push(21);
            if (number === 21 && !validNeighbors.includes(11)) validNeighbors.push(11);
            if (number === 31 && !validNeighbors.includes(41)) validNeighbors.push(41);
            if (number === 41 && !validNeighbors.includes(31)) validNeighbors.push(31);
            if (number === 51 && !validNeighbors.includes(61)) validNeighbors.push(61);
            if (number === 61 && !validNeighbors.includes(51)) validNeighbors.push(51);
            if (number === 71 && !validNeighbors.includes(81)) validNeighbors.push(81);
            if (number === 81 && !validNeighbors.includes(71)) validNeighbors.push(71);

            return [...new Set(validNeighbors)].map(String);
        }
        if (['OFJ', 'ORE', 'PF', 'PR', 'PT', 'EDENTULO'].includes(selectedFinding.id)) {
            const isU = isUpper(number);
            const isP = isPrimary(number);
            return ALL_TEETH.filter(n => isUpper(n) === isU && isPrimary(n) === isP).map(String);
        }
        if (selectedFinding.group === 'POSITION' && !['MISSING', 'ERUPTION', 'FUS', 'GEM', 'GIR', 'TRA', 'CLAV', 'DIAST', 'SUPERNUMERARY', 'EDENTULO'].includes(selectedFinding.id)) {
            return ['M', 'D', 'V', 'P', 'L'];
        }
        return null;
    };

    const subOptions = getSubOptions();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-7xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100"
            >
                {/* Header */}
                <div className="p-10 bg-white border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100/50">
                            {number}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Pieza Dental</h2>
                            <div className="flex items-center gap-2 mt-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    DETALLE CLÍNICO FDI
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 custom-scrollbar">
                    {/* Col 1: Surface & Selectors (3 cols) */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-slate-50/50 rounded-[32px] border border-slate-100 p-8 shadow-inner">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Box size={14} /> MAPA DE SUPERFICIES
                            </h3>
                            <div className="flex justify-center py-6">
                                <div className="relative w-40 h-40">
                                    {['V', 'L', 'M', 'D', 'O'].map(s => (
                                        <button
                                            key={s}
                                            disabled={isReadOnly}
                                            onClick={() => onMarkSurface(number, s, selectedFinding?.id ? `${selectedFinding.id}:${findingState}` : null)}
                                            className={cn(
                                                "absolute border-2 transition-all flex items-center justify-center text-[12px] font-black shadow-sm",
                                                tooth.surfaces[s]?.length > 0
                                                    ? "bg-blue-600 border-blue-700 text-white shadow-lg scale-110 z-20"
                                                    : "bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:scale-105"
                                            )}
                                            style={{
                                                width: '42px', height: '42px', borderRadius: '12px',
                                                top: s === 'V' ? '0' : (s === 'L' ? 'auto' : '50%'),
                                                bottom: s === 'L' ? '0' : 'auto',
                                                left: (s === 'V' || s === 'L' || s === 'O') ? '50%' : (s === 'M' ? '0' : 'auto'),
                                                right: s === 'D' ? '0' : 'auto',
                                                transform: (s === 'V' || s === 'L') ? 'translateX(-50%)' : ((s === 'M' || s === 'D') ? 'translateY(-50%)' : 'translate(-50%, -50%)'),
                                                zIndex: s === 'O' ? 10 : 5,
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">NOTAS CLÍNICAS</h3>
                            <textarea
                                value={tooth.notes || ''}
                                disabled={isReadOnly}
                                onChange={e => onSetNote(number, e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-[13px] text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-100/50 placeholder:text-slate-300 resize-none h-40 transition-all font-medium"
                                placeholder="Añadir notas diagnósticas..."
                            />
                        </div>
                    </div>

                    {/* Col 2: Finding Search & Selection (5 cols) */}
                    <div className="lg:col-span-5 space-y-6 lg:border-x lg:px-10 border-slate-100">
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">AÑADIR CONDICIÓN</h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o sigla (Ej: CDP, Caries...)"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                {[
                                    { id: 'CARIES', label: 'Lesión de Caries' },
                                    { id: 'DDE', label: 'Defectos de Esmalte' },
                                    { id: 'RESTORATION', label: 'Restauraciones' },
                                    { id: 'SEALANT', label: 'Sellantes' },
                                    { id: 'PULPAR', label: 'Tratamiento Pulpar' },
                                    { id: 'PROSTHESIS', label: 'Prótesis y Coronas' },
                                    { id: 'POSITION', label: 'Anomalías y Posición' },
                                    { id: 'ORTHO', label: 'Ortodoncia' },
                                    { id: 'OTHERS', label: 'Otros Hallazgos' },
                                ].map(group => {
                                    const findingsInGroup = filteredFindings.filter(f => f.group === group.id);
                                    if (findingsInGroup.length === 0) return null;

                                    return (
                                        <div key={group.id} className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pl-1">{group.label}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {findingsInGroup.map(f => (
                                                    <button
                                                        key={f.id}
                                                        disabled={isReadOnly}
                                                        onClick={() => {
                                                            setSelectedFinding(f);
                                                            setSubSelection([]);
                                                        }}
                                                        className={cn(
                                                            "p-3 rounded-xl border transition-all text-left flex items-center justify-between group h-full",
                                                            selectedFinding?.id === f.id
                                                                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                                                : "bg-white border-slate-100 text-slate-600 hover:border-blue-200"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div
                                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                style={{ backgroundColor: f.color || (f.group === 'CARIES' ? PROTOCOL_COLORS.RED : PROTOCOL_COLORS.BLUE) }}
                                                            />
                                                            <span className="font-bold text-[10px] leading-tight uppercase">{f.label}</span>
                                                        </div>
                                                        {selectedFinding?.id === f.id && <Check size={14} className="text-blue-400" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedFinding && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 mt-4 space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Configurar Estado</p>
                                        <div className="flex bg-white/50 p-1.5 rounded-2xl border border-blue-100">
                                            <button
                                                onClick={() => setFindingState('GOOD')}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2",
                                                    findingState === 'GOOD' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                <CheckCircle size={14} /> SANO
                                            </button>
                                            <button
                                                onClick={() => setFindingState('BAD')}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2",
                                                    findingState === 'BAD' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                <AlertCircle size={14} /> PATOLÓGICO
                                            </button>
                                        </div>
                                    </div>

                                    {subOptions && (
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Opción de {selectedFinding.label}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {subOptions.map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => {
                                                            if (selectedFinding.group === 'POSITION' || ['OFJ', 'ORE', 'PF', 'PR', 'PT'].includes(selectedFinding.id)) {
                                                                setSubSelection(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);
                                                            } else {
                                                                setSubSelection([opt]);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "px-4 py-2 rounded-xl text-[11px] font-black border transition-all",
                                                            subSelection.includes(opt)
                                                                ? "bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-200"
                                                                : "bg-white border-blue-100 text-blue-600 hover:bg-blue-100/20"
                                                        )}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleApplyFinding}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[12px] font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                                    >
                                        REGISTRAR HALLAZGO
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Col 3: Active Findings & History (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Activity size={14} className="text-rose-500" /> Hallazgos Activos
                            </h3>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {(() => {
                                    const toothConditions = (tooth.conditions || []).map(c => ({ str: c, surface: null }));
                                    const surfaceConditions = Object.entries(tooth.surfaces || {}).flatMap(([s, items]) =>
                                        (items || []).map(c => ({ str: c, surface: s }))
                                    );
                                    const all = [...toothConditions, ...surfaceConditions];

                                    if (all.length === 0) return <p className="text-[11px] text-slate-300 italic pl-2">Ninguno registrado</p>;

                                    return all.map((item, idx) => {
                                        const cond = getConditionData(item.str);
                                        if (!cond) return null;
                                        return (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-[24px] border border-slate-100 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cond.color }} />
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-[11px] font-black text-slate-800 uppercase leading-none">{cond.sigla}</p>
                                                            {item.surface && (
                                                                <span className="text-[9px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md">{item.surface}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1 truncate max-w-[140px]">{cond.label}</p>
                                                    </div>
                                                </div>
                                                {!isReadOnly && (
                                                    <button
                                                        onClick={() => item.surface ? onMarkSurface(number, item.surface, item.str) : onMarkTooth(number, item.str)}
                                                        className="text-slate-200 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {activeMode === 'EVOLUTION' && approvedItems.length > 0 && (
                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <CheckCircle size={14} className="text-emerald-500" /> Presupuesto Aprobado
                                </h3>
                                <div className="space-y-3">
                                    {approvedItems.map(item => (
                                        <div key={item.id} className={cn(
                                            "p-4 rounded-[24px] border transition-all flex items-center justify-between",
                                            item.status === 'COMPLETED' ? "bg-emerald-50 border-emerald-100 op-60" : "bg-white border-slate-100 shadow-sm"
                                        )}>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-800 uppercase">{item.service?.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">S/ {parseFloat(item.price).toFixed(2)}</p>
                                            </div>
                                            {item.status !== 'COMPLETED' ? (
                                                <button
                                                    onClick={() => handleCompleteItem(item)}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95"
                                                >
                                                    Finalizar
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-emerald-600">
                                                    <Check size={14} />
                                                    <span className="text-[9px] font-black uppercase">Terminado</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <History size={14} className="text-indigo-400" /> Historial Clínico
                            </h3>
                            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {toothHistory && toothHistory.length > 0 ? (
                                    toothHistory.map((log) => (
                                        <div key={log.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-[10px] font-black text-slate-700 leading-tight">{log.description}</p>
                                                <span className="text-[9px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{log.doctor?.name}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Sin antecedentes</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-12 py-3.5 bg-slate-900 text-white rounded-xl text-[12px] font-black hover:bg-black transition-all shadow-lg active:scale-95 uppercase tracking-widest"
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

// Helper to map CM_HISTORIA_CLINICA geometries
const getToothShapes = (number, isUpperTooth) => {
    // Top, Left, Bottom, Right, Center
    // Base dimensions from old project: 30x30 for crown
    const crowns = {
        top: isUpperTooth ? "0,30 30,30 20,20 10,20" : "0,0 30,0 20,10 10,10",
        left: "0,0 10,10 10,20 0,30",
        bottom: isUpperTooth ? "0,0 10,10 20,10 30,0" : "0,30 10,20 20,20 30,30",
        right: "30,0 20,10 20,20 30,30",
        center: isUpperTooth
            ? "10,10 20,10 20,20 10,20 10,20 13.33,20 13.33,10 16.33,10 16.33,20 20,20 20,15 10,15 10,20 20,20 20,10 10,10"
            : "10,10 20,10 20,20 10,20 10,10 13.33,10 13.33,20 16.33,20 16.33,10 20,10 20,15 10,15 10,10 20,10 20,20 10,20"
    };

    let roots = [];
    const isMolarTooth = isMolar(number);
    if (isMolarTooth) {
        roots = [
            "0,30 5,50 10,30",
            "10,30 15,50 20,30",
            "20,30 25,50 30,30"
        ];
    } else if ([14, 24].includes(number)) {
        roots = [
            "5,30 10,50 15,30",
            "15,30 20,50 25,30"
        ];
    } else if ([15, 25, 34, 35, 44, 45].includes(number)) {
        roots = [
            "10,30 15,50 20,30"
        ];
    } else {
        // Incisors / Canines
        roots = [
            "10,30 15,50 20,30"
        ];
        // Incisors have slightly different crown centers in the old code,
        // but it's simpler to use the same logic or adapt it. 
        // We'll use the exact coordinates from the old index.tsx for incisors.
        crowns.top = isUpperTooth ? "0,30 30,30 20,15 10,15" : "0,0 30,0 20,15 10,15";
        crowns.left = "0,0 10,15 0,30";
        crowns.bottom = isUpperTooth ? "0,0 10,15 20,15 30,0" : "0,30 10,15 20,15 30,30";
        crowns.right = "30,0 20,15 30,30";
        crowns.center = ""; // No center for incisors in old project
    }

    return { crowns, roots };
};

const ToothSVG = ({ number, data, isSelected, onTooth, onSurface, mode = 'INITIAL' }) => {
    const isUpperTooth = isUpper(number);

    // Scale up slightly to match the UI better (40x65 -> padded)
    const W = 40; // Display width
    const H = 65; // Display height

    // Surface mapping to old names
    // V = Vestibular (Top/Bottom depending on upper/lower)
    // L = Lingual/Palatino (Bottom/Top depending on upper/lower)
    // M = Mesial
    // D = Distal
    // O = Oclusal (Center)

    // Note: the old code used transform="scale(1,-1)" for upper teeth.
    // Instead of transforming the whole group which messes with interactions,
    // we just use the raw coordinates from old code.
    const { crowns, roots } = getToothShapes(number, isUpperTooth);

    const surfMap = {
        V: isUpperTooth ? crowns.bottom : crowns.top,
        L: isUpperTooth ? crowns.top : crowns.bottom,
        M: crowns.left, // Default, will be adjusted
        D: crowns.right, // Default, will be adjusted
        O: crowns.center
    };

    // We only need M/D relative to midline.
    // Right quadrant (1x, 4x, 5x, 8x): M is Right, D is Left.
    // Left quadrant (2x, 3x, 6x, 7x): M is Left, D is Right.
    const isRightQuadrant = [1, 4, 5, 8].includes(Math.floor(number / 10));
    surfMap.M = isRightQuadrant ? crowns.right : crowns.left;
    surfMap.D = isRightQuadrant ? crowns.left : crowns.right;

    // Box sigles
    const boxSigles = getStatusLetter(data);
    const topSigles = isUpperTooth ? boxSigles : [];
    const bottomSigles = !isUpperTooth ? boxSigles : [];

    // Removed variables re-added
    const allConditions = (data?.conditions || []).map(c => getConditionData(c)).filter(Boolean);
    const hasFusion = allConditions.some(c => c.baseId === 'FUS');
    const hasGem = allConditions.some(c => c.baseId === 'GEM');
    const hasClav = allConditions.some(c => c.baseId === 'CLAV');
    const borderColor = isSelected ? PROTOCOL_COLORS.BLUE : '#475569'; // darker slate-600 for contrast

    return (
        <div
            className="flex flex-col items-center select-none group relative py-2 cursor-pointer"
            style={{ width: W }}
            onClick={(e) => onTooth(number, e)}
        >
            {isUpperTooth && (
                <>
                    {/* 1. Recuadro Superior (Evolución) */}
                    <div className={cn(
                        "w-10 h-10 border-2 border-slate-300 mb-1 flex flex-col items-center justify-center bg-white transition-all overflow-hidden shadow-sm rounded-lg",
                        topSigles.length > 0 ? "border-slate-400 opacity-100" : "opacity-30"
                    )}>
                        {topSigles.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[10px] font-black leading-tight" style={{ color: s.color }}>{s.sigla}</span>
                        ))}
                    </div>

                    {/* 2. Número de Diente */}
                    <div className={cn(
                        "w-full py-1 mb-2 flex justify-center transition-all relative font-black text-[14px]",
                        isSelected ? "text-blue-600" : "text-slate-800"
                    )}>
                        {(hasFusion || hasGem) && (
                            <div className="absolute inset-y-[-4px] -inset-x-2 border-[3px] rounded-full pointer-events-none z-10" style={{ borderColor: PROTOCOL_COLORS.BLUE }} />
                        )}
                        <span className="z-20 relative">{number}</span>
                    </div>

                    {/* 3. Indicador de Clavija (Superior) con Altura Fija para Alineación */}
                    <div className="w-full h-8 flex items-center justify-center mb-1">
                        {hasClav ? (
                            <svg width="24" height="18" viewBox="0 0 24 24" className="overflow-visible">
                                <path d="M 12,2 L 2,22 L 22,22 Z" fill="none" stroke={PROTOCOL_COLORS.BLUE} strokeWidth="3" />
                            </svg>
                        ) : null}
                    </div>
                </>
            )}

            {/* 2. Gráfico Dental (SVG) */}
            <svg
                width="40" height="65"
                viewBox="0 0 30 50"
                className={cn("block overflow-visible pointer-events-none relative z-10")}
                transform={isUpperTooth ? "scale(1,-1)" : "scale(1,1)"}
            >
                {/* Roots */}
                {roots.map((r, i) => (
                    <polygon key={`r${i}`} points={r} fill="none" stroke={borderColor} strokeWidth="1" />
                ))}

                {/* Drawings Overlay */}
                <g>
                    {['V', 'L', 'M', 'D', 'O'].map(s => {
                        if (!surfMap[s]) return null;
                        const fill = sc(data, s);
                        return (
                            <polygon key={s} points={surfMap[s]}
                                fill={fill || "white"}
                                onClick={e => { e.stopPropagation(); onSurface(number, s, e); }}
                                className="hover:fill-blue-50/50 transition-colors pointer-events-auto"
                                stroke={borderColor} strokeWidth="1"
                            />
                        );
                    })}

                    {/* Condition Drawings */}
                    {allConditions.map((cond, idx) => {
                        if (cond.type !== 'drawing') return null;
                        const color = cond.color;
                        const mx = 15;
                        const my = 15;
                        const mW = 30;
                        const mH = 50;
                        const cY = 0;
                        const cH = 30;

                        switch (cond.visual) {
                            case 'circle_full':
                                return <circle key={idx} cx={mx} cy={my} r={15} fill="none" stroke={color} strokeWidth="2" />;
                            case 'rect_full': // Corona Temporal Square
                                return <rect key={idx} x={0} y={cY} width={30} height={30} fill="none" stroke={color} strokeWidth="2" />;
                            case 'bridge_line':
                                return <line key={idx} x1={-5} y1={my} x2={35} y2={my} stroke={color} strokeWidth="2" />;
                            case 'cross_big':
                                return (
                                    <g key={idx} stroke={color} strokeWidth={2} strokeLinecap="round">
                                        <line x1={0} y1={0} x2={30} y2={30} />
                                        <line x1={30} y1={0} x2={0} y2={30} />
                                    </g>
                                );
                            case 'screw':
                                return <rect key={idx} x={12} y={isUpperTooth ? 35 : 35} width={6} height={10} fill={color} rx="1" />;
                            case 'root_line':
                                return (
                                    <g key={idx}>
                                        {roots.map((r, i) => {
                                            const tip = r.split(' ')[1].split(',');
                                            return <line key={i} x1={mx} y1={30} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth="2" strokeLinecap="round" />;
                                        })}
                                    </g>
                                );
                            case 'coronal_pulp':
                                return (
                                    <rect key={idx} x={mx - 6} y={my - 6} width={12} height={12} fill={color} />
                                );
                            case 'arrow_extrude': {
                                // Según norma COP: Extruida: fuera de la gráfica, apunta LEJOS de oclusal (hacia el exterior)
                                return (
                                    <path
                                        key={idx}
                                        d={`M${mx},-3 L${mx},-17 l-4,4 m4,-4 l4,4`}
                                        fill="none" stroke={color} strokeWidth="2"
                                    />
                                );
                            }
                            case 'arrow_intrude': {
                                // Según norma COP: Intruida: fuera de la gráfica, dirigida HACIA incisal/oclusal (Y=0)
                                return (
                                    <path
                                        key={idx}
                                        d={`M${mx},-17 L${mx},-3 l-4,-4 m4,4 l4,-4`}
                                        fill="none" stroke={color} strokeWidth="2"
                                    />
                                );
                            }
                            case 'supernumerary_partner': {
                                // Según norma COP: La letra "S" encerrada en un círculo azul en la zona oclusal
                                const parts = cond.id.split(':');
                                const partnerID = parts[2];
                                let pIdx = -1;
                                let nIdx = ALL_TEETH.indexOf(number);
                                if (partnerID) pIdx = ALL_TEETH.indexOf(parseInt(partnerID));

                                // Si es partner, dibujamos entre ambos? La norma dice "hacia la zona oclusal de la pieza"
                                // Si no hay partnerID (individual), se dibuja sobre el diente actual.
                                const dist = pIdx !== -1 ? (pIdx - nIdx) * 20 : 0;
                                const cx = mx + dist;
                                const cy = -12; // Fuera, zona oclusal

                                return (
                                    <g key={idx}>
                                        <circle cx={cx} cy={cy} r={7} fill="white" stroke={color} strokeWidth="2" />
                                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="black" fill={color}>S</text>
                                    </g>
                                );
                            }
                            case 'edentulous_range': {
                                // Line crossing crowns
                                const etY = 15;
                                return (
                                    <line
                                        key={idx}
                                        x1={-3} y1={etY} x2={33} y2={etY}
                                        stroke={color} strokeWidth="3"
                                    />
                                );
                            }
                            case 'zigzag_arrow':
                                // Según norma COP: Línea zigzag azul hacia oclusal (fuera)
                                return <path key={idx} d={`M8,-18 l7,3 l-7,3 l7,3 l-7,3`} fill="none" stroke={color} strokeWidth="2" />;
                            case 'curve_arrow': // Giroversión
                                // Según norma COP: Flecha curva indicando el sentido
                                return <path key={idx} d={`M5,-12 Q15,-20 25,-12 m-4,0 l4,4 l4,-4`} fill="none" stroke={color} strokeWidth="2" />;
                            case 'cross_arrows': { // Transposición
                                const parts = cond.id.split(':');
                                const partnerID = parts[2];
                                let pIdx = -1;
                                let nIdx = ALL_TEETH.indexOf(number);

                                if (partnerID) {
                                    pIdx = ALL_TEETH.indexOf(parseInt(partnerID));
                                }

                                const ty = -10;
                                const dist = pIdx !== -1 ? (pIdx - nIdx) * 32 : 0;
                                const isLeftTooth = pIdx > nIdx;

                                if (pIdx === -1) return null;

                                return (
                                    <g key={idx} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {isLeftTooth ? (
                                            <path d={`M ${mx} ${ty} Q ${mx + dist / 2} ${ty + 10} ${mx + dist} ${ty} l -4 ${-4} m 4 ${4} l -4 ${4}`} />
                                        ) : (
                                            <path d={`M ${mx} ${ty} Q ${mx + dist / 2} ${ty - 10} ${mx + dist} ${ty} l 4 ${-4} m -4 ${4} l 4 ${4}`} />
                                        )}
                                    </g>
                                );
                            }
                            case 'slash_line': // Fractura
                                return <path key={idx} d={`M30,0 L0,50`} fill="none" stroke={color} strokeWidth="3" />;
                            case 'diastema_parenthesis': {
                                // Según norma COP: Paréntesis invertido )( entre las piezas
                                // Para que se vea )( entre piezas, el diente de la izquierda (ej 11) debe tener ')' en su borde derecho
                                // y el diente de la derecha (ej 21) debe tener '(' en su borde izquierdo.
                                const isRightSide = [1, 4, 5, 8].includes(Math.floor(number / 10)); // Anatomical right (screen left)

                                // Simplified: Draw the parenthesis that corresponds to the mesial side of this tooth
                                return (
                                    <g key={idx} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round">
                                        {isRightSide ? (
                                            /* Signo ')' en el borde derecho (Mesial) para piezas 1x, 4x... */
                                            <path d="M 30,10 Q 35,25 30,40" />
                                        ) : (
                                            /* Signo '(' en el borde izquierdo (Mesial) para piezas 2x, 3x... */
                                            <path d="M 0,10 Q -5,25 0,40" />
                                        )}
                                    </g>
                                );
                            }
                            case 'number_fusion': {
                                // Según norma COP: Línea curva azul uniendo las piezas por la corona
                                const parts = cond.id.split(':');
                                const partnerID = parts[2];
                                if (!partnerID) return null;
                                let pIdx = ALL_TEETH.indexOf(parseInt(partnerID));
                                let nIdx = ALL_TEETH.indexOf(number);
                                if (pIdx === -1) return null;
                                const dist = (pIdx - nIdx) * 32;
                                return (
                                    <path key={idx} d={`M ${mx} 15 Q ${mx + dist / 2} 25 ${mx + dist} 15`} fill="none" stroke={color} strokeWidth="2" />
                                );
                            }
                            case 'circle_over_number': // Geminación
                                // Según norma COP: Línea curva sobre la corona (similar a fusión pero individual)
                                return (
                                    <path key={idx} d={`M ${mx - 8} 15 Q ${mx} 25 ${mx + 8} 15`} fill="none" stroke={color} strokeWidth="2" />
                                );
                            case 'ortho_range':
                            case 'bridge_range': {
                                const isAnchor = cond.id.endsWith(':ANCHOR');
                                const apexY = 48;
                                const isOrtho = cond.id.startsWith('OFJ');
                                const squareSize = 8;

                                return (
                                    <g key={idx}>
                                        <line
                                            x1={-3} y1={apexY} x2={33} y2={apexY}
                                            stroke={color} strokeWidth="2"
                                        />
                                        {isAnchor && (
                                            <line
                                                x1={mx} y1={apexY - 6} x2={mx} y2={apexY + 6}
                                                stroke={color} strokeWidth="2"
                                            />
                                        )}
                                        {isAnchor && isOrtho && (
                                            <g>
                                                <rect
                                                    x={mx - squareSize / 2} y={apexY - squareSize / 2}
                                                    width={squareSize} height={squareSize}
                                                    fill="white" stroke={color} strokeWidth="2"
                                                />
                                                <line x1={mx - 3} y1={apexY} x2={mx + 3} y2={apexY} stroke={color} strokeWidth="1.5" />
                                                <line x1={mx} y1={apexY - 3} x2={mx} y2={apexY + 3} stroke={color} strokeWidth="1.5" />
                                            </g>
                                        )}
                                    </g>
                                );
                            }

                            case 'ortho_zigzag': {
                                const apexY = 48;
                                const segments = 4;
                                const dx = 32 / segments;
                                let path = `M -1 ${apexY}`;
                                for (let i = 1; i <= segments; i++) {
                                    const x = -1 + i * dx;
                                    const y = apexY + (i % 2 === 0 ? -3 : 3);
                                    path += ` L ${x} ${y}`;
                                }
                                return (
                                    <path
                                        key={idx}
                                        d={path}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                );
                            }

                            case 'dotted_range': {
                                const apexY = 48;
                                return (
                                    <line
                                        key={idx}
                                        x1={-2} y1={apexY} x2={32} y2={apexY}
                                        stroke={color} strokeWidth="2"
                                        strokeDasharray="4,2"
                                    />
                                );
                            }

                            case 'parallel_lines_apex': {
                                const paY = 45;
                                const offset = 4;
                                return (
                                    <g key={idx}>
                                        <line x1={-2} y1={paY - offset / 2} x2={32} y2={paY - offset / 2} stroke={color} strokeWidth="2" />
                                        <line x1={-2} y1={paY + offset / 2} x2={32} y2={paY + offset / 2} stroke={color} strokeWidth="2" />
                                    </g>
                                );
                            }

                            case 'parallel_lines_crown': {
                                const pcY = -5;
                                const offset = 4;
                                return (
                                    <g key={idx}>
                                        <line x1={-2} y1={pcY - offset / 2} x2={32} y2={pcY - offset / 2} stroke={color} strokeWidth="2" />
                                        <line x1={-2} y1={pcY + offset / 2} x2={32} y2={pcY + offset / 2} stroke={color} strokeWidth="2" />
                                    </g>
                                );
                            }

                            default:
                                return null;
                        }
                    })}
                </g>
            </svg>

            {/* Indicador de Clavija (Inferior) con Altura Fija */}
            <div className="w-full h-8 flex items-center justify-center mt-1">
                {!isUpperTooth && hasClav ? (
                    <svg width="24" height="18" viewBox="0 0 24 24" className="overflow-visible">
                        <path d="M 12,22 L 2,2 L 22,2 Z" fill="none" stroke={PROTOCOL_COLORS.BLUE} strokeWidth="3" />
                    </svg>
                ) : null}
            </div>

            {/* 3. Número de Diente (Inferiores) */}
            {!isUpperTooth && (
                <div className={cn(
                    "w-full py-1 mt-2 flex justify-center transition-all relative font-black text-[14px]",
                    isSelected ? "text-blue-600" : "text-slate-800"
                )}>
                    {(hasFusion || hasGem) && (
                        <div className="absolute inset-y-[-4px] -inset-x-2 border-[3px] rounded-full pointer-events-none z-10" style={{ borderColor: PROTOCOL_COLORS.BLUE }} />
                    )}
                    <span className="z-20 relative">{number}</span>
                </div>
            )}

            {/* 4. Recuadro Inferior (Evolución) */}
            {!isUpperTooth && (
                <div className={cn(
                    "w-10 h-10 border-2 border-slate-300 mt-1 flex flex-col items-center justify-center bg-white transition-all overflow-hidden shadow-sm rounded-lg",
                    bottomSigles.length > 0 ? "border-slate-400 opacity-100" : "opacity-30"
                )}>
                    {bottomSigles.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[10px] font-black leading-tight" style={{ color: s.color }}>{s.sigla}</span>
                    ))}
                </div>
            )}
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
        markTeeth,
        markTooth,
        markSurface,
        setNote,
        setIsTemporary,
        setSelected,
        activeMode,
        setActiveMode,
        setEvolutionState,
        globalSpecifications,
        globalObservations,
        setGlobalSpecifications,
        setGlobalObservations
    } = useOdontogramStore();

    const { user } = useAuth();
    const { createBudgetFromOdontogram } = useBudgetStore();
    const navigate = useNavigate();

    const [activeOdoTab, setActiveOdoTab] = React.useState('initial');
    const [saved, setSaved] = React.useState(false);
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
        // ALWAYS use the comprehensive modal for both modes, as requested
        setDetailTooth({ number: n, data: teeth[n] });
        setSelected(n);
    };

    const onSurfaceClick = (n, s, e) => {
        // Redirect surface click to the main tooth detail modal as requested
        onToothClick(n, e);
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
        const lineH = 7;
        let y = 20;

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text('DOCUMENTO OFICIAL: ODONTOGRAMA', 105, y, { align: 'center' });
        y += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`TIPO: ${activeMode === 'INITIAL' ? 'ODONTOGRAMA INICIAL' : 'ODONTOGRAMA DE EVOLUCIÓN'}`, 20, y);
        doc.text(`FECHA: ${new Date().toLocaleDateString('es-PE')}`, 160, y);
        y += lineH * 2;

        // Visual Table Summary
        doc.setFont("helvetica", "bold");
        doc.text('RESUMEN DE PIEZAS CON HALLAZGOS:', 20, y);
        y += lineH;

        const tableBody = Object.entries(teeth)
            .filter(([n, t]) => (t.conditions?.length > 0) || Object.values(t.surfaces || {}).some(s => s.length > 0))
            .map(([n, t]) => {
                const conds = (t.conditions || []).map(c => getConditionData(c)?.sigla).join(', ');
                const surfs = Object.entries(t.surfaces || {})
                    .filter(([s, items]) => items.length > 0)
                    .map(([s, items]) => `${s}: ${items.map(i => getConditionData(i)?.sigla).join(',')}`)
                    .join(' | ');
                return [n, conds || '-', surfs || '-', t.notes || '-'];
            });

        if (window.jspdf?.autoTable) {
            window.jspdf.autoTable(doc, {
                startY: y,
                head: [['Diente', 'Hallazgos Pieza', 'Hallazgos Superficies', 'Especificaciones']],
                body: tableBody,
                theme: 'grid',
                styles: { fontSize: 8, font: 'helvetica' },
                headStyles: { fillStyle: 'DF', fillColor: [50, 50, 50] }
            });
            y = doc.lastAutoTable.finalY + 15;
        } else {
            y += 5;
            doc.text('Diente | Hallazgos', 20, y);
            y += 5;
            tableBody.forEach(row => {
                doc.text(`${row[0]} | ${row[1]} | ${row[2]}`, 20, y);
                y += 5;
            });
            y += 10;
        }

        // Global Notes
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.text('ESPECIFICACIONES GENERALES:', 20, y);
        y += lineH;
        doc.setFont("helvetica", "normal");
        const specLines = doc.splitTextToSize(globalSpecifications || 'Ninguna', 170);
        doc.text(specLines, 20, y);
        y += (specLines.length * lineH) + 10;

        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.text('OBSERVACIONES CLÍNICAS:', 20, y);
        y += lineH;
        doc.setFont("helvetica", "normal");
        const obsLines = doc.splitTextToSize(globalObservations || 'Ninguna', 170);
        doc.text(obsLines, 20, y);
        y += (obsLines.length * lineH) + 20;

        // Footer validación
        doc.setFontSize(8);
        doc.text('__________________________', 50, 280);
        doc.text('FIRMA DEL ODONTÓLOGO', 55, 285);
        doc.text('__________________________', 130, 280);
        doc.text('HUELLA / FIRMA PACIENTE', 135, 285);

        doc.save(`Odontograma_${activeMode}_${new Date().getTime()}.pdf`);
    };


    const renderRow = (nums, upper) => (
        <div className="flex gap-0">
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
                {detailTooth && (
                    <ToothDetailModal
                        number={detailTooth.number}
                        tooth={teeth[detailTooth.number]}
                        patientId={patientId}
                        activeMode={activeMode}
                        onClose={() => setDetailTooth(null)}
                        onMarkTeeth={markTeeth}
                        onMarkTooth={markTooth}
                        onMarkSurface={markSurface}
                        onSetNote={setNote}
                    />
                )}
            </AnimatePresence>

            {/* ── Official Protocol Header ── */}
            <div className="flex items-center justify-between border-b border-slate-200 mb-6 pb-2">
                <div className="flex gap-8 items-center">
                    {[
                        { id: 'INITIAL', label: 'ODONTOGRAMA INICIAL' },
                        { id: 'EVOLUTION', label: 'ODONTOGRAMA DE EVOLUCIÓN' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMode(tab.id)}
                            className={cn(
                                "pb-3 text-[13px] font-black tracking-wider transition-all relative px-2",
                                activeMode === tab.id ? "text-blue-700" : "text-slate-400"
                            )}>
                            {tab.label}
                            {activeMode === tab.id && <div className="absolute bottom-0 inset-x-0 h-1 bg-blue-600 rounded-t-full" />}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 text-[13px] font-bold text-slate-700 bg-slate-50 px-6 py-2 rounded-xl border border-slate-200 shadow-inner">
                    <span className="text-slate-400">FECHA:</span>
                    <span className="border-b border-slate-400 min-w-[120px] text-center">
                        {new Date().toLocaleDateString('es-PE')}
                    </span>
                </div>
            </div>

            {/* ── Sub Header: Legend & Actions ── */}
            <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-md bg-[#DC2626] shadow-sm" />
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Patología / Mal Estado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-md bg-[#2563EB] shadow-sm" />
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Sano / Buen Estado</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[12px] font-black text-white hover:bg-black transition-all shadow-md active:scale-95"
                    >
                        <ClipboardList size={16} /> EXPORTAR PDF (OFICIAL)
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('¿Deseas limpiar todos los hallazgos? Esta acción es irreversible.')) {
                                resetOdontogram();
                            }
                        }}
                        className="p-2.5 text-red-500 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-all shadow-sm"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* ── Dental Chart (Integrated Mixed Dentition) ── */}
            <div className="flex flex-col items-center gap-1 overflow-x-auto py-12 px-10 bg-white rounded-[40px] border border-slate-100 shadow-xl min-w-fit mb-12">
                {/* Permanent Upper Row (18-11 | 21-28) */}
                <div className="flex gap-2 mb-4">
                    <div className="flex gap-1.5 pr-6 border-r-2 border-slate-100">{renderRow(UPPER_RIGHT, true)}</div>
                    <div className="flex gap-1.5 pl-6">{renderRow(UPPER_LEFT, true)}</div>
                </div>

                {/* Primary Upper Row (55-51 | 61-65) */}
                <div className="flex gap-2 mb-16">
                    <div className="flex gap-1 pr-6 border-r-2 border-slate-100">{renderRow(PRIMARY_UPPER_RIGHT, true)}</div>
                    <div className="flex gap-1 pl-6">{renderRow(PRIMARY_UPPER_LEFT, true)}</div>
                </div>

                {/* Primary Lower Row (85-81 | 71-75) */}
                <div className="flex gap-2 mb-4">
                    <div className="flex gap-1 pr-6 border-r-2 border-slate-100">{renderRow(PRIMARY_LOWER_RIGHT, false)}</div>
                    <div className="flex gap-1 pl-6">{renderRow(PRIMARY_LOWER_LEFT, false)}</div>
                </div>

                {/* Permanent Lower Row (48-41 | 31-38) */}
                <div className="flex gap-2">
                    <div className="flex gap-1.5 pr-6 border-r-2 border-slate-100">{renderRow(LOWER_RIGHT, false)}</div>
                    <div className="flex gap-1.5 pl-6">{renderRow(LOWER_LEFT, false)}</div>
                </div>
            </div>

            {/* ── Official Footer: Specifications & Observations ── */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="space-y-3">
                    <label className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} className="text-blue-600" /> ESPECIFICACIONES
                    </label>
                    <textarea
                        value={globalSpecifications}
                        onChange={(e) => setGlobalSpecifications(e.target.value)}
                        className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm resize-none"
                        placeholder="Detalle aquí hallazgos generalizados como Fluorosis, etc."
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Info size={14} className="text-blue-600" /> OBSERVACIONES
                    </label>
                    <textarea
                        value={globalObservations}
                        onChange={(e) => setGlobalObservations(e.target.value)}
                        className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm resize-none"
                        placeholder="Observaciones clínicas adicionales..."
                    />
                </div>
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
