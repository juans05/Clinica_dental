import { create } from 'zustand';
import api from '../services/api';

const ALL_PERMANENT = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 48, 47, 46, 45, 44, 43, 42, 41];
const ALL_PRIMARY = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 71, 72, 73, 74, 75, 85, 84, 83, 82, 81];
const ALL_TEETH = [...ALL_PERMANENT, ...ALL_PRIMARY];

const defaultTooth = () => ({
    conditions: [],
    surfaces: { O: [], V: [], L: [], M: [], D: [] },
    notes: '',
    evolutionState: null, // CURADO, PENDIENTE, CANCELADO
});

const buildState = () => Object.fromEntries(ALL_TEETH.map(n => [n, defaultTooth()]));

const isUpper = n => (n >= 11 && n <= 28) || (n >= 51 && n <= 65);
const isPrimary = n => n >= 51 && n <= 85;

const RANGE_FINDINGS = ['OFJ', 'ORE', 'PF', 'PR', 'PT'];

const syncRangeArch = (newTeeth, refN, colorState, baseId) => {
    const isU = isUpper(refN);
    const isP = isPrimary(refN);
    const archTeeth = ALL_TEETH.filter(tn => isUpper(tn) === isU && isPrimary(tn) === isP);

    const lineId = `${baseId}_L`;
    const anchors = archTeeth.filter(tn =>
        newTeeth[tn].conditions.some(c => c.startsWith(`${baseId}:`) && c.endsWith(':ANCHOR'))
    );

    if (anchors.length > 0) {
        const indices = anchors.map(tn => ALL_TEETH.indexOf(tn));
        const minIdx = Math.min(...indices);
        const maxIdx = Math.max(...indices);
        const range = ALL_TEETH.slice(minIdx, maxIdx + 1);

        range.forEach(rn => {
            const isAnchor = anchors.includes(rn);
            if (!isAnchor && newTeeth[rn]) {
                const rt = { ...newTeeth[rn] };
                rt.conditions = [...rt.conditions.filter(c => !c.startsWith(`${lineId}:`)), `${lineId}:${colorState}`];
                newTeeth[rn] = rt;
            }
        });

        archTeeth.forEach(tn => {
            if (!range.includes(tn)) {
                const rt = { ...newTeeth[tn] };
                rt.conditions = rt.conditions.filter(c => !c.startsWith(`${lineId}:`));
                newTeeth[tn] = rt;
            }
        });
    } else {
        archTeeth.forEach(tn => {
            const rt = { ...newTeeth[tn] };
            rt.conditions = rt.conditions.filter(c => !c.startsWith(`${lineId}:`));
            newTeeth[tn] = rt;
        });
    }
};

