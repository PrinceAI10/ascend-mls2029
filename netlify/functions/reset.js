const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.SITE_URL || "https://your-site.netlify.app";
const FROM = process.env.MAIL_FROM || "ASCEND <onboarding@resend.dev>";

async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  return res.json();
}

exports.requestReset = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const { identifier } = JSON.parse(event.body || "{}");
    if (!identifier) return { statusCode: 400, body: JSON.stringify({ error: "Missing identifier" }) };
    
    const id = String(identifier).trim().toLowerCase();
    const rows = await sb(`profiles?or=(username.eq.${encodeURIComponent(id)},email.eq.${encodeURIComponent(id)})&select=username,email`);
    const user = Array.isArray(rows) ? rows[0] : null;
    
    if (!user) return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    
    const token = crypto.randomUUID() + crypto.randomUUID().slice(0, 8);
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await sb("reset_tokens", {
      method: "POST",
      body: JSON.stringify({ token, username: user.username, expires_at: expires }),
    });
    
    const link = `${SITE_URL}/reset?token=${token}`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: user.email,
        subject: "Reset your ASCEND password",
        html: `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;color:#131922">
          <p style="font-family:monospace;letter-spacing:.2em;font-size:12px;color:#B4790A;margin:0 0 6px">ASCEND</p>
          <h2 style="margin:0 0 12px;font-size:20px">Reset your password</h2>
          <p style="color:#4B5A70;line-height:1.6;margin:0 0 20px">
            Hi ${user.username}, someone asked to reset your ASCEND password.
            Tap the button below to choose a new one. This link works once and expires in an hour.
          </p>
          <a href="${link}" style="display:inline-block;background:#E7A21F;color:#1B1405;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:10px">Set a new password</a>
          <p style="color:#7C8798;font-size:13px;line-height:1.6;margin:22px 0 0">
            If this was not you, ignore this email and nothing changes.
          </p>
        </div>`,
      }),
    });
    
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};

exports.confirmReset = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const { token, password } = JSON.parse(event.body || "{}");
    if (!token || !password) return { statusCode: 400, body: JSON.stringify({ error: "Missing token or password" }) };
    if (String(password).length < 6) return { statusCode: 400, body: JSON.stringify({ error: "Password must be at least 6 characters" }) };
    
    const rows = await sb(`reset_tokens?token=eq.${encodeURIComponent(token)}&select=*`);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row || row.used) return { statusCode: 400, body: JSON.stringify({ error: "That reset link has already been used." }) };
    if (new Date(row.expires_at) < new Date()) return { statusCode: 400, body: JSON.stringify({ error: "That reset link has expired. Request a new one." }) };
    
    const hash = await sha256(password);
    await sb(`profiles?username=eq.${encodeURIComponent(row.username)}`, {
      method: "PATCH", body: JSON.stringify({ pass_hash: hash }),
    });
    await sb(`reset_tokens?token=eq.${encodeURIComponent(token)}`, {
      method: "PATCH", body: JSON.stringify({ used: true }),
    });
    
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}