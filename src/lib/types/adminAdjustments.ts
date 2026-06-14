export type AdminAdjustmentTargetType =
  | "INVESTMENT_ORDER"
  | "SAVINGS_ACCOUNT";

export type AdminAdjustmentTargetOption = {
  id: string;
  targetType: AdminAdjustmentTargetType;
  title: string;
  subtitle: string;
  meta: string;
  balance: number;
  currency: string;
  status: string;
  ownerName: string;
  ownerEmail: string;
  updatedAt: string;
};

export type AdminAdjustmentPageData = {
  targets: AdminAdjustmentTargetOption[];
  defaultTargetType: AdminAdjustmentTargetType | null;
  defaultTargetId: string | null;
  stats: {
    totalTargets: number;
    investmentOrders: number;
    savingsAccounts: number;
  };
};
