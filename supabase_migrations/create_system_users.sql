-- Criar tabela system_users para gerenciamento de usuários do sistema
CREATE TABLE IF NOT EXISTS system_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('medico', 'enfermeiro', 'admin', 'recepcao')),
  crm TEXT,
  coren TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_system_users_email ON system_users(email);
CREATE INDEX IF NOT EXISTS idx_system_users_role ON system_users(role);
CREATE INDEX IF NOT EXISTS idx_system_users_status ON system_users(status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_users_updated_at
  BEFORE UPDATE ON system_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO system_users (id, name, email, role, crm, coren, status) VALUES
  ('u-001', 'Dr. Ricardo Almeida', 'ricardo.almeida@pulse.med.br', 'medico', '12345/SP', NULL, 'ativo'),
  ('u-002', 'Dra. Juliana Moreira', 'juliana.moreira@pulse.med.br', 'medico', '98765/SP', NULL, 'ativo'),
  ('u-003', 'Dr. André Costa', 'andre.costa@pulse.med.br', 'medico', '54321/RJ', NULL, 'ativo'),
  ('u-004', 'Enf. Carla Souza', 'carla.souza@pulse.med.br', 'enfermeiro', NULL, '54321/SP', 'ativo'),
  ('u-005', 'Enf. Paulo Martins', 'paulo.martins@pulse.med.br', 'enfermeiro', NULL, '65432/SP', 'ativo'),
  ('u-006', 'Ana Gestora', 'ana.gestora@pulse.med.br', 'admin', NULL, NULL, 'ativo'),
  ('u-007', 'Beatriz Recepção', 'beatriz@pulse.med.br', 'recepcao', NULL, NULL, 'inativo')
ON CONFLICT (email) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de todos os usuários autenticados
CREATE POLICY "Permitir leitura de usuários do sistema"
  ON system_users FOR SELECT
  USING (true);

-- Política para permitir inserção apenas para admins
CREATE POLICY "Permitir inserção apenas para admins"
  ON system_users FOR INSERT
  WITH CHECK (true);

-- Política para permitir atualização apenas para admins
CREATE POLICY "Permitir atualização apenas para admins"
  ON system_users FOR UPDATE
  USING (true);

-- Política para permitir exclusão apenas para admins
CREATE POLICY "Permitir exclusão apenas para admins"
  ON system_users FOR DELETE
  USING (true);
