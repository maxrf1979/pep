# Diagrama Entidade-Relacionamento (ER) - PEP

## Diagrama Completo do Banco de Dados

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PEP DATABASE SCHEMA                         │
└─────────────────────────────────────────────────────────────────────┘

CORE TABLES
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ CLINICS                                                              │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ name (TEXT) NOT NULL                                                 │
│ cnpj (TEXT) UNIQUE NOT NULL                                          │
│ phone (TEXT)                                                         │
│ email (TEXT)                                                         │
│ address (TEXT)                                                       │
│ hours_start (TIME)                                                   │
│ hours_end (TIME)                                                     │
│ primary_color (TEXT)                                                 │
│ secondary_color (TEXT)                                               │
│ logo_url (TEXT)                                                      │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
│ updated_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
            │ SYSTEM_USERS │  │  PATIENTS   │  │ AUDIT_LOGS   │
            └──────────────┘  └─────────────┘  └──────────────┘


USERS & AUTHENTICATION
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ SYSTEM_USERS                                                         │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ clinic_id (FK → CLINICS.id) NOT NULL                                │
│ name (TEXT) NOT NULL                                                 │
│ email (TEXT) UNIQUE NOT NULL                                         │
│ login (TEXT) UNIQUE NOT NULL                                         │
│ password_hash (TEXT) NOT NULL                                        │
│ crm (TEXT) [Médico]                                                  │
│ coren (TEXT) [Enfermeiro]                                            │
│ phone (TEXT)                                                         │
│ specialty (TEXT)                                                     │
│ status (TEXT) CHECK (ativo|inativo)                                 │
│ must_change_password (BOOLEAN)                                       │
│ last_login (TIMESTAMP WITH TIME ZONE)                               │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
│ updated_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘
            │
            ├─────────────────────────────────┬────────────┐
            │                                 │            │
            ▼                                 ▼            ▼
    ┌────────────────────┐    ┌─────────────────────┐  ┌──────────┐
    │ USER_ROLE_         │    │ SESSIONS            │  │ AUDIT_   │
    │ ASSIGNMENTS        │    │                     │  │ LOGS     │
    │ (user_id → role_id)│    │ (token_hash, ip)    │  │          │
    └────────────────────┘    └─────────────────────┘  └──────────┘


ROLES & PERMISSIONS
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ USER_ROLES                                                           │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ name (TEXT) UNIQUE: medico|enfermeiro|admin|recepcao|tecnico        │
│ description (TEXT)                                                   │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌────────────────────┐
        │ ROLE_PERMISSIONS   │
        │ (N:N relationship) │
        │ role_id → perm_id  │
        └────────────────────┘
                │
                ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ PERMISSIONS                                                  │
    ├──────────────────────────────────────────────────────────────┤
    │ id (PK, UUID)                                                │
    │ name (TEXT) UNIQUE: "evolucao_medica:criar" etc             │
    │ description (TEXT)                                           │
    │ resource (TEXT): evolucao_medica|evolucao_enfermagem|...   │
    │ action (TEXT): criar|editar|deletar|visualizar|filtrar     │
    │ created_at (TIMESTAMP WITH TIME ZONE)                       │
    └──────────────────────────────────────────────────────────────┘


PATIENT DATA
═══════════════════════════════════════════════════════════════════════

    ┌──────────────────────────────────────────────────────────────┐
    │ PATIENTS                                                     │
    ├──────────────────────────────────────────────────────────────┤
    │ id (PK, UUID)                                                │
    │ clinic_id (FK → CLINICS.id) NOT NULL                         │
    │ name (TEXT) NOT NULL                                         │
    │ cpf (TEXT) NOT NULL (UNIQUE per clinic)                      │
    │ sus (TEXT) [SUS card number]                                 │
    │ birth_date (DATE)                                            │
    │ sex (TEXT): M|F                                              │
    │ phone (TEXT)                                                 │
    │ email (TEXT)                                                 │
    │ blood_type (TEXT): A+|A-|B+|B-|AB+|AB-|O+|O-               │
    │ allergies (TEXT[])                                           │
    │ status (TEXT): internado|ambulatorial|alta|obito            │
    │ last_visit (TIMESTAMP WITH TIME ZONE)                        │
    │ death_date (TIMESTAMP WITH TIME ZONE)                        │
    │ created_at (TIMESTAMP WITH TIME ZONE)                        │
    │ updated_at (TIMESTAMP WITH TIME ZONE)                        │
    └──────────────────────────────────────────────────────────────┘
            │
    ┌───────┼───────┬──────────┬──────────┬──────────┬─────────────┐
    │       │       │          │          │          │             │
    ▼       ▼       ▼          ▼          ▼          ▼             ▼
