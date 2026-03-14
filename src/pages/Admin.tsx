import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Plus, Search, X, Lock, LockOpen, Eye, EyeOff, Check } from "lucide-react";
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

const initialUsers: SystemUser[] = [];

function UsuarioDialog({ open, onOpenChange, onSave, editingUser }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSave: (u: SystemUser) => void; editingUser?: SystemUser;
}) {
  const isEditing = !!editingUser;
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState(() => {
    if (editingUser) {
      return {
        name: editingUser.name,
        email: editingUser.email,
        login: editingUser.login,
        password: "",
        confirmPassword: "",
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
    return { name: "", email: "", login: "", password: "", confirmPassword: "", crm: "", coren: "", roles: { medico: false, enfermeiro: false, admin: false, recepcao: false } };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingUser) {
      setForm({
        name: editingUser.name,
        email: editingUser.email,
        login: editingUser.login,
        password: "",
        confirmPassword: "",
        crm: editingUser.crm || "",
        coren: editingUser.coren || "",
        roles: {
          medico: editingUser.roles.includes("medico"),
          enfermeiro: editingUser.roles.includes("enfermeiro"),
          admin: editingUser.roles.includes("admin"),
          recepcao: editingUser.roles.includes("recepcao"),
        }
      });
    } else {
      setForm({ name: "", email: "", login: "", password: "", confirmPassword: "", crm: "", coren: "", roles: { medico: false, enfermeiro: false, admin: false, recepcao: false } });
    }
    setErrors({});
  }, [editingUser]);

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
    if (!form.login.trim()) e.login = "Login obrigatório";
    if (!isEditing && !form.password.trim()) e.password = "Senha obrigatória";
    if (form.password && form.password.length < 6) e.password = "Senha deve ter no mínimo 6 caracteres";
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = "As senhas não conferem";
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
    setForm({ name: "", email: "", login: "", password: "", confirmPassword: "", crm: "", coren: "", roles: { medico: false, enfermeiro: false, admin: false, recepcao: false } });
    setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome completo *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inp("name")} placeholder="Nome do usuário" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Login *</label>
              <input value={form.login} onChange={(e) => set("login", e.target.value)} className={inp("login")} placeholder="usuario.nome" />
              {errors.login && <p className="text-xs text-destructive mt-1">{errors.login}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Senha {isEditing ? "(opcional)" : "*"}</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} className={inp("password")} placeholder={isEditing ? "Deixe vazio para não alterar" : "••••••"} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
          </div>

          {form.password && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Confirmar Senha *</label>
              <div className="relative">
                {form.password && form.confirmPassword && form.password === form.confirmPassword ? (
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-background border border-success text-sm focus:outline-none focus:ring-2 focus:ring-success/20"
                    placeholder="Confirme a senha"
                  />
                ) : (
                  <input type={showPass ? "text" : "password"} value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className={inp("confirmPassword")} placeholder="Confirme a senha" />
                )}
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {form.password && form.confirmPassword && form.password === form.confirmPassword && (
                  <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-success" strokeWidth={3} />
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                set("password", "");
                set("confirmPassword", "");
              }}
              className="w-full px-3 py-2 rounded-md bg-muted/50 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Redefinir Senha
            </button>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Papéis *</label>
            <div className="space-y-2 p-3 bg-muted/30 rounded-md border border-border">
              {[
                { key: "medico" as const, label: "Médico(a)", icon: "🏥" },
                { key: "enfermeiro" as const, label: "Enfermeiro(a)", icon: "🩺" },
                { key: "admin" as const, label: "Administrador", icon: "⚙️" },
                { key: "recepcao" as const, label: "Recepção", icon: "📞" },
              ].map(role => (
                <label key={role.key} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors group">
                  <div className="relative flex items-center justify-center h-4 w-4">
                    <input
                      type="checkbox"
                      checked={form.roles[role.key]}
                      onChange={(e) => set(`roles.${role.key}`, e.target.checked)}
                      className="peer h-4 w-4 rounded border-border appearance-none checked:bg-primary checked:border-primary cursor-pointer transition-all"
                    />
                    <Check className="absolute h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                  </div>
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
            {isEditing ? "Salvar Alterações" : "Criar Usuário"}
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
  const [editingUser, setEditingUser] = useState<SystemUser | undefined>();
  const [userList, setUserList] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem("systemUsers");
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // Salvar usuários no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem("systemUsers", JSON.stringify(userList));
  }, [userList]);

  const filtered = userList.filter((u) => {
    if (roleFilter !== "all" && !u.roles.includes(roleFilter as any)) return false;
    if (!search) return true;
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.login.toLowerCase().includes(search.toLowerCase());
  });

  const toggleStatus = (id: string, currentStatus: string) => {
    setUserList((prev) =>
      prev.map((u) => u.id === id ? { ...u, status: u.status === "ativo" ? "inativo" : "ativo" } : u)
    );
    toast.success(`Usuário ${currentStatus === "ativo" ? "inativado" : "ativado"} com sucesso.`);
  };

  const removeUser = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover o usuário ${name}?`)) {
      setUserList((prev) => prev.filter((u) => u.id !== id));
      toast.success("Usuário removido.");
    }
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

  const stats = [
    { label: "Total de Usuários", value: userList.length, color: "bg-primary/10 text-primary", icon: Users },
    { label: "Ativos", value: userList.filter((u) => u.status === "ativo").length, color: "bg-success/10 text-success", icon: LockOpen },
    { label: "Inativos", value: userList.filter((u) => u.status === "inativo").length, color: "bg-muted text-muted-foreground", icon: Lock },
    { label: "Médicos", value: userList.filter((u) => u.roles.includes("medico")).length, color: "bg-warning/10 text-warning", icon: Users },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <UsuarioDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} editingUser={editingUser} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administração</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerenciamento de usuários e permissões do sistema</p>
        </div>
        <button
          onClick={openNewDialog}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
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
              <s.icon className="h-4 w-4" strokeWidth={1.5} />
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
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Conselho</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => openEditDialog(u)} className="flex items-center gap-3 w-full text-left hover:opacity-70 transition-opacity">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <span className="text-sm font-medium block">{u.name}</span>
                          <span className="text-xs text-muted-foreground">@{u.login}</span>
                        </div>
                      </button>
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
                          <span key={role} className={`badge-status text-xs ${roleConfig[role].cls} flex items-center gap-1`}>
                            <span>{roleConfig[role].icon}</span>
                            {roleConfig[role].label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {u.crm ? `CRM ${u.crm}` : u.coren ? `COREN ${u.coren}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(u.id, u.status)}
                        className={`badge-status ${u.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                      >
                        {u.status === "ativo" ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleStatus(u.id, u.status)}
                          className={`p-1.5 rounded-md transition-colors ${
                            u.status === "ativo"
                              ? "text-muted-foreground hover:text-warning hover:bg-warning/10"
                              : "text-muted-foreground hover:text-success hover:bg-success/10"
                          }`}
                          title={u.status === "ativo" ? "Inativar usuário" : "Ativar usuário"}
                        >
                          {u.status === "ativo" ? <Lock className="h-4 w-4" strokeWidth={1.5} /> : <LockOpen className="h-4 w-4" strokeWidth={1.5} />}
                        </button>
                        <button
                          onClick={() => removeUser(u.id, u.name)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Remover usuário"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
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
