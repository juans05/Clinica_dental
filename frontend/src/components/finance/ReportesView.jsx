import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Calendar as CalendarIcon,
    PieChart as PieIcon,
    ArrowUpRight,
    ArrowDownRight,
    Filter
} from 'lucide-react';
import api from '../../services/api';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const ReportesView = ({ branchId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, [branchId, dateRange]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('billing/reports/financial', {
                params: { branchId, startDate: dateRange.start, endDate: dateRange.end }
            });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="h-96 flex items-center justify-center bg-white rounded-3xl border border-slate-200 animate-pulse" />;
    }

    const COLORS = ['#10b981', '#f43f5e', '#0891b2', '#f59e0b'];

    return (
        <div className="space-y-6">
            {/* Range Selector */}
            <div className="flex bg-white p-4 rounded-3xl border border-slate-200 shadow-sm items-center gap-4">
                <CalendarIcon className="text-slate-400" size={20} />
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="bg-slate-50 border-none rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                    <span className="text-slate-400 font-bold">al</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="bg-slate-50 border-none rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Ingresos" value={data?.summary?.totalIncome || 0} icon={ArrowUpRight} color="emerald" />
                <StatCard label="Total Egresos" value={data?.summary?.totalExpenses || 0} icon={ArrowDownRight} color="rose" />
                <StatCard label="Balance Neto" value={data?.summary?.netBalance || 0} icon={TrendingUp} color="cyan" />
                <StatCard label="Nro Operaciones" value={((data?.invoices?.length || 0) + (data?.expenses?.length || 0))} icon={PieIcon} color="slate" isCurrency={false} />
            </div>

            {/* Main Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 font-black uppercase tracking-tight">Comparativa Ingresos vs Egresos</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Ingresos', value: data.summary.totalIncome },
                                { name: 'Egresos', value: data.summary.totalExpenses },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={100}>
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f43f5e" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 font-black uppercase tracking-tight">Distribución</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Ingresos', value: data.summary.totalIncome },
                                        { name: 'Egresos', value: data.summary.totalExpenses },
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f43f5e" />
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm font-bold text-slate-400">Rentabilidad</p>
                        <p className="text-2xl font-black text-slate-900">
                            {data?.summary?.totalIncome
                                ? ((data.summary.netBalance / data.summary.totalIncome) * 100).toFixed(1)
                                : '0.0'}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, isCurrency = true }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        cyan: 'bg-cyan-50 text-cyan-600',
        slate: 'bg-slate-50 text-slate-600'
    };

    const displayValue = typeof value === 'number' ? value : (parseFloat(value) || 0);

    return (
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", colors[color])}>
                    <Icon size={20} />
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
                {isCurrency ? 'S/ ' : ''}{displayValue.toLocaleString(undefined, { minimumFractionDigits: isCurrency ? 2 : 0 })}
            </p>
        </div>
    );
};

export { ReportesView };
