import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, Plus, Search, File, Image as ImageIcon, X } from 'lucide-react';
import api from '../services/api';
import DragDropZone from './DragDropZone';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const FilesModule = ({ patientId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [showUploadArea, setShowUploadArea] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [patientId]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await api.get(`patient-files/${patientId}`);
            setFiles(res.data);
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);

        try {
            await api.post(`patient-files/${patientId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchFiles();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error al subir el archivo');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este archivo?')) return;
        try {
            await api.delete(`patient-files/${id}`);
            fetchFiles();
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Error al eliminar el archivo');
        }
    };

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && files.length === 0) return <div className="p-8 text-center text-slate-400">Cargando archivos...</div>;

    return (
        <div className="flex flex-col h-full space-y-6 bg-slate-50/10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <FileText className="text-indigo-600" size={20} />
                        </div>
                        Archivos y Documentos
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 ml-11">Gestión de expedientes digitales</p>
                </div>

                <button
                    onClick={() => setShowUploadArea(!showUploadArea)}
                    className={cn(
                        "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2",
                        showUploadArea
                            ? "bg-rose-50 text-rose-600 shadow-rose-100 hover:bg-rose-100"
                            : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 active:scale-95"
                    )}
                >
                    {showUploadArea ? <X size={16} /> : <Plus size={16} />}
                    {showUploadArea ? 'Cerrar Panel' : 'Subir Archivo'}
                </button>
            </div>

            <AnimatePresence>
                {(showUploadArea || (files.length === 0 && !loading)) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <DragDropZone
                            onFilesSelected={(file) => {
                                handleFileUpload(file);
                                setShowUploadArea(false);
                            }}
                            multiple={false}
                            label="Suelta el expediente aquí"
                            subLabel="Soporta imágenes (JPG, PNG) y documentos PDF"
                            className="bg-white"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative group">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar por nombre de archivo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[24px] text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-300 focus:shadow-lg focus:shadow-indigo-50/50 transition-all placeholder:text-slate-300"
                />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                    {filteredFiles.map(file => {
                        const isImage = file.type?.startsWith('image/');
                        return (
                            <div key={file.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group flex flex-col">
                                <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-slate-50 relative">
                                    {isImage ? (
                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <File size={32} className="text-slate-300" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase">{file.type?.split('/')[1] || 'DOC'}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => window.open(file.url, '_blank')}
                                            className="p-2 bg-white rounded-lg text-slate-700 hover:text-indigo-600 transition-all"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFile(file.id)}
                                            className="p-2 bg-white rounded-lg text-slate-700 hover:text-rose-600 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-xs font-bold text-slate-700 truncate mb-1" title={file.name}>{file.name}</h4>
                                <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50">
                                    <span className="text-[9px] font-bold text-slate-400">{new Date(file.createdAt).toLocaleDateString()}</span>
                                    {isImage && <ImageIcon size={10} className="text-indigo-300" />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredFiles.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <FileText size={48} className="text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No se encontraron archivos</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilesModule;
