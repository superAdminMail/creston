export type NotificationType =
  | "INVESTMENT_ORDER"
  | "INVESTMENT_ROI"
  | "WITHDRAWAL"
  | "SYSTEM"
  | "PROMOTION";

export type NotificationDTO = {
  id: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
};
