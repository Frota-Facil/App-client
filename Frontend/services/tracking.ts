import { trackingApiConfig } from "../config/api";

type TrackingPoint = {
  capturedAt: string;
  latitude: number;
  longitude: number;
};

export class TrackingRequestError extends Error {
  status?: number;
  isConnectionError: boolean;

  constructor(message: string, status?: number, isConnectionError = false) {
    super(message);
    this.name = "TrackingRequestError";
    this.status = status;
    this.isConnectionError = isConnectionError;
  }
}

export const sendTrackingPoint = async (
  routeId: string,
  point: TrackingPoint
) => {
  const encodedRouteId = encodeURIComponent(routeId);

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
      }
    );
  } catch {
    throw new TrackingRequestError(
      "Não foi possível conectar ao tracking-service.",
      undefined,
      true
    );
  }

  if (!response.ok) {
    throw new TrackingRequestError(
      "Não foi possível enviar a localização.",
      response.status
    );
  }
};
