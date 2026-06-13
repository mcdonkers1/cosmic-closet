// Serverless function: GET /api/spotify?q=Artist - Track
// Uses Spotify Client Credentials flow (no user auth needed) to search tracks
// and return preview URLs for 30-second playback.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return res.status(500).json({ error: "missing_spotify_credentials" });

  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "missing_query" });

  try {
    // Get access token via Client Credentials
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });
    if (!tokenRes.ok) return res.status(502).json({ error: "token_failed" });
    const { access_token } = await tokenRes.json();

    // Search for track
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (!searchRes.ok) return res.status(502).json({ error: "search_failed" });
    const data = await searchRes.json();
    const track = data.tracks?.items?.[0];
    if (!track) return res.status(200).json({ found: false });

    return res.status(200).json({
      found: true,
      id: track.id,
      name: track.name,
      artist: track.artists?.map(a => a.name).join(", ") || "",
      album: track.album?.name || "",
      image: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || "",
      preview_url: track.preview_url,
      spotify_url: track.external_urls?.spotify || "",
      uri: track.uri,
    });
  } catch (e) {
    return res.status(500).json({ error: "server", message: String(e).slice(0, 300) });
  }
}
