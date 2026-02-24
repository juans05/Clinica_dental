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
        services, createBudget, registerPayment, createInvoice
    } = useBudgetStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [createForm, setCreateForm] = useState({
        name: '', doctorId: user?.id || '', items: [], notesPatient: '', notesInternal: '', discount: 0
    });
    const [paymentForm, setPaymentForm] = useState({ budgetId: null, amount: '', method: 'CASH' });

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
                serviceId: service.id, name: service.name, price: service.price,
                quantity: 1, discount: 0, toothNumber: '', comment: ''
            }]
        }));
    };

    const handleUpdateFormItem = (idx, field, value) => {
        setCreateForm(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
        }));
    };

    const calculateSubtotal = (item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        const discount = parseFloat(item.discount) || 0;
        return (price * qty) * (1 - discount / 100);
    };

    const handleSaveBudget = async () => {
        if (createForm.items.length === 0) return alert('Agregue al menos un servicio');
        const res = await createBudget(patientId, createForm.doctorId, createForm.items);
        if (res) {
            setShowCreateModal(false);
            setCreateForm({ name: '', doctorId: user?.id || '', items: [], notesPatient: '', notesInternal: '', discount: 0 });
            fetchBudgets(patientId);
        }
    };

    const handleRegisterPayment = async (budgetId) => {
        if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) return alert('Monto inválido');
        const res = await registerPayment({
            amount: parseFloat(paymentForm.amount),
            method: paymentForm.method,
            treatmentPlanId: budgetId,
            patientId
        });
        if (res) {
            setPaymentForm({ budgetId: null, amount: '', method: 'CASH' });
            fetchBudgets(patientId);
            alert('Pago registrado');
        }
    };

    const handleCreateInvoice = async (budget, type) => {
        const total = budget.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        const res = await createInvoice({
            number: `${type === 'BOLETA' ? 'B' : 'F'}${Date.now().toString().slice(-6)}`,
            type, total, patientId, treatmentPlanId: budget.id
        });
        if (res) {
            fetchBudgets(patientId);
            alert(`${type} generada: ${res.number}`);
        }
    };

    const handleExportPDF = (budget) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Presupuesto Dental", 15, 20);
        doc.setFontSize(10);
        doc.text(`Paciente: ${patientName}`, 15, 30);
        doc.text(`Fecha: ${new Date(budget.createdAt).toLocaleDateString()}`, 15, 35);

        const tableData = budget.items.map(i => [
            i.service?.name,
            i.toothNumber || '-',
            i.quantity,
            `S/ ${parseFloat(i.price).toFixed(2)}`,
            `S/ ${(i.price * i.quantity * (1 - (i.discount || 0) / 100)).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Servicio', 'Diente', 'Cant.', 'Precio', 'Subtotal']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [51, 78, 104] }
        });

        doc.save(`Presupuesto_${patientName}_${budget.id}.pdf`);
    };

    const budgetTotal = createForm.items.reduce((acc, i) => acc + calculateSubtotal(i), 0);

    return (
        <div className="p-8 space-y-6 max-h-full overflow-y-auto bg-slate-50/10">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Presupuestos y Pagos</h2>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Gestión integral de planes y facturación</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
                    <Plus size={16} /> Nuevo Presupuesto
                </button>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden relative z-10">
                        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Crear presupuesto</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paciente</label><div className="premium-input bg-slate-50 font-bold">{patientName}</div></div>
                                <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre del presupuesto</label><input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="premium-input" placeholder="Ej. Rehabilitación" /></div>
                                <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Doctor</label><select value={createForm.doctorId} onChange={e => setCreateForm({ ...createForm, doctorId: e.target.value })} className="premium-input"><option value={user?.id}>{user?.name}</option></select></div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Agregar servicios</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <select onChange={e => { const s = services.find(sv => sv.id === parseInt(e.target.value)); if (s) handleAddItem(s); e.target.value = ""; }} className="premium-input pl-12 appearance-none">
                                        <option value="">Buscar servicio...</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name} - S/ {s.price}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="rounded-[24px] border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest">
                                        <tr><th className="px-6 py-4">Item</th><th className="px-4 py-4 text-center">Diente</th><th className="px-4 py-4 text-center">Cant.</th><th className="px-4 py-4 text-right">Precio</th><th className="px-4 py-4 text-center">Dcto (%)</th><th className="px-4 py-4 text-right">Subtotal</th><th className="px-4 py-4"></th></tr>
                                    </thead>
                                    <tbody className="text-xs divide-y divide-slate-100">
                                        {createForm.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-bold">{item.name}</td>
                                                <td className="px-4 py-4"><input className="w-12 text-center p-1 bg-slate-50 rounded" value={item.toothNumber} onChange={e => handleUpdateFormItem(idx, 'toothNumber', e.target.value)} /></td>
                                                <td className="px-4 py-4"><input type="number" className="w-12 text-center p-1 bg-slate-50 rounded" value={item.quantity} onChange={e => handleUpdateFormItem(idx, 'quantity', e.target.value)} /></td>
                                                <td className="px-4 py-4 text-right">S/ {parseFloat(item.price).toFixed(2)}</td>
                                                <td className="px-4 py-4"><input className="w-12 text-center p-1 bg-slate-50 rounded mx-auto block" value={item.discount} onChange={e => handleUpdateFormItem(idx, 'discount', e.target.value)} /></td>
                                                <td className="px-4 py-4 text-right font-black">S/ {calculateSubtotal(item).toFixed(2)}</td>
                                                <td className="px-4 py-4"><button onClick={() => setCreateForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nota paciente</label><textarea value={createForm.notesPatient} onChange={e => setCreateForm({ ...createForm, notesPatient: e.target.value })} className="premium-input h-24 resize-none" /></div>
                                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nota interna</label><textarea value={createForm.notesInternal} onChange={e => setCreateForm({ ...createForm, notesInternal: e.target.value })} className="premium-input h-24 resize-none" /></div>
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[32px] space-y-4">
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest"><span>Total Bruto</span><span>S/ {budgetTotal.toFixed(2)}</span></div>
                                    <div className="pt-4 border-t border-slate-200 flex justify-between items-end"><span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total Presupuesto</span><span className="text-2xl font-black text-slate-900">S/ {budgetTotal.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="px-10 py-8 bg-slate-50 flex justify-end gap-4"><button onClick={() => setShowCreateModal(false)} className="px-6 py-2 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600">Cancelar</button><button onClick={handleSaveBudget} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"><Save size={18} /> Guardar</button></div>
                    </motion.div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {budgets.map(budget => {
                    const isExpanded = expandedId === budget.id;
                    const status = STATUS_MAP[budget.status] || STATUS_MAP.PENDING;
                    const total = budget.items.reduce((acc, i) => acc + (i.price * i.quantity * (1 - (i.discount || 0) / 100)), 0);
                    const paid = (budget.payments || []).reduce((acc, p) => acc + p.amount, 0);
                    const balance = total - paid;

                    return (
                        <motion.div key={budget.id} layout className={cn("bg-white rounded-[32px] border transition-all overflow-hidden", isExpanded ? "border-indigo-200 shadow-xl" : "border-slate-100 shadow-sm")}>
                            <div className="p-6 cursor-pointer flex items-center justify-between" onClick={() => setExpandedId(isExpanded ? null : budget.id)}>
                                <div className="flex items-center gap-5">
                                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", isExpanded ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400")}><FileText size={24} /></div>
                                    <div>
                                        <div className="flex items-center gap-3"><h3 className="font-black text-slate-800">{budget.name || `Presupuesto #${budget.id}`}</h3><span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase border", status.color)}>{status.label}</span></div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(budget.createdAt).toLocaleDateString()} · Dr. {budget.doctor?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo</p>
                                        <p className={cn("text-xl font-black tracking-tighter", balance <= 0 ? "text-emerald-500" : "text-slate-900")}>S/ {balance.toFixed(2)}</p>
                                    </div>
                                    <ChevronDown size={20} className={cn("text-slate-300 transition-transform", isExpanded && "rotate-180")} />
                                </div>
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-slate-50 bg-slate-50/20 p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p><p className="text-lg font-black text-slate-800">S/ {total.toFixed(2)}</p></div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-400"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pagado</p><p className="text-lg font-black text-emerald-600">S/ {paid.toFixed(2)}</p></div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-indigo-400"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Por Pagar</p><p className="text-lg font-black text-indigo-600">S/ {balance.toFixed(2)}</p></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleExportPDF(budget)} className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-50 text-slate-600 transition-all"><Printer size={16} /><span className="text-[8px] font-black uppercase mt-1">Imprimir</span></button>
                                                <button className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-50 text-slate-600 transition-all"><Download size={16} /><span className="text-[8px] font-black uppercase mt-1">PDF</span></button>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                                    <tr><th className="px-6 py-3">Procedimiento</th><th className="px-4 py-3 text-center">Cant.</th><th className="px-4 py-3 text-right">Precio</th><th className="px-4 py-3 text-right">Subtotal</th></tr>
                                                </thead>
                                                <tbody className="text-xs divide-y divide-slate-50">
                                                    {budget.items.map(item => (
                                                        <tr key={item.id}>
                                                            <td className="px-6 py-4 font-bold">{item.service?.name} {item.toothNumber && `(D. ${item.toothNumber})`}</td>
                                                            <td className="px-4 py-4 text-center">x{item.quantity}</td>
                                                            <td className="px-4 py-4 text-right">S/ {parseFloat(item.price).toFixed(2)}</td>
                                                            <td className="px-4 py-4 text-right font-black">S/ {(item.price * item.quantity * (1 - (item.discount || 0) / 100)).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} /> Registrar Abono</h4>
                                                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 space-y-1"><label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Monto</label><input type="number" className="premium-input text-sm" value={paymentForm.budgetId === budget.id ? paymentForm.amount : ''} onChange={e => setPaymentForm({ ...paymentForm, budgetId: budget.id, amount: e.target.value })} placeholder="0.00" /></div>
                                                        <div className="flex-1 space-y-1"><label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Método</label><select className="premium-input text-sm" value={paymentForm.budgetId === budget.id ? paymentForm.method : 'CASH'} onChange={e => setPaymentForm({ ...paymentForm, budgetId: budget.id, method: e.target.value })}><option value="CASH">Efectivo</option><option value="CARD">Tarjeta</option><option value="TRANSFER">Transf.</option></select></div>
                                                    </div>
                                                    <button onClick={() => handleRegisterPayment(budget.id)} className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-50 hover:bg-emerald-600 transition-all">Registrar Abono</button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Facturación</h4>
                                                <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl space-y-4">
                                                    <p className="text-[9px] text-slate-400 font-medium">Emitir comprobante electrónico por este plan.</p>
                                                    <div className="grid grid-cols-2 gap-3"><button onClick={() => handleCreateInvoice(budget, 'BOLETA')} className="py-3 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 border border-white/10">Boleta</button><button onClick={() => handleCreateInvoice(budget, 'FACTURA')} className="py-3 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 border border-white/10">Factura</button></div>
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
        </div>
    );
};

export default BudgetModule;
