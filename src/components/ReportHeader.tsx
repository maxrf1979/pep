import { Heart } from "lucide-react";

export function ReportHeader() {
  const clinicData = (() => {
    const saved = localStorage.getItem("clinicSettings");
    return saved ? JSON.parse(saved) : {
      name: "Pulse PEP Clinic",
      cnpj: "12.345.678/0001-90",
      phone: "(11) 3456-7890",
      email: "contato@pulsepep.com.br",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      hoursStart: "08:00",
      hoursEnd: "18:00",
      primaryColor: "#1B66E8",
      logo: null,
    };
  })();

  return (
    <div className="print-header" style={{ pageBreakAfter: "avoid" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "12px", marginBottom: "20px", borderBottom: `3px solid ${clinicData.primaryColor}` }}>
        {/* Logo e Nome */}
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

        {/* Contato */}
        <div style={{ textAlign: "right", fontSize: "8pt", color: "#666", lineHeight: 1.8 }}>
          <p style={{ fontWeight: 600, color: "#000", margin: 0 }}>{clinicData.phone}</p>
          <p style={{ margin: 0 }}>{clinicData.email}</p>
          <p style={{ margin: 0 }}>{clinicData.address}</p>
          {clinicData.hoursStart && clinicData.hoursEnd && (
            <p style={{ margin: "4px 0 0", color: "#999" }}>Horário: {clinicData.hoursStart} – {clinicData.hoursEnd}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReportFooter() {
  const clinicData = (() => {
    const saved = localStorage.getItem("clinicSettings");
    return saved ? JSON.parse(saved) : {
      name: "Pulse PEP Clinic",
      primaryColor: "#1B66E8",
    };
  })();

  const now = new Date();

  return (
    <div className="print-footer" style={{ pageBreakBefore: "avoid" }}>
      <div style={{ borderTop: `2px solid ${clinicData.primaryColor}`, paddingTop: "16px", marginTop: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {/* Assinatura */}
          <div>
            <p style={{ fontWeight: 600, fontSize: "10pt", color: "#000", marginBottom: "48px" }}>Profissional Responsável</p>
            <div style={{ width: "180px", textAlign: "center", borderTop: "1px solid #000", paddingTop: "6px" }}>
              <p style={{ fontSize: "8pt", color: "#666", margin: 0 }}>Assinatura e Carimbo</p>
            </div>
          </div>

          {/* Info do documento */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 600, fontSize: "9pt", color: "#000", marginBottom: "8px" }}>Informações do Documento</p>
            <div style={{ fontSize: "8pt", color: "#666", lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}><strong>Data:</strong> {now.toLocaleDateString("pt-BR")}</p>
              <p style={{ margin: 0 }}><strong>Hora:</strong> {now.toLocaleTimeString("pt-BR")}</p>
              <p style={{ margin: 0 }}><strong>Instituição:</strong> {clinicData.name}</p>
            </div>
          </div>

          {/* Marca */}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 600, fontSize: "9pt", color: "#000", marginBottom: "4px" }}>Pulse PEP Clinic</p>
            <p style={{ fontSize: "7pt", color: "#999", lineHeight: 1.6 }}>
              Sistema de Gerenciamento<br />Eletrônico de Prontuário
            </p>
          </div>
        </div>

        {/* Footer bar */}
        <div style={{ marginTop: "16px", paddingTop: "8px", borderTop: "1px solid #ddd", textAlign: "center", fontSize: "7pt", color: "#999" }}>
          <p style={{ margin: 0 }}>
            © {now.getFullYear()} {clinicData.name}. Todos os direitos reservados. Documento confidencial.
          </p>
        </div>
      </div>
    </div>
  );
}
