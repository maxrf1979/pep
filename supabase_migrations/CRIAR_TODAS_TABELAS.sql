-- ========================================
-- CRIAR TODAS AS TABELAS DO SISTEMA
-- Script completo e definitivo
-- ========================================

-- Limpar tudo primeiro
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS system_users CASCADE;

-- ====================
-- 1. TABELA DE USUÁRIOS DO SISTEMA
-- ====================
CREATE TABLE system_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('medico', 'enfermeiro', 'admin', 'recepcao')),
  crm TEXT,
  coren TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para system_users
CREATE INDEX idx_system_users_username ON system_users(username);
CREATE INDEX idx_system_users_email ON system_users(email);
CREATE INDEX idx_system_users_role ON system_users(role);
CREATE INDEX idx_system_users_status ON system_users(status);

-- Dados iniciais de usuários
INSERT INTO system_users (username, name, email, role, crm, coren, status) VALUES
  ('ricardo.almeida', 'Dr. Ricardo Almeida', 'ricardo.almeida@pulse.med.br', 'medico', '12345/SP', NULL, 'ativo'),
  ('juliana.moreira', 'Dra. Juliana Moreira', 'juliana.moreira@pulse.med.br', 'medico', '98765/SP', NULL, 'ativo'),
  ('andre.costa', 'Dr. André Costa', 'andre.costa@pulse.med.br', 'medico', '54321/RJ', NULL, 'ativo'),
  ('carla.souza', 'Enf. Carla Souza', 'carla.souza@pulse.med.br', 'enfermeiro', NULL, '54321/SP', 'ativo'),
  ('paulo.martins', 'Enf. Paulo Martins', 'paulo.martins@pulse.med.br', 'enfermeiro', NULL, '65432/SP', 'ativo'),
  ('ana.admin', 'Ana Gestora', 'ana.gestora@pulse.med.br', 'admin', NULL, NULL, 'ativo'),
  ('beatriz.recepcao', 'Beatriz Recepção', 'beatriz@pulse.med.br', 'recepcao', NULL, NULL, 'inativo');

-- ====================
-- 2. TABELA DE PACIENTES
-- ====================
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  birth_date TEXT,
  blood_type TEXT,
  allergies TEXT[],
  last_visit TEXT,
  status TEXT NOT NULL CHECK (status IN ('internado', 'ambulatorial', 'alta', 'obito')),
  admission_date TEXT,
  death_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para patients
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_name ON patients(name);

-- Dados iniciais de pacientes
INSERT INTO patients (id, name, cpf, birth_date, blood_type, allergies, last_visit, status, admission_date) VALUES
  ('123.456.789-00', 'João Carlos da Silva', '123.456.789-00', '1956-05-12', 'A+', ARRAY['Dipirona', 'Penicilina'], '2026-03-12T14:30:00', 'internado', '2026-03-10T08:00:00'),
  ('033.465.174-38', 'Max Rangel Formiga', '033.465.174-38', '1978-07-15', 'O+', ARRAY[]::TEXT[], '2026-03-16', 'ambulatorial', NULL),
  ('123.456.789-11', 'Teste Bug', '123.456.789-11', '1988-01-20', 'B+', ARRAY[]::TEXT[], '2026-03-16', 'ambulatorial', NULL),
  ('987.654.321-00', 'Maria Aparecida Santos', '987.654.321-00', '1940-02-28', 'O-', ARRAY[]::TEXT[], '2026-03-13', 'ambulatorial', NULL),
  ('456.789.123-00', 'Pedro Henrique Oliveira', '456.789.123-00', '1971-11-03', 'AB+', ARRAY['Ibuprofeno'], '2026-03-11', 'ambulatorial', NULL),
  ('321.654.987-00', 'Ana Beatriz Lima Ferreira', '321.654.987-00', '1993-09-17', 'A-', ARRAY['Sulfa', 'Latex'], '2026-03-13', 'internado', '2026-03-11T10:00:00'),
  ('654.321.987-00', 'Carlos Eduardo Mendes', '654.321.987-00', '1947-04-25', 'B-', ARRAY['AAS'], '2026-03-09', 'alta', NULL),
  ('789.123.456-00', 'Fernanda Costa Ribeiro', '789.123.456-00', '1989-12-08', 'O+', ARRAY[]::TEXT[], '2026-03-12', 'ambulatorial', NULL);

-- ====================
-- 3. TABELA DE EVENTOS DA TIMELINE
-- ====================
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('evolucao_medica', 'evolucao_enfermagem', 'sinais_vitais', 'prescricao', 'exame', 'anexo', 'atestado')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  file_data TEXT,
  professional TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para timeline_events
CREATE INDEX idx_timeline_patient_id ON timeline_events(patient_id);
CREATE INDEX idx_timeline_type ON timeline_events(type);
CREATE INDEX idx_timeline_date ON timeline_events(date DESC);

-- Dados de exemplo para timeline
INSERT INTO timeline_events (patient_id, type, date, title, summary, description, professional) VALUES
  ('123.456.789-00', 'evolucao_medica', '2026-03-12T14:30:00', 'Evolução Clínica', 'Paciente estável, sem queixas', 'Paciente evoluindo bem. Sinais vitais estáveis. Mantida conduta.', 'Dr. Ricardo Almeida - CRM 12345/SP'),
  ('123.456.789-00', 'sinais_vitais', '2026-03-12T08:00:00', 'Aferição Matinal', 'PA: 120/80 mmHg, FC: 72 bpm, Temp: 36.5°C', NULL, 'Enf. Carla Souza - COREN 54321/SP'),
  ('123.456.789-00', 'prescricao', '2026-03-12T15:00:00', 'Prescrição Médica', 'Paracetamol 750mg 8/8h', 'Dipirona 500mg se dor. Omeprazol 20mg em jejum.', 'Dr. Ricardo Almeida - CRM 12345/SP');

-- ====================
-- 4. FUNÇÃO PARA UPDATED_AT
-- ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 5. TRIGGERS
-- ====================
CREATE TRIGGER update_system_users_updated_at
  BEFORE UPDATE ON system_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_events_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- 6. ROW LEVEL SECURITY (RLS)
-- ====================
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Políticas para system_users
CREATE POLICY "Permitir leitura de usuários do sistema"
  ON system_users FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de usuários"
  ON system_users FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de usuários"
  ON system_users FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de usuários"
  ON system_users FOR DELETE USING (true);

-- Políticas para patients
CREATE POLICY "Permitir leitura de pacientes"
  ON patients FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de pacientes"
  ON patients FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de pacientes"
  ON patients FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de pacientes"
  ON patients FOR DELETE USING (true);

-- Políticas para timeline_events
CREATE POLICY "Permitir leitura de eventos"
  ON timeline_events FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de eventos"
  ON timeline_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de eventos"
  ON timeline_events FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de eventos"
  ON timeline_events FOR DELETE USING (true);

-- ====================
-- 7. VERIFICAÇÃO FINAL
-- ====================
SELECT 'system_users' as tabela, COUNT(*) as registros FROM system_users
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'timeline_events', COUNT(*) FROM timeline_events;

-- Mostrar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
