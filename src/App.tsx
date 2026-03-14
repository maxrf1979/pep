import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/prontuarios" element={<Prontuarios />} />
            <Route path="/prontuario/:id" element={<Prontuario />} />
            <Route path="/sinais-vitais" element={<SinaisVitais />} />
            <Route path="/prescricoes" element={<Prescricoes />} />
            <Route path="/exames" element={<Exames />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
