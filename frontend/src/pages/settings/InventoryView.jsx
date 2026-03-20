import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
    Package, Plus, Upload, Download, AlertTriangle,
    ChevronDown, Search, Edit2, Trash2, X, Check,
    TrendingDown, TrendingUp, BarChart3, Loader2,
    ArrowDownCircle, ArrowUpCircle, RefreshCw, FlaskConical
} from 'lucide-react';
import api from '../../services/api';
import RecipeModal from './components/RecipeModal';

const UNITS = ['unidad', 'ml', 'gramos', 'caja', 'pares', 'frasco', 'sobre', 'ampolla'];
const CATEGORIES = ['Material Dental', 'Insumo', 'Medicamento', 'Equipamiento', 'Limpieza', 'Otro'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const cls = (...args) => args.filter(Boolean).join(' ');

const Pill = ({ children, color = 'slate' }) => {
    const map = {
        slate: 'bg-slate-100 text-slate-600',
        green: 'bg-emerald-50 text-emerald-600',
        red: 'bg-rose-50 text-rose-600',
        amber: 'bg-amber-50 text-amber-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${map[color] || map.slate}`}>
            {children}
        </span>
    );
};

// ─── Modal base ───────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-800">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 px-8 py-6 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Input = ({ label, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>}
        <input {...props} className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all bg-white" />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>}
        <select {...props} className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all bg-white appearance-none">
            {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB: PRODUCTOS
// ─────────────────────────────────────────────────────────────────────────────
const ProductsTab = ({ branches }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [recipeService, setRecipeService] = useState(null); // { serviceId, serviceName }
    const [form, setForm] = useState({ name: '', unit: 'unidad', category: 'Material Dental', minStock: 0 });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef();

    const fetch = async () => {
        setLoading(true);
        try {
            const r = await api.get('inventory/products?active=true');
            setProducts(r.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const openCreate = () => {
        setForm({ name: '', unit: 'unidad', category: 'Material Dental', minStock: 0 });
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (p) => {
        setForm({ name: p.name, unit: p.unit, category: p.category, minStock: p.minStock });
        setEditId(p.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.unit || !form.category) return alert('Completa todos los campos');
        setSaving(true);
        try {
            if (editId) {
                await api.put(`inventory/products/${editId}`, form);
            } else {
                await api.post('inventory/products', form);
            }
            setShowModal(false);
            fetch();
        } catch (e) {
            alert('Error al guardar: ' + (e.response?.data?.message || e.message));
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Desactivar este producto?')) return;
        try {
            await api.delete(`inventory/products/${id}`);
            fetch();
        } catch { alert('Error al desactivar'); }
    };

    const handleExcelImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data);
            const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            const r = await api.post('inventory/products/import-excel', { rows });
            const errMsg = r.data.errors?.length > 0
                ? '\n\n⚠️ Errores:\n' + r.data.errors.map(x => `Fila ${x.fila}: ${x.error}`).join('\n')
                : '';
            alert(`✅ ${r.data.created?.length || 0} productos procesados.${errMsg}`);
            fetch();
        } catch (err) {
            alert('Error al importar: ' + (err.response?.data?.message || err.message));
        }
        e.target.value = '';
    };

    const downloadTemplate = () => {
        const csv = 'nombre,unidad,categoria,stock_minimo\nComposite A3,gramos,Material Dental,10\nGuantes Latex,pares,Insumo,20';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'plantilla_productos.csv'; a.click();
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Header / actions */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        placeholder="Buscar productos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                </div>
                <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider transition-all">
                    <Download size={14} /> Plantilla
                </button>
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider transition-all">
                    <Upload size={14} /> Importar Excel
                </button>
                <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleExcelImport} />
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition-all shadow-lg">
                    <Plus size={14} /> Nuevo Producto
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={32} /></div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Unidad</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Stock Mín.</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm font-bold">No hay productos registrados</td></tr>
                            )}
                            {filtered.map(p => (
                                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                                    <td className="px-6 py-4"><Pill color="blue">{p.category}</Pill></td>
                                    <td className="px-6 py-4 text-center text-slate-600 font-medium">{p.unit}</td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                                        {p.minStock > 0 ? `${p.minStock} ${p.unit}` : <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all" title="Editar">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all" title="Desactivar">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Editar Producto' : 'Nuevo Producto'}>
                <Input label="Nombre del producto *" placeholder="Ej: Composite A3" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                    <Select label="Unidad *" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                        options={UNITS} />
                    <Select label="Categoría *" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                        options={CATEGORIES} />
                </div>
                <Input label="Stock mínimo (alerta)" type="number" min="0" step="0.1" placeholder="0"
                    value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
                <button onClick={handleSave} disabled={saving}
                    className="w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {saving ? 'Guardando...' : 'Guardar Producto'}
                </button>
            </Modal>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: STOCK POR SEDE
// ─────────────────────────────────────────────────────────────────────────────
const StockTab = ({ branches }) => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('ENTRADA'); // ENTRADA | AJUSTE
    const [form, setForm] = useState({ productId: '', branchId: '', quantity: '', reason: '' });
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const fetchStock = async () => {
        setLoading(true);
        try {
            const params = selectedBranch ? `?branchId=${selectedBranch}` : '';
            const r = await api.get(`inventory/stock${params}`);
            setStock(r.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchStock(); }, [selectedBranch]);

    const openModal = (type) => {
        setModalType(type);
        setForm({ productId: '', branchId: selectedBranch || '', quantity: '', reason: '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.productId || !form.branchId || !form.quantity) return alert('Completa todos los campos');
        setSaving(true);
        try {
            const endpoint = modalType === 'ENTRADA' ? 'inventory/stock/entrada' : 'inventory/stock/ajuste';
            await api.post(endpoint, form);
            setShowModal(false);
            fetchStock();
        } catch (e) {
            alert('Error: ' + (e.response?.data?.message || e.message));
        } finally { setSaving(false); }
    };

    const filtered = stock.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    const globalStock = (product) => {
        const total = product.stocks.reduce((sum, s) => sum + s.quantity, 0);
        return total;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input placeholder="Buscar insumo..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" />
                </div>
                <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 bg-white">
                    <option value="">Todas las sedes</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button onClick={() => openModal('AJUSTE')} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider transition-all">
                    <RefreshCw size={14} /> Ajuste
                </button>
                <button onClick={() => openModal('ENTRADA')} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg">
                    <ArrowDownCircle size={14} /> Registrar Entrada
                </button>
            </div>

            {loading ? (
                <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={32} /></div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Unidad</th>
                                {!selectedBranch
                                    ? <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Stock Total</th>
                                    : <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Stock en Sede</th>
                                }
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm font-bold">Sin datos de stock. Registra una entrada primero.</td></tr>
                            )}
                            {filtered.map(p => {
                                const total = globalStock(p);
                                const low = p.lowStock;
                                return (
                                    <tr key={p.id} className={cls('border-b border-slate-50 hover:bg-slate-50/50 transition-colors', low && 'bg-rose-50/30')}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {low && <AlertTriangle size={14} className="text-rose-400 shrink-0" />}
                                                <span className="font-bold text-slate-800">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><Pill color="blue">{p.category}</Pill></td>
                                        <td className="px-6 py-4 text-center text-slate-500 font-medium">{p.unit}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cls('font-black text-base', low ? 'text-rose-500' : 'text-slate-800')}>
                                                {total.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {low
                                                ? <Pill color="red">Stock Bajo</Pill>
                                                : <Pill color="green">Normal</Pill>
                                            }
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Entry / Adjustment Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)}
                title={modalType === 'ENTRADA' ? '📦 Registrar Entrada de Stock' : '🔄 Ajuste de Stock'}>
                <Select label="Producto *" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}
                    options={[{ value: '', label: '-- Selecciona un producto --' }, ...stock.map(p => ({ value: p.id, label: `${p.name} (${p.unit})` }))]} />
                <Select label="Sede *" value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })}
                    options={[{ value: '', label: '-- Selecciona una sede --' }, ...branches.map(b => ({ value: b.id, label: b.name }))]} />
                <Input label={modalType === 'ENTRADA' ? 'Cantidad a ingresar *' : 'Nuevo stock total *'}
                    type="number" min="0" step="0.1" placeholder="0"
                    value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                <Input label="Motivo" placeholder={modalType === 'ENTRADA' ? 'Ej: Compra de insumos' : 'Ej: Conteo físico'}
                    value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
                <button onClick={handleSave} disabled={saving}
                    className={cls('w-full py-3 rounded-2xl text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50',
                        modalType === 'ENTRADA' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700')}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : (modalType === 'ENTRADA' ? <ArrowDownCircle size={16} /> : <RefreshCw size={16} />)}
                    {saving ? 'Guardando...' : (modalType === 'ENTRADA' ? 'Registrar Entrada' : 'Aplicar Ajuste')}
                </button>
            </Modal>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: MOVIMIENTOS
// ─────────────────────────────────────────────────────────────────────────────
const MovementsTab = ({ branches }) => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [filterBranch, setFilterBranch] = useState('');

    const fetchMovements = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType) params.set('type', filterType);
            if (filterBranch) params.set('branchId', filterBranch);
            params.set('limit', '150');
            const r = await api.get(`inventory/movements?${params.toString()}`);
            setMovements(r.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchMovements(); }, [filterType, filterBranch]);

    const typeConfig = {
        ENTRADA: { label: 'Entrada', color: 'green', icon: ArrowDownCircle },
        SALIDA: { label: 'Salida', color: 'red', icon: ArrowUpCircle },
        AJUSTE: { label: 'Ajuste', color: 'blue', icon: RefreshCw },
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 bg-white">
                    <option value="">Todos los movimientos</option>
                    <option value="ENTRADA">Entradas</option>
                    <option value="SALIDA">Salidas</option>
                    <option value="AJUSTE">Ajustes</option>
                </select>
                <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 bg-white">
                    <option value="">Todas las sedes</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button onClick={fetchMovements} className="px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all">
                    <RefreshCw size={14} />
                </button>
            </div>

            {loading ? (
                <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={32} /></div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Cantidad</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Motivo</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm font-bold">No hay movimientos registrados</td></tr>
                            )}
                            {movements.map(m => {
                                const cfg = typeConfig[m.type] || typeConfig.AJUSTE;
                                const Icon = cfg.icon;
                                return (
                                    <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Pill color={cfg.color}>{cfg.label}</Pill>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{m.product?.name}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{m.product?.category}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-black text-slate-800">
                                            {m.type === 'SALIDA' ? '-' : '+'}{m.quantity} <span className="text-slate-400 font-medium text-xs">{m.product?.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-xs font-medium max-w-48 truncate">{m.reason || '—'}</td>
                                        <td className="px-6 py-4 text-right text-slate-400 text-xs font-bold">
                                            {new Date(m.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            <br />
                                            <span className="text-[10px]">{new Date(m.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const InventoryView = () => {
    const [tab, setTab] = useState('products');
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        api.get('branches').then(r => setBranches(r.data)).catch(() => { });
    }, []);

    const TABS = [
        { id: 'products', icon: Package, label: 'Productos' },
        { id: 'stock', icon: BarChart3, label: 'Stock por Sede' },
        { id: 'movements', icon: TrendingDown, label: 'Movimientos' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-800">Inventario</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Control de materiales e insumos</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cls(
                            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                            tab === t.id
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        )}
                    >
                        <t.icon size={14} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="glass-card p-6 rounded-[32px] border border-white/60 shadow-sm">
                {tab === 'products' && <ProductsTab branches={branches} />}
                {tab === 'stock' && <StockTab branches={branches} />}
                {tab === 'movements' && <MovementsTab branches={branches} />}
            </div>
        </div>
    );
};

export default InventoryView;
