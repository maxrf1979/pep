import { useState, useEffect } from "react";
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
  Plus,
  Calendar,
  ChevronRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients } from "@/lib/mock-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

const activityData = [
  { day: "Seg", atendimentos: 32 },
  { day: "Ter", atendimentos: 45 },
  { day: "Qua", atendimentos: 38 },
  { day: "Qui", atendimentos: 52 },
  { day: "Sex", atendimentos: 48 },
  { day: "Sáb", atendimentos: 25 },
  { day: "Dom", atendimentos: 12 },
];

const kpis = [
  { label: "Pacientes Ativos", value: "247", change: "+12%", icon: Users, color: "primary" },
  { label: "Atendimentos Hoje", value: "38", change: "+5", icon: FileText, color: "success" },
  { label: "Novas Prescrições", value: "14", change: "+2", icon: Pill, color: "warning" },
  { label: "Alertas Críticos", value: "2", change: "", icon: AlertTriangle, color: "destructive" },
];

const quickActions = [
  { label: "Novo Paciente", icon: UserPlus, url: "/pacientes", desc: "Cadastrar novos dados" },
  { label: "Nova Evolução", icon: FilePlus, url: "/prontuarios", desc: "Registrar atendimento" },
  { label: "Sinais Vitais", icon: Activity, url: "/sinais-vitais", desc: "Aferir parâmetros" },
  { label: "Prescrição", icon: Pill, url: "/prescricoes", desc: "Gerar novo receituário" },
];

const colorMap: Record<string, { bg: string; text: string; gradient: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", gradient: "from-primary/20 to-transparent" },
  success: { bg: "bg-success/10", text: "text-success", gradient: "from-success/20 to-transparent" },
  warning: { bg: "bg-warning/10", text: "text-warning", gradient: "from-warning/20 to-transparent" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive", gradient: "from-destructive/20 to-transparent" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const recentPatients = patients.slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in duration-700 pb-10">
      {/* Header com Boas-vindas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={transition}
        >
          <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1 rounded-full w-fit mb-2 border border-primary/10">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Interface Premium Ativa</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            {getGreeting()}, <span className="text-primary">Dr. Silva</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {currentTime.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            <span className="opacity-30">•</span>
            <Clock className="h-4 w-4" />
            {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transition}
          className="flex gap-3"
        >
          <button 
            onClick={() => navigate("/pacientes")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Novo Registro
          </button>
        </motion.div>
      </div>

      {/* KPIs com Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden bg-card rounded-2xl p-5 shadow-card border-subtle backdrop-blur-sm transition-all"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorMap[kpi.color].gradient} opacity-20 -mr-8 -mt-8 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorMap[kpi.color].bg} ${colorMap[kpi.color].text} group-hover:scale-110 transition-transform`}>
                <kpi.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              {kpi.change && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-success bg-success/5 px-2 py-1 rounded-full border border-success/10">
                  <TrendingUp className="h-3 w-3" />
                  {kpi.change}
                </div>
              )}
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-bold tracking-tight tabular-nums mb-1">{kpi.value}</div>
              <div className="text-xs font-medium text-muted-foreground">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Atividade Semanal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.4 }}
          className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card border-subtle"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold">Fluxo de Atendimentos</h2>
              <p className="text-xs text-muted-foreground">Volume de pacientes nos últimos 7 dias</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
              Média: 36/dia
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAtend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px"
                  }}
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="atendimentos" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAtend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Acesso Rápido Lateral */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-card border-subtle flex flex-col"
        >
          <h2 className="text-lg font-bold mb-6">Ações Rápidas</h2>
          <div className="space-y-3 flex-1">
            {quickActions.map((action, i) => (
              <button
                key={action.label}
                onClick={() => navigate(action.url)}
                className="w-full group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-primary/10 hover:bg-primary/5 transition-all text-left"
              >
                <div className="h-12 w-12 rounded-xl bg-muted/50 text-muted-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                  <action.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{action.label}</div>
                  <div className="text-[11px] text-muted-foreground">{action.desc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
            <p className="text-[11px] font-medium text-primary">Precisa de ajuda?</p>
            <p className="text-[10px] text-muted-foreground mt-1">Acesse a central de suporte para guias rápidos.</p>
          </div>
        </motion.div>
      </div>

      {/* Pacientes Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.6 }}
        className="bg-card rounded-2xl p-6 shadow-card border-subtle"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold">Monitoramento de Pacientes</h2>
            <p className="text-xs text-muted-foreground">Últimas interações e status clínico</p>
          </div>
          <button
            onClick={() => navigate("/pacientes")}
            className="px-4 py-2 rounded-lg bg-muted/50 text-xs font-bold hover:bg-muted transition-colors flex items-center gap-2"
          >
            Ver base completa
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Paciente</th>
                <th className="pb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="pb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Último Atendimento</th>
                <th className="pb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Alegias</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentPatients.map((p) => (
                <tr key={p.id} className="group hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/prontuario/${p.id}`)}>
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-background ring-offset-2">
                        {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-bold group-hover:text-primary transition-colors">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.age} anos • {p.sex === "M" ? "M" : "F"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${
                        p.status === "internado"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : p.status === "ambulatorial"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-success/10 text-success border border-success/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        p.status === "internado" ? "bg-destructive" : p.status === "ambulatorial" ? "bg-primary" : "bg-success"
                      }`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(p.lastVisit).toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-1">
                      {p.allergies.length > 0 ? (
                        p.allergies.slice(0, 2).map((a, idx) => (
                          <span key={idx} className="text-[9px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase border border-border">
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-muted-foreground italic">Nenhuma</span>
                      )}
                      {p.allergies.length > 2 && <span className="text-[9px] font-bold text-muted-foreground">+{p.allergies.length - 2}</span>}
                    </div>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
