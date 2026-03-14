import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ExamField {
  id: string;
  name: string;
  type: string;
}

interface RequestExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName?: string;
}

const EXAM_TYPES = [
  "Laboratorial",
  "Imagem",
  "Eletrocardiograma",
  "Ultrassom",
  "Tomografia",
  "Ressonância Magnética",
  "Endoscopia",
];

export function RequestExamDialog({
  open,
  onOpenChange,
  patientName = "",
}: RequestExamDialogProps) {
  const [exams, setExams] = useState<ExamField[]>([
    { id: "1", name: "", type: "Laboratorial" },
  ]);
  const [justification, setJustification] = useState("");

  const addExam = () => {
    const newId = String(Math.max(...exams.map((e) => parseInt(e.id) || 0)) + 1);
    setExams([...exams, { id: newId, name: "", type: "Laboratorial" }]);
  };

  const removeExam = (id: string) => {
    if (exams.length > 1) {
      setExams(exams.filter((exam) => exam.id !== id));
    }
  };

  const updateExam = (
    id: string,
    field: "name" | "type",
    value: string
  ) => {
    setExams(
      exams.map((exam) =>
        exam.id === id ? { ...exam, [field]: value } : exam
      )
    );
  };

  const handleSubmit = () => {
    // TODO: Implement submit logic
    console.log("Exames solicitados:", { exams, justification });
    onOpenChange(false);
    // Reset form
    setExams([{ id: "1", name: "", type: "Laboratorial" }]);
    setJustification("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Exame</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Patient */}
          <div>
            <Label htmlFor="patient" className="text-sm font-medium">
              Paciente <span className="text-destructive">*</span>
            </Label>
            <Input
              id="patient"
              value={patientName}
              disabled
              className="mt-1"
            />
          </div>

          {/* Exams Header */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Exames</Label>
            <button
              onClick={addExam}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar exame
            </button>
          </div>

          {/* Exams */}
          <div className="space-y-3">
            {exams.map((exam, index) => (
              <div key={exam.id} className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Exame {index + 1}</span>
                  {exams.length > 1 && (
                    <button
                      onClick={() => removeExam(exam.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remover exame"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-xs font-medium">Nome do exame</Label>
                    <Input
                      placeholder="Ex: Hemograma Completo"
                      value={exam.name}
                      onChange={(e) =>
                        updateExam(exam.id, "name", e.target.value)
                      }
                      className="text-sm mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Tipo</Label>
                    <Select
                      value={exam.type}
                      onValueChange={(value) =>
                        updateExam(exam.id, "type", value)
                      }
                    >
                      <SelectTrigger className="text-sm mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXAM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Justification */}
          <div>
            <Label htmlFor="justification" className="text-sm font-medium">
              Justificativa / Observações
            </Label>
            <Textarea
              id="justification"
              placeholder="Digite as justificativas ou observações para os exames..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="mt-1 min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Solicitar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
