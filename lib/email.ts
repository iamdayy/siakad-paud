import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from =
  process.env.FROM_EMAIL ||
  `no-reply@${process.env.NEXT_PUBLIC_VERCEL_URL || "example.com"}`;

export async function sendConfirmationEmail(
  to: string,
  subject: string,
  text: string,
) {
  if (!host || !port || !user || !pass) {
    console.warn("SMTP config missing; skipping sendConfirmationEmail", {
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
  });
}
