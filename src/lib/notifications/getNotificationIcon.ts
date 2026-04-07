import { ShoppingBag, Truck, CreditCard, Megaphone, Bell } from "lucide-react";

import { NotificationType } from "@/lib/types/notification";

export function getNotificationIcon(type?: NotificationType) {
  switch (type) {
    case "INVESTMENT_ORDER":
      return ShoppingBag;

    case "INVESTMENT_ROI":
      return CreditCard;

    case "WITHDRAWAL":
      return CreditCard;

    case "PROMOTION":
      return Megaphone;

    default:
      return Bell;
  }
}
