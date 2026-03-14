import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { patients, type VitalSign, type Patient } from "@/lib/mock-data";

interface NewVitalForm {
  patientId: string;
  temperature: string;
  heartRate: string;
  bloodPressureSys: string;
  bloodPressureDia: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
}

interface NovoSinalDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (v: VitalSign) => void;
  initialPatientId?: string;
}

export function NovoSinalDialog({ open, onOpenChange, onSave, initialPatientId }: NovoSinalDialogProps) {
  const allPatients: Patient[] = (() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : patients;
  })();

  const [form, setForm] = useState<NewVitalForm>({
    patientId: initialPatientId || "",
    temperature: "",
    heartRate: "",
    bloodPressureSys: "",
    bloodPressureDia: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patientId) e.patientId = "Selecione um paciente";
    if (!form.temperature || isNaN(Number(form.temperature))) e.temperature = "Obrigatório";
    if (!form.heartRate || isNaN(Number(form.heartRate))) e.heartRate = "Obrigatório";
    if (!form.bloodPressureSys || isNaN(Number(form.bloodPressureSys))) e.bloodPressureSys = "Obrigatório";
    if (!form.bloodPressureDia || isNaN(Number(form.bloodPressureDia))) e.bloodPressureDia = "Obrigatório";
    if (!form.respiratoryRate || isNaN(Number(form.respiratoryRate))) e.respiratoryRate = "Obrigatório";
    if (!form.oxygenSaturation || isNaN(Number(form.oxygenSaturation))) e.oxygenSaturation = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const weight = form.weight ? Number(form.weight) : undefined;
    const height = form.height ? Number(form.height) : undefined;
    const bmi = weight && height ? Math.round((weight / (height * height)) * 10) / 10 : undefined;
    
    onSave({
      id: crypto.randomUUID(),
      patientId: form.patientId,
      date: new Date().toISOString(),
      temperature: Number(form.temperature),
      heartRate: Number(form.heartRate),
      bloodPressureSys: Number(form.bloodPressureSys),
      bloodPressureDia: Number(form.bloodPressureDia),
      respiratoryRate: Number(form.respiratoryRate),
      oxygenSaturation: Number(form.oxygenSaturation),
      weight,
      height,
      bmi,
      professional: "Enf. Usuário Atual",
    });
    
    setForm({ 
      patientId: initialPatientId || "", 
      temperature: "", 
      heartRate: "", 
      bloodPressureSys: "", 
      bloodPressureDia: "", 
      respiratoryRate: "", 
      oxygenSaturation: "", 
      weight: "", 
      height: "" 
    });
    setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  const selectedPatient = allPatients.find(p => p.id === form.patientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Sinais Vitais</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!initialPatientId ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Paciente *</label>
              <select value={form.patientId} onChange={(e) => set("patientId", e.target.value)} className={inp("patientId")}>
                <option value="">Selecionar paciente...</option>
                {allPatients.filter(p => p.status !== "alta").map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.patientId && <p className="text-xs text-destructive mt-1">{errors.patientId}</p>}
            </div>
          ) : (
            <div className="bg-muted/30 p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">Paciente</p>
              <p className="text-sm font-semibold">{selectedPatient?.name}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Temperatura (°C) *</label>
              <input value={form.temperature} onChange={(e) => set("temperature", e.target.value)} className={inp("temperature")} placeholder="36.5" />
              {errors.temperature && <p className="text-xs text-destructive mt-1">{errors.temperature}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">FC (bpm) *</label>
              <input value={form.heartRate} onChange={(e) => set("heartRate", e.target.value)} className={inp("heartRate")} placeholder="78" />
              {errors.heartRate && <p className="text-xs text-destructive mt-1">{errors.heartRate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">PAS (mmHg) *</label>
              <input value={form.bloodPressureSys} onChange={(e) => set("bloodPressureSys", e.target.value)} className={inp("bloodPressureSys")} placeholder="120" />
              {errors.bloodPressureSys && <p className="text-xs text-destructive mt-1">{errors.bloodPressureSys}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">PAD (mmHg) *</label>
              <input value={form.bloodPressureDia} onChange={(e) => set("bloodPressureDia", e.target.value)} className={inp("bloodPressureDia")} placeholder="80" />
              {errors.bloodPressureDia && <p className="text-xs text-destructive mt-1">{errors.bloodPressureDia}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">FR (ipm) *</label>
              <input value={form.respiratoryRate} onChange={(e) => set("respiratoryRate", e.target.value)} className={inp("respiratoryRate")} placeholder="16" />
              {errors.respiratoryRate && <p className="text-xs text-destructive mt-1">{errors.respiratoryRate}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">SpO2 (%) *</label>
              <input value={form.oxygenSaturation} onChange={(e) => set("oxygenSaturation", e.target.value)} className={inp("oxygenSaturation")} placeholder="98" />
              {errors.oxygenSaturation && <p className="text-xs text-destructive mt-1">{errors.oxygenSaturation}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Peso (kg)</label>
              <input value={form.weight} onChange={(e) => set("weight", e.target.value)} className={inp("")} placeholder="Opcional" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Altura (m)</label>
              <input value={form.height} onChange={(e) => set("height", e.target.value)} className={inp("")} placeholder="Ex: 1.70" />
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2 text-xs">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Registrar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
