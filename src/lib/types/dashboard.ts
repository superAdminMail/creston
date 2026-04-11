// src/types/dashboard.ts
import type { UserRole } from "@/generated/prisma";

export type DashboardDirectoryUser = {
  id: string;
  fullName: string;
  email: string;
  country: string;
  role: UserRole;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  accountStatus: "ACTIVE" | "SUSPENDED" | "REVIEW";
  totalDeposits: number;
  totalInvested: number;
  walletBalance: number;
  joinedAt: string;
};