┌────┐┌─────┐┌──────┐┌────────┐┌─────┐┌────────┐┌──────────┐
│ VS ││ ME  ││ NE   ││PRESC.  ││EXM. ││ATTACH. ││TIMELINE  │
└────┘└─────┘└──────┘└────────┘└─────┘└────────┘└──────────┘


CLINICAL DATA - VITAL SIGNS
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ VITAL_SIGNS                                                          │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ patient_id (FK → PATIENTS.id) NOT NULL                              │
│ recorded_at (TIMESTAMP WITH TIME ZONE) NOT NULL                     │
│ recorded_by_id (FK → SYSTEM_USERS.id) NOT NULL                      │
│ temperature (DECIMAL) [°C]                                           │
│ heart_rate (INTEGER) [BPM]                                           │
│ blood_pressure_sys (INTEGER) [mmHg]                                  │
│ blood_pressure_dia (INTEGER) [mmHg]                                  │
│ respiratory_rate (INTEGER) [IPM]                                     │
│ oxygen_saturation (DECIMAL) [%]                                      │
│ weight (DECIMAL) [kg]                                                │
│ height (DECIMAL) [meters]                                            │
│ bmi (DECIMAL)                                                        │
│ notes (TEXT)                                                         │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
│ updated_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘


CLINICAL DATA - EVOLUTIONS
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ MEDICAL_EVOLUTIONS                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ patient_id (FK → PATIENTS.id) NOT NULL                              │
│ doctor_id (FK → SYSTEM_USERS.id) NOT NULL                           │
│ recorded_at (TIMESTAMP WITH TIME ZONE) NOT NULL                     │
│ summary (TEXT) NOT NULL                                              │
│ details (TEXT)                                                       │
│ diagnosis (TEXT)                                                     │
│ treatment_plan (TEXT)                                                │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
│ updated_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ NURSING_EVOLUTIONS                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ patient_id (FK → PATIENTS.id) NOT NULL                              │
│ nurse_id (FK → SYSTEM_USERS.id) NOT NULL                            │
│ recorded_at (TIMESTAMP WITH TIME ZONE) NOT NULL                     │
│ summary (TEXT) NOT NULL                                              │
│ details (TEXT)                                                       │
│ care_plan (TEXT)                                                     │
│ observations (TEXT)                                                  │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
│ updated_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘


CLINICAL DATA - PRESCRIPTIONS
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ PRESCRIPTIONS                                                        │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ patient_id (FK → PATIENTS.id) NOT NULL                              │
│ doctor_id (FK → SYSTEM_USERS.id) NOT NULL                           │
│ prescribed_at (TIMESTAMP WITH TIME ZONE) NOT NULL                   │
│ status (TEXT): ativa|encerrada|suspensa                             │
│ notes (TEXT)                                                         │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
│ updated_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────────┐
    │ PRESCRIPTION_MEDICATIONS              │
    ├──────────────────────────────────────┤
    │ id (PK, UUID)                        │
    │ prescription_id (FK) NOT NULL        │
    │ name (TEXT) NOT NULL                 │
    │ dose (TEXT) NOT NULL                 │
    │ route (TEXT) NOT NULL                │
    │ frequency (TEXT) NOT NULL            │
    │ duration (TEXT)                      │
    │ created_at (TIMESTAMP WITH TIME ZONE)│
    └──────────────────────────────────────┘


CLINICAL DATA - EXAMS
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ EXAMS                                                                │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ patient_id (FK → PATIENTS.id) NOT NULL                              │
│ requested_by_id (FK → SYSTEM_USERS.id) NOT NULL                     │
│ type (TEXT): laboratorial|imagem|funcional|outro                    │
│ name (TEXT) NOT NULL                                                 │
│ status (TEXT): solicitado|coletado|resultado_disponivel|entregue    │
│ result (TEXT)                                                        │
│ requested_at (TIMESTAMP WITH TIME ZONE) NOT NULL                    │
│ completed_at (TIMESTAMP WITH TIME ZONE)                             │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
│ updated_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘


