import nodemailer from "nodemailer";

/**
 * Transactional Email Sender
 * Exclusively uses Google SMTP (smtp.gmail.com with App Password)
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

// Global cached connection pool to prevent per-request TLS handshakes
let cachedTransporter: nodemailer.Transporter | null = null;
let lastSmtpConfigKey = "";

function getPooledTransporter(user: string, pass: string): nodemailer.Transporter {
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").replace(/^["']|["']$/g, "").trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  const isSecure = port === 465;
  const currentKey = `${host}:${port}:${user}`;

  if (cachedTransporter && lastSmtpConfigKey === currentKey) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    pool: true, // Reuse open socket connections
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 14, // Safe dispatch rate for Gmail SMTP
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

  lastSmtpConfigKey = currentKey;
  return cachedTransporter;
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

  const smtpUserRaw = process.env.SMTP_USER || process.env.GMAIL_USER || "";
  const smtpPassRaw = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";

  const smtpUser = smtpUserRaw.replace(/^["']|["']$/g, "").trim();
  const smtpPass = smtpPassRaw.replace(/^["']|["']$/g, "").replace(/\s+/g, "").trim();

  // 1. Preferred: Google SMTP / Custom SMTP
  if (smtpUser && smtpPass) {
    try {
      const transporter = getPooledTransporter(smtpUser, smtpPass);

      const rawFrom = (process.env.SMTP_FROM || process.env.EMAIL_FROM || "").replace(/^["']|["']$/g, "").trim();
      const fromAddress = rawFrom || `Nova Forge <${smtpUser}>`;

      // Generate clean plain text fallback to drastically improve spam score
      const plainText = processedHtml
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const info = await transporter.sendMail({
        from: fromAddress.includes("<") ? fromAddress : `Nova Forge <${fromAddress}>`,
        replyTo: smtpUser,
        to,
        subject,
        text: plainText,
        html: processedHtml,
        headers: {
          "X-Priority": "3",
          "X-MSMail-Priority": "Normal",
          "Importance": "Normal",
        },
        attachments: finalAttachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          cid: a.cid,
          contentType: a.contentType,
        })),
      });

      console.log(`[Google SMTP] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send email via SMTP";
      console.error("[Google SMTP Error] Failed to send email via SMTP:", err);
      return { success: false, error: message };
    }
  }

  // Google SMTP credentials not configured (development warning)
  console.warn(
    `[Google SMTP Warning] No SMTP credentials configured (SMTP_USER/SMTP_PASS). Simulated email to: ${to} | Subject: ${subject}`
  );
  return { success: false, error: "Google SMTP credentials not configured on server." };
}
