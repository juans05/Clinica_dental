import React, { useEffect } from 'react';
import {
    Save, FileText, Activity, AlertCircle, Plus, Trash2,
    ClipboardList, Heart, Stethoscope, Baby, Pill, CheckCircle2
} from 'lucide-react';
import useClinicalStore from '../store/useClinicalStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// ── Sub-components ──

const Section = ({ id, title, icon: Icon, children, className, formType, openSections, setOpenSections }) => {
    const isOpen = formType !== 'ENDODONTICS' || openSections.has(id);
    const toggle = () => {
        if (formType !== 'ENDODONTICS') return;
        const next = new Set(openSections);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setOpenSections(next);
    };

    return (
        <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden transition-all", className)}>
            <button
                onClick={toggle}
                disabled={formType !== 'ENDODONTICS'}
                className={cn(
                    "flex items-center justify-between px-4 py-3 border-b border-slate-50 transition-colors text-left w-full",
                    formType === 'ENDODONTICS' ? "hover:bg-slate-50 cursor-pointer" : ""
                )}
            >
                <h3 className="flex items-center gap-2 text-[11px] font-black text-slate-800 uppercase tracking-widest">
                    <Icon size={12} className="text-indigo-500" /> {title}
                </h3>
                {formType === 'ENDODONTICS' && (
                    <div className={cn("transition-transform duration-300", isOpen ? "rotate-180" : "")}>
                        <Plus size={14} className="text-slate-400" />
                    </div>
                )}
            </button>
            {isOpen && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
};

const Field = ({ label, name, placeholder, type: inputType = "text", size = "normal", formData, updateFormData, formType }) => (
    <div className={cn("flex flex-col gap-1", size === "full" ? "md:col-span-2 lg:col-span-3" : "")}>
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        {inputType === "textarea" ? (
            <textarea
                value={formData[name] || ''}
                onChange={e => updateFormData(formType, name, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50/50 border border-slate-100 focus:border-indigo-300 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none transition-all min-h-[80px] resize-none"
            />
        ) : (
            <input
                type={inputType}
                value={formData[name] || ''}
                onChange={e => updateFormData(formType, name, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50/50 border border-slate-100 focus:border-indigo-300 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none transition-all"
            />
        )}
    </div>
);

const ToggleGroup = ({ label, name, options = ["No", "Si"], formData, updateFormData, formType }) => (
    <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{label}</span>
        <div className="flex gap-1 bg-white p-0.5 rounded-md border border-slate-100">
            {options.map(opt => {
                const active = formData[name] === opt;
                return (
                    <button
                        key={opt}
                        onClick={() => updateFormData(formType, name, opt)}
                        className={cn(
                            "px-2 py-0.5 text-[9px] font-black uppercase rounded transition-all min-w-[32px]",
                            active ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
    </div>
);

const CheckboxGroup = ({ label, items = [], className, formData, updateFormData, formType }) => (
    <div className={cn("md:col-span-2 lg:col-span-3 space-y-2 pb-2", className)}>
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="flex flex-wrap gap-2">
            {items.map(item => (
                <button
                    key={item.id}
                    onClick={() => updateFormData(formType, item.id, !formData[item.id])}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase",
                        formData[item.id]
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                    )}
                >
                    <div className={cn(
                        "w-3 h-3 rounded flex items-center justify-center border transition-all",
                        formData[item.id] ? "bg-indigo-500 border-indigo-500" : "border-slate-200"
                    )}>
                        {formData[item.id] && <CheckCircle2 size={8} className="text-white" />}
                    </div>
                    {item.label}
                </button>
            ))}
        </div>
    </div>
);

const SelectField = ({ label, name, options = [], formData, updateFormData, formType }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select
            value={formData[name] || ''}
            onChange={e => updateFormData(formType, name, e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-100 focus:border-indigo-300 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none transition-all"
        >
            <option value="">Seleccionar</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

const ToggleField = ({ label, name, detailName, formData, updateFormData, formType }) => (
    <div className="flex items-center gap-4 p-2 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors md:col-span-2 lg:col-span-3">
        <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{label}</span>
        </div>
        <div className="flex gap-1 bg-white p-0.5 rounded-md border border-slate-100 shrink-0">
            {["No", "Si"].map(opt => {
                const active = formData[name] === opt;
                return (
                    <button
                        key={opt}
                        onClick={() => updateFormData(formType, name, opt)}
                        className={cn(
                            "px-2 py-0.5 text-[9px] font-black uppercase rounded transition-all min-w-[32px]",
                            active ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
        <input
            type="text"
            value={formData[detailName] || ''}
            onChange={e => updateFormData(formType, detailName, e.target.value)}
            placeholder="Especificar detalladamente..."
            className="flex-1 bg-white border border-slate-100 focus:border-indigo-300 rounded-lg px-3 py-1 text-xs font-bold text-slate-700 outline-none transition-all"
        />
    </div>
);

const QuestionnaireView = ({ patientId, type: formType, onSaveSuccess }) => {
    const [openSections, setOpenSections] = React.useState(new Set(['initial', 'ped_initial', 'ped_illness', 'ped_pre']));
    const [saveStatus, setSaveStatus] = React.useState('idle'); // 'idle' | 'success' | 'error'
    const {
        forms,
        fetchForm,
        updateFormData,
        saveForm,
        saving
    } = useClinicalStore();

    useEffect(() => {
        if (patientId && formType) {
            fetchForm(patientId, formType);
        }
    }, [patientId, formType, fetchForm]);

    const form = forms[formType] || { data: {}, status: 'idle' };
    const formData = form.data || {};

    if (form.status === 'loading') return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 opacity-50">
            <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cargando formulario...</p>
        </div>
    );

    const commonProps = { formData, updateFormData, formType };
    const sectionProps = { formType, openSections, setOpenSections };

    return (
        <div className="flex-col h-full bg-white flex relative overflow-hidden">
            {/* ── Header ── */}
            <div className="px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                            {formType === 'ADULT_ANAMNESIS' ? 'Anamnesis Adulto' :
                                formType === 'PED_ANAMNESIS' ? 'Anamnesis Niños' :
                                    'Evaluación Endodóntica'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400">Expediente Clínico Digital</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            const success = await saveForm(patientId, formType);
                            if (success) {
                                if (onSaveSuccess) onSaveSuccess();
                                // Feedback visual temporal
                                setSaveStatus('success');
                                setTimeout(() => setSaveStatus('idle'), 3000);
                            } else {
                                setSaveStatus('error');
                                setTimeout(() => setSaveStatus('idle'), 3000);
                            }
                        }}
                        disabled={saving}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2",
                            saveStatus === 'success' ? "bg-emerald-500 text-white shadow-emerald-500/30" :
                                saveStatus === 'error' ? "bg-rose-500 text-white shadow-rose-500/30" :
                                    "bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700",
                            saving ? "opacity-50 cursor-not-allowed" : ""
                        )}
                    >
                        {saving ? <Activity className="animate-spin" size={14} /> :
                            saveStatus === 'success' ? <CheckCircle2 size={14} /> :
                                saveStatus === 'error' ? <AlertCircle size={14} /> :
                                    <Save size={14} />}
                        {saving ? 'Guardando...' :
                            saveStatus === 'success' ? '¡Guardado!' :
                                saveStatus === 'error' ? 'Error' :
                                    'Guardar Información'}
                    </button>
                </div>
            </div>

            {/* ── Scrollable Form ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {formType === 'ADULT_ANAMNESIS' && (
                    <>
                        <Section id="illness" title="Enfermedad Actual" icon={Activity} {...sectionProps}>
                            <Field label="Motivo de Consulta" name="consultationReason" placeholder="Ej. Dolor en molar superior..." size="full" {...commonProps} />
                            <Field label="Tiempo de enfermedad" name="illnessTime" placeholder="2 días, 1 semana..." {...commonProps} />
                            <Field label="Signos y síntomas" name="symptoms" placeholder="Dolor, inflamación..." {...commonProps} />
                            <Field label="Relato cronológico" name="chronologicalStory" placeholder="Inició hace 3 días..." type="textarea" size="full" {...commonProps} />
                            <Field label="Funciones biológicas" name="biologicalFunctions" {...commonProps} />
                        </Section>

                        <Section id="prev" title="Antecedentes" icon={AlertCircle} {...sectionProps}>
                            <Field label="Familiares" name="prevFamily" size="full" {...commonProps} />
                            <Field label="Personales" name="prevPersonal" size="full" {...commonProps} />
                            <ToggleGroup label="Presión Alta" name="highPressure" {...commonProps} />
                            <ToggleGroup label="Diabetes" name="diabetes" {...commonProps} />
                            <ToggleGroup label="Asma" name="asthma" {...commonProps} />
                            <ToggleGroup label="Alergias" name="allergies" {...commonProps} />
                            <ToggleGroup label="¿Fuma?" name="isSmoking" {...commonProps} />
                            <ToggleGroup label="¿Hepatitis?" name="hepatitis" {...commonProps} />
                            <Field label="Comentario adicional" name="additionalHistoryNotes" size="full" type="textarea" {...commonProps} />
                        </Section>

                        <Section id="exam" title="Examen Clínico / Notas Finales" icon={ClipboardList} {...sectionProps}>
                            <Field label="Examen Extraoral" name="extraoralExam" type="textarea" size="full" {...commonProps} />
                            <Field label="Examen Intraoral" name="intraoralExam" type="textarea" size="full" {...commonProps} />
                            <Field label="Diagnóstico" name="finalDiagnosis" type="textarea" size="full" {...commonProps} />
                            <Field label="Tratamiento Sugerido" name="suggestedTreatment" type="textarea" size="full" {...commonProps} />
                        </Section>
                    </>
                )}

                {formType === 'PED_ANAMNESIS' && (
                    <>
                        <Section id="ped_initial" title="Sección" icon={Activity} {...sectionProps}>
                            <Field label="Motivo de consulta" name="consultationReason" placeholder="Ej. Revisión general..." type="textarea" size="full" {...commonProps} />
                            <Field label="Nombre mamá" name="momName" {...commonProps} />
                            <Field label="Nombre papá" name="dadName" {...commonProps} />
                            <Field label="Número de hermanos" name="siblingsNumber" type="number" {...commonProps} />
                            <Field label="Orden" name="birthOrder" {...commonProps} />
                        </Section>

                        <Section id="ped_illness" title="Enfermedad Actual" icon={Activity} {...sectionProps}>
                            <Field label="Tipo de enfermedad" name="illnessType" type="textarea" size="full" {...commonProps} />
                            <Field label="Relato cronológico" name="chronologicalStory" type="textarea" size="full" {...commonProps} />
                        </Section>

                        <Section id="ped_pre" title="Antecedentes Prenatales" icon={Baby} {...sectionProps}>
                            <Field label="Enfermedades maternas" name="maternalDiseases" size="medium" {...commonProps} />
                            <Field label="¿Hubo complicaciones en el embarazo?" name="pregnancyComplications" size="medium" {...commonProps} />
                            <Field label="¿Fue un bebé prematuro?" name="pretermBaby" size="medium" {...commonProps} />
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Peso al nacer</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={formData.birthWeight || ''}
                                        onChange={e => updateFormData(formType, 'birthWeight', e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-100 focus:border-indigo-300 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none transition-all"
                                    />
                                    <span className="text-[10px] font-black text-slate-400">kg</span>
                                </div>
                            </div>
                            <Field label="Comentario" name="prenatalNotes" type="textarea" size="full" {...commonProps} />
                        </Section>

                        <Section id="ped_post" title="Antecedentes Postnatales" icon={Baby} {...sectionProps}>
                            <ToggleField label="¿Problemas en el parto?" name="birthProblems" detailName="birthProblemsDetail" {...commonProps} />
                            <ToggleField label="¿Usó chupón?" name="pacifierUse" detailName="pacifierUseDetail" {...commonProps} />
                            <ToggleField label="¿Usó biberón?" name="bottleUse" detailName="bottleUseDetail" {...commonProps} />
                            <ToggleField label="¿Se chupa/chupaba el dedo?" name="fingerSucking" detailName="fingerSuckingDetail" {...commonProps} />
                            <ToggleField label="¿Toma alguna medicación o terapia?" name="medicationTherapy" detailName="medicationTherapyDetail" {...commonProps} />
                            <ToggleField label="¿Es alérgico o intolerante a algo?" name="allergiesIntolerances" detailName="allergiesIntolerancesDetail" {...commonProps} />
                            <ToggleField label="¿Se cepilla antes de dormir?" name="brushBeforeSleep" detailName="brushBeforeSleepDetail" {...commonProps} />
                            <ToggleField label="¿Duerme con la boca abierta o ronca?" name="mouthBreatherSnore" detailName="mouthBreatherSnoreDetail" {...commonProps} />

                            <Field label="Comentario adicional" name="postnatalNotes" type="textarea" size="full" {...commonProps} />

                            <div className="flex flex-col gap-1 md:col-span-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">¿Cuánto dulce come?</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={formData.sweetConsumption || ''}
                                        onChange={e => updateFormData(formType, 'sweetConsumption', e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-100 focus:border-indigo-300 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none transition-all"
                                    />
                                    <span className="text-[10px] font-black text-slate-400 lowercase">Veces al día</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 md:col-span-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">¿Con qué frecuencia?</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={formData.sweetFrequency || ''}
                                        onChange={e => updateFormData(formType, 'sweetFrequency', e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-100 focus:border-indigo-300 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none transition-all"
                                    />
                                    <span className="text-[10px] font-black text-slate-400 lowercase">días/semana</span>
                                </div>
                            </div>

                            <Field label="¿Qué tipo de leche recibe el bebé?" name="milkType" size="full" {...commonProps} />
                            <Field label="¿Cómo le lava los dientes al bebé o niño?" name="brushMethod" size="full" {...commonProps} />
                            <Field label="Describa un día de comida de su bebé/niño desde el desayuno" name="foodDayDescription" type="textarea" size="full" {...commonProps} />
                            <Field label="¿Te consideras un papá/mamá autoritario, cooperador, despreocupado o sobreprotector?" name="parentingStyle" size="full" {...commonProps} />

                            <Field label="Hábitos orales" name="oralHabits" type="textarea" size="medium" {...commonProps} />
                            <Field label="Técnica de cepillado" name="brushingTechnique" type="textarea" size="medium" {...commonProps} />
                            <Field label="Examen clínico" name="clinicalExam" type="textarea" size="medium" {...commonProps} />
                            <Field label="Observaciones" name="observations" type="textarea" size="medium" {...commonProps} />
                        </Section>
                    </>
                )}

                {formType === 'ENDODONTICS' && (
                    <>
                        <Section id="initial" title="Información Inicial" icon={Activity} {...sectionProps}>
                            <Field label="¿Tratamiento endodóntico previo?" name="prevEndoTreatment" size="full" {...commonProps} />
                            <Field label="Historia del dolor" name="painHistory" size="full" {...commonProps} />
                            <Field label="Nota adicional" name="initialNotes" size="full" {...commonProps} />
                            <Field label="N° de diente" name="toothNumber" {...commonProps} />
                        </Section>

                        <Section id="clinical" title="Examen Clínico" icon={Stethoscope} {...sectionProps}>
                            <CheckboxGroup
                                label="Corona Anatómica"
                                items={[
                                    { id: 'ana_caries', label: 'Caries' },
                                    { id: 'ana_restoration', label: 'Restauración' },
                                    { id: 'ana_bruxism', label: 'Bruxismo' },
                                    { id: 'ana_fracture', label: 'Fractura' },
                                    { id: 'ana_pulp_expo', label: 'Fractura y exposición pulpar' },
                                ]}
                                {...commonProps}
                            />
                            <ToggleGroup label="Inflamación presente" name="hasInflammation" {...commonProps} />
                            <Field label="Especificar" name="inflammationDetail" {...commonProps} />
                            <SelectField label="Motivo" name="inflammationSelect" options={["Gingival", "Mucosa"]} {...commonProps} />

                            <ToggleGroup label="Fístulas" name="hasFistulas" {...commonProps} />
                            <Field label="Especificar" name="fistulasDetail" {...commonProps} />
                            <SelectField label="Zona" name="fistulasSelect" options={["Vestibular", "Palatino"]} {...commonProps} />

                            <ToggleGroup label="Gingivitis" name="hasGingivitis" {...commonProps} />
                            <SelectField label="Movilidad" name="mobilitySelect" options={["Grado 1", "Grado 2", "Grado 3"]} {...commonProps} />
                            <ToggleGroup label="Bolsas" name="hasPockets" {...commonProps} />
                            <Field label="Sondeo" name="pocketsDetail" {...commonProps} />
                            <ToggleGroup label="Sarro" name="hasCalculus" {...commonProps} />

                            <CheckboxGroup
                                label="Características del dolor"
                                items={[
                                    { id: 'pain_spontaneous', label: 'Espontáneo' },
                                    { id: 'pain_provoked', label: 'Provocado' },
                                    { id: 'pain_cold', label: 'Frío' },
                                    { id: 'pain_heat', label: 'Calor' },
                                    { id: 'pain_mastication', label: 'Masticación' },
                                    { id: 'pain_nocturnal', label: 'Nocturno' },
                                    { id: 'pain_air', label: 'Aire' },
                                    { id: 'pain_sweet', label: 'Dulce' },
                                    { id: 'pain_acid', label: 'Ácido' },
                                    { id: 'pain_irradiated', label: 'Irradiado' },
                                    { id: 'pain_diffuse', label: 'Difuso' },
                                    { id: 'pain_sharp', label: 'Punzante' },
                                    { id: 'pain_continuous', label: 'Continuo' },
                                    { id: 'pain_intermittent', label: 'Intermitente' },
                                    { id: 'pain_sporadic', label: 'Esporádico' },
                                ]}
                                {...commonProps}
                            />

                            <div className="md:col-span-1 space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dolor a la percusión</label>
                                <div className="flex gap-2">
                                    <ToggleGroup label="H" name="painPercussionH" {...commonProps} />
                                    <ToggleGroup label="V" name="painPercussionV" {...commonProps} />
                                </div>
                            </div>

                            <div className="md:col-span-1 space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dolor a la palpación</label>
                                <div className="flex gap-2">
                                    <ToggleGroup label="V" name="painPalpationV" {...commonProps} />
                                    <ToggleGroup label="L/P" name="painPalpationLP" {...commonProps} />
                                </div>
                            </div>

                            <Field label="Nota adicional" name="clinicalNotes" size="full" type="textarea" {...commonProps} />
                        </Section>

                        <Section id="vitality" title="Prueba de Vitalidad" icon={Heart} {...sectionProps}>
                            <ToggleGroup label="Calor (Sí/No)" name="vitality_heat" {...commonProps} />
                            <SelectField label="Duración" name="vitality_heat_dur" options={["Fugaz", "Persistente"]} {...commonProps} />
                            <SelectField label="Intensidad" name="vitality_heat_int" options={["Leve", "Moderada", "Severa"]} {...commonProps} />
                            <ToggleGroup label="Frío (Sí/No)" name="vitality_cold" {...commonProps} />
                            <SelectField label="Duración" name="vitality_cold_dur" options={["Fugaz", "Persistente"]} {...commonProps} />
                            <SelectField label="Intensidad" name="vitality_cold_int" options={["Leve", "Moderada", "Severa"]} {...commonProps} />
                        </Section>

                        <Section id="radio" title="Examen Radiográfico" icon={Activity} {...sectionProps}>
                            <CheckboxGroup
                                label="Cámara Pulpar"
                                items={[
                                    { id: 'cam_open', label: 'Abierta' },
                                    { id: 'cam_closed', label: 'Cerrada' },
                                    { id: 'cam_wide', label: 'Amplia' },
                                    { id: 'cam_narrow', label: 'Estrecha' },
                                    { id: 'cam_stones', label: 'Cálculos pulpares' },
                                ]}
                                {...commonProps}
                            />
                            <CheckboxGroup
                                label="Conducto(s)"
                                items={[
                                    { id: 'can_single', label: 'Único' },
                                    { id: 'can_2', label: '2 conductos' },
                                    { id: 'can_3', label: '3 conductos' },
                                    { id: 'can_4', label: '4 conductos' },
                                    { id: 'can_straight', label: 'Recto' },
                                    { id: 'can_curved', label: 'Curvo' },
                                    { id: 'can_wide', label: 'Amplio' },
                                    { id: 'can_narrow', label: 'Estrecho' },
                                    { id: 'can_prev_treated', label: 'Tratado anteriormente' },
                                    { id: 'can_open_apex', label: 'Ápice abierto' },
                                ]}
                                {...commonProps}
                            />
                            <ToggleGroup label="Lesión en Furca" name="rad_furca" {...commonProps} />
                            <ToggleGroup label="Lesión Apical" name="rad_apical" {...commonProps} />
                            <ToggleGroup label="Lesión Lateral" name="rad_lateral" {...commonProps} />
                            <ToggleGroup label="Lesión Endo-perio" name="rad_endoperio" {...commonProps} />
                            <ToggleGroup label="Raíces enanas" name="rad_dwarf_roots" {...commonProps} />
                            <ToggleGroup label="Fractura radicular" name="rad_fracture" {...commonProps} />
                            <SelectField label="Localización" name="rad_fracture_loc" options={["Apical", "Medio", "Coronal"]} {...commonProps} />
                            <ToggleGroup label="Calcificación" name="rad_calcification" {...commonProps} />
                            <SelectField label="Tipo" name="rad_calcification_type" options={["Total", "Parcial"]} {...commonProps} />
                            <ToggleGroup label="Ligamento periodontal" name="rad_pd_ligament" {...commonProps} />
                            <SelectField label="Estado" name="rad_pd_state" options={["Ensanchado", "Normal"]} {...commonProps} />
                            <ToggleGroup label="Reabsorción" name="rad_resorption" {...commonProps} />
                            <SelectField label="Tipo" name="rad_resorption_type" options={["Interna", "Externa"]} {...commonProps} />
                            <Field label="Nota adicional" name="radioNotes" size="full" {...commonProps} />
                        </Section>

                        <Section id="diag" title="Diagnósticos" icon={CheckCircle2} {...sectionProps}>
                            <CheckboxGroup
                                label="Pulpar de Presunción"
                                items={[
                                    { id: 'diag_p_normal', label: 'Pulpa normal' },
                                    { id: 'diag_p_rev', label: 'Pulpitis Reversible' },
                                    { id: 'diag_p_irrev_sym', label: 'Pulpitis Irreversible sintomática' },
                                    { id: 'diag_p_irrev_asym', label: 'Pulpitis Irreversible asintomática' },
                                    { id: 'diag_p_necrosis', label: 'Necrosis Pulpar' },
                                    { id: 'diag_p_prev_treated', label: 'Previamente tratado' },
                                    { id: 'diag_p_prev_init', label: 'Previamente iniciado' },
                                ]}
                                {...commonProps}
                            />
                            <Field label="Nota adicional" name="diagPNotes" size="full" {...commonProps} />
                            <CheckboxGroup
                                label="Diagnóstico Periapical"
                                items={[
                                    { id: 'diag_a_normal', label: 'Tejidos apicales sanos' },
                                    { id: 'diag_a_periodon_acute', label: 'Periodontitis apical aguda' },
                                    { id: 'diag_a_periodon_chronic', label: 'Periodontitis apical crónica' },
                                    { id: 'diag_a_abscess_acute', label: 'Absceso apical agudo' },
                                    { id: 'diag_a_abscess_chronic', label: 'Absceso apical crónico' },
                                    { id: 'diag_a_osteitis', label: 'Osteítis condensante' },
                                ]}
                                {...commonProps}
                            />
                            <Field label="Nota adicional" name="diagANotes" size="full" {...commonProps} />
                            <CheckboxGroup
                                label="Diagnóstico Definitivo"
                                items={[
                                    { id: 'diag_d_irrev', label: 'Pulpitis irreversible' },
                                    { id: 'diag_d_necrosis', label: 'Pulpa necrótica' },
                                ]}
                                {...commonProps}
                            />
                            <Field label="Nota adicional" name="diagDNotes" size="full" {...commonProps} />
                        </Section>

                        <Section id="plan" title="Tratamiento Indicado" icon={Save} {...sectionProps}>
                            <CheckboxGroup
                                label="Tratamiento"
                                items={[
                                    { id: 'plan_biopulp', label: 'Biopulpectomía' },
                                    { id: 'plan_apicect', label: 'Apicectomía' },
                                    { id: 'plan_necro', label: 'Necropulpectomía' },
                                    { id: 'plan_hemisect', label: 'Hemisección' },
                                    { id: 'plan_retraitment', label: 'Retratamiento' },
                                    { id: 'plan_radicect', label: 'Radicectomía' },
                                    { id: 'plan_bleaching', label: 'Blanqueamiento' },
                                    { id: 'plan_extract', label: 'Extracción' },
                                ]}
                                {...commonProps}
                            />
                            <Field label="Nota adicional" name="planNotes" size="full" type="textarea" {...commonProps} />
                        </Section>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                            <button
                                onClick={() => {
                                    const next = new Set(openSections);
                                    if (next.has('data')) next.delete('data');
                                    else next.add('data');
                                    setOpenSections(next);
                                }}
                                className="flex items-center justify-between px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer text-left w-full"
                            >
                                <h3 className="flex items-center gap-2 text-[11px] font-black text-slate-800 uppercase tracking-widest">
                                    <ClipboardList size={12} className="text-indigo-500" /> Datos Clínicos
                                </h3>
                                <div className={cn("transition-transform duration-300", openSections.has('data') ? "rotate-180" : "")}>
                                    <Plus size={14} className="text-slate-400" />
                                </div>
                            </button>
                            {openSections.has('data') && (
                                <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <div className="overflow-x-auto bg-slate-50/50 rounded-xl border border-slate-100 p-1">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    <th className="py-2 px-4">Conducto</th>
                                                    <th className="py-2 px-4">Long. Trabajo (mm)</th>
                                                    <th className="py-2 px-4">Punto Ref.</th>
                                                    <th className="py-2 px-4">Lima Inicial</th>
                                                    <th className="py-2 px-4">Última Lima Apical</th>
                                                    <th className="py-2 px-4">Tipo Cemento</th>
                                                    <th className="py-2 px-4">Cono Maestro</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[10px] font-bold text-slate-600">
                                                {[
                                                    { id: 'unico', label: 'Único' },
                                                    { id: 'vestibular', label: 'Vestibular' },
                                                    { id: 'palatino', label: 'Palatino/Lingual' },
                                                    { id: 'mesio_l', label: 'Mesio Lingual' },
                                                    { id: 'mesio_b', label: 'Mesio Bucal' },
                                                    { id: 'distal', label: 'Distal' },
                                                    { id: 'disto_b', label: 'Disto Bucal' },
                                                    { id: 'disto_l', label: 'Disto Lingual' }
                                                ].map(canal => (
                                                    <tr key={canal.id} className="border-b border-slate-50 group hover:bg-white transition-colors">
                                                        <td className="py-2 px-4 font-black text-indigo-500 uppercase">{canal.label}</td>
                                                        <td className="py-2 px-4"><input className="w-full h-7 bg-white border border-slate-100 rounded px-2" value={formData[`canal_${canal.id}_len`] || ''} onChange={e => updateFormData(formType, `canal_${canal.id}_len`, e.target.value)} /></td>
                                                        <td className="py-2 px-4"><input className="w-full h-7 bg-white border border-slate-100 rounded px-2" value={formData[`canal_${canal.id}_ref`] || ''} onChange={e => updateFormData(formType, `canal_${canal.id}_ref`, e.target.value)} /></td>
                                                        <td className="py-2 px-4"><input className="w-full h-7 bg-white border border-slate-100 rounded px-2" value={formData[`canal_${canal.id}_start`] || ''} onChange={e => updateFormData(formType, `canal_${canal.id}_start`, e.target.value)} /></td>
                                                        <td className="py-2 px-4"><input className="w-full h-7 bg-white border border-slate-100 rounded px-2" value={formData[`canal_${canal.id}_apical`] || ''} onChange={e => updateFormData(formType, `canal_${canal.id}_apical`, e.target.value)} /></td>
                                                        <td className="py-2 px-4"><input className="w-full h-7 bg-white border border-slate-100 rounded px-2" value={formData[`canal_${canal.id}_cem`] || ''} onChange={e => updateFormData(formType, `canal_${canal.id}_cem`, e.target.value)} /></td>
                                                        <td className="py-2 px-4"><input className="w-full h-7 bg-white border border-slate-100 rounded px-2" value={formData[`canal_${canal.id}_gut`] || ''} onChange={e => updateFormData(formType, `canal_${canal.id}_gut`, e.target.value)} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Field label="Nota adicional" name="clinicalTableNotes" size="full" {...commonProps} />
                                </div>
                            )}
                        </div>

                        <Section id="pron" title="Accidentes y Pronóstico" icon={ClipboardList} {...sectionProps}>
                            <Field label="Accidentes operatorios" name="operatoryAccidents" size="full" {...commonProps} />
                            <CheckboxGroup
                                label="Restauración post-endodóntica indicada"
                                items={[
                                    { id: 'post_poste', label: 'Poste' },
                                    { id: 'post_restora', label: 'Amalgama/Resina' },
                                    { id: 'post_corona', label: 'Corona' },
                                    { id: 'post_otro', label: 'Otro' },
                                ]}
                                {...commonProps}
                            />
                            <CheckboxGroup
                                label="Pronóstico"
                                items={[
                                    { id: 'pron_fav', label: 'Favorable' },
                                    { id: 'pron_unfav', label: 'Desfavorable' },
                                    { id: 'pron_res', label: 'Reservado' },
                                ]}
                                {...commonProps}
                            />
                        </Section>
                    </>
                )}
            </div>
        </div>
    );
};

export default QuestionnaireView;
