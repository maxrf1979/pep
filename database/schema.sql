-- ============================================================================
-- PEP (Prontuário Eletrônico de Pacientes) - Supabase Database Schema
-- ============================================================================
-- Created: 2026-03-15
-- Purpose: Complete database schema for electronic health records system
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. Clinic/Institution Settings
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Roles (enum-like table)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- medico, enfermeiro, admin, recepcao, tecnico_enfermagem
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO user_roles (name, description) VALUES
  ('medico', 'Médico - Acesso completo a evoluções médicas'),
  ('enfermeiro', 'Enfermeiro - Acesso restrito a evoluções de enfermagem'),
  ('admin', 'Administrador - Acesso total ao sistema'),
  ('recepcao', 'Recepção - Acesso limitado a dados básicos'),
  ('tecnico_enfermagem', 'Técnico de Enfermagem - Suporte ao enfermeiro');

-- 3. System Users (Professionals/Staff)
CREATE TABLE system_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  crm TEXT, -- Conselho Regional de Medicina (for doctors)
  coren TEXT, -- Conselho Regional de Enfermagem (for nurses)
  phone TEXT,
  specialty TEXT, -- Medical specialty
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  must_change_password BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. User-Role Mapping (Many-to-Many)
CREATE TABLE user_role_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES system_users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role_id)
);

-- 5. Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  sus TEXT, -- SUS card number
  birth_date DATE,
  sex TEXT CHECK (sex IN ('M', 'F')),
  phone TEXT,
  email TEXT,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT[], -- Array of allergy names
  status TEXT DEFAULT 'ambulatorial' CHECK (status IN ('internado', 'ambulatorial', 'alta', 'obito')),
  last_visit TIMESTAMP WITH TIME ZONE,
  death_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id, cpf)
);

-- ============================================================================
-- CLINICAL DATA TABLES
-- ============================================================================

-- 6. Vital Signs
CREATE TABLE vital_signs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recorded_by_id UUID NOT NULL REFERENCES system_users(id),
  temperature DECIMAL(5, 2), -- Celsius
  heart_rate INTEGER, -- BPM
  blood_pressure_sys INTEGER, -- mmHg
  blood_pressure_dia INTEGER, -- mmHg
  respiratory_rate INTEGER, -- IPM
  oxygen_saturation DECIMAL(5, 2), -- SpO2 %
  weight DECIMAL(6, 2), -- kg
  height DECIMAL(4, 2), -- meters
  bmi DECIMAL(5, 2), -- calculated
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Medical Evolution (Evolução Médica)
CREATE TABLE medical_evolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES system_users(id),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  summary TEXT NOT NULL,
  details TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Nursing Evolution (Evolução de Enfermagem)
CREATE TABLE nursing_evolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  nurse_id UUID NOT NULL REFERENCES system_users(id),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  summary TEXT NOT NULL,
  details TEXT,
  care_plan TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Prescriptions
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES system_users(id),
  prescribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'encerrada', 'suspensa')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Prescription Medications (nested in prescriptions)
CREATE TABLE prescription_medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT NOT NULL, -- e.g., "1g", "500mg"
  route TEXT NOT NULL, -- VO, EV, SC, IM, etc.
  frequency TEXT NOT NULL, -- e.g., "12/12h", "6/6h SOS"
  duration TEXT, -- e.g., "7 dias", "uso contínuo"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Exams
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  requested_by_id UUID NOT NULL REFERENCES system_users(id),
  type TEXT NOT NULL CHECK (type IN ('laboratorial', 'imagem', 'funcional', 'outro')),
  name TEXT NOT NULL, -- e.g., "Hemograma Completo"
  status TEXT DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'coletado', 'resultado_disponivel', 'entregue')),
  result TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Timeline Events (generic events for unified history)
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('evolucao_medica', 'evolucao_enfermagem', 'sinais_vitais', 'prescricao', 'exame', 'anexo')),
  title TEXT NOT NULL,
  summary TEXT,
  details TEXT,
  professional_id UUID REFERENCES system_users(id),
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Attachments/Files
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by_id UUID NOT NULL REFERENCES system_users(id),
  title TEXT NOT NULL,
  description TEXT,
  file_data BYTEA, -- Binary file data
  file_type TEXT, -- MIME type (application/pdf, image/jpeg, etc.)
  file_size INTEGER, -- bytes
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Patient Calls (Painel de Chamada)
CREATE TABLE patient_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  called_by_id UUID NOT NULL REFERENCES system_users(id),
  room TEXT NOT NULL, -- e.g., "Consultório 1", "Sala de Triagem"
  called_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT AND SECURITY TABLES
