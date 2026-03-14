# 🧪 Testes de Validação - Sistema RBAC ENFERMEIRO

## 📋 Objetivo

Validar que o sistema RBAC está funcionando corretamente e que enfermeiros NÃO podem acessar funcionalidades médicas.

## 🔐 Dados de Teste

### Usuários Pré-configurados
Acesse Admin → Gerenciar Usuários para criar:

```
MÉDICO:
- Email: medico@test.com
- Login: medico.test
- Senha: admin123
- Papéis: [Médico]
- CRM: 12345/SP

ENFERMEIRO:
- Email: enfermeiro@test.com
- Login: enfermeiro.test
- Senha: admin123
- Papéis: [Enfermeiro]
- COREN: 54321/SP

ADMIN:
- Email: admin@test.com
- Login: admin.test
- Senha: admin123
- Papéis: [Admin]
```

## 🧪 Teste 1: Login e Identificação de Perfil

**Objetivo:** Verificar que sessão registra corretamente o perfil

**Passos:**
1. Abra o navegador → DevTools (F12)
2. Abra Application → Local Storage
3. Faça logout (se necessário)
4. Login com: `medico@test.com` / `admin123`
5. Verifique `localStorage.pulse-auth-session`

**Esperado:**
```json
{
  "id": "...",
  "name": "Dr. Médico",
  "email": "medico@test.com",
  "role": "medico",
  "crm": "12345/SP",
  "lastLogin": "2026-03-14T14:30:00.000Z"
}
```

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 2: Enfermeiro - Aba "Evolução Médica" Não Aparece

**Objetivo:** Verificar que enfermeiros NÃO veem a aba de evolução médica

**Passos:**
1. Faça logout
2. Login como ENFERMEIRO: `enfermeiro@test.com` / `admin123`
3. Vá para Prontuários
4. Clique em qualquer paciente (ex: João Carlos da Silva)
5. Observe as abas de filtro

**Esperado:**
- Abas visíveis: [Todos] [Evolução Enfermagem] [Sinais Vitais] [Prescrição] [Exames]
- Aba **NÃO** visível: [Evolução Médica]

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 3: Médico - Aba "Evolução Médica" Aparece

**Objetivo:** Verificar que médicos VÊM a aba de evolução médica

**Passos:**
1. Faça logout
2. Login como MÉDICO: `medico@test.com` / `admin123`
3. Vá para Prontuários
4. Clique em qualquer paciente
5. Observe as abas de filtro

**Esperado:**
- Abas visíveis: [Todos] [Evolução Médica] [Evolução Enfermagem] [Sinais Vitais] [Prescrição] [Exames]
- Aba **É** visível: [Evolução Médica]

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 4: Enfermeiro - Botão "Evolução Médica" Desabilitado

**Objetivo:** Verificar que botão de ação rápida está desabilitado

**Passos:**
1. Logado como ENFERMEIRO
2. Abra prontuário de paciente
3. Observe a sidebar direita "Ações Rápidas"
4. Identifique o botão "Evolução Médica"

**Esperado:**
- Botão aparece com opacidade reduzida (50%)
- Botão não é clicável
- Hover não mostra efeito visual
- Título do botão mostra: "Restrito para enfermeiro"

**Teste de Clique:**
```javascript
// No DevTools console
document.querySelectorAll('button')[N].disabled // Deve ser true
document.querySelectorAll('button')[N].title // Deve conter "Restrito"
```

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 5: Médico - Botão "Evolução Médica" Habilitado

**Objetivo:** Verificar que médico pode clicar no botão

**Passos:**
1. Logado como MÉDICO
2. Abra prontuário de paciente
3. Observe a sidebar direita "Ações Rápidas"
4. Identifique o botão "Evolução Médica"

**Esperado:**
- Botão aparece com opacidade normal (100%)
- Botão é clicável (cursor muda para pointer)
- Hover mostra efeito visual (bg-muted/50)
- Título do botão está vazio

**Teste de Clique:**
```javascript
// No DevTools console
document.querySelectorAll('button')[N].disabled // Deve ser false
```

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 6: Enfermeiro Tenta Criar Evolução Médica (Dialog Bloqueado)

**Objetivo:** Verificar que dialog se abre e logo nega acesso

**Passos:**
1. Logado como ENFERMEIRO
2. Abra prontuário
3. Tente clicar em "Evolução Médica" (mesmo que desabilitado)
   - Ou abra DevTools e execute:
   ```javascript
   document.querySelectorAll('button')[/* índice do botão */].click()
   ```

