import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, CheckCircle2, AlertCircle, Loader2, HeartPulse } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const clinicData = (() => {
    const saved = localStorage.getItem("clinicSettings");
    return saved ? JSON.parse(saved) : { name: "Aurea Dental", logo: null };
  })();

  // Simulation of authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (attempts >= 5) {
      setError("Limite de tentativas excedido. Tente novamente mais tarde.");
      toast.error("Limite de segurança atingido.");
      return;
    }

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Hardcoded credentials for simulation
    const savedUsers = localStorage.getItem("systemUsers");
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Suporte para administrador master 
    if (email === "admin@admin.com" && password === "admin123") {
      const userData = {
        name: "Dr. Administrador",
        role: "Administrador",
        email: email,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem("pulse-auth-session", JSON.stringify(userData));
      toast.success("Bem-vindo ao Pulse PEP!");
      navigate("/");
      setIsLoading(false);
      return;
    }

    const foundUser = users.find((u: any) => u.email === email || u.login === email);

    if (foundUser && (foundUser.password === password || (!foundUser.password && password === "admin123"))) {
      if (foundUser.status === "inativo") {
        setError("Usuário inativo. Entre em contato com o suporte.");
        toast.error("Acesso bloqueado.");
        setIsLoading(false);
        return;
      }

      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        role: foundUser.roles[0],
        email: foundUser.email,
        mustChangePassword: foundUser.mustChangePassword,
        lastLogin: new Date().toISOString()
      };
      
      localStorage.setItem("pulse-auth-session", JSON.stringify(userData));
      toast.success("Bem-vindo ao Pulse PEP!");
      navigate("/");
    } else {
      setAttempts(prev => prev + 1);
      setError("Usuário ou senha inválidos");
      toast.error("Falha na autenticação");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left Side: Institutional */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden flex-col justify-between p-12"
      >
        {/* Background Animation/Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/login-bg.png" 
            alt="Medical background" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary to-primary/90" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl overflow-hidden">
              {clinicData.logo ? (
                <img src={clinicData.logo} alt="Logo" className="max-h-full max-w-full object-contain p-1.5" />
              ) : (
                <HeartPulse className="h-7 w-7 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{clinicData.name || "Pulse PEP"}</h1>
              <p className="text-white/70 text-sm font-medium">Prontuário Eletrônico do Paciente</p>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1]"
            >
              Tecnologia de ponta para sua <span className="text-emerald-400">gestão clínica</span>.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/80 leading-relaxed"
            >
              Sistema seguro para gestão clínica e prontuário eletrônico. Desenvolvido para médicos, enfermeiros e gestores hospitalares.
            </motion.p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
              <div className="h-10 w-10 rounded-full border-2 border-primary bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                +2k
              </div>
            </div>
            <div className="text-sm text-white/60">
              <span className="block font-semibold text-white">Usuários ativos</span>
              Em todo o Brasil
            </div>
          </div>
          <p className="text-white/40 text-xs">© 2026 Sistema Pulse PEP • Todos os direitos reservados</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[20%] right-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative">
        {/* Mobile Logo Only */}
        <div className="absolute top-8 left-8 flex items-center gap-2 md:hidden">
          {clinicData.logo ? (
            <img src={clinicData.logo} alt="Logo" className="h-6 w-6 object-contain" />
          ) : (
            <HeartPulse className="h-6 w-6 text-primary" />
          )}
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">{clinicData.name || "Pulse PEP"}</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] pt-10"
        >
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl relative group">
            {/* Logo Overlapping Box */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 bg-primary rounded-xl flex items-center justify-center shadow-lg border-4 border-slate-50 dark:border-slate-950 overflow-hidden">
              {clinicData.logo ? (
                <img src={clinicData.logo} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
              ) : (
                <HeartPulse className="h-10 w-10 text-white" />
              )}
            </div>

            <div className="mb-8 text-center pt-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acesse sua conta</h3>
              <p className="text-slate-400 text-sm">Entre com suas credenciais para gerenciar o Pulse PEP.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-3"
                  >
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-destructive leading-normal">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">E-mail ou Usuário</label>
                <div className="relative group/field">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@clinica.com"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Senha</label>
                  <button type="button" className="text-xs font-medium text-primary hover:underline">Esqueci minha senha</button>
                </div>
                <div className="relative group/field">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-primary transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <button 
                  type="button" 
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${rememberMe ? "base-primary border-primary bg-primary text-white" : "border-slate-300 dark:border-slate-700 bg-transparent"}`}
                >
                  {rememberMe && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />}
                </button>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>
                  Lembrar meu acesso
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Entrar no Sistema
                    <motion.span 
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
              <div className="flex gap-4 items-center">
                <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Segurança Pulse</span>
                <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="flex gap-6">
                <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" className="h-4 w-4 grayscale" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="h-4 w-4 grayscale dark:invert" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 underline underline-offset-4 cursor-pointer hover:text-primary transition-colors">Precisa de ajuda com seu acesso?</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
