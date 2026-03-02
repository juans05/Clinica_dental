import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Phone, Mail, Calendar, MapPin, Activity,
    ClipboardList, Stethoscope, Briefcase, FileText,
    Heart, AlertCircle, Plus, Save, X, ChevronRight,
    Camera, Hash, Tag, Globe, MessageSquare, Info,
    CreditCard, Shield, Trash2, Edit3, MoreHorizontal, Baby, DollarSign
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Odontograma from './Odontograma';
import InitialTreatmentView from './InitialTreatmentView';
import QuestionnaireView from './QuestionnaireView';
import BudgetModule from './BudgetModule';
import FilesModule from './FilesModule';
import ConsentModule from './ConsentModule';
import AccountStatementModule from './AccountStatementModule';
import usePatientStore from '../store/usePatientStore';
import QuickAppointmentModal from './QuickAppointmentModal';
import { useAuth } from '../context/AuthContext';

const cn = (...inputs) => twMerge(clsx(inputs));

const PatientProfileView = ({ patientId: propId, onBack: propOnBack, initialModule: propInitialModule }) => {
    const { id: urlId, module: urlModule } = useParams();
    const navigate = useNavigate();
    const patientId = propId || urlId;

    const patient = usePatientStore(state => state.patient);
    const formData = usePatientStore(state => state.formData);
    const loading = usePatientStore(state => state.loading);
    const error = usePatientStore(state => state.error);
    const isEditing = usePatientStore(state => state.isEditing);
    const fetchPatient = usePatientStore(state => state.fetchPatient);
    const setIsEditing = usePatientStore(state => state.setIsEditing);
    const updateFormField = usePatientStore(state => state.updateFormField);
    const updateFiscalField = usePatientStore(state => state.updateFiscalField);
    const savePatient = usePatientStore(state => state.savePatient);

    const activeModule = urlModule || propInitialModule || 'filiation';
    const onBack = propOnBack || (() => navigate('/patients'));

    const { hasPermission } = useAuth();

    const MENU_ITEMS = [
        { id: 'filiation', label: 'Filiación', icon: User, perm: 'patients:view' },
        { id: 'history', label: 'Historia clínica', icon: FileText, perm: 'history:view' },
        { id: 'odontogram', label: 'Odontograma', icon: Activity, perm: 'history:view' },
        { id: 'budgets', label: 'Presupuestos', icon: DollarSign, perm: 'finance:view' },
        { id: 'account', label: 'Estado de cuenta', icon: CreditCard, perm: 'finance:view' },
        { id: 'prescriptions', label: 'Prescripciones', icon: ClipboardList, perm: 'history:view' },
        { id: 'consents', label: 'Consentimientos', icon: Shield, perm: 'patients:view' },
        { id: 'files', label: 'Archivos', icon: FileText, perm: 'patients:view' },
    ].filter(item => hasPermission(item.perm));

    useEffect(() => {
        fetchPatient(patientId);
    }, [patientId, fetchPatient]);

    const setActiveModule = (mod) => {
        navigate(`/expediente/${patientId}/${mod}`);
    };

    // Redirigir si el módulo actual no está permitido
    useEffect(() => {
        if (!MENU_ITEMS.find(m => m.id === activeModule)) {
            setActiveModule('filiation');
        }
    }, [activeModule, hasPermission]);

    const {
        activeTab,
        setActiveTab,
        activeHistoryTab,
        setActiveHistoryTab
    } = usePatientStore();

    const [showAppointmentModal, setShowAppointmentModal] = React.useState(false);

    const autoSelectRef = React.useRef(null);

    // Auto-select anamnesis tab based on age when entering history module
    useEffect(() => {
        const entryKey = `${patient?.id}-${activeModule}`;
        if (patient && patient.birthDate && activeModule === 'history' && autoSelectRef.current !== entryKey) {
            const birth = new Date(patient.birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

            const targetTab = age < 18 ? 'child' : 'adult';
            setActiveHistoryTab(targetTab);
            autoSelectRef.current = entryKey;
        } else if (activeModule !== 'history') {
            autoSelectRef.current = null;
        }
    }, [patient?.id, activeModule, setActiveHistoryTab]);

    const calculateAge = (birthDate) => {
        if (!birthDate) return '—';
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age; // Cambiado a devolver número para facilitar cálculos
    };

    const patientAge = patient?.birthDate ? calculateAge(patient.birthDate) : null;

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-6 bg-slate-50/50 rounded-[40px] border border-slate-100">
            <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="flex flex-col items-center gap-2">
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Cargando expediente clínico</p>
                <div className="h-1 w-32 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-full animate-pulse" />
                </div>
            </div>
        </div>
    );

    if (error || !patient) return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-6 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 text-center">
            <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                <AlertCircle size={40} />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Error al cargar expediente</h2>
                <p className="text-sm font-medium text-slate-400 mt-2 max-w-xs mx-auto">
                    {error || 'No hemos podido encontrar la información de este paciente en nuestra base de datos.'}
                </p>
            </div>
            <button
                onClick={onBack}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
                Regresar al listado
            </button>
        </div>
    );




    return (
        <div className="w-full h-full flex gap-4 text-slate-700 relative">

            {/* Quick Appointment Modal */}
            {showAppointmentModal && (
                <QuickAppointmentModal
                    patientId={patientId}
                    patientName={`${patient.firstName} ${patient.paternalSurname}`}
                    onClose={() => setShowAppointmentModal(false)}
                    onSuccess={() => setShowAppointmentModal(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <div className="w-72 flex flex-col gap-4 shrink-0">
                {/* Patient Summary Card */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-br from-indigo-500 to-cyan-400 opacity-10" />

                    <div className="relative group mb-3">
                        <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-slate-300">
                            <User size={48} />
                        </div>
                        <button className="absolute bottom-0 right-0 h-8 w-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center border-4 border-white shadow-lg active:scale-90 transition-all">
                            <Camera size={14} />
                        </button>
                    </div>

                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                        {patient.firstName} {patient.paternalSurname}
                    </h2>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest text-[10px]">
                        {patient.birthDate ? `${calculateAge(patient.birthDate)} años` : '—'} · HC {patient.hcNumber || 'N/A'}
                    </p>
                    <p className="text-xs font-medium text-slate-300 mt-0.5 italic">
                        Creado el {new Date(patient.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>

                    <div className="flex items-center gap-2 mt-4 flex-col w-full">
                        <button
                            onClick={() => setShowAppointmentModal(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                        >
                            <Calendar size={14} /> Generar Cita
                        </button>
                        <div className="flex items-center gap-2">
                            <button className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={16} /></button>
                            <button className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Mail size={16} /></button>
                            <button className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><MoreHorizontal size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="bg-white rounded-[32px] p-4 shadow-sm border border-slate-100 flex flex-col">
                    {MENU_ITEMS.map(item => {
                        const active = activeModule === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveModule(item.id)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                    active ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <item.icon size={18} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-cyan-500")} />
                                <span className="text-[13px] font-black uppercase tracking-widest">{item.label}</span>
                                {active && <ChevronRight size={16} className="ml-auto opacity-60" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto">

                {/* Top Alert Bar (Tags, Notes, Allergies) */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Tags */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <p className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <Tag size={10} className="text-indigo-500" /> Etiquetas
                            </p>
                            <button className="text-[10px] font-black text-indigo-600 hover:underline transition-all">+ AGREGAR</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {patient.tags ? patient.tags.split(',').map(tag => (
                                <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100">{tag.trim()}</span>
                            )) : (
                                <span className="text-[11px] text-slate-300 italic font-medium">Sin etiquetas</span>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5 relative">
                        <p className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <FileText size={10} className="text-amber-500" /> Notas
                        </p>
                        <textarea
                            value={formData.notes || ''}
                            onChange={e => updateFormField('notes', e.target.value)}
                            placeholder="Escribe aquí..."
                            className="bg-transparent text-slate-600 text-sm font-medium resize-none focus:outline-none min-h-[40px] border-none p-0"
                        />
                    </div>

                    {/* Allergies */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5 overflow-hidden">
                        <p className="flex items-center gap-2 text-[9px] font-black text-rose-400 uppercase tracking-widest">
                            <AlertCircle size={10} className="text-rose-500" /> Alergias
                        </p>
                        <textarea
                            value={formData.allergies || ''}
                            onChange={e => updateFormField('allergies', e.target.value)}
                            placeholder="Escribe aquí..."
                            className="bg-transparent text-rose-600 text-sm font-black resize-none focus:outline-none min-h-[40px] border-none p-0 placeholder:text-rose-200"
                        />
                        <button className="absolute top-4 right-4 h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={14} className="rotate-180" />
                        </button>
                    </div>
                </div>

                {/* Content Container */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex-1 flex flex-col h-full relative overflow-hidden">
                    {activeModule === 'filiation' && (
                        <div className="flex flex-col h-full">
                            {/* Tabs */}
                            <div className="px-8 pt-6 flex gap-6 border-b border-slate-100">
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className={cn("pb-3 text-xs font-black uppercase tracking-widest transition-all relative", activeTab === 'personal' ? "text-cyan-600" : "text-slate-400")}>
                                    Datos Personales
                                    {activeTab === 'personal' && <div className="absolute bottom-0 inset-x-0 h-1 bg-cyan-500 rounded-t-full" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('fiscal')}
                                    className={cn("pb-3 text-xs font-black uppercase tracking-widest transition-all relative", activeTab === 'fiscal' ? "text-cyan-600" : "text-slate-400")}>
                                    Datos Fiscales
                                    {activeTab === 'fiscal' && <div className="absolute bottom-0 inset-x-0 h-1 bg-cyan-500 rounded-t-full" />}
                                </button>

                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="ml-auto pb-3 flex items-center gap-2 text-[9px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest">
                                    <Edit3 size={10} /> Editar
                                </button>
                            </div>

                            {/* Form Grid */}
                            <div className="p-8 flex-1 overflow-y-auto">
                                {activeTab === 'personal' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-8">
                                        {/* Row 1 */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nombres*</label>
                                            <input
                                                disabled={!isEditing}
                                                value={formData.firstName || ''}
                                                onChange={e => updateFormField('firstName', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Apellidos*</label>
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Paterno"
                                                    disabled={!isEditing}
                                                    value={formData.paternalSurname || ''}
                                                    onChange={e => updateFormField('paternalSurname', e.target.value)}
                                                    className="flex-1 bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                                />
                                                <input
                                                    placeholder="Materno"
                                                    disabled={!isEditing}
                                                    value={formData.maternalSurname || ''}
                                                    onChange={e => updateFormField('maternalSurname', e.target.value)}
                                                    className="flex-1 bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Apodo</label>
                                            <input
                                                disabled={!isEditing}
                                                value={formData.nickname || ''}
                                                onChange={e => updateFormField('nickname', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>

                                        {/* Row 2 */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Documento</label>
                                            <div className="flex bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden focus-within:border-cyan-500 transition-all h-[42px]">
                                                <select
                                                    disabled={!isEditing}
                                                    value={formData.documentType}
                                                    onChange={e => updateFormField('documentType', e.target.value)}
                                                    className="bg-transparent border-none px-3 text-[10px] font-black text-slate-800 outline-none">
                                                    <option>DNI</option>
                                                    <option>PASAPORTE</option>
                                                    <option>CE</option>
                                                </select>
                                                <input
                                                    disabled={!isEditing}
                                                    value={formData.documentId || ''}
                                                    onChange={e => updateFormField('documentId', e.target.value)}
                                                    className="flex-1 bg-transparent border-none px-3 py-2 text-xs font-black text-slate-700 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Teléfono</label>
                                            <div className="flex bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden focus-within:border-cyan-500 transition-all h-[42px]">
                                                <div className="flex items-center gap-2 px-3 border-r-2 border-slate-100 bg-white/50">
                                                    <span role="img" aria-label="peru">🇵🇪</span>
                                                    <span className="text-[10px] font-black text-slate-500">+51</span>
                                                </div>
                                                <input
                                                    disabled={!isEditing}
                                                    value={formData.phoneMobile || ''}
                                                    onChange={e => updateFormField('phoneMobile', e.target.value)}
                                                    className="flex-1 bg-transparent border-none px-3 py-2 text-xs font-black text-slate-700 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Email</label>
                                            <input
                                                disabled={!isEditing}
                                                type="email"
                                                value={formData.email || ''}
                                                onChange={e => updateFormField('email', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>

                                        {/* Row 3 */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">F. nacimiento</label>
                                            <input
                                                type="date"
                                                disabled={!isEditing}
                                                value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
                                                onChange={e => updateFormField('birthDate', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">País</label>
                                            <select
                                                disabled={!isEditing}
                                                value={formData.birthCountry}
                                                onChange={e => updateFormField('birthCountry', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none">
                                                <option>Perú</option>
                                                <option>Chile</option>
                                                <option>Colombia</option>
                                                <option>Argentina</option>
                                                <option>Otros</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Tel. Fijo</label>
                                            <input
                                                disabled={!isEditing}
                                                value={formData.phoneHome || ''}
                                                onChange={e => updateFormField('phoneHome', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>

                                        {/* Row 4 */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">N° HC</label>
                                            <input
                                                disabled={!isEditing}
                                                value={formData.hcNumber || ''}
                                                onChange={e => updateFormField('hcNumber', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Dirección</label>
                                            <input
                                                placeholder="– Agregar"
                                                disabled={!isEditing}
                                                value={formData.address || ''}
                                                onChange={e => updateFormField('address', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Captación</label>
                                            <select
                                                disabled={!isEditing}
                                                value={formData.leadSource}
                                                onChange={e => updateFormField('leadSource', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none uppercase tracking-widest">
                                                <option>Seleccionar</option>
                                                <option>FACEBOOK</option>
                                                <option>INSTAGRAM</option>
                                                <option>REFERIDO</option>
                                                <option>EXTERNO</option>
                                            </select>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 max-w-4xl">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">RUC / DNI de Facturación</label>
                                            <input
                                                disabled={!isEditing}
                                                placeholder="Ej. 20123456789"
                                                value={formData.fiscalData?.taxId || ''}
                                                onChange={e => updateFiscalField('taxId', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Razón Social</label>
                                            <input
                                                disabled={!isEditing}
                                                placeholder="Nombre de la empresa"
                                                value={formData.fiscalData?.businessName || ''}
                                                onChange={e => updateFiscalField('businessName', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Dirección Fiscal</label>
                                            <input
                                                disabled={!isEditing}
                                                placeholder="Domicilio legal"
                                                value={formData.fiscalData?.address || ''}
                                                onChange={e => updateFiscalField('address', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="mt-8 flex justify-center sticky bottom-0 z-20">
                                        <button
                                            onClick={() => savePatient()}
                                            className="px-10 py-3 bg-cyan-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-cyan-600/30 hover:bg-cyan-700 transition-all active:scale-95 flex items-center gap-3">
                                            <Save size={16} /> Guardar cambios
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeModule === 'odontogram' && (
                        <div className="h-full overflow-y-auto p-8">
                            <Odontograma patientId={patientId} />
                        </div>
                    )}

                    {activeModule === 'budgets' && (
                        <div className="h-full overflow-y-auto p-8">
                            <BudgetModule
                                patientId={patientId}
                                patientName={`${patient.firstName} ${patient.paternalSurname}`}
                            />
                        </div>
                    )}

                    {activeModule === 'consents' && (
                        <div className="h-full overflow-y-auto p-8">
                            <ConsentModule
                                patientId={patientId}
                                patientName={`${patient?.firstName || ''} ${patient?.paternalSurname || ''}`.trim()}
                            />
                        </div>
                    )}

                    {activeModule === 'files' && (
                        <div className="h-full overflow-y-auto p-8">
                            <FilesModule patientId={patientId} />
                        </div>
                    )}

                    {activeModule === 'history' && (
                        <div className="flex flex-col h-full bg-white">
                            {/* Internal Tabs for Clinical History */}
                            <div className="px-8 pt-6 flex gap-8 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                                {[
                                    { id: 'adult', label: 'Anam. Adulto', icon: Stethoscope, minAge: 18 },
                                    { id: 'child', label: 'Anam. Niño', icon: Baby, maxAge: 17 },
                                    { id: 'endo', label: 'Endodoncia', icon: Activity, minAge: 18 }
                                ].filter(tab => {
                                    if (patientAge === null) return true;
                                    if (tab.minAge && patientAge < tab.minAge) return false;
                                    if (tab.maxAge && patientAge > tab.maxAge) return false;
                                    return true;
                                }).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveHistoryTab(tab.id)}
                                        className={cn(
                                            "pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2",
                                            activeHistoryTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600 group"
                                        )}
                                    >
                                        <tab.icon size={12} className={cn(activeHistoryTab === tab.id ? "text-indigo-500" : "text-slate-300 group-hover:text-slate-400")} />
                                        {tab.label}
                                        {activeHistoryTab === tab.id && (
                                            <div className="absolute bottom-0 inset-x-0 h-1 bg-indigo-500 rounded-t-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto bg-slate-50/30">
                                {activeHistoryTab === 'child' ? (
                                    <QuestionnaireView key="child" patientId={patientId} type="PED_ANAMNESIS" />
                                ) : activeHistoryTab === 'endo' ? (
                                    <QuestionnaireView key="endo" patientId={patientId} type="ENDODONTICS" />
                                ) : (
                                    <QuestionnaireView key="adult" patientId={patientId} type="ADULT_ANAMNESIS" />
                                )}
                            </div>
                        </div>
                    )}


                    {activeModule === 'account' && (
                        <div className="h-full overflow-y-auto p-8">
                            <AccountStatementModule patientId={patientId} />
                        </div>
                    )}

                    {(activeModule !== 'filiation' &&
                        activeModule !== 'odontogram' &&
                        activeModule !== 'history' &&
                        activeModule !== 'budgets' &&
                        activeModule !== 'consents' &&
                        activeModule !== 'files' &&
                        activeModule !== 'account') && (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center grayscale opacity-30">
                                <div className="h-32 w-32 rounded-full border-4 border-dashed border-slate-300 flex items-center justify-center mb-6">
                                    <ClipboardList size={48} className="text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Módulo en Desarrollo</h3>
                                <p className="text-sm font-medium text-slate-400 mt-2 max-w-xs">Este módulo clínico está siendo preparado por nuestro equipo de odontología especializada.</p>
                            </div>
                        )}

                    <button
                        onClick={onBack}
                        className="absolute top-6 right-8 h-10 w-10 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:scale-110 active:scale-95 transition-all z-[10]"
                        title="Cerrar y volver al listado"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientProfileView;
