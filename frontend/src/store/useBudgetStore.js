import { create } from 'zustand';
import api from '../services/api';

const useBudgetStore = create((set, get) => ({
    budgets: [],
    currentBudget: null,
    loading: false,
    services: [], // Active services from the clinic

    fetchServices: async () => {
        try {
            const r = await api.get('services?active=true');
            set({ services: r.data });
        } catch (e) {
            console.error('Error fetching services:', e);
        }
    },

    fetchBudgets: async (patientId) => {
        if (!patientId) return;
        set({ loading: true });
        try {
            const r = await api.get(`treatments?patientId=${patientId}`);
            set({ budgets: r.data, loading: false });
        } catch (e) {
            console.error('Error fetching budgets:', e);
            set({ loading: false });
        }
    },

    createBudgetFromOdontogram: async (patientId, doctorId, teeth) => {
        const { services } = get();
        const items = [];

        // Automatic mapping logic
        // We'll look for BAD conditions or specific findings that require treatment
        Object.entries(teeth).forEach(([toothNumber, data]) => {
            // Check tooth-level conditions
            (data.conditions || []).forEach(condId => {
                const service = findServiceForCondition(condId, services);
                if (service) {
                    items.push({
                        serviceId: service.id,
                        toothNumber: toothNumber.toString(),
                        price: service.price,
                        notes: `Generado automáticamente por ${condId}`
                    });
                }
            });

            // Check surface-level conditions
            Object.entries(data.surfaces || {}).forEach(([surface, conds]) => {
                (conds || []).forEach(condId => {
                    const service = findServiceForCondition(condId, services);
                    if (service) {
                        items.push({
                            serviceId: service.id,
                            toothNumber: toothNumber.toString(),
                            price: service.price,
                            notes: `Superficie ${surface}: ${condId}`
                        });
                    }
                });
            });
        });

        if (items.length === 0) return null;

        try {
            const r = await api.post('treatments', {
                patientId,
                doctorId,
                items,
                notes: 'Presupuesto generado automáticamente desde odontograma.'
            });
            const newBudget = r.data;
            set(state => ({ budgets: [newBudget, ...state.budgets] }));
            return newBudget;
        } catch (e) {
            console.error('Error creating budget:', e);
            return null;
        }
    },

    updateBudgetItem: async (itemId, data) => {
        try {
            await api.patch(`treatments/items/${itemId}`, data);
            set(state => ({
                budgets: state.budgets.map(b => ({
                    ...b,
                    items: b.items.map(i => i.id === itemId ? { ...i, ...data } : i)
                }))
            }));
            return true;
        } catch (e) {
            console.error('Error updating budget item:', e);
            return false;
        }
    },

    deleteBudgetItem: async (itemId) => {
        try {
            await api.delete(`treatments/items/${itemId}`);
            set(state => ({
                budgets: state.budgets.map(b => ({
                    ...b,
                    items: b.items.filter(i => i.id !== itemId)
                }))
            }));
            return true;
        } catch (e) {
            console.error('Error deleting budget item:', e);
            return false;
        }
    },

    syncToothToBudget: async (patientId, doctorId, toothNumber, toothData) => {
        // ... (lógica existente mantenida)
        const { services, budgets } = get();
        const items = [];
        let targetBudget = budgets.find(b => b.status === 'PENDING' && b.patientId === parseInt(patientId));
        const processFinding = (condId, surface = null) => {
            const service = findServiceForCondition(condId, services);
            if (service) {
                items.push({
                    serviceId: service.id,
                    toothNumber: toothNumber.toString(),
                    price: service.price,
                    notes: surface ? `Superficie ${surface}: ${condId}` : `Específico: ${condId}`
                });
            }
        };
        (toothData.conditions || []).forEach(c => processFinding(c));
        Object.entries(toothData.surfaces || {}).forEach(([s, conds]) => {
            (conds || []).forEach(c => processFinding(c, s));
        });
        if (items.length === 0) return { success: false, message: 'No hay hallazgos que requieran tratamiento.' };
        try {
            const currentBudgetItems = targetBudget?.items || [];

            if (targetBudget) {
                for (const item of items) {
                    // Evitar duplicados: mismo servicio y mismo diente
                    const exists = currentBudgetItems.some(i =>
                        i.serviceId === item.serviceId &&
                        i.toothNumber === item.toothNumber &&
                        i.status !== 'CANCELLED'
                    );

                    if (!exists) {
                        await api.post(`treatments/${targetBudget.id}/items`, item);
                    }
                }
                const r = await api.get(`treatments?patientId=${patientId}`);
                set({ budgets: r.data });
                return { success: true, message: 'Ítems sincronizados al presupuesto existente.' };
            } else {
                const r = await api.post('treatments', {
                    patientId,
                    doctorId,
                    items,
                    notes: `Presupuesto generado para pieza ${toothNumber}`
                });
                set(state => ({ budgets: [r.data, ...state.budgets] }));
                return { success: true, message: 'Nuevo presupuesto creado.' };
            }
        } catch (e) {
            console.error('Error syncing tooth:', e);
            return { success: false, message: 'Error en la sincronización.' };
        }
    },

    createBudget: async (patientId, doctorId, items, notes = 'Presupuesto creado manualmente.') => {
        try {
            const r = await api.post('treatments', {
                patientId,
                doctorId,
                items,
                notes,
            });
            set(state => ({ budgets: [r.data, ...state.budgets] }));
            return r.data;
        } catch (e) {
            console.error('Error creating budget:', e);
            return null;
        }
    },

    // Builds a preview list from odontogram teeth (no API call)
    // findingLabels: { conditionId -> label } e.g. { 'CE': 'Caries Esmalte' }
    buildBudgetPreview: (teeth, findingLabels = {}) => {
        const { services } = get();
        const items = [];
        const seen = new Set();

        Object.entries(teeth).forEach(([toothNumber, data]) => {
            // ── Tooth-level conditions ─────────────────────────────────────
            (data.conditions || []).forEach(condId => {
                const [id, state] = condId.split(':');
                if (state === 'GOOD' || id.endsWith('_L')) return;

                const key = `${toothNumber}-${id}`;
                if (seen.has(key)) return;
                seen.add(key);

                const service = findServiceForCondition(condId, services);
                if (!service) return;

                items.push({
                    tempId: key,
                    toothNumber: toothNumber.toString(),
                    conditionId: id,
                    conditionLabel: findingLabels[id] || id,
                    serviceId: service.id,
                    serviceName: service.name,
                    price: service.price,
                    quantity: 1,
                });
            });

            // ── Surface-level conditions (group by conditionId to count faces) ──
            const surfacesByCondId = {};
            Object.entries(data.surfaces || {}).forEach(([surface, conds]) => {
                (conds || []).forEach(condId => {
                    const [id, state] = condId.split(':');
                    if (state === 'GOOD' || id.endsWith('_L')) return;
                    if (!surfacesByCondId[id]) surfacesByCondId[id] = [];
                    surfacesByCondId[id].push(surface);
                });
            });

            Object.entries(surfacesByCondId).forEach(([id, surfaces]) => {
                const key = `${toothNumber}-${id}`;
                if (seen.has(key)) return;
                seen.add(key);

                // For caries, escalate service based on number of affected surfaces
                let lookupId = id;
                if ((id === 'CD') && surfaces.length >= 3) lookupId = 'CDP'; // 3+ caras
                if ((id === 'MB' || id === 'CE') && surfaces.length >= 2) lookupId = 'CD'; // 2 caras

                const service = findServiceForCondition(`${lookupId}:BAD`, services);
                if (!service) return;

                const label = findingLabels[id] || id;
                items.push({
                    tempId: key,
                    toothNumber: toothNumber.toString(),
                    conditionId: id,
                    conditionLabel: surfaces.length > 1 ? `${label} (${surfaces.join(',')})` : label,
                    serviceId: service.id,
                    serviceName: service.name,
                    price: service.price,
                    quantity: 1,
                });
            });
        });

        return items;
    },

    registerPayment: async (paymentData) => {
        try {
            const r = await api.post('billing/payments', paymentData);
            return r.data;
        } catch (e) {
            console.error('Error registering payment:', e);
            return null;
        }
    },

    createInvoice: async (invoiceData) => {
        try {
            const r = await api.post('billing/invoices', invoiceData);
            return { ok: true, data: r.data };
        } catch (e) {
            console.error('Error creating invoice:', e);
            const msg = e?.response?.data?.message || e?.response?.data?.detail || e?.message || 'Error desconocido al crear el comprobante';
            return { ok: false, error: msg };
        }
    },

    addManualItemToBudget: async (budgetId, itemData) => {
        try {
            const r = await api.post(`treatments/${budgetId}/items`, itemData);
            set(state => ({
                budgets: state.budgets.map(b => b.id === budgetId ? { ...b, items: [...(b.items || []), r.data] } : b)
            }));
            return r.data;
        } catch (e) {
            console.error('Error adding manual item:', e);
            return null;
        }
    },

    updateTreatmentPlan: async (id, data) => {
        try {
            const r = await api.patch(`treatments/${id}`, data);
            set(state => ({
                budgets: state.budgets.map(b => b.id === id ? { ...b, ...r.data } : b)
            }));
            return r.data;
        } catch (e) {
            console.error('Error updating treatment plan:', e);
            return null;
        }
    },

    syncAllToBudget: async (patientId, doctorId, teeth) => {
        const { services, budgets, fetchBudgets } = get();
        const items = [];
        let targetBudget = budgets.find(b => b.status === 'PENDING' && b.patientId === parseInt(patientId));

        const processFinding = (condId, toothNumber, surface = null) => {
            const service = findServiceForCondition(condId, services);
            if (service) {
                items.push({
                    serviceId: service.id,
                    toothNumber: toothNumber.toString(),
                    price: service.price,
                    notes: surface ? `Superficie ${surface}: ${condId}` : `Generado autom. (${condId})`
                });
            }
        };

        Object.entries(teeth).forEach(([n, data]) => {
            (data.conditions || []).forEach(c => processFinding(c, n));
            Object.entries(data.surfaces || {}).forEach(([s, conds]) => {
                (conds || []).forEach(c => processFinding(c, n, s));
            });
        });

        if (items.length === 0) return { success: false, message: 'No hay hallazgos que requieran tratamiento.' };

        try {
            if (targetBudget) {
                const currentBudgetItems = targetBudget.items || [];
                for (const item of items) {
                    const exists = currentBudgetItems.some(i =>
                        i.serviceId === item.serviceId &&
                        i.toothNumber === item.toothNumber &&
                        i.status !== 'CANCELLED'
                    );
                    if (!exists) {
                        await api.post(`treatments/${targetBudget.id}/items`, item);
                    }
                }
            } else {
                await api.post('treatments', {
                    patientId,
                    doctorId,
                    items,
                    notes: 'Presupuesto sincronizado desde odontograma.'
                });
            }
            await fetchBudgets(patientId);
            return { success: true };
        } catch (e) {
            console.error('Error in syncAllToBudget:', e);
            return { success: false };
        }
    }
}));

