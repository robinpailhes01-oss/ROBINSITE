const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.CONTACT_EMAIL || 'contact@robinpailhes.fr';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Site Robin <onboarding@resend.dev>';
const CC_EMAIL = process.env.CC_EMAIL || null;

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, company, message } = req.body || {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      ...(CC_EMAIL ? { cc: [CC_EMAIL] } : {}),
      replyTo: email,
      subject: `💬 ${esc(name)}${company ? ` — ${esc(company)}` : ''} (robinpailhes.fr)`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1c1a18;background:#fff;">
  <div style="background:#e3c9a4;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:18px;font-weight:700;">Nouveau message · robinpailhes.fr</h1>
  </div>
  <div style="background:#f7f3ea;padding:32px;border-radius:0 0 8px 8px;">
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr style="border-bottom:1px solid #e3c9a4;">
        <td style="padding:12px 0;font-weight:600;width:130px;color:#666;font-size:14px;">Nom</td>
        <td style="padding:12px 0;font-size:15px;">${esc(name)}</td>
      </tr>
      <tr style="border-bottom:1px solid #e3c9a4;">
        <td style="padding:12px 0;font-weight:600;color:#666;font-size:14px;">Email</td>
        <td style="padding:12px 0;font-size:15px;"><a href="mailto:${esc(email)}" style="color:#1c1a18;">${esc(email)}</a></td>
      </tr>
      ${phone ? `<tr style="border-bottom:1px solid #e3c9a4;"><td style="padding:12px 0;font-weight:600;color:#666;font-size:14px;">Téléphone</td><td style="padding:12px 0;font-size:15px;">${esc(phone)}</td></tr>` : ''}
      ${company ? `<tr style="border-bottom:1px solid #e3c9a4;"><td style="padding:12px 0;font-weight:600;color:#666;font-size:14px;">Commerce</td><td style="padding:12px 0;font-size:15px;">${esc(company)}</td></tr>` : ''}
    </table>
    <h3 style="margin:0 0 10px;font-size:15px;font-weight:600;">Message</h3>
    <div style="background:#fff;border:1px solid #e3c9a4;border-radius:6px;padding:16px;font-size:15px;line-height:1.65;white-space:pre-wrap;">${esc(message)}</div>
    <p style="margin:28px 0 0;font-size:13px;color:#999;">Répondre directement : <a href="mailto:${esc(email)}" style="color:#1c1a18;">${esc(email)}</a></p>
  </div>
</body>
</html>`
    });

    if (result.error) {
      console.error('[contact] Resend rejected:', result.error);
      return res.status(500).json({ error: result.error.message || 'Erreur envoi' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[contact] Resend error:', err);
    return res.status(500).json({ error: 'Erreur envoi' });
  }
};
