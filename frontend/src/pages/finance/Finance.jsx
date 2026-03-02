import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Download,
    Plus,
    History,
    Filter,
    FileSpreadsheet,
    FileText,
    Search,
    AlertCircle,
    CheckCircle2,
    Building2,
    Calendar as CalendarIcon
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { EgresosView } from '../../components/finance/EgresosView';
import { IngresosView } from '../../components/finance/IngresosView';
import { ReportesView } from '../../components/finance/ReportesView';
import { HistorialCierresView } from '../../components/finance/HistorialCierresView';

const cn = (...inputs) => twMerge(clsx(inputs));

const Finance = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('caja'); // caja, egresos, ingresos, reportes, historial
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [data, setData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const tabs = [
        { id: 'caja', label: 'Caja del Día', icon: Wallet },
        { id: 'egresos', label: 'Egresos', icon: TrendingDown },
        { id: 'ingresos', label: 'Ingresos', icon: TrendingUp },
        { id: 'reportes', label: 'Reportes', icon: FileText },
        { id: 'historial', label: 'Historial Cierres', icon: History },
    ];

    const [showCashClose, setShowCashClose] = useState(false);

    useEffect(() => {
        fetchDailyStatus();
    }, [selectedBranch]);

    const fetchDailyStatus = async () => {
        try {
            setLoading(true);
            const res = await api.get(`billing/cash-close/status?branchId=${selectedBranch}`);
            setSummary(res.data);
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            const res = await api.get('billing/reports/export/pdf', {
                params: { branchId: selectedBranch, startDate: dateRange.start, endDate: dateRange.end }
            });
            const link = document.createElement('a');
            link.href = res.data.pdf;
            link.download = `reporte_financiero_${dateRange.start}_${dateRange.end}.pdf`;
            link.click();
        } catch (error) {
            alert('Error al exportar PDF');
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await api.get('billing/reports/export/excel', {
                params: { branchId: selectedBranch, startDate: dateRange.start, endDate: dateRange.end },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_financiero_${dateRange.start}_${dateRange.end}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert('Error al exportar Excel');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finanzas</h1>
                    <p className="text-slate-500 font-medium">Gestión de ingresos, egresos y cierres de caja</p>
                </div>

                <div className="flex items-center gap-3">
                    {user?.role === 'ADMIN' && (
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                            <Building2 size={18} className="text-slate-400" />
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0"
                            >
                                <option value="">Todas las Sedes</option>
                                {/* Mapear sedes si están cargadas */}
                            </select>
                        </div>
                    )}

                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button
                            onClick={handleExportPDF}
                            className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors flex items-center gap-2 px-3"
                        >
                            <FileText size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">PDF</span>
                        </button>
                        <div className="w-[1px] bg-slate-200 my-1 mx-1" />
                        <button
                            onClick={handleExportExcel}
                            className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors flex items-center gap-2 px-3"
                        >
                            <FileSpreadsheet size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Excel</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <nav className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                            activeTab === tab.id
                                ? "bg-white text-cyan-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        )}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'caja' && <CajaStatus summary={summary} loading={loading} onRefresh={fetchDailyStatus} setShowCashClose={setShowCashClose} />}
                    {activeTab === 'egresos' && <EgresosView branchId={selectedBranch} />}
                    {activeTab === 'ingresos' && <IngresosView branchId={selectedBranch} />}
                    {activeTab === 'reportes' && <ReportesView branchId={selectedBranch} />}
                    {activeTab === 'historial' && <HistorialCierresView branchId={selectedBranch} />}
                </motion.div>
            </AnimatePresence>

            <CashCloseModal
                isOpen={showCashClose}
                onClose={() => setShowCashClose(false)}
                summary={summary}
                branchId={selectedBranch}
                onSuccess={() => { setShowCashClose(false); fetchDailyStatus(); setActiveTab('historial'); }}
            />
        </div>
    );
};

// Subcomponente: Resumen de Caja del Día
const CajaStatus = ({ summary, loading, onRefresh, setShowCashClose }) => {
    if (loading) return <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm animate-pulse" />;

    const stats = [
        { label: 'Ingresos Totales', value: summary?.totalIncome || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Egresos Totales', value: summary?.totalExpenses || 0, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Balance Neto', value: summary?.netBalance || 0, icon: Wallet, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", stat.bg)}>
                            <stat.icon className={stat.color} size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900">S/ {stat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Actividad de hoy</h3>
                        <p className="text-slate-500 text-sm">Resumen pormenorizado por método de recibo</p>
                    </div>
                    <button
                        onClick={() => setShowCashClose(true)}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2"
                    >
                        Cerrar Caja
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Aquí irían gráficos circulares o barras por método */}
                    <div className="col-span-2 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Efectivo', value: summary?.cashAmount || 0 },
                                { name: 'Tarjeta', value: summary?.cardAmount || 0 },
                                { name: 'Transferencia', value: summary?.transferAmount || 0 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#0891b2" radius={[8, 8, 0, 0]} barSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Movimientos</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-600">Documentos emitidos</span>
                                <span className="h-7 px-3 bg-cyan-100 text-cyan-700 rounded-full flex items-center text-xs font-black">{summary?.incomeCount || 0}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-bold text-slate-600">Egresos registrados</span>
                                <span className="h-7 px-3 bg-rose-100 text-rose-700 rounded-full flex items-center text-xs font-black">{summary?.expenseCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CashCloseModal = ({ isOpen, onClose, summary, branchId, onSuccess }) => {
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = async () => {
        try {
            setSubmitting(true);
            await api.post('billing/cash-close', {
                branchId,
                notes,
                totals: summary
            });
            onSuccess();
        } catch (error) {
            alert('Error al realizar el cierre');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden text-center">
                <div className="h-20 w-20 bg-cyan-50 text-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Wallet size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Cierre de Caja</h2>
                <p className="text-slate-500 mb-8 font-medium">Confirma los valores antes de finalizar el turno</p>

                <div className="space-y-3 mb-8">
                    <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-slate-500 text-sm">INGRESOS</span>
                        <span className="font-black text-emerald-600">S/ {(summary?.totalIncome || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-slate-500 text-sm">EGRESOS</span>
                        <span className="font-black text-rose-600">S/ {(summary?.totalExpenses || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-cyan-600 rounded-2xl shadow-lg shadow-cyan-600/20 text-white">
                        <span className="font-black text-sm uppercase tracking-wider">SALDO NETO</span>
                        <span className="font-black text-lg">S/ {(summary?.netBalance || 0).toFixed(2)}</span>
                    </div>
                </div>

                <textarea
                    placeholder="Notas u observaciones del cierre..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 outline-none mb-6 resize-none h-24"
                />

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button
                        onClick={handleConfirm}
                        disabled={submitting}
                        className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
                    >
                        {submitting ? 'Cerrando...' : 'Confirmar Cierre'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Vistas finales integradas

export default Finance;
