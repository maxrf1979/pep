/**
 * Hook para verificar permissões do usuário
 */

import { useAuth } from "./useAuth";
import { hasPermission, type UserRole } from "@/lib/rbac-permissions";

export function usePermissions() {
  const { user } = useAuth();

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const can = (permission: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  /**
   * Verifica se o usuário tem TODAS as permissões listadas
   */
  const canAll = (permissions: string[]): boolean => {
    return permissions.every(permission => can(permission));
  };

  /**
   * Verifica se o usuário tem QUALQUER uma das permissões listadas
   */
  const canAny = (permissions: string[]): boolean => {
    return permissions.some(permission => can(permission));
  };

  /**
   * Verifica se o usuário é um médico
   */
  const isMedico = (): boolean => {
    return user?.role === "medico";
  };

  /**
   * Verifica se o usuário é um enfermeiro
   */
  const isEnfermeiro = (): boolean => {
    return user?.role === "enfermeiro";
  };

  /**
   * Verifica se o usuário é administrador
   */
  const isAdmin = (): boolean => {
    return user?.role === "admin";
  };

  /**
   * Verifica se o usuário é recepcionista
   */
  const isRecepcao = (): boolean => {
    return user?.role === "recepcao";
  };

  /**
   * Verifica se pode criar evolução médica
   */
  const canCreateMedicalEvolution = (): boolean => {
    return can("evolucao_medica.criar");
  };

  /**
   * Verifica se pode editar evolução médica
   */
  const canEditMedicalEvolution = (): boolean => {
    return can("evolucao_medica.editar");
  };

  /**
   * Verifica se pode deletar evolução médica
   */
  const canDeleteMedicalEvolution = (): boolean => {
    return can("evolucao_medica.deletar");
  };

  /**
   * Verifica se pode visualizar evolução médica (somente leitura)
   */
  const canViewMedicalEvolution = (): boolean => {
    return can("evolucao_medica.visualizar");
  };

  /**
   * Verifica se pode filtrar por evolução médica (ver aba)
   */
  const canFilterMedicalEvolution = (): boolean => {
    return can("evolucao_medica.filtrar");
  };

  /**
   * Verifica se pode criar evolução de enfermagem
   */
  const canCreateNursingEvolution = (): boolean => {
    return can("evolucao_enfermagem.criar");
  };

  /**
   * Verifica se pode editar evolução de enfermagem
   */
  const canEditNursingEvolution = (): boolean => {
    return can("evolucao_enfermagem.editar");
  };

  /**
   * Verifica se pode deletar evolução de enfermagem
   */
  const canDeleteNursingEvolution = (): boolean => {
    return can("evolucao_enfermagem.deletar");
  };

  /**
   * Verifica se pode visualizar evolução de enfermagem
   */
  const canViewNursingEvolution = (): boolean => {
    return can("evolucao_enfermagem.visualizar");
  };

  /**
   * Verifica se pode filtrar por evolução de enfermagem (ver aba)
   */
  const canFilterNursingEvolution = (): boolean => {
    return can("evolucao_enfermagem.filtrar");
  };

  /**
   * Verifica se pode registrar sinais vitais
   */
  const canCreateVitals = (): boolean => {
    return can("sinais_vitais.criar");
  };

  /**
   * Verifica se pode editar sinais vitais
   */
  const canEditVitals = (): boolean => {
    return can("sinais_vitais.editar");
  };

  /**
   * Verifica se pode visualizar sinais vitais
   */
  const canViewVitals = (): boolean => {
    return can("sinais_vitais.visualizar");
  };

  /**
   * Verifica se pode criar prescrições
   */
  const canCreatePrescription = (): boolean => {
    return can("prescricao.criar");
  };

  /**
   * Verifica se pode editar prescrições
   */
  const canEditPrescription = (): boolean => {
    return can("prescricao.editar");
  };

  /**
   * Verifica se pode visualizar prescrições
   */
  const canViewPrescription = (): boolean => {
    return can("prescricao.visualizar");
  };

  /**
   * Verifica se pode solicitar exames
   */
  const canRequestExam = (): boolean => {
    return can("exame.solicitar");
  };

  /**
   * Verifica se pode visualizar exames
   */
  const canViewExam = (): boolean => {
    return can("exame.visualizar");
  };

  /**
   * Verifica se pode gerenciar usuários
   */
  const canManageUsers = (): boolean => {
    return can("admin.usuarios");
  };

  /**
   * Verifica se pode acessar configurações
   */
  const canAccessSettings = (): boolean => {
    return can("admin.configuracoes");
  };

  /**
   * Verifica se pode acessar relatórios
   */
  const canAccessReports = (): boolean => {
    return can("admin.relatorios");
  };

  return {
    // Genéricos
    can,
    canAll,
    canAny,

    // Role checks
    isMedico,
    isEnfermeiro,
    isAdmin,
    isRecepcao,

    // Evolução Médica
    canCreateMedicalEvolution,
    canEditMedicalEvolution,
    canDeleteMedicalEvolution,
    canViewMedicalEvolution,
    canFilterMedicalEvolution,

    // Evolução de Enfermagem
    canCreateNursingEvolution,
    canEditNursingEvolution,
    canDeleteNursingEvolution,
    canViewNursingEvolution,
    canFilterNursingEvolution,

    // Sinais Vitais
    canCreateVitals,
    canEditVitals,
    canViewVitals,

    // Prescrições
    canCreatePrescription,
    canEditPrescription,
    canViewPrescription,

    // Exames
    canRequestExam,
    canViewExam,

    // Admin
    canManageUsers,
    canAccessSettings,
    canAccessReports,
  };
}
