# Guia de Setup do Banco de Dados Supabase - PEP

## Visão Geral

Este documento descreve como configurar o banco de dados Supabase para o sistema PEP (Prontuário Eletrônico de Pacientes). O schema inclui todas as tabelas necessárias, índices, triggers, funções e políticas de segurança.

## Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **Clinics** (Clínicas/Instituições)
- Armazena informações das clinicas/hospitais
- Chave primária: `id` (UUID)

#### 2. **System Users** (Usuários/Profissionais)
- Médicos, enfermeiros, administradores, recepção
- Campos: `name`, `email`, `login`, `crm`, `coren`, `phone`, `specialty`
- Referencia: `clinic_id`

#### 3. **User Roles** (Papéis de Usuário)
- 5 papéis: médico, enfermeiro, admin, recepcao, tecnico_enfermagem
- Tabela de mapeamento: `user_role_assignments`

#### 4. **Patients** (Pacientes)
- Dados demográficos: nome, CPF, data de nascimento, sexo, tipo sanguíneo
- Status: internado, ambulatorial, alta, óbito
- Referencia: `clinic_id`

#### 5. **Vital Signs** (Sinais Vitais)
- Temperatura, frequência cardíaca, pressão arterial, saturação de oxigênio
- Peso, altura, IMC
- Referencia: `patient_id`, `recorded_by_id`

#### 6. **Medical Evolutions** (Evoluções Médicas)
- Sumário, detalhes, diagnóstico, plano de tratamento
- Referencia: `patient_id`, `doctor_id`

#### 7. **Nursing Evolutions** (Evoluções de Enfermagem)
- Sumário, detalhes, plano de cuidados, observações
- Referencia: `patient_id`, `nurse_id`

#### 8. **Prescriptions** (Prescrições)
- Status: ativa, encerrada, suspensa
- Relacionamento 1:N com `prescription_medications`
- Referencia: `patient_id`, `doctor_id`

#### 9. **Exams** (Exames)
- Tipos: laboratorial, imagem, funcional, outro
- Status: solicitado, coletado, resultado_disponivel, entregue
- Referencia: `patient_id`, `requested_by_id`

#### 10. **Timeline Events** (Eventos de Timeline)
- Visão unificada de todos os eventos clínicos
- Tipos: evolucao_medica, evolucao_enfermagem, sinais_vitais, prescricao, exame, anexo
- Referencia: `patient_id`, `professional_id`

#### 11. **Attachments** (Anexos)
- Armazena imagens, PDFs e documentos
- Campos: `file_data` (BYTEA), `file_type`, `file_size`
- Referencia: `patient_id`, `uploaded_by_id`

#### 12. **Audit Logs** (Logs de Auditoria)
- Rastreia todas as ações do sistema
- Campos: `action`, `table_name`, `record_id`, `changes` (JSONB)
- Referencia: `user_id`

#### 13. **Permissions** (Permissões)
- 25+ permissões definidas
- Estrutura: `resource` + `action` (e.g., "evolucao_medica:criar")
- Mapeamento: `role_permissions`

#### 14. **Sessions** (Sessões)
- Gerencia tokens de sessão
- Rastreia IP, user agent, atividade
- Referencia: `user_id`

## Instalação

### Passo 1: Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Aguarde a inicialização do banco de dados

### Passo 2: Executar o Schema

1. Vá para **SQL Editor** no painel Supabase
2. Clique em **New Query**
3. Cole o conteúdo de `schema.sql`
4. Clique em **Run** ou pressione `Ctrl+Enter`

Alternativa (via CLI):
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link seu projeto
supabase link --project-ref your-project-ref

# Executar migrations
supabase db push
```

### Passo 3: Configurar Autenticação

1. Vá para **Authentication** no painel Supabase
2. Habilite **Email/Password**
3. Configure provedores externos se necessário (Google, GitHub, etc.)

### Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Estrutura de Relacionamentos

```
┌─────────────────────────────────────────────────────────┐
│                      CLINICS                            │
│  (id, name, cnpj, phone, email, address, hours, colors)│
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴───────────────┐
        │                        │
        ▼                        ▼
┌──────────────┐          ┌─────────────────┐
│ SYSTEM_USERS │          │    PATIENTS     │
│  (id, name,  │          │  (id, name,     │
│   email,     │          │   cpf, birth,   │
│   crm, coren)│          │   blood_type)   │
└─────┬────────┘          └────────┬────────┘
      │                           │
      │ (user_id)                 │ (patient_id)
      │                           │
      ├─ vital_signs              │
      ├─ medical_evolutions       │
      ├─ nursing_evolutions       │
      ├─ prescriptions            │
      ├─ exams                    │
      ├─ patient_calls            │
      ├─ timeline_events          │
      └─ audit_logs               │
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
            ┌──────────────────┐         ┌──────────────────┐
            │ PRESCRIPTIONS    │         │     EXAMS        │
            │  (id, status,    │         │  (id, type,      │
            │   notes)         │         │   name, status)  │
            └────────┬─────────┘         └──────────────────┘
                     │
                     │ (prescription_id)
                     ▼
            ┌──────────────────────────┐
            │ PRESCRIPTION_MEDICATIONS │
            │ (id, name, dose, route,  │
            │  frequency, duration)    │
            └──────────────────────────┘
