export type NormalizedVehicleStatus =
  | "available"
  | "in_use"
  | "maintenance"
  | "unavailable";

export type Vehicle = {
  id: number;
  name?: string;
  model?: string;
  plate: string;
  year?: number;
  odometer?: number;
  imageUrl?: string | null;
  status: string;
  type?: string;
};

export const normalizeVehicleStatus = (
  status?: string | null
): NormalizedVehicleStatus => {
  switch ((status ?? "").toLowerCase()) {
    case "available":
      return "available";
    case "in_use":
      return "in_use";
    case "maintenance":
      return "maintenance";
    case "unavailable":
      return "unavailable";
    default:
      return "unavailable";
  }
};

export const getVehicleStatusMeta = (status?: string | null) => {
  const normalizedStatus = normalizeVehicleStatus(status);

  switch (normalizedStatus) {
    case "available":
      return {
        label: "Disponível",
        bg: "#DCFCE7",
        color: "#166534",
        dot: "#16A34A",
      };
    case "in_use":
      return {
        label: "Em uso",
        bg: "#DBEAFE",
        color: "#1E3A8A",
        dot: "#2563EB",
      };
    case "maintenance":
      return {
        label: "Manutenção",
        bg: "#FEF3C7",
        color: "#92400E",
        dot: "#D97706",
      };
    default:
      return {
        label: "Indisponível",
        bg: "#FEE2E2",
        color: "#991B1B",
        dot: "#DC2626",
      };
  }
};

export const getVehicleDisplayName = (vehicle: Vehicle) =>
  vehicle.model ?? vehicle.name ?? "Veículo";

export const formatVehicleType = (type?: string | null) => {
  switch ((type ?? "").toUpperCase()) {
    case "CAR":
      return "Carro";
    case "VAN":
      return "Van";
    case "TRUCK":
      return "Caminhão";
    case "MOTORCYCLE":
      return "Moto";
    default:
      return type ?? "Não informado";
  }
};

export const vehicles: Vehicle[] = [
  {
    id: 1,
    name: "Fiat Uno",
    model: "Fiat Uno",
    plate: "ABC1234",
    year: 2020,
    odometer: 10000,
    imageUrl: null,
    status: "AVAILABLE",
    type: "CAR",
  },
  {
    id: 2,
    name: "Fiat Strada",
    model: "Fiat Strada",
    plate: "BRA2E19",
    year: 2021,
    odometer: 24500,
    imageUrl: null,
    status: "available",
    type: "CAR",
  },
  {
    id: 3,
    name: "Renault Kangoo",
    model: "Renault Kangoo",
    plate: "MUN8H44",
    year: 2019,
    odometer: 38600,
    imageUrl: null,
    status: "in_use",
    type: "VAN",
  },
  {
    id: 4,
    name: "Chevrolet Onix",
    model: "Chevrolet Onix",
    plate: "MUN5E55",
    year: 2022,
    odometer: 14200,
    imageUrl: null,
    status: "MAINTENANCE",
    type: "CAR",
  },
];
