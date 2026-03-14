import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Plus, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients, exams, type Exam } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const statusConfig = {
  solicitado: { label: "Solicitado", cls: "bg-muted text-muted-foreground" },
  coletado: { label: "Coletado", cls: "bg-warning/10 text-warning" },
  resultado_disponivel: { label: "Resultado Disponível", cls: "bg-success/10 text-success" },
  entregue: { label: "Entregue", cls: "bg-primary/10 text-primary" },
};

const typeConfig = {
  laboratorial: { label: "Laboratorial", cls: "bg-primary/10 text-primary" },
  imagem: { label: "Imagem", cls: "bg-warning/10 text-warning" },
  funcional: { label: "Funcional", cls: "bg-success/10 text-success" },
  outro: { label: "Outro", cls: "bg-muted text-muted-foreground" },
};

function ExameCard({ exam, index }: { exam: Exam; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const patient = patients.find((p) => p.id === exam.patientId);
  if (!patient) return null;
  const st = statusConfig[exam.status];
  const tp = typeConfig[exam.type];

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
            <span className={`badge-status ${tp.cls}`}>{tp.label}</span>
            <span className={`badge-status ${st.cls}`}>{st.label}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {patient.age} anos • {patient.sex === "M" ? "Masc." : "Fem."}
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right shrink-0 tabular-nums">
          {new Date(exam.requestDate).toLocaleDateString("pt-BR")}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-medium">{exam.name}</span>
        </div>
      </div>

      {exam.result && (
        <>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 pt-3 border-t border-border"
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">Resultado:</p>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-md p-3">
                {exam.result}
              </pre>
            </motion.div>
          )}
        </>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{exam.professional}</span>
        {exam.result && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary font-medium"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Recolher" : "Ver resultado"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function NovoExameDialog({ open, onOpenChange, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSave: (e: Exam) => void;
}) {
  const [form, setForm] = useState({
    patientId: "", name: "", type: "laboratorial" as Exam["type"], notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patientId) e.patientId = "Selecione um paciente";
    if (!form.name.trim()) e.name = "Nome do exame obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: crypto.randomUUID(),
      patientId: form.patientId,
      requestDate: new Date().toISOString(),
      type: form.type,
      name: form.name.trim(),
      status: "solicitado",
      professional: "Dr. Usuário Atual — CRM 00000/SP",
    });
    setForm({ patientId: "", name: "", type: "laboratorial", notes: "" });
    setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Exame</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Paciente *</label>
            <select value={form.patientId} onChange={(e) => set("patientId", e.target.value)} className={inp("patientId")}>
              <option value="">Selecionar paciente...</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.patientId && <p className="text-xs text-destructive mt-1">{errors.patientId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Nome do exame *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inp("name")} placeholder="Ex: Hemograma Completo" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inp("")}>
                <option value="laboratorial">Laboratorial</option>
                <option value="imagem">Imagem</option>
                <option value="funcional">Funcional</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Justificativa / Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={3}
              placeholder="Indicação clínica, urgência..."
            />
          </div>
        </div>
        <DialogFooter className="mt-2">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Solicitar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Exames() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localExams, setLocalExams] = useState<Exam[]>([]);

  const allExams = [...localExams, ...exams].sort(
    (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
  );

  const filtered = allExams.filter((e) => {
    const p = patients.find((p) => p.id === e.patientId);
    if (!p) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search) || e.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSave = (e: Exam) => {
    setLocalExams((prev) => [e, ...prev]);
    toast.success("Exame solicitado com sucesso.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <NovoExameDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exames</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Solicitação e acompanhamento de exames
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Solicitar Exame
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por paciente ou exame..."
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
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "Todos tipos" },
            { key: "laboratorial", label: "Laboratorial" },
            { key: "imagem", label: "Imagem" },
            { key: "funcional", label: "Funcional" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                typeFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "Todos status" },
            { key: "solicitado", label: "Solicitado" },
            { key: "coletado", label: "Coletado" },
            { key: "resultado_disponivel", label: "Resultado" },
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

      <div className="text-xs text-muted-foreground">{filtered.length} exame(s)</div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nenhum exame encontrado.
          </div>
        ) : (
          filtered.map((e, i) => <ExameCard key={e.id} exam={e} index={i} />)
        )}
      </div>
    </div>
  );
}
