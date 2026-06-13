// Serverless function: POST /api/spotify
// Body: { tracks: ["Artist - Track", ...] }
// Batch search — one token, one request per track, returns all results.

let cachedToken = null;
let tokenExpiry = 0;

async function getToken(clientId, clientSecret) {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("token_failed");
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return res.status(500).json({ error: "missing_spotify_credentials" });

  let body = req.body;
  if (typeof body === "string") try { body = JSON.parse(body); } catch { body = {}; }
  const tracks = body?.tracks;
  if (!Array.isArray(tracks) || tracks.length === 0) return res.status(400).json({ error: "missing_tracks" });

  try {
    const token = await getToken(clientId, clientSecret);
    const results = [];

    // Search with rate limit handling
    for (const q of tracks.slice(0, 5)) {
      try {
        let searchRes = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(q.replace(/—/g, "-").trim())}&type=track&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Retry once after delay if rate limited
        if (searchRes.status === 429) {
          const wait = parseInt(searchRes.headers.get("Retry-After") || "2", 10);
          await new Promise(r => setTimeout(r, (wait + 1) * 1000));
          searchRes = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q.replace(/—/g, "-").trim())}&type=track&limit=1`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        if (!searchRes.ok) { results.push({ query: q, found: false }); continue; }
        const data = await searchRes.json();
        const t = data.tracks?.items?.[0];
        if (!t) { results.push({ query: q, found: false }); continue; }
        results.push({
          query: q, found: true, id: t.id, name: t.name,
          artist: t.artists?.map(a => a.name).join(", ") || "",
          image: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || "",
          preview_url: t.preview_url,
          spotify_url: t.external_urls?.spotify || "",
        });
      } catch { results.push({ query: q, found: false }); }
    }

    return res.status(200).json({ results });
  } catch (e) {
    return res.status(500).json({ error: "server", message: String(e).slice(0, 300) });
  }
}
