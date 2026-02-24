import { create } from 'zustand';
import api from '../services/api';

const useClinicalStore = create((set, get) => ({
    forms: {}, // { [type]: { data: {}, status: 'idle' | 'loading' | 'success' | 'error' } }
    loading: false,
    saving: false,

    fetchForm: async (patientId, type) => {
        if (get().forms[type]?.status === 'loading') return;
        set((state) => ({
            forms: {
                ...state.forms,
                [type]: { ...state.forms[type], status: 'loading' }
            }
        }));

        try {
            const res = await api.get(`clinical/forms/${patientId}/${type}`);
            set((state) => ({
                forms: {
                    ...state.forms,
                    [type]: {
                        data: res.data?.data || {},
                        status: 'success',
                        id: res.data?.id
                    }
                }
            }));
        } catch (e) {
            // Manejar específicamente el caso de que no exista el formulario (404)
            if (e.response?.status === 404) {
                set((state) => ({
                    forms: {
                        ...state.forms,
                        [type]: {
                            data: {},
                            status: 'success'
                        }
                    }
                }));
                return;
            }

            console.error(`Error fetching form ${type}:`, e);
            set((state) => ({
                forms: {
                    ...state.forms,
                    [type]: { ...state.forms[type], status: 'error' }
                }
            }));
        }
    },

    updateFormData: (type, field, value) => set((state) => ({
        forms: {
            ...state.forms,
            [type]: {
                ...state.forms[type],
                data: { ...state.forms[type]?.data, [field]: value }
            }
        }
    })),

    saveForm: async (patientId, type) => {
        const form = get().forms[type];
        if (!form || !form.data) return;

        set({ saving: true });
        try {
            await api.post('clinical/forms', {
                patientId,
                type,
                data: form.data
            });
            set({ saving: false });
            return true;
        } catch (e) {
            console.error(`Error saving form ${type}:`, e);
            set({ saving: false });
            alert('Error al guardar el formulario');
            return false;
        }
    }
}));

export default useClinicalStore;
