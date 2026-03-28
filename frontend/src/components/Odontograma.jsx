import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, X, Search, MoreHorizontal, Hash, Info, ClipboardList, Trash2, Activity,
    History, Lock, Check, CheckCircle, AlertCircle, Box, Calendar, Settings,
    DollarSign, Plus, ChevronDown
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
const isWisdom = n => [18, 28, 38, 48].includes(n);
const isUpper = n => (n >= 11 && n <= 28) || (n >= 51 && n <= 65);
const isPrimary = n => n >= 51 && n <= 85;

const ALL_TEETH = [
    ...UPPER_RIGHT, ...UPPER_LEFT,
    ...LOWER_LEFT, ...LOWER_RIGHT,
    ...PRIMARY_UPPER_RIGHT, ...PRIMARY_UPPER_LEFT,
    ...PRIMARY_LOWER_LEFT, ...PRIMARY_LOWER_RIGHT
];

const VISUAL_ORDER = [
    ...UPPER_RIGHT, ...UPPER_LEFT,
    ...PRIMARY_UPPER_RIGHT, ...PRIMARY_UPPER_LEFT,
    ...PRIMARY_LOWER_RIGHT, ...PRIMARY_LOWER_LEFT,
    ...LOWER_RIGHT, ...LOWER_LEFT
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
    { id: 'MB', label: 'Mancha Blanca', sigla: 'MB', group: 'CARIES', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },
    { id: 'CE', label: 'Caries Esmalte', sigla: 'CE', group: 'CARIES', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },
    { id: 'CD', label: 'Caries Dentina', sigla: 'CD', group: 'CARIES', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },
    { id: 'CDP', label: 'Caries Dentina/Pulpa', sigla: 'CDP', group: 'CARIES', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },
    { id: 'CC', label: 'Caries Cervical', sigla: 'CC', group: 'CARIES', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },

    // GRUPO: Defectos de Desarrollo del Esmalte (ROJO)
    { id: 'HP', label: 'Hipoplasia', sigla: 'HP', group: 'DDE', color: PROTOCOL_COLORS.RED, type: 'box', requiresSurfaces: true },
    { id: 'HM', label: 'Hipomineralización', sigla: 'HM', group: 'DDE', color: PROTOCOL_COLORS.RED, type: 'box', requiresSurfaces: true },
    { id: 'O', label: 'Opacidad Esmalte', sigla: 'O', group: 'DDE', color: PROTOCOL_COLORS.RED, type: 'box', requiresSurfaces: true },
    { id: 'D', label: 'Decoloración Esmalte', sigla: 'D', group: 'DDE', color: PROTOCOL_COLORS.RED, type: 'box', requiresSurfaces: true },

    // GRUPO: Restauraciones (A/R)
    { id: 'AM', label: 'Amalgama Dental', sigla: 'AM', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },
    { id: 'R', label: 'Resina Compuesta', sigla: 'R', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },
    { id: 'IV', label: 'Ionómero de Vidrio', sigla: 'IV', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },
    { id: 'IM', label: 'Incrustación Metálica', sigla: 'IM', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },
    { id: 'IE', label: 'Incrustación Estética', sigla: 'IE', group: 'RESTORATION', type: 'drawing', visual: 'surface_filled', requiresSurfaces: true },
    { id: 'C', label: 'Carilla Estética', sigla: 'C', group: 'RESTORATION', type: 'drawing', visual: 'veneer', requiresSurfaces: true },
    { id: 'RT', label: 'Restauración Temporal', sigla: 'RT', group: 'RESTORATION', color: PROTOCOL_COLORS.RED, type: 'drawing', visual: 'surface_outline', requiresSurfaces: true },

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
    { id: 'EM', label: 'Espigo-Muñón', sigla: 'EM', group: 'PROSTHESIS', type: 'drawing', visual: 'post_core' },
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

// Lookup: conditionId → label  (used when building budget preview)
const FINDING_LABELS = Object.fromEntries(MINSA_FINDINGS.map(f => [f.id, f.label]));

// ─── BudgetPreviewModal ────────────────────────────────────────────────────
// Shows auto-suggested services from odontogram findings, lets the doctor
// add / remove / adjust before creating the treatment plan.
const BudgetPreviewModal = ({ initialItems, patientId, doctorId, onClose, onSuccess }) => {
    const { services, createBudget } = useBudgetStore();
    const [items, setItems] = React.useState(initialItems);
    const [creating, setCreating] = React.useState(false);

    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const changeService = (tempId, svcId) => {
        const svc = services.find(s => s.id === parseInt(svcId));
        if (!svc) return;
        setItems(prev => prev.map(it =>
            it.tempId === tempId ? { ...it, serviceId: svc.id, serviceName: svc.name, price: svc.price } : it
        ));
    };

    const changeQty = (tempId, val) => {
        const qty = Math.max(1, parseInt(val) || 1);
        setItems(prev => prev.map(it => it.tempId === tempId ? { ...it, quantity: qty } : it));
    };

    const changeTooth = (tempId, val) => {
        setItems(prev => prev.map(it => it.tempId === tempId ? { ...it, toothNumber: val } : it));
    };

    const removeItem = (tempId) => setItems(prev => prev.filter(it => it.tempId !== tempId));

    const addItem = () => {
        const svc = services[0];
        if (!svc) return;
        setItems(prev => [...prev, {
            tempId: `manual-${Date.now()}`,
            toothNumber: '',
            conditionId: '',
            conditionLabel: 'Ítem manual',
            serviceId: svc.id,
            serviceName: svc.name,
            price: svc.price,
            quantity: 1,
        }]);
    };

    const handleConfirm = async () => {
        if (items.length === 0) return;
        setCreating(true);
        const budgetItems = items.map(it => ({
            serviceId: it.serviceId,
            toothNumber: it.toothNumber || null,
            price: it.price,
            quantity: it.quantity,
            notes: it.conditionId ? `Hallazgo: ${it.conditionLabel}` : '',
        }));
        const result = await createBudget(
            patientId,
            doctorId,
            budgetItems,
            'Presupuesto generado desde odontograma.'
        );
        setCreating(false);
        if (result) {
            onSuccess();
        } else {
            alert('Error al crear el presupuesto. Por favor, intente nuevamente.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-500" />
                            Generar Presupuesto desde Odontograma
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {items.length} servicio{items.length !== 1 ? 's' : ''} sugerido{items.length !== 1 ? 's' : ''} · Revisa, ajusta y confirma
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto px-7 py-5">
                    {items.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <DollarSign size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-semibold">No hay ítems. Agrega servicios manualmente.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="text-left pb-3 pr-3 w-16">Pieza</th>
                                    <th className="text-left pb-3 pr-3">Hallazgo</th>
                                    <th className="text-left pb-3 pr-3">Servicio</th>
                                    <th className="text-center pb-3 pr-3 w-16">Cant.</th>
                                    <th className="text-right pb-3 pr-3 w-24">Precio</th>
                                    <th className="text-right pb-3 w-24">Subtotal</th>
                                    <th className="pb-3 w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((it) => (
                                    <tr key={it.tempId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-2.5 pr-3">
                                            <input
                                                type="text"
                                                value={it.toothNumber}
                                                onChange={e => changeTooth(it.tempId, e.target.value)}
                                                className="w-14 text-center border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-black focus:outline-none focus:border-cyan-400"
                                                placeholder="—"
                                                maxLength={3}
                                            />
                                        </td>
                                        <td className="py-2.5 pr-3 max-w-[130px]">
                                            <span className="text-xs text-slate-500 truncate block">{it.conditionLabel || '—'}</span>
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            <div className="relative">
                                                <select
                                                    value={it.serviceId}
                                                    onChange={e => changeService(it.tempId, e.target.value)}
                                                    className="w-full border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 text-xs bg-white appearance-none focus:outline-none focus:border-cyan-400"
                                                >
                                                    {services.map(svc => (
                                                        <option key={svc.id} value={svc.id}>{svc.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </td>
                                        <td className="py-2.5 pr-3 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                max="99"
                                                value={it.quantity}
                                                onChange={e => changeQty(it.tempId, e.target.value)}
                                                className="w-14 text-center border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                                            />
                                        </td>
                                        <td className="py-2.5 pr-3 text-right text-xs text-slate-500 font-semibold whitespace-nowrap">
                                            S/ {it.price.toFixed(2)}
                                        </td>
                                        <td className="py-2.5 text-right text-xs font-black text-slate-900 whitespace-nowrap">
                                            S/ {(it.price * it.quantity).toFixed(2)}
                                        </td>
                                        <td className="py-2.5 pl-2">
                                            <button
                                                onClick={() => removeItem(it.tempId)}
                                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <button
                        onClick={addItem}
                        className="mt-4 flex items-center gap-1.5 text-xs font-black text-cyan-600 hover:text-cyan-700 transition-colors"
                    >
                        <Plus size={13} /> AGREGAR ÍTEM
                    </button>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-7 py-5 flex items-center justify-between bg-slate-50/50 rounded-b-3xl">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-500 font-semibold">TOTAL ESTIMADO</span>
                        <span className="text-2xl font-black text-slate-900">S/ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={items.length === 0 || creating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 border border-emerald-700 rounded-xl text-xs font-black text-white hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30 active:scale-95"
                        >
                            <Check size={14} />
                            {creating ? 'Creando...' : 'Crear Presupuesto'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                    <rect x="7" y="5" width="10" height="10" />
                    <line x1="12" y1="15" x2="12" y2="22" />
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

const sc = (tooth, s, n) => {
    if (!tooth || !tooth.surfaces) return null;
    const items = tooth.surfaces[s] || [];
    if (items.length === 0) return null;

    const dataList = items.map(id => getConditionData(id)).filter(d => d && d.visual !== 'surface_outline');
    if (dataList.length === 0) return null;

    // Prioridad: Patologías (Rojo) sobre estados sanos/restauraciones (Azul)
    const redItem = dataList.find(d =>
        d.group === 'CARIES' ||
        d.group === 'DDE' ||
        d.baseId === 'FX' ||
        d.state === 'BAD' ||
        d.color === PROTOCOL_COLORS.RED
    );
    if (redItem) return PROTOCOL_COLORS.RED;

    const blueItem = dataList.find(d => d.state === 'GOOD' || d.color === PROTOCOL_COLORS.BLUE);
    if (blueItem) return PROTOCOL_COLORS.BLUE;

    return dataList[0]?.color || null;
};

// ─── Interactive Surface Square Helper ────────────────────────────────────
const ToothSurfaceSquare = ({ tooth, number, onMarkSurface, selectedFinding, findingState, isReadOnly }) => {
    const isU = isUpper(number);
    const isR = [1, 4, 5, 8].includes(Math.floor(number / 10));

    // Mapping based on user requested image:
    // Top: L
    // Center: O
    // Bottom: V
    // Left: D
    // Right: M

    const getSurfaceStatus = (s) => {
        return tooth.surfaces[s]?.length > 0;
    };

    const handleToggle = (s) => {
        if (isReadOnly) return;

        let condition = selectedFinding ? `${selectedFinding.id}:${findingState}` : null;

        // Si no hay hallazgo seleccionado en el modal, intentamos autodetectar qué quitar
        if (!condition && tooth.surfaces[s]?.length > 0) {
            // Mandamos null a markSurface, que ahora quita el último hallazgo de la superficie
            onMarkSurface(number, s, null);
        } else {
            onMarkSurface(number, s, condition);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-44 h-44 bg-slate-50 rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-center">
                <div className="relative w-36 h-36">
                    {/* SVG for the square divisions matching the image */}
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                        {/* Top (L) */}
                        <path
                            d="M 5,5 L 95,5 L 75,25 L 25,25 Z"
                            className={cn(
                                "cursor-pointer transition-all duration-200 stroke-[1.5]",
                                getSurfaceStatus('L') ? "fill-blue-600 stroke-blue-700" : "fill-white stroke-slate-200 hover:fill-blue-50/50"
                            )}
                            onClick={() => handleToggle('L')}
                        />
                        {/* Bottom (V) */}
                        <path
                            d="M 25,75 L 75,75 L 95,95 L 5,95 Z"
                            className={cn(
                                "cursor-pointer transition-all duration-200 stroke-[1.5]",
                                getSurfaceStatus('V') ? "fill-blue-600 stroke-blue-700" : "fill-white stroke-slate-200 hover:fill-blue-50/50"
                            )}
                            onClick={() => handleToggle('V')}
                        />
                        {/* Left (D) */}
                        <path
                            d="M 5,5 L 25,25 L 25,75 L 5,95 Z"
                            className={cn(
                                "cursor-pointer transition-all duration-200 stroke-[1.5]",
                                getSurfaceStatus('D') ? "fill-blue-600 stroke-blue-700" : "fill-white stroke-slate-200 hover:fill-blue-50/50"
                            )}
                            onClick={() => handleToggle('D')}
                        />
                        {/* Right (M) */}
                        <path
                            d="M 95,5 L 95,95 L 75,75 L 75,25 Z"
                            className={cn(
                                "cursor-pointer transition-all duration-200 stroke-[1.5]",
                                getSurfaceStatus('M') ? "fill-blue-600 stroke-blue-700" : "fill-white stroke-slate-200 hover:fill-blue-50/50"
                            )}
                            onClick={() => handleToggle('M')}
                        />
                        {/* Center (O) */}
                        <rect
                            x="25" y="25" width="50" height="50"
                            className={cn(
                                "cursor-pointer transition-all duration-200 stroke-[1.5]",
                                getSurfaceStatus('O') ? "fill-blue-600 stroke-blue-700" : "fill-white stroke-slate-200 hover:fill-blue-50/50"
                            )}
                            onClick={() => handleToggle('O')}
                        />

                        {/* Labels positioned as per image */}
                        <g className="pointer-events-none font-black text-[12px] tracking-tighter" fill="currentColor">
                            {/* L Label (Top) */}
                            <text x="50" y="18" textAnchor="middle" className={getSurfaceStatus('L') ? "fill-white" : "fill-slate-400"}>L</text>
                            {/* V Label (Bottom) */}
                            <text x="50" y="88" textAnchor="middle" className={getSurfaceStatus('V') ? "fill-white" : "fill-slate-400"}>V</text>
                            {/* D Label (Left) */}
                            <text x="15" y="50" dominantBaseline="middle" textAnchor="middle" className={getSurfaceStatus('D') ? "fill-white" : "fill-slate-400"}>D</text>
                            {/* M Label (Right) */}
                            <text x="85" y="50" dominantBaseline="middle" textAnchor="middle" className={getSurfaceStatus('M') ? "fill-white" : "fill-slate-400"}>M</text>
                            {/* O Label (Center) */}
                            <text x="50" y="52" dominantBaseline="middle" textAnchor="middle" className={cn("text-[16px]", getSurfaceStatus('O') ? "fill-white" : "fill-slate-400")}>O</text>
                        </g>
                    </svg>
                </div>
            </div>
            <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Marcado</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" /> Vacío</span>
            </div>
        </div>
    );
};

// ─── Tooth Range Selector (Orthodontics) ─────────────────────────────────
const ToothRangeSelector = ({ activeTooth, arcade, rangeStart, rangeEnd, onSelect, onClear }) => {
    // Detect arcade set: Superior (1x, 2x) vs Inferior (4x, 3x)
    const isSup = isUpper(activeTooth);

    // Pieces ordered as requested: Left to Right from dentist's perspective
    // Superior: [18...11] | [21...28]
    // Inferior: [48...41] | [31...38]
    const leftSide = isSup ? [18, 17, 16, 15, 14, 13, 12, 11] : [48, 47, 46, 45, 44, 43, 42, 41];
    const rightSide = isSup ? [21, 22, 23, 24, 25, 26, 27, 28] : [31, 32, 33, 34, 35, 36, 37, 38];

    const allPieces = [...leftSide, ...rightSide];

    const isInRange = (num) => {
        if (!rangeStart || !rangeEnd) return false;
        const startIdx = allPieces.indexOf(Number(rangeStart));
        const endIdx = allPieces.indexOf(Number(rangeEnd));
        const currIdx = allPieces.indexOf(num);
        const min = Math.min(startIdx, endIdx);
        const max = Math.max(startIdx, endIdx);
        return currIdx >= min && currIdx <= max;
    };

    const isEdge = (num) => num === Number(rangeStart) || num === Number(rangeEnd);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={14} /> Seleccionar Rango de Piezas ({isSup ? 'Arcada Superior' : 'Arcada Inferior'})
                </h4>
                {(rangeStart || rangeEnd) && (
                    <button
                        onClick={onClear}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Limpiar
                    </button>
                )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex gap-1">
                    {leftSide.map(num => (
                        <button
                            key={num}
                            onClick={() => onSelect(num)}
                            className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-[13px] font-bold transition-all border",
                                isEdge(num)
                                    ? "bg-[#2563EB] border-[#2563EB] text-white shadow-md"
                                    : isInRange(num)
                                        ? "bg-[#DBEAFE] border-[#BFDBFE] text-[#2563EB]"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <div className="mx-2 w-px h-8 bg-slate-200" /> {/* Separator | */}

                <div className="flex gap-1">
                    {rightSide.map(num => (
                        <button
                            key={num}
                            onClick={() => onSelect(num)}
                            className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-[13px] font-bold transition-all border",
                                isEdge(num)
                                    ? "bg-[#2563EB] border-[#2563EB] text-white shadow-md"
                                    : isInRange(num)
                                        ? "bg-[#DBEAFE] border-[#BFDBFE] text-[#2563EB]"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-[10px] text-slate-400 font-medium">
                Primer clic: Inicio • Segundo clic: Fin del rango
            </p>
        </div>
    );
};

const ToothDetailModal = ({ tooth, number, onClose, onMarkTeeth, onMarkTooth, onMarkSurface, onRemoveFinding, onUpdateFindingState, onSetNote, patientId, activeMode, readOnlyOverride }) => {
    if (!tooth) return null;

    const { fetchToothHistory, toothHistory } = useOdontogramStore();
    const { budgets, fetchBudgets, updateBudgetItem } = useBudgetStore();
    const { user } = useAuth();
    const [search, setSearch] = React.useState('');
    const [selectedFinding, setSelectedFinding] = React.useState(null);
    const [findingState, setFindingState] = React.useState('BAD');
    const [subSelection, setSubSelection] = React.useState([]); // Multi or single
    const [rangeSelection, setRangeSelection] = React.useState({ start: null, end: null });
    const [showConfirmation, setShowConfirmation] = React.useState(false);
    const { syncToothToBudget } = useBudgetStore();

    // Smart default for findingState when selecting a finding
    React.useEffect(() => {
        if (selectedFinding) {
            if (['CARIES', 'OTHERS', 'DDE'].includes(selectedFinding.group)) {
                setFindingState('BAD');
            } else if (['RESTORATION', 'SEALANT', 'PROSTHESIS', 'ORTHO'].includes(selectedFinding.group)) {
                setFindingState('GOOD');
            }

            // If range finding, pre-fill start with current tooth
            const isRange = ['OFJ', 'ORE', 'EDENTULO'].includes(selectedFinding.id);
            if (isRange && !rangeSelection.start) {
                setRangeSelection({ start: number, end: null });
            } else if (!isRange) {
                setRangeSelection({ start: null, end: null });
            }
        } else {
            setRangeSelection({ start: null, end: null });
        }
    }, [selectedFinding, number]);

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

    const handleSetEvolutionState = async (newState) => {
        useOdontogramStore.getState().setEvolutionState(number, newState);
        // ... rest of logic stays same
    };

    const isRangeFinding = ['OFJ', 'ORE', 'EDENTULO'].includes(selectedFinding?.id);

    const getRangePieces = () => {
        if (!rangeSelection.start) return [number];
        if (!rangeSelection.end) return [Number(rangeSelection.start)];

        const isSup = isUpper(number);
        const leftSide = isSup ? [18, 17, 16, 15, 14, 13, 12, 11] : [48, 47, 46, 45, 44, 43, 42, 41];
        const rightSide = isSup ? [21, 22, 23, 24, 25, 26, 27, 28] : [31, 32, 33, 34, 35, 36, 37, 38];
        const allPieces = [...leftSide, ...rightSide];

        const startIdx = allPieces.indexOf(Number(rangeSelection.start));
        const endIdx = allPieces.indexOf(Number(rangeSelection.end));
        const min = Math.min(startIdx, endIdx);
        const max = Math.max(startIdx, endIdx);

        return allPieces.slice(min, max + 1);
    };

    const handleApplyFinding = () => {
        if (!selectedFinding) return;

        // If range and has range but not confirmed yet
        if (isRangeFinding && rangeSelection.start && rangeSelection.end && !showConfirmation) {
            setShowConfirmation(true);
            return;
        }

        let finalId = selectedFinding.id;
        const pieces = isRangeFinding ? getRangePieces() : [number];

        if (isRangeFinding) {
            onMarkTeeth(pieces, `${finalId}:${findingState}`);
        } else if (['OFJ', 'ORE', 'PF', 'PR', 'PT', 'EDENTULO'].includes(finalId) && subSelection.length > 0) {
            onMarkTeeth(subSelection.map(Number), `${finalId}:${findingState}`);
        } else if ((finalId === 'FUS' || finalId === 'TRA' || finalId === 'SUPERNUMERARY') && subSelection.length > 0) {
            onMarkTooth(number, `${finalId}:${findingState}:${subSelection[0]}`);
        } else {
            const condition = `${finalId}:${findingState}${subSelection.length > 0 ? `:${subSelection.join(',')}` : ''}`;
            onMarkTooth(number, condition);
        }

        if (activeMode === 'INITIAL') {
            setTimeout(() => {
                // If it was a range, we should sync all pieces? 
                // For now following existing logic for single piece or atomic update
                pieces.forEach(p => {
                    syncToothToBudget(patientId, user?.id, p, useOdontogramStore.getState().teeth[p]);
                });
            }, 100);
        }

        onClose();
    };

    const filteredFindings = MINSA_FINDINGS.filter(f =>
        f.label.toLowerCase().includes(search.toLowerCase()) ||
        f.sigla.toLowerCase().includes(search.toLowerCase())
    );

    const isReadOnly = readOnlyOverride;

    const getSubOptions = () => {
        if (!selectedFinding) return null;
        if (selectedFinding.id === 'MOB') return ['M1', 'M2', 'M3'];
        if (['TC', 'PC', 'PP'].includes(selectedFinding.id)) return ['TC', 'PC', 'PP'];
        if (selectedFinding.id === 'FUS' || selectedFinding.id === 'TRA' || selectedFinding.id === 'SUPERNUMERARY') {
            const neighbors = [];
            const pos = ALL_TEETH.indexOf(number);
            if (pos > 0) neighbors.push(ALL_TEETH[pos - 1]);
            if (pos < ALL_TEETH.length - 1) neighbors.push(ALL_TEETH[pos + 1]);
            const isU = isUpper(number);
            const validNeighbors = neighbors.filter(n => isUpper(n) === isU);
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
                <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100/50">
                            {number}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Gestión de Pieza Dental</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    DETALLE CLÍNICO FDI
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
                    {/* Col 1: Surface & Identification */}
                    <div className={cn(activeMode === 'EVOLUTION' ? "lg:col-span-6" : "lg:col-span-3", "space-y-6")}>
                        <div className="bg-slate-50/50 rounded-[32px] border border-slate-100 p-6 shadow-inner">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Box size={14} /> MAPA DE SUPERFICIES
                            </h3>

                            <ToothSurfaceSquare
                                tooth={tooth}
                                number={number}
                                onMarkSurface={onMarkSurface}
                                selectedFinding={selectedFinding}
                                findingState={findingState}
                                isReadOnly={isReadOnly}
                            />

                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
                                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Identificación</h4>
                                <div className="flex font-black text-blue-100 items-baseline justify-center gap-1.5">
                                    <span className="text-4xl">{number}</span>
                                    <span className="text-lg uppercase">{isUpper(number) ? 'Sup' : 'Inf'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">CONDICIÓN / NOTAS CLÍNICAS</h3>
                            <textarea
                                value={tooth.notes || ''}
                                disabled={isReadOnly}
                                onChange={e => onSetNote(number, e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-4 text-[13px] text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-100/50 placeholder:text-slate-300 resize-none h-48 transition-all font-medium leading-relaxed"
                                placeholder="Añadir notas diagnósticas o condición de la pieza..."
                            />
                        </div>
                    </div>

                    {/* Col 2: Finding Search & Selection */}
                    {activeMode !== 'EVOLUTION' && (
                        <div className="lg:col-span-5 space-y-4 lg:border-x lg:px-8 border-slate-100">
                            {selectedFinding?.group === 'CARIES' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={14} className="text-rose-500" /> TIPO DE LESIÓN
                                        </h3>
                                        <button
                                            onClick={() => setSelectedFinding(null)}
                                            className="text-[9px] font-bold text-blue-600 hover:underline"
                                        >
                                            Ver todos los hallazgos
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {filteredFindings.filter(f => f.group === 'CARIES').map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => setSelectedFinding(f)}
                                                className={cn(
                                                    "p-4 rounded-xl border transition-all text-left flex items-center justify-between group h-full",
                                                    selectedFinding?.id === f.id
                                                        ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                                        : "bg-white border-slate-100 text-slate-600 hover:border-rose-200"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center font-black text-rose-600 text-xs">
                                                        {f.sigla}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-[13px] uppercase">{f.label}</div>
                                                        <div className="text-[9px] opacity-60 font-medium">Nivel de profundidad: {f.label}</div>
                                                    </div>
                                                </div>
                                                {selectedFinding?.id === f.id && <CheckCircle size={18} className="text-rose-500" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                                        <p className="text-[9px] text-rose-600 font-bold leading-relaxed">
                                            <Info size={11} className="inline mr-1 mb-0.5" />
                                            Seleccione las superficies en el diagrama de la izquierda para aplicar la lesión seleccionada.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">AÑADIR CONDICIÓN</h3>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buscar hallazgo..."
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-5">
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
                                                                    <span className="font-bold text-[10px] leading-tight uppercase truncate">{f.label}</span>
                                                                </div>
                                                                {selectedFinding?.id === f.id && <Check size={14} className="text-blue-400" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Col 3: Details & History */}
                    <div className={cn(activeMode === 'EVOLUTION' ? "lg:col-span-6" : "lg:col-span-4", "space-y-8")}>
                        {selectedFinding && (
                            <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100 space-y-6">
                                {showConfirmation ? (
                                    <div className="space-y-6 animate-fade-in text-center">
                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-100">
                                            <AlertCircle size={32} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-black text-slate-800">Confirmar Aplicación</h3>
                                            <p className="text-[13px] text-slate-500 font-medium">
                                                Se aplicará <span className="text-blue-600 font-bold">{selectedFinding.label}</span> a las piezas:
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {getRangePieces().map(p => (
                                                <span key={p} className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-black text-blue-600 shadow-sm">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => setShowConfirmation(false)}
                                                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-500 hover:bg-slate-50 transition-all uppercase"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleApplyFinding}
                                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase"
                                            >
                                                Confirmar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                            <Settings size={14} /> CONFIGURAR ESTADO
                                        </h3>
                                        <div className="flex bg-white/50 p-1 rounded-2xl border border-blue-100">
                                            <button
                                                onClick={() => {
                                                    onUpdateFindingState(number, selectedFinding.id, 'GOOD');
                                                    setFindingState('GOOD');
                                                }}
                                                className={cn("flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all", findingState === 'GOOD' ? "bg-white shadow-sm" : "text-slate-400")}
                                            >
                                                SANO
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onUpdateFindingState(number, selectedFinding.id, 'BAD');
                                                    setFindingState('BAD');
                                                }}
                                                className={cn("flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all", findingState === 'BAD' ? "bg-white shadow-sm" : "text-slate-400")}
                                            >
                                                PATOLÓGICO
                                            </button>
                                        </div>

                                        {isRangeFinding ? (
                                            <ToothRangeSelector
                                                activeTooth={number}
                                                rangeStart={rangeSelection.start}
                                                rangeEnd={rangeSelection.end}
                                                onSelect={(num) => {
                                                    if (!rangeSelection.start || (rangeSelection.start && rangeSelection.end)) {
                                                        setRangeSelection({ start: num, end: null });
                                                    } else {
                                                        setRangeSelection(prev => ({ ...prev, end: num }));
                                                    }
                                                }}
                                                onClear={() => setRangeSelection({ start: null, end: null })}
                                            />
                                        ) : subOptions && (
                                            <div className="space-y-3 pt-2">
                                                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest pl-1">Especifique:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {subOptions.map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => {
                                                                if (['OFJ', 'ORE', 'PF', 'PR', 'PT', 'EDENTULO'].includes(selectedFinding.id)) {
                                                                    const current = subSelection.map(Number);
                                                                    if (current.includes(Number(opt))) {
                                                                        setSubSelection(current.filter(n => n !== Number(opt)).map(String));
                                                                    } else {
                                                                        setSubSelection([...current, Number(opt)].sort((a, b) => a - b).map(String));
                                                                    }
                                                                } else {
                                                                    setSubSelection([opt]);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "px-3 py-2 rounded-xl border text-[10px] font-black transition-all",
                                                                subSelection.includes(opt) ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200" : "bg-white border-blue-100 text-blue-600 hover:border-blue-300"
                                                            )}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeMode === 'EVOLUTION' && (
                            <div className="bg-emerald-50/50 p-8 rounded-[32px] border border-emerald-100 space-y-6">
                                <h3 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle size={14} /> ESTADO DE EVOLUCIÓN
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { id: 'CURADO', label: 'Curado / Restaurado', color: 'text-emerald-600', bg: 'bg-emerald-100/50', border: 'border-emerald-200' },
                                        { id: 'PENDIENTE', label: 'Pendiente de curar', color: 'text-amber-600', bg: 'bg-amber-100/50', border: 'border-amber-200' },
                                        { id: 'CANCELADO', label: 'Cancelado', color: 'text-slate-600', bg: 'bg-slate-100/50', border: 'border-slate-200' },
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleSetEvolutionState(s.id)}
                                            className={cn("w-full p-4 rounded-2xl border transition-all text-[11px] font-black uppercase flex items-center justify-between", tooth.evolutionState === s.id ? `${s.bg} ${s.border} ${s.color}` : "bg-white text-slate-400")}
                                        >
                                            {s.label}
                                            {tooth.evolutionState === s.id && <Check size={16} />}
                                        </button>
                                    ))}
                                    <button onClick={() => handleSetEvolutionState(null)} className="w-full p-3 text-[10px] font-bold text-slate-400 uppercase">Limpiar estado</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={14} className="text-rose-500" /> Hallazgos Activos
                            </h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {(() => {
                                    const list = [];
                                    (tooth.conditions || []).forEach(c => list.push({ id: c, type: 'TOOTH' }));
                                    Object.entries(tooth.surfaces || {}).forEach(([s, items]) => {
                                        (items || []).forEach(c => {
                                            const existing = list.find(f => f.id === c);
                                            if (existing) {
                                                if (!existing.surfaces) existing.surfaces = [];
                                                if (!existing.surfaces.includes(s)) existing.surfaces.push(s);
                                            } else {
                                                list.push({ id: c, type: 'SURFACE', surfaces: [s] });
                                            }
                                        });
                                    });

                                    return list.map((item, idx) => {
                                        const [baseId, state, extra] = item.id.split(':');
                                        const finding = MINSA_FINDINGS.find(f => f.id === baseId);
                                        const label = finding ? finding.label : baseId;
                                        const surfacesLabel = item.surfaces ? ` (${item.surfaces.join(', ')})` : '';

                                        return (
                                            <div
                                                key={`${item.id}-${idx}`}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group",
                                                    selectedFinding?.id === baseId ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:bg-slate-50"
                                                )}
                                                onClick={() => {
                                                    if (finding) {
                                                        setSelectedFinding(finding);
                                                        setFindingState(state || 'BAD');
                                                        if (extra) setSubSelection(extra.split(','));
                                                    }
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-800 uppercase leading-none">
                                                        {label}{surfacesLabel}
                                                    </span>
                                                    <span className={cn("text-[8px] font-bold mt-1 uppercase tracking-wider", state === 'BAD' ? "text-rose-500" : "text-blue-500")}>
                                                        {state === 'BAD' ? 'PATOLÓGICO' : 'SANO/BUENO'}
                                                    </span>
                                                </div>
                                                {!isReadOnly && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemoveFinding(number, item.id);
                                                        }}
                                                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {activeMode === 'EVOLUTION' && approvedItems.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle size={14} className="text-emerald-500" /> Presupuesto
                                </h3>
                                <div className="space-y-2">
                                    {approvedItems.map(item => (
                                        <div key={item.id} className={cn("p-3 rounded-xl border flex items-center justify-between", item.status === 'COMPLETED' ? "bg-emerald-50 opacity-60" : "bg-white shadow-sm")}>
                                            <span className="text-[10px] font-black truncate max-w-[150px]">{item.service?.name}</span>
                                            {item.status !== 'COMPLETED' ? (
                                                <button onClick={() => handleCompleteItem(item)} className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black">Finalizar</button>
                                            ) : (
                                                <Check size={14} className="text-emerald-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <History size={14} className="text-indigo-400" /> Historial
                            </h3>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {toothHistory?.map(log => (
                                    <div key={log.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm text-[10px] font-medium">
                                        {log.description}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100 flex justify-end shrink-0">
                    <button
                        onClick={selectedFinding ? handleApplyFinding : onClose}
                        className={cn("px-10 py-3.5 rounded-2xl text-[11px] font-black transition-all shadow-xl uppercase tracking-widest active:scale-95", selectedFinding ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-900 text-white hover:bg-black")}
                    >
                        {selectedFinding ? 'REGISTRAR HALLAZGO' : 'LISTO'}
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
    // Standard 5-surface crown for all teeth (anatomical diagrams in NTS-150 use 5 divisions for all)
    // top/bottom are V/L or L/V depending on arch, as mapped in ToothSVG
    const crowns = {
        top: isUpperTooth ? "0,30 30,30 20,20 10,20" : "0,0 30,0 20,10 10,10",
        left: "0,0 10,10 10,20 0,30",
        bottom: isUpperTooth ? "0,0 10,10 20,10 30,0" : "0,30 10,20 20,20 30,30",
        right: "30,0 20,10 20,20 30,30",
        center: "10,10 20,10 20,20 10,20"
    };

    let roots = [];
    const isMolarTooth = isMolar(number);
    if (isMolarTooth) {
        roots = [
            "0,30 5,50 10,30",
            "10,30 15,50 20,30",
            "20,30 25,50 30,30"
        ];
    } else if ([14, 24, 34, 44, 35, 45, 15, 25].includes(number) || isPremolar(number)) {
        // Double or single roots for premolars
        if ([14, 24].includes(number)) {
            roots = ["5,30 10,50 15,30", "15,30 20,50 25,30"];
        } else {
            roots = ["10,30 15,50 20,30"];
        }
    } else {
        // Incisors / Canines
        roots = ["10,30 15,50 20,30"];
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
        L: isUpperTooth ? crowns.bottom : crowns.top,
        V: isUpperTooth ? crowns.top : crowns.bottom,
        M: crowns.left,
        D: crowns.right,
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
    const fusionCond = allConditions.find(c => c.baseId === 'FUS');
    const hasFusion = !!fusionCond;
    const hasGem = allConditions.some(c => c.baseId === 'GEM');

    // Lógica visual para círculos compactos (Fusión/Geminación)
    const getFusionStyle = () => {
        const partner = fusionCond?.extra ? parseInt(fusionCond.extra) : null;
        if (!partner) return {};
        const myIdx = VISUAL_ORDER.indexOf(number);
        const pIdx = VISUAL_ORDER.indexOf(partner);
        const isPartnerAfter = pIdx > myIdx; // Partner está a la derecha visualmente
        return isPartnerAfter
            ? { left: '2px', right: '-10px' }  // Parámetros exactos de la captura
            : { left: '-10px', right: '3px' }; // Parámetros exactos de la captura
    };

    const getNumberShiftStyle = () => {
        if (!hasFusion) return {};
        const partner = fusionCond?.extra ? parseInt(fusionCond.extra) : null;
        if (!partner) return {};
        const myIdx = VISUAL_ORDER.indexOf(number);
        const pIdx = VISUAL_ORDER.indexOf(partner);
        const isPartnerAfter = pIdx > myIdx;
        return isPartnerAfter
            ? { transform: 'translateX(6px)' }   // Centrado exacto en óvalo (26 - 20)
            : { transform: 'translateX(-6.5px)' }; // Centrado exacto en óvalo (13.5 - 20)
    };
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

                    <div className={cn(
                        "w-full py-1 mb-2 flex justify-center transition-all relative font-black text-[14px]",
                        isSelected ? "text-blue-600" : "text-slate-800"
                    )}>
                        {hasGem && (
                            <div className="absolute inset-y-[-4px] inset-x-[6px] border-2 rounded-full pointer-events-none z-10" style={{ borderColor: PROTOCOL_COLORS.BLUE }} />
                        )}
                        {hasFusion && (
                            <div className="absolute inset-y-[-4px] border-2 rounded-full pointer-events-none z-10"
                                style={{ borderColor: PROTOCOL_COLORS.BLUE, ...getFusionStyle() }} />
                        )}
                        <span className="z-20 relative transition-transform duration-300" style={getNumberShiftStyle()}>{number}</span>
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
                className={cn("block pointer-events-none relative z-10")}
            >
                <g transform={isUpperTooth ? "scale(1,-1) translate(0,-50)" : ""}>
                    {/* Roots */}
                    {roots.map((r, i) => (
                        <polygon key={`r${i}`} points={r} fill="none" stroke={borderColor} strokeWidth="1" />
                    ))}

                    {/* Drawings Overlay */}
                    <g>
                        {['V', 'L', 'M', 'D', 'O'].map(s => {
                            if (!surfMap[s]) return null;
                            const fill = sc(data, s, number);
                            return (
                                <polygon key={s} points={surfMap[s]}
                                    fill={fill || "white"}
                                    onClick={e => { e.stopPropagation(); onSurface(number, s, e); }}
                                    className="hover:fill-blue-50/50 transition-colors pointer-events-auto"
                                    stroke={borderColor} strokeWidth="1"
                                />
                            );
                        })}

                        {/* Surface Outlines (e.g. Restauración Temporal) */}
                        {['V', 'L', 'M', 'D', 'O'].map(s => {
                            if (!surfMap[s]) return null;
                            const items = data?.surfaces?.[s] || [];
                            const hasOutline = items.some(id => {
                                const d = getConditionData(id);
                                return d && d.visual === 'surface_outline';
                            });
                            if (!hasOutline) return null;
                            return (
                                <polygon key={`outline-${s}`} points={surfMap[s]}
                                    fill="none"
                                    stroke={PROTOCOL_COLORS.RED}
                                    strokeWidth="2"
                                    className="pointer-events-none"
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
                                            stroke={color} strokeWidth="2.5"
                                        />
                                    );
                                }
                                case 'zigzag_arrow':
                                    // Según norma COP: Línea zigzag azul hacia oclusal (Pieza en Erupción)
                                    return (
                                        <path
                                            key={idx}
                                            d={`M${mx},35 l-4,-7 l8,-7 l-4,-7 l0,-9 m-4,4 l4,-4 l4,4`}
                                            fill="none"
                                            stroke={color}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="pointer-events-none"
                                        />
                                    );
                                case 'arrow_extrude':
                                case 'arrow_intrude': {
                                    const isDown = cond.visual === 'arrow_extrude';
                                    const isSup = isUpper(number);
                                    // Posición: debajo para superiores, encima para inferiores
                                    const baseY = isSup ? 85 : -15;
                                    const tipY = isSup ? 105 : -35;

                                    // Si es extruida (↓), la punta va en el Y mayor (o menor según arcada)
                                    // Pero el requerimiento dice:
                                    // Extruida (↓): Siempre hacia abajo
                                    // Intruida (↑): Siempre hacia arriba
                                    const yStart = isDown ? (isSup ? 85 : -15) : (isSup ? 105 : -35);
                                    const yEnd = isDown ? (isSup ? 105 : -35) : (isSup ? 85 : -15);

                                    // Simplificando por dirección absoluta:
                                    const y1 = isDown ? (isSup ? 85 : -15) : (isSup ? 105 : -35);
                                    const y2 = isDown ? (isSup ? 105 : -35) : (isSup ? 85 : -15);
                                    const arrowTip = isDown ? 4 : -4;

                                    return (
                                        <g key={idx} className="pointer-events-none">
                                            <line x1={mx} y1={y1} x2={mx} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                                            <path d={`M${mx - 4},${y2 - arrowTip} l4,${arrowTip} l4,${-arrowTip}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                    );
                                }
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
                                case 'post_core': {
                                    // Espigo - Muñón: Cuadrado en corona + línea en raíz
                                    return (
                                        <g key={idx} stroke={color} strokeWidth="2" fill="none">
                                            {/* Cuadrado en zona de corona (y=10 a 28 aprox) */}
                                            <rect x={mx - 9} y={10} width={18} height={18} />
                                            {/* Línea en zona de raíz (y=28 hacia abajo) */}
                                            <line x1={mx} y1={28} x2={mx} y2={60} />
                                        </g>
                                    );
                                }
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
                                    const h = 4;
                                    // Onda sinusoidal suave que empieza en (0, apexY) y termina en (30, apexY)
                                    // Esto permite que se vea continuo entre piezas adyacentes.
                                    const path = `M 0 ${apexY} Q 7.5 ${apexY + h} 15 ${apexY} Q 22.5 ${apexY - h} 30 ${apexY}`;
                                    return (
                                        <path
                                            key={idx}
                                            d={path}
                                            fill="none"
                                            stroke={color}
                                            strokeWidth="2.5"
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

            {!isUpperTooth && (
                <div className={cn(
                    "w-full py-1 mt-2 flex justify-center transition-all relative font-black text-[14px]",
                    isSelected ? "text-blue-600" : "text-slate-800"
                )}>
                    {hasGem && (
                        <div className="absolute inset-y-[-4px] inset-x-[6px] border-2 rounded-full pointer-events-none z-10" style={{ borderColor: PROTOCOL_COLORS.BLUE }} />
                    )}
                    {hasFusion && (
                        <div className="absolute inset-y-[-4px] border-2 rounded-full pointer-events-none z-10"
                            style={{ borderColor: PROTOCOL_COLORS.BLUE, ...getFusionStyle() }} />
                    )}
                    <span className="z-20 relative transition-transform duration-300" style={getNumberShiftStyle()}>{number}</span>
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
        removeFindingFromTooth,
        updateFindingState,
        setNote,
        setIsTemporary,
        setSelected,
        activeMode,
        setActiveMode,
        setEvolutionState,
        globalSpecifications,
        globalObservations,
        setGlobalSpecifications,
        setGlobalObservations,
        // Multi-visit
        allVisits,
        currentVisitId,
        isReadOnlyVisit,
        switchVisit,
        createNewVisit,
    } = useOdontogramStore();

    const { user } = useAuth();
    const { createBudgetFromOdontogram, syncAllToBudget, fetchServices, services, buildBudgetPreview } = useBudgetStore();
    const navigate = useNavigate();

    const [activeOdoTab, setActiveOdoTab] = React.useState('initial');
    const [saved, setSaved] = React.useState(false);
    const [detailTooth, setDetailTooth] = React.useState(null);
    const [showNewVisitModal, setShowNewVisitModal] = React.useState(false);
    const [newVisitNotes, setNewVisitNotes] = React.useState('');
    const [creatingVisit, setCreatingVisit] = React.useState(false);
    const [showBudgetModal, setShowBudgetModal] = React.useState(false);
    const [previewItems, setPreviewItems] = React.useState([]);

    React.useEffect(() => {
        if (patientId) fetchOdontogram(patientId);
    }, [patientId]);

    const handleSave = async () => {
        if (patientId) {
            await saveOdontogram(patientId);
            if (user?.id) {
                await syncAllToBudget(patientId, user.id, teeth);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const handleOpenBudgetPreview = async () => {
        // Persiste hallazgos antes de generar presupuesto.
        // El modal navega fuera del odontograma al confirmar;
        // sin este guardado los hallazgos se pierden al desmontar el componente.
        if (dirty && patientId) {
            await saveOdontogram(patientId);
        }

        if (services.length === 0) await fetchServices();

        const items = buildBudgetPreview(teeth, FINDING_LABELS);
        if (items.length === 0) {
            alert('No se encontraron hallazgos que requieran tratamiento. Registra hallazgos en el odontograma primero.');
            return;
        }
        setPreviewItems(items);
        setShowBudgetModal(true);
    };

    const handleCreateNewVisit = async () => {
        setCreatingVisit(true);
        await createNewVisit(patientId, newVisitNotes);
        setCreatingVisit(false);
        setShowNewVisitModal(false);
        setNewVisitNotes('');
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
        <>
            <div className="pt-2">
                <AnimatePresence>
                    {detailTooth && (
                        <ToothDetailModal
                            number={detailTooth.number}
                            tooth={teeth[detailTooth.number]}
                            patientId={patientId}
                            activeMode={activeMode}
                            readOnlyOverride={isReadOnlyVisit}
                            onClose={() => setDetailTooth(null)}
                            onMarkTeeth={markTeeth}
                            onMarkTooth={markTooth}
                            onMarkSurface={markSurface}
                            onRemoveFinding={removeFindingFromTooth}
                            onUpdateFindingState={updateFindingState}
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
                                    activeMode === tab.id ? "text-teal" : "text-slate-400"
                                )}>
                                {tab.label}
                                {activeMode === tab.id && <div className="absolute bottom-0 inset-x-0 h-1 bg-teal rounded-t-full" />}
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

                {/* ── Visit History Panel ── */}
                {allVisits.length > 0 && (
                    <div className="flex items-center gap-3 mb-4 px-1 flex-wrap">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
                            <Calendar size={11} /> Consultas:
                        </span>
                        <div className="flex gap-2 flex-wrap flex-1">
                            {[...allVisits].reverse().map((visit, idx) => {
                                const isActive = visit.id === currentVisitId;
                                const isLatest = visit.id === allVisits[0].id;
                                const date = new Date(visit.visitDate || visit.createdAt).toLocaleDateString('es-PE');
                                return (
                                    <button
                                        key={visit.id}
                                        onClick={() => switchVisit(visit.id)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all',
                                            isActive
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                                : isLatest
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                                        )}
                                    >
                                        <span className="opacity-60">Consulta {idx + 1}</span>
                                        <span className="ml-1.5">{date}</span>
                                        {isLatest && !isActive && <span className="ml-1 text-emerald-400">●</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setShowNewVisitModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-all whitespace-nowrap"
                        >
                            + Nueva Consulta
                        </button>
                    </div>
                )}

                {/* Read-only banner for past visits */}
                {isReadOnlyVisit && (
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-4">
                        <div className="flex items-center gap-2.5">
                            <Lock size={16} className="text-amber-600" />
                            <div>
                                <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Consulta anterior — Solo lectura</p>
                                <p className="text-[10px] text-amber-600 mt-0.5">Este odontograma es histórico y no puede modificarse. Selecciona la consulta más reciente para editar o crea una nueva.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => switchVisit(allVisits[0].id)}
                                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black hover:bg-amber-700 transition-all"
                            >
                                Ir a actual
                            </button>
                            <button
                                onClick={() => setShowNewVisitModal(true)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-black transition-all"
                            >
                                + Nueva consulta
                            </button>
                        </div>
                    </div>
                )}

                {/* New Visit Modal */}
                <AnimatePresence>
                    {showNewVisitModal && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 mx-4"
                            >
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">Nueva Consulta</h2>
                                    <p className="text-[11px] text-slate-400 mt-1">Se creará un nuevo odontograma en blanco para esta visita. El anterior quedará guardado como consulta histórica.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas de la sesión (opcional)</label>
                                    <textarea
                                        value={newVisitNotes}
                                        onChange={e => setNewVisitNotes(e.target.value)}
                                        placeholder="Ej: Control post-operatorio, revisión rutinaria..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none h-28"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowNewVisitModal(false)}
                                        className="flex-1 py-3 border border-slate-200 rounded-xl text-[11px] font-black text-slate-500 hover:bg-slate-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleCreateNewVisit}
                                        disabled={creatingVisit}
                                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        {creatingVisit ? 'Creando...' : '✓ Crear nueva consulta'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

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
                            onClick={handleOpenBudgetPreview}
                            disabled={isReadOnlyVisit}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 border border-emerald-700 rounded-xl text-[12px] font-black text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <DollarSign size={16} /> GENERAR PRESUPUESTO
                        </button>
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

            {/* ── Budget Preview Modal ── */}
            {showBudgetModal && (
                <BudgetPreviewModal
                    initialItems={previewItems}
                    patientId={patientId}
                    doctorId={user?.id}
                    onClose={() => setShowBudgetModal(false)}
                    onSuccess={() => {
                        setShowBudgetModal(false);
                        navigate(`/expediente/${patientId}/budgets`);
                    }}
                />
            )}
        </>
    );
};

export default Odontograma;
