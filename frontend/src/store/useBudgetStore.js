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
            if (targetBudget) {
                for (const item of items) {
                    await api.post(`treatments/${targetBudget.id}/items`, item);
                }
                const r = await api.get(`treatments?patientId=${patientId}`);
                set({ budgets: r.data });
                return { success: true, message: 'Ítems añadidos al presupuesto existente.' };
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

    createBudget: async (patientId, doctorId, items) => {
        try {
            const r = await api.post('treatments', {
                patientId,
                doctorId,
                items,
                notes: 'Presupuesto creado manualmente.'
            });
            set(state => ({ budgets: [r.data, ...state.budgets] }));
            return r.data;
        } catch (e) {
            console.error('Error creating budget:', e);
            return null;
        }
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
            return r.data;
        } catch (e) {
            console.error('Error creating invoice:', e);
            return null;
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
    }
}));

// Helper to map findings to services
function findServiceForCondition(condId, services) {
    if (!services || services.length === 0) return null;

    const normalized = condId.toUpperCase();
    const find = (keywords) => services.find(s =>
        keywords.some(k => s.name.toLowerCase().includes(k.toLowerCase()))
    );

    // Mapeo detallado por prioridad
    if (normalized.includes('CARIES')) {
        return find(['Resina', 'Curación', 'Restauración Directa', 'Composite']);
    }
    if (normalized.includes('ROOTCANAL')) {
        return find(['Endodoncia', 'Tratamiento de Conducto', 'Pulpectomía']);
    }
    if (normalized.includes('EXTRACTION')) {
        return find(['Exodoncia', 'Extracción', 'Cirugía Bucal']);
    }
    if (normalized.includes('CROWN')) {
        return find(['Corona', 'Prótesis Fija', 'Funda']);
    }
    if (normalized.includes('IMPLANT')) {
        return find(['Implante', 'Fijación de Titanio']);
    }
    if (normalized.includes('VENEER')) {
        return find(['Carilla', 'Faceta', 'Estética Dental']);
    }
    if (normalized.includes('BRIDGE')) {
        return find(['Puente', 'Póntico', 'Prótesis Fija']);
    }
    if (normalized.includes('SEALANT')) {
        return find(['Sellante', 'Sellado de Fosas']);
    }
    if (normalized.includes('GINGIVITIS')) {
        return find(['Profilaxis', 'Limpieza', 'Destartraje', 'Periodoncia']);
    }
    if (normalized.includes('ORTHO')) {
        return find(['Ortodoncia', 'Brackets', 'Aparato']);
    }
    if (normalized.includes('FRACTURE')) {
        return find(['Reconstrucción', 'Perno Muñón', 'Corona']);
    }
    if (normalized.includes('FILLING')) {
        return find(['Cambio de amalgama', 'Resina', 'Curación']);
    }

    return null;
}

export default useBudgetStore;
