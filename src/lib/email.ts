type Email = { to: string; subject: string; text: string };

// SMTP provider is not chosen yet. Until it is, emails are only logged to the
// server console so the reset flow can be tested locally.
// TODO: replace with a real SMTP sender before production.
export async function sendEmail({ to, subject, text }: Email): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    console.error("sendEmail: no SMTP provider configured, email not sent");
    return;
  }
  console.log(`\n--- EMAIL (dev only) ---\nTo: ${to}\nSubject: ${subject}\n${text}\n------------------------\n`);
}
