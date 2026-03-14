import { Heart } from "lucide-react";

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
          name: "Aurea Dental",
          cnpj: "12.345.678/0001-90",
          phone: "(11) 3456-7890",
          email: "contato@aureadental.com.br",
          address: "Av. Paulista, 1000 - São Paulo, SP",
          primaryColor: "#10B981",
          logo: null,
        };
  })();

  const qrCodeData = `https://pulsepep.com/verify?id=${documentId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
    qrCodeData
  )}`;

  return (
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 printable-content">
      {/* Header */}
      <div
        className="print-header flex justify-between items-start pb-4 mb-6 border-b-2"
        style={{ borderBottomColor: clinicData.primaryColor }}
      >
        <div className="flex items-center gap-3">
          {clinicData.logo ? (
            <img
              src={clinicData.logo}
              alt={clinicData.name}
              className="h-12 w-12 object-contain rounded-lg"
            />
          ) : (
            <div
              className="flex items-center justify-center h-12 w-12 rounded-lg text-white"
              style={{ backgroundColor: clinicData.primaryColor }}
            >
              <Heart className="h-6 w-6" strokeWidth={2} fill="currentColor" />
            </div>
          )}
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: clinicData.primaryColor }}
            >
              {clinicData.name}
            </h1>
            <p className="text-xs text-gray-600">CNPJ: {clinicData.cnpj}</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-600">
          <p className="font-medium text-black">{clinicData.phone}</p>
          <p>{clinicData.email}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider">
            {type === "prescription" ? "Receituário Médico" : "Solicitação de Exame"}
          </h2>
        </div>

        {/* Patient Info */}
        <div className="bg-gray-50 p-3 rounded-md border mb-6 text-sm">
          <p>
            <strong>Paciente:</strong> {patient.name}
          </p>
          <p>
            <strong>CPF:</strong> {patient.cpf || "---"} | <strong>Idade:</strong>{" "}
            {patient.age} anos | <strong>Sexo:</strong> {patient.sex === "M" ? "Masc." : "Fem."}
          </p>
          <p>
            <strong>Data do Documento:</strong> {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="text-sm font-bold border-b pb-1 mb-2">
            {type === "prescription" ? "Medicamentos" : "Exames Solicitados"}
          </h3>

          {type === "prescription" ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Medicamento</th>
                  <th className="p-2">Dose</th>
                  <th className="p-2">Via</th>
                  <th className="p-2">Frequência</th>
                  <th className="p-2">Duração</th>
                </tr>
              </thead>
              <tbody>
                {items.map((med, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 font-medium">{med.name}</td>
                    <td className="p-2">{med.dose}</td>
                    <td className="p-2">{med.route}</td>
                    <td className="p-2">{med.frequency}</td>
                    <td className="p-2">{med.duration || "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Nome do Exame</th>
                  <th className="p-2">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {items.map((exam, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 font-medium">{exam.name}</td>
                    <td className="p-2 capitalize">{exam.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-6 text-sm">
            <h3 className="font-bold border-b pb-1 mb-1">
              {type === "prescription" ? "Observações / Recomendações" : "Justificativa / Indicação Clínica"}
            </h3>
            <p className="whitespace-pre-wrap text-gray-700">{notes}</p>
          </div>
        )}
      </div>

      {/* Signature and verification */}
      <div className="mt-12 pt-8 flex justify-between items-end border-t border-gray-200">
        <div>
          <p className="font-medium text-black">Profissional Responsável</p>
          <div className="mt-8 pt-2 w-48 text-center border-t border-black">
            <p className="font-semibold text-xs">{professionalLabel}</p>
            <p className="text-[10px] text-gray-500">Assinatura Eletrônica</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <img
            src={qrCodeUrl}
            alt="Código de Verificação"
            className="h-20 w-20 object-contain"
          />
          <span className="text-[8px] text-gray-500 text-center">
            Escaneie para verificar<br />a veracidade
          </span>
        </div>
      </div>

      {/* Footer (Address) */}
      <div
        className="print-footer mt-8 pt-4 text-center text-xs text-gray-600 border-t"
        style={{ borderTopColor: clinicData.primaryColor }}
      >
        <p className="font-medium">{clinicData.address}</p>
        <p className="text-[10px] text-gray-500 mt-1">
          Documento gerado eletronicamente por Pulse PEP em{" "}
          {new Date().toLocaleDateString("pt-BR")} às{" "}
          {new Date().toLocaleTimeString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
