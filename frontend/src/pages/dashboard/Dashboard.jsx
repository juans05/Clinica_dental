import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    Wallet,
    ArrowUpRight,
    TrendingUp,
    Clock,
    Plus,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card p-6 rounded-[24px] relative overflow-hidden group border border-white/50"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp size={12} /> {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-800">{value}</h3>
        </div>
        <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
);

const Dashboard = () => {
    const { user } = useAuth();

    const stats = [
        { title: 'Pacientes Totales', value: '1,280', icon: Users, color: 'cyan', trend: '+12%' },
        { title: 'Citas Hoy', value: '18', icon: Calendar, color: 'blue', trend: '+4' },
        { title: 'Ingresos Mensuales', value: 'S/ 12,450', icon: Wallet, color: 'emerald', trend: '+15%' },
        { title: 'Pendientes Pago', value: '5', icon: AlertCircle, color: 'rose', trend: '-2' },
    ];

    const recentActivity = [
        { id: 1, type: 'Cita', patient: 'Ana Garcia', time: '9:30 AM', status: 'Confirmada' },
        { id: 2, type: 'Registro', patient: 'Carlos Ruiz', time: '10:15 AM', status: 'Nuevo' },
        { id: 3, type: 'Cita', patient: 'Maria Lopez', time: '11:00 AM', status: 'En espera' },
    ];

    return (
        <div className="space-y-10">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                        ¡Hola, {user?.firstName || 'Doctor'}! 👋
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">
                        Panel de Control Clínico • <span className="text-cyan-600 font-bold">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none premium-button-primary bg-slate-900 hover:bg-slate-800 shadow-slate-900/10">
                        <Plus size={18} /> Nueva Cita
                    </button>
                    <Link to="/patients" className="flex-1 md:flex-none premium-button-primary">
                        <Plus size={18} /> Nuevo Paciente
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Appointments */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Agenda Próxima</h2>
                        <button className="text-sm font-bold text-cyan-600 hover:underline">Ver todo</button>
                    </div>
                    <div className="glass-card rounded-[28px] overflow-hidden border border-white/40">
                        <div className="divide-y divide-slate-100">
                            {recentActivity.map((act) => (
                                <div key={act.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black relative overflow-hidden group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-all">
                                            <Clock size={20} className="relative z-10" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{act.patient}</p>
                                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                {act.type} • {act.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${act.status === 'Confirmada' ? 'bg-emerald-50 text-emerald-600' :
                                                act.status === 'Nuevo' ? 'bg-cyan-50 text-cyan-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {act.status}
                                        </span>
                                        <button className="opacity-0 group-hover:opacity-100 bg-white border border-slate-200 p-2 rounded-xl transition-all shadow-sm">
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts / Info */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest px-1">Atajos Rápidos</h2>
                    <div className="space-y-4">
                        <div className="glass-card p-6 rounded-[28px] bg-gradient-to-br from-cyan-600 to-cyan-700 text-white border-none overflow-hidden relative group">
                            <div className="relative z-10">
                                <h3 className="font-black text-lg mb-1">Odontograma</h3>
                                <p className="text-cyan-100 text-sm font-medium mb-4">Ver estado dental actual del paciente.</p>
                                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur-md">Abrir Editor</button>
                            </div>
                            <Users size={80} className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="glass-card p-6 rounded-[28px] border border-slate-200/50">
                            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-[0.1em]">
                                <TrendingUp size={16} className="text-emerald-500" /> Rendimiento
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-500">Ocupación Mensual</span>
                                        <span className="text-slate-800">85%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 w-[85%] rounded-full shadow-sm shadow-cyan-200"></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-500">Satisfacción</span>
                                        <span className="text-slate-800">98%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[98%] rounded-full shadow-sm shadow-emerald-200"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