**Esperado:**
- Dialog abre mostrando: "Acesso Não Autorizado"
- Mensagem: "Apenas MÉDICOS podem criar evolução médica..."
- Dialog fecha automaticamente após ~2 segundos
- Toast exibe: "Acesso não autorizado para este perfil de usuário."

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 7: Médico Abre Dialog de Evolução Médica (Permitido)

**Objetivo:** Verificar que médico consegue abrir e usar o dialog

**Passos:**
1. Logado como MÉDICO
2. Abra prontuário
3. Clique em "Evolução Médica"

**Esperado:**
- Dialog abre com título: "Nova Evolução Médica"
- Campos aparecem: Paciente, Título, Resumo, Evolução Completa
- Botão "Salvar Evolução" está habilitado
- Pode preencher os campos e salvar

**Teste de Preenchimento:**
1. Preencha o formulário:
   - Paciente: João Carlos da Silva (auto-selecionado)
   - Título: "Avaliação Inicial"
   - Resumo: "Paciente apresenta melhora"
   - Evolução: "Descrição completa..."
2. Clique "Salvar Evolução"

**Esperado:**
- Dialog fecha
- Toast: "Evolução Médica adicionado com sucesso."
- Novo registro aparece na timeline
- Professional preenchido: "Dr(a). [Nome do Médico] — CRM 12345/SP"

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 8: Enfermeiro Abre Dialog de Evolução Enfermagem (Permitido)

**Objetivo:** Verificar que enfermeiro consegue criar sua própria evolução

**Passos:**
1. Logado como ENFERMEIRO
2. Abra prontuário
3. Clique em "Evolução Enferm." (deve estar habilitado)
4. Dialog abre

**Esperado:**
- Dialog abre com título: "Nova Evolução de Enfermagem"
- Pode preencher formulário normalmente
- Botão "Salvar Evolução" está habilitado

**Teste de Preenchimento:**
1. Preencha:
   - Paciente: João Carlos da Silva
   - Título: "Higiene e Conforto"
   - Resumo: "Realizado banho no leito"
   - Evolução: "Paciente confortável após higiene..."
2. Clique "Salvar Evolução"

**Esperado:**
- Dialog fecha
- Toast: "Evolução de Enfermagem adicionado com sucesso."
- Novo registro na timeline
- Professional preenchido: "Enf. [Nome do Enfermeiro] — COREN 54321/SP"

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 9: Visualização de Evolução Médica por Enfermeiro (Read-Only)

**Objetivo:** Verificar que enfermeiro pode VER mas NÃO pode EDITAR evolução médica

**Passos:**
1. Logado como ENFERMEIRO
2. Abra prontuário com evolução médica já criada
3. Procure a evolução médica na timeline

**Esperado:**
- Evolução médica está **visível** na timeline
- Card mostra: tipo, data, resumo, profissional
- Botão "Ver detalhes" funciona (if presente)
- **NÃO há botões** de editar ou deletar
- **NÃO há opção** de clicar para editar

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 10: Admin Vê Todas as Abas

**Objetivo:** Verificar que admin tem acesso completo

**Passos:**
1. Faça logout
2. Login como ADMIN: `admin@admin.com` / `admin123`
   - OU crie um usuário admin e login
3. Vá para prontuário

**Esperado:**
- Todas as abas aparecem: [Todos] [Evolução Médica] [Evolução Enfermagem] [Sinais Vitais] [Prescrição] [Exames]
- Todos os botões de ação rápida estão habilitados
- Pode clicar em qualquer um deles

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 11: Verificação do Console (Sem Erros)

**Objetivo:** Garantir que não há erros JavaScript

**Passos:**
1. Abra DevTools (F12) → Console
2. Login e navegue pelo prontuário de diferentes perfis
3. Abra/feche dialogs
4. Clique em botões

**Esperado:**
- **Nenhuma mensagem de erro** (vermelho)
- Warnings são aceitáveis
- Mensagens info/log são normais

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 12: Sinais Vitais - Todos os Perfis Podem Registrar

**Objetivo:** Verificar que funcionalidade comum está disponível

**Passos:**
1. Login como ENFERMEIRO
2. Abra prontuário
3. Clique em "Sinais Vitais"

**Esperado:**
- Dialog abre normalmente
- Pode preencher e salvar

**Teste com Outros Perfis:**
- Médico: ✅ Pode registrar
- Enfermeiro: ✅ Pode registrar
- Admin: ✅ Pode registrar
- Recepção: ❌ Deve estar desabilitado

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 13: Prescrição - Apenas Médico Pode Criar

