import React, { useState } from "react";
import { signIn, signUp, signInWithGoogle } from "./supabase.js";

const BLACK = "#080808", PANEL = "#0F0F10", WHITE = "#F4F4F0", GREY = "#7A7A78", DIM = "#4A4A48";
const LINE = "rgba(244,244,240,0.14)", ACCENT = "#C9F24D";
const font = "'IBM Plex Mono', ui-monospace, monospace";

export default function Auth({ onSkip }) {
  const [mode, setMode] = useState("in"); // "in" | "up"
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg(""); setBusy(true);
    try {
      if (mode === "up") {
        await signUp(email.trim(), pw);
        setMsg("Account made. Check your email to confirm, then sign in.");
        setMode("in");
      } else {
        await signIn(email.trim(), pw);
        // onAuthChange in App handles the rest
      }
    } catch (e) {
      setMsg(e.message || "Something went wrong.");
    } finally { setBusy(false); }
  }

  const btn = { border: `1px solid ${LINE}`, padding: 13, fontSize: 11, letterSpacing: "0.15em", fontFamily: font, cursor: "pointer", textTransform: "uppercase", background: "transparent", color: WHITE };
  const fld = { width: "100%", background: "transparent", border: `1px solid ${LINE}`, color: WHITE, padding: 14, fontSize: 12, letterSpacing: "0.08em", fontFamily: font, marginBottom: 10 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, fontFamily: font }}>
      <div style={{ width: "100%", maxWidth: 380, background: PANEL, border: `1px solid ${LINE}`, padding: "40px 30px 28px" }}>
        <div style={{ textAlign: "center", fontSize: 22, marginBottom: 4 }}>✦</div>
        <h2 style={{ textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 15, textAlign: "center", fontWeight: 400, margin: "0 0 4px" }}>Cosmic Closet</h2>
        <p style={{ color: GREY, fontSize: 10, textAlign: "center", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 26px" }}>{mode === "in" ? "Sign in to track your fits" : "Make an account"}</p>

        <input style={fld} type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        <input style={fld} type="password" placeholder="PASSWORD" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); }} autoComplete={mode === "in" ? "current-password" : "new-password"} />

        {msg && <div style={{ fontSize: 9, color: msg.startsWith("Account") ? ACCENT : "#E06", letterSpacing: "0.08em", margin: "4px 0 12px", lineHeight: 1.6, textTransform: "uppercase" }}>{msg}</div>}

        <button style={{ ...btn, width: "100%", background: WHITE, color: BLACK, marginTop: 6 }} disabled={busy} onClick={submit}>
          {busy ? "…" : mode === "in" ? "Sign in →" : "Create account →"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0 2px" }}>
          <span style={{ flex: 1, height: 1, background: LINE }} />
          <span style={{ fontSize: 9, color: DIM, letterSpacing: "0.12em", textTransform: "uppercase" }}>or</span>
          <span style={{ flex: 1, height: 1, background: LINE }} />
        </div>

        <button style={{ ...btn, width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          onClick={async () => { setMsg(""); try { await signInWithGoogle(); } catch (e) { setMsg(e.message || "Google sign-in failed."); } }}>
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>

        <button style={{ width: "100%", background: "none", border: "none", color: GREY, fontSize: 10, letterSpacing: "0.12em", marginTop: 16, fontFamily: font, cursor: "pointer", textTransform: "uppercase" }}
          onClick={() => { setMsg(""); setMode(mode === "in" ? "up" : "in"); }}>
          {mode === "in" ? "No account? Make one" : "Have an account? Sign in"}
        </button>

        <button style={{ width: "100%", background: "none", border: "none", color: DIM, fontSize: 9, letterSpacing: "0.15em", marginTop: 14, fontFamily: font, cursor: "pointer", textTransform: "uppercase" }} onClick={onSkip}>
          Skip — browse without saving
        </button>
      </div>
    </div>
  );
}
