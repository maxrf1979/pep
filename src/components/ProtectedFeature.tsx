/**
 * Componente para proteger funcionalidades baseadas em permissões
 * Renderiza conteúdo apenas se o usuário tem a permissão necessária
 */

import React from "react";
import { Lock, AlertCircle } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface ProtectedFeatureProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallbackMessage?: boolean;
}

/**
 * Componente que renderiza conteúdo apenas se o usuário tem permissão
 */
export function ProtectedFeature({
  permission,
  children,
  fallback,
  showFallbackMessage = true,
}: ProtectedFeatureProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallbackMessage) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/5 border border-destructive/20 text-sm text-destructive">
        <Lock className="h-4 w-4 shrink-0" />
        <span>Você não tem permissão para acessar este recurso.</span>
      </div>
    );
  }

  return <>{children}</>;
}

interface ProtectedContentProps {
  permissions: string[];
  mode?: "all" | "any"; // all = precisa de todas, any = precisa de qualquer uma
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallbackMessage?: boolean;
}

/**
 * Componente para proteger conteúdo com múltiplas permissões
 */
export function ProtectedContent({
  permissions,
  mode = "all",
  children,
  fallback,
  showFallbackMessage = true,
}: ProtectedContentProps) {
  const { can } = usePermissions();

  const hasAccess =
    mode === "all"
      ? permissions.every(p => can(p))
      : permissions.some(p => can(p));

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallbackMessage) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/5 border border-destructive/20 text-sm text-destructive">
        <Lock className="h-4 w-4 shrink-0" />
        <span>Você não tem permissão para acessar este recurso.</span>
      </div>
    );
  }

  return <>{children}</>;
}

interface UnauthorizedAlertProps {
  feature: string;
  requiredRole?: string;
}

/**
 * Componente para mostrar um alerta de acesso não autorizado
 */
export function UnauthorizedAlert({
  feature,
  requiredRole,
}: UnauthorizedAlertProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-destructive text-sm">
          Acesso não autorizado
        </h3>
        <p className="text-sm text-destructive/80 mt-1">
          Você não tem permissão para {feature}.
          {requiredRole && ` Apenas ${requiredRole} podem acessar este recurso.`}
        </p>
      </div>
    </div>
  );
}

interface FeatureAvailabilityProps {
  available: boolean;
  feature: string;
  children: React.ReactNode;
}

/**
 * Componente para mostrar disponibilidade de feature
 */
export function FeatureAvailability({
  available,
  feature,
  children,
}: FeatureAvailabilityProps) {
  if (!available) {
    return (
      <div className="opacity-50 pointer-events-none select-none" title={`${feature} não disponível para seu perfil`}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
