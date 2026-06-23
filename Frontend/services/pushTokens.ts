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

  constructor(message: string, status?: number, isConnectionError = false) {
    super(message);
    this.name = "PushTokenRequestError";
    this.status = status;
    this.isConnectionError = isConnectionError;
  }
}

export async function savePushToken(
  authToken: string,
  pushToken: string,
  platform: PushTokenPlatform
): Promise<SavedPushToken> {
  let response: Response;

  try {
    response = await fetch(`${apiConfig.baseURL}/push-tokens`, {
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
      true
    );
  }

  if (response.status === 401) {
    throw new PushTokenRequestError("Sessão expirada.", 401);
  }

  if (response.status === 403) {
    throw new PushTokenRequestError(
      "Você não tem permissão para salvar este push token.",
      403
    );
  }

  if (!response.ok) {
    throw new PushTokenRequestError(
      "Não foi possível salvar o Expo Push Token.",
      response.status
    );
  }

  try {
    return (await response.json()) as SavedPushToken;
  } catch {
    throw new PushTokenRequestError(
      "Não foi possível ler a resposta do servidor.",
      response.status
    );
  }
}
