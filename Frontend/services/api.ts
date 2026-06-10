const API_URL = "http://192.168.0.3:3333";

export async function fetchNotifications(token: string) {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar notificações");
  }

  return response.json();
}

export async function markAllNotificationsAsRead(token: string) {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao marcar notificações como lidas");
  }

  return response.json();
}

export async function markNotificationAsRead(
  notificationId: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao marcar notificação como lida");
  }

  return response.json();
}