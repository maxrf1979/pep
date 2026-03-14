import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, ChevronRight, Activity, Pill, FlaskConical, Stethoscope, ClipboardPlus, Paperclip } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients, timelineEvents, type TimelineEvent } from "@/lib/mock-data";

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

function getPatientEvents(patientId: string): TimelineEvent[] {
  return timelineEvents
    .filter((e) => e.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function Prontuarios() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");

  // Build list of patients that have timeline events
  const patientsWithRecords = patients.map((p) => {
    const events = getPatientEvents(p.id);
    return { ...p, events, lastEvent: events[0] };
  });

  const filtered = patientsWithRecords.filter((p) => {
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.cpf.includes(query);
    const matchesType =
      typeFilter === "todos" || p.events.some((e) => e.type === typeFilter);
    return matchesQuery && matchesType;
  });

  const allTypes = ["todos", "evolucao_medica", "evolucao_enfermagem", "sinais_vitais", "prescricao", "exame", "anexo"];

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Prontuários</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Acesse o prontuário eletrônico de cada paciente
        </p>
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
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {p.status}
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
                  <div className="text-xs text-muted-foreground">{p.events.length} registro{p.events.length !== 1 ? "s" : ""}</div>
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
                  Últimos registros
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

            {p.events.length === 0 && (
              <div className="border-t border-border px-4 py-3 bg-muted/20">
                <p className="text-xs text-muted-foreground">Nenhum registro no prontuário.</p>
              </div>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhum prontuário encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
