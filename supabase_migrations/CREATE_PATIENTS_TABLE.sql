-- ========================================
-- CRIAR TABELA DE PACIENTES
-- ========================================

-- Remover tabela antiga se existir
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Criar tabela de pacientes
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

-- Criar índices
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_name ON patients(name);

-- Inserir pacientes de exemplo (os mesmos que aparecem na lista)
INSERT INTO patients (id, name, cpf, birth_date, blood_type, allergies, last_visit, status, admission_date) VALUES
  ('123.456.789-00', 'João Carlos da Silva', '123.456.789-00', '1956-05-12', 'A+', ARRAY['Dipirona', 'Penicilina'], '2026-03-12T14:30:00', 'internado', '2026-03-10T08:00:00'),
  ('033.465.174-38', 'Max Rangel Formiga', '033.465.174-38', '1978-07-15', 'O+', ARRAY[]::TEXT[], '2026-03-16', 'ambulatorial', NULL),
  ('123.456.789-11', 'Teste Bug', '123.456.789-11', '1988-01-20', 'B+', ARRAY[]::TEXT[], '2026-03-16', 'ambulatorial', NULL),
  ('987.654.321-00', 'Maria Aparecida Santos', '987.654.321-00', '1940-02-28', 'O-', ARRAY[]::TEXT[], '2026-03-13', 'ambulatorial', NULL),
  ('456.789.123-00', 'Pedro Henrique Oliveira', '456.789.123-00', '1971-11-03', 'AB+', ARRAY['Ibuprofeno'], '2026-03-11', 'ambulatorial', NULL),
  ('321.654.987-00', 'Ana Beatriz Lima Ferreira', '321.654.987-00', '1993-09-17', 'A-', ARRAY['Sulfa', 'Latex'], '2026-03-13', 'internado', '2026-03-11T10:00:00'),
  ('654.321.987-00', 'Carlos Eduardo Mendes', '654.321.987-00', '1947-04-25', 'B-', ARRAY['AAS'], '2026-03-09', 'alta', NULL),
  ('789.123.456-00', 'Fernanda Costa Ribeiro', '789.123.456-00', '1989-12-08', 'O+', ARRAY[]::TEXT[], '2026-03-12', 'ambulatorial', NULL);

-- Criar tabela de eventos da timeline
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

-- Criar índices para timeline
CREATE INDEX idx_timeline_patient_id ON timeline_events(patient_id);
CREATE INDEX idx_timeline_type ON timeline_events(type);
CREATE INDEX idx_timeline_date ON timeline_events(date DESC);

-- Inserir alguns eventos de exemplo para João Carlos
INSERT INTO timeline_events (patient_id, type, date, title, summary, description, professional) VALUES
  ('123.456.789-00', 'evolucao_medica', '2026-03-12T14:30:00', 'Evolução Clínica', 'Paciente estável, sem queixas', 'Paciente evoluindo bem. Sinais vitais estáveis. Mantida conduta.', 'Dr. Ricardo Almeida - CRM 12345/SP'),
  ('123.456.789-00', 'sinais_vitais', '2026-03-12T08:00:00', 'Aferição Matinal', 'PA: 120/80 mmHg, FC: 72 bpm, Temp: 36.5°C', NULL, 'Enf. Carla Souza - COREN 54321/SP'),
  ('123.456.789-00', 'prescricao', '2026-03-12T15:00:00', 'Prescrição Médica', 'Paracetamol 750mg 8/8h', 'Dipirona 500mg se dor. Omeprazol 20mg em jejum.', 'Dr. Ricardo Almeida - CRM 12345/SP');

-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para patients
CREATE POLICY "Permitir leitura de pacientes"
  ON patients FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de pacientes"
  ON patients FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de pacientes"
  ON patients FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de pacientes"
  ON patients FOR DELETE USING (true);

-- Políticas RLS para timeline_events
CREATE POLICY "Permitir leitura de eventos"
  ON timeline_events FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de eventos"
  ON timeline_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de eventos"
  ON timeline_events FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de eventos"
  ON timeline_events FOR DELETE USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_events_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verificar resultado
SELECT 'Pacientes criados:' as info, COUNT(*) as total FROM patients;
SELECT * FROM patients ORDER BY name;
