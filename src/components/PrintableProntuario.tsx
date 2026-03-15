import { createPortal } from "react-dom";
import { type Patient, type VitalSign, type Prescription, type ExamRequest, type TimelineEvent, patients, vitalSigns, prescriptions, examRequests, timelineEvents } from "@/lib/mock-data";

interface PrintableProntuarioProps {
  patientId: string;
}

export function PrintableProntuario({ patientId }: PrintableProntuarioProps) {
  const clinicData = (() => {
    const saved = localStorage.getItem("clinicSettings");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Pulse Clínica Médica",
          cnpj: "12.345.678/0001-90",
          phone: "(11) 3456-7890",
          email: "contato@pulsesecond.com.br",
          address: "Av. Paulista, 1000 - São Paulo, SP",
          logo: null,
        };
  })();

  const allPatients: Patient[] = (() => {
    const saved = localStorage.getItem("patients");
    return saved ? JSON.parse(saved) : patients;
  })();

  const patient = allPatients.find((p) => p.id === patientId);

  // Load and combine data like local dashboards
  const combinedVitals: VitalSign[] = (() => {
    const saved = localStorage.getItem("localVitals");
    const local = saved ? JSON.parse(saved) : [];
    return [...local, ...vitalSigns]
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  })();

  const combinedPrescriptions: Prescription[] = (() => {
    const saved = localStorage.getItem("localPrescriptions");
    const local = saved ? JSON.parse(saved) : [];
    return [...local, ...prescriptions]
      .filter((p) => p.patientId === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  })();

  const combinedExams: ExamRequest[] = (() => {
    const saved = localStorage.getItem("localExams");
    const local = saved ? JSON.parse(saved) : [];
    return [...local, ...examRequests]
      .filter((e) => e.patientId === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  })();

  const combinedTimeline: TimelineEvent[] = (() => {
    const saved = localStorage.getItem("pep-timeline");
    const local = saved ? JSON.parse(saved) : [];
    // Ensure static timeline gets added and merged correctly
    const all = saved ? local : [...local, ...timelineEvents];
    return all
      .filter((ev) => ev.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  if (!patient) return null;

  return createPortal(
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] printable-content px-4 py-2 font-sans text-xs">
      {/* Header institucional */}
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          {clinicData.logo ? (
            <img src={clinicData.logo} alt="Logo" className="h-10 w-10 object-contain" />
          ) : (
            <div className="text-xl">ðŸ¥</div>
          )}
          <div>
            <h1 className="text-sm font-bold">{clinicData.name}</h1>
            <p className="text-[10px] text-gray-600">CNPJ: {clinicData.cnpj}</p>
          </div>
        </div>
        <div className="text-right text-[10px] text-gray-600">
          <p>{clinicData.address}</p>
          <p>Tel: {clinicData.phone} | {clinicData.email}</p>
          <p>Impressão: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-base font-bold tracking-wider uppercase">Prontuário Médico do Paciente</h2>
      </div>

      {/* Identificação do Paciente */}
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-5">
        <h3 className="text-xs font-bold mb-2 border-b border-gray-300 pb-1">Identificação do Paciente</h3>
        <div className="grid grid-cols-3 gap-y-1.5 gap-x-4 text-[11px]">
          <div><span className="font-semibold text-gray-500">Nome:</span> <span className="font-medium text-gray-900">{patient.name}</span></div>
          <div><span className="font-semibold text-gray-500">Idade:</span> <span className="font-medium text-gray-900">{patient.age} anos</span></div>
          <div><span className="font-semibold text-gray-500">Sexo:</span> <span className="font-medium text-gray-900">{patient.sex === "M" ? "Masculino" : "Feminino"}</span></div>
          <div><span className="font-semibold text-gray-500">CPF:</span> <span className="font-medium text-gray-900 tabular-nums">{patient.cpf}</span></div>
          <div><span className="font-semibold text-gray-500">RG:</span> <span className="font-medium text-gray-900 tabular-nums">---</span></div>
          <div><span className="font-semibold text-gray-500">Cartão SUS:</span> <span className="font-medium text-gray-900 tabular-nums">{patient.sus || "---"}</span></div>
          <div><span className="font-semibold text-gray-500">Telefone:</span> <span className="font-medium text-gray-900">{patient.phone}</span></div>
          <div className="col-span-2"><span className="font-semibold text-gray-500">Endereço:</span> <span className="font-medium text-gray-900">Av. Paulista, 1000 - São Paulo, SP</span></div>
          <div className="col-span-3 text-red-600 font-semibold">
            {patient.allergies.length > 0 ? `Alergias: ${patient.allergies.join(", ")}` : "Sem alergias conhecidas"}
          </div>
        </div>
      </div>

      {/* 2 â€“ Sinais Vitais */}
      {combinedVitals.length > 0 && (
        <div className="section-block mb-5">
          <h3 className="text-xs font-bold mb-1.5 bg-gray-100 px-2 py-0.5 rounded">1. Sinais Vitais</h3>
          <table className="min-w-full text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="text-left py-1">Data/Hora</th>
                <th className="text-center py-1">Temp (°C)</th>
                <th className="text-center py-1">FC (bpm)</th>
                <th className="text-center py-1">PA (mmHg)</th>
                <th className="text-center py-1">FR (ipm)</th>
                <th className="text-center py-1">SpO2</th>
                <th className="text-center py-1">Peso (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {combinedVitals.map((v) => (
                <tr key={v.id}>
                  <td className="py-1 tabular-nums">{new Date(v.created_at).toLocaleDateString("pt-BR")} {new Date(v.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="text-center tabular-nums">{v.temperature.toFixed(1)}</td>
                  <td className="text-center tabular-nums">{v.heartRate}</td>
                  <td className="text-center tabular-nums">{v.bloodPressure}</td>
                  <td className="text-center tabular-nums">{v.respiratoryRate}</td>
                  <td className="text-center tabular-nums">{v.oxygenSaturation}%</td>
                  <td className="text-center tabular-nums">{v.weight ? `${v.weight}kg` : "---"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3 â€“ Evoluções Clínicas */}
      {combinedTimeline.filter(e => e.type.startsWith("evolucao")).length > 0 && (
        <div className="section-block mb-5">
          <h3 className="text-xs font-bold mb-1.5 bg-gray-100 px-2 py-0.5 rounded">2. Evoluções Clínicas</h3>
          <div className="space-y-3">
            {combinedTimeline
              .filter(e => e.type.startsWith("evolucao"))
              .map((ev) => (
                <div key={ev.id} className="border-b border-gray-100 pb-2">
                  <div className="flex justify-between items-center text-[10px] text-gray-500 mb-0.5">
                    <span className="font-semibold text-primary">{ev.type === "evolucao_medica" ? "Médica" : "Enfermagem"}</span>
                    <span className="tabular-nums">{new Date(ev.date || (ev as any).created_at).toLocaleDateString("pt-BR")} {new Date(ev.date || (ev as any).created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{ev.details || ev.summary}</pre>
                  <p className="text-[10px] text-gray-400 mt-1">Responsável: {ev.professional}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5 â€“ Prescrições */}
      {combinedPrescriptions.length > 0 && (
        <div className="section-block mb-5">
          <h3 className="text-xs font-bold mb-1.5 bg-gray-100 px-2 py-0.5 rounded">3. Prescrições Médicas</h3>
          <table className="min-w-full text-[10px] border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="text-left py-1 px-2 border-r border-gray-200">Medicamento</th>
                <th className="text-left py-1 px-2 border-r border-gray-200">Dosagem</th>
                <th className="text-left py-1 px-2">Instruções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {combinedPrescriptions.map((px, i) => (
                <tr key={i}>
                  <td className="py-1 px-2 border-r border-gray-200 font-medium">{px.medication}</td>
                  <td className="py-1 px-2 border-r border-gray-200">{px.dosage}</td>
                  <td className="py-1 px-2">{px.instructions || "---"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6 â€“ Exames Solicitados */}
      {combinedExams.length > 0 && (
        <div className="section-block mb-5">
          <h3 className="text-xs font-bold mb-1.5 bg-gray-100 px-2 py-0.5 rounded">4. Exames Solicitados</h3>
          <table className="min-w-full text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="text-left py-1">Data Solicitação</th>
                <th className="text-left py-1">Exame</th>
                <th className="text-center py-1">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {combinedExams.map((e) => (
                <tr key={e.id}>
                  <td className="py-1 tabular-nums">{new Date(e.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="py-1 font-medium">{e.examName}</td>
                  <td className="text-center py-1 text-gray-500 text-[9px]">Solicitado</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rodapé fixo de impressão por página */}
      <div className="print-footer fixed bottom-0 left-0 right-0 border-t border-gray-300 pt-2 text-[9px] text-gray-500 flex justify-between">
        <div>Pulse PEP Clinic â€“ Prontuário Médico</div>
        <div>Paciente: {patient.name}</div>
        <div className="tabular-nums">Página <span className="print-page-number"></span></div>
      </div>
    </div>,
    document.body
  );
}

