/**
 * RBAC (Role-Based Access Control) - Sistema de Permissões
 * Define permissões específicas para cada perfil de usuário
 */

export type UserRole = "medico" | "enfermeiro" | "admin" | "recepcao";

export interface Permission {
  readonly name: string;
  readonly description: string;
  readonly roles: UserRole[];
}

export interface RolePermissions {
  readonly [key: string]: Permission;
}

/**
 * Definição de todas as permissões do sistema
 * Cada permissão especifica quais roles têm acesso
 */
export const PERMISSIONS: RolePermissions = {
  // ========== EVOLUÇÃO MÉDICA ==========
  "evolucao_medica.criar": {
    name: "Criar Evolução Médica",
    description: "Permitir criação de evolução médica no prontuário",
    roles: ["medico", "admin"],
  },
  "evolucao_medica.editar": {
    name: "Editar Evolução Médica",
    description: "Permitir edição de evolução médica existente",
    roles: ["medico", "admin"],
  },
  "evolucao_medica.deletar": {
    name: "Deletar Evolução Médica",
    description: "Permitir deleção de evolução médica",
    roles: ["admin"],
  },
  "evolucao_medica.visualizar": {
    name: "Visualizar Evolução Médica",
    description: "Permitir visualização de evolução médica (apenas leitura)",
    roles: ["medico", "enfermeiro", "admin", "recepcao"],
  },
  "evolucao_medica.filtrar": {
    name: "Filtrar por Evolução Médica",
    description: "Permitir uso da aba de filtro para evolução médica",
    roles: ["medico", "admin"],
  },

  // ========== EVOLUÇÃO DE ENFERMAGEM ==========
  "evolucao_enfermagem.criar": {
    name: "Criar Evolução de Enfermagem",
    description: "Permitir criação de evolução de enfermagem no prontuário",
    roles: ["enfermeiro", "admin"],
  },
  "evolucao_enfermagem.editar": {
    name: "Editar Evolução de Enfermagem",
    description: "Permitir edição de evolução de enfermagem",
    roles: ["enfermeiro", "admin"],
  },
  "evolucao_enfermagem.deletar": {
    name: "Deletar Evolução de Enfermagem",
    description: "Permitir deleção de evolução de enfermagem",
    roles: ["admin"],
  },
  "evolucao_enfermagem.visualizar": {
    name: "Visualizar Evolução de Enfermagem",
    description: "Permitir visualização de evolução de enfermagem",
    roles: ["medico", "enfermeiro", "admin", "recepcao"],
  },
  "evolucao_enfermagem.filtrar": {
    name: "Filtrar por Evolução de Enfermagem",
    description: "Permitir uso da aba de filtro para evolução de enfermagem",
    roles: ["enfermeiro", "admin"],
  },

  // ========== SINAIS VITAIS ==========
  "sinais_vitais.criar": {
    name: "Registrar Sinais Vitais",
    description: "Permitir registro de sinais vitais",
    roles: ["enfermeiro", "medico", "admin"],
  },
  "sinais_vitais.editar": {
    name: "Editar Sinais Vitais",
    description: "Permitir edição de sinais vitais",
    roles: ["enfermeiro", "admin"],
  },
  "sinais_vitais.visualizar": {
    name: "Visualizar Sinais Vitais",
    description: "Permitir visualização de sinais vitais",
    roles: ["medico", "enfermeiro", "admin", "recepcao"],
  },

  // ========== PRESCRIÇÕES ==========
  "prescricao.criar": {
    name: "Prescrever Medicamentos",
    description: "Permitir criação de prescrições",
    roles: ["medico", "admin"],
  },
  "prescricao.editar": {
    name: "Editar Prescrição",
    description: "Permitir edição de prescrições",
    roles: ["medico", "admin"],
  },
  "prescricao.visualizar": {
    name: "Visualizar Prescrição",
    description: "Permitir visualização de prescrições",
    roles: ["medico", "enfermeiro", "admin", "recepcao"],
  },

  // ========== EXAMES ==========
  "exame.solicitar": {
    name: "Solicitar Exame",
    description: "Permitir solicitação de exames",
    roles: ["medico", "admin"],
  },
  "exame.visualizar": {
    name: "Visualizar Exame",
    description: "Permitir visualização de exames",
    roles: ["medico", "enfermeiro", "admin", "recepcao"],
  },

  // ========== ADMINISTRAÇÃO ==========
  "admin.usuarios": {
    name: "Gerenciar Usuários",
    description: "Permitir gerenciamento de usuários do sistema",
    roles: ["admin"],
  },
  "admin.configuracoes": {
    name: "Acessar Configurações",
    description: "Permitir acesso às configurações do sistema",
    roles: ["admin"],
  },
  "admin.relatorios": {
    name: "Acessar Relatórios",
    description: "Permitir acesso a relatórios e auditoria",
    roles: ["admin"],
  },
};

