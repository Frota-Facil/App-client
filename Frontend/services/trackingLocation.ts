import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

import { colors } from "../constants/colors";
import { sendTracking, syncTrackingQueue } from "./trackingService";
import type { TrackingItem } from "../storage/trackingQueue";

const ACTIVE_TRACKING_ROUTE_KEY = "sif_active_tracking_route_id";
const TRACKING_LOCATION_TASK = "sif-route-location-tracking";

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

type GlobalWithLocalStorage = typeof globalThis & {
  localStorage?: WebStorage;
};

type LocationTaskData = {
  locations?: Location.LocationObject[];
};

export class TrackingLocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrackingLocationError";
  }
}

const getWebStorage = () =>
  (globalThis as GlobalWithLocalStorage).localStorage;

const getStorageItem = async (key: string) => {
  try {
    if (Platform.OS === "web") {
      return getWebStorage()?.getItem(key) ?? null;
    }

    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn("Não foi possível ler o estado do tracking.", error);
    return null;
  }
};

const setStorageItem = async (key: string, value: string) => {
  try {
    if (Platform.OS === "web") {
      getWebStorage()?.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn("Não foi possível salvar o estado do tracking.", error);
  }
};

const removeStorageItem = async (key: string) => {
  try {
    if (Platform.OS === "web") {
      getWebStorage()?.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn("Não foi possível limpar o estado do tracking.", error);
  }
};

const getActiveTrackingRouteId = async () =>
  getStorageItem(ACTIVE_TRACKING_ROUTE_KEY);

const setActiveTrackingRouteId = async (routeId: string) => {
  await setStorageItem(ACTIVE_TRACKING_ROUTE_KEY, routeId);
};

const clearActiveTrackingRouteId = async () => {
  await removeStorageItem(ACTIVE_TRACKING_ROUTE_KEY);
};

const createTrackingItem = (
  routeId: string,
  location: Location.LocationObject
): TrackingItem | null => {
  const { latitude, longitude } = location.coords;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    routeId,
    latitude,
    longitude,
    capturedAt: new Date(location.timestamp).toISOString(),
  };
};

const sendCurrentLocation = async (routeId: string) => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const tracking = createTrackingItem(routeId, location);

    if (tracking) {
      await sendTracking(tracking);
    }
  } catch (error) {
    console.warn("Não foi possível coletar a localização atual.", error);
  }
};

// Temporário para teste de tracking. Voltar para 10 * 60 * 1000 em produção.
const TRACKING_LOCATION_TASK_INTERVAL_MS = 30 * 1000;

const locationTaskOptions: Location.LocationTaskOptions = {
  accuracy: Location.Accuracy.High,
  activityType: Location.ActivityType.AutomotiveNavigation,
  distanceInterval: 0,
  timeInterval: TRACKING_LOCATION_TASK_INTERVAL_MS,
  deferredUpdatesDistance: 0,
  deferredUpdatesInterval: 0,
  foregroundService: {
    notificationTitle: "SIF está acompanhando a viagem",
    notificationBody: "Sua localização está sendo enviada durante a rota.",
    notificationColor: colors.primary,
    killServiceOnDestroy: false,
  },
  pausesUpdatesAutomatically: false,
  showsBackgroundLocationIndicator: true,
};

const ensureNativeTrackingAvailable = async () => {
  if (Platform.OS === "web") {
    throw new TrackingLocationError(
      "O tracking de localização não está disponível na web."
    );
  }

  if (!(await TaskManager.isAvailableAsync())) {
    throw new TrackingLocationError(
      "O tracking em segundo plano não está disponível neste ambiente."
    );
  }
};

export async function requestRouteTrackingPermissions() {
  await ensureNativeTrackingAvailable();

  const servicesEnabled = await Location.hasServicesEnabledAsync();

  if (!servicesEnabled) {
    throw new TrackingLocationError(
      "Ative os serviços de localização do dispositivo para iniciar a viagem."
    );
  }

  const foregroundPermission =
    await Location.requestForegroundPermissionsAsync();

  if (foregroundPermission.status !== "granted") {
    throw new TrackingLocationError(
      "Permita o acesso à localização para iniciar a viagem."
    );
  }

  const backgroundPermission =
    await Location.requestBackgroundPermissionsAsync();

  if (backgroundPermission.status !== "granted") {
    throw new TrackingLocationError(
      "Permita a localização em segundo plano para acompanhar a viagem."
    );
  }
}

export async function startRouteTracking(routeId: string) {
  await requestRouteTrackingPermissions();
  await setActiveTrackingRouteId(routeId);

  try {
    const alreadyStarted =
      await Location.hasStartedLocationUpdatesAsync(TRACKING_LOCATION_TASK);

    if (!alreadyStarted) {
      await Location.startLocationUpdatesAsync(
        TRACKING_LOCATION_TASK,
        locationTaskOptions
      );
    }
  } catch (error) {
    await clearActiveTrackingRouteId();

    throw new TrackingLocationError(
      error instanceof Error && error.message.trim()
        ? error.message
        : "Não foi possível iniciar o tracking da viagem."
    );
  }

  await sendCurrentLocation(routeId);
  await syncTrackingQueue();
}

export async function stopRouteTracking(routeId?: string) {
  const activeRouteId = await getActiveTrackingRouteId();

  if (routeId && activeRouteId && activeRouteId !== routeId) {
    return;
  }

  await clearActiveTrackingRouteId();

  if (Platform.OS !== "web") {
    const alreadyStarted =
      await Location.hasStartedLocationUpdatesAsync(TRACKING_LOCATION_TASK);

    if (alreadyStarted) {
      await Location.stopLocationUpdatesAsync(TRACKING_LOCATION_TASK);
    }
  }

  await syncTrackingQueue();
}

if (!TaskManager.isTaskDefined(TRACKING_LOCATION_TASK)) {
  TaskManager.defineTask<LocationTaskData>(
    TRACKING_LOCATION_TASK,
    async ({ data, error }) => {
      if (error) {
        console.warn("Erro na task de localização.", error);
        return;
      }

      const routeId = await getActiveTrackingRouteId();

      if (!routeId) {
        return;
      }

      const locations = data?.locations ?? [];

      for (const location of locations) {
        const tracking = createTrackingItem(routeId, location);

        if (tracking) {
          await sendTracking(tracking);
        }
      }

      await syncTrackingQueue();
    }
  );
}
