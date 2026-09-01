import QRCode from "qrcode";
import crypto from "crypto";

/**
 * Generate Participant Team ID: NF-BGMI-2026-XXXXX
 * 5 uppercase alphanumeric characters (excluding confusing 0/O, 1/I)
 */
export function generateTeamId(game: string = "bgmi"): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let salt = "";
  const randomBytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    salt += chars[randomBytes[i] % chars.length];
  }
  const gameTag = game.toUpperCase().replace(/[^A-Z0-9]/g, "") || "BGMI";
  return `NF-${gameTag}-2026-${salt}`;
}

/**
 * Generate Audience Pass ID: NF-AUD-SA-XXXX
 * 4 uppercase alphanumeric characters
 */
export function generateAudiencePassId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let salt = "";
  const randomBytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    salt += chars[randomBytes[i] % chars.length];
  }
  return `NF-AUD-SA-${salt}`;
}

/**
 * Generate Secure Internal QR Verification Token
 * Never expires, securely mapped to team / pass in DB
 */
export function generateQrToken(type: "participant" | "audience", id: string): string {
  const randomHex = crypto.randomBytes(16).toString("hex");
  return `nf_${type.slice(0, 3)}_${id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}_${randomHex}`;
}

/**
 * Generate QR Code Data URL (High quality PNG)
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: {
        dark: "#091522",
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    return "";
  }
}
