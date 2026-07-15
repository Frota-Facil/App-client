import type { AuthSession } from "./session";

type AuthSessionResponse = Omit<AuthSession, "user"> & {
  user: AuthSession["user"] & {
    photo_url?: string | null;
  };
};

export class AuthRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthRequestError";
    this.status = status;
  }
}

const LOGIN_TIMEOUT_MS = 10 * 1000;
const CONNECTION_ERROR_MESSAGE = "Não foi possível conectar ao servidor.";

const getCoreBaseURL = () => {
  const envBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL;
  return envBaseURL?.trim().replace(/\/+$/, "") ?? "";
};

const validateCoreBaseURL = (baseURL: string) => {
  if (
    !baseURL ||
    /(^|\/\/)(localhost|127\.0\.0\.1|host\.docker\.internal)(:|\/|$)/i.test(
      baseURL
    )
  ) {
    throw new AuthRequestError(CONNECTION_ERROR_MESSAGE);
  }
};

const getLoginURL = () => {
  const baseURL = getCoreBaseURL();
  const loginURL = `${baseURL}/auth`;

  console.log("[login] API base URL:", process.env.EXPO_PUBLIC_API_BASE_URL);
  console.log("[login] URL final:", loginURL);

  validateCoreBaseURL(baseURL);

  return loginURL;
};

const getGoogleLoginURL = () => {
  const baseURL = getCoreBaseURL();
  const googleLoginURL = `${baseURL}/auth/google`;

  console.log("[google-login] API base URL:", process.env.EXPO_PUBLIC_API_BASE_URL);
  console.log("[google-login] URL final:", googleLoginURL);

  validateCoreBaseURL(baseURL);

  return googleLoginURL;
};

const fetchWithTimeout = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOGIN_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const getResponseMessage = async (response: Response, fallback: string) => {
  try {
    const body = (await response.json()) as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof body.message === "string" && body.message.trim()) {
      return body.message;
    }

    if (typeof body.error === "string" && body.error.trim()) {
      return body.error;
    }

    return fallback;
  } catch {
    return fallback;
  }
};

const normalizeSession = (session: AuthSessionResponse): AuthSession => ({
  ...session,
  user: {
    ...session.user,
    photoUrl: session.user.photoUrl ?? session.user.photo_url ?? null,
  },
});

export const login = async (
  email: string,
  password: string
): Promise<AuthSession> => {
  let response: Response;
  const loginURL = getLoginURL();

  try {
    console.log("[login] enviando requisição");

    response = await fetchWithTimeout(loginURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    console.log("[login] status:", response.status);
  } catch {
    throw new AuthRequestError(CONNECTION_ERROR_MESSAGE);
  }

  if (response.status === 401) {
    throw new AuthRequestError("Credenciais inválidas", 401);
  }

  if (!response.ok) {
    throw new AuthRequestError(CONNECTION_ERROR_MESSAGE, response.status);
  }

  const session = (await response.json()) as AuthSessionResponse;

  return normalizeSession(session);
};

export const loginWithGoogleIdToken = async (
  idToken: string
): Promise<AuthSession> => {
  const trimmedIdToken = idToken.trim();

  if (!trimmedIdToken) {
    throw new AuthRequestError("Token do Google inválido", 401);
  }

  let response: Response;
  const loginURL = getGoogleLoginURL();

  try {
    console.log("[google-login] enviando requisição");

    response = await fetchWithTimeout(loginURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken: trimmedIdToken }),
    });
    console.log("[google-login] status:", response.status);
  } catch {
    throw new AuthRequestError(CONNECTION_ERROR_MESSAGE);
  }

  if (!response.ok) {
    const message = await getResponseMessage(
      response,
      response.status === 401
        ? "Usuário não autorizado"
        : "Não foi possível autenticar com Google"
    );

    throw new AuthRequestError(message, response.status);
  }

  const session = (await response.json()) as AuthSessionResponse;

  return normalizeSession(session);
};
