import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Stethoscope,
  Pill,
  FlaskConical,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pacientes", url: "/pacientes", icon: Users },
  { title: "Prontuários", url: "/prontuarios", icon: FileText },
];

const clinicalNav = [
  { title: "Sinais Vitais", url: "/sinais-vitais", icon: Activity },
  { title: "Evoluções",     url: "/evolucoes",     icon: Stethoscope },
  { title: "Prescrições",   url: "/prescricoes",   icon: Pill },
  { title: "Exames",        url: "/exames",         icon: FlaskConical },
];

const adminNav = [
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Administração", url: "/admin", icon: Shield },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const renderGroup = (
    label: string,
    items: typeof mainNav
  ) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-semibold px-3">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={collapsed ? item.title : undefined}
              >
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-foreground"
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Heart className="h-6 w-6 text-primary shrink-0" strokeWidth={2} fill="hsl(var(--primary))" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            Pulse PEP
          </span>
        )}
      </div>
      <SidebarContent className="py-2">
        {renderGroup("Principal", mainNav)}
        {renderGroup("Clínico", clinicalNav)}
        {renderGroup("Sistema", adminNav)}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full p-2 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
