import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Plus, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients, examRequests, type ExamRequest, type Patient } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PrintableDocument } from "@/components/PrintableDocument";

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

function ExameCard({ exam, index, patient }: { exam: ExamRequest; index: number; patient?: Patient }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  if (!patient) return null;
  const examAny = exam as any;
  const st = statusConfig[examAny.status || "solicitado"];
  const tp = typeConfig[examAny.type || "laboratorial"];

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
          {new Date(exam.created_at || examAny.requestDate).toLocaleDateString("pt-BR")}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-medium">{exam.examName || examAny.name}</span>
        </div>
      </div>

      {examAny.result && (
        <>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 pt-3 border-t border-border"
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">Resultado:</p>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-md p-3">
                {examAny.result}
              </pre>
            </motion.div>
          )}
        </>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{examAny.professional || "Dr. Administrador"}</span>
        {examAny.result && (
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

interface ExamLine {
  id: string;
  name: string;
  type: string;
}

const emptyLine = (): ExamLine => ({ id: crypto.randomUUID(), name: "", type: "laboratorial" });

function NovoExameDialog({ open, onOpenChange, onSave, patients }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSave: (exams: any[]) => void; patients: Patient[];
}) {
  const [patientId, setPatientId] = useState("");
  const [exams, setExams] = useState<ExamLine[]>([emptyLine()]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addLine = () => setExams((l) => [...l, emptyLine()]);

  const removeLine = (id: string) =>
    setExams((l) => { if (l.length > 1) return l.filter((e) => e.id !== id); return l; });

  const setLine = (id: string, k: keyof ExamLine, v: string) => {
    setExams((l) => l.map((ex) => (ex.id === id ? { ...ex, [k]: v } : ex)));
    setErrors((e) => { const next = { ...e }; delete next[`name_${id}`]; return next; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!patientId) e.patientId = "Selecione um paciente";
    exams.forEach((ex) => {
      if (!ex.name.trim()) e[`name_${ex.id}`] = "Obrigatório";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    const result = exams.map((l) => ({
      id: crypto.randomUUID(),
      patientId,
      requestDate: now,
      type: l.type,
      name: l.name.trim(),
      status: "solicitado",
      professional: "Dr. Usuário Atual — CRM 00000/SP",
    }));

    onSave(result);
    handleClose();
  };

  const handleClose = () => {
    setPatientId(""); setNotes(""); setExams([emptyLine()]); setErrors({});
    onOpenChange(false);
  };

  const handleEmitirEImprimir = () => {
    if (!validate()) return;
    setTimeout(() => {
      window.print();
      handleSave();
    }, 100);
  };

  const inp = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Exame</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Paciente *</label>
            <select
              value={patientId}
              onChange={(e) => { setPatientId(e.target.value); setErrors((er) => ({ ...er, patientId: "" })); }}
              className={inp("patientId")}
            >
              <option value="">Selecionar paciente...</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.patientId && <p className="text-xs text-destructive mt-1">{errors.patientId}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">
                Exames solicitados *
                <span className="ml-1.5 text-muted-foreground/60 font-normal">
                  ({exams.length} {exams.length === 1 ? "exame" : "exames"})
                </span>
              </label>
              <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Adicionar exame
              </button>
            </div>

            <div className="space-y-2">
              {exams.map((line, i) => (
                <div key={line.id} className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground mt-2.5 w-5 shrink-0 tabular-nums text-right">{i+1}.</span>
                  <div className="flex-1 min-w-0">
                    <input
                      value={line.name}
                      onChange={(e) => setLine(line.id, "name", e.target.value)}
                      className={inp(`name_${line.id}`)}
                      placeholder="Nome do exame"
                    />
                    {errors[`name_${line.id}`] && <p className="text-xs text-destructive mt-0.5">{errors[`name_${line.id}`]}</p>}
                  </div>
                  <select
                    value={line.type}
                    onChange={(e) => setLine(line.id, "type", e.target.value)}
                    className="h-9 px-2 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 w-36"
                  >
                    <option value="laboratorial">Laboratorial</option>
                    <option value="imagem">Imagem</option>
                    <option value="funcional">Funcional</option>
                    <option value="outro">Outro</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    disabled={exams.length === 1}
                    className="mt-1.5 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-25"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Justificativa / Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
              placeholder="Indicação clínica, urgência..."
            />
          </div>
        </div>

        <DialogFooter className="mt-2 text-xs">
          <button onClick={handleClose} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md font-medium hover:bg-muted transition-colors">
            Apenas Solicitar
          </button>
          <button onClick={handleEmitirEImprimir} className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Solicitar e Imprimir
          </button>
        </DialogFooter>

        {patients.find(p => p.id === patientId) && (
          <PrintableDocument
            type="exam"
            patient={{
              name: patients.find(p => p.id === patientId)!.name,
              age: patients.find(p => p.id === patientId)!.age,
              cpf: patients.find(p => p.id === patientId)!.cpf || "---",
              sex: patients.find(p => p.id === patientId)!.sex,
            }}
            items={exams.map(e => ({ name: e.name, type: e.type }))}
            notes={notes}
            professionalLabel="Dr. Usuário Atual — CRM 00000/SP"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Exames() {
  const [search, setSearch] = useState("");
  
  const allPatients: Patient[] = (() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : patients;
  })();

  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localExams, setLocalExams] = useState<any[]>(() => {
    const saved = localStorage.getItem("localExams");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("localExams", JSON.stringify(localExams));
  }, [localExams]);

  const allExams = [...localExams, ...examRequests].sort(
    (a: any, b: any) => new Date(b.created_at || b.requestDate).getTime() - new Date(a.created_at || a.requestDate).getTime()
  );

  const filtered = allExams.filter((eAny: any) => {
    const e = eAny;
    const p = allPatients.find((p) => p.id === e.patientId);
    if (!p) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    const name = e.examName || e.name || "";
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search) || name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSave = (newExams: any[]) => {
    setLocalExams((prev) => [...newExams, ...prev]);
    toast.success(
      newExams.length === 1
        ? "Exame solicitado com sucesso."
        : `${newExams.length} exames solicitados com sucesso.`
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <NovoExameDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} patients={allPatients} />

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
          filtered.map((e, i) => {
            const patient = allPatients.find((p) => p.id === e.patientId);
            return <ExameCard key={e.id} exam={e} index={i} patient={patient} />;
          })
        )}
      </div>
    </div>
  );
}
