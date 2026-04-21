"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { UserDTO } from "@/lib/types";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export function useCurrentUserQuery<TUser extends UserDTO = UserDTO>(
  initialUser?: TUser | null,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialUser === undefined) return;

    queryClient.setQueryData<TUser | null>(
      CURRENT_USER_QUERY_KEY,
      initialUser ?? null,
    );
  }, [initialUser, queryClient]);

  return useQuery<TUser | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
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
