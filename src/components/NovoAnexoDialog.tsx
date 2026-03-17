import { useState } from "react";
import { Paperclip, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { type TimelineEvent, type Patient } from "@/lib/mock-data";

interface NovoAnexoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (v: TimelineEvent) => void;
  initialPatientId?: string;
  patients: Patient[];
}

export function NovoAnexoDialog({ open, onOpenChange, onSave, initialPatientId, patients }: NovoAnexoDialogProps) {
  const [patientId, setPatientId] = useState(initialPatientId || "");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [isReading, setIsReading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!patientId) e.patientId = "Selecione um paciente";
    if (!title.trim()) e.title = "Título obrigatório";
    if (!fileName) e.file = "Arquivo obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    onSave({
      id: crypto.randomUUID(),
      patientId,
      type: "anexo",
      date: new Date().toISOString(),
      title: title.trim(),
      summary: summary.trim() || `Arquivo: ${fileName}`,
      professional: "Sistema — Usuário Atual",
      fileData: fileData
    });
    
    setPatientId(initialPatientId || "");
    setTitle("");
    setSummary("");
    setFileName("");
    setErrors({});
    onOpenChange(false);
  };

  const inp = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  const selectedPatient = patients.find(p => p.id === patientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anexar Arquivo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!initialPatientId ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Paciente *</label>
              <select value={patientId} onChange={(e) => { setPatientId(e.target.value); setErrors(er => ({ ...er, patientId: "" })); }} className={inp("patientId")}>
                <option value="">Selecionar paciente...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.patientId && <p className="text-xs text-destructive mt-1">{errors.patientId}</p>}
            </div>
          ) : (
            <div className="bg-muted/30 p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">Paciente</p>
              <p className="text-sm font-semibold">{selectedPatient?.name}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">Título do Anexo *</label>
            <input 
              value={title} 
              onChange={(e) => { setTitle(e.target.value); setErrors(er => ({ ...er, title: "" })); }} 
              className={inp("title")} 
              placeholder="Ex: Laudo Tomografia, Termo de Consentimento" 
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Descrição</label>
            <input 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)} 
              className={inp("")} 
              placeholder="Breve descrição do conteúdo" 
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Arquivo *</label>
            <div className={`mt-1 flex items-center justify-center border-2 border-dashed rounded-md p-6 transition-colors ${errors.file ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}>
              <div className="text-center">
                <Paperclip className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                <div className="mt-2 flex text-sm text-muted-foreground">
                  <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                    <span>Fazer upload</span>
                    <input type="file" className="sr-only" disabled={isReading} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileName(file.name);
                        setErrors(er => ({ ...er, file: "" }));
                        if (!title) setTitle(file.name.split('.')[0]);

                        setIsReading(true);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFileData(event.target?.result as string);
                          setIsReading(false);
                        };
                        reader.onerror = () => {
                          setIsReading(false);
                          toast.error("Erro ao ler o arquivo");
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                  <p className="pl-1 text-xs">ou arraste e solte</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG até 10MB</p>
              </div>
            </div>
            {fileName && (
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 px-2 py-1.5 rounded-md border border-primary/20">
                <Paperclip className="h-3 w-3" />
                <span className="truncate">{fileName}</span>
                <button onClick={() => setFileName("")} className="ml-auto text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {errors.file && <p className="text-xs text-destructive mt-1">{errors.file}</p>}
          </div>
        </div>
        <DialogFooter className="mt-2 text-xs">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={isReading} className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isReading ? "Carregando..." : "Anexar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
