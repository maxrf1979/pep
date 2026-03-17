-- Script de Migração: Adicionar campo username à tabela existente
-- Este script atualiza a tabela system_users para incluir o campo username

-- Passo 1: Adicionar coluna username (temporariamente nullable)
ALTER TABLE system_users
ADD COLUMN IF NOT EXISTS username TEXT;

-- Passo 2: Preencher username com valores existentes de email (removendo o domínio)
UPDATE system_users
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL;

-- Passo 3: Tornar as colunas name e email opcionais (nullable)
ALTER TABLE system_users
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN email DROP NOT NULL;

-- Passo 4: Tornar username obrigatório e único
ALTER TABLE system_users
ALTER COLUMN username SET NOT NULL;

-- Passo 5: Remover constraint unique do email (se existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'system_users_email_key'
  ) THEN
    ALTER TABLE system_users DROP CONSTRAINT system_users_email_key;
  END IF;
END $$;

-- Passo 6: Adicionar constraint unique para username
ALTER TABLE system_users
ADD CONSTRAINT system_users_username_key UNIQUE (username);

-- Passo 7: Criar índice para username (se não existir)
CREATE INDEX IF NOT EXISTS idx_system_users_username ON system_users(username);

-- Passo 8: Verificar resultado
SELECT id, username, name, email, role, status
FROM system_users
ORDER BY created_at;
