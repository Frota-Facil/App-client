import { apiConfig } from "../config/api";

const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

const getApiHost = () => {
  try {
    return new URL(apiConfig.baseURL).hostname;
  } catch {
    return null;
  }
};

export const normalizeImageUrl = (imageUrl?: string | null) => {
  const trimmedImageUrl = imageUrl?.trim();

  if (!trimmedImageUrl) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(trimmedImageUrl);

    if (
      (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") &&
      localHosts.has(parsedUrl.hostname)
    ) {
      const apiHost = getApiHost();

      if (apiHost && !localHosts.has(apiHost)) {
        parsedUrl.hostname = apiHost;
      }
    }

    return parsedUrl.toString();
  } catch {
    try {
      return new URL(trimmedImageUrl, apiConfig.baseURL).toString();
    } catch {
      return trimmedImageUrl;
    }
  }
};