-- ============================================================================

-- 15. Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES system_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
  table_name TEXT,
  record_id UUID,
  changes JSONB, -- Before/after values
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Session Management
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES system_users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- e.g., "evolucao_medica:criar"
  description TEXT,
  resource TEXT NOT NULL, -- e.g., "evolucao_medica"
  action TEXT NOT NULL, -- e.g., "criar", "editar", "deletar", "visualizar"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('evolucao_medica:criar', 'Criar evolução médica', 'evolucao_medica', 'criar'),
  ('evolucao_medica:editar', 'Editar evolução médica', 'evolucao_medica', 'editar'),
  ('evolucao_medica:deletar', 'Deletar evolução médica', 'evolucao_medica', 'deletar'),
  ('evolucao_medica:visualizar', 'Visualizar evolução médica', 'evolucao_medica', 'visualizar'),
  ('evolucao_medica:filtrar', 'Filtrar evolução médica', 'evolucao_medica', 'filtrar'),

  ('evolucao_enfermagem:criar', 'Criar evolução de enfermagem', 'evolucao_enfermagem', 'criar'),
  ('evolucao_enfermagem:editar', 'Editar evolução de enfermagem', 'evolucao_enfermagem', 'editar'),
  ('evolucao_enfermagem:deletar', 'Deletar evolução de enfermagem', 'evolucao_enfermagem', 'deletar'),
  ('evolucao_enfermagem:visualizar', 'Visualizar evolução de enfermagem', 'evolucao_enfermagem', 'visualizar'),
  ('evolucao_enfermagem:filtrar', 'Filtrar evolução de enfermagem', 'evolucao_enfermagem', 'filtrar'),

  ('sinais_vitais:criar', 'Registrar sinais vitais', 'sinais_vitais', 'criar'),
  ('sinais_vitais:editar', 'Editar sinais vitais', 'sinais_vitais', 'editar'),
  ('sinais_vitais:visualizar', 'Visualizar sinais vitais', 'sinais_vitais', 'visualizar'),

  ('prescricao:criar', 'Criar prescrição', 'prescricao', 'criar'),
  ('prescricao:editar', 'Editar prescrição', 'prescricao', 'editar'),
  ('prescricao:visualizar', 'Visualizar prescrição', 'prescricao', 'visualizar'),

  ('exame:solicitar', 'Solicitar exame', 'exame', 'solicitar'),
  ('exame:visualizar', 'Visualizar exame', 'exame', 'visualizar'),

  ('paciente:criar', 'Criar paciente', 'paciente', 'criar'),
  ('paciente:editar', 'Editar paciente', 'paciente', 'editar'),
  ('paciente:visualizar', 'Visualizar paciente', 'paciente', 'visualizar'),
  ('paciente:deletar', 'Deletar paciente', 'paciente', 'deletar'),

  ('usuario:gerenciar', 'Gerenciar usuários', 'usuario', 'gerenciar'),
  ('relatorio:acessar', 'Acessar relatórios', 'relatorio', 'acessar'),
  ('configuracoes:acessar', 'Acessar configurações', 'configuracoes', 'acessar');

