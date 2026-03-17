import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pill, Plus, Search, X, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients, prescriptions, type Prescription, type PrescriptionMedication, type Patient } from "@/lib/mock-data";
import { toast } from "sonner";
import { NovaPrescricaoDialog } from "@/components/NovaPrescricaoDialog";
import { PrintableDocument } from "@/components/PrintableDocument";
import { Printer } from "lucide-react";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const statusConfig = {
  ativa: { label: "Ativa", cls: "bg-success/10 text-success" },
  encerrada: { label: "Encerrada", cls: "bg-muted text-muted-foreground" },
  suspensa: { label: "Suspensa", cls: "bg-warning/10 text-warning" },
};

function PrescricaoCard({ rx, index, patient }: { rx: Prescription; index: number; patient?: Patient }) {
  const [expanded, setExpanded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const navigate = useNavigate();
  if (!patient) return null;
  const st = statusConfig[rx.status || "ativa"];

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
          {new Date(rx.date || rx.created_at).toLocaleDateString("pt-BR")}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {(rx.medications || [{ name: rx.medication, dose: rx.dosage, route: "", frequency: "", duration: "" }]).slice(0, expanded ? undefined : 2).map((med, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <Pill className="h-4 w-4 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <span className="font-medium">{med.name}</span>
              <span className="text-muted-foreground"> {med.dose} {med.route} • {med.frequency} • {med.duration}</span>
            </div>
          </div>
        ))}
        {(rx.medications || []).length > 2 && !expanded && (
          <span className="text-xs text-muted-foreground">+{(rx.medications || []).length - 2} medicamento(s)...</span>
        )}
      </div>

      {(rx.notes || rx.instructions) && expanded && (
        <div className="mt-3 px-3 py-2 rounded-md bg-warning/5 border border-warning/20 text-xs text-muted-foreground">
          <span className="font-medium text-warning">Observações:</span> {rx.notes || rx.instructions}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{rx.professional || rx.doctorId}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsPrinting(true);
              setTimeout(() => {
                window.print();
                setIsPrinting(false);
              }, 100);
            }}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
          >
            <Printer className="h-3 w-3" />
            Imprimir
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary font-medium"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Recolher" : "Ver detalhes"}
          </button>
        </div>
      </div>

      {isPrinting && (
        <PrintableDocument
          type="prescription"
          patient={{
            name: patient.name,
            age: patient.age,
            cpf: patient.cpf || "---",
            sex: patient.sex,
          }}
          items={rx.medications || [{ name: rx.medication, dose: rx.dosage, route: "", frequency: "", duration: "" }]}
          notes={rx.notes || rx.instructions}
          professionalLabel={rx.professional || rx.doctorId}
        />
      )}
    </motion.div>
  );
}

interface MedLine {
  name: string; dose: string; route: string; frequency: string; duration: string;
}


export default function Prescricoes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [allPatients, setAllPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : patients;
  });

  const [localPrescriptions, setLocalPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem("localPrescriptions");
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar prescrições no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem("localPrescriptions", JSON.stringify(localPrescriptions));
  }, [localPrescriptions]);

  // Atualizar lista de pacientes quando o diálogo for aberto
  useEffect(() => {
    if (dialogOpen) {
      const saved = localStorage.getItem("patients");
      const updatedPatients = saved ? JSON.parse(saved) : patients;
      setAllPatients(updatedPatients);
    }
  }, [dialogOpen]);

  // Listener para atualizar pacientes quando houver mudanças em outras abas/componentes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "patients" && e.newValue) {
        setAllPatients(JSON.parse(e.newValue));
      }
    };

    // Também verificar periodicamente se há mudanças
    const interval = setInterval(() => {
      const saved = localStorage.getItem("patients");
      if (saved) {
        const updatedPatients = JSON.parse(saved);
        // Só atualizar se houver mudança no número de pacientes
        if (updatedPatients.length !== allPatients.length) {
          setAllPatients(updatedPatients);
        }
      }
    }, 1000);

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [allPatients.length]);

  const allRx = [...localPrescriptions, ...prescriptions].sort(
    (a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()
  );

  const filtered = allRx.filter((rx) => {
    const p = allPatients.find((p) => p.id === rx.patientId);
    if (!p) return false;
    if (statusFilter !== "all" && rx.status !== statusFilter) return false;
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search);
  });

  const handleSave = (rxList: Prescription[]) => {
    setLocalPrescriptions((prev) => [...rxList, ...prev]);

    // Also save to global timeline
    const savedTimeline = localStorage.getItem("pep-timeline");
    const timeline = savedTimeline ? JSON.parse(savedTimeline) : [];
    rxList.forEach((rx) => {
      const ev = {
        id: rx.id,
        patientId: rx.patientId,
        type: "prescricao",
        date: rx.date || rx.created_at,
        title: "Prescrição Médica",
        summary: rx.medications ? rx.medications.map(m => m.name).join(", ") : rx.medication,
        professional: rx.professional || rx.doctorId
      };
      timeline.push(ev);
    });
    localStorage.setItem("pep-timeline", JSON.stringify(timeline));

    toast.success("Prescrição emitida com sucesso.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <NovaPrescricaoDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} patients={allPatients} />

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
          filtered.map((rx, i) => {
            const patient = allPatients.find((p) => p.id === rx.patientId);
            return <PrescricaoCard key={rx.id} rx={rx} index={i} patient={patient} />;
          })
        )}
      </div>
    </div>
  );
}
