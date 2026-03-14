import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, X, Edit2, Trash2, Lock, LockOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

interface SystemUser {
  id: string;
  name: string;
  email: string;
  login: string;
  roles: ("medico" | "enfermeiro" | "admin" | "recepcao")[];
  crm?: string;
  coren?: string;
  status: "ativo" | "inativo";
}

const roleConfig = {
  medico: { label: "Médico(a)", cls: "bg-primary/10 text-primary", icon: "🏥" },
  enfermeiro: { label: "Enfermeiro(a)", cls: "bg-success/10 text-success", icon: "🩺" },
  admin: { label: "Administrador", cls: "bg-destructive/10 text-destructive", icon: "⚙️" },
  recepcao: { label: "Recepção", cls: "bg-warning/10 text-warning", icon: "📞" },
};

const initialUsers: SystemUser[] = [
  { id: "u-001", name: "Dr. Ricardo Almeida", email: "ricardo.almeida@pulse.med.br", login: "ricardo.almeida", roles: ["medico"], crm: "12345/SP", status: "ativo" },
  { id: "u-002", name: "Dra. Juliana Moreira", email: "juliana.moreira@pulse.med.br", login: "juliana.moreira", roles: ["medico"], crm: "98765/SP", status: "ativo" },
  { id: "u-003", name: "Dr. André Costa", email: "andre.costa@pulse.med.br", login: "andre.costa", roles: ["medico"], crm: "54321/RJ", status: "ativo" },
  { id: "u-004", name: "Enf. Carla Souza", email: "carla.souza@pulse.med.br", login: "carla.souza", roles: ["enfermeiro"], coren: "54321/SP", status: "ativo" },
  { id: "u-005", name: "Enf. Paulo Martins", email: "paulo.martins@pulse.med.br", login: "paulo.martins", roles: ["enfermeiro"], coren: "65432/SP", status: "ativo" },
  { id: "u-006", name: "Ana Gestora", email: "ana.gestora@pulse.med.br", login: "ana.gestora", roles: ["admin"], status: "ativo" },
  { id: "u-007", name: "Beatriz Recepção", email: "beatriz@pulse.med.br", login: "beatriz", roles: ["recepcao"], status: "inativo" },
];

