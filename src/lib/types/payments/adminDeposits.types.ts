export type AdminDepositItem = {
  id: string;
  source: "SAVINGS" | "INVESTMENT";
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CANCELED";
  amount: number;
  currency: string;
  submittedAt: string;
  reviewedAt: string | null;
  reference: string;
  sourceLabel: string;
  depositorName: string | null;
  depositorAccountName: string | null;
  paymentMethodLabel: string | null;
  note: string | null;
  reviewNote: string | null;
  rejectionReason: string | null;
  requesterName: string | null;
  requesterEmail: string | null;
};
