import { create } from 'zustand';
import api from '../services/api';

const useTreatmentStore = create((set, get) => ({
    plan: null,
    services: [],
    loading: false,
    saving: false,
    activeTab: 'odontogram',

    // Actions
    setActiveTab: (tab) => set({ activeTab: tab }),
    setSaving: (saving) => set({ saving }),
    fetchTreatmentData: async (patientId) => {
        if (!patientId || get().loading) return;
        set({ loading: true });
        try {
            const [plansRes, servicesRes] = await Promise.all([
                api.get('treatments', { params: { patientId } }),
                api.get('services', { params: { active: true } }),
            ]);

            set({
                services: servicesRes.data,
                plan: plansRes.data.length > 0 ? plansRes.data[0] : null,
                loading: false
            });
        } catch (e) {
            console.error('Error fetching treatment data:', e);
            set({ loading: false });
        }
    },

    addItem: async (patientId, serviceId, toothNumber) => {
        const { plan, services } = get();
        const service = services.find(s => s.id === parseInt(serviceId));
        if (!service) return;

        try {
            let currentPlan = plan;
            if (!currentPlan) {
                // Auto-create plan if none exists
                const doctorsRes = await api.get('auth/users');
                const adminDoctor = doctorsRes.data.find(u => u.role === 'ADMIN') || doctorsRes.data[0];
                const newPlanRes = await api.post('treatments', {
                    patientId,
                    doctorId: adminDoctor.id,
                    notes: 'Plan inicial'
                });
                currentPlan = newPlanRes.data;
                set({ plan: currentPlan });
            }

            await api.post(`treatments/${currentPlan.id}/items`, {
                serviceId,
                toothNumber,
                price: service.price,
                notes: ''
            });

            // Re-fetch to get updated items
            const plansRes = await api.get('treatments', { params: { patientId } });
            set({ plan: plansRes.data[0] });
        } catch (e) {
            console.error('Error adding item:', e);
        }
    },

    deleteItem: async (patientId, itemId) => {
        try {
            await api.delete(`treatments/items/${itemId}`);
            const plansRes = await api.get('treatments', { params: { patientId } });
            set({ plan: plansRes.data[0] });
        } catch (e) {
            console.error('Error deleting item:', e);
        }
    },

    // Derived values (can be used as selectors)
    getTotals: () => {
        const { plan } = get();
        if (!plan || !plan.items) return { total: 0, paid: 0, balance: 0, proceduresCount: 0 };

        const total = plan.items.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
        const paid = plan.items.filter(i => i.status === 'COMPLETED').reduce((acc, item) => acc + parseFloat(item.price || 0), 0);

        return {
            total,
            paid,
            balance: total - paid,
            proceduresCount: plan.items.length,
            finalizedCount: plan.items.filter(i => i.status === 'COMPLETED').length,
            pendingCount: plan.items.filter(i => i.status !== 'COMPLETED').length,
        };
    }
}));

export default useTreatmentStore;
