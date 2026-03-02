import React, { useState, useEffect } from 'react';
import {
    Search,
    TrendingUp,
    AlertCircle,
    Check,
    FileText,
    Download,
    Eye
} from 'lucide-react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const IngresosView = ({ branchId }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, [branchId]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await api.get('billing/invoices', { params: { branchId } });
            setInvoices(res.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter(inv =>
        inv.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.nroDocumento?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por N° documento, cliente o RUC/DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Documento</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Cliente</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Monto</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Estado SUNAT</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredInvoices.length > 0 ? (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-700">{new Date(inv.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                {inv.type}
                                            </span>
                                            <p className="text-xs font-mono font-bold text-slate-600 mt-1">{inv.number || 'SIN NÚMERO'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{inv.razonSocial || 'Público General'}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{inv.nroDocumento || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-emerald-600">+ S/ {(inv?.montoConIgv || 0).toFixed(2)}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">{inv.formaPago}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {inv.apisunatStatus === 'SENT' ? (
                                                <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase">
                                                    <Check size={14} /> Enviado
                                                </span>
                                            ) : inv.apisunatStatus === 'ERROR' ? (
                                                <span className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase">
                                                    <AlertCircle size={14} /> Error
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase">
                                                    <AlertCircle size={14} /> Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all" title="Ver Detalles">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Descargar XML/PDF">
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <TrendingUp size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="font-bold text-slate-400">No hay ingresos registrados</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export { IngresosView };
