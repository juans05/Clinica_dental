import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    User,
    Phone,
    Mail,
    Calendar,
    ChevronRight,
    MoreHorizontal,
    Filter,
    FileSpreadsheet,
    MapPin,
    Smartphone,
    Edit2,
    Trash2,
    CheckCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => {
    return twMerge(clsx(inputs));
}

const Patients = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const initialFormState = {
        documentType: 'DNI',
        documentId: '',
        nationality: 'Peruano',
        paternalSurname: '',
        maternalSurname: '',
        firstName: '',
        birthDate: '',
        age: 0,
        gender: 'SIN ESPECIFICAR',
        civilStatus: 'SIN ESPECIFICAR',
        phoneMobile: '',
        phoneHome: '',
        email: '',
        webUser: '',
        webPassword: '',
        whatsappEnabled: true,
        ubigeoAddress: '',
        ubigeoCode: '0',
        address: '',
        reference: '',
        medicalHistory: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await api.get('/patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return 0;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleBirthDateChange = (date) => {
        setFormData({
            ...formData,
            birthDate: date,
            age: calculateAge(date)
        });
    };

    const handleEdit = (patient) => {
        setIsEditing(true);
        setSelectedId(patient.id);
        const formattedDate = patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : '';
        setFormData({
            ...patient,
            birthDate: formattedDate,
            age: calculateAge(formattedDate)
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de desactivar este paciente?')) {
            try {
                await api.delete(`/patients/${id}`);
                fetchPatients();
            } catch (error) {
                console.error('Error deleting patient:', error);
                alert('No se pudo desactivar el paciente.');
            }
        }
    };

    const handleExport = () => {
        if (patients.length === 0) return alert('No hay datos para exportar');

        const headers = ['Nombre', 'Apellidos', 'Documento', 'Celular', 'Email', 'Dirección'];
        const csvRows = [headers.join(',')];

        patients.forEach(p => {
            const row = [
                p.firstName,
                `${p.paternalSurname} ${p.maternalSurname}`,
                `${p.documentType} ${p.documentId}`,
                p.phoneMobile || '',
                p.email || '',
                p.address || ''
            ].map(val => `"${val}"`).join(',');
            csvRows.push(row);
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Pacientes_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                phoneMobile: formData.phoneMobile && !formData.phoneMobile.startsWith('+51') ? `+51 ${formData.phoneMobile}` : formData.phoneMobile,
                phoneHome: formData.phoneHome && !formData.phoneHome.startsWith('+51') ? `+51 ${formData.phoneHome}` : formData.phoneHome,
            };

            if (isEditing) {
                await api.put(`/patients/${selectedId}`, payload);
            } else {
                await api.post('/patients', payload);
            }

            closeForm();
            fetchPatients();
        } catch (error) {
            console.error('Error saving patient:', error);
            alert('Error al guardar paciente.');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setIsEditing(false);
        setSelectedId(null);
        setFormData(initialFormState);
    };

    const filteredPatients = patients.filter(p =>
        p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.paternalSurname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.documentId.includes(searchQuery)
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestión de Pacientes</span>
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Directorio Clínico</h1>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExport}
                        className="flex-1 md:flex-none px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        <FileSpreadsheet size={18} /> Exportar
                    </button>
                    <button
                        onClick={() => { setIsEditing(false); setShowForm(true); }}
                        className="flex-1 md:flex-none premium-button-primary"
                    >
                        <Plus size={20} /> Nuevo Registro
                    </button>
                </div>
            </div>

            {/* Content Card */}
            <div className="glass-card rounded-[32px] overflow-hidden border border-white/40">
                {/* Search & Filters Bar */}
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por Nombre, Apellidos o DNI..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="premium-input pl-14 bg-white/50 backdrop-blur-sm border-slate-200/60"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6">Paciente / Identidad</th>
                                <th className="px-8 py-6">Información de Contacto</th>
                                <th className="px-8 py-6">Ubicación Actual</th>
                                <th className="px-8 py-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan="4" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-12 w-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
                                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Sincronizando expedientes...</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : filteredPatients.length === 0 ? (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan="4" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                                                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                                    <User size={40} />
                                                </div>
                                                <p className="max-w-[200px] text-slate-500 text-sm font-medium italic">No se encontraron registros activos.</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    filteredPatients.map((p, i) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                                                        {p.firstName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-800 text-[15px] group-hover:text-cyan-600 transition-colors">
                                                            {p.firstName} {p.paternalSurname} {p.maternalSurname}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200">
                                                                {p.documentType}: {p.documentId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                                        <Smartphone size={14} className="text-cyan-500" />
                                                        {p.phoneMobile || p.phone || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                                                        <Mail size={14} className="text-slate-300" />
                                                        {p.email || 'sin correo asociado'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                                    <MapPin size={14} className="text-rose-400" />
                                                    {p.ubigeoAddress || 'Ubicación no especificada'}
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] mt-1 ml-6">{p.address || 'Sin dirección registrada'}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-cyan-600 hover:border-cyan-500 transition-all shadow-sm active:scale-90"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-500 transition-all shadow-sm active:scale-90"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modern Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeForm}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] w-full max-w-5xl h-[90vh] flex flex-col relative z-10 overflow-hidden border border-white/20"
                        >
                            {/* Modal Header */}
                            <div className="p-8 pb-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                        {isEditing ? 'Actualizar Expediente' : 'Registro de Paciente'}
                                    </h2>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 italic">
                                        {isEditing ? 'Modificando datos existentes' : 'Módulo de Ingreso Clínico'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeForm}
                                    className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-rose-500 transition-all active:scale-95"
                                >
                                    <Plus className="rotate-45" size={28} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <form onSubmit={handleSubmit} className="p-8 md:p-12 overflow-y-auto flex-1 space-y-12">
                                {/* Identification Step */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-black">01</div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Identidad del Paciente</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Tipo Documento</label>
                                            <select
                                                value={formData.documentType}
                                                onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                                                className="premium-input bg-slate-50/50 border-slate-200/60"
                                            >
                                                <option value="DNI">DNI - NACIONAL</option>
                                                <option value="CE">C.E. - EXTRANJERÍA</option>
                                                <option value="PASS">PASAPORTE</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Número Documento *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Ej. 70123456"
                                                value={formData.documentId}
                                                onChange={e => setFormData({ ...formData, documentId: e.target.value })}
                                                className="premium-input border-emerald-200/60 focus:ring-emerald-500/10 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Nacionalidad</label>
                                            <input
                                                type="text"
                                                value={formData.nationality}
                                                onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                                                className="premium-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Apellido Paterno *</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.paternalSurname}
                                                onChange={e => setFormData({ ...formData, paternalSurname: e.target.value })}
                                                className="premium-input border-emerald-200/60"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Apellido Materno</label>
                                            <input
                                                type="text"
                                                value={formData.maternalSurname}
                                                onChange={e => setFormData({ ...formData, maternalSurname: e.target.value })}
                                                className="premium-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Nombres *</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                className="premium-input border-emerald-200/60"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Data Step */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-black">02</div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Datos Generales & Contacto</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/40 p-6 rounded-[24px] border border-slate-100">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Nacimiento</label>
                                            <input
                                                type="date"
                                                value={formData.birthDate}
                                                onChange={e => handleBirthDateChange(e.target.value)}
                                                className="premium-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Edad</label>
                                            <input readOnly value={formData.age} className="premium-input bg-slate-100/50 text-slate-400 font-black" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Género</label>
                                            <select
                                                value={formData.gender}
                                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                                className="premium-input"
                                            >
                                                <option>SIN ESPECIFICAR</option>
                                                <option value="MALE">MASCULINO</option>
                                                <option value="FEMALE">FEMENINO</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Celular *</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="987 654 321"
                                                value={formData.phoneMobile}
                                                onChange={e => setFormData({ ...formData, phoneMobile: e.target.value })}
                                                className="premium-input border-emerald-200/60"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Correo Electrónico (Opcional)</label>
                                            <input
                                                type="email"
                                                placeholder="paciente@correo.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="premium-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Step */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-black">03</div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Domicilio & Residencia</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Distrito / Ciudad</label>
                                            <input
                                                type="text"
                                                placeholder="Miraflores, Lima"
                                                value={formData.ubigeoAddress}
                                                onChange={e => setFormData({ ...formData, ubigeoAddress: e.target.value })}
                                                className="premium-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Dirección Exacta</label>
                                            <input
                                                type="text"
                                                placeholder="Av. Principal 123"
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                className="premium-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Modal Footer */}
                            <div className="p-8 bg-slate-50/50 backdrop-blur-md border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-8 py-4 rounded-2xl border-2 border-slate-800 bg-white text-slate-800 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    {isEditing ? <CheckCircle size={18} /> : null}
                                    {isEditing ? 'Actualizar Datos' : 'Guardar Paciente'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Patients;
