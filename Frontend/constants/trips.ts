export type TripStatus = "scheduled" | "in_progress" | "finished";

export type Trip = {
  id: number;
  destination: string;
  date: string;
  time: string;
  fullDate: string;
  startTime: string;
  endTime: string;
  startDateTime: string;
  vehicle: string;
  plate: string;
  passengers: number;
  purpose: string;
  status: TripStatus;
  period: "today" | "next";
};

export const trips: Trip[] = [
  {
    id: 1,
    destination: "Centro Administrativo",
    date: "Hoje",
    time: "08:00",
    fullDate: "quinta-feira, 28 de maio",
    startTime: "08:00",
    endTime: "12:00",
    startDateTime: "2026-05-28T08:00:00",
    vehicle: "Fiat Strada",
    plate: "BRA-2E19",
    passengers: 2,
    purpose: "Vistoria de obra na Rua das Flores",
    status: "scheduled",
    period: "today",
  },
  {
    id: 2,
    destination: "Almoxarifado Central",
    date: "Hoje",
    time: "14:00",
    fullDate: "quinta-feira, 28 de maio",
    startTime: "14:00",
    endTime: "17:00",
    startDateTime: "2026-05-28T14:00:00",
    vehicle: "Toyota Hilux",
    plate: "GOV-9P77",
    passengers: 3,
    purpose: "Retirada de materiais para manutenção predial",
    status: "in_progress",
    period: "today",
  },
  {
    id: 3,
    destination: "Bairro Jardim Sul",
    date: "29 de mai.",
    time: "09:00",
    fullDate: "sexta-feira, 29 de maio",
    startTime: "09:00",
    endTime: "11:00",
    startDateTime: "2026-05-29T09:00:00",
    vehicle: "Renault Kangoo",
    plate: "MUN-8H44",
    passengers: 4,
    purpose: "Visita técnica da equipe de infraestrutura",
    status: "scheduled",
    period: "next",
  },
  {
    id: 4,
    destination: "Distrito Industrial",
    date: "30 de mai.",
    time: "13:00",
    fullDate: "sábado, 30 de maio",
    startTime: "13:00",
    endTime: "16:00",
    startDateTime: "2026-05-30T13:00:00",
    vehicle: "Fiat Strada",
    plate: "BRA-2E19",
    passengers: 2,
    purpose: "Acompanhamento de serviço operacional",
    status: "scheduled",
    period: "next",
  },
];
