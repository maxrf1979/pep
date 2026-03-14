const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, BorderStyle, convertInchesToTwip, VerticalAlign, AlignmentType, PageBreak } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // Capa
      new Paragraph({
        text: 'PULSE PEP',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        thematicBreak: false,
        run: new TextRun({
          bold: true,
          size: 52,
          color: '1B66E8'
        })
      }),
      new Paragraph({
        text: 'Sistema de Gerenciamento Eletrônico de Prontuário',
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        run: new TextRun({
          size: 28,
          italics: true,
          color: '666666'
        })
      }),
      new Paragraph({
        text: 'Resumo de Funcionalidades',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        run: new TextRun({
          size: 24,
          bold: true
        })
      }),
      new Paragraph({
        text: `Data: ${new Date().toLocaleDateString('pt-BR')}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
        run: new TextRun({
          size: 20,
          color: '999999'
        })
      }),

      new PageBreak(),

      // Introdução
      new Paragraph({
        text: '1. Visão Geral do Sistema',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'O Pulse PEP é um sistema completo e moderno de Gerenciamento Eletrônico de Prontuário (PEP) desenvolvido para otimizar o fluxo de informações clínicas em ambientes hospitalares e clínicos. O sistema oferece funcionalidades avançadas para gerenciamento de pacientes, registros clínicos, prescrições, exames e sinais vitais, com controle de acesso baseado em papéis e persistência de dados.',
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
        run: new TextRun({ size: 22 })
      }),

      // Dashboard
      new Paragraph({
        text: '2. Dashboard (Página Inicial)',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'A página inicial fornece uma visão geral do sistema em tempo real com os seguintes elementos:',
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({
        text: '• KPIs em tempo real: Pacientes Ativos, Atendimentos do dia, Novas prescrições, Alertas críticos',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Gráfico de fluxo de atendimentos: Volume de pacientes dos últimos 7 dias',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Ações rápidas: Acesso direto para criar novo paciente, evolução, sinais vitais e prescrições',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Monitoramento de pacientes: Tabela com últimas interações, status clínico e alergias',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Relógio e data em tempo real com saudação personalizada (Bom dia, Boa tarde, Boa noite)',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      // Pacientes
      new Paragraph({
        text: '3. Gerenciamento de Pacientes',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'Módulo completo para cadastro e gerenciamento de dados de pacientes.',
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({
        text: 'Dados do Cadastro:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Nome completo • Data de nascimento • Sexo • CPF • Cartão SUS • Alergias • Comorbidades • Contato de emergência',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Funcionalidades:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Cadastro de novos pacientes com validação de dados',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Filtro por status (Internado, Ambulatorial, Alta, Óbito)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Busca avançada: Por nome, CPF ou cartão SUS',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Persistência de dados em localStorage',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Exibição dinâmica do total de pacientes cadastrados',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      // Prontuários
      new Paragraph({
        text: '4. Prontuários (Registros Clínicos)',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'Sistema integrado de histórico clínico completo do paciente com timeline interativa.',
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({
        text: 'Tipos de Registros:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Evoluções médicas • Evoluções de enfermagem • Sinais vitais • Prescrições • Solicitações de exames • Anexos/documentos',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Funcionalidades:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Timeline cronológica de todos os registros clínicos',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Múltiplas opções de entrada de dados via diálogos especializados',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Filtro por tipo de registro',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Persistência automática em localStorage',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      // Sinais Vitais
      new Paragraph({
        text: '5. Sinais Vitais',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'Módulo especializado para registro e monitoramento de parâmetros clínicos vitais.',
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({
        text: 'Parâmetros Registrados:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Temperatura (°C) • Frequência Cardíaca (bpm) • Pressão Arterial (sistólica/diastólica) • Frequência Respiratória (irpm) • Saturação de Oxigênio (%) • Peso (kg) • Altura (cm)',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Funcionalidades:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Indicadores visuais de normalidade (verde/vermelho)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Busca por paciente com filtros avançados',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Data e hora automática de cada registro',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Persistência de dados em localStorage',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new PageBreak(),

      // Prescrições
      new Paragraph({
        text: '6. Prescrições',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'Sistema digital completo para criação e gerenciamento de prescrições medicamentosas.',
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({
        text: 'Dados da Prescrição:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Seleção de paciente • Múltiplos medicamentos por prescrição • Dosagem, frequência e duração • Anotações adicionais',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Status de Prescrições:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Ativa • Encerrada • Suspensa',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Funcionalidades:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Alerta automático de alergias do paciente (destacado em vermelho)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Visualização expandível de medicamentos',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Datas e histórico de prescrições',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Persistência automática de dados',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      // Exames
      new Paragraph({
        text: '7. Exames',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'Módulo de solicitação e acompanhamento de exames com suporte a múltiplos exames por solicitação.',
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({
        text: 'Tipos de Exame:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Laboratorial • Imagem • Funcional • Outro',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Status de Exames:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Solicitado • Coletado • Resultado Disponível • Entregue',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Funcionalidades Especiais:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• ✨ NOVO: Solicitar múltiplos exames em uma única solicitação',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Informações do paciente associado',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Data de solicitação automática',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Detalhes expandíveis por exame',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Persistência completa de dados',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      // Administração
      new Paragraph({
        text: '8. Administração (Gerenciamento de Usuários)',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'Sistema completo de gerenciamento de usuários com controle de papéis, permissões e segurança.',
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({
        text: 'Dados do Usuário:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Nome completo • Login • Senha (com confirmação) • Múltiplos papéis • CRM (para médicos) • COREN (para enfermeiros)',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Papéis Disponíveis:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• 🏥 Médico (requer CRM)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• 🩺 Enfermeiro (requer COREN)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• ⚙️ Administrador (acesso total)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• 📞 Recepção (cadastro de pacientes)',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Operações Disponíveis:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• ✅ Criar novo usuário com validação',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• ✏️ Editar usuário (clicando no nome)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• 🔒/🔓 Ativar/Inativar usuário',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• 🗑️ Deletar usuário com confirmação',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• 🔄 Redefinir senha',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Funcionalidades de Segurança:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• ✨ NOVO: Campo de confirmação de senha fica VERDE quando senhas são iguais',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• ✨ NOVO: Ícone de check verde aparece como validação visual',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Validação de campos obrigatórios',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Senha mínimo 6 caracteres',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Matriz de permissões visual',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Estatísticas Visíveis:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Total de usuários • Usuários ativos • Usuários inativos • Total de médicos',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new PageBreak(),

      // Relatórios
      new Paragraph({
        text: '9. Relatórios',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'Dashboard analítico com estatísticas e gráficos interativos para tomada de decisão.',
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({
        text: 'Estatísticas Gerais:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Total de pacientes no sistema',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Distribuição por status (Internados, Ambulatorial, Alta)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Prescrições ativas em acompanhamento',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Exames pendentes e resultados disponíveis',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Gráficos Disponíveis:',
        spacing: { after: 100 },
        run: new TextRun({ bold: true, size: 22 })
      }),
      new Paragraph({
        text: '• Atendimentos por mês (gráfico de barras)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Distribuição de pacientes por status (gráfico pizza)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Tipos de exames solicitados (gráfico pizza)',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Relatórios específicos por paciente',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      // Configurações
      new Paragraph({
        text: '10. Configurações',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),
      new Paragraph({
        text: 'Painel de configurações organizadas em abas temáticas.',
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED
      }),

      new Paragraph({
        text: 'Aba: Clínica',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        run: new TextRun({ bold: true, size: 24 })
      }),
      new Paragraph({
        text: '• Nome da clínica/instituição • CNPJ • Telefone de contato • Email institucional • Endereço completo • Horário de atendimento (início e fim) • Personalização de cores (primária e secundária) • Upload de logomarca • Persistência em localStorage',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new Paragraph({
        text: 'Aba: Perfil',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        run: new TextRun({ bold: true, size: 24 })
      }),
      new Paragraph({
        text: '• Dados do usuário logado • Nome completo • Email pessoal • CRM (se médico) • Telefone • Especialidade • Instituição vinculada',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new Paragraph({
        text: 'Aba: Notificações',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        run: new TextRun({ bold: true, size: 24 })
      }),
      new Paragraph({
        text: '• Novo resultado de exame • Alerta crítico de paciente • Prescrição vencendo • Lembrete de consulta • Canais de notificação (Email, Sistema)',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new Paragraph({
        text: 'Aba: Segurança',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        run: new TextRun({ bold: true, size: 24 })
      }),
      new Paragraph({
        text: '• Gerenciamento de senhas • Autenticação do sistema • Histórico de acessos',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new PageBreak(),

      // Funcionalidades Técnicas
      new Paragraph({
        text: '11. Funcionalidades Técnicas',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),

      new Paragraph({
        text: 'Persistência de Dados',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        run: new TextRun({ bold: true, size: 24 })
      }),
      new Paragraph({
        text: 'Todos os dados são persistidos automaticamente em localStorage:',
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: '• Dados de pacientes • Exames solicitados • Prescrições • Sinais vitais registrados • Usuários do sistema • Timeline/Prontuários • Configurações da clínica',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new Paragraph({
        text: 'Interface e UX',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        run: new TextRun({ bold: true, size: 24 })
      }),
      new Paragraph({
        text: '• Design responsivo para mobile, tablet e desktop • Animações suaves com Framer Motion • Suporte a tema claro/escuro • Design Glassmorphism moderno • Efeitos hover interativos em cards • Ícones intuitivos do Lucide React',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new Paragraph({
        text: 'Segurança e Controle de Acesso',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        run: new TextRun({ bold: true, size: 24 })
      }),
      new Paragraph({
        text: 'Sistema de papéis com permissões específicas:',
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: '• Médico: Acesso a prontuários, prescrições, exames, sinais vitais',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Enfermeiro: Acesso a prontuários e sinais vitais',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Administrador: Acesso total a todas as funcionalidades',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '• Recepção: Cadastro e gerenciamento de pacientes',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: 'Outras funcionalidades de segurança:',
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: '• Validação de formulários com mensagens de erro • Confirmação de senha com feedback visual • Senha mínimo 6 caracteres • Confirmação de ações destrutivas (deletar usuário)',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new Paragraph({
        text: 'Componentes Reutilizáveis',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        run: new TextRun({ bold: true, size: 24 })
      }),
      new Paragraph({
        text: '• Dialogs/Modais para criação e edição • Tabelas responsivas com sorteamento • Badges com status coloridos • Gráficos interativos (Recharts) • Sistema de notificações (Toast) • Buscas e filtros avançados',
        spacing: { after: 200 },
        indent: { left: 720 }
      }),

      new PageBreak(),

      // Resumo Executivo
      new Paragraph({
        text: '12. Resumo Executivo',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        run: new TextRun({ bold: true, size: 28, color: '1B66E8' })
      }),

      new Paragraph({
        text: 'O Pulse PEP é uma solução moderna e abrangente para gerenciamento eletrônico de prontuário que oferece:',
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED
      }),

      new Table({
        width: { size: 100, type: 'pct' },
        rows: [
          new TableRow({
            height: { value: 400, rule: 'atLeast' },
            cells: [
              new TableCell({
                children: [new Paragraph({ text: 'Funcionalidade', run: new TextRun({ bold: true, size: 22, color: 'FFFFFF' }), alignment: AlignmentType.CENTER })],
                shading: { fill: '1B66E8', color: 'auto' },
                verticalAlign: VerticalAlign.CENTER
              }),
              new TableCell({
                children: [new Paragraph({ text: 'Status', run: new TextRun({ bold: true, size: 22, color: 'FFFFFF' }), alignment: AlignmentType.CENTER })],
                shading: { fill: '1B66E8', color: 'auto' },
                verticalAlign: VerticalAlign.CENTER
              })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Gestão de Pacientes')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ Completo', run: new TextRun({ color: '059669' }) })] })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Histórico Clínico Integrado')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ Completo', run: new TextRun({ color: '059669' }) })] })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Prescrições Digitalizadas')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ Completo', run: new TextRun({ color: '059669' }) })] })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Solicitação de Exames')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ Com múltiplos exames', run: new TextRun({ color: '059669' }) })] })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Monitoramento de Sinais Vitais')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ Completo', run: new TextRun({ color: '059669' }) })] })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Relatórios Analíticos')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ Com gráficos', run: new TextRun({ color: '059669' }) })] })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Controle de Acesso por Papéis')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ 4 papéis definidos', run: new TextRun({ color: '059669' }) })] })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Administração de Usuários')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ Completo', run: new TextRun({ color: '059669' }) })] })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Dados Persistentes')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ localStorage', run: new TextRun({ color: '059669' }) })] })
            ]
          }),
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph('Interface Responsiva')] }),
              new TableCell({ children: [new Paragraph({ text: '✅ Mobile/Tablet/Desktop', run: new TextRun({ color: '059669' }) })] })
            ]
          })
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: 'Benefícios Principais:',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 },
        run: new TextRun({ bold: true, size: 24 })
      }),
      new Paragraph({
        text: '✓ Melhoria na qualidade do atendimento clínico',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '✓ Redução de tempo na documentação médica',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '✓ Acesso rápido e seguro a informações clínicas',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '✓ Análise de dados e relatórios automatizados',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '✓ Interface intuitiva e moderna',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),
      new Paragraph({
        text: '✓ Conformidade com segurança de dados',
        spacing: { after: 100 },
        indent: { left: 720 }
      }),

      new Paragraph({ text: '', spacing: { after: 200 } }),

      new Paragraph({
        text: '_______________________________________________________________________________',
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 },
        run: new TextRun({ italics: true, size: 18, color: '999999' })
      }),
      new Paragraph({
        text: 'Pulse PEP - Sistema de Gerenciamento Eletrônico de Prontuário',
        alignment: AlignmentType.CENTER,
        run: new TextRun({ bold: true, size: 20, color: '1B66E8' })
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('./Pulse_PEP_Funcionalidades.docx', buffer);
  console.log('✅ Documento gerado com sucesso: Pulse_PEP_Funcionalidades.docx');
});
