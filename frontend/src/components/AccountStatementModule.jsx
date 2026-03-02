import React, { useEffect, useState } from 'react';
import {
    DollarSign, CreditCard, CheckCircle, AlertCircle, Clock,
    ChevronDown, ChevronRight, Receipt, Banknote, Smartphone,
    ArrowDownCircle, TrendingUp, FileText, Wallet
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../services/api';

const cn = (...inputs) => twMerge(clsx(inputs));

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `S/ ${(parseFloat(n) || 0).toFixed(2)}`;

const PLAN_STATUS = {
    PENDING:         { label: 'Pendiente',       color: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
    APPROVED:        { label: 'Aprobado',         color: 'bg-blue-50 text-blue-600',      dot: 'bg-blue-400' },
    COMPLETED:       { label: 'Terminado',        color: 'bg-emerald-50 text-emerald-600',dot: 'bg-emerald-400' },
    PAID:            { label: 'Pagado',           color: 'bg-emerald-50 text-emerald-700',dot: 'bg-emerald-500' },
    PARTIAL_PAYMENT: { label: 'Pago Parcial',     color: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-400' },
    PENDING_PAYMENT: { label: 'Por Cobrar',       color: 'bg-rose-50 text-rose-600',      dot: 'bg-rose-400' },
};

const METHOD_ICON = {
    CASH:     <Banknote size={13} />,
    CARD:     <CreditCard size={13} />,
    TRANSFER: <ArrowDownCircle size={13} />,
    APP:      <Smartphone size={13} />,
};
const METHOD_LABEL = {
    CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', APP: 'Aplicativo',
};

// ── Sub-componente: fila de pago ──────────────────────────────────────────────
const PaymentRow = ({ payment }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
        <div className="h-7 w-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
            {METHOD_ICON[payment.method] || <DollarSign size={13} />}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-700">
                {METHOD_LABEL[payment.method] || payment.method}
                {payment.appType && <span className="ml-1 text-slate-400">· {payment.appType}</span>}
                {payment.cardType && <span className="ml-1 text-slate-400">· {payment.cardType}</span>}
                {payment.reference && <span className="ml-1 text-slate-400">#{payment.reference}</span>}
            </p>
            <p className="text-[10px] text-slate-400">
                {new Date(payment.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                {payment.currency && payment.currency !== 'SOLES' && <span className="ml-1">· {payment.currency}</span>}
            </p>
        </div>
        <span className="text-[12px] font-black text-emerald-600 tabular-nums">{fmt(payment.amount)}</span>
    </div>
);

// ── Sub-componente: fila de comprobante ───────────────────────────────────────
const InvoiceRow = ({ invoice }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
        <div className="h-7 w-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0">
            <Receipt size={13} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-700">{invoice.number}</p>
            <p className="text-[10px] text-slate-400">
                {invoice.type} ·&nbsp;
                {new Date(invoice.fechaEmision || invoice.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest',
                invoice.status === 'EMITIDO' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            )}>
                {invoice.status}
            </span>
            <span className="text-[12px] font-black text-indigo-600 tabular-nums">{fmt(invoice.montoConIgv)}</span>
        </div>
    </div>
);

// ── Sub-componente: plan de tratamiento ───────────────────────────────────────
const PlanCard = ({ plan }) => {
    const [open, setOpen] = useState(false);
    const status = PLAN_STATUS[plan.status] || PLAN_STATUS.PENDING;
    const saldoPositivo = plan._saldo > 0;

    return (
        <div className={cn('rounded-2xl border transition-all', open ? 'border-indigo-200 shadow-md shadow-indigo-50' : 'border-slate-200 hover:border-indigo-200')}>
            {/* Header del plan */}
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center gap-4 p-4 text-left"
            >
                <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                    saldoPositivo ? 'bg-amber-50' : 'bg-emerald-50'
                )}>
                    {saldoPositivo
                        ? <AlertCircle size={16} className="text-amber-500" />
                        : <CheckCircle size={16} className="text-emerald-500" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[12px] font-black text-slate-800 truncate">
                            {plan.name || `Plan de Tratamiento #${plan.id}`}
                        </p>
                        <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0', status.color)}>
                            <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle', status.dot)} />
                            {status.label}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                        {plan.doctor?.name} ·&nbsp;
                        {new Date(plan.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })} ·&nbsp;
                        {plan.items.length} procedimiento{plan.items.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Montos resumen */}
                <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Total</p>
                    <p className="text-[13px] font-black text-slate-800 tabular-nums">{fmt(plan._totalPlan)}</p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Pagado</p>
                    <p className="text-[13px] font-black text-emerald-600 tabular-nums">{fmt(plan._totalPagado)}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Saldo</p>
                    <p className={cn('text-[13px] font-black tabular-nums', saldoPositivo ? 'text-rose-600' : 'text-emerald-600')}>
                        {saldoPositivo ? fmt(plan._saldo) : 'Pagado ✓'}
                    </p>
                </div>

                <ChevronDown size={14} className={cn('text-slate-400 transition-transform shrink-0', open && 'rotate-180')} />
            </button>

            {/* Detalle expandible */}
            {open && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
                    {/* Barra de progreso de pago */}
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                            <span className="font-bold">Progreso de pago</span>
                            <span>{plan._totalPlan > 0 ? Math.min(100, Math.round((plan._totalPagado / plan._totalPlan) * 100)) : 0}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn('h-full rounded-full transition-all', saldoPositivo ? 'bg-amber-400' : 'bg-emerald-400')}
                                style={{ width: `${plan._totalPlan > 0 ? Math.min(100, (plan._totalPagado / plan._totalPlan) * 100) : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Procedimientos */}
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Procedimientos</p>
                            <div className="space-y-1">
                                {plan.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                                        <div className={cn('h-2 w-2 rounded-full shrink-0',
                                            item.status === 'COMPLETED' ? 'bg-emerald-400' :
                                            item.status === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-slate-300'
                                        )} />
                                        <p className="text-[11px] text-slate-700 flex-1 truncate">{item.service?.name || 'Servicio'}</p>
                                        {item.toothNumber && <span className="text-[10px] text-slate-400">Diente {item.toothNumber}</span>}
                                        <span className="text-[11px] font-bold text-slate-600 tabular-nums shrink-0">
                                            {fmt(item.price * item.quantity * (1 - (item.discount || 0) / 100))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Pagos */}
                            {plan.payments.length > 0 ? (
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                        Pagos realizados ({plan.payments.length})
                                    </p>
                                    {plan.payments.map(p => <PaymentRow key={p.id} payment={p} />)}
                                </div>
                            ) : (
                                <div className="text-[11px] text-slate-400 italic py-2">Sin pagos registrados</div>
                            )}

                            {/* Comprobantes */}
                            {plan.invoices.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                        Comprobantes ({plan.invoices.length})
                                    </p>
                                    {plan.invoices.map(inv => <InvoiceRow key={inv.id} invoice={inv} />)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────
const AccountStatementModule = ({ patientId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!patientId) return;
        setLoading(true);
        api.get(`billing/patient/${patientId}/statement`)
            .then(r => { setData(r.data); setError(null); })
            .catch(e => setError(e?.response?.data?.message || 'Error al cargar estado de cuenta'))
            .finally(() => setLoading(false));
    }, [patientId]);

    if (loading) return (
        <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-3 p-6 bg-rose-50 rounded-2xl border border-rose-200 text-rose-700">
            <AlertCircle size={18} /> <p className="text-sm font-bold">{error}</p>
        </div>
    );

    if (!data) return null;

    const { plans, resumen } = data;
    const tieneDeuda = resumen.totalPendiente > 0.01;

    return (
        <div className="space-y-6">
            {/* ── Título ── */}
            <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Estado de Cuenta</h2>
                <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-widest">Resumen financiero del paciente</p>
            </div>

            {/* ── Tarjetas resumen ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total tratamientos */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <TrendingUp size={20} className="text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tratamientos</p>
                        <p className="text-xl font-black text-slate-900 tabular-nums mt-0.5">{fmt(resumen.totalPlanes)}</p>
                    </div>
                </div>

                {/* Total pagado */}
                <div className="bg-white rounded-2xl border border-emerald-200 p-5 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Wallet size={20} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pagado</p>
                        <p className="text-xl font-black text-emerald-600 tabular-nums mt-0.5">{fmt(resumen.totalPagado)}</p>
                    </div>
                </div>

                {/* Saldo pendiente */}
                <div className={cn('bg-white rounded-2xl border p-5 flex items-center gap-4',
                    tieneDeuda ? 'border-rose-200' : 'border-emerald-200'
                )}>
                    <div className={cn('h-11 w-11 rounded-2xl flex items-center justify-center shrink-0',
                        tieneDeuda ? 'bg-rose-50' : 'bg-emerald-50'
                    )}>
                        {tieneDeuda
                            ? <AlertCircle size={20} className="text-rose-500" />
                            : <CheckCircle size={20} className="text-emerald-500" />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Pendiente</p>
                        <p className={cn('text-xl font-black tabular-nums mt-0.5', tieneDeuda ? 'text-rose-600' : 'text-emerald-600')}>
                            {tieneDeuda ? fmt(resumen.totalPendiente) : 'Al día ✓'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Banner de estado global ── */}
            {tieneDeuda ? (
                <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <Clock size={16} className="text-amber-500 shrink-0" />
                    <p className="text-[11px] font-bold text-amber-700">
                        El paciente tiene un saldo pendiente de <strong>{fmt(resumen.totalPendiente)}</strong> por pagar.
                    </p>
                </div>
            ) : plans.length > 0 ? (
                <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <p className="text-[11px] font-bold text-emerald-700">
                        El paciente está al día. Todos los tratamientos han sido pagados.
                    </p>
                </div>
            ) : null}

            {/* ── Planes de tratamiento ── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <FileText size={14} className="text-slate-400" />
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                        Planes de Tratamiento ({plans.length})
                    </p>
                </div>

                {plans.length === 0 ? (
                    <div className="text-center py-14 text-slate-400">
                        <DollarSign size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-bold">Sin planes de tratamiento registrados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountStatementModule;
