import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    Building2, MapPin, UserPlus, CheckCircle, ChevronRight,
    Phone, Mail, Globe, Stethoscope, Lock, HeartPulse,
    Sparkles, MessageCircle, ShieldCheck, Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// ── Datos de los pasos ─────────────────────────────────────────────────────────
const STEPS = [
    { id: 'empresa',  label: 'Tu Empresa',    icon: Building2,   color: 'indigo' },
    { id: 'sede',     label: 'Primera Sede',  icon: MapPin,      color: 'violet' },
    { id: 'medico',   label: 'Primer Médico', icon: Stethoscope, color: 'cyan'   },
    { id: 'listo',    label: '¡Listo!',       icon: Sparkles,    color: 'emerald'},
];

// ── Input genérico ─────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon size={15} />
                </div>
            )}
            <input
                {...props}
                className={cn(
                    'w-full border rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all',
                    Icon && 'pl-11',
                    error
                        ? 'border-rose-300 bg-rose-50 focus:ring-4 focus:ring-rose-500/10'
                        : 'border-slate-200 bg-slate-50/80 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300'
                )}
            />
        </div>
        {error && <p className="text-[11px] text-rose-600 font-semibold ml-1">{error}</p>}
    </div>
);

// ── Paso 1: Empresa ────────────────────────────────────────────────────────────
const StepEmpresa = ({ onNext }) => {
    const [form, setForm] = useState({ commercialName: '', phone: '', address: '', receptionEmail: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const { data } = await api.get('company');
                if (data) {
                    setForm({
                        commercialName: data.commercialName || data.name || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        receptionEmail: data.receptionEmail || ''
                    });
                }
            } catch (e) {
                console.error('Error loading company data:', e);
            } finally {
                setFetching(false);
            }
        };
        loadData();
    }, []);

    const handleNext = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.put('company', form);
            onNext();
        } catch (e) {
            setError(e?.response?.data?.message || 'Error al guardar la empresa');
        } finally {
            setLoading(false);
        }
    };

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-500">Cargando datos de tu clínica...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Cuéntanos sobre tu clínica</h2>
                <p className="text-sm text-slate-500">Estos datos aparecerán en tus documentos y comprobantes.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <Field label="Nombre Comercial" icon={Building2} value={form.commercialName}
                        onChange={set('commercialName')} placeholder="Ej: Clínica Dental Sonríe" />
                </div>
                <Field label="Teléfono / WhatsApp" icon={Phone} value={form.phone}
                    onChange={set('phone')} placeholder="+51 999 999 999" />
                <Field label="Email de Contacto" icon={Mail} type="email" value={form.receptionEmail}
                    onChange={set('receptionEmail')} placeholder="contacto@tuclinica.com" />
                <div className="sm:col-span-2">
                    <Field label="Dirección Principal" icon={MapPin} value={form.address}
                        onChange={set('address')} placeholder="Av. Principal 123, Lima" />
                </div>
            </div>
            {error && (
                <p className="text-sm text-rose-600 font-semibold bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200">{error}</p>
            )}
            <button onClick={handleNext} disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-60">
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ChevronRight size={16} /> Continuar</>}
            </button>
        </div>
    );
};

// ── Paso 2: Sede ───────────────────────────────────────────────────────────────
const StepSede = ({ onNext }) => {
    const [form, setForm] = useState({ name: '', address: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleNext = async () => {
        if (!form.name.trim()) { setError('El nombre de la sede es obligatorio'); return; }
        setLoading(true); setError(null);
        try {
            await api.post('branches', form);
            onNext();
        } catch (e) {
            setError(e?.response?.data?.message || 'Error al crear la sede');
        } finally {
            setLoading(false);
        }
    };

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Registra tu primera sede</h2>
                <p className="text-sm text-slate-500">Cada sede es un consultorio o sucursal donde atiendes pacientes.</p>
            </div>
            <div className="space-y-4">
                <Field label="Nombre de la Sede *" icon={MapPin} value={form.name}
                    onChange={set('name')} placeholder="Ej: Sede Central, Consultorio Norte" error={error} />
                <Field label="Dirección" icon={Globe} value={form.address}
                    onChange={set('address')} placeholder="Av. Principal 123, Lima" />
                <Field label="Teléfono de la Sede" icon={Phone} value={form.phone}
                    onChange={set('phone')} placeholder="+51 999 999 999" />
            </div>
            <button onClick={handleNext} disabled={loading}
                className="w-full py-4 bg-violet-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-violet-700 transition-all shadow-xl shadow-violet-100 disabled:opacity-60">
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ChevronRight size={16} /> Continuar</>}
            </button>
        </div>
    );
};

