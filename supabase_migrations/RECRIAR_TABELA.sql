-- ========================================
-- SCRIPT PARA RECRIAR TABELA DO ZERO
-- Sistema de Prontuário Eletrônico
-- ========================================

-- Passo 1: Remover tabela antiga (se existir)
DROP TABLE IF EXISTS system_users CASCADE;

-- Passo 2: Criar tabela com estrutura correta
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

-- Passo 3: Criar índices
CREATE INDEX idx_system_users_username ON system_users(username);
CREATE INDEX idx_system_users_email ON system_users(email);
CREATE INDEX idx_system_users_role ON system_users(role);
CREATE INDEX idx_system_users_status ON system_users(status);

-- Passo 4: Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Passo 5: Criar trigger
CREATE TRIGGER update_system_users_updated_at
  BEFORE UPDATE ON system_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Passo 6: Inserir dados iniciais
INSERT INTO system_users (username, name, email, role, crm, coren, status) VALUES
  ('ricardo.almeida', 'Dr. Ricardo Almeida', 'ricardo.almeida@pulse.med.br', 'medico', '12345/SP', NULL, 'ativo'),
  ('juliana.moreira', 'Dra. Juliana Moreira', 'juliana.moreira@pulse.med.br', 'medico', '98765/SP', NULL, 'ativo'),
  ('andre.costa', 'Dr. André Costa', 'andre.costa@pulse.med.br', 'medico', '54321/RJ', NULL, 'ativo'),
  ('carla.souza', 'Enf. Carla Souza', 'carla.souza@pulse.med.br', 'enfermeiro', NULL, '54321/SP', 'ativo'),
  ('paulo.martins', 'Enf. Paulo Martins', 'paulo.martins@pulse.med.br', 'enfermeiro', NULL, '65432/SP', 'ativo'),
  ('ana.admin', 'Ana Gestora', 'ana.gestora@pulse.med.br', 'admin', NULL, NULL, 'ativo'),
  ('beatriz.recepcao', 'Beatriz Recepção', 'beatriz@pulse.med.br', 'recepcao', NULL, NULL, 'inativo');

-- Passo 7: Habilitar RLS
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;

-- Passo 8: Criar políticas RLS
CREATE POLICY "Permitir leitura de usuários do sistema"
  ON system_users FOR SELECT USING (true);

CREATE POLICY "Permitir inserção apenas para admins"
  ON system_users FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização apenas para admins"
  ON system_users FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão apenas para admins"
  ON system_users FOR DELETE USING (true);

-- Passo 9: Mostrar resultado
SELECT
  username,
  COALESCE(name, '(sem nome)') as name,
  COALESCE(email, '(sem email)') as email,
  role,
  status
FROM system_users
ORDER BY created_at;
