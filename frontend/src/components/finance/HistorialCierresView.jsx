import React, { useState, useEffect } from 'react';
import {
    History,
    Calendar as CalendarIcon,
    User,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Download
} from 'lucide-react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const HistorialCierresView = ({ branchId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [branchId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get('billing/cash-close/history', { params: { branchId } });
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Fecha Cierre</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Cajera</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Ingresos</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Egresos</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Saldo Neto</th>
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
                            ) : (Array.isArray(history) ? history : []).length > 0 ? (
                                (Array.isArray(history) ? history : []).map((close) => (
                                    <tr key={close.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <CalendarIcon size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{close.date ? new Date(close.date).toLocaleDateString() : '-'}</p>
                                                    <p className="text-[10px] text-slate-400 capitalize">{close.createdAt ? new Date(close.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400" />
                                                <span className="text-sm font-medium text-slate-600">{close.cashier?.name || 'Sistema'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-emerald-600">S/ {(close.totalIncome || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-rose-600">S/ {(close.totalExpenses || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Wallet size={16} className="text-cyan-500" />
                                                <span className="text-sm font-black text-slate-900 border-b-2 border-cyan-100">S/ {(close.netBalance || 0).toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all">
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <History size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="font-bold text-slate-400">No hay cierres registrados</p>
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

export { HistorialCierresView };
