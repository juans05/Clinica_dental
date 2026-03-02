import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, PenTool, Check, Trash2, Download, Upload, Plus, X,
    ChevronRight, Eye, AlertCircle, Loader2, Sparkles, CheckCircle,
    Edit3, FileSignature, Clock, Shield
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../services/api';
import DragDropZone from './DragDropZone';
import jsPDF from 'jspdf';

const cn = (...inputs) => twMerge(clsx(inputs));

// ─── PDF Generator ─────────────────────────────────────────────────────────────
const generateConsentPDF = (consent, patientName) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxW = pageW - margin * 2;

    // Header
    doc.setFillColor(14, 165, 233); // cyan-500
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CONSENTIMIENTO INFORMADO', pageW / 2, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text(consent.template.title, pageW / 2, 30, { align: 'center' });

    // Patient info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Paciente:', margin, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(patientName, margin + 30, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', margin + 100, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(consent.signedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }), margin + 120, 55);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 62, pageW - margin, 62);

    // Content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(consent.template.content || '', maxW);
    let y = 72;
    lines.forEach(line => {
        if (y > 230) {
            doc.addPage();
            y = 20;
        }
        doc.text(line, margin, y);
        y += 6;
    });

    // Signature
    y = Math.max(y + 20, 200);
    if (y > 240) { doc.addPage(); y = 30; }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageW - margin, y);
    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('FIRMA DEL PACIENTE / REPRESENTANTE', margin, y);

    if (consent.signature) {
        try {
            doc.addImage(consent.signature, 'PNG', margin, y + 5, 80, 30);
        } catch (e) { /* skip */ }
    }

    doc.text(`Firmado digitalmente el ${new Date(consent.signedAt).toLocaleString('es-PE')}`, margin, y + 44);
    doc.save(`consentimiento_${consent.template.title.replace(/\s+/g, '_')}.pdf`);
};

