import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    AlertCircle,
    FileText,
    TrendingDown,
    X,
    Check
} from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const EgresosView = ({ branchId }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, [branchId]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await api.get('billing/expenses', { params: { branchId } });
            setExpenses(res.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVoid = async (id) => {
        if (!confirm('¿Estás seguro de que deseas anular este egreso? Esta acción no se puede deshacer.')) return;
        try {
            await api.post(`billing/expenses/${id}/void`, { reason: 'Anulación manual' });
            fetchExpenses();
        } catch (error) {
            alert('Error al anular egreso');
        }
    };

    const filteredExpenses = (Array.isArray(expenses) ? expenses : []).filter(exp =>
        exp.concept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.invoiceRef?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por concepto, tipo o factura..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all font-medium"
                    />
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nuevo Egreso
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Concepto</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Referencia</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Monto</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredExpenses.length > 0 ? (
                                filteredExpenses.map((exp) => (
                                    <tr key={exp.id} className={cn("hover:bg-slate-50/50 transition-colors", exp.status === 'VOIDED' && "opacity-50 italic")}>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-700">{new Date(exp.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(exp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                {exp.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{exp.concept}</p>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            {exp.invoiceRef || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-rose-600">- S/ {(exp?.amount || 0).toFixed(2)}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">{exp.paymentMethod}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {exp.status === 'VOIDED' ? (
                                                <span className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase italic">
                                                    <AlertCircle size={14} /> Anulado
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase">
                                                    <Check size={14} /> Activo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {exp.status !== 'VOIDED' && (
                                                <button
                                                    onClick={() => handleVoid(exp.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <TrendingDown size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="font-bold text-slate-400">No hay egresos registrados</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EgresoModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => { setShowModal(false); fetchExpenses(); }}
                branchId={branchId}
            />
        </div>
    );
};

const EgresoModal = ({ isOpen, onClose, onSuccess, branchId }) => {
    const [formData, setFormData] = useState({
        type: 'Materiales',
        concept: '',
        invoiceRef: '',
        paymentMethod: 'Efectivo',
        amount: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post('billing/expenses', { ...formData, branchId });
            onSuccess();
            setFormData({ type: 'Materiales', concept: '', invoiceRef: '', paymentMethod: 'Efectivo', amount: '', notes: '' });
        } catch (error) {
            alert('Error al registrar egreso');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8 pb-4 flex items-center justify-center relative">
                    <h2 className="text-xl font-bold text-cyan-600 uppercase tracking-widest text-center">Nuevo Egreso</h2>
                    <button onClick={onClose} className="absolute right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <label className="text-sm font-bold text-slate-500 col-span-1">Tipo:</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="col-span-3 bg-white border border-slate-200 px-4 py-2.5 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 outline-none hover:border-slate-300 transition-all appearance-none cursor-pointer text-slate-700"
                        >
                            {['Materiales', 'Servicios', 'Sueldos', 'Alquiler', 'Otros'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <label className="text-sm font-bold text-slate-500 col-span-1">Concepto:</label>
                        <input
                            required
                            type="text"
                            value={formData.concept}
                            onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                            className="col-span-3 bg-white border border-slate-200 px-4 py-2.5 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 outline-none hover:border-slate-300 transition-all text-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <label className="text-sm font-bold text-slate-500 col-span-1">N° Factura:</label>
                        <input
                            type="text"
                            value={formData.invoiceRef}
                            onChange={(e) => setFormData({ ...formData, invoiceRef: e.target.value })}
                            className="col-span-3 bg-white border border-slate-200 px-4 py-2.5 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 outline-none hover:border-slate-300 transition-all text-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <label className="text-sm font-bold text-slate-500 col-span-1">Medio de pago:</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="col-span-3 bg-white border border-slate-200 px-4 py-2.5 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 outline-none hover:border-slate-300 transition-all appearance-none cursor-pointer text-slate-700"
                        >
                            {['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <label className="text-sm font-bold text-slate-500 col-span-1">Monto:</label>
                        <div className="col-span-3 flex overflow-hidden rounded-3xl border border-slate-200 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                            <div className="bg-slate-100 flex items-center px-4 font-bold text-slate-500 text-sm border-r border-slate-200">S/</div>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="00.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="flex-1 px-4 py-2.5 text-sm font-medium outline-none text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-bold text-slate-500 col-span-1 pt-3">Comentario:</label>
                        <textarea
                            rows="4"
                            placeholder="Escribe un comentario..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="col-span-3 bg-white border border-slate-200 p-4 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 outline-none hover:border-slate-300 transition-all text-slate-700 resize-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-center">
                        <button
                            disabled={submitting}
                            className="bg-cyan-600 text-white px-12 py-3 rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-600/30 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export { EgresosView, EgresoModal };
