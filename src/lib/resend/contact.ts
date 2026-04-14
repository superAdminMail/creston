import { sendEmail } from "@/lib/resend/mail";

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  return await sendEmail({
    from: process.env.EMAIL_FROM_SUPPORT ?? "Support <onboarding@resend.dev>",
    to: process.env.EMAIL_FROM_SUPPORT!,
    subject: `New Contact Message from ${name}`,
    replyTo: email,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });
}
