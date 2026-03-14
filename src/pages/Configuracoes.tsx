import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Palette, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

type Tab = "perfil" | "notificacoes" | "seguranca" | "aparencia";

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState<Tab>("perfil");

  const [profile, setProfile] = useState({
    name: "Dr. Usuário Atual",
    email: "usuario@pulse.med.br",
    crm: "00000/SP",
    phone: "(11) 99999-0000",
    specialty: "Clínica Médica",
    institution: "Hospital Pulse",
  });

  const [notifications, setNotifications] = useState({
    novoResultado: true,
    alertaCritico: true,
    prescricaoVencendo: false,
    lembreteConsulta: true,
    email: false,
    sistema: true,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
    sessionTimeout: "60",
  });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const [appearance, setAppearance] = useState({
    theme: "light",
    density: "normal",
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
  });

  const tabs = [
    { key: "perfil" as Tab, label: "Perfil", icon: User },
    { key: "notificacoes" as Tab, label: "Notificações", icon: Bell },
    { key: "seguranca" as Tab, label: "Segurança", icon: Shield },
    { key: "aparencia" as Tab, label: "Aparência", icon: Palette },
  ];

  const inp = "w-full h-9 px-3 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const sel = "w-full h-9 px-3 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

  const handleSave = () => toast.success("Configurações salvas com sucesso.");

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Tabs sidebar */}
        <motion.nav
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={transition}
          className="lg:w-48 shrink-0"
        >
          <div className="bg-card rounded-lg shadow-card border-subtle p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.nav>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="flex-1 bg-card rounded-lg shadow-card border-subtle p-6"
        >
          {activeTab === "perfil" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold">Informações do Perfil</h2>
              </div>

              <div className="flex items-center gap-4 pb-5 border-b border-border">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold shrink-0">
                  {profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">{profile.specialty} • {profile.institution}</p>
                  <button className="mt-1.5 text-xs text-primary hover:underline">Alterar foto</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nome completo</label>
                  <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">E-mail</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">CRM</label>
                  <input value={profile.crm} onChange={(e) => setProfile((p) => ({ ...p, crm: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Telefone</label>
                  <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Especialidade</label>
                  <input value={profile.specialty} onChange={(e) => setProfile((p) => ({ ...p, specialty: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Instituição</label>
                  <input value={profile.institution} onChange={(e) => setProfile((p) => ({ ...p, institution: e.target.value }))} className={inp} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notificacoes" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold">Preferências de Notificação</h2>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Eventos</p>
                {[
                  { key: "novoResultado", label: "Novo resultado de exame disponível" },
                  { key: "alertaCritico", label: "Alerta clínico crítico" },
                  { key: "prescricaoVencendo", label: "Prescrição próxima do vencimento" },
                  { key: "lembreteConsulta", label: "Lembrete de consulta agendada" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm">{item.label}</span>
                    <Toggle
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Canais</p>
                {[
                  { key: "sistema", label: "Notificações no sistema" },
                  { key: "email", label: "Notificações por e-mail" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm">{item.label}</span>
                    <Toggle
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "seguranca" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold">Segurança da Conta</h2>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alterar Senha</p>
                {[
                  { key: "current" as const, label: "Senha atual", field: "currentPassword" as keyof typeof security },
                  { key: "new" as const, label: "Nova senha", field: "newPassword" as keyof typeof security },
                  { key: "confirm" as const, label: "Confirmar nova senha", field: "confirmPassword" as keyof typeof security },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="text-xs font-medium text-muted-foreground">{item.label}</label>
                    <div className="relative">
                      <input
                        type={showPass[item.key] ? "text" : "password"}
                        value={security[item.field] as string}
                        onChange={(e) => setSecurity((s) => ({ ...s, [item.field]: e.target.value }))}
                        className={`${inp} pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => ({ ...p, [item.key]: !p[item.key] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPass[item.key] ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sessão e Acesso</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Autenticação em dois fatores</p>
                    <p className="text-xs text-muted-foreground">Adiciona uma camada extra de segurança</p>
                  </div>
                  <Toggle checked={security.twoFactor} onChange={(v) => setSecurity((s) => ({ ...s, twoFactor: v }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Timeout de sessão (minutos)</label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))}
                    className={sel}
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="120">2 horas</option>
                    <option value="480">8 horas</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "aparencia" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold">Aparência e Localização</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tema</label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {[
                      { key: "light", label: "Claro", preview: "bg-white border-2" },
                      { key: "dark", label: "Escuro", preview: "bg-slate-900 border-2" },
                      { key: "system", label: "Sistema", preview: "bg-gradient-to-r from-white to-slate-900 border-2" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setAppearance((a) => ({ ...a, theme: t.key }))}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                          appearance.theme === t.key ? "border-primary" : "border-border"
                        }`}
                      >
                        <div className={`h-10 w-full rounded ${t.preview} ${appearance.theme === t.key ? "border-primary" : "border-border"}`} />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Densidade da interface</label>
                  <select value={appearance.density} onChange={(e) => setAppearance((a) => ({ ...a, density: e.target.value }))} className={sel}>
                    <option value="compact">Compacto</option>
                    <option value="normal">Normal</option>
                    <option value="comfortable">Confortável</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Idioma</label>
                  <select value={appearance.language} onChange={(e) => setAppearance((a) => ({ ...a, language: e.target.value }))} className={sel}>
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Formato de data</label>
                  <select value={appearance.dateFormat} onChange={(e) => setAppearance((a) => ({ ...a, dateFormat: e.target.value }))} className={sel}>
                    <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                    <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-6 pt-5 border-t border-border flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4" strokeWidth={1.5} />
              Salvar Alterações
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
