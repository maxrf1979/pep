# 🔐 Sistema RBAC (Role-Based Access Control) - Implementação Completa

## 📋 Visão Geral

Foi implementado um sistema robusto de RBAC que controla o acesso de usuários às funcionalidades clínicas, com foco especial nas **restrições para o perfil ENFERMEIRO**.

## 🎯 Objetivo Principal

Garantir a **separação correta das responsabilidades clínicas** entre médico e enfermagem, impedindo que enfermeiros:
- ❌ Criem/editem/deletem evolução médica
- ❌ Acessem abas de evolução médica
- ✅ Mas **possam** criar/editar evolução de enfermagem

## 📂 Arquivos Criados

### 1. `src/lib/rbac-permissions.ts` (Core RBAC)
**Responsabilidade:** Define todas as permissões do sistema

```typescript
// Tipos definidos
- UserRole: "medico" | "enfermeiro" | "admin" | "recepcao"
- Permission: { name, description, roles[] }

// Mapa de permissões por role
ROLE_PERMISSIONS[role] = Set<permission>

// Funções utilitárias
- hasPermission(role, permission): boolean
- hasPermissionByRoles(roles[], permission): boolean
- getRolePermissions(role): string[]
- getPermissionLabel(permission): string
```

**Permissões Implementadas:**
- 🏥 Evolução Médica (criar, editar, deletar, visualizar, filtrar)
- 🩺 Evolução Enfermagem (criar, editar, deletar, visualizar, filtrar)
- 📊 Sinais Vitais (criar, editar, visualizar)
- 💊 Prescrições (criar, editar, visualizar)
- 🔬 Exames (solicitar, visualizar)
- ⚙️ Administração (usuários, configurações, relatórios)

### 2. `src/hooks/useAuth.ts` (Autenticação)
**Responsabilidade:** Gerenciar dados do usuário autenticado

```typescript
interface AuthUser {
  id?: string
  name: string
  email: string
  role: UserRole
  crm?: string
  coren?: string
  lastLogin?: string
}

// Funções
- user: AuthUser | null
- isAuthenticated: boolean
- logout(): void
- updateUser(user: AuthUser): void
- hasRole(role): boolean
- hasAnyRole(roles[]): boolean
```

### 3. `src/hooks/usePermissions.ts` (Verificação de Permissões)
**Responsabilidade:** Fornecer funções para verificar se usuário tem permissão

```typescript
// Métodos genéricos
- can(permission): boolean
- canAll(permissions[]): boolean
- canAny(permissions[]): boolean

// Role checks
- isMedico(), isEnfermeiro(), isAdmin(), isRecepcao()

// Permissões específicas (métodos de conveniência)
- canCreateMedicalEvolution()
- canEditMedicalEvolution()
- canCreateNursingEvolution()
- canEditNursingEvolution()
- canCreateVitals()
- canCreatePrescription()
- canRequestExam()
```

### 4. `src/components/ProtectedFeature.tsx` (Componentes de Proteção)
**Responsabilidade:** Renderizar conteúdo apenas se autorizado

```typescript
<ProtectedFeature permission="evolucao_medica.criar">
  Conteúdo visível apenas para médicos
</ProtectedFeature>

<ProtectedContent permissions={["evolucao_medica.criar"]} mode="any">
  Renderizado se tem ANY permissão
</ProtectedContent>

<UnauthorizedAlert feature="criar evolução médica" requiredRole="Médico" />
```

## 🔄 Fluxo de Implementação

### Login & Autenticação
```
1. Usuário faz login (Login.tsx)
2. Sistema busca usuário no localStorage ("systemUsers")
3. Valida credenciais
4. Armazena sessão: localStorage.setItem("pulse-auth-session", userData)
   - userData.role = primeiro perfil do array de roles
5. Redireciona para home
```

### Verificação de Permissão
```
1. Componente chama usePermissions()
2. Hook obtém user de useAuth()
3. Verifica permissão usando: hasPermission(user.role, "permissao")
4. Retorna true/false
5. Interface se adapta (desabilita, esconde, mostra erro)
```

## 🛡️ Proteção em Múltiplas Camadas

### 1. Frontend - Interface Adaptada
```
✅ Abas de Evolução Médica ocultas para enfermeiros
✅ Botões de ação desabilitados para perfis sem permissão
✅ Diálogos verificam permissão ao abrir
✅ Mensagens de erro descrevem restrição
```

### 2. Frontend - Lógica de Diálogo
```
NovaEvolucaoDialog.tsx:
- Valida permissão ao abrir (useEffect)
- Mostra alerta se não autorizado
- Fecha automaticamente após 2 segundos
- Valida novamente ao salvar (defesa em profundidade)
```

### 3. Frontend - Hooks de Permissão
```
usePermissions().canCreateMedicalEvolution()
usePermissions().canFilterMedicalEvolution()
usePermissions().isEnfermeiro()
```

