import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { patients, type TimelineEvent } from "@/lib/mock-data";

interface NovaEvolucaoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (v: TimelineEvent) => void;
  type: "evolucao_medica" | "evolucao_enfermagem";
  initialPatientId?: string;
}

export function NovaEvolucaoDialog({ open, onOpenChange, onSave, type, initialPatientId }: NovaEvolucaoDialogProps) {
  const [patientId, setPatientId] = useState(initialPatientId || "");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!patientId) e.patientId = "Selecione um paciente";
    if (!title.trim()) e.title = "Título obrigatório";
    if (!summary.trim()) e.summary = "Resumo obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    onSave({
      id: crypto.randomUUID(),
      patientId,
      type,
      date: new Date().toISOString(),
      title: title.trim(),
      summary: summary.trim(),
      details: details.trim() || undefined,
      professional: type === "evolucao_medica" 
        ? "Dr. Usuário Atual — CRM 00000/SP" 
        : "Enf. Usuário Atual — COREN 00000/SP",
    });
    
    setPatientId(initialPatientId || "");
    setTitle("");
    setSummary("");
    setDetails("");
    setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  const selectedPatient = patients.find(p => p.id === patientId);
  const label = type === "evolucao_medica" ? "Evolução Médica" : "Evolução de Enfermagem";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova {label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!initialPatientId ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Paciente *</label>
              <select value={patientId} onChange={(e) => { setPatientId(e.target.value); setErrors(er => ({ ...er, patientId: "" })); }} className={inp("patientId")}>
                <option value="">Selecionar paciente...</option>
                {patients.map((p) => (
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

          <div>
            <label className="text-xs font-medium text-muted-foreground">Título *</label>
            <input 
              value={title} 
              onChange={(e) => { setTitle(e.target.value); setErrors(er => ({ ...er, title: "" })); }} 
              className={inp("title")} 
              placeholder={type === "evolucao_medica" ? "Ex: Evolução de Rotina" : "Ex: Cuidados de Enfermagem"} 
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Resumo (visualizado na linha do tempo) *</label>
            <input 
              value={summary} 
              onChange={(e) => { setSummary(e.target.value); setErrors(er => ({ ...er, summary: "" })); }} 
              className={inp("summary")} 
              placeholder="Breve resumo da conduta ou estado do paciente" 
            />
            {errors.summary && <p className="text-xs text-destructive mt-1">{errors.summary}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Evolução Completa</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={6}
              placeholder="Descreva detalhadamente a evolução..."
            />
          </div>
        </div>
        <DialogFooter className="mt-2 text-xs">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Salvar Evolução
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
