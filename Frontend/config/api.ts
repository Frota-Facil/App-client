const ENV_CORE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const ENV_TRACKING_URL =
  process.env.EXPO_PUBLIC_TRACKING_API_URL ||
  process.env.EXPO_PUBLIC_TRACKING_API_BASE_URL;

const normalizeBaseURL = (baseURL: string | undefined) => {
  return baseURL?.trim().replace(/\/+$/, "") ?? "";
};

const coreBaseURL = normalizeBaseURL(ENV_CORE_URL);
const trackingBaseURL = normalizeBaseURL(ENV_TRACKING_URL);

export const apiConfig = {
  baseURL: coreBaseURL,
  trackingBaseURL,
};

export const trackingApiConfig = {
  baseURL: trackingBaseURL,
};
