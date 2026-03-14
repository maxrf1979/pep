import { useState } from "react";
import { motion } from "framer-motion";
import { Pill, Plus, Search, X, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients, prescriptions, type Prescription, type PrescriptionMedication } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const statusConfig = {
  ativa: { label: "Ativa", cls: "bg-success/10 text-success" },
  encerrada: { label: "Encerrada", cls: "bg-muted text-muted-foreground" },
  suspensa: { label: "Suspensa", cls: "bg-warning/10 text-warning" },
};

function PrescricaoCard({ rx, index }: { rx: Prescription; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const patient = patients.find((p) => p.id === rx.patientId);
  if (!patient) return null;
  const st = statusConfig[rx.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: index * 0.04 }}
      className="bg-card rounded-lg p-4 shadow-card border-subtle"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/prontuario/${patient.id}`)}
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              {patient.name}
            </button>
            <span className={`badge-status ${st.cls}`}>{st.label}</span>
            {patient.allergies.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/5 border border-destructive/20 px-2 py-0.5 rounded-full">
                <AlertTriangle className="h-3 w-3" strokeWidth={2} />
                {patient.allergies.join(", ")}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {patient.age} anos • {patient.sex === "M" ? "Masc." : "Fem."}
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right shrink-0 tabular-nums">
          {new Date(rx.date).toLocaleDateString("pt-BR")}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {rx.medications.slice(0, expanded ? undefined : 2).map((med, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <Pill className="h-4 w-4 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <span className="font-medium">{med.name}</span>
              <span className="text-muted-foreground"> {med.dose} {med.route} • {med.frequency} • {med.duration}</span>
            </div>
          </div>
        ))}
        {rx.medications.length > 2 && !expanded && (
          <span className="text-xs text-muted-foreground">+{rx.medications.length - 2} medicamento(s)...</span>
        )}
      </div>

      {rx.notes && expanded && (
        <div className="mt-3 px-3 py-2 rounded-md bg-warning/5 border border-warning/20 text-xs text-muted-foreground">
          <span className="font-medium text-warning">Observações:</span> {rx.notes}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{rx.professional}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary font-medium"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Recolher" : "Ver detalhes"}
        </button>
      </div>
    </motion.div>
  );
}

interface MedLine {
  name: string; dose: string; route: string; frequency: string; duration: string;
}

function NovaPrescricaoDialog({ open, onOpenChange, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSave: (p: Prescription) => void;
}) {
  const [patientId, setPatientId] = useState("");
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
    setPatientId(""); setNotes(""); setMeds([{ name: "", dose: "", route: "VO", frequency: "", duration: "" }]); setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Prescrição Médica</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Paciente *</label>
            <select value={patientId} onChange={(e) => { setPatientId(e.target.value); setErrors((er) => ({ ...er, patientId: "" })); }} className={`w-full ${inp("patientId")}`}>
              <option value="">Selecionar paciente...</option>
              {patients.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
            {errors.patientId && <p className="text-xs text-destructive mt-1">{errors.patientId}</p>}
          </div>

          {patientId && patients.find((p) => p.id === patientId)?.allergies.length ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/5 border border-destructive/20 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span><strong>Alergias:</strong> {patients.find((p) => p.id === patientId)?.allergies.join(", ")}</span>
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

export default function Prescricoes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localPrescriptions, setLocalPrescriptions] = useState<Prescription[]>([]);

  const allRx = [...localPrescriptions, ...prescriptions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = allRx.filter((rx) => {
    const p = patients.find((p) => p.id === rx.patientId);
    if (!p) return false;
    if (statusFilter !== "all" && rx.status !== statusFilter) return false;
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search);
  });

  const handleSave = (rx: Prescription) => {
    setLocalPrescriptions((prev) => [rx, ...prev]);
    toast.success("Prescrição emitida com sucesso.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <NovaPrescricaoDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prescrições</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerenciamento de prescrições médicas
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nova Prescrição
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-md bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "Todas" },
            { key: "ativa", label: "Ativas" },
            { key: "suspensa", label: "Suspensas" },
            { key: "encerrada", label: "Encerradas" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} prescrição(ões)</div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nenhuma prescrição encontrada.
          </div>
        ) : (
          filtered.map((rx, i) => <PrescricaoCard key={rx.id} rx={rx} index={i} />)
        )}
      </div>
    </div>
  );
}
