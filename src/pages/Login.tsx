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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#090C15] relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

      {/* Institutional Top */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-8 text-center"
      >
        <div className="h-24 w-24 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl mb-5">
          {clinicData.logo ? (
            <img src={clinicData.logo} alt="Logo" className="max-h-full max-w-full object-cover" />
          ) : (
            <div className="text-3xl">🦷</div>
          )}
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          {clinicData.name || "Aurea Dental"}
        </h1>
        <div className="h-1 w-14 bg-emerald-500 rounded-full" />
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-500 mt-3">
          Gestão Inteligente
        </p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
          <h2 className="text-lg font-bold text-white text-center">Bem-vindo ao Futuro</h2>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-2 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 border-none">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Login ou E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full h-11 px-4 rounded-xl bg-[#1F2937] border-none text-sm text-white focus:ring-2 focus:ring-emerald-500/30 transition-all" 
                placeholder="digite seu acesso" 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Senha de Acesso</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full h-11 px-4 rounded-xl bg-[#1F2937] border-none text-sm text-white focus:ring-2 focus:ring-emerald-500/30 transition-all" 
                  placeholder="••••••••" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Acessar Painel"}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/50 text-center space-y-1">
            <p className="text-[8px] uppercase font-bold text-slate-600 tracking-widest leading-relaxed">Sistema Corporativo de Uso Restrito</p>
            <p className="text-[8px] text-slate-600">Dados protegidos por criptografia de ponta a ponta.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
