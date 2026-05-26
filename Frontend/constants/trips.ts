export type TripStatus = "scheduled" | "in_progress" | "finished";

export type Trip = {
  id: number;
  destination: string;
  date: string;
  time: string;
  vehicle: string;
  plate: string;
  status: TripStatus;
  period: "today" | "next";
};

export const trips: Trip[] = [
  {
    id: 1,
    destination: "Centro Administrativo",
    date: "Hoje",
    time: "08:00",
    vehicle: "Fiat Strada",
    plate: "BRA-2E19",
    status: "scheduled",
    period: "today",
  },
  {
    id: 2,
    destination: "Almoxarifado Central",
    date: "Hoje",
    time: "14:00",
    vehicle: "Toyota Hilux",
    plate: "GOV-9P77",
    status: "in_progress",
    period: "today",
  },
  {
    id: 3,
    destination: "Bairro Jardim Sul",
    date: "26 de mai.",
    time: "09:00",
    vehicle: "Renault Kangoo",
    plate: "MUN-8H44",
    status: "scheduled",
    period: "next",
  },
  {
    id: 4,
    destination: "Distrito Industrial",
    date: "28 de mai.",
    time: "13:00",
    vehicle: "Fiat Strada",
    plate: "BRA-2E19",
    status: "scheduled",
    period: "next",
  },
];