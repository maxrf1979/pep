# Guia de Migração de Dados do localStorage para Supabase

## Visão Geral

Este guia descreve como migrar dados armazenados localmente no localStorage para o banco de dados Supabase.

## Dados a Migrar

Os seguintes dados estão atualmente armazenados em localStorage:

| localStorage Key | Tabela Destino | Entidade |
|-----------------|---|---|
| `pulse-auth-session` | `system_users` + `sessions` | Usuário autenticado |
| `patients` | `patients` | Pacientes |
| `localVitals` | `vital_signs` | Sinais vitais |
| `pep-timeline` | `timeline_events` | Eventos timeline |
| `pep-calls` | `patient_calls` | Chamadas de pacientes |
| `clinicSettings` | `clinics` | Configurações da clínica |
| `pep-users` | `system_users` + `user_role_assignments` | Usuários do sistema |
| (implícito) | `medical_evolutions` | Evoluções médicas |
| (implícito) | `nursing_evolutions` | Evoluções de enfermagem |
| (implícito) | `prescriptions` + `prescription_medications` | Prescrições |
| (implícito) | `exams` | Exames |
| (implícito) | `attachments` | Anexos |

## Estrutura de Migração

### 1. Dados de Infraestrutura

#### Clínicas (clinicSettings → clinics)

```typescript
// Fonte
{
  name: string,
  cnpj: string,
  phone: string,
  email: string,
  address: string,
  hoursStart: string,
  hoursEnd: string,
  primaryColor: string,
  secondaryColor: string,
  logo: File | null,
  logoName: string
}

// Destino
{
  id: uuid,
  name: string,
  cnpj: string,
  phone: string,
  email: string,
  address: string,
  hours_start: time,
  hours_end: time,
  primary_color: string,
  secondary_color: string,
  logo_url: string,
  logo_filename: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 2. Dados de Usuários

#### Usuários do Sistema (pep-users → system_users)

```typescript
// Fonte
{
  id: string,
  name: string,
  email: string,
  login: string,
  roles: string[], // ["medico", "admin"]
  crm?: string,
  coren?: string,
  status: "ativo" | "inativo",
  password?: string,
  mustChangePassword?: boolean
}

// Destino
{
  id: uuid,
  clinic_id: uuid,
  name: string,
  email: string,
  login: string,
  password_hash: string, // HASH da senha, não plaintext!
  crm?: string,
  coren?: string,
  phone?: string,
  specialty?: string,
  status: 'ativo' | 'inativo',
  must_change_password: boolean,
  last_login?: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}

// Mapeamento de Roles (pep-users.roles → user_role_assignments)
// Para cada role em pep-users[].roles:
{
  user_id: uuid,
  role_id: uuid, // SELECT id FROM user_roles WHERE name = role
  assigned_at: timestamp
}
```

#### Sessão Autenticada (pulse-auth-session → system_users + sessions)

```typescript
// Fonte
{
  id?: string,
  name: string,
  email: string,
  role: "medico" | "enfermeiro" | "admin" | "recepcao",
  crm?: string,
  coren?: string,
  lastLogin?: string,
  mustChangePassword?: boolean
}

// Referência em system_users
// Cria entrada de session:
{
  id: uuid,
  user_id: uuid,
  token_hash: string, // hash do token de sessão
  ip_address: inet,
  user_agent: string,
  expires_at: timestamp,
  created_at: timestamp,
  last_activity: timestamp
}
```

### 3. Dados de Pacientes

#### Pacientes (patients → patients)

```typescript
// Fonte
{
  id: string,
  name: string,
  cpf: string,
  sus?: string,
  birthDate: string,
  age: number, // CALCULADO
  sex: "M" | "F",
  phone: string,
  email?: string,
  bloodType?: string,
  allergies: string[],
  lastVisit: string,
  status: "internado" | "ambulatorial" | "alta" | "obito",
  deathDate?: string
}

