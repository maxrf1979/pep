import { useEffect, useState, useRef } from "react";
import { HeartPulse, Volume2, User, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const loadCalls = () => {
    const saved = localStorage.getItem("pep-calls");
    if (saved) {
      const parsedCalls = JSON.parse(saved) as Call[];
      // Ordenar por data de chamada decrescente
      const sorted = parsedCalls.sort((a, b) => 
        new Date(b.called_at).getTime() - new Date(a.called_at).getTime()
      );
      setCalls(sorted);

      // Verificar se há uma nova chamada para soar alerta e falar o nome
      const latestCalled = sorted.find(c => c.status === 'called');
      if (latestCalled && latestCalled.id !== lastCalledId) {
        setLastCalledId(latestCalled.id);
        triggerAlarm(latestCalled);
      }
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

    // Ouvir alterações no localStorage de outras abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pep-calls") {
        loadCalls();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Intervalo de segurança para pooling local
    const interval = setInterval(loadCalls, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
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

