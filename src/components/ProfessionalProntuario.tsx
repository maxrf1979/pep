import { createPortal } from "react-dom";
import { type Patient, type VitalSign, type Prescription, type Exam, type TimelineEvent, patients, vitalSigns, prescriptions, exams, timelineEvents } from "@/lib/mock-data";

interface ProfessionalProntuarioProps {
  patientId: string;
}

export function ProfessionalProntuario({ patientId }: ProfessionalProntuarioProps) {
  // Obter usuário logado (para assinatura/responsável)
  const getLoggedUser = (): string => {
    const saved = localStorage.getItem("pulse-auth-session");
    if (saved) {
      try {
        const session = JSON.parse(saved);
        return session.username || "Usuário do Sistema";
      } catch {
        return "Usuário do Sistema";
      }
    }
    return "Usuário do Sistema";
  };

  // Carregamento de dados da clínica
  const clinicData = (() => {
    const saved = localStorage.getItem("clinicSettings");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Pulse Clínica Médica",
          cnpj: "12.345.678/0001-90",
          phone: "(11) 3456-7890",
          email: "contato@pulsesecond.com.br",
          address: "Av. Paulista, 1000 - São Paulo, SP",
          logo: null,
        };
  })();

  // Carregamento de pacientes
  const allPatients: Patient[] = (() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : patients;
  })();

  const patient = allPatients.find((p) => p.id === patientId);

  // Carregamento e combinação de sinais vitais
  const combinedVitals: VitalSign[] = (() => {
    const saved = localStorage.getItem("localVitals");
    const local = saved ? JSON.parse(saved) : [];
    return [...local, ...vitalSigns]
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  // Carregamento e combinação de prescriçÃµes
  const combinedPrescriptions: Prescription[] = (() => {
    const saved = localStorage.getItem("localPrescriptions");
    const local = saved ? JSON.parse(saved) : [];
    return [...local, ...prescriptions]
      .filter((p) => p.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  // Carregamento e combinação de exames
  const combinedExams: Exam[] = (() => {
    const saved = localStorage.getItem("localExams");
    const local = saved ? JSON.parse(saved) : [];
    return [...local, ...exams]
      .filter((e) => e.patientId === patientId)
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  })();

  // Carregamento da timeline
  const combinedTimeline: TimelineEvent[] = (() => {
    const saved = localStorage.getItem("pep-timeline");
    const local = saved ? JSON.parse(saved) : [];
    const all = saved ? local : [...local, ...timelineEvents];
    return all
      .filter((ev) => ev.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  // Extrair evoluçÃµes clínicas
  const clinicalEvolutions = combinedTimeline.filter((e) =>
    e.type.startsWith("evolucao")
  );

  // Extrair dados de atendimento (primeira entrada de evolução médica)
  const firstConsultation = combinedTimeline.find((e) => e.type === "evolucao_medica");

  // Função auxiliar para formatar valor ou "Não informado"
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "" || value === "---") {
      return "Não informado";
    }
    return String(value);
  };

  // Calcular IMC quando não tiver na base
  const getImc = (weight?: number, height?: number): string => {
    if (!weight || !height) return "---";
    const heightInMeters = height / 100;
    const imc = weight / (heightInMeters * heightInMeters);
    return imc.toFixed(1);
  };

  if (!patient) return null;

  const currentDate = new Date();
  const printDate = currentDate.toLocaleDateString("pt-BR");
  const printTime = currentDate.toLocaleTimeString("pt-BR");

  return createPortal(
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] printable-content font-sans text-xs">
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            background: white;
            color: #000;
            line-height: 1.4;
          }

          .page {
            page-break-after: always;
            page-break-inside: avoid;
            padding: 2cm;
            min-height: 29.7cm;
            position: relative;
            background: white;
          }

          .page:last-child {
            page-break-after: avoid;
          }

          /* Cabeçalho */
          .document-header {
            border-bottom: 3px solid #000;
            padding-bottom: 1.5rem;
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
          }

          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
          }

          .header-left {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          .logo-placeholder {
            width: 40px;
            height: 40px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
          }

          .clinic-info h1 {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 2px;
            letter-spacing: 0.5px;
          }

          .clinic-info p {
            font-size: 9px;
            color: #666;
            margin: 1px 0;
          }

          .header-right {
            text-align: right;
            font-size: 9px;
            color: #666;
            line-height: 1.6;
          }

          .document-title {
            text-align: center;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
          }

          /* SeçÃµes */
          .section {
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 12px;
            font-weight: 700;
            background: #f5f5f5;
            padding: 0.4rem 0.6rem;
            margin-bottom: 0.8rem;
            border-left: 4px solid #000;
            page-break-inside: avoid;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.8rem 1rem;
            background: #fafafa;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 3px;
            margin-bottom: 1rem;
          }

          .info-grid.two-column {
            grid-template-columns: repeat(2, 1fr);
          }

          .info-item {
            font-size: 10px;
          }

          .info-label {
            color: #666;
            font-weight: 600;
            display: block;
            margin-bottom: 2px;
          }

          .info-value {
            color: #000;
            font-weight: 500;
          }

          .alert-box {
            background: #fee;
            border: 1px solid #f00;
            border-radius: 3px;
            padding: 0.6rem;
            margin-bottom: 1rem;
            font-weight: 600;
            color: #c00;
            font-size: 10px;
          }

          /* Tabelas */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
            font-size: 10px;
          }

          table thead {
            background: #e8e8e8;
          }

          table th {
            padding: 0.5rem;
            text-align: left;
            font-weight: 700;
            border-bottom: 2px solid #000;
            color: #333;
          }

          table td {
            padding: 0.4rem 0.5rem;
            border-bottom: 1px solid #ddd;
          }

          table tr:last-child td {
            border-bottom: 1px solid #000;
          }

          .text-center {
            text-align: center;
          }

          .text-right {
            text-align: right;
          }

          .font-mono {
            font-family: 'Courier New', monospace;
          }

          /* Bloco de evolução */
          .evolution-block {
            border-left: 3px solid #ddd;
            padding-left: 0.8rem;
            margin-bottom: 0.8rem;
            page-break-inside: avoid;
          }

          .evolution-header {
            display: flex;
            justify-content: space-between;
            font-weight: 600;
            font-size: 10px;
            margin-bottom: 0.4rem;
            color: #333;
          }

          .evolution-type {
            color: #0066cc;
            font-weight: 700;
          }

          .evolution-date {
            font-family: 'Courier New', monospace;
            color: #666;
          }

          .evolution-text {
            font-size: 10px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
            margin-bottom: 0.4rem;
            color: #333;
          }

          .evolution-professional {
            font-size: 9px;
            color: #999;
            font-style: italic;
          }

          /* Rodapé */
          .document-footer {
            border-top: 1px solid #ccc;
            padding-top: 0.8rem;
            margin-top: 2rem;
            font-size: 8px;
            color: #999;
            text-align: center;
            page-break-inside: avoid;
          }

          .footer-info {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #666;
            padding-top: 0.5rem;
          }

          /* Espaçamento */
          .mt-1 { margin-top: 0.5rem; }
          .mt-2 { margin-top: 1rem; }
          .mb-1 { margin-bottom: 0.5rem; }
          .mb-2 { margin-bottom: 1rem; }

          /* Quebra de página */
          .page-break {
            page-break-after: always;
          }

          /* Estado vazio */
          .empty-state {
            text-align: center;
            color: #999;
            padding: 1rem;
            font-size: 10px;
            font-style: italic;
          }
        }
      `}</style>

      {/* PÃGINA 1 - CABEÃ‡ALHO E IDENTIFICAÃ‡ÃƒO */}
      <div className="page">
        {/* Cabeçalho Institucional */}
        <div className="document-header">
          <div className="header-top">
            <div className="header-left">
              <div className="logo-placeholder">
                {clinicData.logo ? (
                  <img src={clinicData.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  "ðŸ¥"
                )}
              </div>
              <div className="clinic-info">
                <h1>{clinicData.name.toUpperCase()}</h1>
                <p>CNPJ: {formatValue(clinicData.cnpj)}</p>
              </div>
            </div>
            <div className="header-right">
              <p><strong>Endereço:</strong> {formatValue(clinicData.address)}</p>
              <p><strong>Telefone:</strong> {formatValue(clinicData.phone)}</p>
              <p><strong>Email:</strong> {formatValue(clinicData.email)}</p>
              <p style={{ marginTop: "0.4rem" }}>
                <strong>Impressão:</strong> {printDate} às {printTime}
              </p>
            </div>
          </div>
        </div>

        {/* Título do Documento */}
        <div className="document-title">PRONTUÃRIO MÃ‰DICO DO PACIENTE</div>

        {/* Seção 1: Identificação do Paciente */}
        <div className="section">
          <div className="section-title">1. IDENTIFICAÃ‡ÃƒO DO PACIENTE</div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Nome Completo</span>
              <span className="info-value">{formatValue(patient.name)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Data de Nascimento</span>
              <span className="info-value">{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("pt-BR") : "Não informado"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Idade</span>
              <span className="info-value">{formatValue(patient.age)} anos</span>
            </div>

            <div className="info-item">
              <span className="info-label">Sexo</span>
              <span className="info-value">{patient.sex === "M" ? "Masculino" : "Feminino"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">CPF</span>
              <span className="info-value font-mono">{formatValue(patient.cpf)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">RG</span>
              <span className="info-value">Não informado</span>
            </div>

            <div className="info-item">
              <span className="info-label">Cartão SUS</span>
              <span className="info-value font-mono">{patient.sus ? formatValue(patient.sus) : "Não informado"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tipo Sanguíneo</span>
              <span className="info-value">{patient.bloodType ? formatValue(patient.bloodType) : "Não informado"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Telefone</span>
              <span className="info-value">{formatValue(patient.phone)}</span>
            </div>
          </div>

          <div className="info-grid two-column">
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{patient.email ? formatValue(patient.email) : "Não informado"}</span>
            </div>
          </div>

          <div className="info-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="info-item">
              <span className="info-label">Endereço Completo</span>
              <span className="info-value">Não informado no sistema</span>
            </div>
          </div>

          {patient.allergies.length > 0 && (
            <div className="alert-box">
              âš ï¸ ALERGIAS CONHECIDAS: {patient.allergies.join(", ")}
            </div>
          )}

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Status do Paciente</span>
              <span className="info-value">{formatValue(patient.status)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Número do Prontuário</span>
              <span className="info-value font-mono">{patient.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ãšltimo Atendimento</span>
              <span className="info-value">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString("pt-BR") : "Não informado"}</span>
            </div>
          </div>
        </div>

        {/* Seção 2: Dados do Atendimento */}
        {firstConsultation && (
          <div className="section">
            <div className="section-title">2. DADOS DO ATENDIMENTO</div>
            <div className="info-grid two-column">
              <div className="info-item">
                <span className="info-label">Data/Hora do Atendimento</span>
                <span className="info-value">
                  {new Date(firstConsultation.date).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(firstConsultation.date).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Profissional Responsável</span>
                <span className="info-value">{formatValue(firstConsultation.professional)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Especialidade</span>
                <span className="info-value">Medicina Geral</span>
              </div>
              <div className="info-item">
                <span className="info-label">Unidade</span>
                <span className="info-value">{clinicData.name}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PÃGINA 2 - SINAIS VITAIS */}
      {combinedVitals.length > 0 && (
        <div className="page">
          <div className="document-header">
            <div className="header-top">
              <div>
                <strong>{clinicData.name}</strong><br />
                <span style={{ fontSize: "9px", color: "#666" }}>Prontuário: {patient.name}</span>
              </div>
              <div style={{ textAlign: "right", fontSize: "9px", color: "#666" }}>
                Página 2 de X<br />
                {printDate}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">3. SINAIS VITAIS</div>
            <table>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th className="text-center">Temp (°C)</th>
                  <th className="text-center">FC (bpm)</th>
                  <th className="text-center">PA (mmHg)</th>
                  <th className="text-center">FR (ipm)</th>
                  <th className="text-center">SpOâ‚‚ (%)</th>
                  <th className="text-center">Peso (kg)</th>
                  <th className="text-center">Altura (cm)</th>
                  <th className="text-center">IMC</th>
                  <th>Profissional</th>
                </tr>
              </thead>
              <tbody>
                {combinedVitals.map((v) => (
                  <tr key={v.id}>
                    <td className="font-mono">
                      {new Date(v.date).toLocaleDateString("pt-BR")} {new Date(v.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="text-center">{v.temperature.toFixed(1)}</td>
                    <td className="text-center">{v.heartRate}</td>
                    <td className="text-center">{v.bloodPressureSys}/{v.bloodPressureDia}</td>
                    <td className="text-center">{v.respiratoryRate}</td>
                    <td className="text-center">{v.oxygenSaturation}</td>
                    <td className="text-center">{v.weight ? v.weight.toFixed(1) : "---"}</td>
                    <td className="text-center">{v.height ? v.height : "---"}</td>
                    <td className="text-center">{v.bmi ? v.bmi.toFixed(1) : getImc(v.weight, v.height)}</td>
                    <td>{v.professional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PÃGINA 3+ - EVOLUÃ‡Ã•ES CLÃNICAS */}
      {clinicalEvolutions.length > 0 && (
        <div className="page">
          <div className="document-header">
            <div className="header-top">
              <div>
                <strong>{clinicData.name}</strong><br />
                <span style={{ fontSize: "9px", color: "#666" }}>Prontuário: {patient.name}</span>
              </div>
              <div style={{ textAlign: "right", fontSize: "9px", color: "#666" }}>
                Página 3 de X<br />
                {printDate}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">4. EVOLUÃ‡ÃƒO CLÃNICA</div>
            {clinicalEvolutions.map((ev) => (
              <div key={ev.id} className="evolution-block">
                <div className="evolution-header">
                  <span className="evolution-type">{ev.type === "evolucao_medica" ? "EVOLUÃ‡ÃƒO MÃ‰DICA" : "EVOLUÃ‡ÃƒO DE ENFERMAGEM"}</span>
                  <span className="evolution-date">
                    {new Date(ev.date).toLocaleDateString("pt-BR")} às {new Date(ev.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="evolution-text">{ev.details || ev.summary}</div>
                <div className="evolution-professional">Profissional: {ev.professional}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PÃGINA 4 - PRESCRIÃ‡Ã•ES */}
      {combinedPrescriptions.length > 0 && (
        <div className="page">
          <div className="document-header">
            <div className="header-top">
              <div>
                <strong>{clinicData.name}</strong><br />
                <span style={{ fontSize: "9px", color: "#666" }}>Prontuário: {patient.name}</span>
              </div>
              <div style={{ textAlign: "right", fontSize: "9px", color: "#666" }}>
                Página 4 de X<br />
                {printDate}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">5. PRESCRIÃ‡Ã•ES MÃ‰DICAS</div>
            {combinedPrescriptions.map((px) => (
              <div key={px.id} style={{ marginBottom: "1.5rem", pageBreakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 600, marginBottom: "0.5rem" }}>
                  <span>Data: {new Date(px.date).toLocaleDateString("pt-BR")}</span>
                  <span>Profissional: {px.professional}</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Medicamento</th>
                      <th className="text-center">Dosagem</th>
                      <th className="text-center">Via</th>
                      <th className="text-center">Frequência</th>
                      <th className="text-center">Duração</th>
                      <th>ObservaçÃµes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {px.medications.map((m, i) => (
                      <tr key={i}>
                        <td><strong>{m.name}</strong></td>
                        <td className="text-center">{m.dose}</td>
                        <td className="text-center">{m.route}</td>
                        <td className="text-center">{m.frequency}</td>
                        <td className="text-center">{m.duration}</td>
                        <td>{m.observation || "---"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {px.notes && <div style={{ fontSize: "9px", color: "#666", marginTop: "0.4rem", fontStyle: "italic" }}>ObservaçÃµes: {px.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PÃGINA 5 - EXAMES SOLICITADOS */}
      {combinedExams.length > 0 && (
        <div className="page">
          <div className="document-header">
            <div className="header-top">
              <div>
                <strong>{clinicData.name}</strong><br />
                <span style={{ fontSize: "9px", color: "#666" }}>Prontuário: {patient.name}</span>
              </div>
              <div style={{ textAlign: "right", fontSize: "9px", color: "#666" }}>
                Página 5 de X<br />
                {printDate}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">6. EXAMES SOLICITADOS</div>
            <table>
              <thead>
                <tr>
                  <th>Data Solicitação</th>
                  <th>Exame</th>
                  <th className="text-center">Status</th>
                  <th>ObservaçÃµes</th>
                  <th>Profissional</th>
                </tr>
              </thead>
              <tbody>
                {combinedExams.map((e) => (
                  <tr key={e.id}>
                    <td className="font-mono">{new Date(e.requestDate).toLocaleDateString("pt-BR")}</td>
                    <td><strong>{e.name}</strong></td>
                    <td className="text-center">{e.status}</td>
                    <td>{e.notes || "---"}</td>
                    <td>{e.professional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PÃGINA FINAL - ASSINATURA E RODAPÃ‰ */}
      <div className="page">
        <div className="document-header">
          <div className="header-top">
            <div>
              <strong>{clinicData.name}</strong><br />
              <span style={{ fontSize: "9px", color: "#666" }}>Prontuário: {patient.name}</span>
            </div>
            <div style={{ textAlign: "right", fontSize: "9px", color: "#666" }}>
              Página Final<br />
              {printDate}
            </div>
          </div>
        </div>

        <div className="section" style={{ marginTop: "2rem" }}>
          <div className="section-title">7. RESPONSÃVEIS E ASSINATURAS</div>

          <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ height: "60px", borderBottom: "1px solid #000", marginBottom: "0.5rem" }}></div>
              <p style={{ fontSize: "10px", fontWeight: 600 }}>Médico Responsável</p>
              <p style={{ fontSize: "9px", color: "#666" }}>Registro Profissional</p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ height: "60px", borderBottom: "1px solid #000", marginBottom: "0.5rem" }}></div>
              <p style={{ fontSize: "10px", fontWeight: 600 }}>Responsável Administrativo</p>
              <p style={{ fontSize: "9px", color: "#666" }}>Carimbo/Assinatura</p>
            </div>
          </div>

          <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f5f5f5", border: "1px solid #ddd", borderRadius: "3px" }}>
            <p style={{ fontSize: "9px", color: "#666", marginBottom: "0.5rem" }}>
              <strong>Data de Emissão:</strong> {printDate} às {printTime}
            </p>
            <p style={{ fontSize: "9px", color: "#666", marginBottom: "0.5rem" }}>
              <strong>Gerado por:</strong> {getLoggedUser()}
            </p>
            <p style={{ fontSize: "8px", color: "#999", marginTop: "1rem", fontStyle: "italic" }}>
              Este documento é um registro oficial do atendimento médico realizado na {clinicData.name}.<br />
              Deve ser arquivado de forma segura, conforme legislação vigente (Lei 12.842/2013 e Resolução CFM 1.638/2002).<br />
              A cópia em meio eletrÃ´nico tem validade legal quando assinada digitalmente ou impressa e assinada.
            </p>
          </div>
        </div>

        <div className="document-footer" style={{ marginTop: "3rem" }}>
          <p style={{ marginBottom: "1rem" }}>
            <strong>FIM DO PRONTUÃRIO</strong>
          </p>
          <div className="footer-info" style={{ marginTop: "1rem" }}>
            <span>Paciente: {patient.name}</span>
            <span>Prontuário: {patient.id}</span>
            <span>Clínica: {clinicData.name}</span>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "8px", color: "#999" }}>
            Gerado por: Pulse PEP Clinic - Sistema de Gerenciamento EletrÃ´nico de Prontuário<br />
            Data/Hora de Impressão: {printDate} às {printTime}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

