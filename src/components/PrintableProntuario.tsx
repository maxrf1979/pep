import { createPortal } from "react-dom";
import { type Patient, type VitalSign, type Prescription, type ExamRequest, type TimelineEvent, patients, vitalSigns, prescriptions, examRequests, timelineEvents } from "@/lib/mock-data";

interface PrintableProntuarioProps {
  patientId: string;
}

export function PrintableProntuario({ patientId }: PrintableProntuarioProps) {
  const clinicData = (() => {
    const saved = localStorage.getItem("clinicSettings");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Pulse PEP Clinic",
          cnpj: "12.345.678/0001-90",
          phone: "(11) 3456-7890",
          email: "contato@pulsepep.com.br",
          address: "Av. Paulista, 1000 – São Paulo, SP",
          primaryColor: "#1B66E8",
          logo: null,
        };
  })();

  const allPatients: Patient[] = (() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : patients;
  })();

  const patient = allPatients.find((p) => p.id === patientId);

  const combinedVitals: VitalSign[] = (() => {
    const saved = localStorage.getItem("localVitals");
    const local = saved ? JSON.parse(saved) : [];
    return [...local, ...vitalSigns]
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  })();

  const combinedPrescriptions: Prescription[] = (() => {
    const saved = localStorage.getItem("localPrescriptions");
    const local = saved ? JSON.parse(saved) : [];
    return [...local, ...prescriptions]
      .filter((p) => p.patientId === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  })();

  const combinedExams: ExamRequest[] = (() => {
    const saved = localStorage.getItem("localExams");
    const local = saved ? JSON.parse(saved) : [];
    return [...local, ...examRequests]
      .filter((e) => e.patientId === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  })();

  const combinedTimeline: TimelineEvent[] = (() => {
    const saved = localStorage.getItem("pep-timeline");
    const local = saved ? JSON.parse(saved) : [];
    const all = saved ? local : [...local, ...timelineEvents];
    return all
      .filter((ev: TimelineEvent) => ev.patientId === patientId)
      .sort((a: TimelineEvent, b: TimelineEvent) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  if (!patient) return null;

  const now = new Date();
  const printDate = now.toLocaleDateString("pt-BR");
  const printTime = now.toLocaleTimeString("pt-BR");

  const s = {
    header: { display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "3px solid #000", paddingBottom: "12px", marginBottom: "16px" },
    sectionTitle: { fontSize: "11pt", fontWeight: 700 as const, background: "#e8e8e8", padding: "4px 8px", marginBottom: "8px", borderLeft: "4px solid #000", pageBreakInside: "avoid" as const },
    infoGrid: { display: "grid" as const, gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 12px", background: "#fafafa", padding: "8px", border: "1px solid #ddd", borderRadius: "2px", marginBottom: "8px", fontSize: "10pt" },
    label: { color: "#555", fontWeight: 600 as const, display: "block" as const, marginBottom: "2px", fontSize: "8pt" },
    value: { color: "#000", fontWeight: 500 as const, fontSize: "9pt" },
  };

  return createPortal(
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] printable-content" style={{ padding: "2cm", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "10pt", color: "#000" }}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {clinicData.logo ? (
            <img src={clinicData.logo} alt="Logo" style={{ height: "40px", width: "40px", objectFit: "contain" }} />
          ) : (
            <span style={{ fontSize: "24px" }}>🩺</span>
          )}
          <div>
            <h1 style={{ fontSize: "12pt", fontWeight: 700, margin: 0 }}>{clinicData.name}</h1>
            <p style={{ fontSize: "8pt", color: "#666", margin: "2px 0 0" }}>CNPJ: {clinicData.cnpj}</p>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "8pt", color: "#666", lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>{clinicData.address}</p>
          <p style={{ margin: 0 }}>Tel: {clinicData.phone} | {clinicData.email}</p>
          <p style={{ margin: 0 }}>Impressão: {printDate} às {printTime}</p>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "14pt", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
          Prontuário Médico do Paciente
        </h2>
      </div>

      {/* Patient Info */}
      <div style={{ marginBottom: "20px" }}>
        <div style={s.sectionTitle}>Identificação do Paciente</div>
        <div style={s.infoGrid}>
          <div><span style={s.label}>Nome:</span> <span style={s.value}>{patient.name}</span></div>
          <div><span style={s.label}>Idade:</span> <span style={s.value}>{patient.age} anos</span></div>
          <div><span style={s.label}>Sexo:</span> <span style={s.value}>{patient.sex === "M" ? "Masculino" : "Feminino"}</span></div>
          <div><span style={s.label}>CPF:</span> <span style={{ ...s.value, fontFamily: "monospace" }}>{patient.cpf}</span></div>
          <div><span style={s.label}>Cartão SUS:</span> <span style={{ ...s.value, fontFamily: "monospace" }}>{patient.sus || "---"}</span></div>
          <div><span style={s.label}>Telefone:</span> <span style={s.value}>{patient.phone}</span></div>
        </div>
        {patient.allergies.length > 0 && (
          <div style={{ background: "#ffe6e6", border: "1.5px solid #cc0000", borderRadius: "2px", padding: "6px 8px", fontWeight: 600, color: "#990000", fontSize: "9pt" }}>
            ⚠️ ALERGIAS: {patient.allergies.join(", ")}
          </div>
        )}
      </div>

      {/* Vital Signs */}
      {combinedVitals.length > 0 && (
        <div style={{ marginBottom: "20px", pageBreakInside: "avoid" }}>
          <div style={s.sectionTitle}>1. Sinais Vitais</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "left", fontWeight: 700, fontSize: "8pt" }}>Data/Hora</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center", fontWeight: 700, fontSize: "8pt" }}>Temp (°C)</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center", fontWeight: 700, fontSize: "8pt" }}>FC (bpm)</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center", fontWeight: 700, fontSize: "8pt" }}>PA (mmHg)</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center", fontWeight: 700, fontSize: "8pt" }}>FR (ipm)</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center", fontWeight: 700, fontSize: "8pt" }}>SpO2</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center", fontWeight: 700, fontSize: "8pt" }}>Peso</th>
              </tr>
            </thead>
            <tbody>
              {combinedVitals.map((v) => (
                <tr key={v.id}>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", fontFamily: "monospace", fontSize: "8pt" }}>
                    {new Date(v.created_at).toLocaleDateString("pt-BR")} {new Date(v.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", textAlign: "center" }}>{v.temperature?.toFixed(1) ?? "---"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", textAlign: "center" }}>{v.heartRate ?? "---"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", textAlign: "center" }}>{v.bloodPressure ?? "---"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", textAlign: "center" }}>{v.respiratoryRate ?? "---"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", textAlign: "center" }}>{v.oxygenSaturation ? `${v.oxygenSaturation}%` : "---"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", textAlign: "center" }}>{v.weight ? `${v.weight}kg` : "---"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Clinical Evolutions */}
      {combinedTimeline.filter(e => e.type.startsWith("evolucao")).length > 0 && (
        <div style={{ marginBottom: "20px", pageBreakInside: "avoid" }}>
          <div style={s.sectionTitle}>2. Evoluções Clínicas</div>
          {combinedTimeline
            .filter(e => e.type.startsWith("evolucao"))
            .map((ev) => (
              <div key={ev.id} style={{ borderLeft: "3px solid #ccc", paddingLeft: "10px", marginBottom: "10px", pageBreakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", fontWeight: 600, marginBottom: "4px" }}>
                  <span style={{ color: "#0066cc", fontWeight: 700 }}>{ev.type === "evolucao_medica" ? "Médica" : "Enfermagem"}</span>
                  <span style={{ fontFamily: "monospace", color: "#666", fontSize: "8pt" }}>
                    {new Date(ev.date).toLocaleDateString("pt-BR")} {new Date(ev.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p style={{ fontSize: "9pt", whiteSpace: "pre-wrap", lineHeight: 1.5, margin: "0 0 4px" }}>{ev.details || ev.summary}</p>
                <p style={{ fontSize: "8pt", color: "#999", fontStyle: "italic", margin: 0 }}>Responsável: {ev.professional}</p>
              </div>
            ))}
        </div>
      )}

      {/* Prescriptions */}
      {combinedPrescriptions.length > 0 && (
        <div style={{ marginBottom: "20px", pageBreakInside: "avoid" }}>
          <div style={s.sectionTitle}>3. Prescrições Médicas</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "left", fontWeight: 700, fontSize: "8pt" }}>Medicamento</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "left", fontWeight: 700, fontSize: "8pt" }}>Dosagem</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "left", fontWeight: 700, fontSize: "8pt" }}>Instruções</th>
              </tr>
            </thead>
            <tbody>
              {combinedPrescriptions.map((px, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", fontWeight: 500 }}>{px.medication}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px" }}>{px.dosage}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px" }}>{px.instructions || "---"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Exams */}
      {combinedExams.length > 0 && (
        <div style={{ marginBottom: "20px", pageBreakInside: "avoid" }}>
          <div style={s.sectionTitle}>4. Exames Solicitados</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "left", fontWeight: 700, fontSize: "8pt" }}>Data</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "left", fontWeight: 700, fontSize: "8pt" }}>Exame</th>
                <th style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center", fontWeight: 700, fontSize: "8pt" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {combinedExams.map((e) => (
                <tr key={e.id}>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", fontFamily: "monospace", fontSize: "8pt" }}>{new Date(e.created_at).toLocaleDateString("pt-BR")}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", fontWeight: 500 }}>{e.examName}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 5px", textAlign: "center", color: "#666", fontSize: "8pt" }}>Solicitado</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #ccc", paddingTop: "8px", marginTop: "24px", fontSize: "8pt", color: "#666", display: "flex", justifyContent: "space-between" }}>
        <span>Pulse PEP Clinic – Prontuário Médico</span>
        <span>Paciente: {patient.name}</span>
        <span>Impresso em {printDate} às {printTime}</span>
      </div>
    </div>,
    document.body
  );
}
