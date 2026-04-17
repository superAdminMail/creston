"use client";

import { UserDTO } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserQuery<TUser extends UserDTO = UserDTO>(
  initialUser?: TUser | null,
) {
  return useQuery<TUser | null>({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<TUser | null> => {
      const res = await fetch("/api/current-user", { credentials: "include" });

      if (!res.ok) return null;
      return (await res.json()) as TUser;
    },
    initialData: initialUser,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
