const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function row(label, value) {
  if (!value || (Array.isArray(value) && value.length === 0)) return '';
  const display = Array.isArray(value)
    ? value.map(v => `<span style="display:inline-block;background:#e3c9a4;border-radius:4px;padding:2px 8px;margin:2px 3px 2px 0;font-size:13px;">${esc(v)}</span>`).join(' ')
    : `<span style="font-size:15px;">${esc(value)}</span>`;
  return `
  <tr style="border-bottom:1px solid #ede8dc;">
    <td style="padding:10px 0;font-weight:600;width:200px;color:#666;font-size:13px;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;vertical-align:top;">${display}</td>
  </tr>`;
}

function section(title, rows) {
  return `
  <h3 style="margin:28px 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#999;">${title}</h3>
  <table style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

function textarea(label, value) {
  if (!value?.trim()) return '';
  return `
  <div style="margin:12px 0 20px;">
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#999;">${label}</p>
    <div style="background:#fff;border:1px solid #e3c9a4;border-radius:6px;padding:14px;font-size:15px;line-height:1.65;white-space:pre-wrap;">${esc(value)}</div>
  </div>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const d = req.body || {};

  const name = d.name?.trim();
  const email = d.email?.trim();

  if (!name || !email) {
    return res.status(400).json({ error: 'Nom et email requis' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const challenges = Array.isArray(d.challenges)
    ? d.challenges
    : d.challenges ? [d.challenges] : [];

  try {
    await resend.emails.send({
      from: 'Audit Robin <onboarding@resend.dev>',
      to: ['contact@robinpailhes.fr'],
      replyTo: email,
      subject: `🎯 Audit — ${esc(name)}${d.company ? ` · ${esc(d.company)}` : ''} (${esc(d.sector ?? '?')})`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1c1a18;background:#fff;">
  <div style="background:#1c1a18;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:18px;font-weight:700;color:#e3c9a4;">Nouvel audit reçu · robinpailhes.fr</h1>
  </div>
  <div style="background:#f7f3ea;padding:32px;border-radius:0 0 8px 8px;">

    <!-- Contact -->
    ${section('Contact', [
      row('Nom', name),
      row('Email', email),
      row('Téléphone', d.phone),
      row('Commerce / activité', d.company),
      row('Décideur', d.decision_maker),
    ].join(''))}

    <!-- Activité -->
    ${section('01 — Activité', [
      row('Secteur', d.sector),
      row('Taille équipe', d.team_size),
      row('Source clients', d.clients_source),
    ].join(''))}

    <!-- Défis -->
    ${section('02 — Défis & temps perdu', [
      row('Défis cochés', challenges),
      row('Heures perdues / semaine', d.time_lost),
      row('Messages clients / jour', d.messages_per_day),
    ].join(''))}

    <!-- Cadre -->
    ${section('03 — Cadre du projet', [
      row('Budget envisagé', d.budget),
      row('Délai souhaité', d.timing),
      row('Expérience IA', d.ai_experience),
    ].join(''))}

    <!-- Vision (gold info) -->
    <h3 style="margin:28px 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#999;">04 — Vision (gold info)</h3>
    ${textarea('Dans 6 mois, si tout va bien…', d.vision_6m)}
    ${textarea('Plus grosse frustration', d.biggest_frustration)}

    <!-- Message libre -->
    ${d.message?.trim() ? textarea('Message complémentaire', d.message) : ''}

    <p style="margin:32px 0 0;font-size:13px;color:#999;">Répondre directement : <a href="mailto:${esc(email)}" style="color:#1c1a18;">${esc(email)}</a>${d.phone ? ` · <a href="tel:${esc(d.phone)}" style="color:#1c1a18;">${esc(d.phone)}</a>` : ''}</p>
  </div>
</body>
</html>`
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[audit] Resend error:', err);
    return res.status(500).json({ error: 'Erreur envoi' });
  }
};