OTHER TABLES
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ TIMELINE_EVENTS (Unified view of all clinical events)               │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ patient_id (FK → PATIENTS.id) NOT NULL                              │
│ event_type (TEXT): evolucao_medica|evolucao_enfermagem|...         │
│ title (TEXT) NOT NULL                                                │
│ summary (TEXT)                                                       │
│ details (TEXT)                                                       │
│ professional_id (FK → SYSTEM_USERS.id)                              │
│ occurred_at (TIMESTAMP WITH TIME ZONE) NOT NULL                     │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
│ updated_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ ATTACHMENTS (Files: images, PDFs, documents)                        │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ patient_id (FK → PATIENTS.id) NOT NULL                              │
│ uploaded_by_id (FK → SYSTEM_USERS.id) NOT NULL                      │
│ title (TEXT) NOT NULL                                                │
│ description (TEXT)                                                   │
│ file_data (BYTEA)                                                    │
│ file_type (TEXT) [MIME type]                                         │
│ file_size (INTEGER) [bytes]                                          │
│ uploaded_at (TIMESTAMP WITH TIME ZONE) NOT NULL                     │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ PATIENT_CALLS (Call panel for rooms)                                │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ patient_id (FK → PATIENTS.id) NOT NULL                              │
│ called_by_id (FK → SYSTEM_USERS.id) NOT NULL                        │
│ room (TEXT) NOT NULL                                                 │
│ called_at (TIMESTAMP WITH TIME ZONE) NOT NULL                       │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘


AUDIT & SECURITY
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ AUDIT_LOGS                                                           │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ user_id (FK → SYSTEM_USERS.id)                                      │
│ action (TEXT): CREATE|READ|UPDATE|DELETE|LOGIN|LOGOUT              │
│ table_name (TEXT)                                                    │
│ record_id (UUID)                                                     │
│ changes (JSONB) [before/after values]                                │
│ ip_address (INET)                                                    │
│ user_agent (TEXT)                                                    │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ SESSIONS                                                             │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                        │
│ user_id (FK → SYSTEM_USERS.id) NOT NULL                             │
│ token_hash (TEXT) UNIQUE NOT NULL                                    │
│ ip_address (INET)                                                    │
│ user_agent (TEXT)                                                    │
│ expires_at (TIMESTAMP WITH TIME ZONE) NOT NULL                      │
│ created_at (TIMESTAMP WITH TIME ZONE)                               │
│ last_activity (TIMESTAMP WITH TIME ZONE)                            │
└──────────────────────────────────────────────────────────────────────┘
```

## Relações (Foreign Keys)

```
SYSTEM_USERS
├─ clinic_id → CLINICS.id (Many:One)
└─ (1:N) Referenciado em:
    ├─ VITAL_SIGNS (recorded_by_id)
    ├─ MEDICAL_EVOLUTIONS (doctor_id)
    ├─ NURSING_EVOLUTIONS (nurse_id)
    ├─ PRESCRIPTIONS (doctor_id)
    ├─ EXAMS (requested_by_id)
    ├─ ATTACHMENTS (uploaded_by_id)
    ├─ PATIENT_CALLS (called_by_id)
    ├─ TIMELINE_EVENTS (professional_id)
    ├─ AUDIT_LOGS (user_id)
    └─ SESSIONS (user_id)

PATIENTS
├─ clinic_id → CLINICS.id (Many:One)
└─ (1:N) Referenciado em:
    ├─ VITAL_SIGNS (patient_id)
    ├─ MEDICAL_EVOLUTIONS (patient_id)
    ├─ NURSING_EVOLUTIONS (patient_id)
    ├─ PRESCRIPTIONS (patient_id)
    ├─ EXAMS (patient_id)
    ├─ ATTACHMENTS (patient_id)
    ├─ PATIENT_CALLS (patient_id)
    └─ TIMELINE_EVENTS (patient_id)

PRESCRIPTIONS
├─ patient_id → PATIENTS.id (Many:One)
├─ doctor_id → SYSTEM_USERS.id (Many:One)
└─ (1:N) PRESCRIPTION_MEDICATIONS (prescription_id)
```

## Contagem de Tabelas

- **Total: 18 tabelas**
- **Tabelas de dados: 12**
- **Tabelas de relacionamento: 3** (user_role_assignments, role_permissions, prescription_medications)
- **Tabelas de auditoria: 3** (audit_logs, sessions)

## Índices Criados: 20+

Otimizações para queries mais rápidas em campos frequentemente filtrados/ordenados.

## Views Criadas: 3

1. `patient_summary` - Resumo com contagem de eventos
2. `user_permissions` - Mapeamento usuário-permissão
3. `recent_activity` - Timeline unificada de atividades
