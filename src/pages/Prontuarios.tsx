import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, FileText, ChevronRight, Activity, Pill, FlaskConical, Stethoscope, ClipboardPlus, Paperclip, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients, timelineEvents, type TimelineEvent, type VitalSign, type Prescription, type Exam, type Patient } from "@/lib/mock-data";
import { toast } from "sonner";

// New Dialog Components
import { NovoSinalDialog } from "@/components/NovoSinalDialog";
import { NovaPrescricaoDialog } from "@/components/NovaPrescricaoDialog";
import { NovaEvolucaoDialog } from "@/components/NovaEvolucaoDialog";
import { NovoAnexoDialog } from "@/components/NovoAnexoDialog";
import { RequestExamDialog } from "@/components/RequestExamDialog";

const transition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

const typeIcon: Record<string, typeof FileText> = {
  evolucao_medica: Stethoscope,
  evolucao_enfermagem: ClipboardPlus,
  sinais_vitais: Activity,
  prescricao: Pill,
  exame: FlaskConical,
  anexo: Paperclip,
};

const typeLabel: Record<string, string> = {
  evolucao_medica: "Evolução Médica",
  evolucao_enfermagem: "Evolução Enfermagem",
  sinais_vitais: "Sinais Vitais",
  prescricao: "Prescrição",
  exame: "Exame",
  anexo: "Anexo",
};

const typeColor: Record<string, string> = {
  evolucao_medica: "text-primary bg-primary/10",
  evolucao_enfermagem: "text-success bg-success/10",
  sinais_vitais: "text-warning bg-warning/10",
  prescricao: "text-primary bg-primary/10",
  exame: "text-success bg-success/10",
  anexo: "text-muted-foreground bg-muted",
};

