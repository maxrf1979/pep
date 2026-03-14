import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  Activity,
  FilePlus,
  Pill,
  FlaskConical,
  FileDown,
  FileText,
  Stethoscope,
  ClipboardPlus,
  Paperclip,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { getPatient, getPatientTimeline, type TimelineEvent } from "@/lib/mock-data";
import { toast } from "sonner";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string; border: string }> = {
  evolucao_medica: { icon: Stethoscope, label: "Evolução Médica", color: "text-primary", border: "border-primary" },
  evolucao_enfermagem: { icon: ClipboardPlus, label: "Evolução Enfermagem", color: "text-success", border: "border-success" },
  sinais_vitais: { icon: Activity, label: "Sinais Vitais", color: "text-warning", border: "border-warning" },
  prescricao: { icon: Pill, label: "Prescrição", color: "text-primary", border: "border-primary" },
  exame: { icon: FlaskConical, label: "Exame", color: "text-success", border: "border-success" },
  anexo: { icon: Paperclip, label: "Anexo", color: "text-muted-foreground", border: "border-muted-foreground" },
};

function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[event.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: index * 0.04 }}
      className={`bg-card rounded-lg p-4 shadow-card border-subtle border-l-4 ${config.border} hover:translate-y-[-1px] hover:shadow-overlay transition-all cursor-pointer`}
      onClick={() => event.details && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${config.color}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`badge-status ${config.color} bg-current/10`}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {new Date(event.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <h3 className="text-sm font-semibold mt-2">{event.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{event.summary}</p>
          <p className="text-xs text-muted-foreground mt-2">{event.professional}</p>

          {event.details && (
            <>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-border"
                >
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {event.details}
                  </pre>
                </motion.div>
              )}
              <button className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {expanded ? "Recolher" : "Ver detalhes"}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Prontuario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const quickActionHandlers: Record<string, () => void> = {
    "Sinais Vitais": () => navigate("/sinais-vitais"),
    "Nova Evolução": () => toast.info("Abra o prontuário e clique em 'Adicionar Evolução'. Funcionalidade completa em breve."),
    "Prescrever": () => navigate("/prescricoes"),
    "Solicitar Exame": () => navigate("/exames"),
    "Anexar Arquivo": () => toast.info("Funcionalidade de anexo de arquivos em breve."),
  };
  const patient = getPatient(id || "");
  const timeline = getPatientTimeline(id || "");

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Paciente não encontrado.
      </div>
    );
  }

  // Group by date
  const grouped = timeline.reduce<Record<string, TimelineEvent[]>>((acc, ev) => {
    const day = new Date(ev.date).toLocaleDateString("pt-BR");
    if (!acc[day]) acc[day] = [];
    acc[day].push(ev);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl space-y-0">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {/* Patient Header - Sticky */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="sticky top-0 z-10 bg-card rounded-lg p-5 shadow-card border-subtle mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold shrink-0">
            {patient.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">{patient.name}</h1>
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
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
              <span>{patient.age} anos • {patient.sex === "M" ? "Masculino" : "Feminino"}</span>
              <span className="tabular-nums">CPF: {patient.cpf}</span>
              {patient.sus && <span className="tabular-nums">SUS: {patient.sus}</span>}
              {patient.bloodType && <span>Tipo: {patient.bloodType}</span>}
            </div>
            {patient.allergies.length > 0 && (
              <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-md bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium text-destructive">
                  Alergias: {patient.allergies.join(", ")}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <FileDown className="h-4 w-4" strokeWidth={1.5} />
            Relatório PDF
          </button>
        </div>
      </motion.div>

      <div className="flex gap-6">
        {/* Timeline */}
        <div className="flex-1 space-y-6">
          {Object.entries(grouped).map(([date, events]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {date}
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-3 relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
                {events.map((ev, i) => (
                  <div key={ev.id} className="relative pl-10">
                    <div className="absolute left-[11px] top-5 h-2.5 w-2.5 rounded-full bg-border border-2 border-card z-10" />
                    <TimelineCard event={ev} index={i} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-24 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Ações Rápidas
            </h3>
            {[
              { label: "Sinais Vitais", icon: Activity },
              { label: "Nova Evolução", icon: FilePlus },
              { label: "Prescrever", icon: Pill },
              { label: "Solicitar Exame", icon: FlaskConical },
              { label: "Anexar Arquivo", icon: Paperclip },
            ].map((action) => (
              <button
                key={action.label}
                onClick={quickActionHandlers[action.label]}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
              >
                <action.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
