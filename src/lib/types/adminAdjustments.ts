export type AdminAdjustmentAccountType =
  | "INVESTMENT_ACCOUNT"
  | "SAVINGS_ACCOUNT";

export type AdminAdjustmentAccountOption = {
  id: string;
  accountType: AdminAdjustmentAccountType;
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
  accounts: AdminAdjustmentAccountOption[];
  defaultAccountType: AdminAdjustmentAccountType | null;
  defaultAccountId: string | null;
  stats: {
    totalAccounts: number;
    investmentAccounts: number;
    savingsAccounts: number;
  };
};
