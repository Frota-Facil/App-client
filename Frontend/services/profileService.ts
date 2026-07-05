import { apiConfig } from "../config/api";

export type Profile = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  photoUrl?: string | null;
  cnh: string | null;
  department: string | null;
  role: "driver" | "admin";
  createdAt: string;
  updatedAt: string;
};

type ProfileResponse = Profile & {
  photo_url?: string | null;
};

export type UpdateProfileData = {
  name?: string;
  phone?: string;
};

export class ProfileRequestError extends Error {
  status?: number;
  isConnectionError: boolean;

  constructor(message: string, status?: number, isConnectionError = false) {
    super(message);
    this.name = "ProfileRequestError";
    this.status = status;
    this.isConnectionError = isConnectionError;
  }
}

const handleProfileResponse = async (
  response: Response,
  fallbackMessage: string,
): Promise<Profile> => {
  if (response.status === 401) {
    throw new ProfileRequestError("Sessão expirada.", 401);
  }

  if (response.status === 403) {
    throw new ProfileRequestError(
      "Você não tem permissão para acessar estes dados.",
      403,
    );
  }

  if (!response.ok) {
    throw new ProfileRequestError(fallbackMessage, response.status);
  }

  try {
    const profile = (await response.json()) as ProfileResponse;

    return {
      ...profile,
      photoUrl: profile.photoUrl ?? profile.photo_url ?? null,
    };
  } catch {
    throw new ProfileRequestError(fallbackMessage, response.status);
  }
};

export const getMe = async (token: string): Promise<Profile> => {
  let response: Response;

  try {
    response = await fetch(`${apiConfig.baseURL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new ProfileRequestError(
      "Não foi possível conectar ao servidor.",
      undefined,
      true,
    );
  }

  return handleProfileResponse(response, "Não foi possível carregar o perfil.");
};

export const updateMe = async (
  token: string,
  data: UpdateProfileData,
): Promise<Profile> => {
  let response: Response;

  try {
    response = await fetch(`${apiConfig.baseURL}/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch {
    throw new ProfileRequestError(
      "Não foi possível conectar ao servidor.",
      undefined,
      true,
    );
  }

  return handleProfileResponse(
    response,
    "Não foi possível atualizar o perfil.",
  );
};
