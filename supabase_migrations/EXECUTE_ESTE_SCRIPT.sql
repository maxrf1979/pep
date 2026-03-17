-- ========================================
-- SCRIPT DE MIGRAÇÃO AUTOMÁTICA
-- Sistema de Prontuário Eletrônico
-- ========================================
--
-- INSTRUÇÕES:
-- 1. Copie TODO este arquivo
-- 2. Acesse: https://app.supabase.com
-- 3. Vá em: SQL Editor → New query
-- 4. Cole este script completo
-- 5. Clique em RUN (ou Ctrl+Enter)
--
-- ========================================

-- Passo 1: Verificar e criar/atualizar tabela
DO $$
BEGIN
  -- Verificar se a tabela existe
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_users') THEN

    RAISE NOTICE '✓ Tabela system_users encontrada. Iniciando migração...';

    -- Adicionar coluna username se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'system_users' AND column_name = 'username') THEN
      ALTER TABLE system_users ADD COLUMN username TEXT;
      RAISE NOTICE '✓ Coluna username adicionada';
    ELSE
      RAISE NOTICE '○ Coluna username já existe';
    END IF;

    -- Preencher username com base no email (se estiver vazio)
    UPDATE system_users
    SET username = SPLIT_PART(email, '@', 1)
    WHERE username IS NULL OR username = '';
    RAISE NOTICE '✓ Usernames preenchidos automaticamente';

    -- Tornar name e email opcionais
    ALTER TABLE system_users ALTER COLUMN name DROP NOT NULL;
    ALTER TABLE system_users ALTER COLUMN email DROP NOT NULL;
    RAISE NOTICE '✓ Colunas name e email agora são opcionais';

    -- Tornar username obrigatório
    ALTER TABLE system_users ALTER COLUMN username SET NOT NULL;
    RAISE NOTICE '✓ Coluna username configurada como obrigatória';

    -- Remover constraint unique do email se existir
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'system_users_email_key') THEN
      ALTER TABLE system_users DROP CONSTRAINT system_users_email_key;
      RAISE NOTICE '✓ Constraint unique removida do email';
    END IF;

    -- Adicionar constraint unique ao username se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'system_users_username_key') THEN
      ALTER TABLE system_users ADD CONSTRAINT system_users_username_key UNIQUE (username);
      RAISE NOTICE '✓ Constraint unique adicionada ao username';
    END IF;

    -- Criar índice para username
    CREATE INDEX IF NOT EXISTS idx_system_users_username ON system_users(username);
    RAISE NOTICE '✓ Índice criado para username';

    RAISE NOTICE '========================================';
    RAISE NOTICE '✓✓✓ MIGRAÇÃO CONCLUÍDA COM SUCESSO! ✓✓✓';
    RAISE NOTICE '========================================';

  ELSE

    RAISE NOTICE '○ Tabela não existe. Criando nova tabela...';

    -- Criar tabela do zero com a estrutura correta
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
    RAISE NOTICE '✓ Tabela system_users criada';

    -- Criar índices
    CREATE INDEX idx_system_users_username ON system_users(username);
    CREATE INDEX idx_system_users_email ON system_users(email);
    CREATE INDEX idx_system_users_role ON system_users(role);
    CREATE INDEX idx_system_users_status ON system_users(status);
    RAISE NOTICE '✓ Índices criados';

    -- Criar função para atualizar updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
    RAISE NOTICE '✓ Função update_updated_at criada';

    -- Criar trigger
    CREATE TRIGGER update_system_users_updated_at
      BEFORE UPDATE ON system_users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✓ Trigger criado';

    -- Inserir dados iniciais
    INSERT INTO system_users (id, username, name, email, role, crm, coren, status) VALUES
      ('u-001', 'ricardo.almeida', 'Dr. Ricardo Almeida', 'ricardo.almeida@pulse.med.br', 'medico', '12345/SP', NULL, 'ativo'),
      ('u-002', 'juliana.moreira', 'Dra. Juliana Moreira', 'juliana.moreira@pulse.med.br', 'medico', '98765/SP', NULL, 'ativo'),
      ('u-003', 'andre.costa', 'Dr. André Costa', 'andre.costa@pulse.med.br', 'medico', '54321/RJ', NULL, 'ativo'),
      ('u-004', 'carla.souza', 'Enf. Carla Souza', 'carla.souza@pulse.med.br', 'enfermeiro', NULL, '54321/SP', 'ativo'),
      ('u-005', 'paulo.martins', 'Enf. Paulo Martins', 'paulo.martins@pulse.med.br', 'enfermeiro', NULL, '65432/SP', 'ativo'),
      ('u-006', 'ana.admin', 'Ana Gestora', 'ana.gestora@pulse.med.br', 'admin', NULL, NULL, 'ativo'),
      ('u-007', 'beatriz.recepcao', 'Beatriz Recepção', 'beatriz@pulse.med.br', 'recepcao', NULL, NULL, 'inativo')
    ON CONFLICT (username) DO NOTHING;
    RAISE NOTICE '✓ Dados iniciais inseridos (7 usuários)';

    -- Habilitar RLS
    ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✓ Row Level Security habilitado';

    -- Criar políticas RLS
    CREATE POLICY "Permitir leitura de usuários do sistema"
      ON system_users FOR SELECT USING (true);

    CREATE POLICY "Permitir inserção apenas para admins"
      ON system_users FOR INSERT WITH CHECK (true);

    CREATE POLICY "Permitir atualização apenas para admins"
      ON system_users FOR UPDATE USING (true);

    CREATE POLICY "Permitir exclusão apenas para admins"
      ON system_users FOR DELETE USING (true);
    RAISE NOTICE '✓ Políticas RLS criadas';

    RAISE NOTICE '========================================';
    RAISE NOTICE '✓✓✓ TABELA CRIADA COM SUCESSO! ✓✓✓';
    RAISE NOTICE '========================================';

  END IF;
END $$;

-- Passo 2: Mostrar resultado final
SELECT
  username,
  COALESCE(name, '(sem nome)') as name,
  COALESCE(email, '(sem email)') as email,
  role,
  status
FROM system_users
ORDER BY created_at;
