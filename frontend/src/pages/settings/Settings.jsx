import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, User, Zap, Save } from 'lucide-react';

const Settings = () => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Configuración</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 italic">Preferencias del Sistema</p>
                </div>
                <button className="premium-button-primary bg-emerald-600 shadow-emerald-500/20">
                    <Save size={18} /> Guardar Cambios
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <nav className="glass-card p-3 rounded-[28px] border border-white/50 space-y-1">
                        {[
                            { icon: User, label: 'Perfil y Cuenta', active: true },
                            { icon: Shield, label: 'Seguridad' },
                            { icon: Bell, label: 'Notificaciones' },
                            { icon: Zap, label: 'Integraciones' },
                        ].map((item, i) => (
                            <button
                                key={i}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${item.active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <item.icon size={18} /> {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="glass-card p-10 rounded-[32px] border border-white/50">
                        <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Ajustes de la Empresa</h3>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                                <input readOnly value="Clínica Dental Premium" className="premium-input bg-slate-50/50 text-slate-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RUC</label>
                                    <input readOnly value="20601234567" className="premium-input bg-slate-50/50 text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Idioma</label>
                                    <select disabled className="premium-input bg-slate-50/50 text-slate-500">
                                        <option>Español (Perú)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