-- 18. Role-Permission Mapping
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- Map permissions to roles (Medical Doctor)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM user_roles WHERE name = 'medico'),
  id
FROM permissions
WHERE resource IN ('evolucao_medica', 'prescricao', 'exame', 'sinais_vitais', 'paciente', 'relatorio')
  OR name IN ('evolucao_enfermagem:visualizar', 'evolucao_enfermagem:filtrar');

-- Map permissions to roles (Nurse)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM user_roles WHERE name = 'enfermeiro'),
  id
FROM permissions
WHERE resource IN ('evolucao_enfermagem', 'sinais_vitais', 'paciente')
  OR name IN ('evolucao_medica:visualizar', 'evolucao_medica:filtrar', 'exame:visualizar', 'prescricao:visualizar');

-- Map permissions to roles (Admin)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM user_roles WHERE name = 'admin'),
  id
FROM permissions;

-- Map permissions to roles (Receptionist)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM user_roles WHERE name = 'recepcao'),
  id
FROM permissions
WHERE resource = 'paciente' OR name IN ('paciente:criar', 'paciente:visualizar');

-- Map permissions to roles (Nursing Technician)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM user_roles WHERE name = 'tecnico_enfermagem'),
  id
FROM permissions
WHERE resource IN ('sinais_vitais', 'paciente')
  OR name IN ('evolucao_enfermagem:visualizar', 'evolucao_medica:visualizar');

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Patient indexes
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);

-- Vital signs indexes
CREATE INDEX idx_vital_signs_patient_id ON vital_signs(patient_id);
CREATE INDEX idx_vital_signs_recorded_at ON vital_signs(recorded_at DESC);
CREATE INDEX idx_vital_signs_recorded_by ON vital_signs(recorded_by_id);

-- Medical evolution indexes
CREATE INDEX idx_medical_evolutions_patient_id ON medical_evolutions(patient_id);
CREATE INDEX idx_medical_evolutions_doctor_id ON medical_evolutions(doctor_id);
CREATE INDEX idx_medical_evolutions_recorded_at ON medical_evolutions(recorded_at DESC);

-- Nursing evolution indexes
CREATE INDEX idx_nursing_evolutions_patient_id ON nursing_evolutions(patient_id);
CREATE INDEX idx_nursing_evolutions_nurse_id ON nursing_evolutions(nurse_id);
CREATE INDEX idx_nursing_evolutions_recorded_at ON nursing_evolutions(recorded_at DESC);

-- Prescription indexes
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- Exam indexes
CREATE INDEX idx_exams_patient_id ON exams(patient_id);
CREATE INDEX idx_exams_requested_by ON exams(requested_by_id);
CREATE INDEX idx_exams_status ON exams(status);

-- Timeline indexes
CREATE INDEX idx_timeline_events_patient_id ON timeline_events(patient_id);
CREATE INDEX idx_timeline_events_type ON timeline_events(event_type);
CREATE INDEX idx_timeline_events_occurred_at ON timeline_events(occurred_at DESC);

-- System user indexes
CREATE INDEX idx_system_users_clinic_id ON system_users(clinic_id);
CREATE INDEX idx_system_users_email ON system_users(email);
CREATE INDEX idx_system_users_status ON system_users(status);

-- Attachment indexes
CREATE INDEX idx_attachments_patient_id ON attachments(patient_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by_id);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);

-- Session indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to all tables with updated_at
CREATE TRIGGER update_clinics_timestamp
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_system_users_timestamp
  BEFORE UPDATE ON system_users
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_patients_timestamp
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_vital_signs_timestamp
  BEFORE UPDATE ON vital_signs
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_medical_evolutions_timestamp
  BEFORE UPDATE ON medical_evolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_nursing_evolutions_timestamp
  BEFORE UPDATE ON nursing_evolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_prescriptions_timestamp
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_exams_timestamp
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_timeline_events_timestamp
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Note: RLS policies should be configured based on your specific Supabase
-- authentication setup. The following are example policies.

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursing_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Example: Patients can be viewed by users in the same clinic
CREATE POLICY "Users can view patients in their clinic"
  ON patients
  FOR SELECT
  USING (
    clinic_id = (
      SELECT clinic_id FROM system_users
      WHERE id = auth.uid()
    )
  );

