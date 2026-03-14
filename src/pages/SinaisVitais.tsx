import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Plus, Thermometer, Heart, Wind, Droplets, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients, vitalSigns, type VitalSign, type Patient } from "@/lib/mock-data";
import { toast } from "sonner";
import { NovoSinalDialog } from "@/components/NovoSinalDialog";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

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

function VitalBadge({ label, value, unit, icon: Icon, normal }: {
  label: string; value: number; unit: string;
  icon: typeof Heart; normal: [number, number];
}) {
  const ok = value >= normal[0] && value <= normal[1];
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium ${ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
      <span className="text-muted-foreground">{label}:</span>
      <span className="tabular-nums">{value}{unit}</span>
    </div>
  );
}

function VitalCard({ vital, patient, index }: { vital: VitalSign; patient: Patient; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: index * 0.04 }}
      className="bg-card rounded-lg p-4 shadow-card border-subtle"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <button
            onClick={() => navigate(`/prontuario/${patient.id}`)}
            className="text-sm font-semibold hover:text-primary transition-colors"
          >
            {patient.name}
          </button>
          <div className="text-xs text-muted-foreground mt-0.5">
            {patient.age} anos • {patient.sex === "M" ? "Masc." : "Fem."} • {patient.cpf}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground shrink-0">
          <div className="tabular-nums font-medium">
            {new Date(vital.date).toLocaleDateString("pt-BR")}
          </div>
          <div className="tabular-nums">
            {new Date(vital.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <VitalBadge label="T" value={vital.temperature} unit="°C" icon={Thermometer} normal={[36, 37.5]} />
        <VitalBadge label="FC" value={vital.heartRate} unit="bpm" icon={Heart} normal={[60, 100]} />
        <VitalBadge label="PAS" value={vital.bloodPressureSys} unit="mmHg" icon={Activity} normal={[90, 139]} />
        <VitalBadge label="PAD" value={vital.bloodPressureDia} unit="mmHg" icon={Activity} normal={[60, 89]} />
        <VitalBadge label="FR" value={vital.respiratoryRate} unit="ipm" icon={Wind} normal={[12, 20]} />
        <VitalBadge label="SpO2" value={vital.oxygenSaturation} unit="%" icon={Droplets} normal={[95, 100]} />
        {vital.weight && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50 text-xs text-muted-foreground">
            Peso: <span className="tabular-nums font-medium text-foreground">{vital.weight}kg</span>
          </div>
        )}
        {vital.bmi && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50 text-xs text-muted-foreground">
            IMC: <span className={`tabular-nums font-medium ${vital.bmi < 18.5 || vital.bmi >= 30 ? "text-destructive" : vital.bmi >= 25 ? "text-warning" : "text-success"}`}>{vital.bmi}</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">{vital.professional}</div>
    </motion.div>
  );
}

export default function SinaisVitais() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localVitals, setLocalVitals] = useState<VitalSign[]>(() => {
    const saved = localStorage.getItem("localVitals");
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar sinais vitais no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem("localVitals", JSON.stringify(localVitals));
  }, [localVitals]);

  const allVitals = [...localVitals, ...vitalSigns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = allVitals.filter((v) => {
    const p = patients.find((p) => p.id === v.patientId);
    if (!p) return false;
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search);
  });

  const handleSave = (v: VitalSign) => {
    setLocalVitals((prev) => [v, ...prev]);

    // Also save to global timeline
    const savedTimeline = localStorage.getItem("pep-timeline");
    const timeline = savedTimeline ? JSON.parse(savedTimeline) : [];
    const ev = {
      id: crypto.randomUUID(),
      patientId: v.patientId,
      type: "sinais_vitais",
      date: v.date,
      title: "Sinais Vitais",
      summary: `T ${v.temperature}°C | FC ${v.heartRate}bpm`,
      professional: v.professional
    };
    localStorage.setItem("pep-timeline", JSON.stringify([ev, ...timeline]));

    toast.success("Sinais vitais registrados com sucesso.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <NovoSinalDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sinais Vitais</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro e monitoramento de sinais vitais dos pacientes
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Registrar Sinais
        </button>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success" />
          Normal
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
          Fora do intervalo de referência
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filtrar por paciente (nome ou CPF)..."
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

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nenhum registro encontrado.
          </div>
        ) : (
          filtered.map((v, i) => {
            const p = patients.find((p) => p.id === v.patientId);
            if (!p) return null;
            return <VitalCard key={v.id} vital={v} patient={p} index={i} />;
          })
        )}
      </div>
    </div>
  );
}
