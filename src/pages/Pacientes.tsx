import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, UserPlus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patients as initialPatients, Patient } from "@/lib/mock-data";
import NovoPacienteDialog from "@/components/NovoPacienteDialog";
import { toast } from "sonner";

const transition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

export default function Pacientes() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [patientList, setPatientList] = useState<Patient[]>(() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : initialPatients;
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  // Salvar pacientes no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patientList));
  }, [patientList]);

  const handleNewPatient = (p: Patient) => {
    setPatientList((prev) => [p, ...prev]);
    toast.success(`Paciente ${p.name} cadastrado com sucesso!`);
  };

  const filtered = patientList.filter((p) => {
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.cpf.includes(query) ||
      (p.sus && p.sus.includes(query));
    const matchesStatus = statusFilter === "todos" || p.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {patientList.length} pacientes cadastrados
          </p>
        </div>
        <button onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" strokeWidth={1.5} />
          Novo Paciente
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou cartão SUS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-md p-0.5">
          {["todos", "internado", "ambulatorial", "alta"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="bg-card rounded-lg shadow-card border-subtle overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Paciente
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                CPF
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Idade / Sexo
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Última Consulta
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/prontuario/${p.id}`)}
                className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      {p.allergies.length > 0 && (
                        <div className="text-[11px] text-destructive font-medium">
                          ⚠ {p.allergies.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-muted-foreground tabular-nums hidden md:table-cell">
                  {p.cpf}
                </td>
                <td className="py-2.5 px-4 text-muted-foreground hidden lg:table-cell">
                  {p.age} anos • {p.sex}
                </td>
                <td className="py-2.5 px-4 text-muted-foreground tabular-nums hidden md:table-cell">
                  {new Date(p.lastVisit).toLocaleDateString("pt-BR")}
                </td>
                <td className="py-2.5 px-4">
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
                </td>
                <td className="py-2.5 px-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhum paciente encontrado.
          </div>
        )}
      </motion.div>
      <NovoPacienteDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleNewPatient} />
    </div>
  );
}
