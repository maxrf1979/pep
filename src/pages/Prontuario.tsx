import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getRandomUUID } from "@/lib/utils";
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
import { NovoAtestadoDialog } from "@/components/NovoAtestadoDialog";
import { VisualizarEvolucaoDialog } from "@/components/VisualizarEvolucaoDialog";
import { ReportHeader, ReportFooter } from "@/components/ReportHeader";
import { ProfessionalProntuario } from "@/components/ProfessionalProntuario";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string; border: string }> = {
  evolucao_medica: { icon: Stethoscope, label: "Evolução Médica", color: "text-primary", border: "border-primary" },
  evolucao_enfermagem: { icon: ClipboardPlus, label: "Evolução Enfermagem", color: "text-success", border: "border-success" },
  sinais_vitais: { icon: Activity, label: "Sinais Vitais", color: "text-warning", border: "border-warning" },
  prescricao: { icon: Pill, label: "Prescrição", color: "text-primary", border: "border-primary" },
  exame: { icon: FlaskConical, label: "Exame", color: "text-success", border: "border-success" },
  anexo: { icon: Paperclip, label: "Anexo", color: "text-muted-foreground", border: "border-muted-foreground" },
  atestado: { icon: FileText, label: "Atestado Médico", color: "text-primary", border: "border-primary" },
};

