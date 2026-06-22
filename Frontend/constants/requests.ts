export const requestStatuses = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
] as const;

export type RequestStatus = (typeof requestStatuses)[number];

export type RequestStatusLabel =
  | "Pendente"
  | "Aprovada"
  | "Recusada"
  | "Concluída";

export type RequestVehicle = {
  id: string;
  plate: string;
  model: string;
  year: number;
  odometer: number;
  imageUrl: string | null;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE";
  type: "CAR" | "MOTORCYCLE" | "TRUCK" | "TRACTOR" | "VAN";
};

export type VehicleRequest = {
  id: string;
  userId: string;
  vehicleId: string;
  approvedBy: string | null;
  status: RequestStatus;
  predictedStartDate: string;
  predictedEndDate: string;
  destination: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
  vehicle: RequestVehicle;
};

const statusLabels: Record<RequestStatus, RequestStatusLabel> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  REJECTED: "Recusada",
  COMPLETED: "Concluída",
};

export const getRequestStatusLabel = (status: RequestStatus) =>
  statusLabels[status];
