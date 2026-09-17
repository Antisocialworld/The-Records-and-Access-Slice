import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await transport.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: "Your sign-in code",
    text: `Your one-time code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `<p>Your one-time code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
  });
}
