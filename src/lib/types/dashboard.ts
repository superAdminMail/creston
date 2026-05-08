// src/types/dashboard.ts
import type { UserRole } from "@/generated/prisma";

export type DashboardDirectoryUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  country: string;
  role: UserRole;
  emailVerified: boolean;
  kycStatus: "NOT_STARTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  accountStatus: "ACTIVE" | "SUSPENDED" | "REVIEW";
  totalDeposits: number;
  totalInvested: number;
  walletBalance: number;
  joinedAt: string;
};
