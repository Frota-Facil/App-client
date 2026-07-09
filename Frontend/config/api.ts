import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 3333;
const TRACKING_API_PORT = 8080;
const WEB_BASE_URL = `http://localhost:${API_PORT}`;
const ENV_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const ENV_TRACKING_BASE_URL = process.env.EXPO_PUBLIC_TRACKING_API_URL;

type ExpoHostConstants = {
  expoConfig?: {
    hostUri?: string;
  };
  manifest?: {
    debuggerHost?: string;
  };
  manifest2?: {
    extra?: {
      expoClient?: {
        hostUri?: string;
      };
    };
  };
};

const getExpoHostUri = () => {
  const expoConstants = Constants as ExpoHostConstants;

  return (
    expoConstants.expoConfig?.hostUri ??
    expoConstants.manifest2?.extra?.expoClient?.hostUri ??
    expoConstants.manifest?.debuggerHost
  );
};

const getNativeBaseURL = (port: number) => {
  const hostUri = getExpoHostUri();
  const host = hostUri?.split(":")[0];

  return `http://${host || "localhost"}:${port}`;
};

export const apiConfig = {
  baseURL:
    ENV_BASE_URL ||
    (Platform.OS === "web" ? WEB_BASE_URL : getNativeBaseURL(API_PORT)),
};

export const trackingApiConfig = {
  baseURL:
    ENV_TRACKING_BASE_URL ||
    (Platform.OS === "web"
      ? `http://localhost:${TRACKING_API_PORT}`
      : getNativeBaseURL(TRACKING_API_PORT)),
};
