import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface AlterarStatusDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentStatus: string;
  onSave: (newStatus: string) => void;
}

const statusOptions = [
  { value: "internado", label: "Internado", color: "text-destructive" },
  { value: "ambulatorial", label: "Ambulatorial", color: "text-primary" },
  { value: "alta", label: "Alta", color: "text-success" },
  { value: "obito", label: "Óbito", color: "text-zinc-500" },
];

export function AlterarStatusDialog({ open, onOpenChange, currentStatus, onSave }: AlterarStatusDialogProps) {
  const [status, setStatus] = useState(currentStatus);

  const handleSave = () => {
    onSave(status);
    onOpenChange(false);
  };

  const inp = "w-full h-9 px-3 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Status do Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Novo Status *</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className={inp}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter className="mt-2 text-xs">
          <button 
            onClick={() => onOpenChange(false)} 
            className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