```

## Índices

O schema inclui 20+ índices para otimizar queries:

- `idx_patients_clinic_id` - Filtrar pacientes por clínica
- `idx_vital_signs_recorded_at` - Histórico de sinais vitais
- `idx_medical_evolutions_recorded_at` - Timeline médica
- `idx_prescriptions_status` - Prescrições ativas/inativas
- `idx_exams_status` - Exames por status
- `idx_audit_logs_created_at` - Auditoria

## Triggers

### `update_timestamp()`

Atualiza automaticamente a coluna `updated_at` quando um registro é modificado.

Aplicado a:
- clinics
- system_users
- patients
- vital_signs
- medical_evolutions
- nursing_evolutions
- prescriptions
- exams
- timeline_events

## Segurança (Row Level Security)

O schema inclui políticas RLS de exemplo:

1. **Pacientes**: Usuários veem apenas pacientes da mesma clínica
2. **Sessões**: Usuários veem apenas suas próprias sessões
3. **Auditoria**: Apenas admins veem logs de auditoria

## Views (Consultas Úteis)

### 1. `patient_summary`
Resumo do paciente com contagem de eventos

```sql
SELECT * FROM patient_summary WHERE id = 'patient-uuid';
```

### 2. `user_permissions`
Lista todas as permissões de cada usuário

```sql
SELECT * FROM user_permissions WHERE user_id = 'user-uuid';
```

### 3. `recent_activity`
Atividade recente unificada (últimas 1000 ações)

```sql
SELECT * FROM recent_activity ORDER BY activity_date DESC LIMIT 100;
```

## Roles e Permissões Pré-configuradas

### Médico (médico)
- ✅ Criar/editar/deletar/visualizar evolução médica
- ✅ Criar/editar/visualizar prescrições
- ✅ Solicitar/visualizar exames
- ✅ Visualizar evolução de enfermagem
- ✅ Registrar sinais vitais
- ✅ Acessar relatórios

### Enfermeiro (enfermeiro)
- ✅ Criar/editar/deletar/visualizar evolução de enfermagem
- ✅ Registrar sinais vitais
- ✅ Visualizar (apenas) evolução médica
- ✅ Visualizar prescrições
- ✅ Visualizar exames

### Administrador (admin)
- ✅ Acesso total a todas as funcionalidades
- ✅ Gerenciar usuários
- ✅ Acessar todos os logs de auditoria

### Recepção (recepcao)
- ✅ Criar/visualizar/editar pacientes
- ✅ Chamar pacientes no painel

### Técnico de Enfermagem (tecnico_enfermagem)
- ✅ Registrar sinais vitais
- ✅ Visualizar pacientes
- ✅ Visualizar evoluções (leitura)

## Migrando dados do localStorage

Para migrar dados do localStorage local para o Supabase:

```typescript
// Exemplo: Importar pacientes
import { supabase } from '@/lib/supabase';

async function migratePatients() {
  const localPatients = JSON.parse(localStorage.getItem('patients') || '[]');

  const { data, error } = await supabase
    .from('patients')
    .insert(localPatients);

  if (error) {
    console.error('Erro na migração:', error);
  } else {
    console.log('Pacientes importados:', data);
  }
}
```

## Boas Práticas

1. **Backups regulares**: Configure backups automáticos no painel Supabase
2. **Row Level Security**: Sempre habilite RLS em produção
3. **Auditoria**: Use a tabela de audit_logs para rastrear mudanças
4. **Validação de dados**: Valide dados no backend antes de inserir
5. **Índices**: Mantenha índices atualizados conforme a carga cresce

## Troubleshooting

### Erro: "Column 'created_at' does not exist"
- Verifique se todas as tabelas foram criadas
- Execute o script novamente

### Erro: "Permission denied"
- Verifique as políticas RLS
- Certifique-se de que o usuário tem role apropriado

### Queries lentas
- Analise os índices com `EXPLAIN ANALYZE`
- Verifique se há índices em colunas frequentemente filtradas

## Próximas Etapas

1. Criar cliente Supabase no projeto React
2. Implementar autenticação com Supabase Auth
3. Migrar dados do localStorage
4. Implementar sincronização em tempo real com Supabase Realtime
5. Configurar políticas RLS específicas do seu negócio

## Referências

- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
