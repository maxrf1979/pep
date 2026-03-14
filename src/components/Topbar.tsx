import { Search, Bell, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { patients } from "@/lib/mock-data";

export function Topbar() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const filtered = query.length > 1
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.cpf.includes(query)
      )
    : [];

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
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
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <button className="flex items-center gap-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </button>
      </div>
    </header>
  );
}
