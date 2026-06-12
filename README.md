# Cosmic Closet

Pick your sign → read a Co-Star-style daily horoscope → get an outfit direction, a productivity task, and a board of **real fashion photos** matched to the day. Tuned by your sex, location (live weather), and age. Readings are cached per day with a 7-day history.

## What needs a key, and why

The browser can't safely hold API keys, so two tiny serverless functions hold them instead:

- `api/horoscope.js` → calls **Anthropic** for the daily reading. Needs `ANTHROPIC_API_KEY`.

Everything else (weather via Open-Meteo, ZIP resolution, history via `localStorage`) needs no key. If the photo endpoint isn't reachable, the app automatically falls back to built-in SVG "look cards" so it never shows broken images.

## Get your keys

2. **Anthropic** — https://console.anthropic.com/ → API Keys → create key.
3. **Supabase** (accounts + profile + fit calendar) — see below.

## Accounts & the fit calendar (Supabase)

Sign-in, profiles, and the calendar tracker (streak + notes + which fit) are stored per user in Supabase. Free tier is plenty.

1. Create a project at https://supabase.com (free). Wait for it to provision.
2. **SQL Editor** → New query → paste the contents of `supabase/schema.sql` → Run. This creates the `profiles` and `fit_log` tables, turns on Row Level Security so each user only sees their own data, and auto-creates a profile row on signup.
3. **Project Settings → API**, copy two values:
   - Project URL → set as `VITE_SUPABASE_URL`
   - `anon` `public` key → set as `VITE_SUPABASE_ANON_KEY`
4. (Optional) **Authentication → Providers → Email**: by default Supabase sends a confirmation email. For testing you can turn off "Confirm email" so new accounts work instantly.

The anon key is safe to expose in the browser — RLS is what protects the data, not key secrecy.

If the Supabase env vars are absent, the app simply skips the sign-in gate and runs without saving (the daily reading, weather, photos, and look board all still work).

## Run locally

```bash
npm install
cp .env.example .env      # paste your two keys into .env
npm run dev               # http://localhost:5173
```

> Note: `npm run dev` serves the front-end. To exercise the `/api/*` functions locally, use `vercel dev` (see below) or deploy.

## Deploy on Vercel (recommended, ~3 minutes)

1. Push this folder to a GitHub repo.
2. At https://vercel.com → "Add New Project" → import the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist` (auto-detected).
4. **Settings → Environment Variables**, add:
   - `PEXELS_API_KEY` = your Pexels key
   - `ANTHROPIC_API_KEY` = your Anthropic key
5. Deploy. The `api/` folder becomes `/api/photos` and `/api/horoscope` automatically.

## Deploy on Netlify

Same idea — the `api/` files work as Netlify Functions. Set the two env vars under **Site settings → Environment variables**. If needed, add a `netlify.toml` pointing functions at `api/`.

## Deploy on Lovable

Paste `src/App.jsx` into your Lovable project as the main component, and recreate the two `api/` functions as Lovable backend functions (Lovable supports serverless endpoints). Set the same two env vars in Lovable's project settings. Point the front-end `fetch("/api/...")` calls at whatever path Lovable assigns.

## Attribution

Per the Pexels API guidelines, photo credit is shown on each image and a "Photos via Pexels" link appears under the board. Keep these if you use Pexels.

## Files

```
api/
  horoscope.js    Anthropic daily reading (server-side key)
src/
  App.jsx         the whole front-end
  main.jsx        React entry
index.html
vite.config.js
vercel.json       SPA rewrite
.env.example      copy to .env with your keys
```
