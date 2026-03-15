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
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getPatient, timelineEvents, type TimelineEvent, type VitalSign, type Prescription, type Patient } from "@/lib/mock-data";
import { usePermissions } from "@/hooks/usePermissions";
import { AlterarStatusDialog } from "@/components/AlterarStatusDialog";
import { useAuth } from "@/hooks/useAuth";
import { RequestExamDialog } from "@/components/RequestExamDialog";
import { NovoSinalDialog } from "@/components/NovoSinalDialog";
import { NovaPrescricaoDialog } from "@/components/NovaPrescricaoDialog";
import { NovaEvolucaoDialog } from "@/components/NovaEvolucaoDialog";
import { NovoAnexoDialog } from "@/components/NovoAnexoDialog";
import { ReportHeader, ReportFooter } from "@/components/ReportHeader";
import { ProfessionalProntuario } from "@/components/ProfessionalProntuario";
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

function TimelineCard({ event, index, onPrint }: { event: TimelineEvent; index: number, onPrint?: (ev: TimelineEvent) => void }) {
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
          
          {event.fileData && (
            <div className="mt-3">
              {event.fileData.startsWith("data:image/") ? (
                <img 
                  src={event.fileData} 
                  alt={event.title} 
                  className="max-w-xs h-auto max-h-48 rounded-lg border border-border shadow-sm object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                  onClick={(e) => { e.stopPropagation(); window.open(event.fileData, '_blank'); }} 
                />
              ) : (
                <a 
                  href={event.fileData} 
                  download={event.summary.replace("Arquivo: ", "")}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground border border-border rounded-md text-xs font-medium hover:bg-muted/80 transition-colors"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Baixar Arquivo
                </a>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">{event.professional}</p>

          <div className="mt-3 flex items-center gap-4 border-t border-border pt-2">
            {event.details && (
              <button className="flex items-center gap-1 text-xs text-primary font-semibold">
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {expanded ? "Recolher" : "Ver detalhes"}
              </button>
            )}

            {["evolucao_medica", "evolucao_enfermagem", "sinais_vitais"].includes(event.type) && onPrint && (
              <button 
                onClick={(e) => { e.stopPropagation(); onPrint(event); }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary font-semibold transition-colors"
              >
                <FileDown className="h-3.5 w-3.5" />
                Imprimir
              </button>
            )}
          </div>

          {event.details && expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 pt-2"
            >
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {event.details}
              </pre>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Prontuario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    isEnfermeiro, canFilterMedicalEvolution, canFilterNursingEvolution, isAdmin, isMedico, 
    canCreateNursingEvolution, canCreateMedicalEvolution, canCreatePrescription, canRequestExam, canCreateVitals 
  } = usePermissions();
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState("todos");

  // Dialog States
  const [sinaisOpen, setSinaisOpen] = useState(false);
  const [prescricaoOpen, setPrescricaoOpen] = useState(false);
  const [evolucaoMedicaOpen, setEvolucaoMedicaOpen] = useState(false);
  const [evolucaoEnfermagemOpen, setEvolucaoEnfermagemOpen] = useState(false);
  const [exameOpen, setExameOpen] = useState(false);
  const [anexoOpen, setAnexoOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPrintingEvent, setCurrentPrintingEvent] = useState<TimelineEvent | null>(null);

  const handlePrintIndividual = (event: TimelineEvent) => {
    setCurrentPrintingEvent(event);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      setCurrentPrintingEvent(null);
    }, 150);
  };

  // Persistence logic for Timeline
  const [localTimeline, setLocalTimeline] = useState<TimelineEvent[]>([]);

  const [patientData, setPatientData] = useState<Patient | null>(null);

  useEffect(() => {
    const p = getPatient(id || "");
    if (p) {
      const saved = localStorage.getItem("pep-patients");
      const list = saved ? JSON.parse(saved) : [];
      const override = list.find((item: Patient) => item.id === id);
      setPatientData(override || p);
    }
  }, [id]);

  const patient = patientData;

  useEffect(() => {
    const saved = localStorage.getItem("pep-timeline");
    if (saved) {
      setLocalTimeline(JSON.parse(saved));
    } else {
      localStorage.setItem("pep-timeline", JSON.stringify(timelineEvents));
      setLocalTimeline(timelineEvents);
    }
  }, []);

  useEffect(() => {
    if (patient) {
      document.title = `Prontuário: ${patient.name} (${patient.status.toUpperCase()}) | Pulse PEP`;
    }
    return () => {
      document.title = "Pulse PEP Clinic";
    };
  }, [patient]);
  // Filter and sort patient timeline from local state
  const patientTimeline = localTimeline
    .filter(ev => ev.patientId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Paciente não encontrado.
      </div>
    );
  }

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

    toast.success(`${typeConfig[ev.type]?.label || 'Registro'} adicionado com sucesso.`);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!patientData) return;
    const updated = { ...patientData, status: newStatus as "internado" | "ambulatorial" | "alta" | "obito" };
    setPatientData(updated);
    
    const saved = localStorage.getItem("pep-patients");
    const list = saved ? JSON.parse(saved) : [];
    const index = list.findIndex((p: Patient) => p.id === patientData.id);
    if (index >= 0) {
      list[index] = updated;
    } else {
      list.push(updated);
    }
    localStorage.setItem("pep-patients", JSON.stringify(list));
    
    onSaveEvent({
      id: `ev-status-${Date.now()}`,
      patientId: id!,
      type: "evolucao_medica",
      date: new Date().toISOString(),
      title: "Alteração de Status",
      summary: `Status alterado para o paciente: ${newStatus.toUpperCase()}`,
      professional: user?.name || "Profissional",
    });
    
    toast.success("Status atualizado");
  };

  const filteredTimeline = typeFilter === "todos" 
    ? patientTimeline 
    : patientTimeline.filter(ev => ev.type === typeFilter);

  // Group by date
  const grouped = filteredTimeline.reduce<Record<string, TimelineEvent[]>>((acc, ev) => {
    const day = new Date(ev.date).toLocaleDateString("pt-BR");
    if (!acc[day]) acc[day] = [];
    acc[day].push(ev);
    return acc;
  }, {});

  // Tabs disponíveis baseado em permissões
  const allTabs = [
    { id: "todos", label: "Todos", icon: FileText },
    { id: "evolucao_medica", label: "Evolução Médica", icon: Stethoscope, restricted: !canFilterMedicalEvolution },
    { id: "evolucao_enfermagem", label: "Evolução Enfermagem", icon: ClipboardPlus, restricted: !canFilterNursingEvolution },
    { id: "sinais_vitais", label: "Sinais Vitais", icon: Activity },
    { id: "prescricao", label: "Prescrição", icon: Pill },
    { id: "exame", label: "Exame", icon: FlaskConical },
    { id: "anexo", label: "Anexo", icon: Paperclip },
  ];

  // Filtrar abas: se enfermeiro e não pode filtrar evolução médica, remover aba
  const tabs = allTabs.filter(tab => {
    if (tab.id === "evolucao_medica" && !canFilterMedicalEvolution) {
      return false;
    }
    return true;
  });

  return (
    <div className={`max-w-5xl space-y-0 ${currentPrintingEvent ? "print:hidden" : ""}`}>
      <style>{`
        @media print {
          body { background: white; color: black; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          #prontuario-container { page-break-inside: avoid; }
          .print-header, .print-footer { display: block; }
          .section-block { page-break-inside: avoid; }
          @page { margin: 1.5cm; }
          body::before {
            content: "";
            display: block;
            height: 2cm;
            margin-bottom: 1cm;
          }
          body::after {
            content: "";
            display: block;
            height: 2cm;
            margin-top: 1cm;
          }
        }
        @page {
          margin-top: 3cm;
          margin-bottom: 3cm;
          @top-center {
            content: "Pulse PEP Clinic - Sistema de Gerenciamento Eletrônico de Prontuário";
          }
          @bottom-center {
            content: "Data: " string(page-data);
          }
        }
      `}</style>

      {/* Print Header - Hidden on screen, visible on print */}
      <div className="hidden print:block print-header mb-8">
        <ReportHeader />
      </div>

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
                    : patient.status === "obito"
                    ? "bg-zinc-500 text-white dark:bg-zinc-800 dark:text-zinc-400 font-bold"
                    : "bg-success/10 text-success"
                }`}
              >
                {patient.status === "obito" ? "ÓBITO" : patient.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
              <span>{patient.age} anos • {patient.sex === "M" ? "Masculino" : "Feminino"}</span>
              <span className="tabular-nums">CPF: {patient.cpf}</span>
              {patient.sus && <span className="tabular-nums">SUS: {patient.sus}</span>}
              {patient.bloodType && <span>Tipo: {patient.bloodType}</span>}
              {patient.status === "obito" && patient.deathDate && (
                <span className="text-destructive font-semibold">Óbito em: {new Date(patient.deathDate).toLocaleDateString("pt-BR")}</span>
              )}
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
            onClick={() => {
              setIsPrinting(true);
              setTimeout(() => {
                window.print();
                setIsPrinting(false);
              }, 100);
            }}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <FileDown className="h-4 w-4" strokeWidth={1.5} />
            Relatório PDF
          </button>
        </div>
      </motion.div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-md p-1 mb-6 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                typeFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              title={tab.restricted ? `Restrito para ${user?.role}` : ""}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6">
        {/* Timeline */}
        <div className="flex-1 space-y-6">
          {Object.entries(grouped).length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto opacity-20 mb-3" />
              <p className="text-sm">Nenhum registro encontrado para este filtro.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, events]) => (
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
                      <TimelineCard event={ev} index={i} onPrint={handlePrintIndividual} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-24 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Ações Rápidas
            </h3>
            {[
              { label: "Sinais Vitais", icon: Activity, onClick: () => setSinaisOpen(true), visible: canCreateVitals() },
              { label: "Evolução Médica", icon: Stethoscope, onClick: () => setEvolucaoMedicaOpen(true), visible: canCreateMedicalEvolution() },
              { label: "Evolução Enferm.", icon: ClipboardPlus, onClick: () => setEvolucaoEnfermagemOpen(true), visible: canCreateNursingEvolution() },
              { label: "Prescrever", icon: Pill, onClick: () => setPrescricaoOpen(true), visible: canCreatePrescription() },
              { label: "Solicitar Exame", icon: FlaskConical, onClick: () => setExameOpen(true), visible: canRequestExam() },
              { label: "Anexar Arquivo", icon: Paperclip, onClick: () => setAnexoOpen(true), visible: true },
              { label: "Alterar Status", icon: Stethoscope, onClick: () => setStatusOpen(true), visible: isMedico() || isAdmin() },
            ].filter(action => action.visible).map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
              >
                <action.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <NovoSinalDialog open={sinaisOpen} onOpenChange={setSinaisOpen} initialPatientId={id} onSave={(v: VitalSign) => { onSaveEvent({ id: v.id, patientId: v.patientId, type: "sinais_vitais", date: v.date, title: "Sinais Vitais", summary: `T ${v.temperature}°C | FC ${v.heartRate}bpm`, professional: v.professional }, v); }} />
      <NovaPrescricaoDialog open={prescricaoOpen} onOpenChange={setPrescricaoOpen} initialPatientId={id} onSave={(p: Prescription) => { onSaveEvent({ id: p.id, patientId: p.patientId, type: "prescricao", date: p.date, title: "Prescrição Médica", summary: p.medications.map(m => m.name).join(", "), professional: p.professional }, p); }} />
      <NovaEvolucaoDialog open={evolucaoMedicaOpen} onOpenChange={setEvolucaoMedicaOpen} initialPatientId={id} type="evolucao_medica" onSave={onSaveEvent} />
      <NovaEvolucaoDialog open={evolucaoEnfermagemOpen} onOpenChange={setEvolucaoEnfermagemOpen} initialPatientId={id} type="evolucao_enfermagem" onSave={onSaveEvent} />
      <NovoAnexoDialog open={anexoOpen} onOpenChange={setAnexoOpen} initialPatientId={id} onSave={onSaveEvent} />
      <RequestExamDialog open={exameOpen} onOpenChange={setExameOpen} patientName={patient.name} />
      {patient && (
        <AlterarStatusDialog 
          open={statusOpen} 
          onOpenChange={setStatusOpen} 
          currentStatus={patient.status} 
          onSave={handleStatusChange} 
        />
      )}

      {/* Print Footer - Hidden on screen, visible on print */}
      <div className="hidden print:block print-footer mt-8">
        <ReportFooter />
      </div>

      {/* Individual Event Print View */}
      {isPrinting && currentPrintingEvent && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 text-slate-800">
          <ReportHeader />
          <div className="my-6 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">{typeConfig[currentPrintingEvent.type]?.label}</h2>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Data: {new Date(currentPrintingEvent.date).toLocaleString("pt-BR")}</span>
              <span>Profissional: {currentPrintingEvent.professional}</span>
            </div>
          </div>
          <div className="text-sm font-sans leading-relaxed whitespace-pre-wrap text-slate-800">
            <p className="font-bold text-base mb-2 text-slate-900">{currentPrintingEvent.title}</p>
            <div className="mt-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="font-semibold text-xs text-slate-500 mb-1">Resumo:</p>
              <p>{currentPrintingEvent.summary}</p>
            </div>
            {currentPrintingEvent.details && (
              <div className="mt-4">
                <p className="font-semibold text-xs text-slate-500 mb-1">Detalhamento:</p>
                <div className="mt-1 font-sans whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100 text-slate-700">
                  {currentPrintingEvent.details}
                </div>
              </div>
            )}
          </div>
          <div className="mt-24">
            <ReportFooter />
          </div>
        </div>
      )}

      {isPrinting && !currentPrintingEvent && <ProfessionalProntuario patientId={id!} />}
    </div>
  );
}

