import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle, HeartPulse, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AlterarSenha() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (newPassword.length < 8) {
      setError("A nova senha deve ter no mÃ­nimo 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas nÃ£o conferem.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("A nova senha deve ser diferente da atual.");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const sessionString = localStorage.getItem("pulse-auth-session");
    if (!sessionString) {
      toast.error("SessÃ£o expirada.");
      navigate("/login");
      return;
    }

    const session = JSON.parse(sessionString);
    const savedUsers = localStorage.getItem("systemUsers");
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    // Localizar na tabela de usuÃ¡rios
    const userIndex = users.findIndex((u: any) => u.email === session.email || u.login === session.login);

    if (userIndex !== -1) {
      const user = users[userIndex];
      const validCurrent = user.password || "admin123";

      if (currentPassword !== validCurrent) {
        setError("Senha atual incorreta.");
        setIsLoading(false);
        return;
      }

      // Atualizar no 'banco' (localStorage)
      users[userIndex] = {
        ...user,
        password: newPassword,
        mustChangePassword: false
      };
      localStorage.setItem("systemUsers", JSON.stringify(users));

      // Atualizar a sessÃ£o ativa
      const updatedSession = { ...session, mustChangePassword: false };
      localStorage.setItem("pulse-auth-session", JSON.stringify(updatedSession));

      toast.success("Senha atualizada com sucesso.");
      navigate("/");
    } else {
      // Caso sejam os usuÃ¡rios estÃ¡ticos de simulaÃ§Ã£o
      const staticEmails = ["admin@admin.com", "medico@medico.com", "enfermeiro@enfermeiro.com", "tecnico@tecnico.com"];
      if (staticEmails.includes(session.email)) {
         const updatedSession = { ...session, mustChangePassword: false };
         localStorage.setItem("pulse-auth-session", JSON.stringify(updatedSession));
         toast.success("Senha atualizada com sucesso.");
         navigate("/");
         return;
      }
      toast.error("Erro ao atualizar senha. UsuÃ¡rio nÃ£o encontrado.");
      setError("Falha interna ao sincronizar dados.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center gap-2 items-center mb-6">
          <HeartPulse className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Pulse PEP Clinic</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AlteraÃ§Ã£o de Senha ObrigatÃ³ria</h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Por seguranÃ§a, Ã© necessÃ¡rio alterar sua senha antes de continuar utilizando o sistema no seu primeiro acesso.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-2 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Senha Atual</label>
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nova Senha</label>
              <input 
                type={showPass ? "text" : "password"} 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
                placeholder="MÃ­nimo 8 caracteres" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirmar Nova Senha</label>
              <input 
                type={showPass ? "text" : "password"} 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
                placeholder="Confirme a senha" 
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? "Processando..." : "Atualizar e Entrar"}
              </button>
            </div>
          </form>

          <button onClick={() => { localStorage.removeItem("pulse-auth-session"); navigate("/login"); }} className="w-full text-center text-xs text-slate-400 hover:underline">
            Voltar para o Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}

