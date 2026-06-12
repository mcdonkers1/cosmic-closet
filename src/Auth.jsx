import React, { useState } from "react";
import { signIn, signUp } from "./supabase.js";

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
