import { headers } from "next/headers";

import { auth } from "./auth";

export type CurrentSessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

export const getCurrentSessionUser = async (): Promise<CurrentSessionUser | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
};
