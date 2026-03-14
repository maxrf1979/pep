import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";

export default function PainelChamadaExibicao() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Painel de Chamada (Público)</h1>
      <p className="text-slate-400">Carregando painel...</p>
    </div>
  );
}
