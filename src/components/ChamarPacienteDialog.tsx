import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Bell, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ChamarPacienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  patientId: string;
}

export default function ChamarPacienteDialog({ open, onOpenChange, patientName, patientId }: ChamarPacienteDialogProps) {
  const [room, setRoom] = useState("Consultório 1");
  const [professional, setProfessional] = useState("");

  const rooms = [
    "Consultório 1", "Consultório 2", "Consultório 3", 
    "Sala de Triagem", "Odontologia", "Sala 4", "Recepção"
  ];

  useEffect(() => {
    const session = localStorage.getItem("pulse-auth-session");
    if (session) {
      setProfessional(JSON.parse(session).name || "Profissional");
    }
  }, [open]);

  const handleCall = async () => {
    let supabaseSuccess = false;
    const session = localStorage.getItem("pulse-auth-session");
    const user = session ? JSON.parse(session) : null;
    const callerId = user?.id;

    // Função simples de validação de UUID
    const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    if (callerId && patientId && isValidUUID(callerId) && isValidUUID(patientId)) {
      try {
        const { error } = await supabase
          .from('patient_calls')
          .insert([{
            patient_id: patientId,
            called_by_id: callerId,
            room: room,
            called_at: new Date().toISOString()
          }]);

        if (!error) {
          supabaseSuccess = true;
          console.log("Chamada salva no Supabase com sucesso.");
        } else {
          console.error("Erro ao inserir chamada no Supabase:", error.message);
        }
      } catch (e) {
        console.error("Falha na requisição para o supabase:", e);
      }
    } else {
      console.warn("Chamada local: Dados de usuário ou paciente inválidos para Supabase.", { callerId, patientId });
    }

    // Fallback / Sincronização LocalStorage
    const saved = localStorage.getItem("pep-calls");
    const calls = saved ? JSON.parse(saved) : [];

    const newCall = {
      id: Math.random().toString(36).substr(2, 9),
      patient_id: patientId,
      patient_name: patientName,
      room: room,
      professional: professional,
      status: 'called',
      called_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    localStorage.setItem("pep-calls", JSON.stringify([...calls, newCall]));
    window.dispatchEvent(new Event('storage'));

    if (supabaseSuccess) {
      toast.success(`${patientName} chamado no painel!`);
    } else {
      toast.warning(`${patientName} chamado no painel (Modo Local)`);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-500" />
            Chamar Paciente no Painel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Paciente */}
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Paciente</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{patientName}</p>
            </div>
          </div>

          {/* Local */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Consultório / Sala
            </label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-primary/20"
            >
              {rooms.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Chamado Por */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chamado Por</label>
            <input
              type="text"
              value={professional}
              onChange={(e) => setProfessional(e.target.value)}
              placeholder="Nome do Profissional"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
              required
            />
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCall}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Chamar Agora
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
