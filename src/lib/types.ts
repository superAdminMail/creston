import { UserRole } from "@/generated/prisma";

export type ProfileImage = {
  url: string;
  key: string;
};

type BaseUserDTO = {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  hasPassword?: boolean;

  profileAvatar?: ProfileImage | null;
  name?: string | null;
  username?: string | null;
  image?: string | null;
};

export type ProfileDTO = BaseUserDTO & {
  investorProfile?: {
    kycStatus: "NOT_STARTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  } | null;
};

export type UserDTO = BaseUserDTO;

export type SessionUser = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
};

export type CurrentSessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};