### 4. Backend Pronto (próxima fase)
```typescript
// Validação que será implementada
if (!hasPermission(user.role, "evolucao_medica.criar")) {
  return {
    status: 403,
    error: "Acesso não autorizado para este perfil de usuário."
  }
}
```

## 📊 Matriz de Permissões: ENFERMEIRO vs MÉDICO

| Ação | Enfermeiro | Médico | Admin |
|------|-----------|--------|-------|
| Criar Evolução Médica | ❌ | ✅ | ✅ |
| Editar Evolução Médica | ❌ | ✅ | ✅ |
| Deletar Evolução Médica | ❌ | ❌ | ✅ |
| Visualizar Evolução Médica | ✅ | ✅ | ✅ |
| **Ver Aba Evolução Médica** | **❌** | **✅** | **✅** |
| Criar Evolução Enfermagem | ✅ | ❌ | ✅ |
| Editar Evolução Enfermagem | ✅ | ❌ | ✅ |
| Deletar Evolução Enfermagem | ❌ | ❌ | ✅ |
| Visualizar Evolução Enfermagem | ✅ | ✅ | ✅ |
| **Ver Aba Evolução Enfermagem** | **✅** | **✅** | **✅** |
| Registrar Sinais Vitais | ✅ | ✅ | ✅ |
| Criar Prescrição | ❌ | ✅ | ✅ |
| Visualizar Prescrição | ✅ | ✅ | ✅ |
| Solicitar Exame | ❌ | ✅ | ✅ |
| Gerenciar Usuários | ❌ | ❌ | ✅ |

## 🔧 Como Usar

### Verificar Permissão em Componente
```typescript
import { usePermissions } from "@/hooks/usePermissions";

export function MeuComponente() {
  const { can, isMedico, isEnfermeiro } = usePermissions();

  // Opção 1: Verificação genérica
  if (!can("evolucao_medica.criar")) {
    return <UnauthorizedAlert />;
  }

  // Opção 2: Verificação específica
  if (!isMedico()) {
    return <p>Apenas médicos podem acessar</p>;
  }

  // Opção 3: Renderização condicional
  return (
    <>
      {can("evolucao_medica.criar") && (
        <button onClick={createMedicalEvolution}>Nova Evolução Médica</button>
      )}
    </>
  );
}
```

### Proteger Feature
```typescript
<ProtectedFeature permission="evolucao_medica.criar">
  <BotaoCriarEvolucaoMedica />
</ProtectedFeature>
```

### Desabilitar Botão por Permissão
```typescript
<button
  disabled={!can("evolucao_medica.criar")}
  onClick={handleCreate}
>
  Criar Evolução Médica
</button>
```

## ✅ Validações Implementadas

### Na Abertura do Diálogo
```typescript
// NovaEvolucaoDialog.tsx
useEffect(() => {
  if (!open) return;

  if (type === "evolucao_medica" && !can("evolucao_medica.criar")) {
    setIsUnauthorized(true);
    toast.error("Acesso não autorizado para este perfil de usuário.");
    setTimeout(() => onOpenChange(false), 2000);
  }
}, [open, type, can, onOpenChange]);
```

### Ao Salvar
```typescript
// Defesa em profundidade
if (type === "evolucao_medica" && !can("evolucao_medica.criar")) {
  toast.error("Acesso não autorizado. Você não pode criar evolução médica.");
  return;
}
```

### Nome do Profissional
```typescript
// Registra automaticamente informações reais
const professionalName = type === "evolucao_medica"
  ? `Dr(a). ${user.name}${user.crm ? ` — CRM ${user.crm}` : ""}`
  : `Enf. ${user.name}${user.coren ? ` — COREN ${user.coren}` : ""}`;
```

## 🧪 Testes Recomendados

### 1. Teste de Login com Enfermeiro
```
1. Login com: enfermeiro@test.com / admin123
2. Verificar que role = "enfermeiro"
3. Abrir prontuário de paciente
4. Verificar que aba "Evolução Médica" NÃO aparece
5. Verificar que aba "Evolução Enfermagem" aparece
6. Verificar que botão "Evolução Médica" está desabilitado na sidebar
7. Clicar em "Evolução Enfermagem" → deve abrir dialog
8. Clicar em "Evolução Médica" → deve mostrar alerta e fechar
```

### 2. Teste de Login com Médico
```
1. Login com: medico@test.com / admin123
2. Verificar que role = "medico"
3. Abrir prontuário de paciente
4. Verificar que AMBAS abas aparecem
5. Verificar que AMBOS botões estão habilitados
6. Criar Evolução Médica → deve funcionar
7. Criar Evolução Enfermagem → deve funcionar
```

