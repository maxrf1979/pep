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
  status: "internado" | "ambulatorial" | "alta";
}

export interface VitalSign {
  id: string;
  patientId: string;
  date: string;
  temperature: number;
  heartRate: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight?: number;
  height?: number;
  bmi?: number;
  professional: string;
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
  {
    id: "p-003",
    name: "Pedro Henrique Oliveira",
    cpf: "456.789.123-00",
    birthDate: "1972-11-08",
    age: 53,
    sex: "M",
    phone: "(21) 99876-5432",
    bloodType: "B-",
    allergies: ["Ibuprofeno"],
    lastVisit: "2026-03-12",
    status: "ambulatorial",
  },
  {
    id: "p-004",
    name: "Ana Beatriz Lima Ferreira",
    cpf: "321.654.987-00",
    sus: "898 0032 1654 9870",
    birthDate: "1995-01-30",
    age: 31,
    sex: "F",
    phone: "(31) 98765-1234",
    bloodType: "AB+",
    allergies: ["Sulfa", "Latex"],
    lastVisit: "2026-03-14",
    status: "internado",
  },
  {
    id: "p-005",
    name: "Carlos Eduardo Mendes",
    cpf: "654.321.987-00",
    birthDate: "1948-06-12",
    age: 77,
    sex: "M",
    phone: "(11) 97654-3210",
    bloodType: "O-",
    allergies: ["AAS"],
    lastVisit: "2026-03-10",
    status: "alta",
  },
  {
    id: "p-006",
    name: "Fernanda Costa Ribeiro",
    cpf: "789.123.456-00",
    birthDate: "1990-09-18",
    age: 35,
    sex: "F",
    phone: "(21) 91234-9876",
    bloodType: "A-",
    allergies: [],
    lastVisit: "2026-03-13",
    status: "ambulatorial",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "ev-001",
    patientId: "p-001",
    type: "evolucao_medica",
    date: "2026-03-14T09:30:00",
    title: "Evolução Médica",
    summary: "Paciente estável, melhora do quadro respiratório. Mantida antibioticoterapia EV. Sem febre nas últimas 24h.",
    professional: "Dr. Ricardo Almeida — CRM 12345/SP",
    details: "QP: Dispneia aos esforços moderados.\nHDA: Paciente com pneumonia comunitária, 5º dia de internação. Melhora progressiva.\nExame Físico: MV+ bilateralmente, estertores em base D reduzidos. FR 18ipm. SpO2 96% em AA.\nConduta: Manter Ceftriaxona 1g EV 12/12h. Solicitar RX tórax controle.",
  },
  {
    id: "ev-002",
    patientId: "p-001",
    type: "sinais_vitais",
    date: "2026-03-14T08:00:00",
    title: "Sinais Vitais",
    summary: "T 36.5°C | FC 78bpm | PA 130/85mmHg | FR 18ipm | SpO2 96%",
    professional: "Enf. Carla Souza — COREN 54321/SP",
  },
  {
    id: "ev-003",
    patientId: "p-001",
    type: "prescricao",
    date: "2026-03-13T14:00:00",
    title: "Prescrição Médica",
    summary: "Ceftriaxona 1g EV 12/12h, Dipirona 1g EV 6/6h SOS, Omeprazol 40mg EV 1x/dia",
    professional: "Dr. Ricardo Almeida — CRM 12345/SP",
  },
  {
    id: "ev-004",
    patientId: "p-001",
    type: "exame",
    date: "2026-03-13T10:00:00",
    title: "Resultado de Exame — Hemograma",
    summary: "Leucócitos 9.800/mm³ (normalizado), PCR 12mg/L (em queda). Resultado dentro de parâmetros aceitáveis.",
    professional: "Lab. Central — Dr. Marcos Lima",
  },
  {
    id: "ev-005",
    patientId: "p-001",
    type: "evolucao_enfermagem",
    date: "2026-03-13T07:00:00",
    title: "Evolução de Enfermagem",
    summary: "Paciente acordou bem disposto, aceitou dieta VO sem queixas. Acesso venoso periférico em MSD pérvio, sem sinais flogísticos.",
    professional: "Enf. Carla Souza — COREN 54321/SP",
  },
  {
    id: "ev-006",
    patientId: "p-001",
    type: "anexo",
    date: "2026-03-12T16:00:00",
    title: "RX Tórax — Admissão",
    summary: "Radiografia de tórax PA e perfil. Consolidação em base pulmonar direita compatível com pneumonia.",
    professional: "Dr. Ana Paula — CRM 67890/SP",
  },
  {
    id: "ev-007",
    patientId: "p-001",
    type: "evolucao_medica",
    date: "2026-03-12T11:00:00",
    title: "Admissão Hospitalar",
    summary: "Internação por pneumonia comunitária. Iniciado esquema antibiótico. Paciente com queixa de tosse produtiva há 5 dias, febre 38.5°C.",
    professional: "Dr. Ricardo Almeida — CRM 12345/SP",
  },
];

export const vitalSigns: VitalSign[] = [
  {
    id: "vs-001",
    patientId: "p-001",
    date: "2026-03-14T08:00:00",
    temperature: 36.5,
    heartRate: 78,
    bloodPressureSys: 130,
    bloodPressureDia: 85,
    respiratoryRate: 18,
    oxygenSaturation: 96,
    weight: 82,
    height: 1.75,
    bmi: 26.8,
    professional: "Enf. Carla Souza",
  },
  {
    id: "vs-002",
    patientId: "p-001",
    date: "2026-03-13T20:00:00",
    temperature: 36.8,
    heartRate: 82,
    bloodPressureSys: 128,
    bloodPressureDia: 82,
    respiratoryRate: 19,
    oxygenSaturation: 95,
    professional: "Enf. Paulo Martins",
  },
  {
    id: "vs-003",
    patientId: "p-001",
    date: "2026-03-13T08:00:00",
    temperature: 37.2,
    heartRate: 88,
    bloodPressureSys: 135,
    bloodPressureDia: 88,
    respiratoryRate: 20,
    oxygenSaturation: 94,
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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
