import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

import ProfilePageView from "@/app/account/dashboard/profile/ProfilePageView";

export default async function Page() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id || !sessionUser.email) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
      investorProfile: {
        select: {
          phoneNumber: true,
          country: true,
          state: true,
          city: true,
          addressLine1: true,
          addressLine2: true,
          isVerified: true,
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
        image: dbUser.image,
        role: dbUser.role,
      }}
      profile={dbUser.investorProfile}
    />
  );
}