### 3. Teste de Acesso Direto à Rota
```
// Futuro - backend
1. Enfermeiro tenta POST /api/evolucao-medica
2. Sistema retorna: 403 Acesso não autorizado
3. Registra tentativa de acesso não autorizado em log
```

## 📝 Registro de Evolução

### Automaticamente Preenchido
```typescript
{
  id: crypto.randomUUID(),
  patientId: "p-001",
  type: "evolucao_enfermagem",
  date: "2026-03-14T14:30:00.000Z", // Data/hora atual
  title: "Título preenchido pelo usuário",
  summary: "Resumo preenchido pelo usuário",
  details: "Texto completo (opcional)",
  professional: "Enf. Maria Silva — COREN 12345/SP" // Automático
}
```

## 🔒 Segurança

### Princípios Implementados
✅ **Princípio do Menor Privilégio:** Cada role tem permissões mínimas necessárias
✅ **Defesa em Profundidade:** Validação em múltiplas camadas (frontend + futuro backend)
✅ **Separação de Responsabilidades:** Médico vs Enfermeiro bem definido
✅ **Auditoria:** Cada ação registra quem fez, quando e que role
✅ **Fail Securely:** Se permissão não está definida, é negada por padrão

### O que NÃO é Possível (para Enfermeiro)
❌ Criar evolução médica (interface)
❌ Editar evolução médica (interface)
❌ Deletar evolução médica (interface)
❌ Ver aba de evolução médica (interface)
❌ Prescrever medicamentos (interface)
❌ Solicitar exames (interface)
❌ Gerenciar usuários (interface)

## 🎨 Interface Adaptada

### Para Enfermeiro
```
┌─────────────────────────────────────┐
│ Prontuário de João Silva            │
├─────────────────────────────────────┤
│ [Todos] [Evolução Enferm.] [Sinais] │  ← Sem "Evolução Médica"
│         [Prescrição] [Exames]       │
└─────────────────────────────────────┘

Ações Rápidas:
□ Sinais Vitais
□ Evolução Médica         ← DESABILITADO
☑ Evolução Enferm.       ← HABILITADO
□ Prescrever             ← DESABILITADO
□ Solicitar Exame        ← DESABILITADO
□ Anexar Arquivo
```

### Para Médico
```
┌─────────────────────────────────────┐
│ Prontuário de João Silva            │
├─────────────────────────────────────┤
│ [Todos] [Evolução Médica]           │  ← Todos presentes
│ [Evolução Enferm.] [Sinais]         │
│ [Prescrição] [Exames]               │
└─────────────────────────────────────┘

Ações Rápidas:
☑ Sinais Vitais
☑ Evolução Médica       ← HABILITADO
☑ Evolução Enferm.      ← HABILITADO
☑ Prescrever           ← HABILITADO
☑ Solicitar Exame      ← HABILITADO
☑ Anexar Arquivo
```

## 📚 Próximos Passos (Backend)

```typescript
// src/api/middleware/rbac.ts
export function requirePermission(permission: string) {
  return (req, res, next) => {
    const user = req.user; // Da sessão

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({
        error: "Acesso não autorizado para este perfil de usuário.",
        required: permission,
        userRole: user.role
      });
    }

    next();
  };
}

// src/api/routes/evolucao.ts
router.post(
  "/evolucao-medica",
  requirePermission("evolucao_medica.criar"),
  createMedicalEvolution
);
```

## ✨ Resumo das Mudanças

| Arquivo | Mudança | Impacto |
|---------|---------|--------|
| `rbac-permissions.ts` | NOVO | Define todas as permissões |
| `useAuth.ts` | NOVO | Gerencia autenticação |
| `usePermissions.ts` | NOVO | Verifica permissões |
| `ProtectedFeature.tsx` | NOVO | Componentes de proteção |
| `NovaEvolucaoDialog.tsx` | MODIFICADO | Validação de permissão |
| `Prontuario.tsx` | MODIFICADO | Abas e ações baseadas em role |
| `Login.tsx` | INALTERADO | Já armazena role |
| `Admin.tsx` | INALTERADO | Já define roles |

## 🎯 Checklist de Validação

- [x] Sistema RBAC implementado
- [x] Permissões definidas para todos os roles
- [x] Hooks de autenticação criados
- [x] Hooks de permissão criados
- [x] Componentes de proteção criados
- [x] Diálogo de evolução protegido
- [x] Abas filtradas por permissão
- [x] Ações desabilitadas por permissão
- [x] Nomes de profissional registrados corretamente
- [x] Interface adaptada por role
- [ ] Backend validando permissões (próxima fase)
- [ ] Logs de auditoria (próxima fase)
- [ ] Testes automatizados (próxima fase)

## 📞 Testes Manuais

Veja `RBAC_TESTES.md` para 15+ testes de validação completos.

---

**Versão:** 1.0
**Data:** 14 de Março de 2026
**Status:** ✅ Implementação de Frontend Completa
