type RequestStatus = "Aprovada" | "Pendente" | "Concluída" | "Recusada";

type Request = {
  id: number;
  name: string;
  plate: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  reason?: string;
  finalidade?: string;
  purpose?: string;
  motivo?: string;
  createdAt?: string;
  status: RequestStatus;
};

export const requests: Request[] = [
  {
    id: 1,
    name: "Fiat Strada",
    plate: "BRA-2E19",
    date: "2025-04-25",
    startTime: "08:00",
    endTime: "10:00",
    location: "Centro Administrativo",
    reason: "Teste com veículo em manutenção",
    status: "Aprovada",
  },
  {
    id: 2,
    name: "Renault Kangoo",
    plate: "MUN-8H44",
    date: "2025-04-26",
    startTime: "09:00",
    endTime: "11:30",
    location: "Bairro Jardim Sul",
    reason: "Vistoria externa da equipe",
    status: "Pendente",
  },
  {
    id: 3,
    name: "Toyota Hilux",
    plate: "GOV-9P77",
    date: "2025-04-20",
    startTime: "14:00",
    endTime: "16:00",
    location: "Almoxarifado Central",
    reason: "Retirada de materiais",
    status: "Concluída",
  },
  {
    id: 4,
    name: "VW Saveiro",
    plate: "RIO-5K22",
    date: "2025-04-22",
    startTime: "13:00",
    endTime: "15:00",
    location: "Distrito Industrial",
    reason: "Atendimento de demanda externa",
    status: "Recusada",
  },
  {
    id: 5,
    name: "Toyota Hilux",
    plate: "GOV-9P77",
    date: "2025-04-20",
    startTime: "08:30",
    endTime: "10:30",
    location: "Almoxarifado Central",
    reason: "Entrega de documentos",
    status: "Concluída",
  },
  {
    id: 6,
    name: "VW Saveiro",
    plate: "RIO-5K22",
    date: "2025-04-22",
    startTime: "15:00",
    endTime: "17:00",
    location: "Distrito Industrial",
    reason: "Visita técnica programada",
    status: "Recusada",
  },
  {
    id: 7,
    name: "Toyota Hilux",
    plate: "GOV-9P77",
    date: "2025-04-20",
    startTime: "10:00",
    endTime: "12:00",
    location: "Almoxarifado Central",
    reason: "Apoio operacional",
    status: "Concluída",
  },
  {
    id: 8,
    name: "VW Saveiro",
    plate: "RIO-5K22",
    date: "2025-04-22",
    startTime: "07:30",
    endTime: "09:30",
    location: "Distrito Industrial",
    reason: "Deslocamento para inspeção",
    status: "Recusada",
  },
];
