import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, FileText, Pill, FlaskConical, Activity,
  TrendingUp, TrendingDown, Printer, Search
} from "lucide-react";
import { patients as mockPatients, prescriptions as mockPrescriptions, examRequests as mockExams, vitalSigns as mockVitalSigns, timelineEvents as mockTimelineEvents } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";
import { ReportHeader, ReportFooter } from "@/components/ReportHeader";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function Relatorios() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const patients = (() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : mockPatients;
  })();

  const prescriptions = (() => {
    const saved = localStorage.getItem("localPrescriptions");
    return saved ? JSON.parse(saved) : mockPrescriptions;
  })();

  const exams = (() => {
    const saved = localStorage.getItem("localExams");
    return saved ? JSON.parse(saved) : mockExams;
  })();

  const vitalSigns = (() => {
    const saved = localStorage.getItem("localVitals");
    return saved ? JSON.parse(saved) : mockVitalSigns;
  })();

  const timelineEvents = (() => {
    const saved = localStorage.getItem("pep-timeline");
    return saved ? JSON.parse(saved) : mockTimelineEvents;
  })();

  // Computed data from mock-data
  const totalPatients = patients.length;
  const internados = patients.filter((p) => p.status === "internado").length;
  const ambulatoriais = patients.filter((p) => p.status === "ambulatorial").length;
  const alta = patients.filter((p) => p.status === "alta").length;

  const activeRx = prescriptions.filter((r) => r.status === "ativa").length;
  const pendingExams = timelineEvents.filter((e) => e.type === "exame").length;
  const obito = patients.filter((p) => p.status === "obito" || p.status === "OBITO").length;
  const availableResults = 0; // Interface simplificada

  const statusData = [
    { name: "Internados", value: internados },
    { name: "Ambulatorial", value: ambulatoriais },
    { name: "Alta", value: alta },
    { name: "Óbito", value: obito },
  ];

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const atendimentosPorMes = Array.from({ length: 6 }).map((_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - idx));
    const year = d.getFullYear();
    const month = d.getMonth();
    
    const count = timelineEvents.filter(e => {
      const ed = new Date(e.date);
      return ed.getMonth() === month && ed.getFullYear() === year;
    }).length;
    
    return { mes: `${monthNames[month]} ${year}`, atendimentos: count };
  });

  const examTypeData = [
    { name: "Laboratorial", value: timelineEvents.filter((e) => e.type === "exame" && e.summary.includes("Laboratorial")).length },
    { name: "Imagem", value: timelineEvents.filter((e) => e.type === "exame" && e.summary.includes("Imagem")).length },
    { name: "Outros", value: timelineEvents.filter((e) => e.type === "exame" && !e.summary.includes("Laboratorial") && !e.summary.includes("Imagem")).length },
  ];

  const allergiesFreq: Record<string, number> = {};
  patients.forEach((p) => p.allergies.forEach((a) => { allergiesFreq[a] = (allergiesFreq[a] || 0) + 1; }));
  const topAllergies = Object.entries(allergiesFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const avgTemp = vitalSigns.length ? (vitalSigns.reduce((s, v) => s + v.temperature, 0) / vitalSigns.length).toFixed(1) : "—";
  const avgHR = vitalSigns.length ? Math.round(vitalSigns.reduce((s, v) => s + v.heartRate, 0) / vitalSigns.length) : "—";
  const avgSpO2 = vitalSigns.length ? Math.round(vitalSigns.reduce((s, v) => s + v.oxygenSaturation, 0) / vitalSigns.length) : "—";

  const handlePrint = () => {
    if (!selectedPatientId) {
      toast.error("Selecione um paciente para imprimir o relatório.");
      return;
    }
    window.print();
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-6 max-w-7xl pb-10">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 2cm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 1.5cm 2cm; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Indicadores clínicos e administrativos — {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Gerador de Relatório de Paciente */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="bg-card rounded-xl shadow-card border-subtle p-6 no-print"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Relatório por Paciente</h2>
            <p className="text-xs text-muted-foreground">Selecione um paciente para gerar um relatório completo de atendimento</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5 uppercase tracking-wider">Selecionar Paciente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select 
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/40 border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              >
                <option value="">Selecione um paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Prontuário: {p.id.slice(0,6)})</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handlePrint}
            disabled={!selectedPatientId}
            className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            <Printer className="h-4 w-4" />
            Imprimir Relatório
          </button>
        </div>
      </motion.div>

      {/* Sessão Oculta para Impressão */}
      {selectedPatient && (
        <div id="print-section" className="hidden print:block" style={{ color: "#000", background: "white", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "10pt" }}>
          <ReportHeader />

          <div style={{ borderBottom: "2px solid #1B66E8", paddingBottom: "16px", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "18pt", fontWeight: 700, margin: 0 }}>Resumo Clínico do Paciente</h1>
            <p style={{ fontSize: "9pt", color: "#666", marginTop: "4px" }}>Gerado em: {new Date().toLocaleString('pt-BR')}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "12pt", fontWeight: 700, borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px" }}>Informações Pessoais</h2>
              <p style={{ margin: "4px 0" }}><strong>Nome:</strong> {selectedPatient.name}</p>
              <p style={{ margin: "4px 0" }}><strong>Idade/Gênero:</strong> {selectedPatient.age} anos, {selectedPatient.sex === 'M' ? 'Masculino' : 'Feminino'}</p>
              <p style={{ margin: "4px 0" }}><strong>Status:</strong> {selectedPatient.status.toUpperCase()}</p>
              <p style={{ margin: "4px 0" }}><strong>Última Visita:</strong> {selectedPatient.lastVisit}</p>
              <p style={{ margin: "4px 0" }}><strong>CPF:</strong> {selectedPatient.cpf}</p>
            </div>
            <div>
              <h2 style={{ fontSize: "12pt", fontWeight: 700, borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px" }}>Alergias</h2>
              <p style={{ color: "#cc0000", fontWeight: 500, margin: "4px 0" }}>
                {selectedPatient.allergies.join(", ") || "Nenhuma alergia registrada"}
              </p>
              <h2 style={{ fontSize: "12pt", fontWeight: 700, borderBottom: "1px solid #ddd", paddingBottom: "6px", margin: "16px 0 12px" }}>Diagnóstico Recente</h2>
              <p style={{ margin: "4px 0" }}>
                {timelineEvents.find(e => e.patientId === selectedPatient.id && e.type === 'evolucao_medica')?.summary || "Sem diagnóstico registrado recentemente."}
              </p>
            </div>
          </div>

          {/* Prescriptions */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "12pt", fontWeight: 700, borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px" }}>Prescrições Ativas</h2>
            {prescriptions.filter(r => r.patientId === selectedPatient.id).length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>Medicamento</th>
                    <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>Dosagem</th>
                    <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>Instruções</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.filter(r => r.patientId === selectedPatient.id).map((rx, idx) => (
                    <tr key={idx}>
                      <td style={{ border: "1px solid #ddd", padding: "5px 8px", fontWeight: 500 }}>{rx.medication}</td>
                      <td style={{ border: "1px solid #ddd", padding: "5px 8px" }}>{rx.dosage}</td>
                      <td style={{ border: "1px solid #ddd", padding: "5px 8px" }}>{rx.instructions || "---"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: "9pt", fontStyle: "italic", color: "#999" }}>Nenhuma prescrição registrada.</p>
            )}
          </div>

          {/* Vitals + Exams */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "12pt", fontWeight: 700, borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px" }}>Últimos Sinais Vitais</h2>
              {vitalSigns.filter(v => v.patientId === selectedPatient.id).slice(0, 3).map(vs => (
                <div key={vs.id} style={{ marginBottom: "8px", fontSize: "9pt", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "6px" }}>
                  <span style={{ color: "#666" }}>{new Date(vs.created_at).toLocaleString('pt-BR')}</span>
                  <span style={{ fontWeight: 500, textAlign: "right" }}>{vs.temperature}°C | {vs.heartRate}bpm | {vs.bloodPressure}</span>
                </div>
              ))}
              {vitalSigns.filter(v => v.patientId === selectedPatient.id).length === 0 && (
                <p style={{ fontSize: "9pt", fontStyle: "italic", color: "#999" }}>Sem registros.</p>
              )}
            </div>
            <div>
              <h2 style={{ fontSize: "12pt", fontWeight: 700, borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px" }}>Exames Solicitados</h2>
              {exams.filter(e => e.patientId === selectedPatient.id).map(ex => (
                <div key={ex.id} style={{ fontSize: "9pt", display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span>{ex.examName}</span>
                  <span style={{ fontSize: "8pt", textTransform: "uppercase", padding: "2px 6px", background: "#f0f0f0", borderRadius: "3px" }}>Solicitado</span>
                </div>
              ))}
              {exams.filter(e => e.patientId === selectedPatient.id).length === 0 && (
                <p style={{ fontSize: "9pt", fontStyle: "italic", color: "#999" }}>Sem exames pendentes.</p>
              )}
            </div>
          </div>

          <ReportFooter />
        </div>
      )}

      {/* KPIs Gerais */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print"
      >
        <KpiCard label="Total de Pacientes" value={totalPatients} icon={Users} color="bg-primary/10 text-primary" trend="up" />
        <KpiCard label="Prescrições Ativas" value={activeRx} icon={Pill} color="bg-success/10 text-success" />
        <KpiCard label="Exames Pendentes" value={pendingExams} icon={FlaskConical} color="bg-warning/10 text-warning" />
        <KpiCard label="Resultados Disponíveis" value={availableResults} icon={FileText} color="bg-primary/10 text-primary" />
      </motion.div>

      {/* Charts e outras métricas (Ocultas na impressão para focar no paciente) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.2 }}
          className="bg-card rounded-xl shadow-card border-subtle p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold">Atendimentos por Mês</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={atendimentosPorMes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="atendimentos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.3 }}
          className="bg-card rounded-xl shadow-card border-subtle p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold">Distribuição por Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(v) => <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{v}</span>} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Sinais Vitais médios */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.4 }}
        className="bg-card rounded-xl shadow-card border-subtle p-5 no-print"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold">Médias de Sinais Vitais (Últimos Registros)</h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums text-primary">{avgTemp}°C</div>
            <div className="text-xs text-muted-foreground mt-1">Temperatura média</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums text-primary">{avgHR} bpm</div>
            <div className="text-xs text-muted-foreground mt-1">FC média</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums text-primary">{avgSpO2}%</div>
            <div className="text-xs text-muted-foreground mt-1">SpO2 média</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: typeof Users; color: string; trend?: "up" | "down";
}) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border-subtle">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-medium ${trend === "up" ? "text-success" : "text-destructive"}`}>
            {trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          </span>
        )}
      </div>
      <div className="text-vital tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/70 mt-0.5">{sub}</div>}
    </div>
  );
}
