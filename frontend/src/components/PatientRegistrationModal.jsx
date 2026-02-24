import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, ChevronLeft, Plus, Info, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const PatientRegistrationModal = ({ isOpen, onClose, onSave, editData = null }) => {
    const isEdit = !!editData;
    const [step, setStep] = useState(1);
    const [showOptional, setShowOptional] = useState(true);
    const [showTagsPopover, setShowTagsPopover] = useState(false);
    const [formData, setFormData] = useState({
        documentType: 'DNI',
        documentId: '',
        noDocument: false,
        firstName: '',
        paternalSurname: '',
        maternalSurname: '',
        phoneMobile: '',
        noPhone: false,
        hasGuardian: false,
        email: '',
        birthDate: '',
        gender: 'Hombre',
        leadSource: '',
        insurance: '',
        tags: []
    });

    const [guardianData, setGuardianData] = useState({
        relation: 'Papá',
        email: '',
        documentType: 'DNI',
        documentId: '',
        noDocument: false,
        firstName: '',
        paternalSurname: '',
        maternalSurname: '',
        phoneMobile: '',
        noPhone: false,
        address: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    // Reset state whenever the modal opens
    useEffect(() => {
        if (!isOpen) return;

        if (isEdit && editData) {
            setFormData({
                documentType: editData.documentType || 'DNI',
                documentId: editData.documentId || '',
                noDocument: !editData.documentId,
                firstName: editData.firstName || '',
                paternalSurname: editData.paternalSurname || '',
                maternalSurname: editData.maternalSurname || '',
                phoneMobile: editData.phoneMobile?.replace('+51 ', '') || '',
                noPhone: !editData.phoneMobile,
                hasGuardian: !!editData.hasGuardian,
                email: editData.email || '',
                birthDate: editData.birthDate ? new Date(editData.birthDate).toISOString().split('T')[0] : '',
                gender: editData.gender || 'Hombre',
                leadSource: editData.leadSource || '',
                insurance: editData.insurance || '',
                tags: typeof editData.tags === 'string' ? editData.tags.split(',').filter(Boolean) : (Array.isArray(editData.tags) ? editData.tags : [])
            });
            if (editData.hasGuardian) {
                setGuardianData({
                    relation: editData.guardianRelation || 'Papá',
                    email: editData.guardianEmail || '',
                    documentType: editData.guardianDocumentType || 'DNI',
                    documentId: editData.guardianDocumentId || '',
                    noDocument: !editData.guardianDocumentId,
                    firstName: editData.guardianName?.split(' ')[0] || '',
                    paternalSurname: editData.guardianName?.split(' ')[1] || '',
                    maternalSurname: editData.guardianName?.split(' ')[2] || '',
                    phoneMobile: editData.guardianPhone?.replace('+51 ', '') || '',
                    noPhone: !editData.guardianPhone,
                    address: editData.guardianAddress || ''
                });
            }
        } else {
            setFormData({
                documentType: 'DNI',
                documentId: '',
                noDocument: false,
                firstName: '',
                paternalSurname: '',
                maternalSurname: '',
                phoneMobile: '',
                noPhone: false,
                hasGuardian: false,
                email: '',
                birthDate: '',
                gender: 'Hombre',
                leadSource: '',
                insurance: '',
                tags: []
            });
            setGuardianData({
                relation: 'Papá',
                email: '',
                documentType: 'DNI',
                documentId: '',
                noDocument: false,
                firstName: '',
                paternalSurname: '',
                maternalSurname: '',
                phoneMobile: '',
                noPhone: false,
                address: ''
            });
        }
        setStep(1);
        setIsSaving(false);
        setShowOptional(true);
        setShowTagsPopover(false);
    }, [isOpen]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();

        if (formData.hasGuardian && step === 1) {
            setStep(2);
            return;
        }

        setIsSaving(true);
        try {
            await onSave({ ...formData, guardian: formData.hasGuardian ? guardianData : null });
            onClose();
        } catch (error) {
            console.error('Error saving patient:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleTag = (tag, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setFormData(prev => {
            const currentTags = Array.isArray(prev.tags) ? prev.tags : [];
            const isSelected = currentTags.includes(tag);
            return {
                ...prev,
                tags: isSelected
                    ? currentTags.filter(t => t !== tag)
                    : [...currentTags, tag]
            };
        });
    };

    const TAG_OPTIONS = [
        { name: 'Nuevo', bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]' },
        { name: 'VIP', bg: 'bg-[#e0e7ff]', text: 'text-[#4f46e5]' },
        { name: 'Impuntual', bg: 'bg-[#fee2e2]', text: 'text-[#dc2626]' },
        { name: 'Fidelizado', bg: 'bg-[#cffafe]', text: 'text-[#0891b2]' },
        { name: 'Especial', bg: 'bg-[#fef9c3]', text: 'text-[#ca8a04]' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                    />

                    {/* Modal Container */}
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "bg-white rounded-[20px] shadow-2xl relative z-10 flex flex-col transition-all duration-300 ease-in-out overflow-hidden h-fit max-h-[90vh]",
                            showOptional && step === 1 ? "w-[1100px]" : "w-[600px]"
                        )}
                    >
                        {/* Header */}
                        <div className="p-3 flex justify-between items-center bg-white border-b border-slate-50">
                            <div className="flex-1">
                                {step === 2 && (
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-[13px]"
                                    >
                                        <ChevronLeft size={16} />
                                        <span>Atrás</span>
                                    </button>
                                )}
                            </div>

                            {formData.hasGuardian ? (
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-6 w-6 rounded-full flex items-center justify-center text-[12px] font-bold",
                                            step === 1 ? "bg-[#00aeb5] text-white" : "bg-[#00aeb5]/10 text-[#00aeb5]"
                                        )}>
                                            {step > 1 ? <Check size={14} /> : "1"}
                                        </div>
                                        <span className={cn("text-[14px]", step === 1 ? "font-bold text-slate-600" : "text-slate-400")}>Datos paciente</span>
                                    </div>
                                    <div className="w-12 h-[1px] bg-slate-200" />
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-6 w-6 rounded-full flex items-center justify-center text-[12px] font-bold",
                                            step === 2 ? "bg-[#00aeb5] text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            2
                                        </div>
                                        <span className={cn("text-[14px]", step === 2 ? "font-bold text-slate-600" : "text-slate-400")}>Datos apoderado</span>
                                    </div>
                                </div>
                            ) : (
                                <h2 className="text-[16px] font-black text-slate-600 uppercase tracking-widest">{isEdit ? 'Editar Paciente' : 'Crear nuevo paciente'}</h2>
                            )}

                            <div className="flex-1 flex justify-end">
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-slate-200">
                            <form id="patient-form" onSubmit={handleSave} className="flex flex-col gap-3">
                                {step === 1 ? (
                                    <div className="flex gap-6 relative items-stretch">
                                        {/* Left Column: Mandatary */}
                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#ff8a5c] mb-2">Obligatorios</h3>

                                            <div className="grid grid-cols-[100px_1fr] items-start gap-x-3 gap-y-1">
                                                <label className="text-[12px] text-slate-500 font-bold pt-2">DNI / CE*</label>
                                                <div className="space-y-1">
                                                    <div className="flex border border-[#00aeb5] rounded-lg overflow-hidden transition-all h-[36px]">
                                                        <div className="relative border-r border-[#00aeb5]">
                                                            <select
                                                                value={formData.documentType}
                                                                onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                                                                className="w-20 bg-white px-2 h-full text-[13px] text-slate-700 font-bold outline-none appearance-none cursor-pointer"
                                                            >
                                                                <option>DNI</option>
                                                                <option>CE</option>
                                                                <option>PAS</option>
                                                            </select>
                                                            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#00aeb5] pointer-events-none" />
                                                        </div>
                                                        <input
                                                            disabled={formData.noDocument}
                                                            value={formData.documentId}
                                                            onChange={e => setFormData({ ...formData, documentId: e.target.value })}
                                                            className="flex-1 px-3 h-full text-[14px] text-slate-600 outline-none disabled:bg-slate-50 font-bold"
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                                                        <div className={cn(
                                                            "h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                                                            formData.noDocument ? "border-[#00aeb5]" : "border-slate-300"
                                                        )}>
                                                            {formData.noDocument && <div className="h-3 w-3 rounded-full bg-[#00aeb5]" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            hidden
                                                            checked={formData.noDocument}
                                                            onChange={e => setFormData({ ...formData, noDocument: e.target.checked, documentId: e.target.checked ? '' : formData.documentId })}
                                                        />
                                                        <span className="text-[13px] text-slate-400">No tiene</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
                                                <label className="text-[12px] text-slate-500 font-bold">Nombres*</label>
                                                <input
                                                    required
                                                    value={formData.firstName}
                                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                                />
                                            </div>

                                            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
                                                <label className="text-[12px] text-slate-500 font-bold">Apellidos*</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        required
                                                        placeholder="Paterno"
                                                        value={formData.paternalSurname}
                                                        onChange={e => setFormData({ ...formData, paternalSurname: e.target.value })}
                                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                                    />
                                                    <input
                                                        placeholder="Materno"
                                                        value={formData.maternalSurname}
                                                        onChange={e => setFormData({ ...formData, maternalSurname: e.target.value })}
                                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-[100px_1fr] items-start gap-x-3 gap-y-1">
                                                <label className="text-[12px] text-slate-500 font-bold pt-1.5">Teléfono*</label>
                                                <div className="space-y-1">
                                                    <div className="flex border border-slate-200 rounded-lg overflow-hidden transition-all h-[36px]">
                                                        <div className="flex items-center gap-2 bg-white px-2 h-full border-r border-slate-200">
                                                            <span className="text-sm">🇵🇪</span>
                                                            <span className="text-[13px] font-bold text-slate-700">+51</span>
                                                            <ChevronDown size={12} className="text-[#00aeb5]" />
                                                        </div>
                                                        <input
                                                            disabled={formData.noPhone}
                                                            value={formData.phoneMobile}
                                                            onChange={e => setFormData({ ...formData, phoneMobile: e.target.value })}
                                                            className="flex-1 px-3 h-full text-[14px] text-slate-600 outline-none disabled:bg-slate-50 font-bold"
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                                                        <div className={cn(
                                                            "h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                                                            formData.noPhone ? "border-[#00aeb5]" : "border-slate-300"
                                                        )}>
                                                            {formData.noPhone && <div className="h-3 w-3 rounded-full bg-[#00aeb5]" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            hidden
                                                            checked={formData.noPhone}
                                                            onChange={e => setFormData({ ...formData, noPhone: e.target.checked, phoneMobile: e.target.checked ? '' : formData.phoneMobile })}
                                                        />
                                                        <span className="text-[12.5px] text-slate-400">No tiene</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="pt-0 grid grid-cols-[100px_1fr] items-start gap-3">
                                                <div />
                                                <div className="flex flex-col gap-3">
                                                    <label className="flex items-center gap-2 cursor-pointer group w-fit">
                                                        <div className={cn(
                                                            "h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                                                            formData.hasGuardian ? "border-[#00aeb5]" : "border-slate-300"
                                                        )}>
                                                            {formData.hasGuardian && <div className="h-3 w-3 rounded-full bg-[#00aeb5]" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            hidden
                                                            checked={formData.hasGuardian}
                                                            onChange={e => setFormData({ ...formData, hasGuardian: e.target.checked })}
                                                        />
                                                        <span className="text-[13px] text-slate-600 font-medium">Tiene un apoderado</span>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        onClick={() => setShowOptional(!showOptional)}
                                                        className="flex items-center gap-1 text-[13px] font-bold text-[#00aeb5]"
                                                    >
                                                        <ChevronLeft size={16} className={cn("transition-transform", !showOptional && "-rotate-90")} />
                                                        <span>{showOptional ? 'Menos datos' : 'Más datos'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Separator Line */}
                                        {showOptional && (
                                            <div className="w-[1px] bg-slate-100 flex-shrink-0" />
                                        )}

                                        {/* Right Column: Optional */}
                                        {showOptional && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex-1 space-y-3"
                                            >
                                                <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-2">Opcionales</h3>

                                                <div className="grid grid-cols-[100px_1fr] items-center gap-3">
                                                    <label className="text-[12px] text-slate-500 font-bold">Email</label>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr] items-center gap-3">
                                                    <label className="text-[12px] text-slate-500 font-bold">Nacimiento</label>
                                                    <div className="relative group">
                                                        <input
                                                            type="date"
                                                            value={formData.birthDate}
                                                            onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr] items-center gap-3">
                                                    <label className="text-[12px] text-slate-500 font-bold">Sexo</label>
                                                    <div className="relative group">
                                                        <select
                                                            value={formData.gender}
                                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] appearance-none cursor-pointer h-[36px]"
                                                        >
                                                            <option>Hombre</option>
                                                            <option>Mujer</option>
                                                            <option>Otro</option>
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00aeb5] pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr] items-center gap-3">
                                                    <label className="text-[12px] text-slate-500 font-bold">Captación</label>
                                                    <div className="relative group">
                                                        <select
                                                            value={formData.leadSource}
                                                            onChange={e => setFormData({ ...formData, leadSource: e.target.value })}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] appearance-none cursor-pointer h-[36px]"
                                                        >
                                                            <option value="">Seleccione</option>
                                                            <option>Redes Sociales</option>
                                                            <option>Recomendación</option>
                                                            <option>Página Web</option>
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00aeb5] pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr] items-center gap-3">
                                                    <label className="text-[12px] text-slate-500 font-bold">Seguro</label>
                                                    <div className="relative group">
                                                        <select
                                                            value={formData.insurance}
                                                            onChange={e => setFormData({ ...formData, insurance: e.target.value })}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] appearance-none cursor-pointer h-[36px]"
                                                        >
                                                            <option value="">Seleccionar</option>
                                                            <option>Rimac</option>
                                                            <option>Pacífico</option>
                                                            <option>Mapfre</option>
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00aeb5] pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div className="pt-0 grid grid-cols-[100px_1fr] items-center gap-3">
                                                    <span className="text-[12px] text-slate-500 font-bold">Etiquetas</span>
                                                    <div className="relative">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setShowTagsPopover(!showTagsPopover);
                                                                }}
                                                                className="flex items-center gap-1.5 text-[14px] text-[#00aeb5] font-bold shrink-0"
                                                            >
                                                                <Plus size={18} className="border border-[#00aeb5] rounded-full p-0.5" />
                                                                <span>Etiquetas</span>
                                                            </button>

                                                            {/* Selected Tags Display */}
                                                            {formData.tags && formData.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {formData.tags.map(tagName => {
                                                                        const tagOpt = TAG_OPTIONS.find(t => t.name === tagName);
                                                                        return (
                                                                            <span
                                                                                key={tagName}
                                                                                className={cn(
                                                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                                                    tagOpt?.bg || "bg-slate-100",
                                                                                    tagOpt?.text || "text-slate-500",
                                                                                    tagOpt ? "border-transparent" : "border-slate-200"
                                                                                )}
                                                                            >
                                                                                {tagName}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Tags Popover */}
                                                        <AnimatePresence>
                                                            {showTagsPopover && (
                                                                <>
                                                                    <div
                                                                        className="fixed inset-0 z-40"
                                                                        onClick={() => setShowTagsPopover(false)}
                                                                    />
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        className="absolute right-0 bottom-[calc(100%+12px)] z-50 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-5 w-[380px]"
                                                                    >
                                                                        <div className="flex flex-wrap gap-2 mb-5">
                                                                            {TAG_OPTIONS.map(tag => (
                                                                                <button
                                                                                    key={tag.name}
                                                                                    type="button"
                                                                                    onClick={(e) => toggleTag(tag.name, e)}
                                                                                    className={cn(
                                                                                        "px-4 py-1.5 rounded-full text-[14px] font-medium transition-all border",
                                                                                        tag.bg,
                                                                                        tag.text,
                                                                                        formData.tags && Array.isArray(formData.tags) && formData.tags.includes(tag.name)
                                                                                            ? "ring-2 ring-offset-2 ring-[#00aeb5] border-[#00aeb5] shadow-sm scale-105"
                                                                                            : "border-transparent opacity-70 hover:opacity-100"
                                                                                    )}
                                                                                >
                                                                                    <span className="flex items-center gap-1.5">
                                                                                        {formData.tags && Array.isArray(formData.tags) && formData.tags.includes(tag.name) && <Check size={12} />}
                                                                                        {tag.name}
                                                                                    </span>
                                                                                </button>
                                                                            ))}
                                                                        </div>

                                                                        <div className="pt-4 border-t border-slate-100">
                                                                            <p className="text-[12.5px] text-slate-400 leading-relaxed font-normal">
                                                                                Puedes crear y gestionar tus etiquetas desde Configuración, pestaña Administración, pestaña Etiquetas.
                                                                            </p>
                                                                        </div>

                                                                        {/* Arrow */}
                                                                        <div className="absolute -bottom-[6px] right-6 w-[12px] h-[12px] bg-white border-r border-b border-slate-100 rotate-45" />
                                                                    </motion.div>
                                                                </>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4 max-w-xl mx-auto w-full pb-4"
                                    >
                                        <div className="flex justify-center mb-4">
                                            <div className="flex p-0.5 bg-slate-50 rounded-lg border border-slate-100">
                                                <button
                                                    type="button"
                                                    className="px-5 py-1.5 bg-white text-[#00aeb5] font-black rounded-md shadow-sm border border-[#00aeb5]/10 text-[12px] uppercase tracking-wider"
                                                >
                                                    Apoderado nuevo
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-5 py-1.5 text-slate-400 font-bold text-[12px] uppercase tracking-wider"
                                                >
                                                    Existente
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                                            <label className="text-[12px] text-slate-500 font-bold">Relación</label>
                                            <div className="relative group">
                                                <select
                                                    value={guardianData.relation}
                                                    onChange={e => setGuardianData({ ...guardianData, relation: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] appearance-none cursor-pointer h-[36px]"
                                                >
                                                    <option>Mamá</option>
                                                    <option>Papá</option>
                                                    <option>Tutor legal</option>
                                                    <option>Otro</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00aeb5] pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                                            <label className="text-[12px] text-slate-500 font-bold">Email</label>
                                            <input
                                                type="email"
                                                value={guardianData.email}
                                                onChange={e => setGuardianData({ ...guardianData, email: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-[110px_1fr] items-start gap-x-3 gap-y-0.5">
                                            <label className="text-[12px] text-slate-500 font-bold pt-2">DNI / CE*</label>
                                            <div className="space-y-1">
                                                <div className="flex border border-slate-200 rounded-lg overflow-hidden transition-all h-[36px]">
                                                    <div className="relative border-r border-slate-200">
                                                        <select
                                                            value={guardianData.documentType}
                                                            onChange={e => setGuardianData({ ...guardianData, documentType: e.target.value })}
                                                            className="w-20 bg-white px-2 h-full text-[13px] text-slate-700 font-bold outline-none appearance-none cursor-pointer"
                                                        >
                                                            <option>DNI</option>
                                                            <option>CE</option>
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#00aeb5] pointer-events-none" />
                                                    </div>
                                                    <input
                                                        disabled={guardianData.noDocument}
                                                        value={guardianData.documentId}
                                                        onChange={e => setGuardianData({ ...guardianData, documentId: e.target.value })}
                                                        className="flex-1 px-3 h-full text-[14px] text-slate-700 font-bold outline-none disabled:bg-slate-50"
                                                    />
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer w-fit justify-end ml-auto">
                                                    <div className={cn(
                                                        "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                                                        guardianData.noDocument ? "border-[#00aeb5]" : "border-slate-300"
                                                    )}>
                                                        {guardianData.noDocument && <div className="h-2 w-2 rounded-full bg-[#00aeb5]" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        hidden
                                                        checked={guardianData.noDocument}
                                                        onChange={e => setGuardianData({ ...guardianData, noDocument: e.target.checked })}
                                                    />
                                                    <span className="text-[12px] text-slate-400 font-bold">No tiene</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                                            <label className="text-[12px] text-slate-500 font-bold">Nombres*</label>
                                            <input
                                                value={guardianData.firstName}
                                                onChange={e => setGuardianData({ ...guardianData, firstName: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                                            <label className="text-[12px] text-slate-500 font-bold">Apellidos*</label>
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Paterno"
                                                    value={guardianData.paternalSurname}
                                                    onChange={e => setGuardianData({ ...guardianData, paternalSurname: e.target.value })}
                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                                />
                                                <input
                                                    placeholder="Materno"
                                                    value={guardianData.maternalSurname}
                                                    onChange={e => setGuardianData({ ...guardianData, maternalSurname: e.target.value })}
                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                                            <label className="text-[12px] text-slate-500 font-bold">Teléfono*</label>
                                            <div className="flex border border-slate-200 rounded-lg overflow-hidden transition-all h-[36px]">
                                                <div className="flex items-center gap-2 bg-white px-2 h-full border-r border-slate-200">
                                                    <span className="text-sm">🇵🇪</span>
                                                    <span className="text-[13px] font-bold text-slate-700">+51</span>
                                                    <ChevronDown size={12} className="text-[#00aeb5]" />
                                                </div>
                                                <input
                                                    value={guardianData.phoneMobile}
                                                    onChange={e => setGuardianData({ ...guardianData, phoneMobile: e.target.value })}
                                                    className="flex-1 px-3 h-full text-[14px] text-slate-700 font-bold outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                                            <label className="text-[12px] text-slate-500 font-bold">Dirección</label>
                                            <input
                                                value={guardianData.address}
                                                onChange={e => setGuardianData({ ...guardianData, address: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 font-medium outline-none focus:border-[#00aeb5] transition-all h-[36px]"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        </div>

                        {/* Footer - Fixed at bottom */}
                        <div className="flex justify-center gap-4 py-4 border-t border-slate-100 bg-white shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-10 py-2 border border-[#00aeb5] text-[#00aeb5] font-black text-[13px] uppercase tracking-widest rounded-xl hover:bg-cyan-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <div className="relative group/footer flex gap-2">
                                <button
                                    form="patient-form"
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-10 py-2 bg-[#00aeb5] text-white font-black text-[13px] uppercase tracking-widest rounded-xl hover:bg-[#009ca3] transition-all flex items-center gap-2"
                                >
                                    <span>{isSaving ? (step === 1 && formData.hasGuardian ? 'Siguiente...' : 'Guardando...') : (step === 1 && formData.hasGuardian ? 'Continuar' : (isEdit ? 'Actualizar' : 'Crear'))}</span>
                                    {step === 1 && formData.hasGuardian && <ChevronDown size={16} className="-rotate-90" />}
                                </button>

                                {/* Hint Tooltip */}
                                <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/footer:opacity-100 transition-all duration-200 transform translate-y-2 group-hover/footer:translate-y-0 z-50">
                                    <div className="bg-slate-800 text-white text-[12px] py-2 px-4 rounded-lg shadow-xl whitespace-nowrap relative font-medium">
                                        Llena los datos y dale a "{step === 1 && formData.hasGuardian ? 'Continuar' : 'Crear'}"
                                        {/* Arrow */}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PatientRegistrationModal;
