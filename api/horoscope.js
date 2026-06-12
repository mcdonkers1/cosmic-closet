// Serverless function: POST /api/horoscope
// Body: { prompt }  — the full prompt is built client-side (App.jsx) so all styling,
// budget, sex/age, weather, and anti-repeat logic stays in one place.
// This function only injects ANTHROPIC_API_KEY (kept server-side) and returns parsed JSON.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "missing_key", message: "ANTHROPIC_API_KEY is not set." });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { prompt } = body || {};
  if (!prompt) return res.status(400).json({ error: "missing_prompt" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1400,
        temperature: 1,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.status(502).json({ error: "upstream", message: errText.slice(0, 500) });
    }
    const data = await r.json();
    const text = (data.content || [])
      .filter((i) => i.type === "text")
      .map((i) => i.text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "server", message: String(e).slice(0, 500) });
  }
}
