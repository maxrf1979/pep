import { Search, Bell, User, Settings, LogOut, FlaskConical, AlertTriangle, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { patients } from "@/lib/mock-data";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: typeof Bell;
  iconColor: string;
}

const mockNotifications: Notification[] = [
  {
    id: "n-1",
    title: "Resultado disponível",
    description: "Hemograma de João Carlos da Silva",
    time: "há 5 min",
    read: false,
    icon: FlaskConical,
    iconColor: "text-success",
  },
  {
    id: "n-2",
    title: "Alerta clínico",
    description: "SpO2 de Ana Beatriz abaixo de 94%",
    time: "há 18 min",
    read: false,
    icon: AlertTriangle,
    iconColor: "text-destructive",
  },
  {
    id: "n-3",
    title: "Resultado disponível",
    description: "Coagulograma de Ana Beatriz Lima",
    time: "há 1h",
    read: true,
    icon: FlaskConical,
    iconColor: "text-success",
  },
];

export function Topbar() {
  const { user, getRoleLabel } = useAuth();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const navigate = useNavigate();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const allPatients = (() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : patients;
  })();

  const filtered = query.length > 1
    ? (allPatients as any[]).filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.cpf.includes(query)
      )
    : [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌘K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search") as HTMLInputElement;
        input?.focus();
        input?.select();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismissNotif = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          id="global-search"
          type="text"
          placeholder="Buscar paciente (nome, CPF)... ⌘K"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="w-full h-9 pl-9 pr-3 rounded-md bg-muted/50 border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {showResults && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-overlay border border-border z-50 overflow-hidden">
            {filtered.map((p) => (
              <button
                key={p.id}
                onMouseDown={() => {
                  navigate(`/prontuario/${p.id}`);
                  setQuery("");
                  setShowResults(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">CPF: {p.cpf}</div>
                </div>
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
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifications((v) => !v); setShowProfile(false); }}
            className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-lg shadow-overlay border border-border z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold">Notificações</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma notificação.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                      >
                        <div className={`mt-0.5 shrink-0 ${n.iconColor}`}>
                          <Icon className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                            <button
                              onClick={() => dismissNotif(n.id)}
                              className="shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.description}</p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile((v) => !v); setShowNotifications(false); }}
            className="flex items-center gap-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-lg shadow-overlay border border-border z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">{user?.name || "Usuários"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "anonimo@med.br"}</p>
                <span className="badge-status bg-primary/10 text-primary mt-1 inline-block">{getRoleLabel()}</span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { 
                    navigate("/configuracoes"); 
                    setShowProfile(false);
                    toast.info("Acessando configurações...");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Settings className="h-4 w-4" strokeWidth={1.5} />
                  Configurações
                </button>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    toast.success("Sessão encerrada com sucesso.");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
