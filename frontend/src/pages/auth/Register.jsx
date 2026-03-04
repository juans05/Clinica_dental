import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import {
    Stethoscope, Lock, Mail, Loader2, ShieldCheck,
    ArrowRight, Building2, Hash, User, Eye, EyeOff
} from 'lucide-react';

const Field = ({ label, icon: Icon, error, type = 'text', rightEl, ...props }) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <input
                    {...props}
                    type={isPassword ? (show ? 'text' : 'password') : type}
                    className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-white/60 border rounded-2xl text-sm font-semibold text-slate-800 outline-none transition-all
                        focus:ring-4 focus:ring-teal/10 focus:border-teal focus:bg-white
                        ${error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                />
                {isPassword && (
                    <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                )}
            </div>
            {error && <p className="text-[11px] text-rose-600 font-semibold ml-1">{error}</p>}
        </div>
    );
};

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        companyName: '',
        taxId: '',
        adminName: '',
        email: '',
        password: '',
        confirm: ''
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const e = {};
        if (!form.companyName.trim()) e.companyName = 'Requerido';
        if (!form.taxId.trim()) e.taxId = 'Requerido';
        if (!/^\d{11}$/.test(form.taxId)) e.taxId = 'El RUC debe tener 11 dígitos';
        if (!form.adminName.trim()) e.adminName = 'Requerido';
        if (!form.email.trim()) e.email = 'Requerido';
        if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
        if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await api.post('auth/register-company', {
                companyName: form.companyName,
                taxId: form.taxId,
                adminName: form.adminName,
                email: form.email,
                password: form.password
            });

            // Guardar sesión directamente (ya viene token + user)
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Ir al wizard de onboarding
            navigate('/setup', { replace: true });
            window.location.reload(); // recargar para que AuthContext tome el nuevo token
        } catch (err) {
            setServerError(err.response?.data?.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans py-8">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mint/10 rounded-full blur-[120px] animate-pulse delay-1000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl w-full glass-card rounded-[32px] overflow-hidden flex flex-col md:flex-row m-4 relative z-10 border border-white/40"
            >
                {/* Panel izquierdo */}
                <div className="w-full md:w-[40%] bg-slate-900 p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/20 to-transparent" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
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
                        </div>

                        <h2 className="text-4xl font-black mb-4 leading-[1.1] tracking-tight">
                            Crea tu <br /><span className="text-mint">clínica digital.</span>
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-[260px]">
                            En 2 minutos tendrás tu sistema listo. Sin instalaciones, sin complicaciones.
                        </p>

                        <div className="mt-10 space-y-4">
                            {[
                                'Expedientes clínicos digitales',
                                'Facturación electrónica SUNAT',
                                'Agenda y citas online',
                                'Soporte personalizado incluido'
                            ].map(f => (
                                <div key={f} className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="h-5 w-5 rounded-full bg-teal text-mint flex items-center justify-center shrink-0 text-xs font-bold">✓</div>
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-widest">
                            <ShieldCheck className="text-emerald-500" size={18} />
                            Seguridad de Grado Médico
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-2">
                            © 2026 Dently Suite. Todos los derechos reservados.
                        </p>
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal/10 rounded-full blur-3xl" />
                </div>

                {/* Panel derecho */}
                <div className="w-full md:w-[60%] p-10 md:p-14 flex flex-col justify-center bg-white/40 backdrop-blur-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Crear cuenta gratuita</h2>
                        <p className="text-slate-500 text-sm font-medium">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="text-teal font-black hover:text-teal/80 transition-colors">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>

                    <AnimatePresence>
                        {serverError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-3"
                            >
                                <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0 font-black">!</div>
                                {serverError}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Datos de la empresa */}
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Datos de tu clínica</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Field label="Razón Social / Nombre de la clínica" icon={Building2}
                                    value={form.companyName} onChange={set('companyName')}
                                    placeholder="Ej: Clínica Dental San Marcos S.A.C."
                                    error={errors.companyName} required />
                            </div>
                            <Field label="RUC (11 dígitos)" icon={Hash}
                                value={form.taxId} onChange={set('taxId')}
                                placeholder="20XXXXXXXXX" maxLength={11}
                                error={errors.taxId} required />
                        </div>

                        {/* Datos del administrador */}
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-2">Tu cuenta de administrador</p>
                        <Field label="Tu nombre completo" icon={User}
                            value={form.adminName} onChange={set('adminName')}
                            placeholder="Ej: Dr. Juan Pérez López"
                            error={errors.adminName} required />
                        <Field label="Correo electrónico" icon={Mail} type="email"
                            value={form.email} onChange={set('email')}
                            placeholder="admin@tuclinica.com"
                            error={errors.email} required />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Contraseña" icon={Lock} type="password"
                                value={form.password} onChange={set('password')}
                                placeholder="Mínimo 8 caracteres"
                                error={errors.password} required />
                            <Field label="Confirmar contraseña" icon={Lock} type="password"
                                value={form.confirm} onChange={set('confirm')}
                                placeholder="Repite tu contraseña"
                                error={errors.confirm} required />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative overflow-hidden py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Crear mi clínica
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-teal to-teal/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
                            Al registrarte aceptas nuestros Términos de Servicio y Política de Privacidad.
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
