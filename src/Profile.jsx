import React, { useState, useEffect } from "react";
import { getFitLog, upsertFitDay, upsertProfile, computeStreak, signOut } from "./supabase.js";

const BLACK = "#080808", PANEL = "#0F0F10", WHITE = "#F4F4F0", GREY = "#7A7A78", DIM = "#4A4A48";
const LINE = "rgba(244,244,240,0.14)", ACCENT = "#C9F24D";
const font = "'IBM Plex Mono', ui-monospace, monospace";
const todayKey = () => new Date().toISOString().slice(0, 10);
const monthName = (d) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();

export default function Profile({ user, profile, onProfileChange, onClose }) {
  const [log, setLog] = useState([]);
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState(todayKey());
  const [name, setName] = useState(profile?.display_name || "");
  const [savingName, setSavingName] = useState(false);

  // day-edit form
  const sel = log.find((r) => r.date === selected);
  const [wore, setWore] = useState(false);
  const [fit, setFit] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => { setWore(sel?.wore || false); setFit(sel?.fit || ""); setNote(sel?.note || ""); }, [selected, log]);

  async function refresh() {
    if (!user) return;
    const from = new Date(cursor); from.setMonth(from.getMonth() - 1);
    const to = new Date(cursor); to.setMonth(to.getMonth() + 2);
    const rows = await getFitLog(user.id, from.toISOString().slice(0, 10), to.toISOString().slice(0, 10));
    setLog(rows);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user, cursor]);

  async function saveDay() {
    if (!user) return;
    await upsertFitDay(user.id, selected, { wore, fit: fit.trim(), note: note.trim() });
    await refresh();
  }
  async function saveName() {
    setSavingName(true);
    const updated = await upsertProfile(user.id, { display_name: name.trim() });
    onProfileChange?.(updated);
    setSavingName(false);
  }

  const streak = computeStreak(log);
  const woreCount = log.filter((r) => r.wore).length;

  // calendar grid
  const first = new Date(cursor);
  const startDay = first.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const wrap = { maxWidth: 760, margin: "0 auto", padding: "0 24px", fontFamily: font, color: WHITE };
  const up = { textTransform: "uppercase", letterSpacing: "0.18em" };
  const btn = { border: `1px solid ${LINE}`, background: "transparent", color: WHITE, fontFamily: font, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" };
  const fld = { width: "100%", background: "transparent", border: `1px solid ${LINE}`, color: WHITE, padding: 12, fontSize: 12, fontFamily: font, letterSpacing: "0.06em" };

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* header */}
      <div style={{ ...wrap, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${LINE}` }}>
        <span style={{ ...up, fontSize: 11 }}>Profile</span>
        <button style={{ ...btn, padding: "7px 12px", fontSize: 9 }} onClick={onClose}>← Back to today</button>
      </div>

      <div style={wrap}>
        {/* identity */}
        <section style={{ padding: "32px 0", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ ...up, fontSize: 10, color: GREY, marginBottom: 6 }}>Signed in as</div>
          <div style={{ fontSize: 14, color: GREY, marginBottom: 18, wordBreak: "break-all" }}>{user?.email}</div>
          <div style={{ ...up, fontSize: 10, color: GREY, marginBottom: 8 }}>Display name</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={fld} value={name} onChange={e => setName(e.target.value)} placeholder="WHAT THE STARS CALL YOU" />
            <button style={{ ...btn, padding: "0 16px", background: WHITE, color: BLACK }} disabled={savingName} onClick={saveName}>{savingName ? "…" : "Save"}</button>
          </div>
        </section>

        {/* stats */}
        <section style={{ padding: "28px 0", borderBottom: `1px solid ${LINE}`, display: "flex", gap: 32 }}>
          <div>
            <div style={{ ...up, fontSize: 10, color: ACCENT }}>Current streak</div>
            <div style={{ fontSize: 40, fontWeight: 300, marginTop: 4 }}>{streak}<span style={{ fontSize: 13, color: GREY, marginLeft: 8 }}>days</span></div>
          </div>
          <div>
            <div style={{ ...up, fontSize: 10, color: GREY }}>Fits logged</div>
            <div style={{ fontSize: 40, fontWeight: 300, marginTop: 4 }}>{woreCount}</div>
          </div>
        </section>

        {/* calendar */}
        <section style={{ padding: "28px 0", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <button style={{ ...btn, padding: "6px 12px", fontSize: 12 }} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button>
            <span style={{ ...up, fontSize: 12 }}>{monthName(cursor)}</span>
            <button style={{ ...btn, padding: "6px 12px", fontSize: 12 }} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
            {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} style={{ ...up, fontSize: 8, color: DIM, textAlign: "center", paddingBottom: 4 }}>{d}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const key = new Date(cursor.getFullYear(), cursor.getMonth(), d).toISOString().slice(0, 10);
              const row = log.find((r) => r.date === key);
              const isToday = key === todayKey();
              const isSel = key === selected;
              const future = key > todayKey();
              return (
                <button key={i} disabled={future} onClick={() => setSelected(key)}
                  style={{ aspectRatio: "1", border: `1px solid ${isSel ? WHITE : LINE}`, background: row?.wore ? ACCENT : (isSel ? "rgba(244,244,240,0.06)" : "transparent"), color: row?.wore ? BLACK : (future ? DIM : WHITE), fontFamily: font, fontSize: 12, cursor: future ? "default" : "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {d}
                  {isToday && <span style={{ position: "absolute", bottom: 3, width: 3, height: 3, borderRadius: "50%", background: row?.wore ? BLACK : ACCENT }} />}
                  {row?.note && !row?.wore && <span style={{ position: "absolute", top: 3, right: 3, width: 3, height: 3, borderRadius: "50%", background: GREY }} />}
                </button>
              );
            })}
          </div>
          <div style={{ ...up, fontSize: 8, color: DIM, marginTop: 12, display: "flex", gap: 16, justifyContent: "center" }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, background: ACCENT, marginRight: 5, verticalAlign: "middle" }} />Wore the fit</span>
            <span><span style={{ display: "inline-block", width: 3, height: 3, borderRadius: "50%", background: ACCENT, marginRight: 5, verticalAlign: "middle" }} />Today</span>
          </div>
        </section>

        {/* day editor */}
        <section style={{ padding: "28px 0" }}>
          <div style={{ ...up, fontSize: 10, color: GREY, marginBottom: 16 }}>
            {new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>

          <button onClick={() => setWore(!wore)} style={{ ...btn, ...up, width: "100%", padding: 14, fontSize: 11, background: wore ? ACCENT : "transparent", color: wore ? BLACK : WHITE, borderColor: wore ? ACCENT : LINE, marginBottom: 12 }}>
            {wore ? "✓ Wore the fit" : "Did you wear the fit?"}
          </button>

          <div style={{ ...up, fontSize: 9, color: GREY, marginBottom: 6 }}>Which fit</div>
          <input style={{ ...fld, marginBottom: 12 }} value={fit} onChange={e => setFit(e.target.value)} placeholder="E.G. BLACK OVERCOAT + BOOTS" />

          <div style={{ ...up, fontSize: 9, color: GREY, marginBottom: 6 }}>Notes</div>
          <textarea style={{ ...fld, minHeight: 70, resize: "vertical", marginBottom: 14 }} value={note} onChange={e => setNote(e.target.value)} placeholder="HOW IT LANDED. WHAT YOU'D CHANGE." />

          <button style={{ ...btn, ...up, width: "100%", padding: 13, fontSize: 11, background: WHITE, color: BLACK }} onClick={saveDay}>Save day</button>
        </section>

        <button style={{ ...btn, ...up, width: "100%", padding: 12, fontSize: 9, color: GREY, marginBottom: 20 }} onClick={signOut}>Sign out</button>
      </div>
    </div>
  );
}
