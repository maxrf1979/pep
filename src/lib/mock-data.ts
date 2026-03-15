export interface Patient {
  id: string;
  name: string;
  cpf: string;
  sus?: string;
  birthDate: string;
  age: number;
  sex: "M" | "F";
  phone: string;
  email?: string;
  bloodType?: string;
  allergies: string[];
  lastVisit: string;
  status: "internado" | "ambulatorial" | "alta" | "obito";
  deathDate?: string;
}

export interface VitalSign {
  id: string;
  patientId: string;
  temperature?: number;
  bloodPressure?: string; // "120/80"
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  date?: string;
  professional?: string;
  created_at: string;
}

export interface Evolution {
  id: string;
  patientId: string;
  userId: string;
  type: "medica" | "enfermagem";
  description: string;
  created_at: string;
}

export interface PrescriptionMedication {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medication: string;
  dosage: string;
  instructions?: string;
  type: "normal" | "especial";
  status?: "ativa" | "encerrada" | "suspensa";
  date?: string;
  medications?: PrescriptionMedication[];
  notes?: string;
  professional?: string;
  created_at: string;
}

export type Exam = ExamRequest;

export interface Certificate {
  id: string;
  patientId: string;
  doctorId: string;
  daysOff: number;
  description: string;
  created_at: string;
}

export interface ExamRequest {
  id: string;
  patientId: string;
  doctorId: string;
  examName: string;
  observations?: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  type: "evolucao_medica" | "evolucao_enfermagem" | "sinais_vitais" | "prescricao" | "exame" | "anexo";
  date: string;
  title: string;
  summary: string;
  professional: string;
  details?: string;
  fileData?: string;
}

export const patients: Patient[] = [
  {
    id: "p-001",
    name: "João Carlos da Silva",
    cpf: "123.456.789-00",
    sus: "898 0012 3456 7890",
    birthDate: "1958-03-15",
    age: 67,
    sex: "M",
    phone: "(11) 98765-4321",
    email: "joao.silva@email.com",
    bloodType: "O+",
    allergies: ["Dipirona", "Penicilina"],
    lastVisit: "2026-03-13",
    status: "internado",
  },
  {
    id: "p-002",
    name: "Maria Aparecida Santos",
    cpf: "987.654.321-00",
    sus: "898 0098 7654 3210",
    birthDate: "1985-07-22",
    age: 40,
    sex: "F",
    phone: "(11) 91234-5678",
    bloodType: "A+",
    allergies: [],
    lastVisit: "2026-03-14",
    status: "ambulatorial",
  },
];

export const vitalSigns: VitalSign[] = [
  {
    id: "vs-001",
    patientId: "p-001",
    temperature: 36.5,
    heartRate: 78,
    bloodPressure: "130/85",
    respiratoryRate: 18,
    oxygenSaturation: 96,
    weight: 82,
    height: 1.75,
    created_at: "2026-03-14T08:00:00",
  },
];

export const evolutions: Evolution[] = [
  {
    id: "ev-001",
    patientId: "p-001",
    userId: "u-001",
    type: "medica",
    description: "Paciente estável, melhora do quadro respiratório. Mantida antibioticoterapia EV.",
    created_at: "2026-03-14T09:30:00",
  },
];

export const prescriptions: Prescription[] = [
  {
    id: "rx-001",
    patientId: "p-001",
    doctorId: "u-001",
    medication: "Ceftriaxona",
    dosage: "1g",
    instructions: "EV 12/12h por 7 dias",
    type: "normal",
    created_at: "2026-03-13T14:00:00",
  },
  {
    id: "rx-002",
    patientId: "p-001",
    doctorId: "u-001",
    medication: "Dipirona",
    dosage: "1g",
    instructions: "EV 6/6h SOS em febre",
    type: "normal",
    created_at: "2026-03-13T14:00:00",
  },
];

export const certificates: Certificate[] = [];

export const examRequests: ExamRequest[] = [
  {
    id: "ex-001",
    patientId: "p-001",
    doctorId: "u-001",
    examName: "Hemograma Completo",
    observations: "Controle de infecção",
    created_at: "2026-03-12T10:00:00",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "t-001",
    patientId: "p-001",
    type: "evolucao_medica",
    date: "2026-03-14T09:30:00",
    title: "Evolução Médica",
    summary: "Paciente estável, melhora do quadro respiratório.",
    professional: "Dr. Ricardo Almeida",
  },
  {
    id: "t-002",
    patientId: "p-001",
    type: "sinais_vitais",
    date: "2026-03-14T08:00:00",
    title: "Sinais Vitais",
    summary: "T 36.5°C | FC 78bpm | PA 130/85",
    professional: "Enf. Carla Souza",
  },
];

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function getPatientTimeline(id: string): TimelineEvent[] {
  return timelineEvents
    .filter((e) => e.patientId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPatientVitals(id: string): VitalSign[] {
  return vitalSigns
    .filter((v) => v.patientId === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getPatientPrescriptions(id: string): Prescription[] {
  return prescriptions
    .filter((p) => p.patientId === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getPatientExams(id: string): ExamRequest[] {
  return examRequests
    .filter((e) => e.patientId === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
