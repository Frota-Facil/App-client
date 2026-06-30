export type NormalizedVehicleStatus =
  | "available"
  | "in_use"
  | "maintenance"
  | "unavailable";

export type Vehicle = {
  id: string | number;
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
    case "TRACTOR":
      return "Trator";
    default:
      return type ?? "Não informado";
  }
};
