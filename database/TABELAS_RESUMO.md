# Resumo de Todas as Tabelas do PEP

## 📋 Tabelas por Categoria

### 1️⃣ INFRAESTRUTURA (1 tabela)

#### CLINICS
Informações das clínicas/instituições do sistema

```sql
CREATE TABLE clinics (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  hours_start TIME,
  hours_end TIME,
  primary_color TEXT DEFAULT '#0066cc',
  secondary_color TEXT DEFAULT '#00a8e8',
  logo_url TEXT,
  logo_filename TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome da clínica |
| cnpj | TEXT | CNPJ (único) |
| phone | TEXT | Telefone |
| email | TEXT | Email institucional |
| address | TEXT | Endereço completo |
| hours_start | TIME | Horário de abertura |
| hours_end | TIME | Horário de fechamento |
| primary_color | TEXT | Cor primária (hex) |
| secondary_color | TEXT | Cor secundária (hex) |
| logo_url | TEXT | URL do logo |
| logo_filename | TEXT | Nome do arquivo do logo |

---

### 2️⃣ USUÁRIOS E AUTENTICAÇÃO (4 tabelas)

#### SYSTEM_USERS
Profissionais do sistema (médicos, enfermeiros, admin, recepção)

```sql
CREATE TABLE system_users (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  crm TEXT,
  coren TEXT,
  phone TEXT,
  specialty TEXT,
  status TEXT CHECK (status IN ('ativo', 'inativo')),
  must_change_password BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| clinic_id | UUID FK | Clínica do usuário |
| name | TEXT | Nome completo |
| email | TEXT | Email (único) |
| login | TEXT | Username (único) |
| password_hash | TEXT | Senha criptografada |
| crm | TEXT | Registro médico (médicos) |
| coren | TEXT | Registro de enfermeiro |
| phone | TEXT | Telefone |
| specialty | TEXT | Especialidade médica |
| status | TEXT | ativo\|inativo |
| must_change_password | BOOLEAN | Forçar troca de senha |
| last_login | TIMESTAMP | Último acesso |

---

#### USER_ROLES
Papéis/funções disponíveis no sistema

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP
);

-- Valores pré-inseridos:
-- medico, enfermeiro, admin, recepcao, tecnico_enfermagem
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | medico\|enfermeiro\|admin\|recepcao\|tecnico_enfermagem |
| description | TEXT | Descrição do papel |

---

#### USER_ROLE_ASSIGNMENTS
Mapeamento muitos-para-muitos entre usuários e papéis

