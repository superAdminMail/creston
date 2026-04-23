import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
  idempotencyKey,
}: {
  to: string;
  subject: string;
  html: string | React.ReactElement;
  from?: string;
  replyTo?: string;
  idempotencyKey?: string;
}) {
  const renderedHtml = typeof html === "string" ? html : await render(html);

  const payload: Parameters<typeof resend.emails.send>[0] & {
    idempotencyKey?: string;
  } = {
    from: from ?? process.env.EMAIL_FROM_NO_REPLY!,
    to,
    subject,
    html: renderedHtml,
    replyTo,
    idempotencyKey,
  };

  return resend.emails.send(payload);
}