export default function Prontuarios() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  
  // Dialog States
  const [sinaisOpen, setSinaisOpen] = useState(false);
  const [prescricaoOpen, setPrescricaoOpen] = useState(false);
  const [evolucaoMedicaOpen, setEvolucaoMedicaOpen] = useState(false);
  const [evolucaoEnfermagemOpen, setEvolucaoEnfermagemOpen] = useState(false);
  const [exameOpen, setExameOpen] = useState(false);
  const [anexoOpen, setAnexoOpen] = useState(false);

  // Persistence logic for Timeline
  const [localTimeline, setLocalTimeline] = useState<TimelineEvent[]>([]);
  const [patientList, setPatientList] = useState<Patient[]>(() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : patients;
  });

  useEffect(() => {
    const saved = localStorage.getItem("pep-timeline");
    if (saved) {
      setLocalTimeline(JSON.parse(saved));
    } else {
      // Initialize with mock data if empty
      localStorage.setItem("pep-timeline", JSON.stringify(timelineEvents));
      setLocalTimeline(timelineEvents);
    }
  }, []);

  const totalTimeline = localTimeline.length > 0 ? localTimeline : timelineEvents;

  // Build list of patients that have timeline events
  const processedPatients = patientList.map((p) => {
    const events = totalTimeline
      .filter((e) => e.patientId === p.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Filter events by type for the summary section if a filter is active
    const filteredEvents = typeFilter === "todos" 
      ? events 
      : events.filter(e => e.type === typeFilter);

    return { ...p, events: filteredEvents, totalEvents: events.length, lastEvent: events[0] };
  });

  const filtered = processedPatients.filter((p) => {
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.cpf.includes(query);
    
    // In "todos", we show everyone who matches the query.
    // In specific tabs, we only show those who have at least one record of THAT type.
    const hasRecordsOfType = p.events.length > 0;
    
    if (typeFilter === "todos") return matchesQuery;
    return matchesQuery && hasRecordsOfType;
  });

  const allTypes = ["todos", "evolucao_medica", "evolucao_enfermagem", "sinais_vitais", "prescricao", "exame", "anexo"];

  const handleCreateNew = () => {
    switch(typeFilter) {
      case "evolucao_medica": setEvolucaoMedicaOpen(true); break;
      case "evolucao_enfermagem": setEvolucaoEnfermagemOpen(true); break;
      case "sinais_vitais": setSinaisOpen(true); break;
      case "prescricao": setPrescricaoOpen(true); break;
      case "exame": setExameOpen(true); break;
      case "anexo": setAnexoOpen(true); break;
      default: toast.info("Selecione uma categoria para criar um novo registro.");
    }
  };

  const onSaveEvent = (ev: TimelineEvent, rawData?: any) => {
    // 1. Save to Timeline
    const updatedTimeline = [ev, ...localTimeline];
    setLocalTimeline(updatedTimeline);
    localStorage.setItem("pep-timeline", JSON.stringify(updatedTimeline));

    // 2. Save to specific stores if needed
    if (ev.type === "sinais_vitais" && rawData) {
      const savedVitals = localStorage.getItem("localVitals");
      const currentVitals = savedVitals ? JSON.parse(savedVitals) : [];
      localStorage.setItem("localVitals", JSON.stringify([rawData, ...currentVitals]));
    }

    if (ev.type === "prescricao" && rawData) {
      const savedRx = localStorage.getItem("localPrescriptions");
      const currentRx = savedRx ? JSON.parse(savedRx) : [];
      localStorage.setItem("localPrescriptions", JSON.stringify([rawData, ...currentRx]));
    }

    toast.success(`${typeLabel[ev.type]} registrado com sucesso.`);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prontuários</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acesse o prontuário eletrônico de cada paciente
          </p>
        </div>
        {typeFilter !== "todos" && (
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Novo {typeLabel[typeFilter]}
          </button>
        )}
      </div>

      {/* Search and type filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-md p-0.5 overflow-x-auto">
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "todos" ? "Todos" : typeLabel[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Patient records cards */}
      <div className="space-y-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: i * 0.04 }}
            className="bg-card rounded-lg shadow-card border-subtle overflow-hidden"
          >
            {/* Patient header */}
            <div
              onClick={() => navigate(`/prontuario/${p.id}`)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold truncate">{p.name}</h2>
                  <span
                    className={`badge-status text-[11px] ${
                      p.status === "internado"
                        ? "bg-destructive/10 text-destructive"
                        : p.status === "ambulatorial"
                        ? "bg-primary/10 text-primary"
                        : p.status === "obito"
                        ? "bg-zinc-500 text-white dark:bg-zinc-800 dark:text-zinc-400 font-bold"
                        : "bg-success/10 text-success"
                    }`}
                  >
                   {p.status === "obito" ? "ÓBITO" : p.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{p.age} anos • {p.sex === "M" ? "Masculino" : "Feminino"}</span>
                  <span className="tabular-nums">CPF: {p.cpf}</span>
                  {p.bloodType && <span>Tipo: {p.bloodType}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-muted-foreground">{p.totalEvents} registro{p.totalEvents !== 1 ? "s" : ""}</div>
                  {p.lastEvent && (
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      Último: {new Date(p.lastEvent.date).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Recent events summary */}
            {p.events.length > 0 && (
              <div className="border-t border-border px-4 py-3 bg-muted/20">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {typeFilter === "todos" ? "Últimos registros" : `Registros de ${typeLabel[typeFilter]}`}
                </div>
                <div className="space-y-1.5">
                  {p.events.slice(0, 3).map((ev) => {
                    const Icon = typeIcon[ev.type];
                    const color = typeColor[ev.type];
                    return (
                      <div key={ev.id} className="flex items-start gap-2.5">
                        <div className={`h-5 w-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                          <Icon className="h-3 w-3" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium truncate">{ev.title}</span>
                            <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                              {new Date(ev.date).toLocaleDateString("pt-BR")} às {new Date(ev.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{ev.summary}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {p.events.length > 3 && (
                  <button
                    onClick={() => navigate(`/prontuario/${p.id}`)}
                    className="mt-2 text-xs text-primary font-medium hover:underline"
                  >
                    Ver todos os {p.events.length} registros →
                  </button>
                )}
              </div>
            )}

            {p.events.length === 0 && typeFilter !== "todos" && (
              <div className="border-t border-border px-4 py-3 bg-muted/20">
                <p className="text-xs text-muted-foreground">Nenhum registro de {typeLabel[typeFilter]} para este paciente.</p>
              </div>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhum prontuário encontrado para os filtros selecionados.
          </div>
        )}
      </div>

      {/* Dialogs */}
      <NovoSinalDialog open={sinaisOpen} onOpenChange={setSinaisOpen} onSave={(v: VitalSign) => { onSaveEvent({ id: v.id, patientId: v.patientId, type: "sinais_vitais", date: v.date || v.created_at, title: "Sinais Vitais", summary: `T ${v.temperature}°C | FC ${v.heartRate}bpm`, professional: v.professional || "" }, v); }} />
      <NovaPrescricaoDialog open={prescricaoOpen} onOpenChange={setPrescricaoOpen} onSave={(items: Prescription[]) => { const p = items[0]; if (p) onSaveEvent({ id: p.id, patientId: p.patientId, type: "prescricao", date: p.created_at, title: "Prescrição Médica", summary: p.medication, professional: p.doctorId }, p); }} patients={patientList} />
      <NovaEvolucaoDialog open={evolucaoMedicaOpen} onOpenChange={setEvolucaoMedicaOpen} type="evolucao_medica" onSave={onSaveEvent} patients={patientList} />
      <NovaEvolucaoDialog open={evolucaoEnfermagemOpen} onOpenChange={setEvolucaoEnfermagemOpen} type="evolucao_enfermagem" onSave={onSaveEvent} patients={patientList} />
      <NovoAnexoDialog open={anexoOpen} onOpenChange={setAnexoOpen} onSave={onSaveEvent} patients={patientList} />
      <RequestExamDialog open={exameOpen} onOpenChange={setExameOpen} patientName="" />
    </div>
  );
}
