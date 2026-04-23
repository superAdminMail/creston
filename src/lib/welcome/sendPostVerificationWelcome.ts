import { DEFAULT_ONBOARDING_REDIRECT } from "@/routes";
import { getAppBaseUrl } from "@/lib/config/appUrl";
import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { sendEmail } from "@/lib/resend/mail";
import WelcomeEmailTemplate from "./WelcomeEmailTemplate";

type WelcomeRecipient = {
  id: string;
  name: string;
  email: string;
};

function getFirstName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return "there";

  const [firstName] = trimmed.split(/\s+/);
  return firstName || "there";
}

export async function sendPostVerificationWelcome(user: WelcomeRecipient) {
  const site = await getSiteConfigurationCached();
  const brandName = site?.siteName?.trim() || "Company";
  const firstName = getFirstName(user.name);
  const onboardingUrl = new URL(
    DEFAULT_ONBOARDING_REDIRECT,
    getAppBaseUrl(),
  ).toString();
  const idempotencyKey = `post-email-verification-welcome:${user.id}`;

  const emailPromise = sendEmail({
    to: user.email,
    subject: `Welcome to ${brandName} — Let’s Get You Started`,
    html: WelcomeEmailTemplate({
      firstName,
      onboardingUrl,
      siteName: brandName,
      siteLogoUrl: site?.siteLogoFileAsset?.url ?? null,
    }),
    from: process.env.EMAIL_FROM_NO_REPLY,
    replyTo: process.env.EMAIL_FROM_SUPPORT,
    idempotencyKey,
  });

  const notificationPromise = createRealtimeNotification({
    userId: user.id,
    event: "SYSTEM",
    title: `Welcome to ${brandName}`,
    message:
      "Your email has been successfully verified. Complete your onboarding to unlock your account and start investing.",
    link: DEFAULT_ONBOARDING_REDIRECT,
    key: idempotencyKey,
    metadata: {
      kind: "POST_EMAIL_VERIFICATION_WELCOME",
      onboardingUrl: DEFAULT_ONBOARDING_REDIRECT,
    },
  });

  const [emailResult, notificationResult] = await Promise.allSettled([
    emailPromise,
    notificationPromise,
  ]);

  if (emailResult.status === "rejected") {
    console.error("Failed to send post-verification welcome email", {
      userId: user.id,
      email: user.email,
      error: emailResult.reason,
    });
  }

  if (notificationResult.status === "rejected") {
    console.error("Failed to create post-verification welcome notification", {
      userId: user.id,
      email: user.email,
      error: notificationResult.reason,
    });
  }
}
