import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Evolucoes() {
  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1 rounded-full w-fit border border-primary/10">
          <FileText className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Módulo de Evoluções</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Evoluções</h1>
        <p className="text-sm text-muted-foreground">Página em desenvolvimento. Em breve você poderá gerenciar as evoluções dos pacientes aqui.</p>
      </div>
    </div>
  );
}
