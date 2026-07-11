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

const getLoginURL = () => {
  const envBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const baseURL = envBaseURL?.trim().replace(/\/+$/, "") ?? "";
  const loginURL = `${baseURL}/auth`;

  console.log("[login] API base URL:", process.env.EXPO_PUBLIC_API_BASE_URL);
  console.log("[login] URL final:", loginURL);

  if (
    !baseURL ||
    /(^|\/\/)(localhost|127\.0\.0\.1|host\.docker\.internal)(:|\/|$)/i.test(
      baseURL
    )
  ) {
    throw new AuthRequestError(CONNECTION_ERROR_MESSAGE);
  }

  return loginURL;
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

  return {
    ...session,
    user: {
      ...session.user,
      photoUrl: session.user.photoUrl ?? session.user.photo_url ?? null,
    },
  };
};
