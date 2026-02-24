import { create } from 'zustand';
import api from '../services/api';

const usePatientStore = create((set, get) => ({
    patient: null,
    formData: {},
    loading: false,
    error: null,
    isEditing: false,
    activeTab: 'personal',
    activeHistoryTab: 'adult',

    // Actions
    setPatient: (patient) => set({ patient, formData: patient }),

    setIsEditing: (isEditing) => set({ isEditing }),

    setActiveTab: (activeTab) => set({ activeTab }),

    setActiveHistoryTab: (activeHistoryTab) => set({ activeHistoryTab }),

    updateFormField: (field, value) => set((state) => ({
        formData: { ...state.formData, [field]: value }
    })),

    updateFiscalField: (field, value) => set((state) => ({
        formData: {
            ...state.formData,
            fiscalData: { ...state.formData.fiscalData, [field]: value }
        }
    })),

    fetchPatient: async (patientId) => {
        if (get().loading) return;
        if (!patientId || patientId === 'new') {
            set({
                patient: {
                    firstName: '', paternalSurname: '', maternalSurname: '', nickname: '',
                    documentType: 'DNI', documentId: '', phoneMobile: '', email: '',
                    birthDate: '', birthCountry: 'Perú', hcNumber: '', address: '',
                    leadSource: 'Seleccionar', tags: '', notes: '', allergies: '',
                    fiscalData: { taxId: '', businessName: '', address: '' }
                },
                formData: {
                    firstName: '', paternalSurname: '', maternalSurname: '', nickname: '',
                    documentType: 'DNI', documentId: '', phoneMobile: '', email: '',
                    birthDate: '', birthCountry: 'Perú', hcNumber: '', address: '',
                    leadSource: 'Seleccionar', tags: '', notes: '', allergies: '',
                    fiscalData: { taxId: '', businessName: '', address: '' }
                },
                loading: false,
                isEditing: true
            });
            return;
        }

        set({ loading: true, error: null });
        try {
            const res = await api.get(`patients/${patientId}`);
            if (!res.data) throw new Error('Paciente no encontrado');
            set({ patient: res.data, formData: res.data, loading: false });
        } catch (e) {
            set({
                error: e.response?.data?.message || e.message || 'Error al cargar expediente',
                loading: false
            });
        }
    },

    savePatient: async (onSuccess) => {
        const { formData, patient } = get();
        try {
            if (!patient.id) {
                const res = await api.post('patients', formData);
                set({ patient: res.data, formData: res.data, isEditing: false });
                alert('Paciente registrado exitosamente');
            } else {
                await api.put(`patients/${patient.id}`, formData);
                set({ patient: { ...formData }, isEditing: false });
            }
            if (onSuccess) onSuccess();
        } catch (e) {
            console.error('Error saving patient:', e);
            alert('Error al guardar cambios: ' + (e.response?.data?.message || e.message));
        }
    },

    reset: () => set({ patient: null, formData: {}, loading: false, error: null, isEditing: false })
}));

export default usePatientStore;
