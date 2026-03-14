import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Plus, Thermometer, Heart, Wind, Droplets, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients, vitalSigns, type VitalSign, type Patient } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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

function NovoSinalDialog({ open, onOpenChange, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSave: (v: VitalSign) => void;
}) {
  const [form, setForm] = useState<NewVitalForm>({
    patientId: "", temperature: "", heartRate: "", bloodPressureSys: "",
    bloodPressureDia: "", respiratoryRate: "", oxygenSaturation: "", weight: "", height: "",
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
      weight, height, bmi,
      professional: "Enf. Usuário Atual",
    });
    setForm({ patientId: "", temperature: "", heartRate: "", bloodPressureSys: "", bloodPressureDia: "", respiratoryRate: "", oxygenSaturation: "", weight: "", height: "" });
    setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Sinais Vitais</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Paciente *</label>
            <select value={form.patientId} onChange={(e) => set("patientId", e.target.value)} className={inp("patientId")}>
              <option value="">Selecionar paciente...</option>
              {patients.filter(p => p.status !== "alta").map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.patientId && <p className="text-xs text-destructive mt-1">{errors.patientId}</p>}
          </div>

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
        <DialogFooter className="mt-2">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Registrar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SinaisVitais() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localVitals, setLocalVitals] = useState<VitalSign[]>([]);

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
