import { apiConfig } from "../config/api";
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

export const login = async (
  email: string,
  password: string
): Promise<AuthSession> => {
  let response: Response;

  try {
    response = await fetch(`${apiConfig.baseURL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AuthRequestError("Não foi possível conectar ao servidor");
  }

  if (response.status === 401) {
    throw new AuthRequestError("Credenciais inválidas", 401);
  }

  if (!response.ok) {
    throw new AuthRequestError("Não foi possível conectar ao servidor", response.status);
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
