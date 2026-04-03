import { NormalizedAvatarAsset } from "@/lib/normalizeUser";

import { create } from "zustand";

export type SafeUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "SUPER_ADMIN" | "ADMIN" | "MODERATOR";
  image?: string | null;
  profileAvatarFileAsset?: NormalizedAvatarAsset;
};

type AuthState = {
  user: SafeUser | null;
  isAuthenticated: boolean;
  setUser: (user: SafeUser | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
