# 🔄 Guia de Migração: Adicionar Campo Username

Este guia explica como atualizar a tabela `system_users` existente no Supabase para adicionar o campo `username`.

## 📋 O Que Esta Migração Faz

Esta migração irá:

1. ✅ Adicionar a coluna `username` à tabela existente
2. ✅ Preencher automaticamente `username` usando a parte antes do @ do email
3. ✅ Tornar os campos `name` e `email` opcionais
4. ✅ Tornar o campo `username` obrigatório e único
5. ✅ Remover a constraint unique do email
6. ✅ Criar índice para melhor performance

## 🚀 Como Executar a Migração

### Opção 1: Migração da Tabela Existente (RECOMENDADO)

Se você **JÁ TEM** a tabela `system_users` criada:

1. **Acesse o Supabase Dashboard**
   - Vá para https://app.supabase.com
   - Faça login e selecione o projeto: `yxilsouyhvyxpaidxecr`

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script de Migração**
   - Copie todo o conteúdo do arquivo `supabase_migrations/migrate_add_username.sql`
   - Cole no editor SQL
   - Clique em "Run" ou pressione Ctrl+Enter

4. **Verifique o Resultado**
   - O script mostrará todos os registros atualizados
   - Vá para "Table Editor" > "system_users" para conferir

### Opção 2: Criar Nova Tabela do Zero

Se você **NÃO TEM** a tabela criada ainda ou quer recomeçar:

1. **Delete a tabela antiga (se existir)**
   ```sql
   DROP TABLE IF EXISTS system_users CASCADE;
   ```

2. **Execute o script de criação**
   - Use o arquivo `supabase_migrations/create_system_users.sql`
   - Este criará a tabela já com a estrutura correta

## 📊 Estrutura Antes e Depois

### ❌ ANTES (Estrutura Antiga)
```
system_users
├── id (UUID, PK)
├── name (TEXT, NOT NULL)          ← Obrigatório
├── email (TEXT, NOT NULL, UNIQUE) ← Obrigatório e único
├── role (TEXT, NOT NULL)
├── crm (TEXT)
├── coren (TEXT)
├── status (TEXT, NOT NULL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### ✅ DEPOIS (Estrutura Nova)
```
system_users
├── id (UUID, PK)
├── username (TEXT, NOT NULL, UNIQUE) ← NOVO! Obrigatório e único
├── name (TEXT, nullable)             ← Agora opcional
├── email (TEXT, nullable)            ← Agora opcional (sem unique)
├── role (TEXT, NOT NULL)
├── crm (TEXT)
├── coren (TEXT)
├── status (TEXT, NOT NULL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔍 Exemplo de Transformação dos Dados

### Antes da Migração:
| id   | name              | email                           |
|------|-------------------|---------------------------------|
| u-01 | Dr. Ricardo       | ricardo.almeida@pulse.med.br    |
| u-02 | Dra. Juliana      | juliana.moreira@pulse.med.br    |

### Depois da Migração:
| id   | username         | name         | email                           |
|------|------------------|--------------|----------------------------------|
| u-01 | ricardo.almeida  | Dr. Ricardo  | ricardo.almeida@pulse.med.br    |
| u-02 | juliana.moreira  | Dra. Juliana | juliana.moreira@pulse.med.br    |

## ⚠️ Avisos Importantes

1. **Backup**: A migração é segura, mas faça backup se tiver dados importantes
2. **Downtime**: A migração é rápida (< 1 segundo para poucos registros)
3. **Usernames**: Serão gerados automaticamente a partir dos emails existentes
4. **Conflitos**: Se houver emails duplicados, a migração pode falhar

## 🧪 Testar Após Migração

Após executar a migração, teste:

1. ✅ Abra a aplicação
2. ✅ Vá para o menu "Administração"
3. ✅ Verifique se os usuários aparecem
4. ✅ Tente criar um novo usuário
5. ✅ Teste buscar por username

## 🆘 Problemas Comuns

### Erro: "column username already exists"
- A coluna já foi adicionada
- Pule para a Opção 2 ou verifique se a migração já foi executada

### Erro: "duplicate key value violates unique constraint"
- Há usernames duplicados
- Verifique e corrija manualmente os duplicados antes de adicionar a constraint

### Os dados não aparecem na aplicação
- Verifique se o arquivo `.env` está configurado corretamente
- Confirme que as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretas

## 📞 Próximos Passos

Após a migração bem-sucedida:
1. ✅ A aplicação já estará funcionando com o novo modelo
2. ✅ Você pode criar usuários com username flexível
3. ✅ Nome e email são opcionais
