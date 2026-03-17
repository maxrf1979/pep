# 🚀 COMO EXECUTAR A MIGRAÇÃO NO SUPABASE

## ⚡ 3 Passos Rápidos

### 1️⃣ **Copiar o Script**

Abra o arquivo e copie TODO o conteúdo:
```
📁 supabase_migrations/EXECUTE_ESTE_SCRIPT.sql
```

> 💡 **Dica**: Use Ctrl+A para selecionar tudo, depois Ctrl+C para copiar

---

### 2️⃣ **Acessar o Supabase**

1. Abra seu navegador
2. Vá para: **https://app.supabase.com**
3. Faça login
4. Selecione o projeto: **yxilsouyhvyxpaidxecr**

---

### 3️⃣ **Executar o Script**

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. **Cole** todo o script (Ctrl+V)
4. Clique no botão **"RUN"** (ou pressione Ctrl+Enter)

---

## ✅ Resultado Esperado

Após executar, você verá:

```
✓ Tabela system_users encontrada. Iniciando migração...
✓ Coluna username adicionada
✓ Usernames preenchidos automaticamente
✓ Colunas name e email agora são opcionais
✓ Coluna username configurada como obrigatória
✓ Constraint unique removida do email
✓ Constraint unique adicionada ao username
✓ Índice criado para username
========================================
✓✓✓ MIGRAÇÃO CONCLUÍDA COM SUCESSO! ✓✓✓
========================================

📊 USUÁRIOS CADASTRADOS:
========================================
username         | name                  | email                        | role        | status
-----------------|----------------------|------------------------------|-------------|--------
ricardo.almeida  | Dr. Ricardo Almeida  | ricardo.almeida@pulse.med.br | medico      | ativo
juliana.moreira  | Dra. Juliana Moreira | juliana.moreira@pulse.med.br | medico      | ativo
...
```

---

## 🎯 O Que Este Script Faz?

### Se a tabela **JÁ EXISTE**:
- ✅ Adiciona o campo `username`
- ✅ Preenche automaticamente com base nos emails
- ✅ Torna `name` e `email` opcionais
- ✅ Configura `username` como obrigatório e único

### Se a tabela **NÃO EXISTE**:
- ✅ Cria a tabela completa
- ✅ Insere 7 usuários de exemplo
- ✅ Configura todos os índices
- ✅ Habilita segurança (RLS)

---

## 🧪 Testar Depois

1. Abra a aplicação
2. Vá em **Administração**
3. Veja os usuários carregados
4. Tente criar um novo usuário
5. Teste buscar e editar

---

## 🆘 Problemas?

### Script não executa
- Certifique-se de copiar **TODO** o arquivo
- Verifique se está no projeto correto

### Erro de permissão
- Confirme que você é owner do projeto
- Tente fazer logout e login novamente

### Dados não aparecem na aplicação
- Verifique o arquivo `.env` na raiz do projeto
- Confirme as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

---

## 📞 Precisa de Ajuda?

Se tiver qualquer dúvida ou erro, me avise! Posso te ajudar a resolver.

---

**Pronto para executar? Basta seguir os 3 passos acima!** 🚀
