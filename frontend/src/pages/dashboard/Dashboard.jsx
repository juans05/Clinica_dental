import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Users, Calendar, Wallet, ArrowUpRight, TrendingUp,
    Clock, Plus, AlertCircle, Loader2, MapPin, Stethoscope
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="glass-card p-6 rounded-[24px] border border-white/50 animate-pulse space-y-4">
        <div className="flex justify-between">
            <div className="h-12 w-12 rounded-2xl bg-slate-100" />
            <div className="h-6 w-14 rounded-full bg-slate-100" />
        </div>
        <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-8 w-20 rounded bg-slate-100" />
        </div>
    </div>
);

// ── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, trend, trendDown }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="glass-card p-6 rounded-[24px] relative overflow-hidden group border border-white/50"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-full
                    ${trendDown ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    <TrendingUp size={12} /> {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-800">{value}</h3>
        </div>
        <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge = (status) => {
    const map = {
        SCHEDULED:   { label: 'Programada', cls: 'bg-cyan-50 text-cyan-600' },
        CONFIRMED:   { label: 'Confirmada', cls: 'bg-emerald-50 text-emerald-600' },
        COMPLETED:   { label: 'Completada', cls: 'bg-slate-100 text-slate-500' },
        CANCELLED:   { label: 'Cancelada',  cls: 'bg-rose-50 text-rose-500' },
        IN_PROGRESS: { label: 'En curso',   cls: 'bg-amber-50 text-amber-600' },
        NO_SHOW:     { label: 'No asistió', cls: 'bg-rose-50 text-rose-400' },
    };
    return map[status] || { label: status, cls: 'bg-slate-100 text-slate-500' };
};

const formatHour = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('dashboard/stats')
            .then(r => setStats(r.data))
            .catch(err => console.error('Dashboard stats error:', err))
            .finally(() => setLoading(false));
    }, []);

    const statCards = stats ? [
        {
            title: 'Pacientes Totales',
            value: stats.totalPatients.toLocaleString('es-PE'),
            icon: Users, color: 'cyan',
            trend: stats.patientTrend
        },
        {
            title: 'Citas Hoy',
            value: stats.todayAppointments,
            icon: Calendar, color: 'blue',
            trend: stats.appTrend
        },
        {
            title: 'Ingresos del Mes',
            value: `S/ ${stats.monthlyRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
            icon: Wallet, color: 'emerald',
            trend: stats.revenueTrend
        },
        {
            title: 'Pendientes Pago',
            value: stats.pendingPaymentPlans,
            icon: AlertCircle, color: 'rose',
            trendDown: stats.pendingPaymentPlans > 0
        },
    ] : [];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                        ¡Hola, {user?.name?.split(' ')[0] || 'Doctor'}! 👋
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">
                        Panel de Control Clínico •{' '}
                        <span className="text-cyan-600 font-bold">
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link to="/agenda" className="flex-1 md:flex-none premium-button-primary bg-slate-900 hover:bg-slate-800 shadow-slate-900/10">
                        <Plus size={18} /> Nueva Cita
                    </Link>
                    <Link to="/patients" className="flex-1 md:flex-none premium-button-primary">
                        <Plus size={18} /> Nuevo Paciente
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : statCards.map((s, i) => <StatCard key={i} {...s} />)
                }
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Agenda próxima */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Agenda Próxima</h2>
                        <Link to="/agenda" className="text-sm font-bold text-cyan-600 hover:underline">Ver todo</Link>
                    </div>

                    <div className="glass-card rounded-[28px] overflow-hidden border border-white/40">
                        {loading ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
                            </div>
                        ) : !stats?.upcomingAppointments?.length ? (
                            <div className="p-12 text-center text-slate-400">
                                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-bold text-sm">No hay citas próximas programadas</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {stats.upcomingAppointments.map((apt) => {
                                    const badge = statusBadge(apt.status);
                                    return (
                                        <div
                                            key={apt.id}
                                            onClick={() => apt.patientId && navigate(`/expediente/${apt.patientId}`)}
                                            className="p-5 hover:bg-slate-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-all shrink-0">
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{apt.patientName || 'Paciente'}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5 flex-wrap">
                                                        <span>{formatHour(apt.date)}</span>
                                                        {apt.doctorName && <>
                                                            <span>·</span>
                                                            <Stethoscope size={11} />
                                                            <span>{apt.doctorName}</span>
                                                        </>}
                                                        {apt.branchName && <>
                                                            <span>·</span>
                                                            <MapPin size={11} />
                                                            <span>{apt.branchName}</span>
                                                        </>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.cls}`}>
                                                    {badge.label}
                                                </span>
                                                <ArrowUpRight size={15} className="opacity-0 group-hover:opacity-60 transition-opacity text-slate-500" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel derecho */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest px-1">Accesos Rápidos</h2>
                    <div className="space-y-4">
                        {/* Banner citas hoy */}
                        <Link
                            to="/agenda"
                            className="block glass-card p-6 rounded-[28px] bg-gradient-to-br from-cyan-600 to-cyan-700 text-white border-none overflow-hidden relative group hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                        >
                            <div className="relative z-10">
                                <h3 className="font-black text-lg mb-1">Agenda del Día</h3>
                                <p className="text-cyan-100 text-sm font-medium mb-4">
                                    {loading ? '...' : `${stats?.todayAppointments ?? 0} cita${stats?.todayAppointments !== 1 ? 's' : ''} programada${stats?.todayAppointments !== 1 ? 's' : ''} hoy`}
                                </p>
                                <span className="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold inline-block">
                                    Ver agenda completa
                                </span>
                            </div>
                            <Calendar size={80} className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform" />
                        </Link>

                        {/* Métricas */}
                        <div className="glass-card p-6 rounded-[28px] border border-slate-200/50 space-y-4">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs tracking-[0.1em]">
                                <TrendingUp size={16} className="text-emerald-500" /> Actividad del Mes
                            </h3>

                            {loading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-3 bg-slate-100 rounded" />
                                    <div className="h-2 bg-slate-100 rounded-full" />
                                    <div className="h-3 bg-slate-100 rounded mt-2" />
                                    <div className="h-2 bg-slate-100 rounded-full" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-500">Citas este mes</span>
                                            <span className="text-slate-800">{stats?.monthAppointments ?? 0}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-500 rounded-full shadow-sm shadow-cyan-200 transition-all"
                                                style={{ width: `${Math.min(100, ((stats?.monthAppointments ?? 0) / 100) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-500">Planes pendientes de pago</span>
                                            <span className={stats?.pendingPaymentPlans > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                                {stats?.pendingPaymentPlans ?? 0}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${stats?.pendingPaymentPlans > 0 ? 'bg-rose-400' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(100, (stats?.pendingPaymentPlans ?? 0) * 5)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Link
                                        to="/patients"
                                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group mt-1"
                                    >
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <Users size={14} className="text-cyan-500" />
                                            Ver todos los pacientes
                                        </div>
                                        <ArrowUpRight size={14} className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
