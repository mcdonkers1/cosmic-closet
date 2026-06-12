# CLAUDE.md — Project handoff brief

You (Claude Code) are picking up **Cosmic Closet**: a Co-Star-style daily horoscope app that turns the day's reading into a named outfit ("The Fit"), a productivity task ("Do this"), a 5-track soundtrack, and a shareable story card. Dark monochrome aesthetic, IBM Plex Mono, acid-green accent (#C9F24D).

## State of the project — what already works

- `src/App.jsx` — the entire front-end, fully featured and current:
  - Onboarding (sex / city-or-ZIP weather via Open-Meteo / age), saved sign with auto-load
  - Daily reading (Power/Pressure/Trouble/The Fit/Do this) with per-day caching, 7-day history, anti-repeat daily variation, named fit styles
  - The Soundtrack (5 tracks with Spotify/Apple search deep links)
  - Share card (story-sized SVG → PNG download), profile + streak fit calendar (localStorage)
  - Find-the-look: keyword chips + Pinterest/TikTok/Instagram search links
- `api/horoscope.js` — Vercel serverless function calling Anthropic (key server-side). Schema matches the front-end exactly.
- PWA ready: `public/manifest.json`, icons, apple-touch meta in `index.html`.
- `npm run build` passes as handed off.

## Immediate task: deploy to a public URL (Vercel)

1. `npm install && npm run build` to confirm clean locally.
2. The user must have/log into: GitHub, Vercel, and an Anthropic API key (console.anthropic.com). Walk them through anything interactive.
3. Push to a GitHub repo (they may already have one named cosmic-closet — check; if it has a nested folder like `cosmic-closet 4/`, either flatten it or set Vercel Root Directory accordingly).
4. `vercel` CLI or dashboard import. Framework: Vite. Env var required: `ANTHROPIC_API_KEY`.
5. Verify on the live URL: pick a sign → reading generates (this proves the env var works). If the reading shows "The signal dropped…", the API call failed — check the key and function logs.

## Known facts that will save you time