// ── Paso 3: Médico ─────────────────────────────────────────────────────────────
const StepMedico = ({ onNext }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DENTIST' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'El nombre es obligatorio';
        if (!form.email.includes('@')) e.email = 'Email inválido';
        if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = async () => {
        if (!validate()) return;
        setLoading(true); setApiError(null);
        try {
            await api.post('auth/register', form);
            onNext();
        } catch (e) {
            setApiError(e?.response?.data?.message || 'Error al crear el médico');
        } finally {
            setLoading(false);
        }
    };

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Agrega tu primer médico</h2>
                <p className="text-sm text-slate-500">Podrás agregar más usuarios desde el panel de Gestión.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <Field label="Nombre Completo *" icon={UserPlus} value={form.name}
                        onChange={set('name')} placeholder="Dr. Juan Pérez" error={errors.name} />
                </div>
                <Field label="Correo Electrónico *" icon={Mail} type="email" value={form.email}
                    onChange={set('email')} placeholder="doctor@tuclinica.com" error={errors.email} />
                <Field label="Contraseña *" icon={Lock} type="password" value={form.password}
                    onChange={set('password')} placeholder="Mín. 6 caracteres" error={errors.password} />
                <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rol</label>
                    <select value={form.role} onChange={set('role')}
                        className="w-full border border-slate-200 bg-slate-50/80 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300">
                        <option value="DENTIST">Dentista / Médico</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="RECEPTIONIST">Recepcionista</option>
                        <option value="ASSISTANT">Asistente</option>
                    </select>
                </div>
            </div>
            {apiError && (
                <p className="text-sm text-rose-600 font-semibold bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200">{apiError}</p>
            )}
            <div className="flex gap-3">
                <button onClick={onNext}
                    className="flex-none px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Omitir
                </button>
                <button onClick={handleNext} disabled={loading}
                    className="flex-1 py-4 bg-cyan-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-100 disabled:opacity-60">
                    {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ChevronRight size={16} /> Finalizar Configuración</>}
                </button>
            </div>
        </div>
    );
};

