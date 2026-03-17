# Instruções para Configurar a Tabela system_users no Supabase

## Passos para executar a migração:

1. **Acesse o Supabase Dashboard**
   - Vá para https://app.supabase.com
   - Faça login na sua conta
   - Selecione o projeto: `yxilsouyhvyxpaidxecr`

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query" para criar uma nova consulta

3. **Execute o Script SQL**
   - Copie todo o conteúdo do arquivo `supabase_migrations/create_system_users.sql`
   - Cole no editor SQL
   - Clique em "Run" ou pressione Ctrl+Enter para executar

4. **Verifique a Criação**
   - Vá para "Table Editor" no menu lateral
   - Você deverá ver a tabela `system_users` listada
   - Clique nela para ver os dados iniciais (7 usuários)

## O que o script faz:

1. Cria a tabela `system_users` com os seguintes campos:
   - `id`: UUID (chave primária)
   - `username`: Nome de usuário único (obrigatório) - **pode ser um email ou nome simples**
   - `name`: Nome completo do usuário (opcional)
   - `email`: E-mail do usuário (opcional)
   - `role`: Perfil (medico, enfermeiro, admin, recepcao)
   - `crm`: Número do CRM (para médicos)
   - `coren`: Número do COREN (para enfermeiros)
   - `status`: Status (ativo ou inativo)
   - `created_at`: Data de criação
   - `updated_at`: Data de atualização

2. Cria índices para melhorar a performance de buscas

3. Cria um trigger para atualizar automaticamente o campo `updated_at`

4. Insere 7 usuários iniciais de exemplo

5. Habilita Row Level Security (RLS) com políticas de acesso

## Verificação de Funcionamento:

Após executar o script, a aplicação irá:
- ✅ Carregar os usuários automaticamente do Supabase
- ✅ Permitir criar novos usuários com username flexível (email ou nome)
- ✅ Nome completo e email são opcionais
- ✅ Permitir atualizar o status (ativo/inativo)
- ✅ Permitir remover usuários
- ✅ Validar usernames duplicados
- ✅ Buscar por username, nome ou email

## Problemas Comuns:

### Erro "relation already exists"
Se você receber este erro, significa que a tabela já foi criada. Você pode:
- Deletar a tabela e executar novamente, ou
- Pular a criação da tabela e executar apenas as INSERTs

### Erro de permissão
Certifique-se de que você está autenticado como owner do projeto no Supabase.
