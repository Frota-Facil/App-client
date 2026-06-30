import { apiConfig } from "../config/api";
import type { Trip } from "../constants/trips";

export class TripRequestError extends Error {
  status?: number;
  isConnectionError: boolean;

  constructor(message: string, status?: number, isConnectionError = false) {
    super(message);
    this.name = "TripRequestError";
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

const requestTrip = async (
  path: string,
  token: string,
  init: RequestInit,
  fallbackMessage: string
) => {
  let response: Response;

  try {
    response = await fetch(`${apiConfig.baseURL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
  } catch {
    throw new TripRequestError(
      "Não foi possível conectar ao servidor.",
      undefined,
      true
    );
  }

  if (!response.ok) {
    const message = await getResponseMessage(response, fallbackMessage);
    throw new TripRequestError(message, response.status);
  }

  return response;
};

const readTrip = async (response: Response, fallbackMessage: string) => {
  try {
    return (await response.json()) as Trip;
  } catch {
    throw new TripRequestError(fallbackMessage, response.status);
  }
};

export const getMyTrips = async (token: string): Promise<Trip[]> => {
  const fallbackMessage = "Não foi possível carregar as viagens.";
  const response = await requestTrip(
    "/me/trips",
    token,
    { method: "GET" },
    fallbackMessage
  );

  try {
    const trips = await response.json();

    if (!Array.isArray(trips)) {
      throw new TripRequestError(fallbackMessage, response.status);
    }

    return trips as Trip[];
  } catch (error) {
    if (error instanceof TripRequestError) {
      throw error;
    }

    throw new TripRequestError(fallbackMessage, response.status);
  }
};

export const getMyTrip = async (
  token: string,
  routeId: string
): Promise<Trip> => {
  const fallbackMessage = "Não foi possível carregar a viagem.";
  const response = await requestTrip(
    `/me/trips/${encodeURIComponent(routeId)}`,
    token,
    { method: "GET" },
    fallbackMessage
  );

  return readTrip(response, fallbackMessage);
};

export const startMyTrip = async (
  token: string,
  routeId: string
): Promise<Trip> => {
  const fallbackMessage = "Não foi possível iniciar a viagem.";
  const response = await requestTrip(
    `/me/trips/${encodeURIComponent(routeId)}/start`,
    token,
    { method: "PATCH" },
    fallbackMessage
  );

  return readTrip(response, fallbackMessage);
};

export const finishMyTrip = async (
  token: string,
  routeId: string,
  description: string
): Promise<Trip> => {
  const fallbackMessage = "Não foi possível finalizar a viagem.";
  const response = await requestTrip(
    `/me/trips/${encodeURIComponent(routeId)}/finish`,
    token,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    },
    fallbackMessage
  );

  return readTrip(response, fallbackMessage);
};
