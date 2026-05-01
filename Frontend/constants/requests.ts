
type RequestStatus = "Aprovada" | "Pendente" | "Concluída" | "Recusada";

type Request = {
  id: number;
  name: string;
  plate: string;
  date: string;
  location: string;
  status: RequestStatus;
};

export const requests: Request[] = [
  {
    id: 1,
    name: "Fiat Strada",
    plate: "BRA-2E19",
    date: "2025-04-25",
    location: "Centro Administrativo",
    status: "Aprovada",
  },
  {
  id: 2,
  name: "Renault Kangoo",
  plate: "MUN-8H44",
  date: "2025-04-26",
  location: "Bairro Jardim Sul",
  status: "Pendente",
},
{
  id: 3,
  name: "Toyota Hilux",
  plate: "GOV-9P77",
  date: "2025-04-20",
  location: "Almoxarifado Central",
  status: "Concluída",
},
{
  id: 4,
  name: "VW Saveiro",
  plate: "RIO-5K22",
  date: "2025-04-22",
  location: "Distrito Industrial",
  status: "Recusada",
}
];