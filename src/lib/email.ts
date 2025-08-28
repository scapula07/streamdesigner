
// Example: Send email using a backend API endpoint
// You should implement the actual backend endpoint to handle sending emails (e.g., using nodemailer, SendGrid, etc.)

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, text, html }),
  });
  if (!res.ok) {
    throw new Error('Failed to send email');
  }
  return await res.json();
}
