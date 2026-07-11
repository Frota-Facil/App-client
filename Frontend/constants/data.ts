import { colors } from "./colors";

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
        bg: colors.successSoft,
        color: colors.successText,
        dot: colors.success,
      };
    case "in_use":
      return {
        label: "Em uso",
        bg: colors.primarySoft,
        color: colors.primaryActive,
        dot: colors.primary,
      };
    case "maintenance":
      return {
        label: "Manutenção",
        bg: colors.warningSoft,
        color: colors.warningText,
        dot: colors.warning,
      };
    default:
      return {
        label: "Indisponível",
        bg: colors.dangerSoft,
        color: colors.dangerText,
        dot: colors.dangerText,
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
