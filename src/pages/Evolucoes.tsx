import { useState } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  ClipboardPlus,
  Plus,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients, timelineEvents, type TimelineEvent } from "@/lib/mock-data";
import { NovaEvolucaoDialog } from "@/components/NovaEvolucaoDialog";
import { toast } from "sonner";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

type EvoType = "evolucao_medica" | "evolucao_enfermagem";

const typeConfig: Record<EvoType, { label: string; icon: typeof Stethoscope; color: string; border: string; badgeCls: string }> = {
  evolucao_medica: {
    label: "Evolução Médica",
    icon: Stethoscope,
    color: "text-primary",
    border: "border-primary",
    badgeCls: "bg-primary/10 text-primary",
  },
  evolucao_enfermagem: {
    label: "Evolução de Enfermagem",
    icon: ClipboardPlus,
    color: "text-success",
    border: "border-success",
    badgeCls: "bg-success/10 text-success",
  },
};

// Filtra apenas evoluções dos dados mock
const baseEvolutions = timelineEvents.filter(
  (e): e is TimelineEvent & { type: EvoType } =>
    e.type === "evolucao_medica" || e.type === "evolucao_enfermagem"
);

function EvolucaoCard({
  event,
  index,
}: {
  event: TimelineEvent;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const patient = patients.find((p) => p.id === event.patientId);
  const cfg = typeConfig[event.type as EvoType];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: index * 0.04 }}
      className={`bg-card rounded-lg shadow-card border-subtle border-l-4 ${cfg.border}`}
    >
      {/* Header do card */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              {/* Paciente */}
              {patient && (
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <button
                    onClick={() => navigate(`/prontuario/${patient.id}`)}
                    className="text-sm font-semibold hover:text-primary transition-colors"
                  >
                    {patient.name}
                  </button>
                  <span
                    className={`badge-status ${
                      patient.status === "internado"
                        ? "bg-destructive/10 text-destructive"
                        : patient.status === "ambulatorial"
                        ? "bg-primary/10 text-primary"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {patient.status}
                  </span>
                  {patient.allergies.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/5 border border-destructive/20 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="h-3 w-3" strokeWidth={2} />
                      {patient.allergies.join(", ")}
                    </span>
                  )}
                </div>
              )}

              {/* Tipo + hora */}
              <div className="flex items-center gap-2">
                <span className={`badge-status ${cfg.badgeCls}`}>{cfg.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(event.date).toLocaleDateString("pt-BR")}
                  {" · "}
                  {new Date(event.date).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Resumo */}
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {event.summary}
              </p>

              {/* Profissional */}
              <p className="text-xs text-muted-foreground mt-2">{event.professional}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhes SOAP expansível */}
      {event.details && (
        <>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-4 pb-4 border-t border-border"
            >
              <div className="mt-3 bg-muted/30 rounded-md p-4">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {event.details}
                </pre>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-border text-xs text-primary font-medium hover:bg-muted/30 transition-colors rounded-b-lg"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Recolher detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> Ver detalhes SOAP
              </>
            )}
          </button>
        </>
      )}
    </motion.div>
  );
}

export default function Evolucoes() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EvoType>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localEvolutions, setLocalEvolutions] = useState<TimelineEvent[]>([]);

  const allEvolutions = [...localEvolutions, ...baseEvolutions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = allEvolutions.filter((ev) => {
    if (typeFilter !== "all" && ev.type !== typeFilter) return false;
    if (!search) return true;
    const patient = patients.find((p) => p.id === ev.patientId);
    if (!patient) return false;
    return (
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.cpf.includes(search) ||
      ev.summary.toLowerCase().includes(search.toLowerCase()) ||
      ev.professional.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSave = (event: TimelineEvent) => {
    setLocalEvolutions((prev) => [event, ...prev]);
    toast.success("Evolução registrada com sucesso.");
  };

  const countByType = (type: EvoType) =>
    allEvolutions.filter((e) => e.type === type).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <NovaEvolucaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />

      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evoluções</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro de evoluções médicas e de enfermagem
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nova Evolução
        </button>
      </div>

      {/* Cards resumo */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Total", value: allEvolutions.length, cls: "bg-muted/50 text-foreground" },
          {
            label: "Médicas",
            value: countByType("evolucao_medica"),
            cls: "bg-primary/10 text-primary",
          },
          {
            label: "Enfermagem",
            value: countByType("evolucao_enfermagem"),
            cls: "bg-success/10 text-success",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-lg p-4 shadow-card border-subtle text-center"
          >
            <div className={`text-2xl font-bold tabular-nums ${s.cls.split(" ")[1]}`}>
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por paciente, profissional ou conteúdo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-md bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          {(
            [
              { key: "all", label: "Todas" },
              { key: "evolucao_medica", label: "Médica" },
              { key: "evolucao_enfermagem", label: "Enfermagem" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                typeFilter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {filtered.length} evolução(ões) encontrada(s)
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground text-sm">
            Nenhuma evolução encontrada.
          </div>
        ) : (
          filtered.map((ev, i) => (
            <EvolucaoCard key={ev.id} event={ev} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
