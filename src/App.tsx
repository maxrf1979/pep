import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Prontuario from "./pages/Prontuario";
import Prontuarios from "./pages/Prontuarios";
import SinaisVitais from "./pages/SinaisVitais";
import Evolucoes from "./pages/Evolucoes";
import Prescricoes from "./pages/Prescricoes";
import Exames from "./pages/Exames";
import Relatorios from "./pages/Relatorios";
import Admin from "./pages/Admin";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import AlterarSenha from "./pages/AlterarSenha";
import PainelChamadaExibicao from "./pages/PainelChamadaExibicao";
import PainelChamadaAdmin from "./pages/PainelChamadaAdmin";
import NotFound from "./pages/NotFound";
import TestSupabase from "./pages/TestSupabase";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const sessionString = localStorage.getItem("pulse-auth-session");
  if (!sessionString) {
    return <Navigate to="/login" replace />;
  }
  const session = JSON.parse(sessionString);
  if (session.mustChangePassword) {
    return <Navigate to="/alterar-senha" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center space-y-3 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-card max-w-md">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Acesso Não Autorizado</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Este perfil de usuário ({session.role}) não possui permissão para acessar esta página.</p>
          <div className="pt-2">
            <a href="/" className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Voltar ao Início
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/alterar-senha" element={<AlterarSenha />} />
          <Route path="/painel" element={<PainelChamadaExibicao />} />
          <Route path="/test-supabase" element={<TestSupabase />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pacientes" element={<ProtectedRoute><Pacientes /></ProtectedRoute>} />
          <Route path="/prontuarios" element={<ProtectedRoute><Prontuarios /></ProtectedRoute>} />
          <Route path="/prontuario/:id" element={<ProtectedRoute><Prontuario /></ProtectedRoute>} />
          <Route path="/sinais-vitais" element={<ProtectedRoute><SinaisVitais /></ProtectedRoute>} />
          <Route path="/evolucoes" element={<ProtectedRoute><Evolucoes /></ProtectedRoute>} />
          <Route path="/prescricoes" element={<ProtectedRoute><Prescricoes /></ProtectedRoute>} />
          <Route path="/exames" element={<ProtectedRoute><Exames /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
          <Route path="/admin/painel" element={<ProtectedRoute allowedRoles={['admin', 'medico', 'enfermeiro', 'tecnico_enfermagem']}><PainelChamadaAdmin /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute allowedRoles={['admin']}><Configuracoes /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
