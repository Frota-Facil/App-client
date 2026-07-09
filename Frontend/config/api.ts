import Constants from "expo-constants";
import { Platform } from "react-native";

const CORE_PORT = 3333;
const TRACKING_PORT = 8080;

const ENV_CORE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const ENV_TRACKING_URL =
  process.env.EXPO_PUBLIC_TRACKING_API_URL ||
  process.env.EXPO_PUBLIC_TRACKING_API_BASE_URL;

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

const getHost = () => {
  const hostUri = getExpoHostUri();
  const host = hostUri?.replace(/^.*:\/\//, "").split(":")[0];

  return host || "localhost";
};

const createBaseURL = (port: number) => {
  if (Platform.OS === "web") {
    return `http://localhost:${port}`;
  }

  return `http://${getHost()}:${port}`;
};

const coreBaseURL = ENV_CORE_URL || createBaseURL(CORE_PORT);
const trackingBaseURL = ENV_TRACKING_URL || createBaseURL(TRACKING_PORT);

export const apiConfig = {
  baseURL: coreBaseURL,
  trackingBaseURL,
};

export const trackingApiConfig = {
  baseURL: trackingBaseURL,
};
