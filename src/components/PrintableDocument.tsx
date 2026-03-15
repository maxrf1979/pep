import { Heart } from "lucide-react";
import { createPortal } from "react-dom";

interface PrintableDocumentProps {
  type: "prescription" | "exam";
  patient: {
    name: string;
    age: number;
    cpf: string;
    sex?: string;
  };
  items: any[];
  notes?: string;
  professionalLabel: string;
  documentId?: string;
}

export function PrintableDocument({
  type,
  patient,
  items,
  notes,
  professionalLabel,
  documentId = crypto.randomUUID(),
}: PrintableDocumentProps) {
  const clinicData = (() => {
    const saved = localStorage.getItem("clinicSettings");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Pulse PEP Clinic",
          cnpj: "12.345.678/0001-90",
          phone: "(11) 3456-7890",
          email: "contato@pulsepep.com.br",
          address: "Av. Paulista, 1000 - São Paulo, SP",
          primaryColor: "#1B66E8",
          logo: null,
        };
  })();

  const qrCodeData = `https://pulsepep.com/verify?id=${documentId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrCodeData)}`;
  const now = new Date();

  return createPortal(
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] printable-content" style={{ padding: "2cm", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "10pt", color: "#000" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "12px", marginBottom: "20px", borderBottom: `3px solid ${clinicData.primaryColor}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {clinicData.logo ? (
            <img src={clinicData.logo} alt={clinicData.name} style={{ height: "48px", width: "48px", objectFit: "contain", borderRadius: "8px" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "48px", width: "48px", borderRadius: "8px", backgroundColor: clinicData.primaryColor, color: "white" }}>
              <Heart style={{ height: "24px", width: "24px" }} strokeWidth={2} fill="currentColor" />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: "16pt", fontWeight: 700, color: clinicData.primaryColor, margin: 0 }}>{clinicData.name}</h1>
            <p style={{ fontSize: "8pt", color: "#666", margin: "2px 0 0" }}>CNPJ: {clinicData.cnpj}</p>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "8pt", color: "#666", lineHeight: 1.8 }}>
          <p style={{ fontWeight: 600, color: "#000", margin: 0 }}>{clinicData.phone}</p>
          <p style={{ margin: 0 }}>{clinicData.email}</p>
          <p style={{ margin: 0 }}>{clinicData.address}</p>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "14pt", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
          {type === "prescription" ? "Receituário Médico" : "Solicitação de Exame"}
        </h2>
        <p style={{ fontSize: "8pt", color: "#999", marginTop: "4px" }}>
          Documento Nº {documentId.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Patient Info */}
      <div style={{ background: "#fafafa", padding: "12px", borderRadius: "4px", border: "1px solid #ddd", marginBottom: "24px", fontSize: "10pt" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "none" }}>
          <tbody>
            <tr>
              <td style={{ border: "none", padding: "3px 0", fontWeight: 600, color: "#555", width: "120px" }}>Paciente:</td>
              <td style={{ border: "none", padding: "3px 0", fontWeight: 500 }}>{patient.name}</td>
              <td style={{ border: "none", padding: "3px 0", fontWeight: 600, color: "#555", width: "80px" }}>Idade:</td>
              <td style={{ border: "none", padding: "3px 0" }}>{patient.age} anos</td>
            </tr>
            <tr>
              <td style={{ border: "none", padding: "3px 0", fontWeight: 600, color: "#555" }}>CPF:</td>
              <td style={{ border: "none", padding: "3px 0", fontFamily: "monospace" }}>{patient.cpf || "---"}</td>
              <td style={{ border: "none", padding: "3px 0", fontWeight: 600, color: "#555" }}>Sexo:</td>
              <td style={{ border: "none", padding: "3px 0" }}>{patient.sex === "M" ? "Masculino" : "Feminino"}</td>
            </tr>
            <tr>
              <td style={{ border: "none", padding: "3px 0", fontWeight: 600, color: "#555" }}>Data:</td>
              <td colSpan={3} style={{ border: "none", padding: "3px 0" }}>{now.toLocaleDateString("pt-BR")} às {now.toLocaleTimeString("pt-BR")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Items */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "11pt", fontWeight: 700, borderBottom: "2px solid #000", paddingBottom: "4px", marginBottom: "12px" }}>
          {type === "prescription" ? "Medicamentos Prescritos" : "Exames Solicitados"}
        </h3>

        {type === "prescription" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", fontSize: "9pt", fontWeight: 700 }}>Medicamento</th>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", fontSize: "9pt", fontWeight: 700 }}>Dose</th>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", fontSize: "9pt", fontWeight: 700 }}>Via</th>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", fontSize: "9pt", fontWeight: 700 }}>Frequência</th>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", fontSize: "9pt", fontWeight: 700 }}>Duração</th>
              </tr>
            </thead>
            <tbody>
              {items.map((med, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px", fontWeight: 500 }}>{med.name}</td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{med.dose}</td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{med.route}</td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{med.frequency}</td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{med.duration || "---"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", fontSize: "9pt", fontWeight: 700 }}>Nome do Exame</th>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", fontSize: "9pt", fontWeight: 700 }}>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((exam, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px", fontWeight: 500 }}>{exam.name}</td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px", textTransform: "capitalize" }}>{exam.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Notes */}
      {notes && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "10pt", fontWeight: 700, borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "8px" }}>
            {type === "prescription" ? "Observações / Recomendações" : "Justificativa / Indicação Clínica"}
          </h3>
          <p style={{ whiteSpace: "pre-wrap", color: "#333", fontSize: "10pt", lineHeight: 1.6 }}>{notes}</p>
        </div>
      )}

      {/* Signature and QR */}
      <div style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: "10pt", marginBottom: "48px" }}>Profissional Responsável</p>
          <div style={{ width: "200px", textAlign: "center", borderTop: "1px solid #000", paddingTop: "8px" }}>
            <p style={{ fontWeight: 600, fontSize: "9pt", margin: 0 }}>{professionalLabel}</p>
            <p style={{ fontSize: "7pt", color: "#999", margin: "2px 0 0" }}>Assinatura e Carimbo</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <img src={qrCodeUrl} alt="QR Verificação" style={{ height: "72px", width: "72px", objectFit: "contain" }} />
          <span style={{ fontSize: "7pt", color: "#999", textAlign: "center" }}>
            Escaneie para verificar<br />a autenticidade
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "24px", paddingTop: "12px", borderTop: `2px solid ${clinicData.primaryColor}`, textAlign: "center" }}>
        <p style={{ fontWeight: 500, fontSize: "8pt", color: "#666", margin: 0 }}>{clinicData.address}</p>
        <p style={{ fontSize: "7pt", color: "#999", marginTop: "4px" }}>
          Documento gerado eletronicamente por Pulse PEP Clinic em {now.toLocaleDateString("pt-BR")} às {now.toLocaleTimeString("pt-BR")}
        </p>
      </div>
    </div>,
    document.body
  );
}
