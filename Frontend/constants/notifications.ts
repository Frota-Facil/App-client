export type NotificationType = "approved" | "rejected";

export type NotificationCategory = "Aprovadas" | "Recusadas";

export type NotificationFilter = "Todas" | NotificationCategory;

export type AppNotification = {
  id: number;
  title: string;
  message: string;
  date: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
};

export const notifications: AppNotification[] = [
  {
    id: 1,
    title: "Solicitação aprovada",
    message: "Sua solicitação para 25/04 foi aprovada.",
    date: "2025-04-23 14:32",
    type: "approved",
    category: "Aprovadas",
    read: false,
  },
  {
    id: 2,
    title: "Solicitação recusada",
    message: "Sua solicitação de 22/04 foi recusada.",
    date: "2025-04-21 11:20",
    type: "rejected",
    category: "Recusadas",
    read: true,
  },
];