**Objetivo:** Validar restrição de prescrição

**Passos:**
1. Login como ENFERMEIRO
2. Abra prontuário
3. Observe botão "Prescrever"

**Esperado:**
- Botão está **DESABILITADO** (opacidade 50%, não clicável)
- Título: "Restrito para enfermeiro"

**Com Médico:**
1. Login como MÉDICO
2. Abra prontuário
3. Clique "Prescrever"

**Esperado:**
- Dialog abre
- Pode criar prescrição

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 14: Exames - Apenas Médico Pode Solicitar

**Objetivo:** Validar restrição de exame

**Passos:**
1. Login como ENFERMEIRO
2. Abra prontuário
3. Observe botão "Solicitar Exame"

**Esperado:**
- Botão está **DESABILITADO**

**Com Médico:**
- Botão está **HABILITADO**
- Dialog abre normalmente

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 🧪 Teste 15: Filtro de Timeline - Respeitando Permissões

**Objetivo:** Verificar que clique em aba restrita é ignorado

**Passos:**
1. Login como ENFERMEIRO
2. Abra prontuário
3. Clique em "Todos" → funciona
4. Tente clicar em "Evolução Médica" (não aparece)
   - Se conseg via DevTools: `document.querySelector('[id="evolucao_medica"]').click()`

**Esperado:**
- Clique não tem efeito (aba não existe no DOM)
- Timeline continua mostrando "Todos"
- Nenhum erro no console

**Resultado:** ✅ PASSOU / ❌ FALHOU

---

## 📊 Relatório de Testes

### Sumário
| Teste | Status | Notas |
|-------|--------|-------|
| 1. Login/Identificação | ✅/❌ | |
| 2. Aba Evolução Médica Enfermeiro | ✅/❌ | |
| 3. Aba Evolução Médica Médico | ✅/❌ | |
| 4. Botão Desabilitado Enfermeiro | ✅/❌ | |
| 5. Botão Habilitado Médico | ✅/❌ | |
| 6. Dialog Bloqueado Enfermeiro | ✅/❌ | |
| 7. Dialog Permitido Médico | ✅/❌ | |
| 8. Evolução Enfermagem OK | ✅/❌ | |
| 9. Read-Only Evolução Médica | ✅/❌ | |
| 10. Admin Acesso Completo | ✅/❌ | |
| 11. Sem Erros Console | ✅/❌ | |
| 12. Sinais Vitais Todos | ✅/❌ | |
| 13. Prescrição Restrita | ✅/❌ | |
| 14. Exame Restrito | ✅/❌ | |
| 15. Filtro Respeitando RBAC | ✅/❌ | |

### Resultado Final
- **Testes Passados:** ___ / 15
- **Testes Falhados:** ___ / 15
- **Taxa de Sucesso:** ___%
- **Status:** ✅ APROVADO / ⚠️ COM PROBLEMAS / ❌ REPROVADO

---

## 🐛 Se Algum Teste Falhar

### Checklist de Debug

1. **Verificar localStorage**
   ```javascript
   // DevTools Console
   console.log(JSON.parse(localStorage.getItem("pulse-auth-session")))
   console.log(JSON.parse(localStorage.getItem("systemUsers")))
   ```

2. **Verificar role do usuário**
   ```javascript
   const session = JSON.parse(localStorage.getItem("pulse-auth-session"))
   console.log(session.role) // Deve ser "enfermeiro" ou "medico"
   ```

3. **Verificar hooks**
   ```javascript
   // Abra DevTools, vá para Components (React DevTools se tiver)
   // Verifique se usePermissions() retorna funções corretas
   ```

4. **Limpar cache**
   ```
   Ctrl+Shift+Delete (ou Cmd+Shift+Delete no Mac)
   → Selecione "Cookies and other site data"
   → Clique "Clear data"
   ```

5. **Verificar archivos modificados**
   - NovaEvolucaoDialog.tsx
   - Prontuario.tsx
   - usePermissions.ts
   - rbac-permissions.ts

---

## ✅ Checklist Final

- [ ] Todos os 15 testes executados
- [ ] Todos os testes passaram
- [ ] Nenhum erro no console
- [ ] Interface adaptada por role
- [ ] Permissões verificadas em múltiplas camadas
- [ ] Validação de nomes de profissional
- [ ] Sistema RBAC aprovado para produção

---

**Versão:** 1.0
**Data:** 14 de Março de 2026
**Responsável:** _________________
**Data de Testes:** _________________
