import { useState, useEffect } from "react";
import { Bell, CheckCircle2, XCircle, Clock, RotateCw, Monitor, User } from "lucide-react";
import { toast } from "sonner";

interface Call {
  id: string;
  patient_name: string;
  room: string;
  professional: string;
  status: 'waiting' | 'called' | 'attended' | 'canceled';
  called_at: string;
}

export default function PainelChamadaAdmin() {
  const [calls, setCalls] = useState<Call[]>([]);

  const loadCalls = () => {
    const saved = localStorage.getItem("pep-calls");
    if (saved) {
      const parsedCalls = JSON.parse(saved) as Call[];
      // Ordenar por data mais recente
      const sorted = parsedCalls.sort((a, b) => 
        new Date(b.called_at).getTime() - new Date(a.called_at).getTime()
      );
      setCalls(sorted);
    }
  };

  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 3000); // Polling local
    return () => clearInterval(interval);
  }, []);

  const updateCallStatus = (callId: string, newStatus: Call['status']) => {
    const updatedCalls = calls.map(c => {
      if (c.id === callId) {
        return { ...c, status: newStatus, called_at: newStatus === 'called' ? new Date().toISOString() : c.called_at };
      }
      return c;
    });

    localStorage.setItem("pep-calls", JSON.stringify(updatedCalls));
    setCalls(updatedCalls);
    toast.success(`Chamada atualizada para: ${newStatus === 'called' ? 'CHAMANDO' : newStatus.toUpperCase()}`);

    // Disparar evento para outras abas (Painel de Exibição)
    window.dispatchEvent(new Event('storage'));
  };

  const getStatusBadge = (status: Call['status']) => {
    switch (status) {
      case 'called':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-bold">CHAMANDO</span>;
      case 'attended':
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full font-bold">ATENDIDO</span>;
      case 'canceled':
        return <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-xs px-2.5 py-1 rounded-full font-bold">CANCELADO</span>;
      case 'waiting':
        return <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs px-2.5 py-1 rounded-full font-bold">EM ESPERA</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Fila de Chamadas</h1>
          <p className="text-slate-500 text-sm">Gerencie o painel público e acompanhe os pacientes do dia.</p>
        </div>
        
        <button 
          onClick={() => window.open("/painel", "_blank")}
          className="bg-primary text-primary-foreground font-bold text-sm px-4 h-10 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Monitor className="h-4 w-4" />
          Abrir Painel Público
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/50">
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Paciente</th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Local</th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Profissional</th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Horário</th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    {call.patient_name}
                  </div>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                  {call.room}
                </td>
                <td className="p-4 text-slate-500 text-sm">
                  {call.professional}
                </td>
                <td className="p-4 text-slate-500 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(call.called_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </td>
                <td className="p-4">
                  {getStatusBadge(call.status)}
                </td>
                <td className="p-4 text-right space-x-2">
                  {call.status === 'called' && (
                    <>
                      <button 
                        onClick={() => updateCallStatus(call.id, 'attended')}
                        className="p-2 h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors inline-flex items-center justify-center"
                        title="Atender"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => updateCallStatus(call.id, 'canceled')}
                        className="p-2 h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors inline-flex items-center justify-center"
                        title="Cancelar"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {['waiting', 'attended', 'canceled'].includes(call.status) && (
                    <button 
                      onClick={() => updateCallStatus(call.id, 'called')}
                      className="p-2 h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors inline-flex items-center justify-center"
                      title="Chamar Novamente"
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {calls.length === 0 && (
          <div className="text-center p-12 text-slate-500">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">Nenhuma chamada na fila</p>
            <p className="text-xs">Para chamar um paciente, utilize a listagem de Pacientes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
鼓