-- Example: Users can only view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Example: Audit logs can only be viewed by admins
CREATE POLICY "Only admins can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments
      WHERE user_id = auth.uid()
        AND role_id = (SELECT id FROM user_roles WHERE name = 'admin')
    )
  );

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Patient Summary View
CREATE OR REPLACE VIEW patient_summary AS
SELECT
  p.id,
  p.name,
  p.cpf,
  p.age,
  p.sex,
  p.status,
  p.blood_type,
  p.last_visit,
  COUNT(DISTINCT ve.id) as medical_evolutions_count,
  COUNT(DISTINCT ne.id) as nursing_evolutions_count,
  COUNT(DISTINCT pr.id) as prescriptions_count,
  COUNT(DISTINCT ex.id) as exams_count,
  COUNT(DISTINCT vs.id) as vital_signs_count
FROM patients p
LEFT JOIN medical_evolutions ve ON p.id = ve.patient_id
LEFT JOIN nursing_evolutions ne ON p.id = ne.patient_id
LEFT JOIN prescriptions pr ON p.id = pr.patient_id
LEFT JOIN exams ex ON p.id = ex.patient_id
LEFT JOIN vital_signs vs ON p.id = vs.patient_id
GROUP BY p.id;

-- User Permissions View
CREATE OR REPLACE VIEW user_permissions AS
SELECT
  su.id as user_id,
  su.name,
  su.email,
  ur.name as role_name,
  p.name as permission_name,
  p.resource,
  p.action
FROM system_users su
JOIN user_role_assignments ura ON su.id = ura.user_id
JOIN user_roles ur ON ura.role_id = ur.id
LEFT JOIN role_permissions rp ON ur.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id;

-- Recent Activity View
CREATE OR REPLACE VIEW recent_activity AS
SELECT
  'medical_evolution' as type,
  me.id,
  me.patient_id,
  me.doctor_id as user_id,
  su.name as user_name,
  me.recorded_at as activity_date,
  me.summary as description
FROM medical_evolutions me
JOIN system_users su ON me.doctor_id = su.id

UNION ALL

SELECT
  'nursing_evolution' as type,
  ne.id,
  ne.patient_id,
  ne.nurse_id as user_id,
  su.name as user_name,
  ne.recorded_at as activity_date,
  ne.summary as description
FROM nursing_evolutions ne
JOIN system_users su ON ne.nurse_id = su.id

UNION ALL

SELECT
  'vital_signs' as type,
  vs.id,
  vs.patient_id,
  vs.recorded_by_id as user_id,
  su.name as user_name,
  vs.recorded_at as activity_date,
  CONCAT('Temperature: ', vs.temperature, '°C, HR: ', vs.heart_rate, ' bpm') as description
FROM vital_signs vs
JOIN system_users su ON vs.recorded_by_id = su.id

UNION ALL

SELECT
  'prescription' as type,
  pr.id,
  pr.patient_id,
  pr.doctor_id as user_id,
  su.name as user_name,
  pr.prescribed_at as activity_date,
  'New prescription' as description
FROM prescriptions pr
JOIN system_users su ON pr.doctor_id = su.id

UNION ALL

SELECT
  'exam' as type,
  ex.id,
  ex.patient_id,
  ex.requested_by_id as user_id,
  su.name as user_name,
  ex.requested_at as activity_date,
  CONCAT('Exam: ', ex.name) as description
FROM exams ex
JOIN system_users su ON ex.requested_by_id = su.id

ORDER BY activity_date DESC;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
