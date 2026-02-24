import { create } from 'zustand';
import api from '../services/api';

const ALL_PERMANENT = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 48, 47, 46, 45, 44, 43, 42, 41];
const ALL_PRIMARY = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 71, 72, 73, 74, 75, 85, 84, 83, 82, 81];
const ALL_TEETH = [...ALL_PERMANENT, ...ALL_PRIMARY];

const defaultTooth = () => ({
    conditions: [],
    surfaces: { O: [], V: [], L: [], M: [], D: [] },
    notes: '',
});

const buildState = () => Object.fromEntries(ALL_TEETH.map(n => [n, defaultTooth()]));

const useOdontogramStore = create((set, get) => ({
    teeth: buildState(),
    selected: null,
    activeTool: 'CARIES',
    isTemporary: false,
    loading: false,
    saving: false,
    dirty: false,
    pendingLogs: [],
    toothHistory: [],

    // Actions
    setIsTemporary: (isTemp) => set({ isTemporary: isTemp }),
    toggleTemporary: () => set(state => ({ isTemporary: !state.isTemporary })),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSelected: (n) => set({ selected: n }),

    fetchOdontogram: async (patientId) => {
        if (!patientId || get().loading) {
            if (!patientId) set({ loading: false });
            return;
        }
        set({ loading: true });
        try {
            const r = await api.get(`odontograms/${patientId}`);
            const backendData = r.data?.data;

            if (backendData) {
                const mergedTeeth = buildState();
                Object.keys(backendData).forEach(n => {
                    if (mergedTeeth[n]) {
                        const raw = backendData[n];
                        if (!raw) return;

                        // Normalización: Convertir strings antiguos a arreglos nuevos
                        const normConditions = (Array.isArray(raw.conditions) ? raw.conditions : [])
                            .filter(c => typeof c === 'string' && c !== 'HEALTHY');

                        // Si venía de una versión muy antigua con condition única
                        if (raw.condition && typeof raw.condition === 'string' && raw.condition !== 'HEALTHY' && !normConditions.includes(raw.condition)) {
                            normConditions.push(raw.condition);
                        }

                        const normSurfaces = {};
                        ['O', 'V', 'L', 'M', 'D'].forEach(s => {
                            const val = raw?.surfaces ? raw.surfaces[s] : null;
                            normSurfaces[s] = (Array.isArray(val) ? val : [])
                                .filter(c => typeof c === 'string' && c !== 'HEALTHY');

                            // Retrocompatibilidad con strings simples
                            if (typeof val === 'string' && val !== 'HEALTHY' && !normSurfaces[s].includes(val)) {
                                normSurfaces[s].push(val);
                            }
                        });

                        mergedTeeth[n] = {
                            ...mergedTeeth[n],
                            conditions: normConditions,
                            surfaces: normSurfaces,
                            notes: raw?.notes || ''
                        };
                    }
                });
                set({ teeth: mergedTeeth, loading: false, dirty: false });
            } else {
                set({ teeth: buildState(), loading: false, dirty: false });
            }
        } catch (e) {
            console.error('Error fetching odontogram:', e);
            set({ teeth: buildState(), loading: false, dirty: false });
        }
    },

    markTooth: (n, findingId = null) => {
        const { activeTool, teeth } = get();
        const toolToApply = findingId || activeTool;

        if (toolToApply === 'SELECT' || typeof toolToApply !== 'string') {
            set({ selected: get().selected === n ? null : n });
            return;
        }

        set((state) => {
            const t = { ...state.teeth[n] };
            const currentIdx = t.conditions.indexOf(toolToApply);
            const newLogs = [...state.pendingLogs];

            if (currentIdx > -1) {
                t.conditions = t.conditions.filter(id => id !== toolToApply);
                newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'REMOVE', description: `Retiró condición ${toolToApply}` });
            } else {
                t.conditions = [...t.conditions, toolToApply];
                newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'ADD', description: `Añadió condición ${toolToApply}` });
            }

            return {
                teeth: { ...state.teeth, [n]: t },
                dirty: true,
                selected: n,
                pendingLogs: newLogs
            };
        });
    },

    markSurface: (n, s, findingId = null) => {
        const { activeTool } = get();
        const toolToApply = findingId || activeTool;
        if (typeof toolToApply !== 'string') return;

        set((state) => {
            const t = { ...state.teeth[n] };
            const currentArr = t.surfaces[s] || [];
            const currentIdx = currentArr.indexOf(toolToApply);
            const newLogs = [...state.pendingLogs];

            let newArr;
            if (currentIdx > -1) {
                newArr = currentArr.filter(id => id !== toolToApply);
                newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'REMOVE', description: `Retiró ${toolToApply} de superficie ${s}` });
            } else {
                newArr = [...currentArr, toolToApply];
                newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'ADD', description: `Añadió ${toolToApply} en superficie ${s}` });
            }

            t.surfaces = {
                ...t.surfaces,
                [s]: newArr
            };

            return {
                teeth: { ...state.teeth, [n]: t },
                dirty: true,
                selected: n,
                pendingLogs: newLogs
            };
        });
    },

    setNote: (n, note) => set((state) => {
        const newLogs = [...state.pendingLogs];
        newLogs.push({ toothNumber: n, action: 'UPDATE_NOTE', description: `Actualizó nota: ${note.substring(0, 30)}...` });
        return {
            teeth: { ...state.teeth, [n]: { ...state.teeth[n], notes: note } },
            dirty: true,
            pendingLogs: newLogs
        };
    }),

    saveOdontogram: async (patientId) => {
        const { teeth, pendingLogs } = get();
        set({ saving: true });
        try {
            await api.put(`odontograms/${patientId}`, {
                data: teeth,
                logs: pendingLogs
            });
            set({ saving: false, dirty: false, pendingLogs: [] });
        } catch (e) {
            console.error('Error saving odontogram:', e);
            set({ saving: false });
            alert('Error al guardar odontograma');
        }
    },

    fetchToothHistory: async (patientId, toothNumber) => {
        if (!patientId || !toothNumber) return;
        try {
            const r = await api.get(`odontograms/${patientId}/history/${toothNumber}`);
            set({ toothHistory: r.data });
        } catch (e) {
            console.error('Error fetching tooth history:', e);
        }
    },

    resetOdontogram: async (patientId) => {
        if (!confirm('¿Reiniciar el odontograma? Se borrarán todos los hallazgos.')) return;
        try {
            await api.delete(`odontograms/${patientId}/reset`);
            set({ teeth: buildState(), dirty: false, selected: null });
        } catch (e) {
            console.error('Error resetting odontogram:', e);
        }
    }
}));

export default useOdontogramStore;
