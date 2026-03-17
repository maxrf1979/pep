-- Script para verificar se os dados foram inseridos corretamente

-- 1. Verificar se a tabela existe
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'system_users';

-- 2. Ver estrutura da tabela
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'system_users'
ORDER BY ordinal_position;

-- 3. Contar total de registros
SELECT COUNT(*) as total_usuarios FROM system_users;

-- 4. Ver todos os dados
SELECT * FROM system_users ORDER BY created_at;