const useOdontogramStore = create((set, get) => ({
    teeth: buildState(),
    selected: null,
    activeTool: 'CARIES',
    activeMode: 'INITIAL', // INITIAL o EVOLUTION
    isTemporary: false,
    loading: false,
    saving: false,
    dirty: false,
    pendingLogs: [],
    toothHistory: [],
    globalSpecifications: '',
    globalObservations: '',
    // Multi-visit support
    allVisits: [],          // all Odontogram records (sorted newest first)
    currentVisitId: null,   // id of the visit being viewed/edited
    isReadOnlyVisit: false, // true when viewing a past (not the latest) visit

    // Actions
    setIsTemporary: (isTemp) => set({ isTemporary: isTemp }),
    toggleTemporary: () => set(state => ({ isTemporary: !state.isTemporary })),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSelected: (n) => set({ selected: n }),
    setActiveMode: (mode) => set({ activeMode: mode }),
    setGlobalSpecifications: (val) => set({ globalSpecifications: val, dirty: true }),
    setGlobalObservations: (val) => set({ globalObservations: val, dirty: true }),

    // Switch to a specific visit for viewing (read-only if not the latest)
    switchVisit: (visitId) => {
        const { allVisits } = get();
        const visit = allVisits.find(v => v.id === visitId);
        if (!visit) return;
        const isLatest = allVisits.length > 0 && allVisits[0].id === visitId;
        const mergedTeeth = buildState();
        const backendData = visit.data || {};
        Object.keys(backendData).forEach(n => {
            if (mergedTeeth[n]) {
                const raw = backendData[n];
                if (!raw) return;
                const normConditions = (Array.isArray(raw.conditions) ? raw.conditions : [])
                    .filter(c => typeof c === 'string' && c !== 'HEALTHY');
                if (raw.condition && typeof raw.condition === 'string' && raw.condition !== 'HEALTHY' && !normConditions.includes(raw.condition)) {
                    normConditions.push(raw.condition);
                }
                const normSurfaces = {};
                ['O', 'V', 'L', 'M', 'D'].forEach(s => {
                    const val = raw?.surfaces ? raw.surfaces[s] : null;
                    normSurfaces[s] = (Array.isArray(val) ? val : []).filter(c => typeof c === 'string' && c !== 'HEALTHY');
                    if (typeof val === 'string' && val !== 'HEALTHY' && !normSurfaces[s].includes(val)) normSurfaces[s].push(val);
                });
                mergedTeeth[n] = { ...mergedTeeth[n], conditions: normConditions, surfaces: normSurfaces, notes: raw?.notes || '', evolutionState: raw?.evolutionState || null };
            }
        });
        set({
            teeth: mergedTeeth,
            globalSpecifications: backendData.globalSpecifications || '',
            globalObservations: backendData.globalObservations || '',
            currentVisitId: visitId,
            isReadOnlyVisit: !isLatest,
            dirty: false,
            pendingLogs: [],
        });
    },

    // Create a brand new visit for this patient
    createNewVisit: async (patientId, sessionNotes = '') => {
        set({ saving: true });
        try {
            const r = await api.post(`odontograms/${patientId}/new`, { sessionNotes });
            const newVisit = r.data;
            set(state => ({
                allVisits: [newVisit, ...state.allVisits],
                currentVisitId: newVisit.id,
                isReadOnlyVisit: false,
                teeth: buildState(),
                globalSpecifications: '',
                globalObservations: '',
                dirty: false,
                pendingLogs: [],
                saving: false,
            }));
            return newVisit;
        } catch (e) {
            console.error('Error creating new visit:', e);
            set({ saving: false });
            return null;
        }
    },

    setEvolutionState: (n, state) => set((stateStore) => {
        const teeth = { ...stateStore.teeth };
        teeth[n] = { ...teeth[n], evolutionState: state };
        return { teeth, dirty: true };
    }),

    fetchOdontogram: async (patientId) => {
        if (!patientId || get().loading) {
            if (!patientId) set({ loading: false });
            return;
        }
        set({ loading: true });
        try {
            const r = await api.get(`odontograms/${patientId}`);
            const { all, current } = r.data || {};
            const allVisits = Array.isArray(all) ? all : (current ? [current] : []);
            const backendData = current?.data;

            const mergeData = (data) => {
                const mergedTeeth = buildState();
                if (!data) return mergedTeeth;
                Object.keys(data).forEach(n => {
                    if (mergedTeeth[n]) {
                        const raw = data[n];
                        if (!raw) return;
                        const normConditions = (Array.isArray(raw.conditions) ? raw.conditions : [])
                            .filter(c => typeof c === 'string' && c !== 'HEALTHY');
                        if (raw.condition && typeof raw.condition === 'string' && raw.condition !== 'HEALTHY' && !normConditions.includes(raw.condition)) {
                            normConditions.push(raw.condition);
                        }
                        const normSurfaces = {};
                        ['O', 'V', 'L', 'M', 'D'].forEach(s => {
                            const val = raw?.surfaces ? raw.surfaces[s] : null;
                            normSurfaces[s] = (Array.isArray(val) ? val : []).filter(c => typeof c === 'string' && c !== 'HEALTHY');
                            if (typeof val === 'string' && val !== 'HEALTHY' && !normSurfaces[s].includes(val)) normSurfaces[s].push(val);
                        });
                        mergedTeeth[n] = { ...mergedTeeth[n], conditions: normConditions, surfaces: normSurfaces, notes: raw?.notes || '', evolutionState: raw?.evolutionState || null };
                    }
                });
                return mergedTeeth;
            };

            set({
                teeth: mergeData(backendData),
                globalSpecifications: backendData?.globalSpecifications || '',
                globalObservations: backendData?.globalObservations || '',
                allVisits,
                currentVisitId: current?.id || null,
                isReadOnlyVisit: false,
                loading: false,
                dirty: false
            });
        } catch (e) {
            console.error('Error fetching odontogram:', e);
            set({ teeth: buildState(), allVisits: [], loading: false, dirty: false });
        }
    },

    markTeeth: (toothNumbers, findingId) => {
        set((state) => {
            const newTeeth = { ...state.teeth };
            const newLogs = [...state.pendingLogs];
            const [id, colorState] = findingId.split(':');

            toothNumbers.forEach(n => {
                if (newTeeth[n]) {
                    const t = { ...newTeeth[n] };
                    t.conditions = [...t.conditions.filter(c => !c.startsWith(`${id}:`)), `${id}:${colorState}:ANCHOR`];
                    newTeeth[n] = t;
                    newLogs.push({ toothNumber: n, conditionId: findingId, action: 'ADD', description: `Añadió condición ${findingId}` });
                }
            });

            if (RANGE_FINDINGS.includes(id) && toothNumbers.length > 0) {
                syncRangeArch(newTeeth, toothNumbers[0], colorState, id);
            }

            return { teeth: newTeeth, dirty: true, pendingLogs: newLogs };
        });
    },

    markTooth: (n, findingId = null) => {
        const { activeTool, teeth } = get();
        const toolToApply = findingId || activeTool;

        if (toolToApply === 'SELECT' || typeof toolToApply !== 'string') {
            set({ selected: get().selected === n ? null : n });
            return;
        }

        set((state) => {
            const newTeeth = { ...state.teeth };
            const t = { ...newTeeth[n] };
            const currentIdx = t.conditions.indexOf(toolToApply);
            const newLogs = [...state.pendingLogs];

            // Analizar si es una condición bidireccional (Fusión o Transposición)
            const [id, colorState, partner] = toolToApply.split(':');
            const isBidirectional = (id === 'FUS' || id === 'TRA') && partner;
            const isRange = RANGE_FINDINGS.includes(id);

            if (currentIdx > -1) {
                // REMOVER (si ya existe el hallazgo exacto)
                t.conditions = t.conditions.filter(c => c !== toolToApply);
                newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'REMOVE', description: `Retiró condición ${toolToApply}` });

                if (isRange) {
                    // Limpiar también cualquier línea o rastro del rango en ESTA pieza
                    t.conditions = t.conditions.filter(c => !c.startsWith(`${id}:`) && !c.startsWith(`${id}_L:`));
                    newTeeth[n] = t;
                    syncRangeArch(newTeeth, n, colorState, id);
                    return { teeth: newTeeth, dirty: true, selected: n, pendingLogs: newLogs };
                }

                // Si es bidireccional, remover recíproco
                if (isBidirectional) {
                    const pNum = parseInt(partner);
                    if (newTeeth[pNum]) {
                        const pt = { ...newTeeth[pNum] };
                        const reciprocal = `${id}:${colorState}:${n}`;
                        pt.conditions = pt.conditions.filter(c => c !== reciprocal);
                        newTeeth[pNum] = pt;
                    }
                }
            } else {
                // AÑADIR (si no existe)
                if (isRange) {
                    const baseId = `${id}:${colorState}`;
                    // Al añadir un anclaje de rango, nos aseguramos de que sea el único de ese tipo en la pieza
                    t.conditions = [...t.conditions.filter(c => !c.startsWith(`${id}:`)), `${baseId}:ANCHOR`];
                    newTeeth[n] = t;
                    syncRangeArch(newTeeth, n, colorState, id);
                    newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'ADD', description: `Añadió anclaje ${id}` });
                    return { teeth: newTeeth, dirty: true, selected: n, pendingLogs: newLogs };
                }

                t.conditions = [...t.conditions, toolToApply];
                newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'ADD', description: `Añadió condición ${toolToApply}` });

                // Si es bidireccional, añadir recíproco
                if (isBidirectional) {
                    const pNum = parseInt(partner);
                    if (newTeeth[pNum]) {
                        const pt = { ...newTeeth[pNum] };
                        const reciprocal = `${id}:${colorState}:${n}`;
                        if (!pt.conditions.includes(reciprocal)) {
                            pt.conditions = [...pt.conditions, reciprocal];
                        }
                        newTeeth[pNum] = pt;
                    }
                }
            }

            newTeeth[n] = t;
            return {
                teeth: newTeeth,
                dirty: true,
                selected: n,
                pendingLogs: newLogs
            };
        });
    },

    markSurface: (n, s, findingId = null) => {
        const { activeTool } = get();
        const toolToApply = findingId || activeTool;
        
        set((state) => {
            const t = { ...state.teeth[n] };
            if (!t.surfaces) t.surfaces = { O: [], V: [], L: [], M: [], D: [] };
            
            const currentArr = [...(t.surfaces[s] || [])];
            const newLogs = [...state.pendingLogs];

            let newArr;

            if (!toolToApply || typeof toolToApply !== 'string') {
                // Si no hay herramienta, pero la superficie tiene algo, quitamos el último (para facilitar deselección)
                if (currentArr.length > 0) {
                    const removed = currentArr.pop();
                    newArr = currentArr;
                    newLogs.push({ toothNumber: n, conditionId: removed, action: 'REMOVE', description: `Saca ${removed} de ${s} (auto)` });
                } else {
                    return state;
                }
            } else {
                const [baseId] = toolToApply.split(':');
                const existingIdx = currentArr.findIndex(id => id.startsWith(`${baseId}:`));

                if (existingIdx > -1) {
                    if (currentArr[existingIdx] === toolToApply) {
                        newArr = currentArr.filter((_, i) => i !== existingIdx);
                        newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'REMOVE', description: `Retiró ${toolToApply} de ${s}` });
                    } else {
                        newArr = [...currentArr];
                        newArr[existingIdx] = toolToApply;
                        newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'UPDATE', description: `Cambió estado de ${baseId} en ${s}` });
                    }
                } else {
                    newArr = [...currentArr, toolToApply];
                    newLogs.push({ toothNumber: n, conditionId: toolToApply, action: 'ADD', description: `Añadió ${toolToApply} a ${s}` });
                }
            }

            t.surfaces[s] = newArr;
            return {
                teeth: { ...state.teeth, [n]: t },
                dirty: true,
                pendingLogs: newLogs
            };
        });
    },

    removeFindingFromTooth: (n, findingId) => {
        set((state) => {
            const newTeeth = { ...state.teeth };
            const t = { ...newTeeth[n] };
            const [baseId, , partner] = findingId.split(':');
            const newLogs = [...state.pendingLogs];

            // Quitar de condiciones de diente
            if (t.conditions) {
                t.conditions = t.conditions.filter(c => !c.startsWith(`${baseId}:`) && c !== baseId);
            }

            // Quitar de superficies
            if (t.surfaces) {
                const newSurfaces = { ...t.surfaces };
                Object.keys(newSurfaces).forEach(s => {
                    newSurfaces[s] = (newSurfaces[s] || []).filter(c => {
                        if (typeof c !== 'string') return false;
                        const [cBaseId] = c.split(':');
                        return cBaseId !== baseId;
                    });
                });
                t.surfaces = newSurfaces;
            }

            // Si es bidireccional (Fusión o Transposición), eliminar recíproco
            if ((baseId === 'FUS' || baseId === 'TRA') && partner) {
                const pNum = parseInt(partner);
                if (newTeeth[pNum]) {
                    const pt = { ...newTeeth[pNum] };
                    // El recíproco es aquel que empieza por baseId y contiene la pieza n como partner
                    pt.conditions = pt.conditions.filter(c => !(c.startsWith(`${baseId}:`) && c.endsWith(`:${n}`)));
                    newTeeth[pNum] = pt;
                }
            }

            newLogs.push({ toothNumber: n, conditionId: findingId, action: 'REMOVE_ALL', description: `Eliminó todas las instancias de ${baseId}` });

            newTeeth[n] = t;
            return {
                teeth: newTeeth,
                dirty: true,
                pendingLogs: newLogs
            };
        });
    },

    updateFindingState: (n, baseId, newState) => {
        set((state) => {
            const t = { ...state.teeth[n] };
            const newLogs = [...state.pendingLogs];

            // Actualizar en condiciones de diente
            if (t.conditions) {
                t.conditions = t.conditions.map(c => {
                    if (c.startsWith(`${baseId}:`)) return `${baseId}:${newState}`;
                    return c;
                });
            }

            // Actualizar en superficies
            if (t.surfaces) {
                const newSurfaces = { ...t.surfaces };
                Object.keys(newSurfaces).forEach(s => {
                    newSurfaces[s] = (newSurfaces[s] || []).map(c => {
                        if (c.startsWith(`${baseId}:`)) return `${baseId}:${newState}`;
                        return c;
                    });
                });
                t.surfaces = newSurfaces;
            }

            newLogs.push({ toothNumber: n, conditionId: baseId, action: 'UPDATE_STATE', description: `Cambiando estado de ${baseId} a ${newState}` });

            return {
                teeth: { ...state.teeth, [n]: t },
                dirty: true,
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
        const { teeth, pendingLogs, globalSpecifications, globalObservations, currentVisitId } = get();
        set({ saving: true });
        try {
            await api.put(`odontograms/${patientId}`, {
                data: teeth,
                logs: pendingLogs,
                globalSpecifications,
                globalObservations,
                odontogramId: currentVisitId, // send which visit to update
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
