import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, FileText, Download, Trash2, Edit3, ChevronDown,
    ChevronUp, CheckCircle, Clock, AlertCircle, Printer,
    DollarSign, User
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
        services, updateBudgetItem, deleteBudgetItem
    } = useBudgetStore();

    const [expandedId, setExpandedId] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        if (patientId) {
            fetchBudgets(patientId);
            fetchServices();
        }
    }, [patientId, fetchBudgets, fetchServices]);

    const handleExportPDF = (budget) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(51, 78, 104);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("PRESUPUESTO DENTAL", 20, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha: ${new Date(budget.createdAt).toLocaleDateString()}`, pageWidth - 60, 20);
        doc.text(`ID: #P-${budget.id}`, pageWidth - 60, 26);

        // Patient & Doctor Info
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.text("INFORMACIÓN DEL PACIENTE", 20, 55);
        doc.setLineWidth(0.5);
        doc.line(20, 57, 80, 57);

        doc.setFontSize(10);
        doc.text(`Paciente: ${patientName}`, 20, 65);
        doc.text(`Doctor: ${budget.doctor?.name || 'Dr. Asignado'}`, 20, 71);

        // Table
        const tableData = budget.items.map(item => [
            item.toothNumber ? `Pieza ${item.toothNumber}` : '—',
            item.service?.name || 'Servicio no especificado',
            `S/ ${parseFloat(item.price).toFixed(2)}`,
            '0%',
            `S/ ${parseFloat(item.price).toFixed(2)}`
        ]);

        doc.autoTable({
            startY: 85,
            head: [['DIENTE', 'PROCEDIMIENTO', 'PRECIO', 'DESC.', 'TOTAL']],
            body: tableData,
            headStyles: { fillStyle: [51, 78, 104], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { left: 20, right: 20 },
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        const total = budget.items.reduce((acc, i) => acc + parseFloat(i.price), 0);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL GENERAL: S/ ${total.toFixed(2)}`, pageWidth - 80, finalY + 10);

        // Footer
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("Este presupuesto tiene una validez de 30 días calendario.", 20, doc.internal.pageSize.getHeight() - 20);

        doc.save(`Presupuesto_${patientName.replace(' ', '_')}_${budget.id}.pdf`);
    };

    if (loading && budgets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                <div className="h-10 w-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Cargando Presupuestos...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 max-h-full overflow-y-auto">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Presupuestos y Pagos</h2>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Historial de planes de tratamiento para este paciente</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                    <Plus size={16} /> Nuevo Plan
                </button>
            </div>

            {budgets.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-200 mb-6">
                        <FileText size={40} />
                    </div>
                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">No hay presupuestos</h3>
                    <p className="text-sm font-medium text-slate-300 mt-2 max-w-xs">Puedes generar uno automáticamente desde el odontograma o crear uno manualmente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {budgets.map(budget => {
                        const isExpanded = expandedId === budget.id;
                        const status = STATUS_MAP[budget.status] || STATUS_MAP.PENDING;
                        const total = budget.items.reduce((acc, i) => acc + parseFloat(i.price), 0);

                        return (
                            <motion.div
                                key={budget.id}
                                layout
                                className={cn(
                                    "bg-white rounded-[32px] border transition-all overflow-hidden",
                                    isExpanded ? "border-indigo-200 shadow-xl" : "border-slate-100 hover:border-slate-300 shadow-sm"
                                )}
                            >
                                {/* Header */}
                                <div
                                    className="p-6 cursor-pointer flex items-center justify-between"
                                    onClick={() => setExpandedId(isExpanded ? null : budget.id)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner",
                                            isExpanded ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"
                                        )}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-slate-800 tracking-tight">Presupuesto #{budget.id}</h3>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    status.color
                                                )}>
                                                    <div className="flex items-center gap-1.5">
                                                        <status.icon size={10} />
                                                        {status.label}
                                                    </div>
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {new Date(budget.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })} · Dr. {budget.doctor?.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Total Presupuestado</p>
                                            <p className="text-xl font-black text-slate-900 leading-none tracking-tighter">S/ {total.toFixed(2)}</p>
                                        </div>
                                        <div className={cn("p-2 rounded-xl border transition-colors", isExpanded ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-slate-50 border-slate-100 text-slate-400")}>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Expanded */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-100 bg-slate-50/50"
                                        >
                                            <div className="p-8">
                                                <div className="mb-6 flex items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                                                    <div className="flex-1 relative group">
                                                        <select
                                                            onChange={(e) => {
                                                                const sId = parseInt(e.target.value);
                                                                const service = services.find(s => s.id === sId);
                                                                if (service) {
                                                                    const { addManualItemToBudget } = useBudgetStore.getState();
                                                                    addManualItemToBudget(budget.id, service, patientId);
                                                                }
                                                                e.target.value = "";
                                                            }}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold text-slate-600 outline-none focus:border-indigo-300 transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="">+ AGREGAR SERVICIO RÁPIDO...</option>
                                                            {services.map(s => (
                                                                <option key={s.id} value={s.id}>{s.name} - S/ {s.price.toFixed(2)}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                                                            <Plus size={14} />
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">Acceso directos al catálogo</p>
                                                </div>

                                                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="bg-slate-800 text-white">
                                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Procedimiento</th>
                                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center">Diente</th>
                                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-right">Precio</th>
                                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center">Cant.</th>
                                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-right">Subtotal</th>
                                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center">Estado</th>
                                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {budget.items.map(item => {
                                                                const isEditing = editingItem?.id === item.id;
                                                                const subtotal = (parseFloat(item.price) * (item.quantity || 1));
                                                                return (
                                                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                                        <td className="px-6 py-4">
                                                                            {isEditing ? (
                                                                                <div className="space-y-2">
                                                                                    <p className="text-xs font-bold text-slate-700">{item.service?.name}</p>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={editingItem.notes || ''}
                                                                                        onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                                                                                        className="w-full text-[10px] p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-300"
                                                                                        placeholder="Añadir nota..."
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-slate-700">{item.service?.name}</p>
                                                                                    {item.notes && <p className="text-[10px] text-slate-400 mt-1 italic">{item.notes}</p>}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-6 py-4 text-center">
                                                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 border border-slate-200 uppercase">
                                                                                {item.toothNumber ? `Diente ${item.toothNumber}` : '—'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-right">
                                                                            {isEditing ? (
                                                                                <div className="flex items-center justify-end gap-1">
                                                                                    <span className="text-[10px] font-black text-slate-400">S/</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={editingItem.price}
                                                                                        onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                                                                                        className="w-20 text-right text-[12px] font-black p-1 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-[13px] font-black text-slate-800">S/ {parseFloat(item.price).toFixed(2)}</p>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-6 py-4 text-center">
                                                                            {isEditing ? (
                                                                                <input
                                                                                    type="number"
                                                                                    value={editingItem.quantity || 1}
                                                                                    onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                                                                                    className="w-12 text-center text-[12px] font-black p-1 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                                                                />
                                                                            ) : (
                                                                                <p className="text-xs font-bold text-slate-600">x{item.quantity || 1}</p>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-6 py-4 text-right">
                                                                            <p className="text-[13px] font-black text-indigo-600">S/ {subtotal.toFixed(2)}</p>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-center">
                                                                            <select
                                                                                value={item.status}
                                                                                onChange={(e) => updateBudgetItem(item.id, { status: e.target.value })}
                                                                                className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-slate-300 transition-colors"
                                                                            >
                                                                                <option value="PENDING">Pendiente</option>
                                                                                <option value="IN_PROGRESS">En curso</option>
                                                                                <option value="COMPLETED">Finalizado</option>
                                                                            </select>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex justify-center gap-2">
                                                                                {isEditing ? (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                updateBudgetItem(item.id, {
                                                                                                    price: editingItem.price,
                                                                                                    notes: editingItem.notes,
                                                                                                    quantity: editingItem.quantity
                                                                                                });
                                                                                                setEditingItem(null);
                                                                                            }}
                                                                                            className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg shadow-sm hover:bg-indigo-700 transition-all font-black"
                                                                                        >
                                                                                            Listo
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => setEditingItem(null)}
                                                                                            className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-lg hover:bg-slate-200 transition-all font-black font-black"
                                                                                        >
                                                                                            X
                                                                                        </button>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() => setEditingItem({ ...item })}
                                                                                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl"
                                                                                        >
                                                                                            <Edit3 size={14} />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                if (confirm('¿Eliminar este procedimiento del plan?')) deleteBudgetItem(item.id);
                                                                                            }}
                                                                                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl"
                                                                                        >
                                                                                            <Trash2 size={14} />
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>

                                                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                                                        <div className="flex-1 flex items-center gap-4">
                                                            <div className="relative flex-1 group">
                                                                <select
                                                                    onChange={(e) => {
                                                                        const sId = parseInt(e.target.value);
                                                                        const service = services.find(s => s.id === sId);
                                                                        if (service) {
                                                                            const { addManualItemToBudget } = useBudgetStore.getState();
                                                                            addManualItemToBudget(budget.id, service, patientId);
                                                                        }
                                                                        e.target.value = "";
                                                                    }}
                                                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold text-slate-600 outline-none focus:border-indigo-300 transition-all appearance-none cursor-pointer"
                                                                >
                                                                    <option value="">+ AGREGAR SERVICIO MANUALMENTE...</option>
                                                                    {services.map(s => (
                                                                        <option key={s.id} value={s.id}>{s.name} - S/ {s.price.toFixed(2)}</option>
                                                                    ))}
                                                                </select>
                                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                                                                    <Plus size={14} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic pr-4">Puedes agregar servicios directamente sin usar el odontograma</p>
                                                    </div>
                                                </div>

                                                <div className="mt-8 flex justify-between items-center">
                                                    <div className="space-y-4">
                                                        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Generado por</p>
                                                                <div className="flex items-center gap-2 text-slate-700">
                                                                    <User size={14} />
                                                                    <span className="text-xs font-bold font-black">{budget.doctor?.name}</span>
                                                                </div>
                                                            </div>
                                                            <div className="h-8 w-[1px] bg-slate-100" />
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Paciente</p>
                                                                <span className="text-xs font-bold text-slate-700">{patientName}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExportPDF(budget);
                                                            }}
                                                            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[24px] shadow-xl hover:bg-indigo-700 transition-all font-black uppercase text-[11px] tracking-widest active:scale-95"
                                                        >
                                                            <Download size={18} /> Exportar Presupuesto
                                                        </button>
                                                        <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-[24px] hover:text-slate-800 transition-all active:scale-95">
                                                            <Printer size={20} />
                                                        </button>
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