// Destino
{
  id: uuid,
  clinic_id: uuid,
  name: string,
  cpf: string,
  sus?: string,
  birth_date: date,
  sex: 'M' | 'F',
  phone: string,
  email?: string,
  blood_type?: string,
  allergies: text[],
  status: 'internado' | 'ambulatorial' | 'alta' | 'obito',
  last_visit: timestamp,
  death_date?: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 4. Dados Clínicos

#### Sinais Vitais (localVitals → vital_signs)

```typescript
// Fonte
{
  id: string,
  patientId: string,
  date: string,
  temperature: number,
  heartRate: number,
  bloodPressureSys: number,
  bloodPressureDia: number,
  respiratoryRate: number,
  oxygenSaturation: number,
  weight?: number,
  height?: number,
  bmi?: number,
  professional: string
}

// Destino
{
  id: uuid,
  patient_id: uuid,
  recorded_at: timestamp,
  recorded_by_id: uuid,
  temperature: decimal,
  heart_rate: integer,
  blood_pressure_sys: integer,
  blood_pressure_dia: integer,
  respiratory_rate: integer,
  oxygen_saturation: decimal,
  weight?: decimal,
  height?: decimal,
  bmi?: decimal,
  notes?: text,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### Evoluções Médicas (pep-timeline type=evolucao_medica → medical_evolutions)

```typescript
// Fonte (TimelineEvent)
{
  id: string,
  patientId: string,
  type: "evolucao_medica",
  date: string,
  title: string,
  summary: string,
  professional: string,
  details?: string,
  fileData?: string // base64
}

// Destino
{
  id: uuid,
  patient_id: uuid,
  doctor_id: uuid, // PARSE professional para encontrar user_id
  recorded_at: timestamp,
  summary: text,
  details?: text,
  diagnosis?: text,
  treatment_plan?: text,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### Evoluções de Enfermagem (pep-timeline type=evolucao_enfermagem → nursing_evolutions)

```typescript
// Fonte (TimelineEvent)
{
  id: string,
  patientId: string,
  type: "evolucao_enfermagem",
  date: string,
  title: string,
  summary: string,
  professional: string,
  details?: string,
  fileData?: string // base64
}

// Destino
{
  id: uuid,
  patient_id: uuid,
  nurse_id: uuid, // PARSE professional para encontrar user_id
  recorded_at: timestamp,
  summary: text,
  details?: text,
  care_plan?: text,
  observations?: text,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### Prescrições (pep-prescriptions → prescriptions + prescription_medications)

```typescript
// Fonte
{
  id: string,
  patientId: string,
  date: string,
  medications: [
    {
      name: string,
      dose: string,
      route: string,
      frequency: string,
      duration: string
    }
  ],
  professional: string,
  status: "ativa" | "encerrada" | "suspensa",
  notes?: string
}

// Destino: Prescription
{
  id: uuid,
  patient_id: uuid,
  doctor_id: uuid,
  prescribed_at: timestamp,
  status: 'ativa' | 'encerrada' | 'suspensa',
  notes?: text,
  created_at: timestamp,
  updated_at: timestamp
}

// Destino: PrescriptionMedication (1:N)
{
  id: uuid,
  prescription_id: uuid,
  name: text,
  dose: text,
  route: text,
  frequency: text,
  duration?: text,
  created_at: timestamp
}
```

#### Exames (pep-exams → exams)

```typescript
// Fonte
{
  id: string,
  patientId: string,
  requestDate: string,
  type: "laboratorial" | "imagem" | "funcional" | "outro",
  name: string,
  status: "solicitado" | "coletado" | "resultado_disponivel" | "entregue",
  result?: string,
  professional: string
}

// Destino
{
  id: uuid,
  patient_id: uuid,
  requested_by_id: uuid,
  type: 'laboratorial' | 'imagem' | 'funcional' | 'outro',
  name: text,
  status: 'solicitado' | 'coletado' | 'resultado_disponivel' | 'entregue',
  result?: text,
  requested_at: timestamp,
  completed_at?: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 5. Timeline (pep-timeline → timeline_events)

```typescript
// Fonte (genérico)
{
  id: string,
  patientId: string,
  type: "evolucao_medica" | "evolucao_enfermagem" | "sinais_vitais" | "prescricao" | "exame" | "anexo",
  date: string,
  title: string,
  summary: string,
  professional: string,
  details?: string,
  fileData?: string
}

// Destino
{
  id: uuid,
  patient_id: uuid,
  event_type: 'evolucao_medica' | 'evolucao_enfermagem' | 'sinais_vitais' | 'prescricao' | 'exame' | 'anexo',
  title: text,
  summary?: text,
  details?: text,
  professional_id: uuid,
  occurred_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 6. Chamadas de Pacientes (pep-calls → patient_calls)

```typescript
// Fonte
{
  id: string,
  patient_id: string,
  patient_name: string,
  room: string,
  professional: string,
  status: string,
  called_at: string,
  created_at: string
}

// Destino
{
  id: uuid,
  patient_id: uuid,
  called_by_id: uuid,
  room: text,
  called_at: timestamp,
  created_at: timestamp
}
```

## Script de Migração TypeScript

```typescript
// src/lib/migrate-to-supabase.ts

import { supabase } from '@/lib/supabase';

interface MigrationResult {
  success: boolean;
  tablesProcessed: string[];
  errors: Array<{ table: string; error: string }>;
  summary: {
    clinics: number;
    users: number;
    patients: number;
    vitalSigns: number;
    medicalEvolutions: number;
    nursingEvolutions: number;
    prescriptions: number;
    exams: number;
  };
}

export async function migrateAllData(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    tablesProcessed: [],
    errors: [],
    summary: {
      clinics: 0,
      users: 0,
      patients: 0,
      vitalSigns: 0,
      medicalEvolutions: 0,
      nursingEvolutions: 0,
      prescriptions: 0,
      exams: 0,
    },
  };

  try {
    // 1. Migrar configurações da clínica
    const clinicSettings = JSON.parse(localStorage.getItem('clinicSettings') || '{}');
    if (Object.keys(clinicSettings).length > 0) {
      const { data, error } = await supabase
        .from('clinics')
        .insert([
          {
            name: clinicSettings.name,
            cnpj: clinicSettings.cnpj,
            phone: clinicSettings.phone,
            email: clinicSettings.email,
            address: clinicSettings.address,
            hours_start: clinicSettings.hoursStart,
            hours_end: clinicSettings.hoursEnd,
            primary_color: clinicSettings.primaryColor,
            secondary_color: clinicSettings.secondaryColor,
            logo_filename: clinicSettings.logoName,
          },
        ])
        .select();

      if (error) {
        result.errors.push({ table: 'clinics', error: error.message });
      } else {
        result.summary.clinics = data?.length || 0;
        result.tablesProcessed.push('clinics');
      }
    }

    // 2. Migrar usuários do sistema
    const users = JSON.parse(localStorage.getItem('pep-users') || '[]');
    if (users.length > 0) {
      // Primeiro obter a clínica criada
      const { data: clinics } = await supabase
        .from('clinics')
        .select('id')
        .limit(1);

      const clinicId = clinics?.[0]?.id;

      if (clinicId) {
        for (const user of users) {
          const { data: userData, error } = await supabase
            .from('system_users')
            .insert([
              {
                clinic_id: clinicId,
                name: user.name,
                email: user.email,
                login: user.login,
                password_hash: await hashPassword(user.password || ''),
                crm: user.crm,
                coren: user.coren,
                status: user.status,
                must_change_password: user.mustChangePassword || false,
              },
            ])
            .select();

          if (error) {
            result.errors.push({ table: 'system_users', error: error.message });
          } else if (userData) {
            result.summary.users++;

            // Migrar roles do usuário
            for (const role of user.roles || []) {
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('id')
                .eq('name', role);

              if (roleData && roleData.length > 0) {
                await supabase
                  .from('user_role_assignments')
                  .insert([
                    {
                      user_id: userData[0].id,
                      role_id: roleData[0].id,
                    },
                  ]);
              }
            }
          }
        }

        result.tablesProcessed.push('system_users');
      }
    }

    // 3. Migrar pacientes
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    if (patients.length > 0) {
      const { data: clinics } = await supabase
        .from('clinics')
        .select('id')
        .limit(1);

      const clinicId = clinics?.[0]?.id;

      if (clinicId) {
        const patientsToInsert = patients.map(p => ({
          clinic_id: clinicId,
          name: p.name,
          cpf: p.cpf,
          sus: p.sus,
          birth_date: p.birthDate,
          sex: p.sex,
          phone: p.phone,
          email: p.email,
          blood_type: p.bloodType,
          allergies: p.allergies,
          status: p.status,
          last_visit: p.lastVisit,
          death_date: p.deathDate,
        }));

        const { data, error } = await supabase
          .from('patients')
          .insert(patientsToInsert)
          .select();

        if (error) {
          result.errors.push({ table: 'patients', error: error.message });
        } else {
          result.summary.patients = data?.length || 0;
          result.tablesProcessed.push('patients');
        }
      }
    }

    // 4. Migrar sinais vitais
    const vitals = JSON.parse(localStorage.getItem('localVitals') || '[]');
    if (vitals.length > 0) {
      // Buscar mapas de pacientes e usuários para encontrar IDs
      const { data: allPatients } = await supabase
        .from('patients')
        .select('id, cpf');

      const { data: allUsers } = await supabase
        .from('system_users')
        .select('id, name');

      const vitalsToInsert = vitals.map(v => {
        const patient = allPatients?.find(p => p.cpf === v.patientId);
        const user = allUsers?.find(u => u.name === v.professional);

        return {
          patient_id: patient?.id,
          recorded_at: v.date,
          recorded_by_id: user?.id,
          temperature: v.temperature,
          heart_rate: v.heartRate,
          blood_pressure_sys: v.bloodPressureSys,
          blood_pressure_dia: v.bloodPressureDia,
          respiratory_rate: v.respiratoryRate,
          oxygen_saturation: v.oxygenSaturation,
          weight: v.weight,
          height: v.height,
          bmi: v.bmi,
        };
      }).filter(v => v.patient_id && v.recorded_by_id);

      if (vitalsToInsert.length > 0) {
        const { data, error } = await supabase
          .from('vital_signs')
          .insert(vitalsToInsert)
          .select();

        if (error) {
          result.errors.push({ table: 'vital_signs', error: error.message });
        } else {
          result.summary.vitalSigns = data?.length || 0;
          result.tablesProcessed.push('vital_signs');
        }
      }
    }

    // 5. Migrar evoluções (do timeline)
    const timeline = JSON.parse(localStorage.getItem('pep-timeline') || '[]');
    if (timeline.length > 0) {
      const { data: allPatients } = await supabase
        .from('patients')
        .select('id, cpf');

      const { data: allUsers } = await supabase
        .from('system_users')
        .select('id, name');

      // Evoluções médicas
      const medicalEvolutions = timeline.filter(t => t.type === 'evolucao_medica');
      const meToInsert = medicalEvolutions.map(me => {
        const patient = allPatients?.find(p => p.cpf === me.patientId);
        const user = allUsers?.find(u => u.name === me.professional);

        return {
          patient_id: patient?.id,
          doctor_id: user?.id,
          recorded_at: me.date,
          summary: me.summary,
          details: me.details,
        };
      }).filter(me => me.patient_id && me.doctor_id);

      if (meToInsert.length > 0) {
        const { data, error } = await supabase
          .from('medical_evolutions')
          .insert(meToInsert)
          .select();

        if (error) {
          result.errors.push({ table: 'medical_evolutions', error: error.message });
        } else {
          result.summary.medicalEvolutions = data?.length || 0;
          result.tablesProcessed.push('medical_evolutions');
        }
      }

      // Evoluções de enfermagem
      const nursingEvolutions = timeline.filter(t => t.type === 'evolucao_enfermagem');
      const neToInsert = nursingEvolutions.map(ne => {
        const patient = allPatients?.find(p => p.cpf === ne.patientId);
        const user = allUsers?.find(u => u.name === ne.professional);

        return {
          patient_id: patient?.id,
          nurse_id: user?.id,
          recorded_at: ne.date,
          summary: ne.summary,
          details: ne.details,
        };
      }).filter(ne => ne.patient_id && ne.nurse_id);

      if (neToInsert.length > 0) {
        const { data, error } = await supabase
          .from('nursing_evolutions')
          .insert(neToInsert)
          .select();

        if (error) {
          result.errors.push({ table: 'nursing_evolutions', error: error.message });
        } else {
          result.summary.nursingEvolutions = data?.length || 0;
          result.tablesProcessed.push('nursing_evolutions');
        }
      }
    }

    // 6. Migrar timeline events
    if (timeline.length > 0) {
      const { data: allPatients } = await supabase
        .from('patients')
        .select('id, cpf');

      const { data: allUsers } = await supabase
        .from('system_users')
        .select('id, name');

      const timelineToInsert = timeline.map(t => {
        const patient = allPatients?.find(p => p.cpf === t.patientId);
        const user = allUsers?.find(u => u.name === t.professional);

        return {
          patient_id: patient?.id,
          event_type: t.type,
          title: t.title,
          summary: t.summary,
          details: t.details,
          professional_id: user?.id,
          occurred_at: t.date,
        };
      }).filter(t => t.patient_id);

      if (timelineToInsert.length > 0) {
        const { error } = await supabase
          .from('timeline_events')
          .insert(timelineToInsert);

        if (error) {
          result.errors.push({ table: 'timeline_events', error: error.message });
        } else {
          result.tablesProcessed.push('timeline_events');
        }
      }
    }

  } catch (error) {
    result.success = false;
    result.errors.push({
      table: 'MIGRATION',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return result;
}

async function hashPassword(password: string): Promise<string> {
  // Implementar hash seguro (bcrypt recomendado)
  // Por enquanto, usar placeholder
  return 'hash_' + btoa(password);
}
```

## Pré-requisitos Antes da Migração

1. ✅ Schema SQL executado no Supabase
2. ✅ Supabase cliente configurado
3. ✅ Variáveis de ambiente definidas
4. ⚠️ **Backup dos dados localStorage**

## Executar Migração

```typescript
// Em um componente ou página de admin
import { migrateAllData } from '@/lib/migrate-to-supabase';

async function handleMigration() {
  const result = await migrateAllData();
  console.log('Migration Result:', result);

  if (result.success) {
    console.log('✅ Migração concluída com sucesso');
    console.log('Resumo:', result.summary);
  } else {
    console.error('❌ Erros durante migração:', result.errors);
  }
}
```

## Validação Pós-Migração

Após a migração, verificar:

```sql
-- Contar registros em cada tabela
SELECT 'clinics' as table_name, COUNT(*) FROM clinics
UNION ALL
SELECT 'system_users', COUNT(*) FROM system_users
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'vital_signs', COUNT(*) FROM vital_signs
UNION ALL
SELECT 'medical_evolutions', COUNT(*) FROM medical_evolutions
UNION ALL
SELECT 'nursing_evolutions', COUNT(*) FROM nursing_evolutions
UNION ALL
SELECT 'prescriptions', COUNT(*) FROM prescriptions
UNION ALL
SELECT 'exams', COUNT(*) FROM exams;
```

## Considerações Importantes

1. **Senhas**: NUNCA armazenar senhas em plaintext. Usar bcrypt ou equivalente.
2. **Relacionamentos**: Verificar que todos os foreign keys foram mapeados corretamente.
3. **IDs**: Supabase usa UUIDs. Os IDs locais precisam ser convertidos ou remapeados.
4. **Timestamps**: Converter strings ISO para timestamps com zona horária.
5. **Backup**: Manter os dados no localStorage até validar completamente a migração.

## Rollback

Caso algo dê errado:

```sql
-- Limpar dados (CUIDADO!)
TRUNCATE TABLE attachments;
TRUNCATE TABLE patient_calls;
TRUNCATE TABLE timeline_events;
TRUNCATE TABLE exams;
TRUNCATE TABLE prescription_medications;
TRUNCATE TABLE prescriptions;
TRUNCATE TABLE nursing_evolutions;
TRUNCATE TABLE medical_evolutions;
TRUNCATE TABLE vital_signs;
TRUNCATE TABLE patients;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE sessions;
TRUNCATE TABLE user_role_assignments;
TRUNCATE TABLE system_users;
TRUNCATE TABLE clinics;
```

## Próximos Passos

1. ✅ Executar migração
2. ✅ Validar dados no Supabase
3. ⏳ Atualizar cliente React para usar Supabase
4. ⏳ Testar todas as funcionalidades
5. ⏳ Limpar localStorage (após validação)
