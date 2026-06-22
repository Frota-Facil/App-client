import { apiConfig } from "../config/api";
import type { VehicleRequest } from "../constants/requests";

export type CreateRequestData = {
  vehicleId: string;
  predictedStartDate: string;
  predictedEndDate: string;
  destination: string;
  reason: string;
};

export class RequestRequestError extends Error {
  status?: number;
  isConnectionError: boolean;

  constructor(message: string, status?: number, isConnectionError = false) {
    super(message);
    this.name = "RequestRequestError";
    this.status = status;
    this.isConnectionError = isConnectionError;
  }
}

const getResponseMessage = async (response: Response, fallback: string) => {
  try {
    const body = (await response.json()) as { message?: unknown };

    return typeof body.message === "string" && body.message.trim()
      ? body.message
      : fallback;
  } catch {
    return fallback;
  }
};

const request = async (
  path: string,
  token: string,
  init: RequestInit,
  connectionMessage: string
) => {
  try {
    return await fetch(`${apiConfig.baseURL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
  } catch {
    throw new RequestRequestError(connectionMessage, undefined, true);
  }
};

export const getMyRequests = async (
  token: string
): Promise<VehicleRequest[]> => {
  const fallbackMessage = "Não foi possível carregar as solicitações.";
  const response = await request(
    "/me/requests",
    token,
    { method: "GET" },
    "Não foi possível conectar ao servidor."
  );

  if (!response.ok) {
    const message = await getResponseMessage(response, fallbackMessage);
    throw new RequestRequestError(message, response.status);
  }

  try {
    const requests = await response.json();

    if (!Array.isArray(requests)) {
      throw new RequestRequestError(fallbackMessage, response.status);
    }

    return requests as VehicleRequest[];
  } catch (error) {
    if (error instanceof RequestRequestError) {
      throw error;
    }

    throw new RequestRequestError(fallbackMessage, response.status);
  }
};

export const createMyRequest = async (
  token: string,
  data: CreateRequestData
): Promise<VehicleRequest> => {
  const fallbackMessage = "Não foi possível salvar a solicitação.";
  const response = await request(
    "/me/requests",
    token,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
    "Não foi possível conectar ao servidor."
  );

  if (!response.ok) {
    const message = await getResponseMessage(response, fallbackMessage);
    throw new RequestRequestError(message, response.status);
  }

  try {
    return (await response.json()) as VehicleRequest;
  } catch {
    throw new RequestRequestError(fallbackMessage, response.status);
  }
};
