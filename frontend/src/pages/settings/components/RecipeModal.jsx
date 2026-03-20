import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Loader2, FlaskConical, Upload, Download } from 'lucide-react';
import api from '../../../services/api';

const RecipeModal = ({ open, onClose, service }) => {
    const [products, setProducts] = useState([]);
    const [recipe, setRecipe] = useState([]); // [{ productId, quantity, product }]
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newItem, setNewItem] = useState({ productId: '', quantity: 1 });

    useEffect(() => {
        if (!open || !service?.id) return;
        setLoading(true);
        Promise.all([
            api.get('inventory/products?active=true'),
            api.get(`inventory/services/${service.id}/recipe`),
        ]).then(([prodRes, recipeRes]) => {
            setProducts(prodRes.data);
            setRecipe(recipeRes.data.map(r => ({
                productId: r.productId,
                quantity: r.quantity,
                product: r.product,
            })));
        }).catch(() => { }).finally(() => setLoading(false));
    }, [open, service?.id]);

    const addIngredient = () => {
        if (!newItem.productId) return alert('Selecciona un producto');
        if (parseFloat(newItem.quantity) <= 0) return alert('La cantidad debe ser mayor a 0');
        const prod = products.find(p => p.id === parseInt(newItem.productId));
        const already = recipe.find(r => r.productId === parseInt(newItem.productId));
        if (already) return alert('Este producto ya está en la receta');
        setRecipe(prev => [...prev, {
            productId: parseInt(newItem.productId),
            quantity: parseFloat(newItem.quantity),
            product: { id: prod.id, name: prod.name, unit: prod.unit },
        }]);
        setNewItem({ productId: '', quantity: 1 });
    };

    const removeIngredient = (productId) => {
        setRecipe(prev => prev.filter(r => r.productId !== productId));
    };

    const updateQuantity = (productId, qty) => {
        setRecipe(prev => prev.map(r => r.productId === productId ? { ...r, quantity: parseFloat(qty) || 0 } : r));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`inventory/services/${service.id}/recipe`, {
                items: recipe.map(r => ({ productId: r.productId, quantity: r.quantity })),
            });
            onClose();
        } catch (e) {
            alert('Error al guardar receta: ' + (e.response?.data?.message || e.message));
        } finally { setSaving(false); }
    };

    const importExcel = async (e) => {
        alert('Para importar recetas masivamente, usa el botón "Importar Recetas" en la vista de Inventario.');
        e.target.value = '';
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <FlaskConical size={18} className="text-cyan-500" />
                            <h2 className="text-lg font-black text-slate-800">Receta del Servicio</h2>
                        </div>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{service?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">
                    {loading ? (
                        <div className="h-32 flex items-center justify-center">
                            <Loader2 size={24} className="animate-spin text-cyan-500" />
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Define qué materiales se consumen cada vez que se realiza este servicio. El stock se descontará automáticamente al marcar el tratamiento como <strong>COMPLETADO</strong>.
                            </p>

                            {/* Ingredient list */}
                            {recipe.length === 0 ? (
                                <div className="text-center py-6 text-slate-300 text-sm font-bold">
                                    <FlaskConical size={32} className="mx-auto mb-2 opacity-40" />
                                    Aún no hay ingredientes. Agrega materiales abajo.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recipe.map(r => (
                                        <div key={r.productId} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl">
                                            <div className="flex-1">
                                                <div className="font-bold text-slate-800 text-sm">{r.product.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{r.product.unit}</div>
                                            </div>
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={r.quantity}
                                                onChange={e => updateQuantity(r.productId, e.target.value)}
                                                className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                            />
                                            <span className="text-xs text-slate-400 font-medium w-14">{r.product.unit}</span>
                                            <button onClick={() => removeIngredient(r.productId)}
                                                className="p-1.5 rounded-xl hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add new ingredient */}
                            <div className="p-4 bg-cyan-50/50 rounded-2xl border border-cyan-100 space-y-3">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Agregar ingrediente</div>
                                <div className="flex gap-3">
                                    <select
                                        value={newItem.productId}
                                        onChange={e => setNewItem({ ...newItem, productId: e.target.value })}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 bg-white">
                                        <option value="">-- Producto --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Cant."
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                        className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    />
                                    <button onClick={addIngredient}
                                        className="px-4 py-2.5 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition-all shadow-sm">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-slate-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {saving ? 'Guardando...' : 'Guardar Receta'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeModal;
