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
    };
  })();

  return (
    <div className="print-header">
      <div className="flex justify-between items-start border-b-2 border-primary pb-4 mb-6">
        {/* Logo e Nome da Clínica */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground">
            <Heart className="h-6 w-6" strokeWidth={2} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">{clinicData.name}</h1>
            <p className="text-xs text-muted-foreground">CNPJ: {clinicData.cnpj}</p>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="text-right text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{clinicData.phone}</p>
          <p>{clinicData.email}</p>
          <p>{clinicData.address}</p>
        </div>
      </div>
    </div>
  );
}

export function ReportFooter() {
  return (
    <div className="print-footer border-t-2 border-primary mt-8 pt-6 text-xs text-muted-foreground">
      <div className="flex justify-between items-end">
        <div>
          <p className="font-medium mb-2">Profissional Responsável</p>
          <p className="border-t border-foreground pt-2 w-40 text-center">Assinatura e Carimbo</p>
        </div>
        <div className="text-center">
          <p className="font-medium mb-4">Informações do Documento</p>
          <p>Data: {new Date().toLocaleDateString("pt-BR")}</p>
          <p>Hora: {new Date().toLocaleTimeString("pt-BR")}</p>
          <p className="mt-2 text-opacity-50">Pulse PEP - Sistema de Gerenciamento Eletrônico de Prontuário</p>
        </div>
      </div>
    </div>
  );
}
