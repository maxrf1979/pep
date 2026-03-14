import { Heart } from "lucide-react";

export function ReportHeader() {
  const clinicData = (() => {
    const saved = localStorage.getItem("clinicSettings");
    return saved ? JSON.parse(saved) : {
      name: "Aurea Dental",
      cnpj: "12.345.678/0001-90",
      phone: "(11) 3456-7890",
      email: "contato@aureadental.com.br",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      hoursStart: "08:00",
      hoursEnd: "18:00",
      primaryColor: "#10B981",
      secondaryColor: "#10B981",
      logo: null,
      logoName: "logo.jpeg"
    };
  })();

  return (
    <div className="print-header" style={{ borderBottomColor: clinicData.primaryColor }}>
      <div className="flex justify-between items-start pb-4 mb-6" style={{ borderBottom: `2px solid ${clinicData.primaryColor}` }}>
        {/* Logo e Nome da Clínica */}
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
            <h1 className="text-xl font-bold" style={{ color: clinicData.primaryColor }}>
              {clinicData.name}
            </h1>
            <p className="text-xs text-gray-600">CNPJ: {clinicData.cnpj}</p>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="text-right text-xs text-gray-600">
          <p className="font-medium text-black">{clinicData.phone}</p>
          <p>{clinicData.email}</p>
          <p>{clinicData.address}</p>
          {clinicData.hoursStart && clinicData.hoursEnd && (
            <p className="mt-1 text-opacity-70">Horário: {clinicData.hoursStart} - {clinicData.hoursEnd}</p>
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
      name: "Aurea Dental",
      primaryColor: "#10B981",
    };
  })();

  return (
    <div
      className="print-footer mt-8 pt-6 text-xs text-gray-600"
      style={{ borderTop: `2px solid ${clinicData.primaryColor}` }}
    >
      <div className="flex justify-between items-end">
        <div>
          <p className="font-medium mb-2 text-black">Profissional Responsável</p>
          <p className="pt-2 w-40 text-center" style={{ borderTop: `1px solid black` }}>
            Assinatura e Carimbo
          </p>
        </div>

        <div className="text-center space-y-2">
          <p className="font-medium text-black">Informações do Documento</p>
          <div className="text-xs text-gray-600">
            <p>
              <strong>Data:</strong> {new Date().toLocaleDateString("pt-BR")}
            </p>
            <p>
              <strong>Hora:</strong> {new Date().toLocaleTimeString("pt-BR")}
            </p>
            <p>
              <strong>Instituição:</strong> {clinicData.name}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold mb-2 text-black">Pulse PEP</p>
          <p className="text-opacity-70 text-xs leading-tight">
            Sistema de<br />
            Gerenciamento<br />
            Eletrônico de<br />
            Prontuário
          </p>
        </div>
      </div>

      {/* Rodapé com informações da clínica */}
      <div className="mt-4 pt-3 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>
          © {new Date().getFullYear()} {clinicData.name}. Todos os direitos reservados. Documento confidencial.
        </p>
      </div>
    </div>
  );
}
