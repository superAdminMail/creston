import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import ProfilePageView from "../_components/ProfilePageView";

export default async function Page() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id || !sessionUser.email) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      role: true,
      emailVerified: true,
      profileAvatarFileAsset: {
        select: {
          storageKey: true,
          url: true,
        },
      },
    },
  });

  if (!dbUser) {
    return null;
  }

  return (
    <ProfilePageView
      user={{
        name: dbUser.name,
        email: dbUser.email,
        username: dbUser.username,
        image: dbUser.profileAvatarFileAsset?.url ?? dbUser.image,
        role: dbUser.role,
        isEmailVerified: dbUser.emailVerified,
      }}
    />
  );
}
