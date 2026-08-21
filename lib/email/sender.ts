/**
 * Transactional Email Sender
 * Uses Resend API or graceful fallback logger in development
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // In local development or before Resend API key is configured
    console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
    return { success: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Nova Forge <noreply@novaforge.gg>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Resend API error:", errData);
      return { success: false, error: errData.message || "Failed to send email" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Email send exception:", err);
    return { success: false, error: err.message || "Unknown email error" };
  }
}
