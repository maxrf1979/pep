import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { type TimelineEvent, type Patient } from "@/lib/mock-data";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface NovaEvolucaoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (v: TimelineEvent) => void;
  type: "evolucao_medica" | "evolucao_enfermagem";
  initialPatientId?: string;
  patients: Patient[];
}

export function NovaEvolucaoDialog({ open, onOpenChange, onSave, type, initialPatientId, patients }: NovaEvolucaoDialogProps) {
  const { user } = useAuth();
  const { can, isEnfermeiro, isMedico, isAdmin } = usePermissions();
  const [patientId, setPatientId] = useState(initialPatientId || "");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Validar permissões ao abrir o dialog
  useEffect(() => {
    if (!open) {
      setIsUnauthorized(false);
      return;
    }

    // Verificar se o usuário tem permissão para criar este tipo de evolução
    if (type === "evolucao_medica") {
      if (!can("evolucao_medica.criar")) {
        setIsUnauthorized(true);
        toast.error("Acesso não autorizado para este perfil de usuário.");
        // Fechar o dialog automaticamente após 2 segundos
        const timeout = setTimeout(() => {
          onOpenChange(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else if (type === "evolucao_enfermagem") {
      if (!can("evolucao_enfermagem.criar")) {
        setIsUnauthorized(true);
        toast.error("Acesso não autorizado para este perfil de usuário.");
        const timeout = setTimeout(() => {
          onOpenChange(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [open, type, can, onOpenChange]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!patientId) e.patientId = "Selecione um paciente";
    if (!title.trim()) e.title = "Título obrigatório";
    if (!summary.trim()) e.summary = "Resumo obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    // Verificar permissão novamente (defesa em profundidade)
    if (type === "evolucao_medica" && !can("evolucao_medica.criar")) {
      toast.error("Acesso não autorizado. Você não pode criar evolução médica.");
      return;
    }

    if (type === "evolucao_enfermagem" && !can("evolucao_enfermagem.criar")) {
      toast.error("Acesso não autorizado. Você não pode criar evolução de enfermagem.");
      return;
    }

    if (!validate()) return;

    // Montar o nome do profissional com informações reais da sessão
    let professionalName = "Usuário Desconhecido";
    if (user) {
      const profession = type === "evolucao_medica"
        ? `Dr(a). ${user.name}${user.crm ? ` — CRM ${user.crm}` : ""}`
        : `Enf. ${user.name}${user.coren ? ` — COREN ${user.coren}` : ""}`;
      professionalName = profession;
    }

    onSave({
      id: crypto.randomUUID(),
      patientId,
      type,
      date: new Date().toISOString(),
      title: title.trim(),
      summary: summary.trim(),
      details: details.trim() || undefined,
      professional: professionalName,
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

  if (isUnauthorized) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Acesso Não Autorizado</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">
                Você não tem permissão para esta ação
              </h3>
              <p className="text-sm text-destructive/80 mt-2">
                {type === "evolucao_medica"
                  ? "Apenas MÉDICOS podem criar evolução médica. Enfermeiros podem criar evolução de enfermagem."
                  : "Apenas ENFERMEIROS podem criar evolução de enfermagem."}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
