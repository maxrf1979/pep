import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Patient } from "@/lib/mock-data";
import { getRandomUUID } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patient: Patient) => void;
}

const cpfMask = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const phoneMask = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const calcAge = (birth: string) => {
  const d = new Date(birth);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age;
};

export default function NovoPacienteDialog({ open, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState({
    name: "", cpf: "", sus: "", birthDate: "", sex: "M" as "M" | "F",
    phone: "", email: "", bloodType: "", allergies: "",
    status: "ambulatorial" as Patient["status"],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome obrigatório";
    if (form.cpf.replace(/\D/g, "").length !== 11) e.cpf = "CPF inválido";
    if (!form.birthDate) e.birthDate = "Data obrigatória";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Telefone inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const patient: Patient = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      cpf: form.cpf,
      sus: form.sus || undefined,
      birthDate: form.birthDate,
      age: calcAge(form.birthDate),
      sex: form.sex,
      phone: form.phone,
      email: form.email || undefined,
      bloodType: form.bloodType || undefined,
      allergies: form.allergies ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean) : [],
      lastVisit: new Date().toISOString().split("T")[0],
      status: form.status,
    };
    onSave(patient);
    setForm({ name: "", cpf: "", sus: "", birthDate: "", sex: "M", phone: "", email: "", bloodType: "", allergies: "", status: "ambulatorial" });
    setErrors({});
    onOpenChange(false);
  };

  const inputCls = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome completo *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls("name")} placeholder="Nome do paciente" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* CPF */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">CPF *</label>
              <input value={form.cpf} onChange={(e) => set("cpf", cpfMask(e.target.value))} className={inputCls("cpf")} placeholder="000.000.000-00" />
              {errors.cpf && <p className="text-xs text-destructive mt-1">{errors.cpf}</p>}
            </div>
            {/* SUS */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cartão SUS</label>
              <input value={form.sus} onChange={(e) => set("sus", e.target.value.replace(/\D/g, "").slice(0, 15))} className={inputCls("sus")} placeholder="Opcional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Nascimento */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Data de nascimento *</label>
              <input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} className={inputCls("birthDate")} />
              {errors.birthDate && <p className="text-xs text-destructive mt-1">{errors.birthDate}</p>}
            </div>
            {/* Sexo */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Sexo</label>
              <select value={form.sex} onChange={(e) => set("sex", e.target.value)} className={inputCls("")}>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Telefone */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Telefone *</label>
              <input value={form.phone} onChange={(e) => set("phone", phoneMask(e.target.value))} className={inputCls("phone")} placeholder="(00) 00000-0000" />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls("")} placeholder="Opcional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tipo sanguíneo */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo sanguíneo</label>
              <select value={form.bloodType} onChange={(e) => set("bloodType", e.target.value)} className={inputCls("")}>
                <option value="">Selecionar</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Status */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls("")}>
                <option value="ambulatorial">Ambulatorial</option>
                <option value="internado">Internado</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Alergias */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Alergias (separar por vírgula)</label>
            <input value={form.allergies} onChange={(e) => set("allergies", e.target.value)} className={inputCls("")} placeholder="Ex: Dipirona, Penicilina" />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Salvar Paciente
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
