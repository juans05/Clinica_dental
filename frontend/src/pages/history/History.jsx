import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Plus, Filter, FileDigit, ShieldAlert } from 'lucide-react';

const History = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Historias Clínicas</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 italic">Archivo Digital de Pacientes</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="premium-button-primary bg-slate-900 border-none">
                        <FileText size={18} /> Nueva Historia
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-[32px] overflow-hidden border border-white/40">
                <div className="p-8 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por Expediente, Nombre de Paciente o DNI..."
                            className="premium-input pl-14"
                        />
                    </div>
                    <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600"><Filter size={20} /></button>
                </div>

                <div className="p-12 text-center flex flex-col items-center">
                    <div className="h-32 w-32 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-6">
                        <FileDigit size={64} strokeWidth={1} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Visualizador de Expedientes</h3>
                    <p className="text-slate-400 max-w-sm font-medium italic mb-8">
                        Sección bajo integración. Próximamente podrá visualizar el historial completo de diagnósticos, odontogramas y presupuestos.
                    </p>
                    <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100/50 grayscale opacity-80">
                        <ShieldAlert size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Contenido Restringido • Auditoría Requerida</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="glass-card p-6 rounded-[24px] border border-white/40 opacity-50 grayscale"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                <FileText size={20} />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase border border-slate-200 px-1.5 py-0.5 rounded">H-0023{i}</span>
                        </div>
                        <h4 className="font-black text-slate-800">Paciente Ejemplo {i}</h4>
                        <p className="text-xs text-slate-400 font-medium mb-4">Última actualización: hace {i} día(s)</p>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-300 w-[40%]"></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default History;