- The horoscope fetch goes to `/api/horoscope` (POST). Under `npm run dev` plain Vite, that endpoint does not exist — use `vercel dev` to test it locally, or just deploy.
- Persistence is localStorage (per device). `src/Auth.jsx`, `src/Profile.jsx`, `src/supabase.js`, `supabase/schema.sql` exist from an earlier Supabase accounts build but are NOT currently imported by App.jsx. If the user asks for real accounts/cross-device sync: wire those back in (schema.sql sets up tables + RLS; env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Zodiac symbols carry U+FE0E so iOS renders text glyphs, not emoji. Don't strip it.
- The share card is inline SVG → canvas PNG. No external image libs; keep it that way (external image hosts were repeatedly blocked during development).
- Images: there is intentionally NO photo grid. Outfit discovery is via search links. If the user wants real photos, the previous approach was a Pexels-backed `/api/photos` function (since removed) — recreate only on request.

## Likely next asks (in the user's own roadmap)

- PWA verification on iPhone (Add to Home Screen), then **Capacitor iOS wrap** → Xcode → TestFlight (user has an M3 Pro Mac; needs $99 Apple Developer for TestFlight).
- "Save playlist to my Spotify" — needs Spotify OAuth (real backend work; the current deep links are the no-auth version).
- Supabase accounts re-wire (see above).
- A square 1:1 share-card variant for IG feed.

## User context

Founder, ships fast, prefers working prototypes then polish, terse communication, minimal filler. Show, don't lecture. When something needs their login, say exactly which account and stop.

---

## TASK: User accounts + login (decisions locked by the user — build to this exactly)

The user wants real accounts so people can log in and have their streak / fit-log follow them across devices. The Supabase scaffolding already exists and is mostly ready — your job is to WIRE IT IN and add two things (Google sign-in + correct gating). Do NOT rebuild from scratch.

### Locked product decisions (do not deviate)
1. **Login methods: Email + password AND Google sign-in.** Both. (`signIn`/`signUp`/`signInWithGoogle` already exist in `src/supabase.js`.)
2. **Anonymous use stays allowed.** The app must work with no account, saving to localStorage as it does today. Do NOT force login at app open.
3. **Gate on two specific actions:** prompt the user to create/sign in to an account ONLY when they:
   - (a) open the **Profile** section, or
   - (b) try to **save their outfit** ("Wore the fit?" / save outfit prompt).
   At those two moments, show the `Auth` modal. Everywhere else stays open and anonymous.

### What already exists (reuse, don't recreate)
- `src/supabase.js` — client + `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `getSession`, `onAuthChange`, `getProfile`, `upsertProfile`, `getFitLog`, `upsertFitDay`, `computeStreak`. Returns a null client if env vars are missing (so the app shows a message instead of crashing).
- `src/Auth.jsx` — email+password modal UI in the app's aesthetic. **You must add a "Continue with Google" button** to it that calls `signInWithGoogle()`, plus an `onSkip`/close affordance so anonymous users can dismiss it (since login is optional).
- `supabase/schema.sql` — `profiles` + `fit_log` tables, RLS (each user sees only their own rows), and a trigger that auto-creates a profile row on signup. Run it once in the Supabase SQL editor.
- `src/Profile.jsx` — existing profile UI (review and connect to Supabase reads).

### Build steps
1. **Create the Supabase project** (user does this — walk them through it):
   - supabase.com → New project. Copy the Project URL and the anon/public key.
   - SQL Editor → paste all of `supabase/schema.sql` → Run.
   - Authentication → Providers → enable **Email** (turn on "Confirm email" for production), and enable **Google**:
     - In Google Cloud Console: create an OAuth 2.0 Client ID (Web application). Authorized redirect URI = the value Supabase shows on the Google provider page (looks like `https://<project>.supabase.co/auth/v1/callback`). Paste the Google client ID + secret back into Supabase's Google provider settings.
     - Authentication → URL Configuration → add the deployed Vercel URL (and `http://localhost:5173` for local dev) to the allowed redirect URLs, so `redirectTo: window.location.origin` works.
2. **Env vars** — add to `.env.local` for dev and to Vercel project settings for prod:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (these are public-by-design; RLS is the real protection).
   (`ANTHROPIC_API_KEY` for the horoscope function stays as-is.)
3. **Wire auth state into `App.jsx`:**
   - On mount, call `getSession()` and subscribe with `onAuthChange()` to track the current user in state (`user`).
   - Add an `authPrompt` state. When the user clicks Profile or tries to save an outfit AND `!user`, set `authPrompt = true` to show `<Auth onSkip={() => setAuthPrompt(false)} />`. If they skip, let the save fall back to localStorage (anonymous) and let Profile show a "sign in to sync" empty state.
4. **Storage layer swap (the important part):** create a small data layer that routes by auth state:
   - If `user` is set → read/write Supabase (`getProfile`/`upsertProfile`/`getFitLog`/`upsertFitDay`).
   - If no `user` → keep using the existing localStorage paths (today's behavior).
   Keep the existing `window.storage`/localStorage calls as the anonymous branch; add the Supabase branch alongside. The fit-log shape maps to the `fit_log` table (date, wore, fit, note). NOTE: the app also snapshots the avatar + prefs per logged day — add `avatar jsonb` and `prefs jsonb` columns to `fit_log` in schema.sql if you want the visual fit archive to sync across devices (recommended; update the upsert accordingly).
5. **Local→cloud migration:** on first successful login, if localStorage has a profile/fit history, offer a one-time "import your saved progress?" that pushes those rows up via `upsertProfile`/`upsertFitDay`, then optionally clears local. Don't silently overwrite cloud data that already exists.
6. **Sign out** — add a sign-out control in Profile (`signOut()`), which drops back to anonymous/localStorage.

### Test checklist
- App opens with no account, generates a reading, lets you browse — no login wall.
- Clicking Profile (logged out) shows the Auth modal; "skip" dismisses and shows the local/empty profile.
- Email signup → confirm email → sign in → Profile shows your data.
- Google sign-in completes the OAuth round trip and returns logged in.
- Logging a fit while signed in writes a `fit_log` row (check Supabase table editor); signing in on a second browser shows the same streak/fits.
- RLS works: a second user cannot see the first user's rows.

### Honest gotchas
- Google OAuth will NOT work from `localhost` until the redirect URLs are configured in BOTH Google Cloud and Supabase. Test email+password first; add Google once URLs are set.
- `redirectTo: window.location.origin` must match an allowed URL in Supabase Auth settings or the round trip fails silently.
- Email confirmation is on by default — during dev you can disable "Confirm email" in Supabase to iterate faster, then re-enable for launch.
- None of this runs in the in-chat artifact preview (no backend there). It only works in this Vite/Vercel project with env vars set.
