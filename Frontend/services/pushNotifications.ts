import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

const SERVICE_NOT_AVAILABLE_RETRY_ATTEMPTS = 3;
const SERVICE_NOT_AVAILABLE_RETRY_DELAY_MS = 5000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  console.log("[push] iniciando registro push");

  try {
    if (!Device.isDevice) {
      console.warn(
        "[push] push notifications precisam ser testadas em um dispositivo físico."
      );
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let status = existingStatus;

    if (existingStatus !== "granted") {
      const permissionResponse = await Notifications.requestPermissionsAsync();
      status = permissionResponse.status;
    }

    console.log("[push] permission status:", status);

    if (status !== "granted") {
      console.warn("[push] permissão para push notifications foi negada.");
      return null;
    }

    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId;

    console.log("[push] projectId:", projectId);

    if (!projectId) {
      console.warn(
        "[push] não foi possível gerar Expo Push Token: projectId do EAS não encontrado."
      );
      return null;
    }

    try {
      const deviceToken = await runWithServiceNotAvailableRetry(() =>
        Notifications.getDevicePushTokenAsync()
      );

      console.log("[push] device token FCM gerado:", deviceToken);
    } catch (error) {
      console.warn(
        "[push] falha ao gerar device token FCM. Possível problema em Firebase/Google Play Services/rede/build nativo.",
        error
      );
      return null;
    }

    try {
      const expoToken = await runWithServiceNotAvailableRetry(() =>
        Notifications.getExpoPushTokenAsync({ projectId })
      );

      console.log("[push] Expo Push Token gerado:", expoToken.data);
      return expoToken.data;
    } catch (error) {
      console.warn("[push] falha ao gerar Expo Push Token.", error);
      return null;
    }
  } catch (error) {
    console.warn(
      "[push] erro inesperado ao registrar push notifications.",
      error
    );
    return null;
  }
}

async function runWithServiceNotAvailableRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= SERVICE_NOT_AVAILABLE_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (
        !isServiceNotAvailableError(error) ||
        attempt === SERVICE_NOT_AVAILABLE_RETRY_ATTEMPTS
      ) {
        throw error;
      }

      console.warn(
        `[push] SERVICE_NOT_AVAILABLE na tentativa ${attempt}/${SERVICE_NOT_AVAILABLE_RETRY_ATTEMPTS}. Tentando novamente em 5 segundos.`,
        error
      );
      await wait(SERVICE_NOT_AVAILABLE_RETRY_DELAY_MS);
    }
  }

  throw lastError;
}

function isServiceNotAvailableError(error: unknown) {
  if (!error) {
    return false;
  }

  if (typeof error === "string") {
    return error.includes("SERVICE_NOT_AVAILABLE");
  }

  if (error instanceof Error) {
    return error.message.includes("SERVICE_NOT_AVAILABLE");
  }

  if (typeof error === "object") {
    const errorValues = Object.values(error).filter(
      (value) => typeof value === "string"
    );

    return errorValues.some((value) =>
      value.includes("SERVICE_NOT_AVAILABLE")
    );
  }

  return false;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