// ── Paso 4: Listo ──────────────────────────────────────────────────────────────
const StepListo = ({ onFinish }) => (
    <div className="text-center space-y-6 py-4">
        <div className="relative inline-flex">
            <div className="h-24 w-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle size={44} className="text-emerald-500" />
            </div>
            <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-lg shadow-lg animate-bounce">
                ✨
            </div>
        </div>

        <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">¡Todo listo!</h2>
            <p className="text-slate-500 mt-2">Tu sistema dental está configurado y listo para usar.</p>
        </div>

        {/* Tarjeta de seguimiento */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600 shrink-0" />
                <p className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">Seguimiento activo</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
                Nuestro equipo ha registrado tu activación y te dará <strong>acompañamiento personalizado</strong> durante los primeros días.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-3 bg-white/70 rounded-xl px-4 py-3 border border-white">
                    <MessageCircle size={15} className="text-emerald-500 shrink-0" />
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WhatsApp</p>
                        <p className="text-[12px] font-bold text-slate-700">Soporte inmediato</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white/70 rounded-xl px-4 py-3 border border-white">
                    <Clock size={15} className="text-indigo-500 shrink-0" />
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Respuesta en</p>
                        <p className="text-[12px] font-bold text-slate-700">menos de 2 horas</p>
                    </div>
                </div>
            </div>
        </div>

        <button onClick={onFinish}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-100">
            <HeartPulse size={18} /> Ingresar al Sistema
        </button>
    </div>
);

// ── Componente principal ───────────────────────────────────────────────────────
const OnboardingWizard = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const { user, completeSetup } = useAuth();
    const navigate = useNavigate();

    const next = () => setStepIndex(i => Math.min(i + 1, STEPS.length - 1));

    const finish = () => {
        completeSetup();
        navigate('/dashboard', { replace: true });
    };

    const currentStep = STEPS[stepIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex">

            {/* ── Panel izquierdo (info / seguimiento) ── */}
            <div className="hidden lg:flex flex-col w-80 xl:w-96 bg-gradient-to-b from-indigo-700 to-violet-800 p-10 text-white shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-12">
                    <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <HeartPulse size={22} className="text-white" />
                    </div>
                    <div>
                        <p className="font-black text-white text-lg leading-none">SGD</p>
                        <p className="text-white/60 text-[10px] uppercase tracking-widest">Dental System</p>
                    </div>
                </div>

                {/* Pasos */}
                <div className="flex-1 space-y-1">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest font-black mb-5">Configuración inicial</p>
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const done = i < stepIndex;
                        const active = i === stepIndex;
                        return (
                            <div key={step.id} className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                                active ? 'bg-white/15' : 'opacity-60'
                            )}>
                                <div className={cn(
                                    'h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all',
                                    done ? 'bg-emerald-400' : active ? 'bg-white/20' : 'bg-white/10'
                                )}>
                                    {done ? <CheckCircle size={16} className="text-white" /> : <Icon size={16} className="text-white" />}
                                </div>
                                <div>
                                    <p className={cn('text-[11px] font-black uppercase tracking-widest', active ? 'text-white' : 'text-white/70')}>
                                        Paso {i + 1}
                                    </p>
                                    <p className={cn('text-[12px] font-semibold', active ? 'text-white' : 'text-white/50')}>
                                        {step.label}
                                    </p>
                                </div>
                                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                            </div>
                        );
                    })}
                </div>

                {/* Mensaje de seguimiento */}
                <div className="bg-white/10 rounded-2xl p-5 border border-white/20 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Equipo activo</p>
                    </div>
                    <p className="text-[12px] text-white/70 leading-relaxed">
                        Estamos monitoreando tu configuración en tiempo real. Si tienes alguna duda, escríbenos por WhatsApp.
                    </p>
                    <div className="flex items-center gap-2 text-white/90">
                        <MessageCircle size={13} className="text-emerald-400" />
                        <p className="text-[11px] font-bold">Soporte disponible ahora</p>
                    </div>
                </div>
            </div>

            {/* ── Panel derecho (formulario) ── */}
            <div className="flex-1 flex flex-col">
                {/* Header móvil */}
                <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <HeartPulse size={20} className="text-indigo-600" />
                        <span className="font-black text-slate-800">SGD Dental</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Paso {stepIndex + 1} / {STEPS.length}
                    </span>
                </div>

                {/* Barra de progreso */}
                <div className="h-1 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                        style={{ width: `${((stepIndex) / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>

                {/* Contenido del paso */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-lg">
                        {/* Badge del paso actual */}
                        {stepIndex < STEPS.length - 1 && (
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-7 w-7 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                                    {React.createElement(currentStep.icon, { size: 14, className: 'text-indigo-600' })}
                                </div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                    Paso {stepIndex + 1} de {STEPS.length - 1} · {currentStep.label}
                                </span>
                            </div>
                        )}

                        {/* Formulario del paso */}
                        {stepIndex === 0 && <StepEmpresa onNext={next} />}
                        {stepIndex === 1 && <StepSede onNext={next} />}
                        {stepIndex === 2 && <StepMedico onNext={next} />}
                        {stepIndex === 3 && <StepListo onFinish={finish} />}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">
                        Sesión iniciada como <strong className="text-slate-600">{user?.email}</strong>
                    </p>
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        <p className="text-[10px] text-slate-400">Conexión segura</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
