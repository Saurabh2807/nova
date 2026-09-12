/**
 * Nova Forge Branded Email Templates (White + #2872A1)
 */

interface LeaderEmailProps {
  teamName: string;
  teamId: string;
  leaderName: string;
  leaderPhone: string;
  leaderCollegeId: string;
  player2Name: string;
  player2Phone: string;
  player2CollegeId: string;
  qrDataUrl: string;
  eventDate?: string;
  venue?: string;
  reportingTime?: string;
}

interface Player2EmailProps {
  teamName: string;
  teamId: string;
  leaderName: string;
  player2Name: string;
  player2Phone: string;
  player2CollegeId: string;
  qrDataUrl: string;
  eventDate?: string;
  venue?: string;
  reportingTime?: string;
}

interface AudienceEmailProps {
  fullName: string;
  passId: string;
  phone: string;
  collegeId: string;
  qrDataUrl: string;
  eventDate?: string;
  venue?: string;
  reportingTime?: string;
}

/**
 * HTML Sanitizer to prevent HTML/script injection in email templates
 */
export function escapeHtml(str: string = ""): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getLeaderEmailHtml({
  teamName,
  teamId,
  leaderName,
  leaderPhone,
  leaderCollegeId,
  player2Name,
  player2Phone,
  player2CollegeId,
  qrDataUrl,
  eventDate = "18–19 September 2026",
  venue = "LNCT Bhopal",
  reportingTime = "09:00 AM IST",
}: LeaderEmailProps): string {
  const safeTeamName = escapeHtml(teamName);
  const safeTeamId = escapeHtml(teamId);
  const safeLeaderName = escapeHtml(leaderName);
  const safeLeaderPhone = escapeHtml(leaderPhone);
  const safeLeaderCollegeId = escapeHtml(leaderCollegeId);
  const safePlayer2Name = escapeHtml(player2Name);
  const safePlayer2Phone = escapeHtml(player2Phone);
  const safePlayer2CollegeId = escapeHtml(player2CollegeId);
  const safeEventDate = escapeHtml(eventDate);
  const safeVenue = escapeHtml(venue);
  const safeReportingTime = escapeHtml(reportingTime);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Registration is Confirmed — Nova Forge BGMI Team Pass</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6fa; margin: 0; padding: 24px; color: #091522; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: #091522; padding: 28px; text-align: center; border-bottom: 3px solid #2872A1; }
    .badge { display: inline-block; background: #2872A1; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; padding: 5px 14px; border-radius: 999px; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -0.02em; }
    .subtitle { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 6px; }
    .content { padding: 28px; }
    .pass-card { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0; }
    .team-id { font-family: monospace; font-size: 22px; font-weight: 800; color: #2872A1; letter-spacing: 0.1em; }
    .qr-container { margin: 16px auto; width: 180px; height: 180px; background: #ffffff; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .qr-container img { width: 100%; height: 100%; object-fit: contain; }
    .grid { display: table; width: 100%; margin-top: 20px; border-collapse: collapse; }
    .row { display: table-row; }
    .cell { display: table-cell; padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
    .cell-header { background: #f1f5f9; font-weight: 700; color: #475569; width: 35%; }
    .alert-box { background: #eff6ff; border-left: 4px solid #2872A1; padding: 14px; border-radius: 6px; margin-top: 24px; font-size: 13px; line-height: 1.5; color: #1e3a8a; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Team Leader Pass</span>
      <h1 class="title">NOVA FORGE CAMPUS CARNIVAL</h1>
      <p class="subtitle">BGMI Tournament Registration Confirmed</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">Hey ${safeLeaderName},</p>
      <p style="font-size: 14px; color: #475569; margin-top: 0;">Your team <strong>${safeTeamName}</strong> has been successfully registered for the BGMI tournament on Day 2.</p>
      
      <div class="pass-card">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.1em;">Official Team ID</div>
        <div class="team-id">${safeTeamId}</div>
        
        <div class="qr-container" style="margin: 16px auto; width: 180px; height: 180px; background: #ffffff; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
          <img src="${qrDataUrl}" alt="Team QR Pass" width="160" height="160" style="display: block; margin: 0 auto; width: 160px; height: 160px; border: 0;" />
        </div>
        <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Scan at LNCT check-in desk for entry</p>
      </div>

      <div class="grid">
        <div class="row">
          <div class="cell cell-header">Team Name</div>
          <div class="cell"><strong>${safeTeamName}</strong></div>
        </div>
        <div class="row">
          <div class="cell cell-header">Team Leader (P1)</div>
          <div class="cell">${safeLeaderName} (${safeLeaderPhone})<br><span style="color:#64748b; font-size:11px;">ID: ${safeLeaderCollegeId}</span></div>
        </div>
        <div class="row">
          <div class="cell cell-header">Team Member (P2)</div>
          <div class="cell">${safePlayer2Name} (${safePlayer2Phone})<br><span style="color:#64748b; font-size:11px;">ID: ${safePlayer2CollegeId}</span></div>
        </div>
        <div class="row">
          <div class="cell cell-header">Venue</div>
          <div class="cell"><strong>${safeVenue}</strong></div>
        </div>
        <div class="row">
          <div class="cell cell-header">Date & Reporting</div>
          <div class="cell"><strong>${safeEventDate}</strong> · Reporting by <strong>${safeReportingTime}</strong></div>
        </div>
      </div>

      <div class="alert-box">
        <strong>Mandatory Reporting Instructions:</strong><br>
        • Both players must arrive at the venue by <strong>${safeReportingTime}</strong> with their official College ID / Enrollment Card.<br>
        • Present this email or QR Code at the registration desk for verification.
      </div>
    </div>
    <div class="footer">
      Nova Forge · LNCT Campus Carnival · For queries, reach out to organizers at the arena.
    </div>
  </div>
</body>
</html>
`;
}

export function getPlayer2EmailHtml({
  teamName,
  teamId,
  leaderName,
  player2Name,
  player2Phone,
  player2CollegeId,
  qrDataUrl,
  eventDate = "18–19 September 2026",
  venue = "LNCT Bhopal",
  reportingTime = "09:00 AM IST",
}: Player2EmailProps): string {
  const safeTeamName = escapeHtml(teamName);
  const safeTeamId = escapeHtml(teamId);
  const safeLeaderName = escapeHtml(leaderName);
  const safePlayer2Name = escapeHtml(player2Name);
  const safePlayer2Phone = escapeHtml(player2Phone);
  const safePlayer2CollegeId = escapeHtml(player2CollegeId);
  const safeEventDate = escapeHtml(eventDate);
  const safeVenue = escapeHtml(venue);
  const safeReportingTime = escapeHtml(reportingTime);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>You're Registered — Nova Forge BGMI Team Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6fa; margin: 0; padding: 24px; color: #091522; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: #091522; padding: 28px; text-align: center; border-bottom: 3px solid #2872A1; }
    .badge { display: inline-block; background: #0284c7; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; padding: 5px 14px; border-radius: 999px; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -0.02em; }
    .subtitle { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 6px; }
    .content { padding: 28px; }
    .pass-card { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0; }
    .team-id { font-family: monospace; font-size: 22px; font-weight: 800; color: #2872A1; letter-spacing: 0.1em; }
    .qr-container { margin: 16px auto; width: 180px; height: 180px; background: #ffffff; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .qr-container img { width: 100%; height: 100%; object-fit: contain; }
    .grid { display: table; width: 100%; margin-top: 20px; border-collapse: collapse; }
    .row { display: table-row; }
    .cell { display: table-cell; padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
    .cell-header { background: #f1f5f9; font-weight: 700; color: #475569; width: 35%; }
    .alert-box { background: #eff6ff; border-left: 4px solid #2872A1; padding: 14px; border-radius: 6px; margin-top: 24px; font-size: 13px; line-height: 1.5; color: #1e3a8a; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Team Member Pass</span>
      <h1 class="title">NOVA FORGE CAMPUS CARNIVAL</h1>
      <p class="subtitle">BGMI Squad Confirmation</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">Hey ${safePlayer2Name},</p>
      <p style="font-size: 14px; color: #475569; margin-top: 0;">You have been registered as a Team Member under Team Leader <strong>${safeLeaderName}</strong> for squad <strong>${safeTeamName}</strong>.</p>
      
      <div class="pass-card">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.1em;">Team ID</div>
        <div class="team-id">${safeTeamId}</div>
        
        <div class="qr-container" style="margin: 16px auto; width: 180px; height: 180px; background: #ffffff; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
          <img src="${qrDataUrl}" alt="Team QR Pass" width="160" height="160" style="display: block; margin: 0 auto; width: 160px; height: 160px; border: 0;" />
        </div>
        <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Shared Squad QR Code</p>
      </div>

      <div class="grid">
        <div class="row">
          <div class="cell cell-header">Your Role</div>
          <div class="cell"><strong>Team Member (Player 2)</strong></div>
        </div>
        <div class="row">
          <div class="cell cell-header">Team Name</div>
          <div class="cell"><strong>${safeTeamName}</strong></div>
        </div>
        <div class="row">
          <div class="cell cell-header">Team Leader</div>
          <div class="cell">${safeLeaderName}</div>
        </div>
        <div class="row">
          <div class="cell cell-header">Your Details</div>
          <div class="cell">${safePlayer2Name} (${safePlayer2Phone})<br><span style="color:#64748b; font-size:11px;">College ID: ${safePlayer2CollegeId}</span></div>
        </div>
        <div class="row">
          <div class="cell cell-header">Venue & Date</div>
          <div class="cell"><strong>${safeVenue}</strong> · <strong>${safeEventDate}</strong></div>
        </div>
      </div>

      <div class="alert-box">
        <strong>Important Notice:</strong><br>
        • Your Team Leader completed the registration for your team.<br>
        • Bring this email or the QR Code along with your physical College ID during check-in by <strong>${safeReportingTime}</strong>.
      </div>
    </div>
    <div class="footer">
      Nova Forge · LNCT Campus Carnival · See you on the battleground.
    </div>
  </div>
</body>
</html>
`;
}

export function getAudienceEmailHtml({
  fullName,
  passId,
  phone,
  collegeId,
  qrDataUrl,
  eventDate = "18–19 September 2026",
  venue = "LNCT Bhopal",
  reportingTime = "09:00 AM IST",
}: AudienceEmailProps): string {
  const safeFullName = escapeHtml(fullName);
  const safePassId = escapeHtml(passId);
  const safePhone = escapeHtml(phone);
  const safeCollegeId = escapeHtml(collegeId);
  const safeEventDate = escapeHtml(eventDate);
  const safeVenue = escapeHtml(venue);
  const safeReportingTime = escapeHtml(reportingTime);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Entry Ticket — Nova Forge Campus Carnival Pass</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6fa; margin: 0; padding: 24px; color: #091522; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: #091522; padding: 26px; text-align: center; border-bottom: 3px solid #2872A1; }
    .badge { display: inline-block; background: #2872A1; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; padding: 5px 14px; border-radius: 999px; margin-bottom: 10px; }
    .title { color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; }
    .content { padding: 26px; }
    .ticket { background: #f8fafc; border: 2px dashed #2872A1; border-radius: 12px; padding: 18px; text-align: center; margin: 16px 0; }
    .pass-id { font-family: monospace; font-size: 24px; font-weight: 800; color: #2872A1; letter-spacing: 0.08em; }
    .qr-container { margin: 14px auto; width: 170px; height: 170px; background: #ffffff; padding: 8px; border-radius: 10px; border: 1px solid #cbd5e1; }
    .qr-container img { width: 100%; height: 100%; object-fit: contain; }
    .footer { background: #f8fafc; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Audience Entry Pass</span>
      <h1 class="title">NOVA FORGE CAMPUS CARNIVAL</h1>
    </div>
    <div class="content">
      <p style="font-size: 15px; font-weight: 600;">Welcome, ${safeFullName}!</p>
      <p style="font-size: 13.5px; color: #475569;">Here is your official digital entry ticket for the LNCT Campus Carnival.</p>
      
      <div class="ticket">
        <div style="font-size: 10.5px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.1em;">Audience Pass ID</div>
        <div class="pass-id">${safePassId}</div>
        
        <div class="qr-container" style="margin: 14px auto; width: 170px; height: 170px; background: #ffffff; padding: 8px; border-radius: 10px; border: 1px solid #cbd5e1; text-align: center;">
          <img src="${qrDataUrl}" alt="Audience QR Code" width="154" height="154" style="display: block; margin: 0 auto; width: 154px; height: 154px; border: 0;" />
        </div>
        <div style="font-family: monospace; font-size: 14px; font-weight: 800; color: #2872A1; letter-spacing: 0.1em; margin-top: 6px;">${safePassId}</div>
        <p style="font-size: 12px; font-weight: 700; color: #091522; margin: 6px 0 0 0;">${safeVenue} · ${safeEventDate}</p>
        <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Gates Open: ${safeReportingTime}</p>
      </div>

      <div style="font-size: 12.5px; color: #475569; line-height: 1.6; margin-top: 18px;">
        • <strong>Attendee:</strong> ${safeFullName} (${safePhone})<br>
        • <strong>College ID:</strong> ${safeCollegeId}<br>
        • <strong>Entry:</strong> Free Entry · Show this QR code at the gate.
      </div>
    </div>
    <div class="footer">
      Nova Forge · LNCT Bhopal · See you at the arena!
    </div>
  </div>
</body>
</html>
`;
}
