// Serverless function: POST /api/horoscope
// Body: { sign, vibe, date, seed, sex, age, weather, avoid:{keywords,fits,activities} }
// Keeps ANTHROPIC_API_KEY server-side. Set it in your host's env vars.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "missing_key", message: "ANTHROPIC_API_KEY is not set." });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { sign, vibe = "", date, seed = 0, sex = "", age = "", weather = "", avoid = {} } = body || {};
  if (!sign) return res.status(400).json({ error: "missing_sign" });

  const sexClause = sex === "Male" ? " Style the outfit in menswear." : sex === "Female" ? " Style the outfit in womenswear." : " Keep the outfit gender-neutral.";
  let ageClause = "";
  const a = parseInt(age, 10);
  if (a) {
    if (a < 18) ageClause = ` The wearer is ${a} — age-appropriate, comfortable, nothing mature or revealing.`;
    else if (a <= 25) ageClause = ` The wearer is ${a} — trend-forward, playful, streetwear-leaning welcome.`;
    else if (a <= 40) ageClause = ` The wearer is ${a} — versatile, polished-but-current pieces.`;
    else if (a <= 60) ageClause = ` The wearer is ${a} — refined, quality-over-trend, elevated classics.`;
    else ageClause = ` The wearer is ${a} — comfortable, dignified, timeless.`;
  }
  const weatherClause = weather ? ` ${weather}` : "";
  const avoidBlock = (avoid.keywords?.length || avoid.fits?.length || avoid.activities?.length)
    ? `\n\nDO NOT REPEAT anything from the last few days. Previously used outfit keywords: ${JSON.stringify(avoid.keywords || [])}. Previously used fits: ${JSON.stringify(avoid.fits || [])}. Previously used tasks: ${JSON.stringify(avoid.activities || [])}. Today's fit, keyword, and task must each be clearly different — different garments, colors/silhouette, a different kind of task.`
    : "";

  const prompt = `You are writing in the blunt, spare, slightly provocative second-person voice of a Co-Star style horoscope. Write a FRESH, UNIQUE reading for ${sign} on ${date || new Date().toDateString()} (daily variation seed ${seed} — let it push you toward a distinct mood, outfit, and task than other days; do not mention the seed). Respond ONLY with valid JSON, no markdown or backticks. Schema: {"power":"one short blunt sentence about what to lean into today","pressure":"one short blunt sentence about tension today","trouble":"one short blunt sentence warning","fitName":"a short, evocative NAME for today's outfit style, 2-4 words, title case, like a capsule-collection or mood name — e.g. 'The Quiet Power Suit', 'Off-Duty Armor', 'Soft Brutalist' — distinctive and matching the day","mood":"2-4 word phrase capturing today's energy, title case","fit":"1 punchy sentence on what to wear today — name specific garments/colors/silhouette, under 18 words","activity":"one concrete task for today, blunt voice, under 14 words","keyword":"a 2-3 word fashion search phrase matching the day and the ${vibe} aesthetic","alts":["4 more distinct 2-3 word outfit search phrases for today, each a different garment/color/silhouette direction — varied, not minor rewordings"],"playlist":["5 real songs as 'Artist — Title' that soundtrack today's mood and fit energy — cohesive vibe"]}.${sexClause}${weatherClause}${ageClause} All fields must respect the guidance above.${avoidBlock}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, temperature: 1, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await r.json();
    const text = (data.content || []).filter((i) => i.type === "text").map((i) => i.text).join("").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(502).json({ error: "generation_failed", message: String(e) });
  }
}
