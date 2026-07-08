import { apiConfig } from "../config/api";
import type { VehicleRequest } from "../constants/requests";

export type CreateRequestData = {
  vehicleId: string;
  predictedStartDate: string;
  predictedEndDate: string;
  destination: string;
  reason: string;
};

export type UpdateRequestData = Partial<CreateRequestData>;

export type VehicleScheduleParams = {
  date: string;
  ignoredRequestId?: string;
};

export type VehicleScheduleSlot = {
  predictedStartDate: string;
  predictedEndDate: string;
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
    const body = (await response.json()) as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof body.message === "string" && body.message.trim()) {
      return body.message;
    }

    if (typeof body.error === "string" && body.error.trim()) {
      return body.error;
    }

    return fallback;
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

export const getVehicleSchedule = async (
  token: string,
  vehicleId: string,
  params: VehicleScheduleParams
): Promise<VehicleScheduleSlot[]> => {
  const fallbackMessage = "Não foi possível carregar os horários deste veículo.";
  const searchParams = new URLSearchParams();

  searchParams.set("date", params.date);

  if (params.ignoredRequestId) {
    searchParams.set("ignoredRequestId", params.ignoredRequestId);
  }

  const response = await request(
    `/requests/${encodeURIComponent(vehicleId)}/schedule?${searchParams.toString()}`,
    token,
    { method: "GET" },
    "Não foi possível conectar ao servidor."
  );

  if (!response.ok) {
    const message = await getResponseMessage(response, fallbackMessage);
    throw new RequestRequestError(message, response.status);
  }

  try {
    const schedule = await response.json();

    if (!Array.isArray(schedule)) {
      throw new RequestRequestError(fallbackMessage, response.status);
    }

    return schedule as VehicleScheduleSlot[];
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

export const updateMyRequest = async (
  token: string,
  requestId: string,
  data: UpdateRequestData
): Promise<VehicleRequest | null> => {
  const fallbackMessage = "Não foi possível salvar a solicitação.";
  const response = await request(
    `/me/requests/${encodeURIComponent(requestId)}`,
    token,
    {
      method: "PATCH",
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

  if (response.status === 204) {
    return null;
  }

  try {
    return (await response.json()) as VehicleRequest;
  } catch {
    return null;
  }
};
