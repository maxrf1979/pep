import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, AlertTriangle, Stethoscope, ClipboardPlus } from "lucide-react";
import { patients, type TimelineEvent } from "@/lib/mock-data";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se informado, o paciente é pré-selecionado e bloqueado */
  defaultPatientId?: string;
  onSave: (event: TimelineEvent) => void;
}

type EvoType = "evolucao_medica" | "evolucao_enfermagem";

interface SoapForm {
  patientId: string;
  type: EvoType;
  subjetivo: string;
  objetivo: string;
  avaliacao: string;
  plano: string;
}

const buildDetails = (f: SoapForm) =>
  [
    f.subjetivo ? `S — Subjetivo\n${f.subjetivo}` : null,
    f.objetivo ? `O — Objetivo\n${f.objetivo}` : null,
    f.avaliacao ? `A — Avaliação\n${f.avaliacao}` : null,
    f.plano ? `P — Plano\n${f.plano}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

const buildSummary = (f: SoapForm) => {
  const main = f.avaliacao || f.subjetivo || f.plano || "";
  const first = main.split("\n")[0].trim();
  return first.length > 120 ? first.slice(0, 117) + "…" : first;
};

export function NovaEvolucaoDialog({ open, onOpenChange, defaultPatientId, onSave }: Props) {
  const { user } = useAuth();
  const { can } = usePermissions();

  const [form, setForm] = useState<SoapForm>({
    patientId: defaultPatientId ?? "",
    type: "evolucao_medica",
    subjetivo: "",
    objetivo: "",
    avaliacao: "",
    plano: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canMedica = can("evolucao_medica.criar");
  const canEnfermagem = can("evolucao_enfermagem.criar");

  // Ajustar o tipo inicial caso o usuário tenha um perfil específico
  useEffect(() => {
    if (open) {
      if (!canMedica && canEnfermagem) {
        setForm((f) => ({ ...f, type: "evolucao_enfermagem" }));
      }
    }
  }, [open, canMedica, canEnfermagem]);

  const set = (k: keyof SoapForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patientId) e.patientId = "Selecione um paciente";
    if (!form.avaliacao.trim() && !form.subjetivo.trim())
      e.avaliacao = "Preencha ao menos Subjetivo ou Avaliação";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Defesa em profundidade (HEAD)
    if (form.type === "evolucao_medica" && !canMedica) {
      toast.error("Acesso não autorizado para evoulção médica.");
      return;
    }
    if (form.type === "evolucao_enfermagem" && !canEnfermagem) {
      toast.error("Acesso não autorizado para evolução de enfermagem.");
      return;
    }

    // Professional Name building (HEAD)
    let professionalLabel = "Usuário Desconhecido";
    if (user) {
      const profession =
        form.type === "evolucao_medica"
          ? `Dr(a). ${user.name}${user.crm ? ` — CRM ${user.crm}` : ""}`
          : `Enf. ${user.name}${user.coren ? ` — COREN ${user.coren}` : ""}`;
      professionalLabel = profession;
    }

    const patient = patients.find((p) => p.id === form.patientId);

    const event: TimelineEvent = {
      id: crypto.randomUUID(),
      patientId: form.patientId,
      type: form.type,
      date: new Date().toISOString(),
      title: form.type === "evolucao_medica" ? "Evolução Médica" : "Evolução de Enfermagem",
      summary: buildSummary(form) || `Evolução registrada para ${patient?.name}`,
      professional: professionalLabel,
      details: buildDetails(form) || undefined,
    };

    onSave(event);
    handleClose();
  };

  const handleClose = () => {
    setForm({
      patientId: defaultPatientId ?? "",
      type: "evolucao_medica",
      subjetivo: "",
      objetivo: "",
      avaliacao: "",
      plano: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  const selectedPatient = patients.find((p) => p.id === form.patientId);

  const textareaCls =
    "w-full px-3 py-2 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed";
  const inp =
    "w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

  // Se o usuário não puder criar nenhuma das duas
  if (open && !canMedica && !canEnfermagem) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Acesso Não Autorizado</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Você não possui permissões</h3>
              <p className="text-sm text-destructive/80 mt-1">
                Seu perfil não autoriza o registro de evoluções médicas ou de enfermagem.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Fechar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Evolução</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Paciente + Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Paciente *</label>
              {defaultPatientId ? (
                <div className={`${inp} border-subtle flex items-center text-foreground cursor-not-allowed opacity-70`}>
                  {selectedPatient?.name ?? "—"}
                </div>
              ) : (
                <>
                  <select
                    value={form.patientId}
                    onChange={(e) => set("patientId", e.target.value)}
                    className={`${inp} ${errors.patientId ? "border-destructive" : "border-border"}`}
                  >
                    <option value="">Selecionar paciente...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.patientId && (
                    <p className="text-xs text-destructive mt-1">{errors.patientId}</p>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo de evolução *</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(
                  [
                    { key: "evolucao_medica", label: "Médica", Icon: Stethoscope, canDo: canMedica },
                    { key: "evolucao_enfermagem", label: "Enfermagem", Icon: ClipboardPlus, canDo: canEnfermagem },
                  ] as const
                ).map(({ key, label, Icon, canDo }) => (
                  <button
                    key={key}
                    type="button"
                    disabled={!canDo}
                    onClick={() => set("type", key)}
                    className={`flex items-center gap-2 h-9 px-3 rounded-md border text-sm font-medium transition-colors ${
                      !canDo ? "opacity-50 cursor-not-allowed" : ""
                    } ${
                      form.type === key
                        ? key === "evolucao_medica"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-success bg-success/10 text-success"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alerta alergias */}
          {selectedPatient && selectedPatient.allergies.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/5 border border-destructive/20 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>
                <strong>Atenção — Alergias:</strong> {selectedPatient.allergies.join(", ")}
              </span>
            </div>
          )}

          {/* Separador SOAP */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
              Registro SOAP
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* S — Subjetivo */}
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-xs font-bold text-primary w-5">S</span>
              <label className="text-xs font-semibold text-foreground">Subjetivo</label>
              <span className="text-xs text-muted-foreground">— queixas e sintomas relatados</span>
            </div>
            <textarea
              value={form.subjetivo}
              onChange={(e) => set("subjetivo", e.target.value)}
              className={textareaCls}
              rows={3}
              placeholder="QP: …&#10;HDA: …"
            />
          </div>

          {/* O — Objetivo */}
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-xs font-bold text-primary w-5">O</span>
              <label className="text-xs font-semibold text-foreground">Objetivo</label>
              <span className="text-xs text-muted-foreground">— exame físico e dados mensuráveis</span>
            </div>
            <textarea
              value={form.objetivo}
              onChange={(e) => set("objetivo", e.target.value)}
              className={textareaCls}
              rows={3}
              placeholder="Estado geral: …&#10;Ausculta: …"
            />
          </div>

          {/* A — Avaliação */}
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-xs font-bold text-primary w-5">A</span>
              <label className="text-xs font-semibold text-foreground">Avaliação *</label>
              <span className="text-xs text-muted-foreground">— diagnóstico / hipótese</span>
            </div>
            <textarea
              value={form.avaliacao}
              onChange={(e) => set("avaliacao", e.target.value)}
              className={`${textareaCls} ${errors.avaliacao ? "border-destructive" : ""}`}
              rows={2}
              placeholder="Hipótese diagnóstica…"
            />
            {errors.avaliacao && (
              <p className="text-xs text-destructive mt-1">{errors.avaliacao}</p>
            )}
          </div>

          {/* P — Plano */}
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-xs font-bold text-primary w-5">P</span>
              <label className="text-xs font-semibold text-foreground">Plano</label>
              <span className="text-xs text-muted-foreground">— conduta terapêutica</span>
            </div>
            <textarea
              value={form.plano}
              onChange={(e) => set("plano", e.target.value)}
              className={textareaCls}
              rows={3}
              placeholder="1. Conduta…&#10;2. Medicação…"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <button onClick={handleClose} className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Salvar Evolução
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
