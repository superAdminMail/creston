// lib/resend/mail.ts
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
}: {
  to: string;
  subject: string;
  html: string | React.ReactElement;
  from?: string;
  replyTo?: string;
}) {
  const renderedHtml = typeof html === "string" ? html : await render(html);

  return resend.emails.send({
    from: from ?? process.env.EMAIL_FROM_NO_REPLY!,
    to,
    subject,
    html: renderedHtml,
    replyTo,
  });
}
