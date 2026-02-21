import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const Agenda = () => {
    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-8 rounded-[32px] border border-white/40">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agenda Médica</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 italic">Gestión de Citas y Horarios</p>
                </div>
                <button className="premium-button-primary">
                    <Plus size={20} /> Nueva Cita
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-[28px] border border-white/50">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Elegir Fecha</h3>
                        <div className="aspect-square bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-4">
                            <CalendarIcon size={40} className="text-cyan-200 mb-2" />
                            <p className="text-[10px] text-slate-400 font-black uppercase text-center">Software Dental Suite<br />Calendar Placeholder</p>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-[28px] border border-white/50">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Doctor de Turno</h3>
                        <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl border border-cyan-100/50">
                            <div className="h-10 w-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-black">D</div>
                            <div>
                                <p className="text-xs font-black text-cyan-900 leading-tight">Dr. Javier Ruiz</p>
                                <p className="text-[10px] font-bold text-cyan-700 opacity-70 italic">Especialista Maxilofacial</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card rounded-[32px] overflow-hidden border border-white/40">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-all"><ChevronLeft size={20} /></button>
                                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Hoy, 20 de Febrero 2026</h2>
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-all"><ChevronRight size={20} /></button>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 shadow-sm">Día</button>
                                <button className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black shadow-lg">Semana</button>
                                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 shadow-sm">Mes</button>
                            </div>
                        </div>

                        <div className="p-4 bg-white divide-y divide-slate-50">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex h-32 group hover:bg-slate-50/30 transition-all">
                                    <div className="w-24 p-4 border-r border-slate-50 flex flex-col items-center justify-start">
                                        <span className="text-xs font-black text-slate-400">{i + 8}:00 AM</span>
                                    </div>
                                    <div className="flex-1 p-2 relative">
                                        {i % 2 === 0 && (
                                            <motion.div
                                                whileHover={{ scale: 1.01 }}
                                                className="absolute inset-2 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-2xl p-4 text-white shadow-xl shadow-cyan-500/10 flex flex-col justify-between group cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-cyan-200 tracking-widest">Cita Confirmada</p>
                                                        <h4 className="font-black text-sm tracking-tight">Paciente: Maria Lopez</h4>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Clock size={12} className="opacity-50" />
                                                        <span className="text-[10px] font-bold">45 min</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end italic text-[10px] font-medium opacity-80">Tratamiento: Ortodoncia</div>
                                            </motion.div>
                                        )}
                                        {i === 3 && (
                                            <div className="absolute inset-2 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700 flex items-center justify-between border-dashed">
                                                <span className="text-xs font-black uppercase tracking-widest italic animate-pulse">Emergencia Disponible</span>
                                                <Plus size={16} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Agenda;