function TimelineCard({ event, index, onPrint, onViewEvolucao }: { event: TimelineEvent; index: number, onPrint?: (ev: TimelineEvent) => void, onViewEvolucao?: (ev: TimelineEvent) => void }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[event.type];
  const Icon = config.icon;

  const handleClick = () => {
    // Se for evolução médica ou de enfermagem, abre o diálogo de visualização
    if ((event.type === "evolucao_medica" || event.type === "evolucao_enfermagem") && onViewEvolucao) {
      onViewEvolucao(event);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: index * 0.04 }}
      className={`bg-card rounded-lg p-4 shadow-card border-subtle border-l-4 ${config.border} hover:translate-y-[-1px] hover:shadow-overlay transition-all cursor-pointer`}
      onClick={handleClick}
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
            <button className="flex items-center gap-1 text-xs text-primary font-semibold">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? "Recolher" : "Ver detalhes"}
            </button>

            {onPrint && (
              <button 
                onClick={(e) => { e.stopPropagation(); onPrint(event); }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary font-semibold transition-colors"
              >
                <FileDown className="h-3.5 w-3.5" />
                Imprimir
              </button>
            )}
          </div>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 pt-2"
            >
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {event.details || "Sem descrição detalhada."}
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
  const [atestadoOpen, setAtestadoOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPrintingEvent, setCurrentPrintingEvent] = useState<TimelineEvent | null>(null);
  const [visualizarEvolucaoOpen, setVisualizarEvolucaoOpen] = useState(false);
  const [evolucaoSelecionada, setEvolucaoSelecionada] = useState<TimelineEvent | null>(null);

  const handlePrintIndividual = (event: TimelineEvent) => {
    setCurrentPrintingEvent(event);
    setTimeout(() => {
      const content = document.getElementById("print-area-individual")?.innerHTML;
      if (!content) {
        console.error("Conteúdo de impressão individual não encontrado!");
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Por favor, permita pop-ups para este site para imprimir.");
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Impressão - Pulse PEP</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; padding: 2cm; color: #000; background: white; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10pt; }
              th { background-color: #f2f2f2; font-weight: bold; }
              h2 { font-size: 16pt; font-weight: 700; margin-bottom: 12px; }
              p { margin: 4px 0; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setCurrentPrintingEvent(null);
      }, 500);
    }, 300); // Aguarda o React atualizar o state com currentPrintingEvent
  };

  const handlePrintFull = () => {
    const content = document.getElementById("print-area-full")?.innerHTML;
    if (!content) {
      alert("Erro ao carregar conteúdo do prontuário.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita pop-ups para este site para imprimir.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Prontuário Completo - Pulse PEP</title>
          <style>
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleViewEvolucao = (event: TimelineEvent) => {
    setEvolucaoSelecionada(event);
    setVisualizarEvolucaoOpen(true);
  };

  // Persistence logic for Timeline - Fetching from Supabase
  const [localTimeline, setLocalTimeline] = useState<TimelineEvent[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);

  // 1. Carregar Dados do Paciente
  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        // Converter dados do Supabase (snake_case) para o formato Patient (camelCase)
        const calcAge = (birth: string) => {
          const d = new Date(birth);
          const now = new Date();
          let age = now.getFullYear() - d.getFullYear();
          if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
          return age;
        };

        const formattedPatient: Patient = {
          id: data.id,
          name: data.name,
          cpf: data.cpf,
          sus: data.sus,
          birthDate: data.birth_date,
          sex: data.sex,
          phone: data.phone,
          email: data.email,
          bloodType: data.blood_type,
          allergies: data.allergies || [],
          status: data.status,
          lastVisit: data.last_visit || new Date().toISOString().split("T")[0],
          age: data.birth_date ? calcAge(data.birth_date) : 0,
          deathDate: data.death_date
        };
        setPatientData(formattedPatient);
      } else {
        // Fallback para mock se o Supabase falhar ou estiver vazio
        const p = getPatient(id);
        if (p) setPatientData(p);
      }
    };

    fetchPatient();
  }, [id]);

  const patient = patientData;

  // 2. Carregar Histórico da Timeline
  useEffect(() => {
    if (!id) return;

    const fetchTimeline = async () => {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('patient_id', id)
        .order('occurred_at', { ascending: false });

      if (!error && data) {
        // Converte os dados do Supabase para o formato TimelineEvent esperado pelo front
        const formattedEvents = data.map((ev: any) => ({
          id: ev.id,
          patientId: ev.patient_id,
          type: ev.event_type,
          title: ev.title,
          summary: ev.summary,
          details: ev.details,
          professional: 'Equipe', // TODO: Fazer JOIN com system_users futuramente
          date: ev.occurred_at
        }));
        setLocalTimeline(formattedEvents);
      } else {
        // Fallback para localStorage/mock se falhar
        const saved = localStorage.getItem("pep-timeline");
        if (saved) {
          setLocalTimeline(JSON.parse(saved));
        } else {
          setLocalTimeline(timelineEvents);
        }
      }
    };

    fetchTimeline();
  }, [id]);

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

  const onSaveEvent = async (ev: TimelineEvent, rawData?: any) => {
    if (!id) return;

    // 1. Salvar no Supabase (timeline_events)
    const { data, error } = await supabase
      .from('timeline_events')
      .insert([{
        patient_id: id,
        event_type: ev.type,
        title: ev.title,
        summary: ev.summary,
        details: ev.details,
        occurred_at: ev.date || new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      toast.error("Erro ao salvar no banco de dados.");
      return;
    }

    // 2. Atualizar estado local com o ID gerado pelo banco
    const insertedId = data && data[0] ? data[0].id : ev.id;
    const newEvent = { ...ev, id: insertedId };
    setLocalTimeline([newEvent, ...localTimeline]);

    // 3. Salvar em tabelas específicas se necessário
    try {
      if (ev.type === "sinais_vitais" && rawData) {
        await supabase.from('vital_signs').insert([{
          patient_id: id,
          temperature: rawData.temperature ? parseFloat(rawData.temperature) : null,
          blood_pressure: rawData.bloodPressure,
          heart_rate: rawData.heartRate ? parseInt(rawData.heartRate) : null,
          respiratory_rate: rawData.respiratoryRate ? parseInt(rawData.respiratoryRate) : null,
          oxygen_saturation: rawData.oxygenSaturation ? parseFloat(rawData.oxygenSaturation) : null
        }]);
      }

      if (ev.type === "prescricao" && rawData) {
        // Encontra o doctor_id logado
        const savedSession = localStorage.getItem("pulse-auth-session");
        const session = savedSession ? JSON.parse(savedSession) : null;
        const doctorId = session?.id;

        await supabase.from('prescriptions').insert([{
          patient_id: id,
          medication: rawData.medication,
          dosage: rawData.dosage,
          instructions: rawData.instructions,
          type: rawData.type || 'normal',
          doctor_id: doctorId || '00000000-0000-0000-0000-000000000000' // fallback placeholder UUID if needed
        }]);
      }
    } catch (subtableError) {
      console.error("Erro ao salvar na sub-tabela:", subtableError);
      // Não bloqueia o fluxo, pois na timeline já salvou
    }

    toast.success(`${typeConfig[ev.type]?.label || 'Registro'} adicionado com sucesso.`);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!patientData || !id) return;
    const updated = { ...patientData, status: newStatus as "internado" | "ambulatorial" | "alta" | "obito" };
    
    // 1. Atualizar no Supabase
    const { error } = await supabase
      .from('patients')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar status do paciente:", error);
      toast.error("Erro ao atualizar status no banco de dados.");
      return;
    }

    // 2. Atualizar estado local
    setPatientData(updated);
    
    // Fallback sync para mock local se houver
    const saved = localStorage.getItem("patients");
    const list = saved ? JSON.parse(saved) : [];
    const index = list.findIndex((p: Patient) => p.id === patientData.id);
    if (index >= 0) {
      list[index] = updated;
    } else {
      list.push(updated);
    }
    localStorage.setItem("patients", JSON.stringify(list));
    
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
    { id: "atestado", label: "Atestados", icon: FileText, restricted: !isMedico() && !isAdmin() },
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
          /* Hide the app layout for prontuario printing */
          [data-sidebar], aside, nav, header, .sticky, .no-print { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 1.5cm 2cm; }
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
            onClick={handlePrintFull}
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
                      <TimelineCard event={ev} index={i} onPrint={handlePrintIndividual} onViewEvolucao={handleViewEvolucao} />
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
      <NovoSinalDialog open={sinaisOpen} onOpenChange={setSinaisOpen} initialPatientId={id} onSave={(v: VitalSign) => { onSaveEvent({ id: v.id, patientId: v.patientId, type: "sinais_vitais", date: v.created_at, title: "Sinais Vitais", summary: `T ${v.temperature || "--"}°C | FC ${v.heartRate || "--"}bpm | PA ${v.bloodPressure || "--"}`, professional: user?.name || "Equipe", details: `Temperatura: ${v.temperature || "--"}°C\nFrequência Cardíaca: ${v.heartRate || "--"}bpm\nPressão Arterial: ${v.bloodPressure || "--"}\nFrequência Respiratória: ${v.respiratoryRate || "--"}rpm\nSaturação de Oxigênio: ${v.oxygenSaturation || "--"}%` }, v); }} />
      <NovaPrescricaoDialog open={prescricaoOpen} onOpenChange={setPrescricaoOpen} initialPatientId={id} onSave={(items: Prescription[]) => { items.forEach(p => { onSaveEvent({ id: p.id, patientId: p.patientId, type: "prescricao", date: p.created_at, title: "Prescrição Médica", summary: `${p.medication} - ${p.dosage}`, professional: user?.name || "Dr. Profissional", details: `Medicamento: ${p.medication}\nDose: ${p.dosage}\nInstruções: ${p.instructions || "--"}` }, p); }); }} patients={[patient]} />
      <NovaEvolucaoDialog open={evolucaoMedicaOpen} onOpenChange={setEvolucaoMedicaOpen} initialPatientId={id} type="evolucao_medica" onSave={onSaveEvent} patients={[patient]} />
      <NovaEvolucaoDialog open={evolucaoEnfermagemOpen} onOpenChange={setEvolucaoEnfermagemOpen} initialPatientId={id} type="evolucao_enfermagem" onSave={onSaveEvent} patients={[patient]} />
      <NovoAnexoDialog open={anexoOpen} onOpenChange={setAnexoOpen} initialPatientId={id} onSave={onSaveEvent} patients={[patient]} />
      <NovoAtestadoDialog open={atestadoOpen} onOpenChange={setAtestadoOpen} onSave={(v: { daysOff: number; description: string }) => { onSaveEvent({ id: `at-${Date.now()}`, patientId: id!, type: "atestado" as any, date: new Date().toISOString(), title: "Atestado Médico Emitido", summary: `Afastamento de ${v.daysOff} dias.`, professional: user?.name || "Dr. Profissional", details: v.description }); }} />
      <RequestExamDialog open={exameOpen} onOpenChange={setExameOpen} patientName={patient.name} onSave={(examList) => { examList.forEach((ex: any) => { onSaveEvent({ id: getRandomUUID(), patientId: id!, type: "exame", date: new Date().toISOString(), title: "Exame Solicitado", summary: `${ex.name} (${ex.type})`, professional: user?.name || "Dr. Profissional", details: `Exame: ${ex.name}\nTipo: ${ex.type}` }); }); }} patients={[patient]} />
      <VisualizarEvolucaoDialog
        open={visualizarEvolucaoOpen}
        onOpenChange={setVisualizarEvolucaoOpen}
        evolucao={evolucaoSelecionada}
        patient={patient}
      />
      {patient && (
        <AlterarStatusDialog 
          open={statusOpen} 
          onOpenChange={setStatusOpen} 
          currentStatus={patient.status} 
          onSave={handleStatusChange} 
        />
      )}

      {/* Área de Impressão Isolada - Individual (Invisível na Tela) */}
      <div id="print-area-individual" style={{ display: "none" }}>
        {currentPrintingEvent && (
          <div>
            <ReportHeader />
            <div style={{ margin: "20px 0", borderBottom: "2px solid #ddd", paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "16pt", fontWeight: 700, margin: 0 }}>{typeConfig[currentPrintingEvent.type]?.label}</h2>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", color: "#666", marginTop: "8px" }}>
                <span>Data: {new Date(currentPrintingEvent.date).toLocaleString("pt-BR")}</span>
                <span>Profissional: {currentPrintingEvent.professional}</span>
              </div>
            </div>
            <div style={{ fontSize: "10pt", lineHeight: 1.6 }}>
              <p style={{ fontWeight: 700, fontSize: "12pt", marginBottom: "8px" }}>{currentPrintingEvent.title}</p>
              <div style={{ marginTop: "8px", background: "#fafafa", padding: "12px", borderRadius: "4px", border: "1px solid #eee" }}>
                <p style={{ fontWeight: 600, fontSize: "8pt", color: "#666", marginBottom: "4px" }}>Resumo:</p>
                <p style={{ margin: 0 }}>{currentPrintingEvent.summary}</p>
              </div>
              {currentPrintingEvent.details && (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ fontWeight: 600, fontSize: "8pt", color: "#666", marginBottom: "4px" }}>Detalhamento:</p>
                  <div style={{ whiteSpace: "pre-wrap", padding: "12px", border: "1px solid #eee", borderRadius: "4px", lineHeight: 1.6 }}>
                    {currentPrintingEvent.details}
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: "60px" }}>
              <ReportFooter />
            </div>
          </div>
        )}
      </div>

      {/* Área de Impressão Isolada - Prontuário Completo (Invisível na Tela) */}
      <div id="print-area-full" style={{ display: "none" }}>
        {id && <ProfessionalProntuario patientId={id} />}
      </div>
    </div>
  );
}

