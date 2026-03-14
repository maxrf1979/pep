import { motion } from "framer-motion";
import { BarChart3, Users, FileText, Pill, FlaskConical, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { patients, prescriptions, exams, vitalSigns } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

// Computed data from mock-data
const totalPatients = patients.length;
const internados = patients.filter((p) => p.status === "internado").length;
const ambulatoriais = patients.filter((p) => p.status === "ambulatorial").length;
const alta = patients.filter((p) => p.status === "alta").length;

const activeRx = prescriptions.filter((r) => r.status === "ativa").length;
const pendingExams = exams.filter((e) => e.status === "solicitado" || e.status === "coletado").length;
const availableResults = exams.filter((e) => e.status === "resultado_disponivel").length;

const statusData = [
  { name: "Internados", value: internados },
  { name: "Ambulatorial", value: ambulatoriais },
  { name: "Alta", value: alta },
];

const atendimentosPorMes = [
  { mes: "Out", atendimentos: 38 },
  { mes: "Nov", atendimentos: 45 },
  { mes: "Dez", atendimentos: 41 },
  { mes: "Jan", atendimentos: 52 },
  { mes: "Fev", atendimentos: 48 },
  { mes: "Mar", atendimentos: 38 },
];

const examTypeData = [
  { name: "Laboratorial", value: exams.filter((e) => e.type === "laboratorial").length },
  { name: "Imagem", value: exams.filter((e) => e.type === "imagem").length },
  { name: "Funcional", value: exams.filter((e) => e.type === "funcional").length },
];

const allergiesFreq: Record<string, number> = {};
patients.forEach((p) => p.allergies.forEach((a) => { allergiesFreq[a] = (allergiesFreq[a] || 0) + 1; }));
const topAllergies = Object.entries(allergiesFreq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([name, value]) => ({ name, value }));

// Average vitals
const avgTemp = vitalSigns.length ? (vitalSigns.reduce((s, v) => s + v.temperature, 0) / vitalSigns.length).toFixed(1) : "—";
const avgHR = vitalSigns.length ? Math.round(vitalSigns.reduce((s, v) => s + v.heartRate, 0) / vitalSigns.length) : "—";
const avgSpO2 = vitalSigns.length ? Math.round(vitalSigns.reduce((s, v) => s + v.oxygenSaturation, 0) / vitalSigns.length) : "—";

function KpiCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: typeof Users; color: string; trend?: "up" | "down";
}) {
  return (
    <div className="bg-card rounded-lg p-4 shadow-card border-subtle">
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

export default function Relatorios() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Indicadores clínicos e administrativos — {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KpiCard label="Total de Pacientes" value={totalPatients} icon={Users} color="bg-primary/10 text-primary" trend="up" />
        <KpiCard label="Prescrições Ativas" value={activeRx} icon={Pill} color="bg-success/10 text-success" />
        <KpiCard label="Exames Pendentes" value={pendingExams} icon={FlaskConical} color="bg-warning/10 text-warning" />
        <KpiCard label="Resultados Disponíveis" value={availableResults} icon={FileText} color="bg-primary/10 text-primary" />
      </motion.div>

      {/* Sinais Vitais médios */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.08 }}
        className="bg-card rounded-lg p-5 shadow-card border-subtle"
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atendimentos por mês */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.12 }}
          className="bg-card rounded-lg p-5 shadow-card border-subtle"
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

        {/* Status dos pacientes */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.16 }}
          className="bg-card rounded-lg p-5 shadow-card border-subtle"
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

        {/* Tipos de exame */}
        {examTypeData.some((d) => d.value > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.2 }}
            className="bg-card rounded-lg p-5 shadow-card border-subtle"
          >
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <h2 className="text-sm font-semibold">Exames por Tipo</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={examTypeData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={80} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Alergias mais frequentes */}
        {topAllergies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.24 }}
            className="bg-card rounded-lg p-5 shadow-card border-subtle"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-destructive" strokeWidth={1.5} />
              <h2 className="text-sm font-semibold">Alergias Mais Frequentes</h2>
            </div>
            <div className="space-y-3">
              {topAllergies.map((a, i) => (
                <div key={a.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 tabular-nums">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{a.name}</span>
                      <span className="text-muted-foreground tabular-nums">{a.value} pac.</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-destructive/70"
                        style={{ width: `${(a.value / totalPatients) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
