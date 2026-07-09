import { trackingApiConfig } from "../config/api";

const TRACKING_REQUEST_TIMEOUT_MS = 1000 * 10;

export type TrackingPoint = {
  latitude: number;
  longitude: number;
  capturedAt: string;
};

export class TrackingRequestError extends Error {
  status?: number;
  isConnectionError: boolean;

  constructor(
    message: string,
    status?: number,
    isConnectionError = false
  ) {
    super(message);
    this.name = "TrackingRequestError";
    this.status = status;
    this.isConnectionError = isConnectionError;
  }
}

export const sendTrackingPoint = async (
  routeId: string,
  point: TrackingPoint,
  timeoutMs = TRACKING_REQUEST_TIMEOUT_MS
) => {
  const encodedRouteId = encodeURIComponent(routeId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;

  try {
    response = await fetch(
      `${trackingApiConfig.baseURL}/routes/${encodedRouteId}/tracking`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(point),
        signal: controller.signal,
      }
    );
  } catch (error) {
    const isTimeout =
      error instanceof Error && error.name === "AbortError";

    throw new TrackingRequestError(
      isTimeout
        ? "Tempo esgotado ao enviar localização."
        : "Não foi possível conectar ao tracking-service.",
      undefined,
      true
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new TrackingRequestError(
      "Erro ao enviar localização.",
      response.status
    );
  }
};
