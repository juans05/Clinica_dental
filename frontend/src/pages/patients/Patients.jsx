import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    CheckCircle,
    ClipboardList
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PatientRegistrationModal from '../../components/PatientRegistrationModal';
import QuickAppointmentModal from '../../components/QuickAppointmentModal';

const cn = (...inputs) => {
    return twMerge(clsx(inputs));
}

const Patients = () => {
    const { user, hasPermission } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [appointmentPatient, setAppointmentPatient] = useState(null); // { id, name }

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
        medicalHistory: '',
        tags: []
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await api.get('patients');
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
        setFormData(patient);
        setIsEditing(true);
        setSelectedId(patient.id);
        setShowRegistrationModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de desactivar este paciente?')) {
            try {
                await api.delete(`patients/${id}`);
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
                await api.put(`patients/${selectedId}`, payload);
            } else {
                await api.post('patients', payload);
            }

            closeForm();
            fetchPatients();
        } catch (error) {
            console.error('Error saving patient:', error);
            alert('Error al guardar paciente.');
        }
    };

    const closeForm = () => {
        setViewMode('list');
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
                    {hasPermission('patients:create') && (
                        <button
                            onClick={() => {
                                setFormData(initialFormState);
                                setIsEditing(false);
                                setSelectedId(null);
                                setShowRegistrationModal(true);
                            }}
                            className="flex-1 md:flex-none premium-button-primary"
                        >
                            <Plus size={20} /> Nuevo Registro
                        </button>
                    )}
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
                                            onClick={() => navigate(`/expediente/${p.id}/filiation`)}
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setAppointmentPatient({
                                                                id: p.id,
                                                                name: `${p.firstName} ${p.paternalSurname}`
                                                            });
                                                        }}
                                                        className="group/apt flex items-center gap-2 lg:gap-0 lg:hover:gap-2 px-3 py-2.5 bg-cyan-50/80 border border-cyan-100 rounded-xl text-cyan-600 hover:text-cyan-700 hover:border-cyan-400 transition-all shadow-sm active:scale-95 overflow-hidden"
                                                        title="Generar Cita"
                                                    >
                                                        <Calendar size={18} className="shrink-0" />
                                                        <span className="lg:max-w-0 overflow-hidden whitespace-nowrap lg:group-hover/apt:max-w-[120px] max-w-[0px] transition-all duration-500 ease-in-out text-[10px] font-black uppercase tracking-widest leading-none">
                                                            Generar Cita
                                                        </span>
                                                    </button>
                                                    {hasPermission('history:view') && (
                                                        <Link
                                                            to={`/expediente/${p.id}/history`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            className="group/hist flex items-center gap-2 lg:gap-0 lg:hover:gap-2 px-3 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-indigo-500 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm active:scale-95 overflow-hidden"
                                                        >
                                                            <ClipboardList size={18} className="shrink-0" />
                                                            <span className="lg:max-w-0 overflow-hidden whitespace-nowrap lg:group-hover/hist:max-w-[120px] max-w-[120px] transition-all duration-500 ease-in-out text-[10px] font-black uppercase tracking-widest leading-none">
                                                                Abrir Historia
                                                            </span>
                                                        </Link>
                                                    )}
                                                    {hasPermission('patients:edit') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(p, 'filiation');
                                                            }}
                                                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-cyan-600 hover:border-cyan-500 transition-all shadow-sm active:scale-90"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                    {hasPermission('patients:delete') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(p.id);
                                                            }}
                                                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-500 transition-all shadow-sm active:scale-90"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
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

            {/* Quick Appointment Modal (from patient list) */}
            {appointmentPatient && (
                <QuickAppointmentModal
                    patientId={appointmentPatient.id}
                    patientName={appointmentPatient.name}
                    onClose={() => setAppointmentPatient(null)}
                    onSuccess={() => setAppointmentPatient(null)}
                />
            )}

            {/* High-Fidelity Registration Modal */}
            <PatientRegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => {
                    setShowRegistrationModal(false);
                    setSelectedId(null);
                    setIsEditing(false);
                }}
                editData={isEditing ? formData : null}
                onSave={async (data) => {
                    try {
                        const lastName = `${data.paternalSurname || ''} ${data.maternalSurname || ''}`.trim();

                        // Map complex types to backend schema
                        const payload = {
                            ...data,
                            lastName: lastName || 'Paciente',
                            tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags,
                            // Ensure birthDate is a valid date string or null if empty
                            birthDate: data.birthDate || new Date().toISOString().split('T')[0],
                            // Handle Peruvian prefix for mobile
                            phoneMobile: data.phoneMobile && !data.phoneMobile.startsWith('+51') ? `+51 ${data.phoneMobile}` : data.phoneMobile,
                            // CRITICAL: For unique constraints, "" is a value. null is not (in some contexts).
                            // In Prisma String? @unique, multiple nulls are allowed, but multiple "" are NOT.
                            documentId: data.noDocument ? null : (data.documentId?.trim() || null)
                        };

                        // Flatten guardian data if present
                        if (data.guardian) {
                            payload.guardianName = `${data.guardian.firstName || ''} ${data.guardian.paternalSurname || ''} ${data.guardian.maternalSurname || ''}`.trim();
                            payload.guardianDocumentId = data.guardian.noDocument ? null : (data.guardian.documentId?.trim() || null);
                            payload.guardianPhone = data.guardian.phoneMobile;
                            delete payload.guardian;
                        }

                        if (isEditing) {
                            await api.put(`patients/${selectedId}`, payload);
                        } else {
                            await api.post('patients', payload);
                        }

                        setShowRegistrationModal(false);
                        setSelectedId(null);
                        setIsEditing(false);
                        fetchPatients();
                    } catch (error) {
                        console.error('Error creating patient:', error);
                        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;

                        if (errorMsg.includes('Unique constraint failed on the fields: (`documentId`)')) {
                            alert('No se pudo guardar: Este DNI ya está registrado en el sistema (puede estar desactivado).');
                        } else {
                            alert('Error al crear paciente: ' + errorMsg);
                        }
                        throw error;
                    }
                }}
            />
        </div>
    );
};

export default Patients;
