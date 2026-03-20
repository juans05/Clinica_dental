import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Shield,
    Bell,
    User,
    Zap,
    Save,
    Upload,
    Globe,
    Phone,
    Mail,
    MapPin,
    Clock,
    CreditCard,
    Camera,
    Loader2,
    Building2,
    Stethoscope,
    Activity,
    FileText,
    Package
} from 'lucide-react';
import api from '../../services/api';
import UsersView from './UsersView';
import BranchesView from './components/BranchesView';
import ServicesView from './components/ServicesView';
import ConsultoriesView from './components/ConsultoriesView';
import SchedulePanel from './components/SchedulePanel';
import SeriesPanel from './components/SeriesPanel';
import InventoryView from './InventoryView';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('PROFILE');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [company, setCompany] = useState({
        name: '',
        commercialName: '',
        taxId: '',
        phone: '',
        address: '',
        receptionEmail: '',
        logo: '',
        website: '',
        description: ''
    });

    // Common data for sub-components
    const [branches, setBranches] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [companyRes, branchesRes, usersRes, profilesRes] = await Promise.all([
                api.get('company'),
                api.get('branches'),
                api.get('auth/users'),
                api.get('profiles')
            ]);
            setCompany(companyRes.data);
            setBranches(branchesRes.data);
            setProfiles(profilesRes.data);
            // Filter doctors from users
            const allUsers = usersRes.data;
            setDoctors(allUsers.filter(u =>
                u.role === 'DENTIST' ||
                u.profile?.name?.toUpperCase().includes('ODONT') ||
                u.profile?.name?.toUpperCase().includes('DENT')
            ));
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('company', company);
            alert('Configuración guardada exitosamente');
        } catch (error) {
            console.error('Error saving company:', error);
            alert('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompany({ ...company, logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-500 w-10 h-10" />
        </div>
    );

    const TABS = [
        { id: 'PROFILE', icon: User, label: 'Mi Perfil' },
        { id: 'BRANCHES', icon: Building2, label: 'Sedes' },
        { id: 'USERS', icon: Shield, label: 'Usuarios' },
        { id: 'SERVICES', icon: Stethoscope, label: 'Servicios' },
        { id: 'INVENTORY', icon: Package, label: 'Inventario' },
        { id: 'CONSULTORIES', icon: Activity, label: 'Consultorios' },
        { id: 'SCHEDULES', icon: Clock, label: 'Horarios' },
        { id: 'SERIES', icon: FileText, label: 'Series' },
        { id: 'SUBSCRIPTION', icon: CreditCard, label: 'Suscripción' },
        { id: 'INTEGRATIONS', icon: Zap, label: 'Integraciones' },
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Configuración</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 italic">Preferencias del Sistema</p>
                </div>
                {activeTab === 'PROFILE' && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="premium-button-primary bg-slate-800 shadow-slate-800/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-4">
                    <nav className="glass-card p-3 rounded-[28px] border border-white/50 space-y-1 shadow-sm h-fit sticky top-8">
                        {TABS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-[11px] transition-all tracking-wider uppercase ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }`}
                            >
                                <item.icon size={18} /> {item.label}
                                {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    {activeTab === 'PROFILE' && (
                        <div className="space-y-6">
                            <div className="glass-card p-10 rounded-[40px] border border-white/60 shadow-xl shadow-slate-200/40 bg-gradient-to-br from-white to-slate-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Left Column: Form Fields */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial <span className="text-rose-500">*</span></label>
                                            <input
                                                value={company.commercialName || ''}
                                                onChange={e => setCompany({ ...company, commercialName: e.target.value })}
                                                className="premium-input bg-white border-slate-200"
                                                placeholder="Ej. Clinica Dental Premium"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tél. celular <span className="text-rose-500">*</span></label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                        <span className="text-[14px]">🇵🇪</span>
                                                        <span className="text-slate-400 font-bold text-xs">+51</span>
                                                    </span>
                                                    <input
                                                        value={company.phone || ''}
                                                        onChange={e => setCompany({ ...company, phone: e.target.value })}
                                                        className="premium-input bg-white border-slate-200 pl-20"
                                                        placeholder="902191848"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tél. fijo</label>
                                                <input
                                                    className="premium-input bg-white border-slate-200"
                                                    placeholder="(01) 123 4567"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-cyan-500 transition-colors" size={16} />
                                                <input
                                                    value={company.address || ''}
                                                    onChange={e => setCompany({ ...company, address: e.target.value })}
                                                    className="premium-input bg-white border-slate-200 pl-11"
                                                    placeholder="Lima, Lima, Ancón"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de recepción <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-cyan-500 transition-colors" size={16} />
                                                <input
                                                    value={company.receptionEmail || ''}
                                                    onChange={e => setCompany({ ...company, receptionEmail: e.target.value })}
                                                    className="premium-input bg-white border-slate-200 pl-11"
                                                    placeholder="contacto@clinicadental.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Página web</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-cyan-500 transition-colors" size={16} />
                                                <input
                                                    value={company.website || ''}
                                                    onChange={e => setCompany({ ...company, website: e.target.value })}
                                                    className="premium-input bg-white border-slate-200 pl-11"
                                                    placeholder="https://www.tuclinica.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Presentaton & Logo */}
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Breve presentación:</label>
                                            <textarea
                                                rows={5}
                                                value={company.description || ''}
                                                onChange={e => setCompany({ ...company, description: e.target.value })}
                                                className="premium-input bg-white border-slate-200 resize-none py-4"
                                                placeholder="Somos un equipo con experiencia en..."
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo</label>
                                            <div className="flex items-center gap-6">
                                                <div className="relative group">
                                                    <div className="h-24 w-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                                                        {company.logo ? (
                                                            <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Camera size={24} className="text-slate-300" />
                                                        )}
                                                    </div>
                                                    <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center cursor-pointer hover:bg-cyan-700 transition-all shadow-lg border-2 border-white">
                                                        <Upload size={14} />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                                    </label>
                                                </div>
                                                <div className="flex-1">
                                                    <button
                                                        onClick={() => document.querySelector('input[type="file"]').click()}
                                                        className="px-6 py-2 bg-cyan-50 text-cyan-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-100 transition-all"
                                                    >
                                                        Subir Logo
                                                    </button>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-2 italic leading-relaxed">Formatos: JPG, PNG. Recomendado: 512x512px.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de Cuenta</span>
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Activo</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-bold text-slate-600">ID de Empresa: <span className="text-slate-400 font-medium">#00{company.id}</span></p>
                                                <p className="text-[11px] font-bold text-slate-600">RUC: <span className="text-slate-400 font-medium">{company.taxId}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'BRANCHES' && (
                        <BranchesView onRefresh={fetchInitialData} />
                    )}

                    {activeTab === 'USERS' && (
                        <UsersView
                            branches={branches}
                            profiles={profiles}
                            onRefresh={fetchInitialData}
                        />
                    )}

                    {activeTab === 'SERVICES' && (
                        <ServicesView />
                    )}

                    {activeTab === 'CONSULTORIES' && (
                        <ConsultoriesView branches={branches} />
                    )}

                    {activeTab === 'SCHEDULES' && (
                        <SchedulePanel doctors={doctors} branches={branches} />
                    )}

                    {activeTab === 'SERIES' && (
                        <SeriesPanel branches={branches} />
                    )}

                    {activeTab === 'INVENTORY' && (
                        <InventoryView />
                    )}

                    {['SUBSCRIPTION', 'INTEGRATIONS'].includes(activeTab) && (
                        <div className="h-96 glass-card rounded-[40px] flex flex-center flex-col items-center justify-center space-y-4 text-slate-400 border border-dashed border-slate-200">
                            <Zap size={48} className="opacity-20 animate-pulse text-cyan-400" />
                            <div className="text-center">
                                <p className="font-black uppercase tracking-[0.2em] text-xs">Módulo en Desarrollo</p>
                                <p className="text-[10px] font-bold mt-1 opacity-60">Próximamente disponible en esta versión</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
