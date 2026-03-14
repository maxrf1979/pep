import { useState } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { patients, type Prescription, type PrescriptionMedication } from "@/lib/mock-data";

interface MedLine {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
}

interface NovaPrescricaoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (p: Prescription) => void;
  initialPatientId?: string;
}

export function NovaPrescricaoDialog({ open, onOpenChange, onSave, initialPatientId }: NovaPrescricaoDialogProps) {
  const [patientId, setPatientId] = useState(initialPatientId || "");
  const [notes, setNotes] = useState("");
  const [meds, setMeds] = useState<MedLine[]>([{ name: "", dose: "", route: "VO", frequency: "", duration: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMed = () => setMeds((m) => [...m, { name: "", dose: "", route: "VO", frequency: "", duration: "" }]);
  const removeMed = (i: number) => setMeds((m) => m.filter((_, idx) => idx !== i));
  const setMed = (i: number, k: keyof MedLine, v: string) =>
    setMeds((m) => m.map((med, idx) => (idx === i ? { ...med, [k]: v } : med)));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!patientId) e.patientId = "Selecione um paciente";
    meds.forEach((med, i) => {
      if (!med.name.trim()) e[`med_name_${i}`] = "Nome obrigatório";
      if (!med.dose.trim()) e[`med_dose_${i}`] = "Dose obrigatória";
      if (!med.frequency.trim()) e[`med_freq_${i}`] = "Frequência obrigatória";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: crypto.randomUUID(),
      patientId,
      date: new Date().toISOString(),
      medications: meds.map((m) => ({ ...m })) as PrescriptionMedication[],
      professional: "Dr. Usuário Atual — CRM 00000/SP",
      status: "ativa",
      notes: notes || undefined,
    });
    setPatientId(initialPatientId || ""); 
    setNotes(""); 
    setMeds([{ name: "", dose: "", route: "VO", frequency: "", duration: "" }]); 
    setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  const selectedPatient = patients.find(p => p.id === patientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Prescrição Médica</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!initialPatientId ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Paciente *</label>
              <select value={patientId} onChange={(e) => { setPatientId(e.target.value); setErrors((er) => ({ ...er, patientId: "" })); }} className={`w-full ${inp("patientId")}`}>
                <option value="">Selecionar paciente...</option>
                {patients.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
              {errors.patientId && <p className="text-xs text-destructive mt-1">{errors.patientId}</p>}
            </div>
          ) : (
            <div className="bg-muted/30 p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">Paciente</p>
              <p className="text-sm font-semibold">{selectedPatient?.name}</p>
            </div>
          )}

          {patientId && selectedPatient?.allergies.length ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/5 border border-destructive/20 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span><strong>Alergias:</strong> {selectedPatient.allergies.join(", ")}</span>
            </div>
          ) : null}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Medicamentos *</label>
              <button onClick={addMed} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                <Plus className="h-3 w-3" /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {meds.map((med, i) => (
                <div key={i} className="p-3 rounded-md border border-border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Medicamento {i + 1}</span>
                    {meds.length > 1 && (
                      <button onClick={() => removeMed(i)} className="text-xs text-destructive hover:underline flex items-center gap-1">
                        <X className="h-3 w-3" /> Remover
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input value={med.name} onChange={(e) => setMed(i, "name", e.target.value)} className={`w-full ${inp(`med_name_${i}`)}`} placeholder="Nome do medicamento *" />
                      {errors[`med_name_${i}`] && <p className="text-xs text-destructive mt-0.5">{errors[`med_name_${i}`]}</p>}
                    </div>
                    <div>
                      <input value={med.dose} onChange={(e) => setMed(i, "dose", e.target.value)} className={`w-full ${inp(`med_dose_${i}`)}`} placeholder="Dose * (ex: 500mg)" />
                      {errors[`med_dose_${i}`] && <p className="text-xs text-destructive mt-0.5">{errors[`med_dose_${i}`]}</p>}
                    </div>
                    <div>
                      <select value={med.route} onChange={(e) => setMed(i, "route", e.target.value)} className={`w-full ${inp("")}`}>
                        {["VO", "EV", "SC", "IM", "SL", "Inalatório", "Tópico"].map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <input value={med.frequency} onChange={(e) => setMed(i, "frequency", e.target.value)} className={`w-full ${inp(`med_freq_${i}`)}`} placeholder="Frequência * (ex: 8/8h)" />
                      {errors[`med_freq_${i}`] && <p className="text-xs text-destructive mt-0.5">{errors[`med_freq_${i}`]}</p>}
                    </div>
                    <div>
                      <input value={med.duration} onChange={(e) => setMed(i, "duration", e.target.value)} className={`w-full ${inp("")}`} placeholder="Duração (ex: 7 dias)" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={3}
              placeholder="Observações clínicas, cuidados especiais..."
            />
          </div>
        </div>
        <DialogFooter className="mt-2">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Emitir Prescrição
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
