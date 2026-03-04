import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Calendar,
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Stethoscope,
    Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => {
    return twMerge(clsx(inputs));
}

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { logout, user, hasPermission } = useAuth();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', perm: 'dash:view' },
        { icon: Users, label: 'Pacientes', path: '/patients', perm: 'patients:view' },
        { icon: Calendar, label: 'Agenda', path: '/agenda', perm: 'agenda:view' },
        { icon: FileText, label: 'Historias', path: '/history', perm: 'history:view' },
        { icon: Shield, label: 'Finanzas', path: '/finance', perm: 'finance:view' },
        { icon: Settings, label: 'Configuración', path: '/settings', perm: 'settings:view' },
    ].filter(item => hasPermission(item.perm));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarVariants = {
        expanded: { width: 260 },
        collapsed: { width: 80 }
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay for mobile */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                variants={sidebarVariants}
                className={cn(
                    "fixed top-0 left-0 h-full z-45 glass-sidebar flex flex-col transition-all duration-300 ease-in-out z-40",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 bg-teal rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal/30 group relative overflow-hidden">
                        {/* Custom Isotipo: Tooth + D shape */}
                        <svg viewBox="0 0 100 100" className="w-6 h-6 fill-none stroke-current stroke-[6]">
                            <path d="M50 85C40 85 20 75 20 50C20 25 35 15 50 15C65 15 80 25 80 50C80 75 60 85 50 85Z" className="stroke-mint/30" />
                            <path d="M45 25C35 25 25 35 25 50C25 65 35 75 45 75C55 75 70 65 70 50C70 35 55 25 45 25Z" className="fill-mint" />
                            <circle cx="50" cy="50" r="10" className="fill-teal" />
                        </svg>
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-black text-2xl tracking-tighter text-white flex items-baseline gap-0.5"
                        >
                            <span className="text-teal-400">D</span>
                            <span>ently</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-mint ml-1" />
                        </motion.div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 mt-8 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-teal text-white shadow-lg shadow-teal/20"
                                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                            )}
                        >
                            <item.icon size={22} className={cn("shrink-0", isCollapsed && "mx-auto")} />
                            {!isCollapsed && (
                                <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-slate-800 space-y-2">
                    {!isCollapsed && (
                        <div className="px-3 py-4 mb-2 bg-slate-800/40 rounded-xl border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                                    {user?.name?.[0] || 'A'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{user?.profile || user?.role || 'Administrador'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all group"
                    >
                        <LogOut size={22} className={cn("shrink-0", isCollapsed && "mx-auto")} />
                        {!isCollapsed && <span className="font-bold text-sm">Cerrar Sesión</span>}
                    </button>

                    {/* Collapse Toggle (Desktop only) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex w-full items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-slate-300 transition-all"
                    >
                        <motion.div
                            animate={{ rotate: isCollapsed ? 180 : 0 }}
                            className="shrink-0"
                        >
                            <ChevronRight size={22} />
                        </motion.div>
                        {!isCollapsed && <span className="font-bold text-sm">Contraer</span>}
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
