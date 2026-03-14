import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Pill,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  UserPlus,
  FilePlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients } from "@/lib/mock-data";

const transition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

const kpis = [
  { label: "Pacientes Ativos", value: "247", change: "+12", icon: Users, color: "primary" },
  { label: "Atendimentos Hoje", value: "38", change: "+5", icon: FileText, color: "success" },
  { label: "Prescrições Emitidas", value: "24", change: "+8", icon: Pill, color: "warning" },
  { label: "Alertas Pendentes", value: "3", change: "", icon: AlertTriangle, color: "destructive" },
];

const quickActions = [
  { label: "Novo Paciente", icon: UserPlus, url: "/pacientes" },
  { label: "Nova Evolução", icon: FilePlus, url: "/prontuarios" },
  { label: "Registrar Sinais", icon: Activity, url: "/sinais-vitais" },
  { label: "Nova Prescrição", icon: Pill, url: "/prescricoes" },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const recentPatients = patients.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral — {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: i * 0.04 }}
            className="bg-card rounded-lg p-4 shadow-card border-subtle"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${colorMap[kpi.color]}`}>
                <kpi.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </div>
              {kpi.change && (
                <span className="flex items-center text-xs font-medium text-success">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {kpi.change}
                </span>
              )}
            </div>
            <div className="text-vital tabular-nums">{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.18 }}
          className="bg-card rounded-lg p-5 shadow-card border-subtle"
        >
          <h2 className="text-sm font-semibold mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.url)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/40 hover:bg-primary/5 hover:shadow-card transition-all text-center group"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <action.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Patients */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.22 }}
          className="lg:col-span-2 bg-card rounded-lg p-5 shadow-card border-subtle"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Pacientes Recentes</h2>
            <button
              onClick={() => navigate("/pacientes")}
              className="text-xs text-primary font-medium hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-1">
            {recentPatients.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/prontuario/${p.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors text-left"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.age} anos • {p.sex === "M" ? "Masculino" : "Feminino"}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`badge-status ${
                      p.status === "internado"
                        ? "bg-destructive/10 text-destructive"
                        : p.status === "ambulatorial"
                        ? "bg-primary/10 text-primary"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {p.status}
                  </span>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(p.lastVisit).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
