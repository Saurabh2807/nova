import nodemailer from "nodemailer";

/**
 * Transactional Email Sender
 * Supports:
 * 1. Google Custom SMTP / Any SMTP (smtp.gmail.com with App Password)
 * 2. Resend API
 * 3. Fallback warning logger in development
 */

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  cid?: string;
  contentType?: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail({ to, subject, html, attachments = [] }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  // Auto-convert any embedded base64 data URIs into CID inline attachments for Gmail, Outlook & mobile mail clients
  let processedHtml = html;
  const finalAttachments: EmailAttachment[] = [...attachments];
  let imgIndex = finalAttachments.length;

  processedHtml = processedHtml.replace(/src=["']data:image\/(png|jpeg|jpg|webp|gif);base64,([^"']+)["']/gi, (_match, mimeType, base64Data) => {
    imgIndex++;
    const cid = `qr-ticket-${imgIndex}@novaforge`;
    finalAttachments.push({
      filename: `ticket-qr-${imgIndex}.${mimeType === "jpeg" ? "jpg" : mimeType}`,
      content: Buffer.from(base64Data, "base64"),
      cid: cid,
      contentType: `image/${mimeType}`,
    });
    return `src="cid:${cid}"`;
  });

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  // 1. Preferred: Google SMTP / Custom SMTP
  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST || "smtp.gmail.com";
      const port = Number(process.env.SMTP_PORT) || 465;
      const isSecure = port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure, // true for 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ""), // strip accidental spaces in app password
        },
      });

      const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_FROM || `Nova Forge <${smtpUser}>`;

      const info = await transporter.sendMail({
        from: fromAddress.includes("<") ? fromAddress : `Nova Forge <${fromAddress}>`,
        to,
        subject,
        html: processedHtml,
        attachments: finalAttachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          cid: a.cid,
          contentType: a.contentType,
        })),
      });

      console.log(`[Google SMTP] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return { success: true };
    } catch (err: any) {
      console.error("[Google SMTP Error] Failed to send email via SMTP:", err);
      return { success: false, error: err?.message || "Failed to send email via SMTP" };
    }
  }

  // 2. Fallback: Resend API if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress.includes("<") ? fromAddress : `Nova Forge <${fromAddress}>`,
          to: [to],
          subject,
          html: processedHtml,
          attachments: finalAttachments.map((a) => ({
            filename: a.filename,
            content: Buffer.isBuffer(a.content) ? a.content.toString("base64") : a.content,
            content_id: a.cid,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("[Resend API Error]:", errData);
        return { success: false, error: errData.message || "Failed to send email via Resend" };
      }

      console.log(`[Resend] Successfully delivered email to ${to}`);
      return { success: true };
    } catch (err: any) {
      console.error("[Resend Exception]:", err);
      return { success: false, error: err.message || "Unknown email error" };
    }
  }

  // 3. Neither configured: Local warning
  console.warn(
    `[Email Sender] No SMTP credentials found in .env.local.\n` +
    `To send via Google SMTP, configure:\n` +
    `  SMTP_USER=your_email@gmail.com\n` +
    `  SMTP_PASS=your_16_digit_app_password\n` +
    `[Simulated Email to]: ${to} | Subject: ${subject}`
  );
  return { success: true };
}
