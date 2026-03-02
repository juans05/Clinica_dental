import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Edit2, Trash2, Shield, Mail, MapPin,
    CheckCircle, X, Plus, Loader2, Key, User
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const UsersView = ({ branches: propBranches, profiles: propProfiles, onRefresh }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'DENTIST',
        branchId: '',
        profileId: ''
    });

    // Sync from props if they change
    useEffect(() => {
        if (propProfiles) setProfiles(propProfiles);
        if (propBranches) setBranches(propBranches);
    }, [propProfiles, propBranches]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const uRes = await api.get('auth/users');
            setUsers(uRes.data);

            // If props are not provided, fetch them as fallback
            if (!propProfiles || !propBranches) {
                const [pRes, bRes] = await Promise.all([
                    api.get('profiles'),
                    api.get('branches')
                ]);
                setProfiles(pRes.data);
                setBranches(bRes.data);
            }
        } catch (error) {
            console.error('Error fetching users data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't show password
                role: user.role,
                branchId: user.branchId || '',
                profileId: user.profileId || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'DENTIST',
                branchId: '',
                profileId: ''
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingUser) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // Don't update password if empty
                await api.put(`auth/users/${editingUser.id}`, payload);
            } else {
                await api.post('auth/register', { ...formData, companyId: currentUser.companyId });
            }
            handleCloseModal();
            fetchData();
            if (onRefresh) onRefresh();
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert('Error al guardar usuario: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (id === currentUser.id) return alert('No puedes desactivarte a ti mismo.');
        if (!window.confirm('¿Está seguro de desactivar este usuario?')) return;
        try {
            await api.delete(`auth/users/${id}`);
            fetchData();
        } catch (error) {
            alert('Error al eliminar usuario');
        }
    };

    if (loading) return (
        <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Gestión de Usuarios</h3>
                <button
                    onClick={() => handleOpenModal()}
                    className="premium-button-primary py-2.5 px-6"
                >
                    <UserPlus size={18} /> Nuevo Usuario
                </button>
            </div>

            <div className="glass-card rounded-[32px] overflow-hidden border border-white/40 shadow-xl shadow-slate-200/50">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-6">Usuario / Nombre</th>
                            <th className="px-8 py-6">Email / Acceso</th>
                            <th className="px-8 py-6">Perfil / Rol</th>
                            <th className="px-8 py-6">Sede Principal</th>
                            <th className="px-8 py-6 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black">
                                            {u.name[0]}
                                        </div>
                                        <span className="font-black text-slate-800 uppercase tracking-tight">{u.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 font-bold text-slate-400 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-slate-300" /> {u.email}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-cyan-100">
                                        {u.profile?.name || u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6 font-bold text-slate-400 text-xs">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-slate-300" /> {branches.find(b => b.id === u.branchId)?.name || 'Sin sede'}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenModal(u)}
                                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            disabled={u.id === currentUser.id}
                                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all disabled:opacity-30"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-white/20">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                <User className="text-cyan-500" /> {editingUser ? 'Editar' : 'Nuevo'} Usuario
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo <span className="text-rose-500">*</span></label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="premium-input bg-slate-50/50"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email <span className="text-rose-500">*</span></label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="premium-input bg-slate-50/50"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Contraseña {editingUser ? '(dejar vacío para no cambiar)' : <span className="text-rose-500">*</span>}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        required={!editingUser}
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="premium-input bg-slate-50/50 pl-11"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil <span className="text-rose-500">*</span></label>
                                    <select
                                        required
                                        value={formData.profileId}
                                        onChange={e => {
                                            const pId = e.target.value;
                                            const selectedProfile = profiles.find(p => p.id === parseInt(pId));
                                            let roleMap = 'DENTIST';
                                            if (selectedProfile?.name === 'ADMINISTRADOR') roleMap = 'ADMIN';
                                            else if (selectedProfile?.name === 'RECEPCIÓN') roleMap = 'RECEPTIONIST';

                                            setFormData({ ...formData, profileId: pId, role: roleMap });
                                        }}
                                        className="premium-input bg-slate-50/50"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede <span className="text-rose-500">*</span></label>
                                    <select
                                        required
                                        value={formData.branchId}
                                        onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                                        className="premium-input bg-slate-50/50"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersView;
