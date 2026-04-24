import { prisma } from "@/lib/prisma";

export async function hasUserBankInfoRequest(userId: string) {
  const existingRequest = await prisma.notification.findFirst({
    where: {
      userId,
      OR: [
        {
          key: {
            startsWith: "investment-order-bank-info-request-ack:",
          },
        },
        {
          key: {
            startsWith: "savings-funding-bank-info-request-ack:",
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(existingRequest);
}