// Helper: maps a MINSA odontogram condition to the best matching clinic service.
// condId format: "ID:STATE" or "ID:STATE:EXTRA"  (e.g. "CD:BAD", "TC:GOOD", "PF:BAD:ANCHOR")
function findServiceForCondition(condId, services) {
    if (!services || services.length === 0) return null;

    const parts = condId.split(':');
    const id    = parts[0].toUpperCase();
    const state = parts[1] || '';

    // Skip already-treated (blue/GOOD) and internal range-line segments
    if (state === 'GOOD') return null;
    if (id.endsWith('_L')) return null;

    // Case-insensitive keyword search across service names
    const find = (...keywords) => services.find(s =>
        keywords.some(k => s.name.toLowerCase().includes(k.toLowerCase()))
    );

    // ── Caries ──────────────────────────────────────────────────────────────
    if (id === 'MB' || id === 'CE')
        return find('Resina Compuesta - 1 Cara', 'Resina 1 cara', 'Restauración de Resina');
    if (id === 'CD')
        return find('Resina Compuesta - 2 Caras', 'Resina 2 caras', 'Restauración de Resina');
    if (id === 'CDP')
        return find('Resina Compuesta - 3 Caras', 'Resina 3 caras', 'Restauración de Resina');

    // ── DDE (Defectos de Desarrollo del Esmalte) ─────────────────────────────
    if (id === 'HP' || id === 'HM')
        return find('Carilla de Resina Directa', 'Carilla de Resina', 'Resina Compuesta');
    if (id === 'O'  || id === 'D')
        return find('Blanqueamiento Dental en Consultorio', 'Blanqueamiento Dental', 'Resina Compuesta');

    // ── Restauraciones temporales ────────────────────────────────────────────
    if (id === 'RT')
        return find('Restauración de Resina Compuesta - 1 Cara', 'Resina Compuesta - 1');

    // ── Sellante ────────────────────────────────────────────────────────────
    if (id === 'S' || id === 'FFP')
        return find('Sellante de Fosas y Fisuras', 'Sellante por Pieza', 'Sellante');

    // ── Tratamiento Pulpar ───────────────────────────────────────────────────
    if (id === 'TC')
        return find('Tratamiento de Conductos', 'Endodoncia');
    if (id === 'PC')
        return find('Pulpectomía', 'Tratamiento de Conductos');
    if (id === 'PP')
        return find('Pulpotomía');

    // ── Prótesis y Coronas ───────────────────────────────────────────────────
    if (id === 'CM' || id === 'CF')
        return find('Corona Metal-Porcelana', 'Corona Metálica');
    if (id === 'CMC')
        return find('Corona Metal-Porcelana');
    if (id === 'CV' || id === 'CJ')
        return find('Corona de Zirconia', 'Corona de Disilicato');
    if (id === 'CT')
        return find('Provisional Acrílico', 'Corona Temporal', 'Corona');
    if (id === 'EM')
        return find('Reconstrucción Coronal con Poste', 'Poste de Fibra', 'Reconstrucción Coronal');
    if (id === 'PF')
        return find('Puente Fijo 3 Unidades', 'Puente Fijo');
    if (id === 'PR')
        return find('Prótesis Parcial Removible Metálica', 'Prótesis Parcial Removible');
    if (id === 'PT')
        return find('Prótesis Total Acrílica', 'Prótesis Total Completa', 'Prótesis Total');
    if (id === 'IMP')
        return find('Implante Dental (Cirugía', 'Implante Dental');

    // ── Anomalías de posición ────────────────────────────────────────────────
    if (id === 'MISSING')
        return find('Implante Dental (Cirugía', 'Prótesis Parcial Removible Metálica', 'Prótesis Parcial');
    if (id === 'IMPACTED')
        return find('Cirugía de 3era Molar Retenida', 'Extracción de 3era Molar');
    if (id === 'RR')
        return find('Extracción Dental Simple', 'Extracción Dental');

    // ── Otros hallazgos ──────────────────────────────────────────────────────
    if (id === 'FX')
        return find('Resina Compuesta - 2 Caras', 'Restauración de Resina', 'Resina Compuesta');
    if (id === 'MOB')
        return find('Curetaje Cerrado (Raspado', 'Curetaje Cerrado', 'Destartraje Supragingival');
    if (id === 'DES')
        return find('Profilaxis Dental', 'Destartraje Supragingival');

    return null;
}

export default useBudgetStore;
