import { apiConfig } from "../config/api";

export type PushTokenPlatform = "android" | "ios" | "web";

export type SavedPushToken = {
  id: string;
  userId: string;
  token: string;
  platform: PushTokenPlatform;
  createdAt: string;
  updatedAt: string;
};

export class PushTokenRequestError extends Error {
  status?: number;
  isConnectionError: boolean;
  responseBody?: unknown;
  url?: string;

  constructor(
    message: string,
    status?: number,
    isConnectionError = false,
    responseBody?: unknown,
    url?: string
  ) {
    super(message);
    this.name = "PushTokenRequestError";
    this.status = status;
    this.isConnectionError = isConnectionError;
    this.responseBody = responseBody;
    this.url = url;
  }
}

const readResponseBody = async (response: Response) => {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

export async function savePushToken(
  authToken: string,
  pushToken: string,
  platform: PushTokenPlatform
): Promise<SavedPushToken> {
  const url = `${apiConfig.baseURL}/push-tokens`;
  let response: Response;

  if (!authToken || !pushToken) {
    throw new PushTokenRequestError(
      "Token de autenticação ou Expo Push Token ausente.",
      undefined,
      false,
      null,
      url
    );
  }

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: pushToken,
        platform,
      }),
    });
  } catch {
    throw new PushTokenRequestError(
      "Não foi possível conectar ao servidor.",
      undefined,
      true,
      null,
      url
    );
  }

  const responseBody = await readResponseBody(response);

  if (response.status === 401) {
    throw new PushTokenRequestError(
      "Sessão expirada.",
      401,
      false,
      responseBody,
      url
    );
  }

  if (response.status === 403) {
    throw new PushTokenRequestError(
      "Você não tem permissão para salvar este push token.",
      403,
      false,
      responseBody,
      url
    );
  }

  if (!response.ok) {
    throw new PushTokenRequestError(
      "Não foi possível salvar o Expo Push Token.",
      response.status,
      false,
      responseBody,
      url
    );
  }

  if (!responseBody) {
    throw new PushTokenRequestError(
      "Não foi possível ler a resposta do servidor.",
      response.status,
      false,
      responseBody,
      url
    );
  }

  return responseBody as SavedPushToken;
}
