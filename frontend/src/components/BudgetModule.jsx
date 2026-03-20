import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, FileText, Download, Trash2, Edit3, ChevronDown,
    ChevronUp, CheckCircle, Clock, AlertCircle, Printer,
    DollarSign, User, X, Search, Save, Info, Tag, Percent
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import useBudgetStore from '../store/useBudgetStore';
import usePatientStore from '../store/usePatientStore';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const STATUS_MAP = {
    PENDING: { label: 'Pendiente', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock },
    APPROVED: { label: 'Aprobado', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle },
    PARTIAL_PAYMENT: { label: 'Pago Parcial', color: 'bg-sky-50 text-sky-600 border-sky-100', icon: DollarSign },
    PENDING_PAYMENT: { label: 'Pend. Pago', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: DollarSign },
    PAID: { label: 'Pagado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    REJECTED: { label: 'Rechazado', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: AlertCircle },
    COMPLETED: { label: 'Completado', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: CheckCircle },
};

const ITEM_STATUS = {
    PENDING: { label: 'Pendiente', cls: 'bg-slate-50 text-slate-400 border-slate-200' },
    COMPLETED: { label: 'Terminado', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    INVOICED: { label: '✓ Facturado', cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
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
    const [activeInvoice, setActiveInvoice] = useState(null);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [company, setCompany] = useState(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceError, setInvoiceError] = useState('');
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [billingForm, setBillingForm] = useState(null);
    const [activePaymentTab, setActivePaymentTab] = useState('EFECTIVO');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const { patient } = usePatientStore();

    useEffect(() => {
        if (patientId) {
            fetchBudgets(patientId);
            fetchServices();
            // Fetch company info for PDF/Printing
            api.get('company').then(res => setCompany(res.data)).catch(err => console.error('Error fetching company:', err));
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

    const handlePrepareInvoice = (budget, type, preSelectedIds = null) => {
        if (!budget || !budget.items) return;

        // Validar series en la sede
        const branch = budget.branch;
        if (!branch) {
            return alert('El presupuesto no tiene una sede asignada. No se puede generar el comprobante.');
        }

        if (type === 'BOLETA' && !branch.seriesBoleta) {
            return alert(`La sede "${branch.name}" no tiene configurada una serie para BOLETAS. Configúrela en Gestión de Clínica -> Series.`);
        }
        if (type === 'FACTURA' && !branch.seriesFactura) {
            return alert(`La sede "${branch.name}" no tiene configurada una serie para FACTURAS. Configúrela en Gestión de Clínica -> Series.`);
        }

        // Solo facturar ítems COMPLETED que aún no estén INVOICED
        const billableItems = budget.items.filter(i => i.status === 'COMPLETED');
        if (billableItems.length === 0) {
            return alert('No hay procedimientos "Terminados" disponibles para documentar. Marca al menos uno como Terminado antes de generar el comprobante.');
        }
        // Use pre-selected IDs if provided, otherwise all billable
        const idsToUse = preSelectedIds || billableItems.map(i => i.id);
        const items = billableItems.filter(i => idsToUse.includes(i.id));
        if (items.length === 0) return;

        const total = items.reduce((acc, i) => acc + (i.price * i.quantity * (1 - (i.discount || 0) / 100)), 0);
        const subtotal = total / 1.18;
        const igv = total - subtotal;

        setBillingForm({
            budget,
            type,
            razonSocial: patient?.firstName ? `${patient.firstName} ${patient.lastName || ''}`.trim() : '',
            tipoDocumento: patient?.documentType || 'DNI',
            nroDocumento: patient?.documentId || '',
            direccionCliente: patient?.address || '',
            email: patient?.email || '',
            items,
            itemIds: items.map(i => i.id),
            montoSinIgv: subtotal,
            igv,
            total,
            payments: [{
                id: Date.now(),
                method: 'CASH',
                currency: 'SOLES',
                amount: 0,
                change: 0,
                isComplete: false
            }]
        });
        setActivePaymentTab('EFECTIVO');
        setShowPaymentForm(false);
        setInvoiceError('');
        setShowBillingModal(true);
    };

    const handleLookupByDocument = async () => {
        if (!billingForm?.nroDocumento || billingForm.nroDocumento.length < 8) return;
        try {
            // Buscamos si el paciente ya tiene estos datos o si podemos jalarlos de la empresa/sunat
            // Por ahora, si es el mismo DNI del paciente, ya lo tenemos.
            // Si es otro, podríamos implementar una búsqueda real aquí.
            console.log('Buscando documento:', billingForm.nroDocumento);
        } catch (err) {
            console.error('Error en búsqueda de documento:', err);
        }
    };

    const handleAddPaymentRow = (method) => {
        const newPayment = {
            id: Date.now(),
            method,
            currency: 'SOLES',
            amount: 0,
            isComplete: false
        };

        if (method === 'CARD') {
            newPayment.cardType = '';
            newPayment.lot = '';
            newPayment.reference = '';
        } else if (method === 'APP') {
            newPayment.appType = 'YAPE';
            newPayment.reference = '';
        } else if (method === 'CASH') {
            newPayment.change = 0;
        }

        setBillingForm({
            ...billingForm,
            payments: [...billingForm.payments, newPayment]
        });
    };

    const handleRemovePaymentRow = (id) => {
        setBillingForm({
            ...billingForm,
            payments: billingForm.payments.filter(p => p.id !== id)
        });
    };

    const handleUpdatePayment = (id, updates) => {
        setBillingForm(current => {
            if (!current) return current;
            const newPayments = current.payments.map(p => {
                if (p.id === id) {
                    const updated = { ...p, ...updates };

                    // Si se marca "TODO", auto-completar con el saldo restante
                    if (updates.isComplete === true) {
                        const otherPaymentsTotal = current.payments
                            .filter(op => op.id !== id)
                            .reduce((acc, op) => acc + parseFloat(op.amount || 0), 0);
                        updated.amount = Math.max(0, current.total - otherPaymentsTotal);
                    }

                    if (updated.method === 'CASH') {
                        const paid = parseFloat(updated.amount || 0);
                        const otherPayments = current.payments
                            .filter(op => op.id !== id)
                            .reduce((acc, op) => acc + parseFloat(op.amount || 0), 0);
                        const remaining = current.total - otherPayments;
                        updated.change = paid > remaining ? paid - remaining : 0;
                    }
                    return updated;
                }
                return p;
            });
            return { ...current, payments: newPayments };
        });
    };

    const totalPaid = billingForm?.payments?.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0) || 0;
    const isPaymentReached = totalPaid >= (billingForm?.total || 0);

    const handleConfirmInvoice = async () => {
        setInvoiceLoading(true);
        setInvoiceError('');
        try {
            const payload = {
                type: billingForm.type,
                montoConIgv: billingForm.total,
                montoSinIgv: billingForm.montoSinIgv,
                igv: billingForm.igv,
                patientId,
                treatmentPlanId: billingForm.budget.id,
                razonSocial: billingForm.razonSocial,
                tipoDocumento: billingForm.tipoDocumento,
                nroDocumento: billingForm.nroDocumento,
                direccionCliente: billingForm.direccionCliente,
                email: billingForm.email,
                items: billingForm.items.map(i => ({
                    nombreProducto: `${i.service?.name}${i.toothNumber ? ` (Pieza ${i.toothNumber})` : ''}`,
                    cantidad: i.quantity,
                    total: i.price * i.quantity * (1 - (i.discount || 0) / 100),
                    serviceId: i.serviceId || i.service?.id,
                    toothNumber: i.toothNumber,
                })),
                itemIds: billingForm.itemIds,
                payments: billingForm.payments.filter(p => parseFloat(p.amount) > 0),
            };
            const res = await createInvoice(payload);
            if (res.ok) {
                setShowBillingModal(false);
                setActiveInvoice({
                    ...res.data,
                    total: res.data.montoConIgv,
                    items: billingForm.items,
                    budgetName: billingForm.budget.name
                });
                fetchBudgets(patientId);
            } else {
                setInvoiceError(res.error || 'Error al generar el comprobante');
            }
        } catch (err) {
            setInvoiceError(err?.response?.data?.message || 'Error al generar el comprobante');
        } finally {
            setInvoiceLoading(false);
        }
    };

    const handleCreateInvoice = async (budget, type) => {
        handlePrepareInvoice(budget, type);
    };

    const handleExportPDF = (budget, action = 'download') => {
        const doc = new jsPDF();

        // Clinic Header
        if (company?.logo) {
            try {
                // Assuming company.logo is a dataURI or accessible URL
                // jspdf needs base64 for images or we use a separate fetch
                // For now, let's use text header if logo fails or use it if it's base64
                doc.addImage(company.logo, 'PNG', 15, 10, 30, 30);
            } catch (e) {
                console.error('Error adding logo to PDF:', e);
            }
        }

        doc.setFontSize(22);
        doc.setTextColor(51, 78, 104);
        doc.text(company?.commercialName || "Presupuesto Dental", 50, 20);

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`RUC: ${company?.ruc || '20600000000'}`, 50, 26);
        doc.text(`${company?.address || 'Dirección no especificada'}`, 50, 31);
        doc.text(`Tel: ${company?.phone || '-'}`, 50, 36);

        // Divider
        doc.setDrawColor(241, 245, 249);
        doc.line(15, 45, 195, 45);

        // Patient Info
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text(`PACIENTE: ${patientName}`, 15, 55);
        doc.setFont("helvetica", "normal");
        doc.text(`FECHA: ${new Date(budget.createdAt).toLocaleDateString()}`, 15, 60);
        doc.text(`DOCTOR: ${budget.doctor?.name || 'No especificado'}`, 15, 65);

        const tableData = budget.items.map(i => [
            i.service?.name + (i.toothNumber ? ` (Pieza ${i.toothNumber})` : ''),
            i.quantity,
            `S/ ${parseFloat(i.price).toFixed(2)}`,
            `${i.discount || 0}%`,
            `S/ ${(i.price * i.quantity * (1 - (i.discount || 0) / 100)).toFixed(2)}`
        ]);

        const total = budget.items.reduce((acc, i) => acc + (i.price * i.quantity * (1 - (i.discount || 0) / 100)), 0);

        autoTable(doc, {
            startY: 75,
            head: [['Descripción de Servicio', 'Cant.', 'Precio Unit.', 'Dcto.', 'Subtotal']],
            body: tableData,
            foot: [['', '', '', 'TOTAL GENERAL', `S/ ${total.toFixed(2)}`]],
            theme: 'grid',
            headStyles: { fillColor: [51, 78, 104], fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8 },
            footStyles: { fillColor: [248, 250, 252], textColor: [30, 41, 59], fontStyle: 'bold', fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'center' },
                4: { halign: 'right' }
            }
        });

        const fileName = `Presupuesto_${patientName}_${budget.number ?? budget.id}.pdf`;
        if (action === 'print') {
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } else {
            doc.save(fileName);
        }
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
                                        <div className="flex items-center gap-3"><h3 className="font-black text-slate-800">{budget.name || `Presupuesto #${budget.number ?? budget.id}`}</h3><span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase border", status.color)}>{status.label}</span></div>
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
                                            {!budget.branch ? (
                                                <button 
                                                    onClick={async () => {
                                                        const res = await useBudgetStore.getState().updateTreatmentPlan(budget.id, {});
                                                        if (res) {
                                                            await fetchBudgets(patientId);
                                                            alert('Sede asignada correctamente.');
                                                        } else {
                                                            alert('Error al asignar sede. Verifique su conexión.');
                                                        }
                                                    }}
                                                    className="flex-1 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col items-center justify-center hover:bg-amber-100 text-amber-700 transition-all font-black"
                                                >
                                                    <AlertCircle size={16} />
                                                    <span className="text-[8px] font-black uppercase mt-1">Asignar Sede</span>
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleExportPDF(budget, 'print')} className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-50 text-slate-600 transition-all"><Printer size={16} /><span className="text-[8px] font-black uppercase mt-1">Imprimir</span></button>
                                                    <button onClick={() => handleExportPDF(budget, 'download')} className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-50 text-slate-600 transition-all"><Download size={16} /><span className="text-[8px] font-black uppercase mt-1">PDF</span></button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                                    <tr>
                                                        <th className="px-6 py-3">Procedimiento</th>
                                                        <th className="px-4 py-3 text-center">Cant.</th>
                                                        <th className="px-4 py-3 text-right">Precio</th>
                                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                                        <th className="px-4 py-3 text-center">Estado</th>
                                                        <th className="px-4 py-3"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-xs divide-y divide-slate-50">
                                                    {budget.items.map(item => (
                                                        <tr key={item.id} className={cn(item.status === 'COMPLETED' && "bg-emerald-50/30")}>
                                                            <td className="px-6 py-4 font-bold">
                                                                {item.service?.name} {item.toothNumber && `(D. ${item.toothNumber})`}
                                                            </td>
                                                            <td className="px-4 py-4 text-center">
                                                                <input
                                                                    type="number"
                                                                    className="w-12 text-center p-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold"
                                                                    value={item.quantity}
                                                                    min="1"
                                                                    onChange={async (e) => {
                                                                        const val = parseInt(e.target.value) || 1;
                                                                        await useBudgetStore.getState().updateBudgetItem(item.id, { quantity: val });
                                                                        fetchBudgets(patientId);
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4 text-right">S/ {parseFloat(item.price).toFixed(2)}</td>
                                                            <td className="px-4 py-4 text-right font-black">
                                                                S/ {(item.price * item.quantity * (1 - (item.discount || 0) / 100)).toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-4 text-center">
                                                                <select
                                                                    value={item.status}
                                                                    onChange={async (e) => {
                                                                        await useBudgetStore.getState().updateBudgetItem(item.id, { status: e.target.value });
                                                                        fetchBudgets(patientId);
                                                                    }}
                                                                    className={cn(
                                                                        "px-2 py-1 rounded-lg text-[9px] font-black uppercase outline-none transition-all border cursor-pointer",
                                                                        item.status === 'COMPLETED'
                                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                                            : "bg-slate-50 text-slate-400 border-slate-200"
                                                                    )}
                                                                >
                                                                    <option value="PENDING">Pendiente</option>
                                                                    <option value="COMPLETED">Terminado</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                {item.status !== 'COMPLETED' && (
                                                                    <button
                                                                        onClick={() => { if (confirm('¿Eliminar ítem?')) useBudgetStore.getState().deleteBudgetItem(item.id); }}
                                                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* Row to add more services to existing budget */}
                                                    <tr className="bg-slate-50/50">
                                                        <td colSpan={6} className="px-6 py-3">
                                                            <div className="flex gap-4 items-center">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Añadir servicio:</span>
                                                                <select
                                                                    onChange={async (e) => {
                                                                        const s = services.find(sv => sv.id === parseInt(e.target.value));
                                                                        if (s) {
                                                                            await useBudgetStore.getState().addManualItemToBudget(budget.id, {
                                                                                serviceId: s.id,
                                                                                price: s.price,
                                                                                quantity: 1,
                                                                                notes: 'Agregado manualmente al plan'
                                                                            });
                                                                            fetchBudgets(patientId);
                                                                        }
                                                                        e.target.value = "";
                                                                    }}
                                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                                >
                                                                    <option value="">Seleccionar procedimiento adicional...</option>
                                                                    {services.map(s => <option key={s.id} value={s.id}>{s.name} - S/ {s.price}</option>)}
                                                                </select>
                                                            </div>
                                                        </td>
                                                    </tr>
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
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                                                    {budget.status === 'PENDING' ? (
                                                        <div className="space-y-3">
                                                            <p className="text-[10px] text-slate-500 font-medium">El paciente debe aceptar el presupuesto antes de facturar.</p>
                                                            <button
                                                                onClick={async () => {
                                                                    await useBudgetStore.getState().updateTreatmentPlan(budget.id, { status: 'APPROVED' });
                                                                    fetchBudgets(patientId);
                                                                }}
                                                                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                                            >
                                                                ✓ Aprobar Presupuesto
                                                            </button>
                                                        </div>
                                                    ) : (() => {
                                                        const completedItems = budget.items.filter(i => i.status === 'COMPLETED');
                                                        const invoicedItems = budget.items.filter(i => i.status === 'INVOICED');
                                                        const hasReady = completedItems.length > 0;
                                                        const completedTotal = completedItems.reduce((acc, i) => acc + (i.price * i.quantity * (1 - (i.discount || 0) / 100)), 0);
                                                        return (
                                                            <div className="space-y-3">
                                                                {hasReady && (
                                                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                                                                        <p className="text-[10px] font-black text-emerald-700">
                                                                            {completedItems.length} item{completedItems.length > 1 ? 's' : ''} listo{completedItems.length > 1 ? 's' : ''} · S/ {completedTotal.toFixed(2)}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {invoicedItems.length > 0 && (
                                                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
                                                                        <p className="text-[10px] font-bold text-indigo-700">
                                                                            ✓ {invoicedItems.length} ya facturado{invoicedItems.length > 1 ? 's' : ''}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {!hasReady && (
                                                                    <p className="text-[9px] text-slate-400 text-center py-1">
                                                                        Marca procedimientos como "Terminado" para documentarlos.
                                                                    </p>
                                                                )}
                                                                <div className="grid grid-cols-2 gap-2 pt-1">
                                                                    <button
                                                                        onClick={() => handlePrepareInvoice(budget, 'BOLETA')}
                                                                        disabled={!hasReady}
                                                                        className="py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    >
                                                                        📄 Boleta
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handlePrepareInvoice(budget, 'FACTURA')}
                                                                        disabled={!hasReady}
                                                                        className="py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    >
                                                                        🧾 Factura
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
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
            {/* Billing Form Modal Overlay */}
            <AnimatePresence>
                {showBillingModal && billingForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
                        >
                            {/* Header */}
                            <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">Generar Comprobante</h3>
                                        <div className="flex gap-1.5 mt-1">
                                            {['BOLETA', 'FACTURA'].map(t => (
                                                <button key={t}
                                                    onClick={() => setBillingForm({ ...billingForm, type: t, tipoDocumento: t === 'FACTURA' ? 'RUC' : 'DNI' })}
                                                    className={cn(
                                                        'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider transition-all border',
                                                        billingForm.type === t
                                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                                                    )}
                                                >{t} ELECTRÓNICA</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowBillingModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="overflow-y-auto max-h-[75vh]">

                                {/* ① Datos del Cliente */}
                                <div className="px-7 pt-6 pb-5 space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">① Datos del Cliente</p>
                                    <div className="flex gap-3">
                                        <select
                                            value={billingForm.tipoDocumento}
                                            onChange={e => setBillingForm({ ...billingForm, tipoDocumento: e.target.value })}
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-black text-indigo-700 outline-none focus:border-indigo-300 shrink-0"
                                        >
                                            <option value="DNI">DNI</option>
                                            <option value="RUC">RUC</option>
                                            <option value="CE">C.E.</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={billingForm.nroDocumento}
                                            onChange={e => setBillingForm({ ...billingForm, nroDocumento: e.target.value })}
                                            onBlur={handleLookupByDocument}
                                            placeholder="Número de documento..."
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition-all"
                                        />
                                        <button
                                            onClick={handleLookupByDocument}
                                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shrink-0"
                                        >Buscar</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre / Razón Social</label>
                                            <input
                                                type="text"
                                                value={billingForm.razonSocial}
                                                onChange={e => setBillingForm({ ...billingForm, razonSocial: e.target.value })}
                                                placeholder="Nombre del cliente..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email <span className="normal-case font-medium">(opcional)</span></label>
                                            <input
                                                type="email"
                                                value={billingForm.email}
                                                onChange={e => setBillingForm({ ...billingForm, email: e.target.value })}
                                                placeholder="correo@ejemplo.com"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dirección <span className="normal-case font-medium">(opcional)</span></label>
                                            <input
                                                type="text"
                                                value={billingForm.direccionCliente}
                                                onChange={e => setBillingForm({ ...billingForm, direccionCliente: e.target.value })}
                                                placeholder="Dirección fiscal..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mx-7 border-t border-dashed border-slate-200" />

                                {/* ② Detalle de Servicios */}
                                <div className="px-7 pt-5 pb-5 space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">② Detalle de Servicios</p>
                                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-5 py-3">Descripción</th>
                                                    <th className="px-4 py-3 text-center">Cant.</th>
                                                    <th className="px-5 py-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                                                {billingForm.items.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-5 py-3">
                                                            {item.service?.name}
                                                            {item.toothNumber && <span className="ml-1 text-slate-400 font-medium text-xs">(Pieza {item.toothNumber})</span>}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-slate-500">{item.quantity}</td>
                                                        <td className="px-5 py-3 text-right text-indigo-700 font-black">
                                                            S/ {(item.price * item.quantity * (1 - (item.discount || 0) / 100)).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-between items-center">
                                            <div className="flex gap-5 text-[11px] text-slate-500">
                                                <span>Subtotal: <span className="font-black text-slate-700">S/ {billingForm.montoSinIgv.toFixed(2)}</span></span>
                                                <span>IGV 18%: <span className="font-black text-slate-700">S/ {billingForm.igv.toFixed(2)}</span></span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total a Pagar</p>
                                                <p className="text-2xl font-black text-slate-900 tabular-nums">S/ {billingForm.total.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mx-7 border-t border-dashed border-slate-200" />

                                {/* ③ Forma de Pago */}
                                <div className="px-7 pt-5 pb-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">③ Forma de Pago</p>
                                        {!isPaymentReached && (
                                            <button
                                                onClick={() => setShowPaymentForm(v => !v)}
                                                className={cn(
                                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all',
                                                    showPaymentForm ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                                                )}
                                            >
                                                {showPaymentForm ? <X size={12} /> : <Plus size={12} />}
                                                {showPaymentForm ? 'Cerrar' : 'Agregar pago'}
                                            </button>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {showPaymentForm && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {[
                                                        { id: 'EFECTIVO', method: 'CASH', icon: '💵' },
                                                        { id: 'TARJETA', method: 'CARD', icon: '💳' },
                                                        { id: 'TRANSFERENCIA', method: 'TRANSFER', icon: '🏦' },
                                                        { id: 'APLICATIVO', method: 'APP', icon: '📱' },
                                                    ].map(tab => (
                                                        <button
                                                            key={tab.id}
                                                            onClick={() => {
                                                                setActivePaymentTab(tab.id);
                                                                const hasRows = billingForm.payments.some(p => p.method === tab.method);
                                                                if (!hasRows && !isPaymentReached) handleAddPaymentRow(tab.method);
                                                            }}
                                                            className={cn(
                                                                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black border transition-all',
                                                                activePaymentTab === tab.id
                                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                                            )}
                                                        >
                                                            <span>{tab.icon}</span> {tab.id}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="space-y-3">
                                                    {billingForm.payments
                                                        .filter(p => p.method === (
                                                            activePaymentTab === 'EFECTIVO' ? 'CASH' :
                                                                activePaymentTab === 'TARJETA' ? 'CARD' :
                                                                    activePaymentTab === 'TRANSFERENCIA' ? 'TRANSFER' : 'APP'
                                                        ))
                                                        .map(p => (
                                                            <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-end gap-3">
                                                                <div className="space-y-1">
                                                                    <label className="text-[9px] font-black text-slate-400 uppercase block">Moneda</label>
                                                                    <select value={p.currency} onChange={e => handleUpdatePayment(p.id, { currency: e.target.value })} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black text-slate-700 outline-none focus:border-indigo-300">
                                                                        <option value="SOLES">S/ Soles</option>
                                                                        <option value="DOLARES">$ Dólares</option>
                                                                    </select>
                                                                </div>
                                                                {activePaymentTab === 'TARJETA' && (<>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase block">Tarjeta</label>
                                                                        <select value={p.cardType} onChange={e => handleUpdatePayment(p.id, { cardType: e.target.value })} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black text-slate-700 outline-none focus:border-indigo-300">
                                                                            <option value="">Tipo...</option>
                                                                            <option value="VISA">VISA</option>
                                                                            <option value="MASTERCARD">MASTERCARD</option>
                                                                            <option value="AMEX">AMEX</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase block">N° Lote</label>
                                                                        <input type="text" value={p.lot} onChange={e => handleUpdatePayment(p.id, { lot: e.target.value })} placeholder="Lote..." className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:border-indigo-300 outline-none" />
                                                                    </div>
                                                                </>)}
                                                                {activePaymentTab === 'APLICATIVO' && (
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase block">App</label>
                                                                        <select value={p.appType} onChange={e => handleUpdatePayment(p.id, { appType: e.target.value })} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black text-slate-700 outline-none focus:border-indigo-300">
                                                                            <option value="YAPE">YAPE</option>
                                                                            <option value="PLIN">PLIN</option>
                                                                        </select>
                                                                    </div>
                                                                )}
                                                                {activePaymentTab !== 'EFECTIVO' && (
                                                                    <div className="space-y-1 flex-1 min-w-[140px]">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase block">N° Operación</label>
                                                                        <input type="text" value={p.reference} onChange={e => handleUpdatePayment(p.id, { reference: e.target.value })} placeholder="Referencia..." className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:border-indigo-300 outline-none" />
                                                                    </div>
                                                                )}
                                                                <div className="space-y-1">
                                                                    <label className="text-[9px] font-black text-slate-400 uppercase block">Monto</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <label className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1.5 cursor-pointer" title="Todo el total">
                                                                            <input type="checkbox" checked={p.isComplete} onChange={e => handleUpdatePayment(p.id, { isComplete: e.target.checked })} className="w-3.5 h-3.5 rounded text-indigo-600" />
                                                                            <span className="text-[8px] font-black text-slate-400 uppercase">Todo</span>
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={p.amount}
                                                                            disabled={p.isComplete}
                                                                            onChange={e => handleUpdatePayment(p.id, { amount: e.target.value })}
                                                                            className={cn(
                                                                                'w-28 border rounded-xl px-3 py-2 text-sm font-black text-center outline-none transition-all',
                                                                                p.isComplete ? 'bg-indigo-50 border-indigo-200 text-indigo-700 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-300'
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleRemovePaymentRow(p.id)} className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                                                                    <button disabled={isPaymentReached} onClick={() => handleAddPaymentRow(p.method)} className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-30"><Plus size={14} /></button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {billingForm.payments.some(p => parseFloat(p.amount) > 0) && (
                                        <div className="rounded-2xl border border-slate-200 overflow-hidden">
                                            {[
                                                { label: 'Efectivo (S/)', method: 'CASH', currency: 'SOLES', symbol: 'S/' },
                                                { label: 'Efectivo ($)', method: 'CASH', currency: 'DOLARES', symbol: '$' },
                                                { label: 'Tarjeta (S/)', method: 'CARD', currency: 'SOLES', symbol: 'S/' },
                                                { label: 'Tarjeta ($)', method: 'CARD', currency: 'DOLARES', symbol: '$' },
                                                { label: 'Transferencia (S/)', method: 'TRANSFER', currency: 'SOLES', symbol: 'S/' },
                                                { label: 'Transferencia ($)', method: 'TRANSFER', currency: 'DOLARES', symbol: '$' },
                                                { label: 'App (Yape/Plin)', method: 'APP', currency: 'SOLES', symbol: 'S/' },
                                            ].filter(item => {
                                                const amount = billingForm.payments.filter(p => p.method === item.method && p.currency === item.currency).reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);
                                                return amount > 0;
                                            }).map(item => {
                                                const amount = billingForm.payments.filter(p => p.method === item.method && p.currency === item.currency).reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);
                                                return (
                                                    <div key={item.label} className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 last:border-0 bg-white">
                                                        <span className="text-[12px] font-bold text-slate-600">{item.label}</span>
                                                        <span className="text-[12px] font-black text-indigo-700 tabular-nums">{item.symbol} {amount.toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className={cn('flex items-center justify-between px-5 py-3', isPaymentReached ? 'bg-green-50' : 'bg-amber-50')}>
                                                <div>
                                                    <p className={cn('text-[10px] font-black uppercase tracking-widest', isPaymentReached ? 'text-green-600' : 'text-amber-600')}>
                                                        {isPaymentReached ? '✓ Pago completo' : 'Saldo pendiente'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Total: S/ {billingForm.total.toFixed(2)}</p>
                                                </div>
                                                <span className={cn('text-2xl font-black tabular-nums', isPaymentReached ? 'text-green-700' : 'text-amber-600')}>
                                                    S/ {Math.abs(billingForm.total - totalPaid).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/80">
                                {invoiceError && (
                                    <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                                        <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                                        <p className="text-[11px] font-bold text-red-700 leading-snug">{invoiceError}</p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleConfirmInvoice}
                                        disabled={!isPaymentReached || invoiceLoading}
                                        className="flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        {invoiceLoading ? (
                                            <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Procesando...</>
                                        ) : isPaymentReached ? (
                                            <><DollarSign size={16} /> Emitir {billingForm.type === 'FACTURA' ? 'Factura' : 'Boleta'}</>
                                        ) : (
                                            <>Faltan S/ {(billingForm.total - totalPaid).toFixed(2)} por registrar</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowBillingModal(false)}
                                        className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                    >Cerrar</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Invoice Display Overlay */}
            <AnimatePresence>
                {activeInvoice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Comprobante Generado</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeInvoice.type} Electrónica</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveInvoice(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Emisor</p>
                                        <p className="text-sm font-black text-slate-800">CLÍNICA DENTAL SUIZASOFT</p>
                                        <p className="text-[10px] text-slate-500 font-medium">RUC: 20600000000</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Número</p>
                                        <p className="text-lg font-black text-indigo-600">{activeInvoice.number}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{new Date(activeInvoice.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-1">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cliente</p>
                                    <p className="text-sm font-black text-slate-800">{patientName}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{activeInvoice.budgetName}</p>
                                </div>

                                <table className="w-full">
                                    <thead className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="text-left pb-4">Descripción</th>
                                            <th className="text-center pb-4">Cant.</th>
                                            <th className="text-right pb-4">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-bold text-slate-600 divide-y divide-slate-100">
                                        {activeInvoice.items?.map(item => (
                                            <tr key={item.id}>
                                                <td className="py-4">{item.service?.name} {item.toothNumber && `(Pieza ${item.toothNumber})`}</td>
                                                <td className="py-4 text-center">x{item.quantity}</td>
                                                <td className="py-4 text-right">S/ {(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Gracias por su confianza</p>
                                        <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                                            <Tag className="text-slate-200" size={32} />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                                        <p className="text-4xl font-black text-slate-800 tracking-tighter">S/ {parseFloat(activeInvoice.total).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 py-4 bg-slate-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
                                >
                                    <Printer size={18} /> Imprimir Comprobante
                                </button>
                                <button
                                    onClick={() => setActiveInvoice(null)}
                                    className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BudgetModule;
