-- ========================================
-- CRIAR RELACIONAMENTO ENTRE PACIENTES E PROFISSIONAIS
-- ========================================

-- Criar tabela de equipe médica (relacionamento muitos-para-muitos)
CREATE TABLE IF NOT EXISTS patient_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES system_users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('medico_responsavel', 'medico_assistente', 'enfermeiro_responsavel', 'enfermeiro_assistente')),
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, user_id, role_type)
);

-- Índices
CREATE INDEX idx_patient_team_patient ON patient_team(patient_id);
CREATE INDEX idx_patient_team_user ON patient_team(user_id);
CREATE INDEX idx_patient_team_role ON patient_team(role_type);

-- Habilitar RLS
ALTER TABLE patient_team ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura da equipe"
  ON patient_team FOR SELECT USING (true);

CREATE POLICY "Permitir inserção na equipe"
  ON patient_team FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização da equipe"
  ON patient_team FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão da equipe"
  ON patient_team FOR DELETE USING (true);

-- Inserir equipes de exemplo
-- João Carlos da Silva (internado) - equipe completa
INSERT INTO patient_team (patient_id, user_id, role_type)
SELECT
  '123.456.789-00',
  id,
  CASE
    WHEN username = 'ricardo.almeida' THEN 'medico_responsavel'
    WHEN username = 'juliana.moreira' THEN 'medico_assistente'
    WHEN username = 'carla.souza' THEN 'enfermeiro_responsavel'
    WHEN username = 'paulo.martins' THEN 'enfermeiro_assistente'
  END
FROM system_users
WHERE username IN ('ricardo.almeida', 'juliana.moreira', 'carla.souza', 'paulo.martins')
ON CONFLICT DO NOTHING;

-- Max Rangel Formiga (ambulatorial) - médico responsável
INSERT INTO patient_team (patient_id, user_id, role_type)
SELECT '033.465.174-38', id, 'medico_responsavel'
FROM system_users
WHERE username = 'andre.costa'
ON CONFLICT DO NOTHING;

-- Teste Bug (ambulatorial) - médico responsável
INSERT INTO patient_team (patient_id, user_id, role_type)
SELECT '123.456.789-11', id, 'medico_responsavel'
FROM system_users
WHERE username = 'ricardo.almeida'
ON CONFLICT DO NOTHING;

-- Maria Aparecida Santos (ambulatorial)
INSERT INTO patient_team (patient_id, user_id, role_type)
SELECT '987.654.321-00', id, 'medico_responsavel'
FROM system_users
WHERE username = 'juliana.moreira'
ON CONFLICT DO NOTHING;

-- Pedro Henrique Oliveira (ambulatorial)
INSERT INTO patient_team (patient_id, user_id, role_type)
SELECT '456.789.123-00', id, 'medico_responsavel'
FROM system_users
WHERE username = 'andre.costa'
ON CONFLICT DO NOTHING;

-- Ana Beatriz Lima Ferreira (internado) - equipe completa
INSERT INTO patient_team (patient_id, user_id, role_type)
SELECT
  '321.654.987-00',
  id,
  CASE
    WHEN username = 'juliana.moreira' THEN 'medico_responsavel'
    WHEN username = 'andre.costa' THEN 'medico_assistente'
    WHEN username = 'paulo.martins' THEN 'enfermeiro_responsavel'
    WHEN username = 'carla.souza' THEN 'enfermeiro_assistente'
  END
FROM system_users
WHERE username IN ('juliana.moreira', 'andre.costa', 'paulo.martins', 'carla.souza')
ON CONFLICT DO NOTHING;

-- Carlos Eduardo Mendes (alta)
INSERT INTO patient_team (patient_id, user_id, role_type)
SELECT '654.321.987-00', id, 'medico_responsavel'
FROM system_users
WHERE username = 'ricardo.almeida'
ON CONFLICT DO NOTHING;

-- Fernanda Costa Ribeiro (ambulatorial)
INSERT INTO patient_team (patient_id, user_id, role_type)
SELECT '789.123.456-00', id, 'medico_responsavel'
FROM system_users
WHERE username = 'juliana.moreira'
ON CONFLICT DO NOTHING;

-- Verificar resultado
SELECT
  p.name as paciente,
  p.status,
  u.name as profissional,
  u.role as tipo_profissional,
  pt.role_type as funcao_na_equipe
FROM patient_team pt
JOIN patients p ON pt.patient_id = p.id
JOIN system_users u ON pt.user_id = u.id
ORDER BY p.name, pt.role_type;

-- Contar equipes por paciente
SELECT
  p.name as paciente,
  COUNT(pt.id) as total_profissionais
FROM patients p
LEFT JOIN patient_team pt ON p.id = pt.patient_id
GROUP BY p.id, p.name
ORDER BY total_profissionais DESC, p.name;
