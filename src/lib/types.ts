import { UserRole } from "@/generated/prisma";

export type ProfileImage = {
  url: string;
  key: string;
};

export type ProfileDTO = {
  id: string;
  email: string;
  role: UserRole;

  name?: string | null;
  username?: string | null;
  image?: string | null;
};

export type SessionUser = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
};
