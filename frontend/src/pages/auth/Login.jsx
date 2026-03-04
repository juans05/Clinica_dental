import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope,
    Lock,
    Mail,
    Loader2,
    ShieldCheck,
    ArrowRight,
    Sparkles
} from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mint/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-5xl w-full glass-card rounded-[32px] overflow-hidden flex flex-col md:flex-row m-4 h-full md:h-[650px] relative z-10 border border-white/40"
            >
                {/* Left Side: Brand & Visuals */}
                <div className="w-full md:w-[45%] bg-slate-900 p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/20 to-transparent"></div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-3 mb-12"
                        >
                            <div className="h-12 w-12 bg-teal rounded-2xl flex items-center justify-center shadow-lg shadow-teal/40">
                                <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none stroke-white stroke-[6]">
                                    <path d="M50 85C40 85 20 75 20 50C20 25 35 15 50 15C65 15 80 25 80 50C80 75 60 85 50 85Z" className="stroke-mint/30" />
                                    <path d="M45 25C35 25 25 35 25 50C25 65 35 75 45 75C55 75 70 65 70 50C70 35 55 25 45 25Z" className="fill-mint" />
                                    <circle cx="50" cy="50" r="10" className="fill-teal" />
                                </svg>
                            </div>
                            <div className="font-black text-3xl tracking-tighter flex items-baseline gap-0.5">
                                <span className="text-teal-400">D</span>
                                <span>ently</span>
                                <span className="h-2 w-2 rounded-full bg-mint ml-1" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tight">
                                Gestión de <br /> <span className="text-mint">Próxima Generación.</span>
                            </h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-[280px]">
                                El estándar de oro para consultorios dentales modernos.
                            </p>
                        </motion.div>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-widest">
                            <ShieldCheck className="text-emerald-500" size={18} />
                            Seguridad de Grado Médico
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                            © 2026 SGD Dental Suite. Todos los derechos reservados.
                        </p>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Right Side: Form Section */}
                <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center bg-white/40 backdrop-blur-sm">
                    <div className="mb-10">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal-700 text-[10px] font-black uppercase tracking-widest mb-4 border border-teal-100/50"
                        >
                            <Sparkles size={12} /> Acceso Restringido
                        </motion.span>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Iniciar Sesión</h2>
                        <p className="text-slate-500 font-medium italic">Gestione su clínica con total control.</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-3"
                            >
                                <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0">!</div>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal/10 focus:border-teal text-[15px] font-medium text-slate-700 transition-all placeholder:text-slate-400 shadow-sm"
                                    placeholder="admin@dental.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider">Contraseña</label>
                                <button type="button" className="text-[11px] font-bold text-teal hover:text-teal/80 transition-colors">Olvidé mi contraseña</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal/10 focus:border-teal text-[15px] font-medium text-slate-700 transition-all placeholder:text-slate-400 shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full group relative overflow-hidden py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Entrar al Sistema
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-teal to-teal/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </form>

                    {/* Registro */}
                    <p className="mt-6 text-center text-sm text-slate-500 font-medium">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-teal font-black hover:text-teal/80 transition-colors">
                            Registra tu clínica gratis
                        </Link>
                    </p>

                    {/* Demo Credentials */}
                    <div className="mt-4 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Entorno de Desarrollo</div>
                        <button
                            onClick={() => { setEmail('admin@dental.com'); setPassword('admin123'); }}
                            className="text-[10px] font-black text-cyan-600 hover:text-cyan-700 flex items-center gap-1 group"
                        >
                            Cargar Admin <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Float Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl max-h-[800px] pointer-events-none opacity-20">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 right-0 w-96 h-96 blur-3xl">
                    <path fill="#00484d" d="M47.5,-52.2C60.7,-41.8,69.9,-25.9,71.2,-9.2C72.5,7.5,65.8,25.1,54.7,38.9C43.5,52.8,27.8,62.9,11.2,65.8C-5.5,68.7,-23.1,64.4,-38.3,55.1C-53.5,45.8,-66.3,31.4,-70.5,14.6C-74.8,-2.2,-70.5,-21.5,-59.7,-34.5C-48.9,-47.5,-31.6,-54.2,-15.1,-58.3C1.4,-62.4,18.8,-63.9,34.4,-59.8" transform="translate(100 100)" />
                </svg>
            </div>
        </div>
    );
};

export default Login;
