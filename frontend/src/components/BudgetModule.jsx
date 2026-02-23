import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, FileText, Download, Trash2, Edit3, ChevronDown,
    ChevronUp, CheckCircle, Clock, AlertCircle, Printer,
    DollarSign, User, X, Search, Save, Info, Tag, Percent
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import useBudgetStore from '../store/useBudgetStore';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const STATUS_MAP = {
    PENDING: { label: 'Pendiente', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock },
    APPROVED: { label: 'Aprobado', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle },
    REJECTED: { label: 'Rechazado', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: AlertCircle },
    COMPLETED: { label: 'Completado', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: CheckCircle },
};

const BudgetModule = ({ patientId, patientName }) => {
    const { user } = useAuth();
    const {
        budgets, loading, fetchBudgets, fetchServices,
        services, createBudget, updateBudget, updateBudgetItem, deleteBudgetItem
    } = useBudgetStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [createForm, setCreateForm] = useState({
        name: '',
        doctorId: user?.id || '',
        items: [],
        notesPatient: '',
        notesInternal: '',
        discount: 0
    });

    useEffect(() => {
        if (patientId) {
            fetchBudgets(patientId);
            fetchServices();
        }
    }, [patientId]);

    const handleAddItem = (service) => {
        setCreateForm(prev => ({
            ...prev,
            items: [...prev.items, {
                serviceId: service.id,
                name: service.name,
                price: service.price,
                quantity: 1,
                discount: 0,
                toothNumber: '',
                comment: ''
            }]
        }));
    };

    const handleRemoveItem = (index) => {
        setCreateForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateFormItem = (index, field, value) => {
        setCreateForm(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
        }));
    };

    const calculateSubtotal = (item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        const discount = parseFloat(item.discount) || 0;
        return (price * qty) * (1 - discount / 100);
    };

    const total = createForm.items.reduce((acc, item) => acc + calculateSubtotal(item), 0);

    const handleSaveBudget = async () => {
        if (createForm.items.length === 0) return alert('Agregue al menos un servicio');
        const res = await createBudget(patientId, createForm.doctorId, createForm.items);
        if (res) {
            setShowCreateModal(false);
            setCreateForm({
                name: '',
                doctorId: user?.id || '',
                items: [],
                notesPatient: '',
                notesInternal: '',
                discount: 0
            });
        }
    };

    const handleExportPDF = (budget) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        // ... pdf logic remains similar but adds new fields if needed
        doc.save(`Presupuesto_${patientName}_${budget.id}.pdf`);
    };

    return (
        <div className="p-8 space-y-6 max-h-full overflow-y-auto">
            {/* Header section */}
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Presupuestos y Pagos</h2>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Gestión integral de planes y facturación</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Plus size={16} /> Nuevo Presupuesto
                </button>
            </div>

            {/* Modal for Creating Budget (Reference UI Style) */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden relative z-10"
                    >
                        {/* Modal Header */}
                        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Crear presupuesto</h3>
                            <button onClick={() => setShowCreateModal(false)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                            {/* Metadata Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paciente</label>
                                    <div className="premium-input bg-slate-50 flex items-center justify-between">
                                        <span className="text-slate-700 font-bold">{patientName}</span>
                                        <X size={14} className="text-slate-300" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de presupuesto <span className="text-slate-300">(opcional)</span></label>
                                    <input
                                        value={createForm.name}
                                        onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                        className="premium-input" placeholder="Ej. Rehabilitación Estética"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doctor responsable</label>
                                    <select
                                        value={createForm.doctorId}
                                        onChange={e => setCreateForm({ ...createForm, doctorId: e.target.value })}
                                        className="premium-input appearance-none"
                                    >
                                        <option value={user?.id}>{user?.name}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Service Selector */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agregar servicios/productos</label>
                                    <Info size={12} className="text-slate-300" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-3">
                                        <select className="premium-input bg-white"><option>Servicio</option></select>
                                    </div>
                                    <div className="md:col-span-9 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <select
                                            onChange={e => {
                                                const s = services.find(sv => sv.id === parseInt(e.target.value));
                                                if (s) handleAddItem(s);
                                                e.target.value = "";
                                            }}
                                            className="premium-input pl-12 appearance-none"
                                        >
                                            <option value="">Buscar servicio...</option>
                                            {services.map(s => <option key={s.id} value={s.id}>{s.name} - S/ {s.price}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Table */}
                            <div className="rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-[#334e68] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Item</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Diente</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Cant.</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Mon.</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-right">Precio Unit.</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Dcto.</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-right">Subtotal</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {createForm.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-bold text-slate-700">{item.name}</p>
                                                    <input
                                                        className="mt-1 text-[10px] text-slate-400 outline-none w-full bg-transparent"
                                                        placeholder="Comentario..."
                                                        onChange={e => handleUpdateFormItem(idx, 'comment', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input
                                                        className="w-12 text-center text-xs font-black p-1 bg-slate-50 rounded-lg outline-none"
                                                        placeholder="—"
                                                        value={item.toothNumber}
                                                        onChange={e => handleUpdateFormItem(idx, 'toothNumber', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input
                                                        type="number" className="w-12 text-center text-xs font-black p-1 bg-slate-50 rounded-lg outline-none"
                                                        value={item.quantity}
                                                        onChange={e => handleUpdateFormItem(idx, 'quantity', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center text-[10px] font-black text-slate-400">PEN</td>
                                                <td className="px-4 py-4 text-right text-xs font-black text-slate-700">{parseFloat(item.price).toFixed(2)}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <input
                                                            className="w-10 text-center text-xs font-black p-1 bg-slate-50 rounded-lg outline-none"
                                                            value={item.discount}
                                                            onChange={e => handleUpdateFormItem(idx, 'discount', e.target.value)}
                                                        />
                                                        <span className="text-[10px] font-black text-slate-300">%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right text-xs font-black text-slate-800">{calculateSubtotal(item).toFixed(2)}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <button onClick={() => handleRemoveItem(idx)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Notes and Totals Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="flex gap-4">
                                        <button className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all">
                                            <Tag size={12} /> Aplicar descuento masivo
                                        </button>
                                        <button className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all">
                                            <DollarSign size={12} /> Cambiar precios a otra moneda
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nota para el paciente</label>
                                            <textarea
                                                className="premium-input h-32 py-4 resize-none"
                                                value={createForm.notesPatient}
                                                onChange={e => setCreateForm({ ...createForm, notesPatient: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nota interna</label>
                                            <textarea
                                                className="premium-input h-32 py-4 resize-none"
                                                value={createForm.notesInternal}
                                                onChange={e => setCreateForm({ ...createForm, notesInternal: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-4 bg-slate-50 rounded-[32px] p-8 space-y-4">
                                    <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                        <span>Subtotal</span>
                                        <span>S/ {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                        <span>Descuento</span>
                                        <span>S/ 0.00</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total</span>
                                            <span className="text-2xl font-black text-slate-900 leading-none">S/ {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                            <span>Pagado</span>
                                            <span>S/ 0.00</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                            <span>Por pagar</span>
                                            <span>S/ {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 rounded-b-[40px]">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveBudget}
                                className="premium-button-primary bg-indigo-600 shadow-indigo-200 flex items-center gap-2"
                            >
                                <Save size={18} /> Guardar Presupuesto
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* List and Status logic continues below... */}
            {budgets.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
                    <FileText size={48} className="text-slate-200 mb-6" />
                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Sin presupuestos activos</h3>
                    <p className="text-sm font-medium text-slate-300 mt-2 max-w-xs italic">Genera un presupuesto profesional haciendo click en "Nuevo Presupuesto" o desde el Odontograma.</p>
                </div>
            ) : (
    const [paymentForm, setPaymentForm] = useState({ budgetId: null, amount: '', method: 'CASH' });

    const handleRegisterPayment = async (budgetId) => {
        if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) return alert('Ingrese un monto válido');
        const res = await useBudgetStore.getState().registerPayment({
            amount: parseFloat(paymentForm.amount),
            method: paymentForm.method,
            treatmentPlanId: budgetId,
            patientId
        });
        if (res) {
            setPaymentForm({ budgetId: null, amount: '', method: 'CASH' });
            fetchBudgets(patientId);
            alert('Pago registrado correctamente');
        }
    };

    const handleCreateInvoice = async (budget, type) => {
        const res = await useBudgetStore.getState().createInvoice({
            number: `${type === 'BOLETA' ? 'B' : 'F'}${Date.now().toString().slice(-6)}`,
            type,
            total: budget.items.reduce((acc, i) => acc + (i.price * i.quantity), 0),
            patientId,
            treatmentPlanId: budget.id
        });
        if (res) {
            fetchBudgets(patientId);
            alert(`${type} generada correctamente: ${res.number}`);
        }
    };

    return (
        <div className="p-8 space-y-6 max-h-full overflow-y-auto">
            {/* Header section */}
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Presupuestos y Pagos</h2>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Gestión integral de planes y facturación</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Plus size={16} /> Nuevo Presupuesto
                </button>
            </div>

            {/* Modal for Creating Budget (Reference UI Style) */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden relative z-10"
                    >
                        {/* Modal Header */}
                        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Crear presupuesto</h3>
                            <button onClick={() => setShowCreateModal(false)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                            {/* Metadata Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paciente</label>
                                    <div className="premium-input bg-slate-50 flex items-center justify-between">
                                        <span className="text-slate-700 font-bold">{patientName}</span>
                                        <X size={14} className="text-slate-300" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de presupuesto <span className="text-slate-300">(opcional)</span></label>
                                    <input 
                                        value={createForm.name}
                                        onChange={e => setCreateForm({...createForm, name: e.target.value})}
                                        className="premium-input" placeholder="Ej. Rehabilitación Estética" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doctor responsable</label>
                                    <select 
                                        value={createForm.doctorId}
                                        onChange={e => setCreateForm({...createForm, doctorId: e.target.value})}
                                        className="premium-input appearance-none"
                                    >
                                        <option value={user?.id}>{user?.name}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Service Selector */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agregar servicios/productos</label>
                                    <Info size={12} className="text-slate-300" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-3">
                                        <select className="premium-input bg-white"><option>Servicio</option></select>
                                    </div>
                                    <div className="md:col-span-9 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <select 
                                            onChange={e => {
                                                const s = services.find(sv => sv.id === parseInt(e.target.value));
                                                if (s) handleAddItem(s);
                                                e.target.value = "";
                                            }}
                                            className="premium-input pl-12 appearance-none"
                                        >
                                            <option value="">Buscar servicio...</option>
                                            {services.map(s => <option key={s.id} value={s.id}>{s.name} - S/ {s.price}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Table */}
                            <div className="rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-[#334e68] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Item</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Diente</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Cant.</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Mon.</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-right">Precio Unit.</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Dcto.</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-right">Subtotal</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {createForm.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-bold text-slate-700">{item.name}</p>
                                                    <input 
                                                        className="mt-1 text-[10px] text-slate-400 outline-none w-full bg-transparent" 
                                                        placeholder="Comentario..." 
                                                        onChange={e => handleUpdateFormItem(idx, 'comment', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input 
                                                        className="w-12 text-center text-xs font-black p-1 bg-slate-50 rounded-lg outline-none" 
                                                        placeholder="—"
                                                        value={item.toothNumber}
                                                        onChange={e => handleUpdateFormItem(idx, 'toothNumber', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input 
                                                        type="number" className="w-12 text-center text-xs font-black p-1 bg-slate-50 rounded-lg outline-none" 
                                                        value={item.quantity}
                                                        onChange={e => handleUpdateFormItem(idx, 'quantity', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center text-[10px] font-black text-slate-400">PEN</td>
                                                <td className="px-4 py-4 text-right text-xs font-black text-slate-700">{parseFloat(item.price).toFixed(2)}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <input 
                                                            className="w-10 text-center text-xs font-black p-1 bg-slate-50 rounded-lg outline-none" 
                                                            value={item.discount}
                                                            onChange={e => handleUpdateFormItem(idx, 'discount', e.target.value)}
                                                        />
                                                        <span className="text-[10px] font-black text-slate-300">%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right text-xs font-black text-slate-800">{calculateSubtotal(item).toFixed(2)}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <button onClick={() => handleRemoveItem(idx)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Notes and Totals Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="flex gap-4">
                                        <button className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all">
                                            <Tag size={12} /> Aplicar descuento masivo
                                        </button>
                                        <button className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all">
                                            <DollarSign size={12} /> Cambiar precios a otra moneda
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nota para el paciente</label>
                                            <textarea 
                                                className="premium-input h-32 py-4 resize-none" 
                                                value={createForm.notesPatient}
                                                onChange={e => setCreateForm({...createForm, notesPatient: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nota interna</label>
                                            <textarea 
                                                className="premium-input h-32 py-4 resize-none" 
                                                value={createForm.notesInternal}
                                                onChange={e => setCreateForm({...createForm, notesInternal: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-4 bg-slate-50 rounded-[32px] p-8 space-y-4">
                                    <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                        <span>Subtotal</span>
                                        <span>S/ {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                        <span>Descuento</span>
                                        <span>S/ 0.00</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total</span>
                                            <span className="text-2xl font-black text-slate-900 leading-none">S/ {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                            <span>Pagado</span>
                                            <span>S/ 0.00</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                            <span>Por pagar</span>
                                            <span>S/ {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 rounded-b-[40px]">
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveBudget}
                                className="premium-button-primary bg-indigo-600 shadow-indigo-200 flex items-center gap-2"
                            >
                                <Save size={18} /> Guardar Presupuesto
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* List and Status logic */}
            {budgets.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
                    <FileText size={48} className="text-slate-200 mb-6" />
                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Sin presupuestos activos</h3>
                    <p className="text-sm font-medium text-slate-300 mt-2 max-w-xs italic">Genera un presupuesto profesional haciendo click en "Nuevo Presupuesto" o desde el Odontograma.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {budgets.map(budget => {
                        const isExpanded = expandedId === budget.id;
                        const status = STATUS_MAP[budget.status] || STATUS_MAP.PENDING;
                        const budgetTotal = budget.items.reduce((acc, i) => acc + (parseFloat(i.price) * (i.quantity || 1) * (1 - (i.discount || 0) / 100)), 0);
                        const paidTotal = (budget.payments || []).reduce((acc, p) => acc + parseFloat(p.amount), 0);
                        const balance = budgetTotal - paidTotal;

                        return (
                            <motion.div key={budget.id} layout className={cn("bg-white rounded-[32px] border transition-all overflow-hidden", isExpanded ? "border-indigo-200 shadow-xl" : "border-slate-100 shadow-sm")}>
                                <div className="p-6 cursor-pointer flex items-center justify-between" onClick={() => setExpandedId(isExpanded ? null : budget.id)}>
                                    <div className="flex items-center gap-5">
                                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", isExpanded ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400")}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-slate-800 tracking-tight">{budget.name || `Presupuesto #${budget.id}`}</h3>
                                                <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", status.color)}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {new Date(budget.createdAt).toLocaleDateString()} · Dr. {budget.doctor?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Saldo Pendiente</p>
                                            <p className={cn("text-xl font-black leading-none tracking-tighter", balance <= 0 ? "text-emerald-500" : "text-slate-900")}>
                                                S/ {balance.toFixed(2)}
                                            </p>
                                        </div>
                                        <ChevronDown size={20} className={cn("transition-transform text-slate-300", isExpanded && "rotate-180")} />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-slate-50 bg-slate-50/30">
                                            <div className="p-8 space-y-8">
                                                {/* Summary Cards */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Plan</p>
                                                        <p className="text-lg font-black text-slate-800">S/ {budgetTotal.toFixed(2)}</p>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-400">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pagado</p>
                                                        <p className="text-lg font-black text-emerald-600">S/ {paidTotal.toFixed(2)}</p>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-indigo-400">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Por Pagar</p>
                                                        <p className="text-lg font-black text-indigo-600">S/ {balance.toFixed(2)}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleExportPDF(budget)} className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-50 transition-all text-slate-600">
                                                            <Printer size={16} className="mb-1" />
                                                            <span className="text-[9px] font-black uppercase">Imprimir</span>
                                                        </button>
                                                        <button className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-50 transition-all text-slate-600">
                                                            <Download size={16} className="mb-1" />
                                                            <span className="text-[9px] font-black uppercase">PDF</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Items Table */}
                                                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-slate-50 text-slate-400">
                                                            <tr>
                                                                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest">Procedimiento</th>
                                                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-center">Diente</th>
                                                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-center">Cant.</th>
                                                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-right">Precio</th>
                                                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-right">Subtotal</th>
                                                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-center">Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {budget.items.map(item => (
                                                                <tr key={item.id} className="text-xs">
                                                                    <td className="px-6 py-4 font-bold text-slate-700">{item.service?.name}</td>
                                                                    <td className="px-4 py-4 text-center font-black text-slate-400">{item.toothNumber || '—'}</td>
                                                                    <td className="px-4 py-4 text-center">x{item.quantity}</td>
                                                                    <td className="px-4 py-4 text-right">S/ {parseFloat(item.price).toFixed(2)}</td>
                                                                    <td className="px-4 py-4 text-right font-black">S/ {(item.price * item.quantity * (1 - (item.discount || 0) / 100)).toFixed(2)}</td>
                                                                    <td className="px-4 py-4 text-center">
                                                                        <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", 
                                                                            item.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100")}>
                                                                            {item.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Payments & Billing Row */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <DollarSign size={14} /> Registro de Pagos / Abonos
                                                        </h4>
                                                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                                                            <div className="flex gap-4">
                                                                <div className="flex-1 space-y-1">
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Monto a pagar</label>
                                                                    <input 
                                                                        type="number" className="premium-input text-sm" placeholder="S/ 0.00" 
                                                                        value={paymentForm.budgetId === budget.id ? paymentForm.amount : ''}
                                                                        onChange={e => setPaymentForm({ ...paymentForm, budgetId: budget.id, amount: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 space-y-1">
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Método</label>
                                                                    <select 
                                                                        className="premium-input text-sm appearance-none"
                                                                        value={paymentForm.budgetId === budget.id ? paymentForm.method : 'CASH'}
                                                                        onChange={e => setPaymentForm({ ...paymentForm, budgetId: budget.id, method: e.target.value })}
                                                                    >
                                                                        <option value="CASH">Efectivo</option>
                                                                        <option value="CARD">Tarjeta</option>
                                                                        <option value="TRANSFER">Transferencia</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleRegisterPayment(budget.id)}
                                                                className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-[0.98]"
                                                            >
                                                                Registrar Abono
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <FileText size={14} /> Facturación Electrónica
                                                        </h4>
                                                        <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl space-y-4">
                                                            <p className="text-[10px] text-slate-400 font-medium">Generar boleta o factura por el total o un monto específico de este plan.</p>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button 
                                                                    onClick={() => handleCreateInvoice(budget, 'BOLETA')}
                                                                    className="py-3 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                                                                >
                                                                    Generar Boleta
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleCreateInvoice(budget, 'FACTURA')}
                                                                    className="py-3 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                                                                >
                                                                    Generar Factura
                                                                </button>
                                                            </div>
                                                            <div className="pt-2 flex items-center gap-2 text-[9px] text-amber-400 font-bold uppercase tracking-widest">
                                                                <Info size={12} /> Requiere datos fiscales del paciente
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BudgetModule;
            )}
        </div>
    );
};

export default BudgetModule;
