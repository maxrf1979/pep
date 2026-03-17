import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, X } from "lucide-react";
import { type TimelineEvent, type Patient } from "@/lib/mock-data";
import { PrintableDocument } from "./PrintableDocument";

interface VisualizarEvolucaoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  evolucao: TimelineEvent | null;
  patient: Patient | null;
}

export function VisualizarEvolucaoDialog({ open, onOpenChange, evolucao, patient }: VisualizarEvolucaoDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!evolucao || !patient) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const isEvolucaoMedica = evolucao.type === "evolucao_medica";
  const label = isEvolucaoMedica ? "Evolução Médica" : "Evolução de Enfermagem";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{label}</DialogTitle>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Paciente */}
            <div className="bg-muted/30 p-4 rounded-md border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Paciente
              </p>
              <p className="text-base font-semibold">{patient.name}</p>
              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                <span>{patient.age} anos</span>
                <span>•</span>
                <span>{patient.sex === "M" ? "Masculino" : "Feminino"}</span>
                <span>•</span>
                <span>CPF: {patient.cpf}</span>
              </div>
              {patient.allergies.length > 0 && (
                <div className="mt-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded inline-block">
                  ⚠ Alergias: {patient.allergies.join(", ")}
                </div>
              )}
            </div>

            {/* Informações da Evolução */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Data e Hora
                </label>
                <p className="text-sm mt-1">
                  {new Date(evolucao.date).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Profissional
                </label>
                <p className="text-sm mt-1">{evolucao.professional}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Título
                </label>
                <p className="text-sm mt-1">{evolucao.title}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resumo
                </label>
                <p className="text-sm mt-1">{evolucao.summary}</p>
              </div>

              {evolucao.details && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Descrição Completa
                  </label>
                  <div className="text-sm mt-1 bg-muted/30 p-3 rounded-md border border-border whitespace-pre-wrap">
                    {evolucao.details}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Componente de impressão */}
      {isPrinting && (
        <PrintableDocument
          type="evolucao"
          patient={{
            name: patient.name,
            age: patient.age,
            cpf: patient.cpf,
            sex: patient.sex,
          }}
          evolucao={{
            type: label,
            date: new Date(evolucao.date).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            title: evolucao.title,
            summary: evolucao.summary,
            details: evolucao.details || "",
          }}
          professionalLabel={evolucao.professional}
        />
      )}
    </>
  );
}
