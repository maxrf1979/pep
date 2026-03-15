import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface NovoAtestadoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: { daysOff: number; description: string }) => void;
}

export function NovoAtestadoDialog({ open, onOpenChange, onSave }: NovoAtestadoDialogProps) {
  const [days, setDays] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!days || !desc) {
      setError("Preencha todos os campos.");
      return;
    }
    onSave({ daysOff: parseInt(days), description: desc });
    setDays("");
    setDesc("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Emitir Atestado Médico
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Dias de Afastamento *</label>
            <input 
              type="number" 
              value={days} 
              onChange={(e) => { setDays(e.target.value); setError(""); }} 
              className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" 
              placeholder="Ex: 3" 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Descrição / Diagnóstico *</label>
            <textarea 
              value={desc} 
              onChange={(e) => { setDesc(e.target.value); setError(""); }} 
              rows={4} 
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none" 
              placeholder="Descrição do motivo do afastamento..." 
            />
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Emitir Atestado
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
