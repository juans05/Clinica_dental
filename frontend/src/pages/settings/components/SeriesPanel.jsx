import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, FileText, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const SeriesPanel = ({ branches }) => {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ branchId: '', type: 'BOLETA', serie: '' });
    const [saving, setSaving] = useState(false);

    const loadSeries = async () => {
        setLoading(true);
        try {
            const res = await api.get('billing/invoice-series');
            setSeries(res.data);
        } catch (e) {
            console.error('Error loading invoice series:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSeries(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.branchId || !form.serie.trim()) return;
        setSaving(true);
        try {
            await api.post('billing/invoice-series', form);
            setShowForm(false);
            setForm({ branchId: '', type: 'BOLETA', serie: '' });
            loadSeries();
        } catch (err) {
            alert('Error al guardar serie: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta serie? Los comprobantes ya emitidos no se verán afectados.')) return;
        try {
            await api.delete(`billing/invoice-series/${id}`);
            loadSeries();
        } catch (err) {
            alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
        }
    };

    const getPreview = (serieCode) => `${serieCode}-${String(1).padStart(8, '0')}`;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400 font-medium">
                        Configura el prefijo de serie para cada sede. El correlativo se asigna automáticamente.
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1">
                        Ejemplo: Sede San Miguel Boleta → <span className="font-mono font-bold text-cyan-500">SM1</span> → SM1-00000001, SM1-00000002…
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-800/20 active:scale-95 transition-all whitespace-nowrap"
                >
                    <Plus size={16} /> Nueva Serie
                </button>
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 border border-slate-200 rounded-3xl p-6"
                >
                    <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede</label>
                            <select
                                required
                                value={form.branchId}
                                onChange={e => setForm({ ...form, branchId: e.target.value })}
                                className="premium-input bg-white border-slate-200"
                            >
                                <option value="">Seleccionar sede...</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                                className="premium-input bg-white border-slate-200"
                            >
                                <option value="BOLETA">Boleta</option>
                                <option value="FACTURA">Factura</option>
                                <option value="NC_BOLETA">Nota de Crédito Boleta</option>
                                <option value="NC_FACTURA">Nota de Crédito Factura</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Código de Serie <span className="text-slate-300 normal-case">(ej: SM1, B001)</span>
                            </label>
                            <input
                                required
                                type="text"
                                value={form.serie}
                                onChange={e => setForm({ ...form, serie: e.target.value.toUpperCase() })}
                                className="premium-input bg-white border-slate-200 font-mono"
                                placeholder="Ej: SM1"
                                maxLength={10}
                            />
                        </div>
                        {form.serie && (
                            <div className="sm:col-span-3 flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-100 rounded-2xl">
                                <FileText size={14} className="text-cyan-500" />
                                <span className="text-xs text-cyan-700 font-medium">
                                    El primer comprobante será: <span className="font-mono font-black">{getPreview(form.serie)}</span>
                                </span>
                            </div>
                        )}
                        <div className="sm:col-span-3 flex gap-3 justify-end pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-60">
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                {saving ? 'Guardando...' : 'Guardar Serie'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {loading ? (
                <div className="h-32 flex items-center justify-center">
                    <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
                </div>
            ) : series.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                    <div className="text-center">
                        <FileText size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-bold">Sin series configuradas</p>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Sede</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Serie</th>
                                <th className="px-6 py-4">Formato</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {series.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                                                <Building2 size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{s.branch?.name || `Sede #${s.branchId}`}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border',
                                            s.type === 'FACTURA' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                s.type === 'BOLETA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    s.type === 'NC_FACTURA' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-rose-50 text-rose-600 border-rose-100'
                                        )}>
                                            {s.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-black text-slate-800 text-sm">{s.serie}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-500">{s.serie}-00000001…</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    <strong>Importante:</strong> La sede debe tener series configuradas para poder emitir comprobantes.
                    Las series de Nota de Crédito (NC) deben empezar con <span className="font-mono font-black">B</span> para boletas y <span className="font-mono font-black">F</span> para facturas.
                </p>
            </div>
        </div>
    );
};

export default SeriesPanel;
