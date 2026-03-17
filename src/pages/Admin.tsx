import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Plus, Search, X, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "medico" | "enfermeiro" | "admin" | "recepcao";
  crm?: string;
  coren?: string;
  status: "ativo" | "inativo";
}

const roleConfig = {
  medico: { label: "Médico(a)", cls: "bg-primary/10 text-primary" },
  enfermeiro: { label: "Enfermeiro(a)", cls: "bg-success/10 text-success" },
  admin: { label: "Administrador", cls: "bg-destructive/10 text-destructive" },
  recepcao: { label: "Recepção", cls: "bg-warning/10 text-warning" },
};

// Removido initialUsers - agora usamos dados do Supabase

function NovoUsuarioDialog({ open, onOpenChange, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSave: (u: SystemUser) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", role: "medico" as SystemUser["role"], crm: "", coren: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome obrigatório";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "E-mail inválido";
    if (form.role === "medico" && !form.crm.trim()) e.crm = "CRM obrigatório para médico";
    if (form.role === "enfermeiro" && !form.coren.trim()) e.coren = "COREN obrigatório para enfermeiro";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      crm: form.role === "medico" ? form.crm : undefined,
      coren: form.role === "enfermeiro" ? form.coren : undefined,
      status: "ativo",
    });
    setForm({ name: "", email: "", role: "medico", crm: "", coren: "" });
    setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome completo *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inp("name")} placeholder="Nome do usuário" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">E-mail *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inp("email")} placeholder="email@pulse.med.br" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Perfil *</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)} className={inp("")}>
              <option value="medico">Médico(a)</option>
              <option value="enfermeiro">Enfermeiro(a)</option>
              <option value="admin">Administrador</option>
              <option value="recepcao">Recepção</option>
            </select>
          </div>
          {form.role === "medico" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">CRM *</label>
              <input value={form.crm} onChange={(e) => set("crm", e.target.value)} className={inp("crm")} placeholder="Ex: 12345/SP" />
              {errors.crm && <p className="text-xs text-destructive mt-1">{errors.crm}</p>}
            </div>
          )}
          {form.role === "enfermeiro" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">COREN *</label>
              <input value={form.coren} onChange={(e) => set("coren", e.target.value)} className={inp("coren")} placeholder="Ex: 54321/SP" />
              {errors.coren && <p className="text-xs text-destructive mt-1">{errors.coren}</p>}
            </div>
          )}
        </div>
        <DialogFooter className="mt-2">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Criar Usuário
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Admin() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userList, setUserList] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar usuários do Supabase
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserList(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários do sistema');
    } finally {
      setLoading(false);
    }
  };

  const filtered = userList.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (!search) return true;
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
  });

  const toggleStatus = async (id: string) => {
    const user = userList.find(u => u.id === id);
    if (!user) return;

    const newStatus = user.status === "ativo" ? "inativo" : "ativo";

    try {
      const { error } = await supabase
        .from('system_users')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setUserList((prev) =>
        prev.map((u) => u.id === id ? { ...u, status: newStatus } : u)
      );
      toast.success("Status do usuário atualizado.");
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do usuário');
    }
  };

  const removeUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('system_users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUserList((prev) => prev.filter((u) => u.id !== id));
      toast.success("Usuário removido.");
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  const handleSave = async (u: SystemUser) => {
    try {
      const { data, error } = await supabase
        .from('system_users')
        .insert([{
          name: u.name,
          email: u.email,
          role: u.role,
          crm: u.crm || null,
          coren: u.coren || null,
          status: u.status,
        }])
        .select()
        .single();

      if (error) throw error;

      setUserList((prev) => [data, ...prev]);
      toast.success("Usuário criado com sucesso.");
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      if (error.code === '23505') {
        toast.error('Este e-mail já está cadastrado');
      } else {
        toast.error('Erro ao criar usuário');
      }
    }
  };

  const stats = [
    { label: "Total de Usuários", value: userList.length, color: "bg-primary/10 text-primary" },
    { label: "Ativos", value: userList.filter((u) => u.status === "ativo").length, color: "bg-success/10 text-success" },
    { label: "Inativos", value: userList.filter((u) => u.status === "inativo").length, color: "bg-muted text-muted-foreground" },
    { label: "Médicos", value: userList.filter((u) => u.role === "medico").length, color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <NovoUsuarioDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administração</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerenciamento de usuários e permissões do sistema</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Novo Usuário
        </button>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: i * 0.04 }}
            className="bg-card rounded-lg p-4 shadow-card border-subtle"
          >
            <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg mb-3 ${s.color}`}>
              <Shield className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-md bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "Todos" },
            { key: "medico", label: "Médicos" },
            { key: "enfermeiro", label: "Enfermeiros" },
            { key: "admin", label: "Admin" },
            { key: "recepcao", label: "Recepção" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                roleFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.16 }}
        className="bg-card rounded-lg shadow-card border-subtle overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Usuário</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">E-mail</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Perfil</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Conselho</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const role = roleConfig[u.role];
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <span className="text-sm font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{u.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge-status ${role.cls}`}>{role.label}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {u.crm ? `CRM ${u.crm}` : u.coren ? `COREN ${u.coren}` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(u.id)}
                          className={`badge-status ${u.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                        >
                          {u.status === "ativo" ? "Ativo" : "Inativo"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toast.info("Edição de usuário disponível em breve.")}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => removeUser(u.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Permissões info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.2 }}
        className="bg-card rounded-lg p-5 shadow-card border-subtle"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold">Matriz de Permissões</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-semibold text-muted-foreground py-2 pr-4">Funcionalidade</th>
                {Object.values(roleConfig).map((r) => (
                  <th key={r.label} className="text-center font-semibold text-muted-foreground py-2 px-3">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { feat: "Prontuários", medico: true, enfermeiro: true, admin: true, recepcao: false },
                { feat: "Prescrições", medico: true, enfermeiro: false, admin: true, recepcao: false },
                { feat: "Solicitar Exames", medico: true, enfermeiro: false, admin: true, recepcao: false },
                { feat: "Sinais Vitais", medico: true, enfermeiro: true, admin: true, recepcao: false },
                { feat: "Cadastrar Pacientes", medico: true, enfermeiro: true, admin: true, recepcao: true },
                { feat: "Relatórios", medico: false, enfermeiro: false, admin: true, recepcao: false },
                { feat: "Administração", medico: false, enfermeiro: false, admin: true, recepcao: false },
              ].map((row) => (
                <tr key={row.feat} className="hover:bg-muted/20 transition-colors">
                  <td className="py-2 pr-4 font-medium text-muted-foreground">{row.feat}</td>
                  {[row.medico, row.enfermeiro, row.admin, row.recepcao].map((allowed, i) => (
                    <td key={i} className="text-center py-2 px-3">
                      <span className={allowed ? "text-success font-bold" : "text-muted-foreground/30"}>
                        {allowed ? "✓" : "✗"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
