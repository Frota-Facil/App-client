import { apiConfig } from "../config/api";

export type AppNotification = {
  id: string;
  userId: string;
  requestId?: string | null;
  title: string;
  message: string;
  type: "REQUEST_APPROVED" | "REQUEST_REJECTED" | "REQUEST_CREATED";
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export class NotificationRequestError extends Error {
  status?: number;
  isConnectionError: boolean;

  constructor(message: string, status?: number, isConnectionError = false) {
    super(message);
    this.name = "NotificationRequestError";
    this.status = status;
    this.isConnectionError = isConnectionError;
  }
}

const parseNotificationResponse = async <T>(
  response: Response,
  fallbackMessage: string
): Promise<T> => {
  try {
    return (await response.json()) as T;
  } catch {
    throw new NotificationRequestError(fallbackMessage, response.status);
  }
};

const handleNotificationResponse = async <T>(
  response: Response,
  fallbackMessage: string
): Promise<T> => {
  if (response.status === 401) {
    throw new NotificationRequestError("Sessão expirada.", 401);
  }

  if (response.status === 403) {
    throw new NotificationRequestError(
      "Você não tem permissão para acessar estas notificações.",
      403
    );
  }

  if (!response.ok) {
    throw new NotificationRequestError(fallbackMessage, response.status);
  }

  return parseNotificationResponse<T>(response, fallbackMessage);
};

export const fetchNotifications = async (
  token: string
): Promise<AppNotification[]> => {
  let response: Response;

  try {
    response = await fetch(`${apiConfig.baseURL}/notifications`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new NotificationRequestError(
      "Não foi possível conectar ao servidor.",
      undefined,
      true
    );
  }

  const notifications = await handleNotificationResponse<AppNotification[]>(
    response,
    "Não foi possível carregar as notificações."
  );

  if (!Array.isArray(notifications)) {
    throw new NotificationRequestError(
      "Não foi possível carregar as notificações."
    );
  }

  return notifications;
};

export const markAllNotificationsAsRead = async (
  token: string
): Promise<AppNotification[]> => {
  let response: Response;

  try {
    response = await fetch(`${apiConfig.baseURL}/notifications/read-all`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new NotificationRequestError(
      "Não foi possível conectar ao servidor.",
      undefined,
      true
    );
  }

  const notifications = await handleNotificationResponse<AppNotification[]>(
    response,
    "Não foi possível marcar as notificações como lidas."
  );

  if (!Array.isArray(notifications)) {
    throw new NotificationRequestError(
      "Não foi possível marcar as notificações como lidas."
    );
  }

  return notifications;
};

export const markNotificationAsRead = async (
  notificationId: string,
  token: string
): Promise<AppNotification> => {
  let response: Response;

  try {
    response = await fetch(
      `${apiConfig.baseURL}/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch {
    throw new NotificationRequestError(
      "Não foi possível conectar ao servidor.",
      undefined,
      true
    );
  }

  return handleNotificationResponse<AppNotification>(
    response,
    "Não foi possível marcar a notificação como lida."
  );
};
