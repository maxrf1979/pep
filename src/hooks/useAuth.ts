/**
 * Hook para gerenciar autenticação e informações do usuário logado
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type UserRole } from "@/lib/rbac-permissions";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  crm?: string;
  coren?: string;
  lastLogin?: string;
  mustChangePassword?: boolean;
}

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há sessão ativa no localStorage
    const sessionData = localStorage.getItem("pulse-auth-session");

    if (sessionData) {
      try {
        const parsedUser = JSON.parse(sessionData) as AuthUser;

        // Validar que o usuário tem os campos obrigatórios
        if (parsedUser.name && parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // Sessão inválida
          localStorage.removeItem("pulse-auth-session");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erro ao parsear sessão:", error);
        localStorage.removeItem("pulse-auth-session");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("pulse-auth-session");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    localStorage.setItem("pulse-auth-session", JSON.stringify(updatedUser));
  };

  const getRoleLabel = () => {
    const roleLabels: Record<UserRole, string> = {
      medico: "Médico(a)",
      enfermeiro: "Enfermeiro(a)",
      admin: "Administrador",
      recepcao: "Recepção",
    };
    return roleLabels[user?.role ?? "recepcao"];
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    updateUser,
    getRoleLabel,
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => roles.includes(user?.role as UserRole),
  };
}
