async function sendVerificationEmail({ to, verificationLink }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM || process.env.SMTP_FROM || "no-reply@hunterhugs.local";

  if (!resendApiKey) {
    console.log(`[EMAIL_FALLBACK] Verification link for ${to}: ${verificationLink}`);
    return { delivered: false, reason: "Resend API key not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: "Verify your HunterHugs account",
      text: `Verify your account by opening this link: ${verificationLink}`,
      html: `<p>Verify your HunterHugs account by clicking the link below:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }

  return { delivered: true };
}

module.exports = { sendVerificationEmail };