// ─── Consent Card ──────────────────────────────────────────────────────────────
const ConsentCard = ({ consent, patientName, onDelete }) => {
    const [showPreview, setShowPreview] = useState(false);

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group"
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                        <FileSignature size={20} />
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                        <button
                            onClick={() => setShowPreview(true)}
                            className="p-2 text-slate-300 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 transition-all"
                            title="Ver contenido"
                        >
                            <Eye size={15} />
                        </button>
                        <button
                            onClick={() => generateConsentPDF(consent, patientName)}
                            className="p-2 text-slate-300 hover:text-cyan-500 rounded-lg hover:bg-cyan-50 transition-all"
                            title="Descargar PDF"
                        >
                            <Download size={15} />
                        </button>
                        <button
                            onClick={() => onDelete(consent.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all"
                            title="Eliminar"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>

                <h4 className="font-black text-[13px] text-slate-700 leading-tight mb-2">{consent.template.title}</h4>

                <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock size={11} />
                        {new Date(consent.signedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {consent.signature && (
                        <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle size={10} /> Firmado
                        </span>
                    )}
                    {consent.fileUrl && (
                        <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            <Upload size={10} /> Archivo subido
                        </span>
                    )}
                </div>

                {consent.signature && (
                    <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <img src={consent.signature} alt="Firma" className="h-8 mx-auto object-contain opacity-70" />
                    </div>
                )}
            </motion.div>

            {/* Preview modal */}
            <AnimatePresence>
                {showPreview && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-6 py-5 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Consentimiento</p>
                                    <h3 className="font-black text-base">{consent.template.title}</h3>
                                </div>
                                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-6 max-h-80 overflow-y-auto">
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{consent.template.content}</p>
                            </div>
                            {consent.signature && (
                                <div className="px-6 pb-4 border-t border-slate-100 pt-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Firma del paciente</p>
                                    <img src={consent.signature} alt="Firma" className="h-16 border border-slate-100 rounded-xl p-2 bg-slate-50" />
                                </div>
                            )}
                            <div className="px-6 pb-6 flex justify-end gap-2">
                                <button
                                    onClick={() => generateConsentPDF(consent, patientName)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-[11px] font-black hover:opacity-90 transition-all"
                                >
                                    <Download size={14} /> Descargar PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

// ─── Signing Modal ─────────────────────────────────────────────────────────────
const SigningModal = ({ template, patientId, onClose, onSigned }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('sign'); // 'sign' | 'upload'
    const [uploadFile, setUploadFile] = useState(null);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const ctx = canvasRef.current.getContext('2d');
        const [x, y] = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (e.cancelable) e.preventDefault();
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const [x, y] = getPos(e);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e293b';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        setHasSignature(true);
        if (e.cancelable) e.preventDefault();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        canvasRef.current?.getContext('2d').beginPath();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (tab === 'sign') {
                const signature = canvasRef.current.toDataURL('image/png');
                await api.post('consents/sign', { patientId, templateId: template.id, signature });
            } else if (tab === 'upload' && uploadFile) {
                const formData = new FormData();
                formData.append('file', uploadFile);
                await api.post(`consents/upload/${patientId}/${template.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSigned();
            onClose();
        } catch (e) {
            alert('Error al guardar el consentimiento.');
        } finally {
            setSaving(false);
        }
    };

    const canSave = tab === 'sign' ? hasSignature : !!uploadFile;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 text-white flex items-start justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Firmar Consentimiento</p>
                        <h3 className="font-black text-lg leading-tight max-w-md">{template.title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Content to read */}
                    <div className="bg-slate-50 rounded-2xl p-4 max-h-40 overflow-y-auto border border-slate-100">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Lea atentamente</p>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{template.content}</p>
                    </div>

                    {/* Tab selector */}
                    <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
                        <button
                            onClick={() => setTab('sign')}
                            className={cn('flex-1 py-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all',
                                tab === 'sign' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            <PenTool size={14} /> Firmar aquí
                        </button>
                        <button
                            onClick={() => setTab('upload')}
                            className={cn('flex-1 py-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all',
                                tab === 'upload' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            <Upload size={14} /> Subir firmado
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {tab === 'sign' && (
                            <motion.div key="sign" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden">
                                    <canvas
                                        ref={canvasRef}
                                        width={700}
                                        height={160}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        className="w-full cursor-crosshair touch-none block"
                                        style={{ height: '160px' }}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-slate-400 font-medium">Firme con el mouse o dedo en el área de arriba</p>
                                    {hasSignature && (
                                        <button onClick={clearCanvas} className="text-[11px] font-black text-rose-500 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition-all">
                                            <Trash2 size={12} /> Limpiar
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        {tab === 'upload' && (
                            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {uploadFile ? (
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                                        <FileText size={20} className="text-emerald-600" />
                                        <div>
                                            <p className="text-sm font-black text-slate-700">{uploadFile.name}</p>
                                            <p className="text-[11px] text-slate-400">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button onClick={() => setUploadFile(null)} className="ml-auto text-slate-400 hover:text-slate-600">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <DragDropZone
                                        onFilesSelected={setUploadFile}
                                        label="Suelta el consentimiento firmado"
                                        subLabel="JPG, PNG o PDF"
                                        className="bg-slate-50 border-slate-200"
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} className="px-5 py-3 border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-500 hover:border-slate-300 transition-all">
                        Cancelar
                    </button>
                    <button
                        disabled={!canSave || saving}
                        onClick={handleSave}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[12px] font-black transition-all shadow-lg active:scale-95',
                            canSave && !saving
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 hover:opacity-90'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                        )}
                    >
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                            : <><Check size={16} /> Confirmar y Guardar</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Main Module ───────────────────────────────────────────────────────────────
const ConsentModule = ({ patientId, patientName = 'Paciente' }) => {
    const [templates, setTemplates] = useState([]);
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [signingTemplate, setSigningTemplate] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [tRes, cRes] = await Promise.all([
                api.get('consents/templates'),
                api.get(`consents/patient/${patientId}`)
            ]);
            setTemplates(tRes.data || []);
            setConsents(cRes.data || []);
        } catch (e) {
            console.error('Error fetching consent data:', e);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            await api.post('consents/templates/seed');
            fetchData();
        } catch (e) { alert('Error al crear plantillas.'); }
        finally { setSeeding(false); }
    };

    const handleDeleteConsent = async (id) => {
        if (!window.confirm('¿Eliminar este consentimiento?')) return;
        try {
            await api.delete(`consents/${id}`);
            fetchData();
        } catch (e) { alert('Error al eliminar.'); }
    };

    // Which templates haven't been signed yet for this patient
    const signedTemplateIds = new Set(consents.map(c => c.templateId));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Loader2 size={32} className="animate-spin mb-3 text-indigo-400" />
                <p className="text-sm font-bold">Cargando consentimientos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <div className="h-9 w-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <Shield size={18} />
                        </div>
                        Consentimientos Informados
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium mt-1 ml-12">
                        {consents.length} firmado{consents.length !== 1 ? 's' : ''} · {templates.length} plantilla{templates.length !== 1 ? 's' : ''} disponibles
                    </p>
                </div>
            </div>

            {/* Templates to sign */}
            {templates.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                    <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-black text-slate-700 text-sm">No hay plantillas de consentimiento</p>
                        <p className="text-[12px] text-slate-500 mt-1">Crea las plantillas desde Configuración o carga las predeterminadas para odontología.</p>
                        <button
                            onClick={handleSeed}
                            disabled={seeding}
                            className="mt-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black rounded-xl hover:opacity-90 transition-all active:scale-95"
                        >
                            {seeding ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                            Cargar plantillas predeterminadas
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Plantillas disponibles para firmar</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {templates.map(t => {
                            const alreadySigned = signedTemplateIds.has(t.id);
                            return (
                                <div
                                    key={t.id}
                                    className={cn(
                                        'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all',
                                        alreadySigned
                                            ? 'border-emerald-200 bg-emerald-50/50'
                                            : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'
                                    )}
                                >
                                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                                        alreadySigned ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-500'
                                    )}>
                                        {alreadySigned ? <CheckCircle size={18} /> : <FileText size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-[12px] text-slate-700 leading-tight truncate">{t.title}</p>
                                        {alreadySigned && (
                                            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">✓ Ya firmado</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSigningTemplate(t)}
                                        className={cn(
                                            'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95',
                                            alreadySigned
                                                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                                        )}
                                    >
                                        <PenTool size={12} />
                                        {alreadySigned ? 'Refirmar' : 'Firmar'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Signed consents history */}
            {consents.length > 0 && (
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Historial de consentimientos firmados</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {consents.map(c => (
                                <ConsentCard
                                    key={c.id}
                                    consent={c}
                                    patientName={patientName}
                                    onDelete={handleDeleteConsent}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {consents.length === 0 && templates.length > 0 && (
                <div className="py-16 text-center opacity-40">
                    <FileSignature size={40} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No hay consentimientos firmados aún</p>
                    <p className="text-[11px] text-slate-400 mt-1">Usa los botones de arriba para registrar la firma del paciente</p>
                </div>
            )}

            {/* Signing Modal */}
            <AnimatePresence>
                {signingTemplate && (
                    <SigningModal
                        template={signingTemplate}
                        patientId={patientId}
                        onClose={() => setSigningTemplate(null)}
                        onSigned={fetchData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ConsentModule;
