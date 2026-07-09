import { apiConfig } from "../config/api";
import type { Vehicle } from "../constants/data";

export class VehicleRequestError extends Error {
  status?: number;
  isConnectionError: boolean;

  constructor(message: string, status?: number, isConnectionError = false) {
    super(message);
    this.name = "VehicleRequestError";
    this.status = status;
    this.isConnectionError = isConnectionError;
  }
}

const loadVehicles = async (
  token: string,
  path: "/vehicles" | "/vehicles/available",
  params?: Record<string, string | undefined>
): Promise<Vehicle[]> => {
  let response: Response;
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  const requestUrl = `${apiConfig.baseURL}${path}${
    queryString ? `?${queryString}` : ""
  }`;

  try {
    response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new VehicleRequestError(
      "Não foi possível conectar ao servidor.",
      undefined,
      true
    );
  }

  if (response.status === 401) {
    throw new VehicleRequestError("Sessão expirada.", 401);
  }

  if (response.status === 403) {
    throw new VehicleRequestError(
      "Você não tem permissão para acessar estes dados.",
      403
    );
  }

  if (!response.ok) {
    throw new VehicleRequestError(
      "Não foi possível carregar os veículos.",
      response.status
    );
  }

  try {
    const vehicles = await response.json();

    if (!Array.isArray(vehicles)) {
      throw new VehicleRequestError("Não foi possível carregar os veículos.");
    }

    return vehicles as Vehicle[];
  } catch (error) {
    if (error instanceof VehicleRequestError) {
      throw error;
    }

    throw new VehicleRequestError("Não foi possível carregar os veículos.");
  }
};

export const getVehicles = (token: string) =>
  loadVehicles(token, "/vehicles");

export type AvailableVehiclesParams = {
  date?: string;
  ignoredRequestId?: string;
  predictedEndDate?: string;
  predictedStartDate?: string;
};

export const getAvailableVehicles = (
  token: string,
  params?: AvailableVehiclesParams
) => loadVehicles(token, "/vehicles/available", params);
