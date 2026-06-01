import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from =
  process.env.FROM_EMAIL ||
  `no-reply@${process.env.NEXT_PUBLIC_VERCEL_URL || "example.com"}`;

export async function sendEmail({
  to,
  subject,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  text: string;
  attachments?: Mail.Attachment[];
}) {
  if (!host || !port || !user || !pass) {
    console.warn("SMTP config missing; skipping sendEmail", {
      host,
      port,
      user,
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    attachments,
  });
}

// Backward compatibility for existing code
export async function sendConfirmationEmail(
  to: string,
  subject: string,
  text: string,
) {
  return sendEmail({ to, subject, text });
}