```sql
CREATE TABLE user_role_assignments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES system_users(id),
  role_id UUID NOT NULL REFERENCES user_roles(id),
  assigned_at TIMESTAMP,
  UNIQUE(user_id, role_id)
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| user_id | UUID FK | ID do usuário |
| role_id | UUID FK | ID do papel |
| assigned_at | TIMESTAMP | Data da atribuição |

---

#### SESSIONS
Gerenciamento de sessões de usuários autenticados

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES system_users(id),
  token_hash TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP,
  last_activity TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| user_id | UUID FK | ID do usuário |
| token_hash | TEXT | Hash do token |
| ip_address | INET | IP do cliente |
| user_agent | TEXT | User agent do browser |
| expires_at | TIMESTAMP | Expiração da sessão |
| last_activity | TIMESTAMP | Última atividade |

---

### 3️⃣ PACIENTES (1 tabela)

#### PATIENTS
Dados demográficos dos pacientes

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  sus TEXT,
  birth_date DATE,
  sex TEXT CHECK (sex IN ('M', 'F')),
  phone TEXT,
  email TEXT,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT[],
  status TEXT CHECK (status IN ('internado', 'ambulatorial', 'alta', 'obito')),
  last_visit TIMESTAMP,
  death_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(clinic_id, cpf)
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| clinic_id | UUID FK | Clínica do paciente |
| name | TEXT | Nome completo |
| cpf | TEXT | CPF (único por clínica) |
| sus | TEXT | Número do SUS |
| birth_date | DATE | Data de nascimento |
| sex | TEXT | M\|F |
| phone | TEXT | Telefone |
| email | TEXT | Email |
| blood_type | TEXT | Tipo sanguíneo |
| allergies | TEXT[] | Array de alergias |
| status | TEXT | internado\|ambulatorial\|alta\|obito |
| last_visit | TIMESTAMP | Última consulta |
| death_date | TIMESTAMP | Data do óbito (se aplicável) |

---

### 4️⃣ SINAIS VITAIS (1 tabela)

#### VITAL_SIGNS
Medições de sinais vitais dos pacientes

```sql
CREATE TABLE vital_signs (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  recorded_at TIMESTAMP NOT NULL,
  recorded_by_id UUID NOT NULL REFERENCES system_users(id),
  temperature DECIMAL(5, 2),
  heart_rate INTEGER,
  blood_pressure_sys INTEGER,
  blood_pressure_dia INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation DECIMAL(5, 2),
  weight DECIMAL(6, 2),
  height DECIMAL(4, 2),
  bmi DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| patient_id | UUID FK | ID do paciente |
| recorded_at | TIMESTAMP | Hora do registro |
| recorded_by_id | UUID FK | ID de quem registrou |
| temperature | DECIMAL | Temperatura (°C) |
| heart_rate | INTEGER | Frequência cardíaca (BPM) |
| blood_pressure_sys | INTEGER | Sistólica (mmHg) |
| blood_pressure_dia | INTEGER | Diastólica (mmHg) |
| respiratory_rate | INTEGER | Frequência respiratória (IPM) |
| oxygen_saturation | DECIMAL | SpO2 (%) |
| weight | DECIMAL | Peso (kg) |
| height | DECIMAL | Altura (m) |
| bmi | DECIMAL | Índice de massa corporal |
| notes | TEXT | Observações |

---

### 5️⃣ EVOLUÇÕES CLÍNICAS (2 tabelas)

#### MEDICAL_EVOLUTIONS
Evoluções clínicas escritas por médicos

```sql
CREATE TABLE medical_evolutions (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES system_users(id),
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  summary TEXT NOT NULL,
  details TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| patient_id | UUID FK | ID do paciente |
| doctor_id | UUID FK | ID do médico |
| recorded_at | TIMESTAMP | Data da evolução |
| summary | TEXT | Resumo clínico |
| details | TEXT | Detalhes completos |
| diagnosis | TEXT | Diagnóstico |
| treatment_plan | TEXT | Plano de tratamento |

---

#### NURSING_EVOLUTIONS
Evoluções de enfermagem

```sql
CREATE TABLE nursing_evolutions (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  nurse_id UUID NOT NULL REFERENCES system_users(id),
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  summary TEXT NOT NULL,
  details TEXT,
  care_plan TEXT,
  observations TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| patient_id | UUID FK | ID do paciente |
| nurse_id | UUID FK | ID do enfermeiro |
| recorded_at | TIMESTAMP | Data da evolução |
| summary | TEXT | Resumo dos cuidados |
| details | TEXT | Detalhes |
| care_plan | TEXT | Plano de cuidados |
| observations | TEXT | Observações |

---

### 6️⃣ PRESCRIÇÕES (2 tabelas)

#### PRESCRIPTIONS
Prescrições médicas

```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES system_users(id),
  prescribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'encerrada', 'suspensa')),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| patient_id | UUID FK | ID do paciente |
| doctor_id | UUID FK | ID do médico |
| prescribed_at | TIMESTAMP | Data da prescrição |
| status | TEXT | ativa\|encerrada\|suspensa |
| notes | TEXT | Notas especiais |

---

#### PRESCRIPTION_MEDICATIONS
Medicamentos associados às prescrições

```sql
CREATE TABLE prescription_medications (
  id UUID PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES prescriptions(id),
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  route TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  created_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| prescription_id | UUID FK | ID da prescrição |
| name | TEXT | Nome do medicamento |
| dose | TEXT | Dosagem (ex: 1g, 500mg) |
| route | TEXT | Via (VO, EV, SC, IM, etc) |
| frequency | TEXT | Frequência (ex: 12/12h) |
| duration | TEXT | Duração (ex: 7 dias) |

---

### 7️⃣ EXAMES (1 tabela)

#### EXAMS
Solicitações e resultados de exames

```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  requested_by_id UUID NOT NULL REFERENCES system_users(id),
  type TEXT NOT NULL CHECK (type IN ('laboratorial', 'imagem', 'funcional', 'outro')),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'coletado', 'resultado_disponivel', 'entregue')),
  result TEXT,
  requested_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| patient_id | UUID FK | ID do paciente |
| requested_by_id | UUID FK | ID de quem solicitou |
| type | TEXT | laboratorial\|imagem\|funcional\|outro |
| name | TEXT | Nome do exame |
| status | TEXT | solicitado\|coletado\|resultado_disponivel\|entregue |
| result | TEXT | Resultado do exame |
| requested_at | TIMESTAMP | Data da solicitação |
| completed_at | TIMESTAMP | Data de conclusão |

---

### 8️⃣ TIMELINE E ANEXOS (2 tabelas)

#### TIMELINE_EVENTS
Visão unificada de todos os eventos clínicos

```sql
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('evolucao_medica', 'evolucao_enfermagem', 'sinais_vitais', 'prescricao', 'exame', 'anexo')),
  title TEXT NOT NULL,
  summary TEXT,
  details TEXT,
  professional_id UUID REFERENCES system_users(id),
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| patient_id | UUID FK | ID do paciente |
| event_type | TEXT | Tipo de evento |
| title | TEXT | Título do evento |
| summary | TEXT | Resumo |
| details | TEXT | Detalhes |
| professional_id | UUID FK | ID do profissional |
| occurred_at | TIMESTAMP | Data do evento |

---

#### ATTACHMENTS
Arquivos anexados aos registros dos pacientes

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  uploaded_by_id UUID NOT NULL REFERENCES system_users(id),
  title TEXT NOT NULL,
  description TEXT,
  file_data BYTEA,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| patient_id | UUID FK | ID do paciente |
| uploaded_by_id | UUID FK | ID de quem enviou |
| title | TEXT | Título do arquivo |
| description | TEXT | Descrição |
| file_data | BYTEA | Dados binários do arquivo |
| file_type | TEXT | MIME type |
| file_size | INTEGER | Tamanho em bytes |
| uploaded_at | TIMESTAMP | Data do upload |

---

#### PATIENT_CALLS
Chamadas no painel de saguão

```sql
CREATE TABLE patient_calls (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  called_by_id UUID NOT NULL REFERENCES system_users(id),
  room TEXT NOT NULL,
  called_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| patient_id | UUID FK | ID do paciente |
| called_by_id | UUID FK | ID de quem chamou |
| room | TEXT | Sala/consultório |
| called_at | TIMESTAMP | Hora da chamada |

---

### 9️⃣ PERMISSÕES (2 tabelas)

#### PERMISSIONS
Permissões do sistema

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP
);

-- Exemplos:
-- evolucao_medica:criar, evolucao_medica:editar, evolucao_medica:deletar
-- prescricao:criar, exame:solicitar, usuario:gerenciar
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | resource:action (ex: evolucao_medica:criar) |
| description | TEXT | Descrição |
| resource | TEXT | Recurso (evolucao_medica, prescricao, etc) |
| action | TEXT | Ação (criar, editar, deletar, visualizar) |

---

#### ROLE_PERMISSIONS
Mapeamento papel → permissões

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES user_roles(id),
  permission_id UUID NOT NULL REFERENCES permissions(id),
  assigned_at TIMESTAMP,
  UNIQUE(role_id, permission_id)
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| role_id | UUID FK | ID do papel |
| permission_id | UUID FK | ID da permissão |
| assigned_at | TIMESTAMP | Data da atribuição |

---

### 🔟 AUDITORIA (1 tabela)

#### AUDIT_LOGS
Log de todas as ações do sistema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES system_users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP
);
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| user_id | UUID FK | ID do usuário |
| action | TEXT | CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT |
| table_name | TEXT | Tabela afetada |
| record_id | UUID | ID do registro afetado |
| changes | JSONB | Alterações (antes/depois) |
| ip_address | INET | IP da ação |
| user_agent | TEXT | User agent |

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Total de Tabelas** | 18 |
| **Tabelas de Dados** | 12 |
| **Tabelas de Relacionamento** | 3 |
| **Tabelas de Suporte** | 3 |
| **Colunas Totais** | 180+ |
| **Foreign Keys** | 25+ |
| **Índices** | 20+ |
| **Views** | 3 |
| **Triggers** | 8 |

---

## 🔍 Índices Principais

```sql
-- Pacientes
idx_patients_clinic_id
idx_patients_cpf
idx_patients_status
idx_patients_created_at

-- Sinais Vitais
idx_vital_signs_patient_id
idx_vital_signs_recorded_at
idx_vital_signs_recorded_by

-- Evoluções
idx_medical_evolutions_patient_id
idx_medical_evolutions_doctor_id
idx_medical_evolutions_recorded_at
idx_nursing_evolutions_patient_id
idx_nursing_evolutions_nurse_id
idx_nursing_evolutions_recorded_at

-- Prescrições
idx_prescriptions_patient_id
idx_prescriptions_doctor_id
idx_prescriptions_status

-- Exames
idx_exams_patient_id
idx_exams_requested_by
idx_exams_status

-- Timeline
idx_timeline_events_patient_id
idx_timeline_events_type
idx_timeline_events_occurred_at

-- Usuários
idx_system_users_clinic_id
idx_system_users_email
idx_system_users_status

-- Auditoria
idx_audit_logs_user_id
idx_audit_logs_created_at
idx_audit_logs_table_name
```

---

## 🎯 Como Encontrar uma Tabela

| Você quer... | Procure em... |
|---|---|
| Informações do paciente | `patients` |
| Histórico de sinais vitais | `vital_signs` |
| Evoluções médicas | `medical_evolutions` |
| Evoluções de enfermagem | `nursing_evolutions` |
| Medicamentos prescritos | `prescription_medications` |
| Solicitações de exames | `exams` |
| Timeline do paciente | `timeline_events` |
| Arquivo PDF/imagem | `attachments` |
| Usuários do sistema | `system_users` |
| Logs de auditoria | `audit_logs` |
| Permissões de usuário | `user_role_assignments` + `role_permissions` |
| Sessões ativas | `sessions` |

