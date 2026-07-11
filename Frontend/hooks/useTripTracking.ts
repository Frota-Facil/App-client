import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

import {
  sendTrackingPoint,
  TrackingRequestError,
} from "../services/tracking";

// Temporário para teste de tracking. Voltar para 10 * 60 * 1000 em produção.
const TRACKING_INTERVAL_MS = 30 * 1000;

const logTrackingError = (message: string, error: unknown) => {
  if (!__DEV__) {
    return;
  }

  if (error instanceof TrackingRequestError) {
    console.warn(message, {
      isConnectionError: error.isConnectionError,
      status: error.status,
    });
    return;
  }

  console.warn(message, error);
};

export const useTripTracking = () => {
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const activeRouteIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingRouteIdRef = useRef<string | null>(null);
  const startPromiseRef = useRef<Promise<boolean> | null>(null);

  const sendCurrentLocation = useCallback(async (routeId: string) => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await sendTrackingPoint(routeId, {
        capturedAt: new Date().toISOString(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      logTrackingError("Erro ao enviar localização da rota.", error);
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    activeRouteIdRef.current = null;
    pendingRouteIdRef.current = null;
    startPromiseRef.current = null;
    setActiveRouteId(null);
  }, []);

  const startTrackingSession = useCallback(
    async (routeId: string) => {
      let permission: Location.LocationPermissionResponse;

      try {
        permission = await Location.requestForegroundPermissionsAsync();
      } catch (error) {
        logTrackingError("Erro ao solicitar permissão de localização.", error);
        return false;
      }

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        console.warn("Permissão de localização negada para tracking da rota.");
        return false;
      }

      if (pendingRouteIdRef.current !== routeId) {
        return false;
      }

      activeRouteIdRef.current = routeId;
      setActiveRouteId(routeId);

      await sendCurrentLocation(routeId);

      if (activeRouteIdRef.current !== routeId) {
        return false;
      }

      intervalRef.current = setInterval(() => {
        if (activeRouteIdRef.current !== routeId) {
          return;
        }

        void sendCurrentLocation(routeId);
      }, TRACKING_INTERVAL_MS);

      return true;
    },
    [sendCurrentLocation]
  );

  const startTracking = useCallback(
    async (routeId: string) => {
      if (activeRouteIdRef.current === routeId && intervalRef.current) {
        return true;
      }

      if (pendingRouteIdRef.current === routeId && startPromiseRef.current) {
        return startPromiseRef.current;
      }

      if (activeRouteIdRef.current && activeRouteIdRef.current !== routeId) {
        stopTracking();
      }

      pendingRouteIdRef.current = routeId;
      startPromiseRef.current = startTrackingSession(routeId);

      try {
        return await startPromiseRef.current;
      } finally {
        if (pendingRouteIdRef.current === routeId) {
          pendingRouteIdRef.current = null;
          startPromiseRef.current = null;
        }
      }
    },
    [startTrackingSession, stopTracking]
  );

  useEffect(() => stopTracking, [stopTracking]);

  return {
    activeRouteId,
    isTracking: Boolean(activeRouteId),
    startTracking,
    stopTracking,
  };
};
