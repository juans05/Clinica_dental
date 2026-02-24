import React, { useState, useEffect, useRef } from 'react';
import { FileText, PenTool, Check, Trash2, Download, Upload, Plus, X } from 'lucide-react';
import api from '../services/api';
import DragDropZone from './DragDropZone';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const ConsentModule = ({ patientId }) => {
    const [templates, setTemplates] = useState([]);
    const [consents, setConsents] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [signing, setSigning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadingTemplateId, setUploadingTemplateId] = useState(null);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [patientId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tRes, cRes] = await Promise.all([
                api.get('consents/templates'),
                api.get(`consents/patient/${patientId}`)
            ]);
            setTemplates(tRes.data);
            setConsents(cRes.data);
        } catch (error) {
            console.error('Error fetching consent data:', error);
        } finally {
            setLoading(false);
        }
    };

    const startSigning = (template) => {
        setSelectedTemplate(template);
        setSigning(true);
    };

    // Canvas Logic for Signature
    const startDrawing = (e) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        // Handle touch vs mouse
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        if (e.cancelable) e.preventDefault();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleSaveConsent = async () => {
        const canvas = canvasRef.current;
        const signature = canvas.toDataURL('image/png');

        try {
            await api.post('consents/sign', {
                patientId,
                templateId: selectedTemplate.id,
                signature
            });
            setSigning(false);
            setSelectedTemplate(null);
            fetchData();
            alert('Consentimiento firmado con éxito');
        } catch (error) {
            console.error('Error saving consent:', error);
            alert('Error al guardar el consentimiento');
        }
    };

    const handleFileUpload = async (templateId, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`consents/upload/${patientId}/${templateId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchData();
            alert('Documento subido con éxito');
        } catch (error) {
            console.error('Error uploading consent:', error);
            alert('Error al subir el documento');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Cargando...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <FileText className="text-blue-500" /> Consentimientos Informados
                </h2>
                {!signing && (
                    <div className="flex gap-2">
                        {templates.map(t => (
                            <div key={t.id} className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startSigning(t)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                                    >
                                        <PenTool size={14} /> Firmar: {t.title}
                                    </button>
                                    <button
                                        onClick={() => setUploadingTemplateId(uploadingTemplateId === t.id ? null : t.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                                            uploadingTemplateId === t.id
                                                ? "bg-rose-50 text-rose-600 border-rose-100"
                                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                        )}
                                    >
                                        {uploadingTemplateId === t.id ? <X size={14} /> : <Upload size={14} />}
                                        {uploadingTemplateId === t.id ? 'Cancelar' : 'Subir'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {uploadingTemplateId === t.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <DragDropZone
                                                onFilesSelected={(file) => {
                                                    handleFileUpload(t.id, file);
                                                    setUploadingTemplateId(null);
                                                }}
                                                label="Suelta el consentimiento firmado"
                                                subLabel="JPG, PNG o PDF"
                                                className="bg-white p-6 mt-2"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {signing && selectedTemplate && (
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{selectedTemplate.title}</h3>
                            <p className="text-xs text-slate-400 font-medium">Por favor lea atentamente y firme al final</p>
                        </div>
                        <button onClick={() => setSigning(false)} className="text-slate-400 hover:text-slate-600">
                            Cancelar
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 max-h-60 overflow-y-auto text-sm text-slate-600 leading-relaxed custom-scrollbar">
                        {selectedTemplate.content}
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <PenTool size={14} /> Firma del Paciente
                        </label>
                        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-2">
                            <canvas
                                ref={canvasRef}
                                width={600}
                                height={200}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseOut={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-[200px] cursor-crosshair touch-none"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <button onClick={clearCanvas} className="text-xs text-red-500 font-bold flex items-center gap-2 px-3 py-1 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={14} /> Limpiar firma
                            </button>
                            <button
                                onClick={handleSaveConsent}
                                className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[12px] font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <Check size={18} /> CONFIRMAR Y FIRMAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consents.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-green-50 rounded-xl">
                                <FileText className="text-green-600" size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                {new Date(c.signedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-700 mb-2">{c.template.title}</h4>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-end">
                            {c.fileUrl ? (
                                <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                                    <FileText size={14} /> Ver documento subido
                                </a>
                            ) : (
                                <img src={c.signature} alt="Firma" className="h-10 opacity-60 group-hover:opacity-100 transition-all" />
                            )}
                            <button
                                onClick={() => window.open(c.fileUrl || c.signature, '_blank')}
                                className="p-2 text-slate-300 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-all"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {consents.length === 0 && !signing && (
                <div className="py-20 text-center opacity-30">
                    <PenTool size={48} className="mx-auto text-slate-400 mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay consentimientos firmados</p>
                </div>
            )}
        </div>
    );
};

export default ConsentModule;
