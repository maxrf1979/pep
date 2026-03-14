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
import Prescricoes from "./pages/Prescricoes";
import Exames from "./pages/Exames";
import Relatorios from "./pages/Relatorios";
import Admin from "./pages/Admin";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import AlterarSenha from "./pages/AlterarSenha";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const sessionString = localStorage.getItem("pulse-auth-session");
  if (!sessionString) {
    return <Navigate to="/login" replace />;
  }
  const session = JSON.parse(sessionString);
  if (session.mustChangePassword) {
    return <Navigate to="/alterar-senha" replace />;
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
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pacientes" element={<ProtectedRoute><Pacientes /></ProtectedRoute>} />
          <Route path="/prontuarios" element={<ProtectedRoute><Prontuarios /></ProtectedRoute>} />
          <Route path="/prontuario/:id" element={<ProtectedRoute><Prontuario /></ProtectedRoute>} />
          <Route path="/sinais-vitais" element={<ProtectedRoute><SinaisVitais /></ProtectedRoute>} />
          <Route path="/prescricoes" element={<ProtectedRoute><Prescricoes /></ProtectedRoute>} />
          <Route path="/exames" element={<ProtectedRoute><Exames /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
