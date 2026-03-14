import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, User, Bell, Shield, Palette, Save, Eye, EyeOff, 
  Upload, Trash2, Sparkles, Building2, Smartphone, Mail, MapPin, Clock, 
  Palette as PaletteIcon
} from "lucide-react";
import { toast } from "sonner";

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

type Tab = "perfil" | "clinica" | "notificacoes" | "seguranca";

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState<Tab>("clinica");

  // Clínica Settings
  const [clinicData, setClinicData] = useState(() => {
    const saved = localStorage.getItem("clinicSettings");
    return saved ? JSON.parse(saved) : {
      name: "Aurea Dental",
      cnpj: "12.345.678/0001-90",
      phone: "(11) 3456-7890",
      email: "contato@aureadental.com.br",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      hoursStart: "08:00",
      hoursEnd: "18:00",
      primaryColor: "#10B981",
      secondaryColor: "#10B981",
      logo: null,
      logoName: "logo de anthony.jpeg"
    };
  });

  const [profile, setProfile] = useState({
    name: "Dr. Usuário Atual",
    email: "usuario@pulse.med.br",
    crm: "00000/SP",
    phone: "(11) 99999-0000",
    specialty: "Clínica Médica",
    institution: "Hospital Pulse",
  });

  const [notifications, setNotifications] = useState({
    novosAgendamentos: true,
    cancelamentos: true,
    resultadosExames: false,
    atualizacoesPendentes: true,
    avisosEstoque: false,
    canalEmail: false,
    canalPush: true,
    canalSMS: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
    sessionTimeout: "60",
  });

  const tabs = [
    { key: "clinica" as Tab, label: "Clínica", icon: Building2 },
    { key: "perfil" as Tab, label: "Perfil", icon: User },
    { key: "notificacoes" as Tab, label: "Notificações", icon: Bell },
    { key: "seguranca" as Tab, label: "Segurança", icon: Shield },
  ];

  const inp = "w-full h-10 px-4 rounded-lg bg-muted/40 border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";
  
  const handleSave = () => {
    localStorage.setItem("clinicSettings", JSON.stringify(clinicData));
    toast.success("Configurações da clínica salvas com sucesso.");
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie as informações da clínica e suas preferências pessoais</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Tabs sidebar */}
        <motion.nav
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={transition}
          className="lg:w-48 shrink-0"
        >
          <div className="bg-card rounded-xl shadow-card border-subtle p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
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
        <div className="flex-1 space-y-6">
          {activeTab === "clinica" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="space-y-6"
            >
              {/* Identidade Visual Card */}
              <div className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <PaletteIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Identidade Visual</h2>
                    <p className="text-xs text-muted-foreground">Logotipo, cores e tipografia da clínica</p>
                  </div>
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nome da Instituição</label>
                      <input 
                        value={clinicData.name} 
                        onChange={(e) => setClinicData({...clinicData, name: e.target.value})} 
                        className={inp} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Cor Primária</label>
                        <div className="flex gap-2">
                          <div className="h-10 w-10 rounded-lg border-subtle shrink-0" style={{ backgroundColor: clinicData.primaryColor }} />
                          <input 
                            value={clinicData.primaryColor} 
                            onChange={(e) => setClinicData({...clinicData, primaryColor: e.target.value})} 
                            className={inp} 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Cor Secundária</label>
                        <div className="flex gap-2">
                          <div className="h-10 w-10 rounded-lg border-subtle shrink-0" style={{ backgroundColor: clinicData.secondaryColor }} />
                          <input 
                            value={clinicData.secondaryColor} 
                            onChange={(e) => setClinicData({...clinicData, secondaryColor: e.target.value})} 
                            className={inp} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-medium text-muted-foreground block">Logotipo</label>
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-20 rounded-xl bg-slate-900 flex items-center justify-center p-2 border border-border overflow-hidden">
                        {clinicData.logo ? (
                          <img src={clinicData.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <div className="text-primary text-xl">🦷</div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setClinicData({
                                    ...clinicData,
                                    logo: reader.result as string,
                                    logoName: file.name
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button 
                            onClick={() => document.getElementById('logo-upload')?.click()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border text-xs font-medium hover:bg-muted transition-colors"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Upload Logo
                          </button>
                          <button 
                            onClick={() => setClinicData({...clinicData, logo: null, logoName: ""})}
                            className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-relaxed">
                          {clinicData.logoName || "Nenhum arquivo selecionado"}
                          <br />
                          PNG, JPG ou SVG. Máx. 6MB.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                </div>
              </div>

              {/* Dados da Clínica Card */}
              <div className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Dados da Clínica</h2>
                    <p className="text-xs text-muted-foreground">Informações cadastrais e endereço</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">CNPJ</label>
                    <input 
                      value={clinicData.cnpj} 
                      onChange={(e) => setClinicData({...clinicData, cnpj: e.target.value})} 
                      className={inp} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Telefone</label>
                    <input 
                      value={clinicData.phone} 
                      onChange={(e) => setClinicData({...clinicData, phone: e.target.value})} 
                      className={inp} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">E-mail</label>
                    <input 
                      type="email"
                      value={clinicData.email} 
                      onChange={(e) => setClinicData({...clinicData, email: e.target.value})} 
                      className={inp} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Horário</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input 
                          type="time" 
                          value={clinicData.hoursStart} 
                          onChange={(e) => setClinicData({...clinicData, hoursStart: e.target.value})} 
                          className={`${inp} pr-10`} 
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">até</span>
                      <div className="relative flex-1">
                        <input 
                          type="time" 
                          value={clinicData.hoursEnd} 
                          onChange={(e) => setClinicData({...clinicData, hoursEnd: e.target.value})} 
                          className={`${inp} pr-10`} 
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Endereço</label>
                    <input 
                      value={clinicData.address} 
                      onChange={(e) => setClinicData({...clinicData, address: e.target.value})} 
                      className={inp} 
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Salvar Flutuante ou no Fim */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  Salvar Configurações
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "perfil" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-5"
            >
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
                  <button className="mt-1.5 text-xs text-primary hover:underline font-medium">Alterar foto</button>
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

              <div className="flex justify-end pt-5 border-t border-border">
                <button onClick={() => toast.success("Perfil atualizado.")} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  Salvar Perfil
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "notificacoes" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2 border-b border-border pb-3">
                  <Bell className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold">Alertas de Pacientes</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "novosAgendamentos" as const, label: "Novos agendamentos" },
                    { key: "cancelamentos" as const, label: "Cancelamentos de última hora" },
                    { key: "resultadosExames" as const, label: "Resultados de exames prontos" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <Toggle checked={notifications[item.key]} onChange={(v) => { setNotifications({...notifications, [item.key]: v}); toast.success("Configuração salva."); }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2 border-b border-border pb-3">
                  <Settings className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold">Lembretes de Sistema</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "atualizacoesPendentes" as const, label: "Atualizações de prontuário pendentes" },
                    { key: "avisosEstoque" as const, label: "Avisos de estoque de suprimentos" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <Toggle checked={notifications[item.key]} onChange={(v) => { setNotifications({...notifications, [item.key]: v}); toast.success("Configuração salva."); }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2 border-b border-border pb-3">
                  <Mail className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold">Canais de Comunicação</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { key: "canalEmail" as const, label: "E-mail" },
                    { key: "canalPush" as const, label: "Push Notification (Navegador/App)" },
                    { key: "canalSMS" as const, label: "SMS (para urgências)" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors text-sm">
                      <input 
                        type="checkbox" 
                        checked={notifications[item.key]} 
                        onChange={(e) => { setNotifications({...notifications, [item.key]: e.target.checked}); toast.success("Configuração salva."); }} 
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer" 
                      />
                      <span className="text-muted-foreground">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "seguranca" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-border pb-3">
                  <Shield className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold">Alteração de Senha</h2>
                </div>
                <div className="space-y-3 max-w-sm">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Senha Atual</label>
                    <input type="password" className={inp} placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nova Senha</label>
                    <input type="password" className={inp} placeholder="Nova senha" />
                    <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden w-full">
                      <div className="h-full bg-warning w-2/3" /> {/* Indicador de força simple */}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Confirmar Nova Senha</label>
                    <input type="password" className={inp} placeholder="Confirme a senha" />
                  </div>
                  <button onClick={() => toast.success("Senha atualizada com sucesso.")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    Atualizar Senha
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold">Autenticação de Dois Fatores (2FA)</h2>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">Status: <span className="text-destructive font-bold">Desativado</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Adicione segurança extra à sua conta</p>
                  </div>
                  <button onClick={() => toast.info("Configuração de 2FA em desenvolvimento.")} className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                    Configurar via App ou SMS
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-border pb-3">
                  <Settings className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold">Sessões Ativas</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { device: "Chrome no Windows", city: "São Paulo, Brasil", active: true },
                    { device: "Safari no iPhone", city: "Rio de Janeiro, Brasil", active: false },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-muted/30 rounded-lg transition-colors">
                      <div>
                        <p className="font-medium text-gray-800">{s.device}</p>
                        <p className="text-xs text-muted-foreground">{s.city} {s.active && <span className="text-success font-bold">• Atual</span>}</p>
                      </div>
                      {!s.active && (
                        <button onClick={() => toast.success("Sessão encerrada.")} className="text-xs text-destructive hover:underline">Sair</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => toast.success("Todas as sessões foram encerradas.")} className="w-full py-2 bg-destructive/5 text-destructive border border-destructive/20 rounded-lg text-xs font-medium hover:bg-destructive/10 transition-colors">
                    Encerrar todas as outras sessões
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-card border-subtle p-6 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold">Privacidade e LGPD</h2>
                </div>
                <div className="flex flex-col gap-2 items-start text-xs">
                  <button onClick={() => toast.success("Logs exportados. Verifique seu e-mail.")} className="text-primary hover:underline font-medium">Exportar meus dados de log</button>
                  <button onClick={() => toast.info("Termos de Uso mostrados em nova aba.")} className="text-primary hover:underline font-medium">Termos de Uso e Política de Privacidade</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