/**
 * Mapeia cada role a um objeto com suas permissões
 */
export const ROLE_PERMISSIONS: Record<UserRole, Set<string>> = {
  medico: new Set(
    Object.entries(PERMISSIONS)
      .filter(([_, perm]) => perm.roles.includes("medico"))
      .map(([key]) => key)
  ),
  enfermeiro: new Set(
    Object.entries(PERMISSIONS)
      .filter(([_, perm]) => perm.roles.includes("enfermeiro"))
      .map(([key]) => key)
  ),
  admin: new Set(
    Object.entries(PERMISSIONS)
      .filter(([_, perm]) => perm.roles.includes("admin"))
      .map(([key]) => key)
  ),
  recepcao: new Set(
    Object.entries(PERMISSIONS)
      .filter(([_, perm]) => perm.roles.includes("recepcao"))
      .map(([key]) => key)
  ),
};

/**
 * Utilitário para verificar se uma role tem uma permissão específica
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Utilitário para verificar se um array de roles tem uma permissão específica
 */
export function hasPermissionByRoles(roles: UserRole[], permission: string): boolean {
  return roles.some(role => hasPermission(role, permission));
}

/**
 * Utilitário para obter todas as permissões de uma role
 */
export function getRolePermissions(role: UserRole): string[] {
  return Array.from(ROLE_PERMISSIONS[role] || new Set());
}

/**
 * Utilitário para obter labels de permissão
 */
export function getPermissionLabel(permission: string): string {
  return PERMISSIONS[permission]?.name ?? permission;
}

/**
 * Utilitário para obter descrição de permissão
 */
export function getPermissionDescription(permission: string): string {
  return PERMISSIONS[permission]?.description ?? "";
}

/**
 * Configuração visual e descrição de cada role
 */
export const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    description: string;
    icon: string;
    color: string;
    permissions: string[];
  }
> = {
  medico: {
    label: "Médico(a)",
    description:
      "Pode criar evoluções médicas, prescrições e solicitar exames",
    icon: "🏥",
    color: "text-primary",
    permissions: [
      "evolucao_medica.criar",
      "evolucao_medica.editar",
      "evolucao_medica.visualizar",
      "evolucao_medica.filtrar",
      "sinais_vitais.visualizar",
      "prescricao.criar",
      "prescricao.editar",
      "prescricao.visualizar",
      "exame.solicitar",
      "exame.visualizar",
      "evolucao_enfermagem.visualizar",
    ],
  },
  enfermeiro: {
    label: "Enfermeiro(a)",
    description:
      "Pode criar evoluções de enfermagem, registrar sinais vitais (sem acesso a evolução médica)",
    icon: "🩺",
    color: "text-success",
    permissions: [
      "evolucao_enfermagem.criar",
      "evolucao_enfermagem.editar",
      "evolucao_enfermagem.visualizar",
      "evolucao_enfermagem.filtrar",
      "sinais_vitais.criar",
      "sinais_vitais.editar",
      "sinais_vitais.visualizar",
      "exame.visualizar",
      "evolucao_medica.visualizar",
      "prescricao.visualizar",
    ],
  },
  admin: {
    label: "Administrador",
    description: "Acesso completo a todas as funcionalidades do sistema",
    icon: "⚙️",
    color: "text-destructive",
    permissions: Object.keys(PERMISSIONS),
  },
  recepcao: {
    label: "Recepção",
    description: "Acesso apenas a visualização de informações do paciente",
    icon: "📞",
    color: "text-warning",
    permissions: [
      "sinais_vitais.visualizar",
      "prescricao.visualizar",
      "exame.visualizar",
      "evolucao_medica.visualizar",
      "evolucao_enfermagem.visualizar",
    ],
  },
};
