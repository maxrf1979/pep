import { useEffect, useState, useRef } from "react";
import { HeartPulse, Volume2, User, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Call {
  id: string;
  patient_name: string;
  room: string;
  professional: string;
  status: 'waiting' | 'called' | 'attended' | 'canceled';
  called_at: string;
}

export default function PainelChamadaExibicao() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [lastCalledId, setLastCalledId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadCalls = async () => {
    let supabaseCalls: Call[] = [];
    try {
      const { data, error } = await supabase
        .from('patient_calls')
        .select(`
          id,
          room,
          called_at,
          patients (
            name
          )
        `)
        .order('called_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        supabaseCalls = data.map((c: any) => ({
          id: c.id,
          patient_name: c.patients?.name || "Desconhecido",
          room: c.room,
          professional: "Médico",
          status: 'called',
          called_at: c.called_at
        }));
      } else if (error) {
        console.error("Erro ao carregar chamadas do Supabase:", error.message);
      }
    } catch (e) {
      console.error("Falha ao conectar no Supabase para chamadas:", e);
    }

    const saved = localStorage.getItem("pep-calls");
    const localCalls = saved ? (JSON.parse(saved) as Call[]) : [];

    // Mesclar Supabase com LocalStorage (evitando duplicatas por timestamp)
    const merged = [...supabaseCalls];
    localCalls.forEach(lc => {
      if (!merged.find(mc => mc.called_at === lc.called_at || mc.id === lc.id)) {
        merged.push(lc);
      }
    });

    // Ordenar de forma decrescente
    const sorted = merged.sort((a, b) => 
      new Date(b.called_at).getTime() - new Date(a.called_at).getTime()
    );

    setCalls(sorted);

    // Alerta sonoro / Voz
    const latestCalled = sorted.find(c => c.status === 'called');
    if (latestCalled && latestCalled.id !== lastCalledId) {
      setLastCalledId(latestCalled.id);
      triggerAlarm(latestCalled);
    }
  };

  const triggerAlarm = (call: Call) => {
    // Reproduzir som de alerta (Beep)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    // Falar o nome do paciente usando SpeechSynthesis
    if ('speechSynthesis' in window) {
      setTimeout(() => {
        const textToSpeak = `Paciente, ${call.patient_name}, favor dirigir-se ao ${call.room}`;
        const speech = new SpeechSynthesisUtterance(textToSpeak);
        speech.lang = 'pt-BR';
        speech.rate = 0.9;
        window.speechSynthesis.speak(speech);
      }, 1000); // Aguardar 1 segundo após o beep
    }
  };

  useEffect(() => {
    loadCalls();

    // 1. Realtime com Supabase
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patient_calls' }, () => {
        loadCalls();
      })
      .subscribe();

    // 2. Ouvir alterações no localStorage de outras abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pep-calls") {
        loadCalls();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(loadCalls, 3000); // Polling com margem maior

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [lastCalledId]);

  const currentCall = calls.find(c => c.status === 'called');
  const previousCalls = calls.filter(c => c.status !== 'waiting' && c.id !== currentCall?.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-emerald-500">
      {/* Elemento de Íudio para o Beep */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* Main Panel: Chamada Atual */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 border-r border-slate-900/80 relative">
        <div className="absolute top-8 left-8 flex items-center gap-2 opacity-60">
          <HeartPulse className="h-6 w-6 text-emerald-500 animate-pulse" />
          <span className="font-bold tracking-tight text-xl">Pulse PEP Clinic</span>
        </div>

        <AnimatePresence mode="wait">
          {currentCall ? (
            <motion.div
              key={currentCall.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <span className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-sm bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/20">
                Chamada em Andamento
              </span>
              <h1 className="text-7xl lg:text-9xl font-black tracking-tight text-white mt-4 break-words px-4 leading-none">
                {currentCall.patient_name}
              </h1>
              
              <div className="h-px w-40 bg-slate-800 my-4" />

              <div className="flex flex-col items-center gap-2">
                <span className="text-slate-500 font-medium uppercase text-xs tracking-widest">Local de Atendimento</span>
                <span className="text-4xl lg:text-6xl font-extrabold text-blue-400">
                  {currentCall.room}
                </span>
                {currentCall.professional && (
                  <span className="text-slate-400 text-lg mt-1">
                    Dr(a). {currentCall.professional}
                  </span>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="text-slate-500 text-center">
              <Volume2 className="h-20 w-20 mx-auto mb-4 opacity-30 animate-pulse" />
              <p className="text-xl font-medium">Aguardando próximas chamadas...</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* History Panel: Últimas Chamadas */}
      <div className="w-full md:w-96 bg-slate-900/40 backdrop-blur-xl p-8 flex flex-col">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-800/50 pb-4">
          <Clock className="h-5 w-5 text-slate-400" />
          <h2 className="font-bold text-slate-300 text-lg">Chamadas Recuperadas</h2>
        </div>

        <div className="flex-1 space-y-4 overflow-hidden">
          <AnimatePresence>
            {previousCalls.map((call) => (
              <motion.div
                key={call.id}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="bg-slate-900/80 border border-slate-800/60 p-5 rounded-2xl flex flex-col space-y-2 relative shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-lg truncate max-w-[180px]">
                    {call.patient_name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(call.called_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-semibold text-emerald-400">
                    {call.room}
                  </span>
                  {call.status === 'attended' && (
                    <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full font-bold">Atendido</span>
                  )}
                  {call.status === 'canceled' && (
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">Cancelado</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {previousCalls.length === 0 && (
            <div className="text-center text-slate-600 mt-10 text-sm">
              Sem histórico recente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

