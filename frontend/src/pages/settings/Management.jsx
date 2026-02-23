import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    UserPlus,
    Building2,
    Trash2,
    Edit2,
    Plus,
    CheckCircle,
    X,
    Shield,
    Phone,
    Mail,
    Power
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => {
    return twMerge(clsx(inputs));
}

const Management = () => {
    const { user: currentUser } = useAuth();
    const [branches, setBranches] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [activeTab, setActiveTab] = useState('BRANCHES'); // 'BRANCHES' or 'DOCTORS'
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form States
    const [branchForm, setBranchForm] = useState({ name: '', address: '', phone: '' });
    const [doctorForm, setDoctorForm] = useState({ name: '', email: '', password: '', role: 'DENTIST', branchId: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bRes, dRes] = await Promise.all([
                api.get('branches'),
                api.get('auth/users?role=DENTIST')
            ]);
            setBranches(bRes.data);
            setDoctors(dRes.data);
        } catch (error) {
            console.error('Error fetching management data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBranch = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`branches/${editingItem.id}`, branchForm);
            } else {
                await api.post('branches', branchForm);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message;
            alert('Error al guardar sede: ' + msg);
        }
    };

    const handleSaveDoctor = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`auth/users/${editingItem.id}`, doctorForm);
            } else {
                await api.post('auth/register', { ...doctorForm, companyId: currentUser.companyId });
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message;
            alert('Error al guardar doctor: ' + msg);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('¿Está seguro de desactivar este registro?')) return;
        try {
            if (type === 'BRANCH') await api.delete(`branches/${id}`);
            else await api.delete(`auth/users/${id}`);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert('Error al desactivar: ' + msg);
        }
    };

    const handleToggleActive = async (type, item) => {
        const action = item.active ? 'desactivar' : 'activar';
        if (!window.confirm(`¿Está seguro de ${action} este registro?`)) return;
        try {
            if (type === 'BRANCH') {
                await api.put(`branches/${item.id}`, { ...item, active: !item.active });
            } else {
                await api.put(`auth/users/${item.id}`, { active: !item.active });
            }
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert(`Error al ${action}: ` + msg);
        }
    };

    const openModal = (type, item = null) => {
        setEditingItem(item);
        if (type === 'BRANCH') {
            setBranchForm(item ? { name: item.name, address: item.address || '', phone: item.phone || '' } : { name: '', address: '', phone: '' });
        } else {
            setDoctorForm(item ? { name: item.name, email: item.email, role: item.role, branchId: item.branchId || '' } : { name: '', email: '', password: '', role: 'DENTIST', branchId: '' });
        }
        setShowModal(true);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuración Administrativa</span>
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Gestión de Clínica</h1>
                </div>

                <button
                    onClick={() => openModal(activeTab === 'BRANCHES' ? 'BRANCH' : 'DOCTOR')}
                    className="premium-button-primary w-full md:w-auto"
                >
                    <Plus size={20} /> {activeTab === 'BRANCHES' ? 'Nueva Sede' : 'Nuevo Doctor'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 p-1.5 bg-slate-100 w-fit rounded-2xl border border-slate-200">
                <button
                    onClick={() => setActiveTab('BRANCHES')}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === 'BRANCHES' ? "bg-white text-cyan-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Building2 size={16} className="inline mr-2" /> Sedes / Sucursales
                </button>
                <button
                    onClick={() => setActiveTab('DOCTORS')}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === 'DOCTORS' ? "bg-white text-indigo-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Shield size={16} className="inline mr-2" /> Médicos & Personal
                </button>
            </div>

            {/* List Section */}
            <div className="glass-card rounded-[32px] overflow-hidden border border-white/40 shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                {activeTab === 'BRANCHES' ? (
                                    <>
                                        <th className="px-8 py-6 uppercase">Denominación / Sede</th>
                                        <th className="px-8 py-6 uppercase">Contacto / Dirección</th>
                                        <th className="px-8 py-6 uppercase">Estado</th>
                                        <th className="px-8 py-6 text-right uppercase">Acciones</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-6 uppercase">Médico / Especialista</th>
                                        <th className="px-8 py-6 uppercase">Acceso / Email</th>
                                        <th className="px-8 py-6 uppercase">Sede Asignada</th>
                                        <th className="px-8 py-6 text-right uppercase">Acciones</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : (activeTab === 'BRANCHES' ? branches : doctors).map(item => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-50/50 transition-all group"
                                >
                                    {activeTab === 'BRANCHES' ? (
                                        <>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black">
                                                        <Building2 size={20} />
                                                    </div>
                                                    <span className="font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs space-y-1">
                                                    <p className="font-bold text-slate-600"><MapPin size={12} className="inline mr-1 text-slate-400" /> {item.address || 'Sin dirección'}</p>
                                                    <p className="text-slate-400 font-medium"><Phone size={12} className="inline mr-1 text-slate-300" /> {item.phone || 'Sin teléfono'}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    item.active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                )}>
                                                    {item.active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm uppercase">
                                                        {item.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                                                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{item.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <Mail size={14} className="text-slate-300" /> {item.email}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <MapPin size={14} className="text-slate-300" /> {branches.find(b => b.id === item.branchId)?.name || 'Sin asignar'}
                                                </div>
                                            </td>
                                        </>
                                    )}
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(activeTab === 'BRANCHES' ? 'BRANCH' : 'DOCTOR', item)}
                                                title="Editar"
                                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(activeTab === 'BRANCHES' ? 'BRANCH' : 'DOCTOR', item)}
                                                title={item.active ? 'Desactivar' : 'Activar'}
                                                className={cn(
                                                    "p-2 bg-white border rounded-lg transition-all",
                                                    item.active
                                                        ? "border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                                                        : "border-emerald-200 text-emerald-500 hover:bg-emerald-50"
                                                )}
                                            >
                                                <Power size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Control Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-white/20">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'BRANCHES' ? 'Sede' : 'Médico'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500"><X size={24} /></button>
                            </div>

                            <form onSubmit={activeTab === 'BRANCHES' ? handleSaveBranch : handleSaveDoctor} className="p-8 space-y-6">
                                {activeTab === 'BRANCHES' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Sede</label>
                                            <input required type="text" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. Miraflores Centro" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección</label>
                                            <input type="text" value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. Calle Las Lilas 456" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                            <input type="tel" value={branchForm.phone} onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })} className="premium-input bg-slate-50" placeholder="Ej. +51 987 654 321" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                            <input required type="text" value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} className="premium-input bg-slate-50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                            <input required type="email" value={doctorForm.email} onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })} className="premium-input bg-slate-50" />
                                        </div>
                                        {!editingItem && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña Inicial</label>
                                                <input required type="password" value={doctorForm.password} onChange={e => setDoctorForm({ ...doctorForm, password: e.target.value })} className="premium-input bg-slate-50" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol</label>
                                                <select value={doctorForm.role} onChange={e => setDoctorForm({ ...doctorForm, role: e.target.value })} className="premium-input bg-slate-50">
                                                    <option value="DENTIST">Médico / Dentista</option>
                                                    <option value="ADMIN">Administrador</option>
                                                    <option value="RECEPTIONIST">Recepción</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede Principal</label>
                                                <select required value={doctorForm.branchId} onChange={e => setDoctorForm({ ...doctorForm, branchId: e.target.value })} className="premium-input bg-slate-50">
                                                    <option value="">Seleccionar Sede...</option>
                                                    {branches.map(b => (
                                                        <option key={b.id} value={b.id}>{b.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-6 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-[2] py-4 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-800/20 active:scale-95 transition-all">
                                        <CheckCircle size={16} className="inline mr-2" /> {editingItem ? 'Actualizar' : 'Guardar Registro'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Management;