function UsuarioDialog({ open, onOpenChange, onSave, editingUser }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSave: (u: SystemUser) => void; editingUser?: SystemUser;
}) {
  const isEditing = !!editingUser;
  const [form, setForm] = useState(() => {
    if (editingUser) {
      return {
        name: editingUser.name,
        email: editingUser.email,
        login: editingUser.login,
        password: "",
        crm: editingUser.crm || "",
        coren: editingUser.coren || "",
        roles: {
          medico: editingUser.roles.includes("medico"),
          enfermeiro: editingUser.roles.includes("enfermeiro"),
          admin: editingUser.roles.includes("admin"),
          recepcao: editingUser.roles.includes("recepcao"),
        }
      };
    }
    return { name: "", email: "", login: "", password: "", crm: "", coren: "", roles: { medico: false, enfermeiro: false, admin: false, recepcao: false } };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string | boolean) => {
    setForm((f) => {
      if (k.startsWith("roles.")) {
        const role = k.split(".")[1] as keyof typeof form.roles;
        return { ...f, roles: { ...f.roles, [role]: v } };
      }
      return { ...f, [k]: v };
    });
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome obrigatório";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "E-mail inválido";
    if (!form.login.trim()) e.login = "Login obrigatório";
    if (!isEditing && !form.password.trim()) e.password = "Senha obrigatória";
    if (form.password && form.password.length < 6) e.password = "Senha deve ter no mínimo 6 caracteres";
    if (!Object.values(form.roles).some(v => v)) e.roles = "Selecione pelo menos um papel";
    if (form.roles.medico && !form.crm.trim()) e.crm = "CRM obrigatório para médico";
    if (form.roles.enfermeiro && !form.coren.trim()) e.coren = "COREN obrigatório para enfermeiro";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const selectedRoles = Object.entries(form.roles)
      .filter(([_, v]) => v)
      .map(([k]) => k as "medico" | "enfermeiro" | "admin" | "recepcao");

    onSave({
      id: editingUser ? editingUser.id : crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim(),
      login: form.login.trim(),
      roles: selectedRoles,
      crm: form.roles.medico ? form.crm : undefined,
      coren: form.roles.enfermeiro ? form.coren : undefined,
      status: editingUser ? editingUser.status : "ativo",
    });
    setForm({ name: "", email: "", login: "", password: "", crm: "", coren: "", roles: { medico: false, enfermeiro: false, admin: false, recepcao: false } });
    setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuário" : "Criar Novo Usuário"}</DialogTitle>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Login *</label>
              <input value={form.login} onChange={(e) => set("login", e.target.value)} className={inp("login")} placeholder="usuario.nome" />
              {errors.login && <p className="text-xs text-destructive mt-1">{errors.login}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Senha {isEditing ? "(deixe vazio para não alterar)" : "*"}
              </label>
              <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className={inp("password")} placeholder={isEditing ? "Opcional" : "••••••"} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Papéis *</label>
            <div className="space-y-2 p-3 bg-muted/30 rounded-md border border-border">
              {[
                { key: "medico" as const, label: "Médico(a)", icon: "🏥" },
                { key: "enfermeiro" as const, label: "Enfermeiro(a)", icon: "🩺" },
                { key: "admin" as const, label: "Administrador", icon: "⚙️" },
                { key: "recepcao" as const, label: "Recepção", icon: "📞" },
              ].map(role => (
                <label key={role.key} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={form.roles[role.key]}
                    onChange={(e) => set(`roles.${role.key}`, e.target.checked)}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                  <span className="text-sm">{role.icon} {role.label}</span>
                </label>
              ))}
            </div>
            {errors.roles && <p className="text-xs text-destructive mt-1">{errors.roles}</p>}
          </div>

          {form.roles.medico && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">CRM *</label>
              <input value={form.crm} onChange={(e) => set("crm", e.target.value)} className={inp("crm")} placeholder="Ex: 12345/SP" />
              {errors.crm && <p className="text-xs text-destructive mt-1">{errors.crm}</p>}
            </div>
          )}
          {form.roles.enfermeiro && (
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

export default function Usuarios() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | undefined>();
  const [userList, setUserList] = useState<SystemUser[]>(initialUsers);

  const filtered = userList.filter((u) => {
    if (roleFilter !== "all" && !u.roles.includes(roleFilter as any)) return false;
    if (!search) return true;
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.login.toLowerCase().includes(search.toLowerCase());
  });

  const toggleStatus = (id: string) => {
    setUserList((prev) =>
      prev.map((u) => u.id === id ? { ...u, status: u.status === "ativo" ? "inativo" : "ativo" } : u)
    );
    toast.success("Status do usuário atualizado.");
  };

  const removeUser = (id: string) => {
    setUserList((prev) => prev.filter((u) => u.id !== id));
    toast.success("Usuário removido.");
  };

  const handleSave = (u: SystemUser) => {
    if (editingUser) {
      setUserList((prev) => prev.map((user) => user.id === u.id ? u : user));
      toast.success("Usuário atualizado com sucesso.");
      setEditingUser(undefined);
    } else {
      setUserList((prev) => [u, ...prev]);
      toast.success("Usuário criado com sucesso.");
    }
    setDialogOpen(false);
  };

  const openNewDialog = () => {
    setEditingUser(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (user: SystemUser) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <UsuarioDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} editingUser={editingUser} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" strokeWidth={1.5} />
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Crie, edite e gerencie usuários do sistema com login, senha e papéis</p>
        </div>
        <button
          onClick={openNewDialog}
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
        {[
          { label: "Total", value: userList.length, color: "bg-primary/10 text-primary", icon: Users },
          { label: "Ativos", value: userList.filter((u) => u.status === "ativo").length, color: "bg-success/10 text-success", icon: LockOpen },
          { label: "Inativos", value: userList.filter((u) => u.status === "inativo").length, color: "bg-muted text-muted-foreground", icon: Lock },
          { label: "Médicos", value: userList.filter((u) => u.roles.includes("medico")).length, color: "bg-warning/10 text-warning", icon: Users },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: i * 0.04 }}
            className="bg-card rounded-lg p-4 shadow-card border-subtle"
          >
            <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg mb-3 ${s.color}`}>
              <s.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold tabular-nums">{s.value}</div>
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
            placeholder="Buscar por nome, login ou e-mail..."
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
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: "all", label: "Todos" },
            { key: "medico", label: "🏥 Médicos" },
            { key: "enfermeiro", label: "🩺 Enfermeiros" },
            { key: "admin", label: "⚙️ Admin" },
            { key: "recepcao", label: "📞 Recepção" },
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
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Login</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">E-mail</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Papéis</th>
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
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <span className="text-sm font-medium block">{u.name}</span>
                          <span className="text-xs text-muted-foreground">@{u.login}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground font-mono">{u.login}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map((role) => (
                          <span key={role} className={`badge-status text-xs ${roleConfig[role].cls}`}>
                            {roleConfig[role].label}
                          </span>
                        ))}
                      </div>
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
                          onClick={() => openEditDialog(u)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          title="Editar usuário"
                        >
                          <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => removeUser(u.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Remover usuário"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
