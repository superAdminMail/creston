import { createRealtimeNotification } from "./createNotification";

type RealtimeNotificationInput = Parameters<
  typeof createRealtimeNotification
>[0];

export async function notifyManyRealtimeNotifications<TRecipient>(input: {
  recipients: readonly TRecipient[];
  buildNotification: (
    recipient: TRecipient,
  ) => RealtimeNotificationInput;
  failureMessage: string;
  failureContext?: Record<string, unknown>;
}) {
  if (!input.recipients.length) {
    return {
      sentCount: 0,
      failedCount: 0,
    };
  }

  const results = await Promise.allSettled(
    input.recipients.map((recipient) =>
      createRealtimeNotification(input.buildNotification(recipient)),
    ),
  );

  const failedCount = results.filter(
    (result) => result.status === "rejected",
  ).length;

  if (failedCount > 0) {
    console.error(input.failureMessage, {
      ...input.failureContext,
      failedCount,
    });
  }

  return {
    sentCount: results.length - failedCount,
    failedCount,
  };
}
