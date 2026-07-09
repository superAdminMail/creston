import { Prisma } from "@/generated/prisma";

import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";

const SYSTEM_HEALTH_NAMESPACE_KEY = "systemHealth";

export function isSystemHealthProofDismissed(metadata: unknown) {
  const payload = asJsonObject(metadata);
  const namespace = asJsonObject(payload[SYSTEM_HEALTH_NAMESPACE_KEY]);

  return (
    typeof namespace.dismissedAt === "string" &&
    namespace.dismissedAt.trim().length > 0
  );
}

export function markSystemHealthProofDismissed(
  metadata: unknown,
  input: {
    dismissedAt: string;
    dismissedByUserId: string;
  },
): Prisma.InputJsonValue {
  const payload = asJsonObject(metadata);
  const namespace = asJsonObject(payload[SYSTEM_HEALTH_NAMESPACE_KEY]);

  return toJsonValue({
    ...payload,
    [SYSTEM_HEALTH_NAMESPACE_KEY]: {
      ...namespace,
      dismissedAt: input.dismissedAt,
      dismissedByUserId: input.dismissedByUserId,
    },
  });
}
