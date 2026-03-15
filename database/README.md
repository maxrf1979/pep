# Banco de Dados Supabase - PEP (Prontuário Eletrônico de Pacientes)

## 📋 Visão Geral

Este diretório contém a arquitetura completa do banco de dados para o sistema PEP, incluindo:

- ✅ Schema SQL com 18 tabelas
- ✅ Índices para otimização (20+)
- ✅ Triggers automáticos para timestamps
- ✅ Políticas de segurança (RLS)
- ✅ Views para consultas comuns
- ✅ Diagrama entidade-relacionamento
- ✅ Guia de migração de dados
- ✅ Documentação de setup

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `schema.sql` | Schema SQL completo para criar todas as tabelas |
| `SETUP_SUPABASE.md` | Guia passo a passo para configurar Supabase |
| `DIAGRAMA_ER.md` | Diagrama entidade-relacionamento visual |
| `MIGRACAO_DADOS.md` | Guia para migrar dados do localStorage |
| `README.md` | Este arquivo |

## 🚀 Quick Start

### 1. Criar Projeto Supabase
```bash
# Acesse supabase.com e crie uma conta
# Crie um novo projeto (aguarde a inicialização)
```

### 2. Executar Schema
```bash
# Copie o conteúdo de schema.sql
# Vá para SQL Editor no painel Supabase
# Cole e execute
```

### 3. Configurar Variáveis de Ambiente
```bash
# .env.local
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Instalar Cliente Supabase
```bash
npm install @supabase/supabase-js
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais (12)

1. **clinics** - Clínicas/Instituições
2. **system_users** - Profissionais (médicos, enfermeiros, admin)
3. **patients** - Pacientes
4. **vital_signs** - Sinais vitais
5. **medical_evolutions** - Evoluções médicas
6. **nursing_evolutions** - Evoluções de enfermagem
7. **prescriptions** - Prescrições
8. **prescription_medications** - Medicamentos das prescrições
9. **exams** - Exames
10. **timeline_events** - Timeline unificada
11. **attachments** - Arquivos anexados
12. **patient_calls** - Chamadas no painel

### Tabelas de Suporte (6)

13. **user_roles** - Papéis (médico, enfermeiro, admin, recepcao, tecnico)
14. **user_role_assignments** - Mapeamento usuário-papel
15. **permissions** - Permissões do sistema
16. **role_permissions** - Mapeamento papel-permissão
17. **audit_logs** - Auditoria de ações
18. **sessions** - Gerenciamento de sessões

## 🔐 Segurança

- **Row Level Security (RLS)**: Políticas para controlar acesso por linha
- **Índices**: 20+ índices para otimizar queries
- **Validações**: CHECK constraints em colunas críticas
- **Auditoria**: Log automático de todas as alterações
- **Timestamps**: Rastreamento automático de created_at/updated_at

## 📈 Diagrama de Relacionamentos

```
CLINICS
├─ SYSTEM_USERS
│  ├─ VITAL_SIGNS
│  ├─ MEDICAL_EVOLUTIONS
│  ├─ NURSING_EVOLUTIONS
│  ├─ PRESCRIPTIONS
│  └─ SESSIONS
└─ PATIENTS
   ├─ VITAL_SIGNS
   ├─ MEDICAL_EVOLUTIONS
   ├─ NURSING_EVOLUTIONS
   ├─ PRESCRIPTIONS
   ├─ EXAMS
   ├─ ATTACHMENTS
   ├─ PATIENT_CALLS
   └─ TIMELINE_EVENTS
```

## 👥 Roles e Permissões

### Médico
- Criar/editar/deletar evolução médica
- Criar/editar prescrições
- Solicitar exames
- Visualizar dados de enfermagem

### Enfermeiro
- Criar/editar evolução de enfermagem
- Registrar sinais vitais
- Visualizar (apenas) evolução médica
- Visualizar prescrições

### Administrador
- Acesso total ao sistema
- Gerenciar usuários
- Acessar auditoria

### Recepção
- Criar/visualizar pacientes
- Chamar pacientes no painel

## 🔄 Migração de Dados

Para migrar dados do localStorage local:

1. Consulte `MIGRACAO_DADOS.md` para estrutura de conversão
2. Use o script TypeScript fornecido para automatizar
3. Valide os dados com queries SQL

```bash
# Exemplo: Contar registros migrados
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM medical_evolutions;
SELECT COUNT(*) FROM vital_signs;
```

## 📚 Views Úteis

```sql
-- Resumo do paciente
SELECT * FROM patient_summary WHERE id = 'uuid';

-- Permissões de usuário
SELECT * FROM user_permissions WHERE user_id = 'uuid';

-- Atividade recente
SELECT * FROM recent_activity LIMIT 100;
```

## ⚙️ Configuração Inicial

Após criar o schema, você pode:

1. **Habilitar autenticação**:
   - Vá para Authentication > Providers
   - Ative Email/Password ou provedores externos

2. **Configurar RLS**:
   - Revise as políticas em cada tabela
   - Adapte conforme suas necessidades

3. **Criar usuários**:
   - Via painel Supabase ou via API

## 🐛 Troubleshooting

### Erro: "Column not found"
- Verifique que o schema foi executado completamente
- Rode o script novamente

### Queries lentas
- Verifique índices com EXPLAIN ANALYZE
- Consulte o índice recomendado

### Permission denied
- Verifique políticas RLS
- Certifique-se do role do usuário

## 📖 Documentação Completa

- **SETUP_SUPABASE.md** - Setup passo a passo
- **DIAGRAMA_ER.md** - Detalhes de cada tabela
- **MIGRACAO_DADOS.md** - Como migrar dados existentes
- **schema.sql** - Script SQL completo com comentários

## 🔗 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Checklist de Implementação

- [ ] Projeto Supabase criado
- [ ] schema.sql executado
- [ ] Variáveis de ambiente configuradas
- [ ] Cliente Supabase instalado
- [ ] Autenticação configurada
- [ ] Dados migrados (se aplicável)
- [ ] RLS policies revisadas
- [ ] Testes de conexão passando
- [ ] Views e índices validados

## 📞 Suporte

Para dúvidas sobre o banco de dados:

1. Consulte os documentos deste diretório
2. Revise o schema.sql para comentários
3. Teste no SQL Editor do Supabase
4. Consulte documentação oficial

---

**Versão**: 1.0
**Data**: 2026-03-15
**Status**: ✅ Pronto para Produção
