import React, { useState, useEffect, useRef } from "react";
import Auth from "./Auth.jsx";
import { supabase, supabaseReady, getSession, onAuthChange, getProfile, upsertProfile, getFitLog, upsertFitDay, computeStreak, signOut, shareDay, getFeed, getMyShare, searchUsers, getUserFeed, toggleLike, getLikes, addComment, getComments } from "./supabase.js";

const SIGNS = [
  { name: "Aries", symbol: "♈︎", dates: "Mar 21 – Apr 19", element: "Fire", vibe: "bold, structured, energetic" },
  { name: "Taurus", symbol: "♉︎", dates: "Apr 20 – May 20", element: "Earth", vibe: "tactile, luxe, grounded" },
  { name: "Gemini", symbol: "♊︎", dates: "May 21 – Jun 20", element: "Air", vibe: "playful, mixed prints, layered" },
  { name: "Cancer", symbol: "♋︎", dates: "Jun 21 – Jul 22", element: "Water", vibe: "soft, cozy, nostalgic" },
  { name: "Leo", symbol: "♌︎", dates: "Jul 23 – Aug 22", element: "Fire", vibe: "statement, golden, dramatic" },
  { name: "Virgo", symbol: "♍︎", dates: "Aug 23 – Sep 22", element: "Earth", vibe: "clean, tailored, minimal" },
  { name: "Libra", symbol: "♎︎", dates: "Sep 23 – Oct 22", element: "Air", vibe: "balanced, pastel, elegant" },
  { name: "Scorpio", symbol: "♏︎", dates: "Oct 23 – Nov 21", element: "Water", vibe: "moody, sleek, all-black" },
  { name: "Sagittarius", symbol: "♐︎", dates: "Nov 22 – Dec 21", element: "Fire", vibe: "eclectic, free-spirited" },
  { name: "Capricorn", symbol: "♑︎", dates: "Dec 22 – Jan 19", element: "Earth", vibe: "polished, classic, power-dressing" },
  { name: "Aquarius", symbol: "♒︎", dates: "Jan 20 – Feb 18", element: "Air", vibe: "futuristic, experimental, electric" },
  { name: "Pisces", symbol: "♓︎", dates: "Feb 19 – Mar 20", element: "Water", vibe: "dreamy, flowy, ethereal" },
];

const OUTFIT_THEMES = {
  Fire: ["bold red outfit", "statement blazer", "leather jacket look", "monochrome power look"],
  Earth: ["neutral tailored outfit", "earth tone capsule", "minimal beige outfit", "structured trench look"],
  Air: ["layered print outfit", "pastel street style", "eclectic mixed pattern", "light airy spring look"],
  Water: ["all black moody outfit", "flowy ethereal dress", "cozy knit outfit", "soft monochrome layers"],
};

const ZIP3 = {"100":[40.75,-73.99,"New York, NY"],"101":[40.75,-73.99,"New York, NY"],"102":[40.75,-73.99,"New York, NY"],"103":[40.58,-74.15,"Staten Island, NY"],"104":[40.84,-73.87,"Bronx, NY"],"110":[40.76,-73.83,"Queens, NY"],"112":[40.65,-73.95,"Brooklyn, NY"],"113":[40.72,-73.79,"Queens, NY"],"070":[40.73,-74.17,"Newark, NJ"],"080":[39.95,-75.12,"Camden, NJ"],"020":[42.36,-71.06,"Boston, MA"],"021":[42.36,-71.06,"Boston, MA"],"022":[42.36,-71.06,"Boston, MA"],"060":[41.76,-72.67,"Hartford, CT"],"061":[41.76,-72.67,"Hartford, CT"],"029":[41.82,-71.41,"Providence, RI"],"031":[42.99,-71.46,"Manchester, NH"],"041":[43.66,-70.26,"Portland, ME"],"054":[44.48,-73.21,"Burlington, VT"],"150":[40.44,-79.99,"Pittsburgh, PA"],"151":[40.44,-79.99,"Pittsburgh, PA"],"190":[39.95,-75.16,"Philadelphia, PA"],"191":[39.95,-75.16,"Philadelphia, PA"],"200":[38.9,-77.04,"Washington, DC"],"210":[39.29,-76.61,"Baltimore, MD"],"212":[39.29,-76.61,"Baltimore, MD"],"230":[37.54,-77.44,"Richmond, VA"],"232":[37.54,-77.44,"Richmond, VA"],"222":[38.88,-77.1,"Arlington, VA"],"272":[35.99,-78.9,"Durham, NC"],"282":[35.23,-80.84,"Charlotte, NC"],"276":[35.78,-78.64,"Raleigh, NC"],"294":[32.78,-79.93,"Charleston, SC"],"292":[34.0,-81.03,"Columbia, SC"],"303":[33.75,-84.39,"Atlanta, GA"],"300":[33.75,-84.39,"Atlanta, GA"],"320":[30.33,-81.66,"Jacksonville, FL"],"331":[25.76,-80.19,"Miami, FL"],"330":[25.76,-80.19,"Miami, FL"],"328":[28.54,-81.38,"Orlando, FL"],"336":[27.95,-82.46,"Tampa, FL"],"352":[33.52,-86.81,"Birmingham, AL"],"372":[36.16,-86.78,"Nashville, TN"],"381":[35.15,-90.05,"Memphis, TN"],"402":[38.25,-85.76,"Louisville, KY"],"700":[29.95,-90.07,"New Orleans, LA"],"708":[30.45,-91.15,"Baton Rouge, LA"],"392":[32.3,-90.18,"Jackson, MS"],"722":[34.75,-92.29,"Little Rock, AR"],"606":[41.88,-87.63,"Chicago, IL"],"600":[41.88,-87.63,"Chicago, IL"],"601":[41.88,-87.63,"Chicago, IL"],"462":[39.77,-86.16,"Indianapolis, IN"],"432":[39.96,-82.99,"Columbus, OH"],"441":[41.5,-81.69,"Cleveland, OH"],"452":[39.1,-84.51,"Cincinnati, OH"],"480":[42.33,-83.05,"Detroit, MI"],"482":[42.33,-83.05,"Detroit, MI"],"532":[43.04,-87.91,"Milwaukee, WI"],"554":[44.98,-93.27,"Minneapolis, MN"],"551":[44.95,-93.09,"St Paul, MN"],"631":[38.63,-90.2,"St Louis, MO"],"641":[39.1,-94.58,"Kansas City, MO"],"681":[41.26,-95.93,"Omaha, NE"],"503":[41.59,-93.62,"Des Moines, IA"],"660":[39.05,-95.69,"Topeka, KS"],"581":[46.81,-100.78,"Bismarck, ND"],"571":[43.55,-96.7,"Sioux Falls, SD"],"750":[32.78,-96.8,"Dallas, TX"],"752":[32.78,-96.8,"Dallas, TX"],"770":[29.76,-95.37,"Houston, TX"],"773":[29.76,-95.37,"Houston, TX"],"787":[30.27,-97.74,"Austin, TX"],"782":[29.42,-98.49,"San Antonio, TX"],"799":[31.76,-106.49,"El Paso, TX"],"731":[35.47,-97.52,"Oklahoma City, OK"],"741":[36.15,-95.99,"Tulsa, OK"],"850":[33.45,-112.07,"Phoenix, AZ"],"852":[33.45,-112.07,"Phoenix, AZ"],"857":[32.22,-110.97,"Tucson, AZ"],"870":[35.08,-106.65,"Albuquerque, NM"],"802":[39.74,-104.99,"Denver, CO"],"800":[39.74,-104.99,"Denver, CO"],"841":[40.76,-111.89,"Salt Lake City, UT"],"891":[36.17,-115.14,"Las Vegas, NV"],"595":[45.78,-108.5,"Billings, MT"],"832":[43.62,-116.21,"Boise, ID"],"829":[41.14,-104.82,"Cheyenne, WY"],"900":[34.05,-118.24,"Los Angeles, CA"],"902":[34.05,-118.24,"Los Angeles, CA"],"906":[33.77,-118.19,"Long Beach, CA"],"921":[32.72,-117.16,"San Diego, CA"],"941":[37.77,-122.42,"San Francisco, CA"],"945":[37.8,-122.27,"Oakland, CA"],"950":[37.34,-121.89,"San Jose, CA"],"958":[38.58,-121.49,"Sacramento, CA"],"907":[34.42,-119.7,"Santa Barbara, CA"],"956":[38.58,-121.49,"Sacramento, CA"],"972":[45.52,-122.68,"Portland, OR"],"973":[45.52,-122.68,"Portland, OR"],"981":[47.61,-122.33,"Seattle, WA"],"980":[47.61,-122.33,"Seattle, WA"],"995":[61.22,-149.9,"Anchorage, AK"],"968":[21.31,-157.86,"Honolulu, HI"]};
const ZIPREGION = {"0":[42.36,-71.06,"New England"],"1":[40.75,-73.99,"New York region"],"2":[38.9,-77.04,"Mid-Atlantic"],"3":[33.75,-84.39,"Southeast"],"4":[39.96,-82.99,"Great Lakes"],"5":[44.98,-93.27,"Upper Midwest"],"6":[41.88,-87.63,"Central US"],"7":[32.78,-96.8,"South Central"],"8":[39.74,-104.99,"Mountain West"],"9":[37.77,-122.42,"West Coast"]};
const WCODE = {0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Fog",51:"Light drizzle",53:"Drizzle",55:"Drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",66:"Freezing rain",67:"Freezing rain",71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow grains",80:"Showers",81:"Showers",82:"Heavy showers",85:"Snow showers",86:"Snow showers",95:"Thunderstorm",96:"Thunderstorm",99:"Thunderstorm"};

const BLACK = "#080808";
const PANEL = "#0F0F10";
const WHITE = "#F4F4F0";
const GREY = "#7A7A78";
const DIM = "#4A4A48";
const LINE = "rgba(244,244,240,0.14)";
const ACCENT = "#C9F24D"; // single restrained acid accent — used only for "today" markers

const todayKey = () => new Date().toISOString().slice(0, 10);
const fontStack = "'IBM Plex Mono', ui-monospace, monospace";

// storage helpers (artifact persistence; degrade gracefully if unavailable)
async function sGet(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } }
async function sSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
async function sList(prefix) { try { return Object.keys(localStorage).filter(k => k.startsWith(prefix)); } catch { return []; } }

export default function CosmicCloset() {
  const [onboarded, setOnboarded] = useState(false);
  const [step, setStep] = useState(0);
  const [sex, setSex] = useState("");
  const [zip, setZip] = useState("");
  const [age, setAge] = useState("");

  const [sign, setSign] = useState(null);
  const [signListOpen, setSignListOpen] = useState(true);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherErr, setWeatherErr] = useState("");
  const [history, setHistory] = useState([]);   // [{date, sign, reading}]
  const [viewingDate, setViewingDate] = useState(todayKey());
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [view, setView] = useState("today");        // "today" | "friends" | "profile"
  const [showCard, setShowCard] = useState(false);
  const [avatarPrefs, setAvatarPrefs] = useState({ skin: "#E6C39A", hair: "", hairColor: "", glasses: "none", scene: "void", accessory: "none", budget: "$$" });
  const [facing, setFacing] = useState("front");
  const [spinning, setSpinning] = useState(false);
  const [custOpen, setCustOpen] = useState(false);
  const [custTab, setCustTab] = useState("look");
  const [hoverItem, setHoverItem] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [fitLog, setFitLog] = useState({});           // { "YYYY-MM-DD": {wore, fit, note} }
  const [calCursor, setCalCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selDay, setSelDay] = useState(todayKey());

  // ---- Auth state ----
  const [user, setUser] = useState(null);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [cloudProfile, setCloudProfile] = useState(null);
  const [cloudFitLog, setCloudFitLog] = useState([]);
  const [migrationOffer, setMigrationOffer] = useState(false);

  useEffect(() => {
    if (!supabaseReady) return;
    getSession().then(s => { if (s?.user) handleLogin(s.user); });
    return onAuthChange(session => {
      if (session?.user) handleLogin(session.user);
      else { setUser(null); setCloudProfile(null); setCloudFitLog([]); }
    });
  }, []);

  async function handleLogin(u) {
    setUser(u);
    setAuthPrompt(false);
    const p = await getProfile(u.id);
    setCloudProfile(p);
    const log = await getFitLog(u.id);
    setCloudFitLog(log);
    const localFitLog = await sGet("fitLog");
    const localProfile = await sGet("profile");
    const hasLocalData = (localFitLog && Object.keys(localFitLog).length > 0) || (localProfile && (localProfile.sex || localProfile.zip || localProfile.age));
    if (hasLocalData && log.length === 0 && !p?.sign) setMigrationOffer(true);
  }

  async function migrateLocalToCloud() {
    if (!user) return;
    const localProfile = await sGet("profile");
    const localName = await sGet("displayName");
    if (localProfile) {
      await upsertProfile(user.id, { sign: sign?.name || localProfile.sign, sex: localProfile.sex, zip: localProfile.zip, age: localProfile.age, display_name: localName || "" });
      setCloudProfile(await getProfile(user.id));
    }
    const localFitLog = await sGet("fitLog");
    if (localFitLog) {
      for (const [date, entry] of Object.entries(localFitLog)) {
        await upsertFitDay(user.id, date, { wore: entry.wore || false, fit: entry.fit || "", note: entry.note || "", avatar: entry.avatar || null, prefs: entry.prefsSnap || null });
      }
      setCloudFitLog(await getFitLog(user.id));
    }
    setMigrationOffer(false);
  }

  function getEffectiveFitLog() {
    if (user && cloudFitLog.length > 0) {
      const obj = {};
      for (const row of cloudFitLog) obj[row.date] = row;
      return obj;
    }
    return fitLog;
  }

  function getEffectiveStreak() {
    if (user && cloudFitLog.length > 0) return computeStreak(cloudFitLog);
    return fitStreak();
  }

  const dateObj = new Date(viewingDate + "T12:00:00");
  const isToday = viewingDate === todayKey();
  const dateLabel = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();

  // Load saved profile once
  useEffect(() => {
    (async () => {
      const p = await sGet("profile");
      if (p) { setSex(p.sex || ""); setZip(p.zip || ""); setAge(p.age || ""); if (p.sex || p.zip || p.age) setOnboarded(true); if (p.zip) loadWeather(p.zip); }
      const nm = await sGet("displayName"); if (nm) setDisplayName(nm);
      const ap = await sGet("avatarPrefs"); if (ap) setAvatarPrefs(prev => ({ ...prev, ...ap }));
      const fl = await sGet("fitLog"); if (fl) setFitLog(fl);
      setProfileLoaded(true);
      // Remember the sign: auto-load today's reading on open.
      const savedSign = await sGet("mySign");
      if (savedSign) {
        const s = SIGNS.find(x => x.name === savedSign);
        if (s) { setSignListOpen(false); pick(s); }
      }
    })();
  }, []);

  async function saveFitDay(date, fields) {
    if (user) {
      await upsertFitDay(user.id, date, fields);
      setCloudFitLog(await getFitLog(user.id));
    } else {
      setFitLog(prev => { const next = { ...prev, [date]: { ...prev[date], ...fields } }; sSet("fitLog", next); return next; });
    }
  }
  function fitStreak() {
    let streak = 0; const d = new Date();
    for (let i = 0; i < 400; i++) {
      const key = new Date(d.getTime() - i * 86400000).toISOString().slice(0, 10);
      if (fitLog[key]?.wore) streak++;
      else if (i === 0) continue;
      else break;
    }
    return streak;
  }

  useEffect(() => { if (profileLoaded) sSet("profile", { sex, zip, age }); }, [sex, zip, age, profileLoaded]);

  function resolveLocation(raw) {
    const t = (raw || "").trim();
    if (/^\d{5}$/.test(t)) { const hit = ZIP3[t.slice(0, 3)] || ZIPREGION[t[0]]; if (hit) return { lat: hit[0], lon: hit[1], label: hit[2] }; }
    return null;
  }
  async function fetchWeatherFor(lat, lon, label) {
    const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=3&timezone=auto&temperature_unit=fahrenheit`)).json();
    const days = (w.daily?.time || []).map((t, i) => ({
      name: i === 0 ? "Today" : new Date(t + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }),
      hi: Math.round(w.daily.temperature_2m_max[i]),
      lo: Math.round(w.daily.temperature_2m_min[i]),
      label: WCODE[w.daily.weather_code[i]] || "—",
    }));
    return { tempF: Math.round(w.current.temperature_2m), label: WCODE[w.current.weather_code] || "—", place: label, days };
  }
  async function loadWeather(raw) {
    setWeatherErr("");
    const loc = resolveLocation(raw);
    try {
      if (loc) { setWeather(await fetchWeatherFor(loc.lat, loc.lon, loc.label)); return; }
      const g = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(raw.trim())}&count=1&language=en&format=json`)).json();
      const hit = g.results && g.results[0];
      if (!hit) { setWeatherErr(`No match for "${raw}". Try a city or US ZIP.`); return; }
      setWeather(await fetchWeatherFor(hit.latitude, hit.longitude, [hit.name, hit.admin1].filter(Boolean).join(", ")));
    } catch {
      setWeatherErr("Weather lookup failed — you can still continue.");
      // Preview sandbox blocks external APIs; show clearly-marked demo data so
      // the layout/icons are visible. The deployed site fetches real weather.
      const loc2 = resolveLocation(raw);
      const dayName = (i) => i === 0 ? "Today" : new Date(Date.now() + i * 86400000).toLocaleDateString("en-US", { weekday: "short" });
      setWeather({
        place: (loc2 && loc2.label) || raw, tempF: 72, label: "Clear", demo: true,
        days: [
          { name: dayName(0), hi: 74, lo: 58, label: "Clear" },
          { name: dayName(1), hi: 69, lo: 55, label: "Rain showers" },
          { name: dayName(2), hi: 71, lo: 57, label: "Partly cloudy" },
        ],
      });
    }
  }

  // ---- 30s track previews (iTunes Search API; free, no key) ----
  const audioRef = React.useRef(null);
  const previewCache = React.useRef({});
  const [playingTrack, setPlayingTrack] = useState(null);
  const [previewState, setPreviewState] = useState({});

  useEffect(() => () => { audioRef.current?.pause(); }, []); // cleanup on unmount
  useEffect(() => { audioRef.current?.pause(); audioRef.current = null; setPlayingTrack(null); }, [reading]); // stop when reading changes

  async function togglePreview(song, i) {
    if (playingTrack === i) { audioRef.current?.pause(); audioRef.current = null; setPlayingTrack(null); return; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingTrack(null);
    setPreviewState(p => ({ ...p, [i]: "loading" }));
    try {
      let url = previewCache.current[song];
      if (!url) {
        const q = String(song).replace(/—|–/g, " ").trim();
        const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=1`);
        const d = await r.json();
        url = d.results?.[0]?.previewUrl;
        if (url) previewCache.current[song] = url;
      }
      if (!url) throw new Error("no preview");
      const a = new Audio(url);
      a.volume = 0.9;
      a.onended = () => setPlayingTrack(cur => (cur === i ? null : cur));
      await a.play();
      audioRef.current = a;
      setPlayingTrack(i);
      setPreviewState(p => ({ ...p, [i]: undefined }));
    } catch {
      setPreviewState(p => ({ ...p, [i]: "error" }));
      setTimeout(() => setPreviewState(p => ({ ...p, [i]: undefined })), 2200);
    }
  }

  function setAvatarPref(k, v) {
    setAvatarPrefs(p => { const n = { ...p, [k]: v }; sSet("avatarPrefs", n); return n; });
  }
  useEffect(() => {
    if (!spinning) return;
    const order = ["front", "right", "back", "left"];
    const t = setInterval(() => setFacing(f => order[(order.indexOf(f) + 1) % 4]), 420);
    return () => clearInterval(t);
  }, [spinning]);

  // ---- 8-bit fit-check avatar ----
  // Front-view sprite as a raw SVG string (for the share card). Mirrors PixelAvatar's
  // front branch: outlines, two-tone shading, face, chest graphic/monogram. No scene/anim.
  function avatarFrontMarkup(a, prefs = {}, sex = "", age = null) {
    const SKIN = prefs.skin || "#E6C39A";
    const HAIR = prefs.hairColor || (age && age >= 60 ? "#8A8A88" : "#2E2620");
    const hairStyle = prefs.hair || (sex === "Female" ? "bob" : "short");
    const glasses = prefs.glasses || "none";
    const gfx = prefs.graphic || "none";
    const INK = "#141414", OUT = "#221814";
    const shade = (hex, f = 0.72) => { const n = parseInt(hex.slice(1), 16); const r = Math.min(255, Math.round(((n >> 16) & 255) * f)), g = Math.min(255, Math.round(((n >> 8) & 255) * f)), b = Math.min(255, Math.round((n & 255) * f)); return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`; };
    const SKIN2 = shade(SKIN, 0.8), SKINH = shade(SKIN, 1.1), BELT = "#15151A";
    const GT = ["tee", "tank", "hoodie", "sweater", "shirt"];
    const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
    const C = lum(a.topColor) > 0.45 ? "#1A1A1A" : "#EDEDE8";
    const tC = a.topColor, bC = a.bottomColor, sC = a.shoesColor;
    const tB = shade(tC, 1.2), tS = shade(tC, 0.74), bS = shade(bC, 0.74);
    const o = [], f = [], d = [];
    const O = (x, y, w, h) => o.push(`<rect x="${x - 0.38}" y="${y - 0.38}" width="${w + 0.76}" height="${h + 0.76}" fill="${OUT}"/>`);
    const F = (x, y, w, h, c) => f.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
    const B = (x, y, w, h, c) => { O(x, y, w, h); F(x, y, w, h, c); };
    const P = (x, y, w, h, c) => d.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
    const legBot = a.bottom === "shorts" ? 25 : a.bottom === "skirt" ? 26 : 30;
    const shoeTop = a.shoes === "boots" ? 28.6 : 30;
    const torsoBot = a.top === "coat" ? 24.6 : 21;
    const sleeve = a.top === "tank" ? 0 : a.top === "tee" ? 4 : 8;
    const hasBelt = ["trousers", "jeans", "cargo", "shorts"].includes(a.bottom);
    B(11, 21, 6, 3, bC);
    if (a.bottom === "skirt") { B(10, 23, 8, 4, bC); P(10, 26.3, 8, 0.7, bS); B(11, 27, 2, 3, SKIN); B(15, 27, 2, 3, SKIN); }
    else {
      B(11, 24, 2.6, legBot - 24, bC); B(14.4, 24, 2.6, legBot - 24, bC);
      P(12.8, 24, 0.8, legBot - 24, bS); P(16.2, 24, 0.8, legBot - 24, bS);
      if (a.bottom === "shorts") { B(11, 25, 2.6, 5, SKIN); B(14.4, 25, 2.6, 5, SKIN); }
      if (a.bottom === "cargo") { P(10.7, 25.5, 1, 2, bS); P(16.3, 25.5, 1, 2, bS); }
      if (a.bottom === "jeans") { P(11.3, 22.2, 1.2, 0.5, bS); P(15.5, 22.2, 1.2, 0.5, bS); }
    }
    if (hasBelt) { P(11, 21, 6, 0.7, BELT); P(13.6, 21.05, 0.8, 0.6, "#A8A8A0"); }
    B(10.4, shoeTop, 3.2, 32 - shoeTop, sC); B(14.4, shoeTop, 3.2, 32 - shoeTop, sC);
    if (a.shoes === "sneakers") { P(10.4, 31.2, 3.2, 0.8, "#F4F4F0"); P(14.4, 31.2, 3.2, 0.8, "#F4F4F0"); }
    if (a.shoes === "boots") { P(10.4, 29.4, 3.2, 0.6, shade(sC, 1.9)); P(14.4, 29.4, 3.2, 0.6, shade(sC, 1.9)); }
    if (a.shoes === "loafers") { P(10.8, 30.4, 2.4, 0.5, shade(sC, 1.8)); P(14.8, 30.4, 2.4, 0.5, shade(sC, 1.8)); }
    [8.2, 18].forEach((ax) => { B(ax, 12, 1.8, 8, SKIN); if (sleeve) { P(ax, 12, 1.8, sleeve, tC); P(ax + 1, 12, 0.8, sleeve, tS); } if (a.top === "sweater" && sleeve === 8) P(ax, 19, 1.8, 1, tS); P(ax, 19.4, 1.8, 0.6, SKIN2); });
    if (a.top === "coat") { B(9.3, 12, 9.4, 12.6, tC); P(9.3, 12, 0.9, 12.6, tB); P(17.8, 12, 0.9, 12.6, tS); P(13.7, 13, 0.6, 11, tS); P(12.8, 15, 0.6, 0.6, "#D8D4C8"); P(12.8, 17.2, 0.6, 0.6, "#D8D4C8"); P(12.8, 19.4, 0.6, 0.6, "#D8D4C8"); }
    else { B(10, 12, 8, torsoBot - 12, tC); P(10, 12, 0.9, torsoBot - 12, tB); P(17.1, 12, 0.9, torsoBot - 12, tS); }
    if (a.top === "blazer") { P(12.4, 12, 1, 3.4, tS); P(14.6, 12, 1, 3.4, tS); P(13.4, 12, 1.2, 2.4, "#EDEDE8"); P(13.7, 16, 0.6, 0.6, "#EDEDE8"); P(13.7, 18, 0.6, 0.6, "#EDEDE8"); P(11.3, 13.6, 0.9, 0.6, "#EDEDE8"); }
    if (a.top === "hoodie") { B(9.2, 10.5, 1.4, 2.5, tC); B(17.4, 10.5, 1.4, 2.5, tC); P(12, 17.4, 4, 2.4, tS); P(12.6, 12.6, 0.5, 1.6, "#EDEDE8"); P(14.9, 12.6, 0.5, 1.6, "#EDEDE8"); }
    if (a.top === "sweater") { P(10, 20, 8, 1, tS); P(10, 15.4, 8, 0.45, shade(tC, 0.85)); P(10, 17.4, 8, 0.45, shade(tC, 0.85)); }
    if (a.top === "shirt") { P(12, 12, 1.4, 1, "#EDEDE8"); P(14.6, 12, 1.4, 1, "#EDEDE8"); P(13.7, 13, 0.6, 8, shade(tC, 0.82)); }
    if (a.top === "tee") P(12.5, 14.2, 1.4, 1.4, shade(tC, 0.8));
    if (GT.includes(a.top) && gfx !== "none") {
      if (gfx === "cross") { P(13.55, 13.1, 0.9, 3.4, C); P(12.35, 14.0, 3.3, 0.9, C); }
      if (gfx === "star") { P(13.55, 13.2, 0.9, 3.0, C); P(12.5, 14.25, 3.0, 0.9, C); P(13.1, 13.75, 1.8, 1.9, C); }
      if (gfx === "crest") { P(12.85, 13.1, 2.5, 2.3, C); P(13.35, 15.4, 1.5, 0.7, C); P(13.75, 16.1, 0.7, 0.5, C); P(13.05, 13.8, 2.1, 0.45, tC); }
      if (gfx === "stripe") { P(10, 14.0, 8, 1.0, C); P(10, 16.1, 8, 1.0, C); if (sleeve === 8) { P(8.2, 14.0, 1.8, 1.0, C); P(18, 14.0, 1.8, 1.0, C); P(8.2, 16.1, 1.8, 1.0, C); P(18, 16.1, 1.8, 1.0, C); } }
    }
    F(13, 11, 2, 1, SKIN); B(10, 4, 8, 7, SKIN); P(10, 4, 0.8, 7, SKINH); P(17.2, 4, 0.8, 7, SKIN2);
    if (hairStyle === "short") { B(9.3, 3, 9.4, 2.4, HAIR); B(9.3, 5.4, 1, 3.4, HAIR); B(17.7, 5.4, 1, 3.4, HAIR); P(9.3, 4.8, 9.4, 0.6, shade(HAIR, 0.7)); }
    if (hairStyle === "buzz") B(9.7, 3.4, 8.6, 1.3, HAIR);
    if (hairStyle === "bob") { B(9.3, 3, 9.4, 2.4, HAIR); B(9.1, 5.4, 1.3, 4.8, HAIR); B(17.6, 5.4, 1.3, 4.8, HAIR); P(9.3, 4.8, 9.4, 0.6, shade(HAIR, 0.7)); }
    if (hairStyle === "long") { B(9.3, 3, 9.4, 2.4, HAIR); B(8.9, 5.4, 1.5, 8.8, HAIR); B(17.6, 5.4, 1.5, 8.8, HAIR); P(9.3, 4.8, 9.4, 0.6, shade(HAIR, 0.7)); }
    if (hairStyle === "curly") { B(9.3, 2.5, 9.4, 3, HAIR); B(8.9, 3.2, 0.9, 1.8, HAIR); B(18.2, 3.2, 0.9, 1.8, HAIR); B(10.6, 1.8, 1.7, 1, HAIR); B(13.2, 1.6, 1.7, 1.1, HAIR); B(15.8, 1.8, 1.7, 1, HAIR); B(9.0, 5.4, 1.2, 3.8, HAIR); B(17.8, 5.4, 1.2, 3.8, HAIR); }
    if (hairStyle === "pony") { B(9.3, 3, 9.4, 2.2, HAIR); B(9.3, 5.2, 1, 2.4, HAIR); B(17.7, 5.2, 1, 2.4, HAIR); B(12.8, 1.8, 2.4, 1.3, HAIR); }
    if (hairStyle === "afro") { B(8.4, 1.4, 11.2, 4.4, HAIR); B(8.0, 3.0, 1.6, 4.4, HAIR); B(18.4, 3.0, 1.6, 4.4, HAIR); P(9.0, 1.9, 10, 0.7, shade(HAIR, 1.25)); }
    if (hairStyle === "mohawk") { B(12.8, 0.8, 2.4, 4.6, HAIR); B(9.4, 4.2, 9.2, 1.3, shade(HAIR, 0.85)); P(13.0, 1.0, 2.0, 0.7, shade(HAIR, 1.3)); }
    if (hairStyle === "manbun") { B(9.3, 3, 9.4, 2.4, HAIR); B(9.3, 5.4, 1, 2.6, HAIR); B(17.7, 5.4, 1, 2.6, HAIR); B(12.9, 1.2, 2.2, 1.8, HAIR); P(13.1, 1.5, 1.8, 0.6, shade(HAIR, 1.25)); P(9.3, 4.8, 9.4, 0.6, shade(HAIR, 0.7)); }
    if (hairStyle === "waves") { B(9.3, 3, 9.4, 2.6, HAIR); B(9.3, 5.6, 1, 3.2, HAIR); B(17.7, 5.6, 1, 3.2, HAIR); P(9.6, 3.4, 1.8, 0.5, shade(HAIR, 1.3)); P(12.0, 3.0, 1.8, 0.5, shade(HAIR, 1.3)); P(14.4, 3.4, 1.8, 0.5, shade(HAIR, 1.3)); P(16.6, 3.0, 1.6, 0.5, shade(HAIR, 1.3)); }
    if (a.hat === "cap") { B(9.6, 1.7, 8.8, 2.7, a.hatColor); P(9.6, 1.7, 8.8, 0.8, shade(a.hatColor, 1.25)); B(8, 4.0, 12, 0.8, a.hatColor); }
    if (a.hat === "trucker") { B(9.6, 1.7, 8.8, 2.7, shade(a.hatColor, 1.18)); P(9.6, 1.7, 8.8, 1.0, a.hatColor); B(8, 4.0, 12, 0.8, a.hatColor); P(10.4, 2.6, 7.2, 1.4, shade(a.hatColor, 1.35)); }
    if (a.hat === "cowboy") { B(7.0, 4.1, 14, 1.0, a.hatColor); P(7.0, 4.1, 14, 0.4, shade(a.hatColor, 1.25)); B(9.8, 0.8, 8.4, 3.5, a.hatColor); P(13.4, 0.8, 1.0, 3.5, shade(a.hatColor, 0.78)); P(9.8, 3.3, 8.4, 0.8, shade(a.hatColor, 0.82)); }
    if (a.hat === "durag") { B(9.3, 2.6, 9.4, 2.8, a.hatColor); P(9.3, 2.6, 9.4, 0.7, shade(a.hatColor, 1.2)); P(10.4, 3.4, 7.2, 0.6, shade(a.hatColor, 0.8)); B(17.6, 4.8, 1.6, 6.0, a.hatColor); B(18.9, 4.8, 1.4, 4.6, a.hatColor); P(17.6, 4.8, 1.6, 0.7, shade(a.hatColor, 1.2)); }
    if (a.hat === "beanie") { B(9.3, 1.6, 9.4, 4, a.hatColor); P(9.3, 4.8, 9.4, 1.0, shade(a.hatColor)); P(9.3, 1.6, 9.4, 0.8, shade(a.hatColor, 1.25)); }
    if (a.hat === "skully") { B(9.5, 2.7, 9.0, 3.0, a.hatColor); P(9.5, 5.0, 9.0, 0.7, shade(a.hatColor, 0.8)); P(9.5, 2.7, 9.0, 0.7, shade(a.hatColor, 1.2)); }
    P(11.8, 6.45, 1.35, 0.45, shade(HAIR, 0.85)); P(14.85, 6.45, 1.35, 0.45, shade(HAIR, 0.85));
    P(13.2, 9.55, 1.6, 0.5, SKIN2);
    // eyes
    P(11.9, 7.1, 1.15, 1.7, INK); P(14.95, 7.1, 1.15, 1.7, INK); P(12.0, 7.3, 0.45, 0.55, "#FFFFFF"); P(15.05, 7.3, 0.45, 0.55, "#FFFFFF");
    if (sex === "Female") { P(11.45, 6.95, 0.5, 0.45, INK); P(16.05, 6.95, 0.5, 0.45, INK); }
    if (glasses !== "none") {
      if (glasses === "regular") {
        // thin clear-lens frames
        d.push(`<rect x="11.3" y="6.95" width="2.2" height="1.9" fill="none" stroke="#1C1C1C" stroke-width="0.32"/>`);
        d.push(`<rect x="14.5" y="6.95" width="2.2" height="1.9" fill="none" stroke="#1C1C1C" stroke-width="0.32"/>`);
        P(13.5, 7.55, 1.0, 0.4, "#1C1C1C"); P(9.9, 7.5, 1.4, 0.4, "#1C1C1C"); P(16.7, 7.5, 1.4, 0.4, "#1C1C1C");
        P(11.7, 7.2, 0.5, 0.5, "#C8DCEC"); P(14.9, 7.2, 0.5, 0.5, "#C8DCEC");
      } else {
        const gf = glasses === "round" ? "#23262B" : "#1C1C1C"; const gw = glasses === "round" ? 1.95 : 2.3, gh = glasses === "round" ? 1.95 : 2.05;
        d.push(`<rect x="${glasses === "round" ? 11.45 : 11.25}" y="6.95" width="${gw}" height="${gh}" fill="${gf}" opacity="0.86"/>`);
        d.push(`<rect x="${glasses === "round" ? 14.65 : 14.55}" y="6.95" width="${gw}" height="${gh}" fill="${gf}" opacity="0.86"/>`);
        P(13.45, 7.6, 1.15, 0.45, INK); P(9.9, 7.55, 1.4, 0.45, INK); P(16.75, 7.55, 1.4, 0.45, INK); P(11.75, 7.2, 0.55, 0.55, "#9FB6C9"); P(14.95, 7.2, 0.55, 0.55, "#9FB6C9");
      }
    }
    let mono = "";
    if (gfx === "monogram" && GT.includes(a.top)) {
      mono = `<rect x="14.7" y="12.7" width="2.7" height="2.2" fill="${C}"/><text x="16.05" y="14.4" font-size="1.65" font-family="'Courier New', monospace" font-weight="bold" fill="${tC}" text-anchor="middle">${(prefs.initials || "CC").slice(0, 2).toUpperCase()}</text>`;
    }
    // accessories (front view)
    const acc = prefs.accessory || "none";
    if (acc === "bag") { P(10.6, 12.4, 7.2, 0.7, "#2A201A"); B(18.6, 17.5, 3.8, 4.0, "#6B4A32"); P(18.6, 17.5, 3.8, 0.8, shade("#6B4A32", 1.3)); P(20.0, 18.6, 1.0, 0.9, "#E0B84E"); P(18.6, 19.6, 3.8, 0.45, shade("#6B4A32", 0.7)); }
    if (acc === "tote") { P(18.4, 12.6, 0.6, 5.2, "#B8AD90"); P(21.2, 12.6, 0.6, 5.2, "#B8AD90"); B(18.0, 17.4, 4.0, 4.6, "#E0D6BA"); P(18.0, 17.4, 4.0, 0.6, shade("#E0D6BA", 0.8)); P(19.2, 19.0, 1.6, 1.6, shade("#E0D6BA", 0.78)); }
    if (acc === "laptop") { B(11.4, 19.0, 5.2, 3.4, "#A8B0B8"); P(11.8, 19.4, 4.4, 2.6, "#3A4450"); P(12.1, 19.7, 3.8, 2.0, "#7FB8D8"); P(11.4, 22.0, 5.2, 0.6, shade("#A8B0B8", 0.7)); P(13.7, 18.6, 0.6, 0.5, "#C9F24D"); }
    if (acc === "luggage") { const AL = "#C2C8CE", ALd = shade(AL, 0.80), ALl = shade(AL, 1.12), lx = 21.0, ly = 21.4, lw = 5.0, lh = 9.4; B(lx, ly, lw, lh, AL); for (let gy = 0; gy < 7; gy++) P(lx, ly + 0.8 + gy * 1.2, lw, 0.45, ALd); P(lx, ly, 0.7, lh, ALl); P(lx + 1.0, ly - 1.4, lw - 2.0, 1.6, "#2A2A2A"); P(lx + 1.6, ly - 1.4, 0.6, 1.6, "#1A1A1A"); P(lx + 2.8, ly - 1.4, 0.6, 1.6, "#1A1A1A"); P(lx + 0.4, ly + lh, 1.1, 0.7, "#141414"); P(lx + lw - 1.5, ly + lh, 1.1, 0.7, "#141414"); }
    if (acc === "headphones") { P(11.4, 11.0, 5.2, 0.8, "#1A1A1A"); B(10.8, 11.2, 1.6, 1.8, "#2A2A2A"); B(15.6, 11.2, 1.6, 1.8, "#2A2A2A"); P(11.0, 11.5, 1.1, 1.2, "#4A4A4A"); P(15.8, 11.5, 1.1, 1.2, "#4A4A4A"); }
    // sex silhouette (match PixelAvatar): female waist taper + hip flare, male shoulders
    let sil = "";
    if (sex === "Female") {
      const tcS = shade(tC, 0.74);
      sil = `<rect x="10.0" y="16.0" width="1.0" height="4.0" fill="${tcS}"/><rect x="17.0" y="16.0" width="1.0" height="4.0" fill="${tcS}"/>`
        + `<rect x="9.4" y="20.6" width="1.3" height="2.6" fill="${bC}"/><rect x="17.3" y="20.6" width="1.3" height="2.6" fill="${bC}"/>`
        + `<rect x="9.02" y="20.22" width="0.38" height="3.36" fill="${OUT}"/><rect x="18.6" y="20.22" width="0.38" height="3.36" fill="${OUT}"/>`
        + `<rect x="9.4" y="23.2" width="1.3" height="0.38" fill="${OUT}"/><rect x="17.3" y="23.2" width="1.3" height="0.38" fill="${OUT}"/>`;
    } else if (sex === "Male") {
      sil = `<rect x="8.7" y="11.8" width="1.4" height="2.2" fill="${tC}"/><rect x="17.9" y="11.8" width="1.4" height="2.2" fill="${tC}"/>`
        + `<rect x="8.32" y="11.42" width="0.38" height="2.96" fill="${OUT}"/><rect x="19.3" y="11.42" width="0.38" height="2.96" fill="${OUT}"/>`;
    }
    const maleSil = sex === "Male" ? sil : "";
    const femaleSil = sex === "Female" ? sil : "";
    return maleSil + o.join("") + f.join("") + d.join("") + mono + femaleSil;
  }

  function deriveAvatar(r, s) {
    const okHex = (c) => /^#?[0-9a-fA-F]{6}$/.test(c || "") ? (c.startsWith("#") ? c : "#" + c) : null;
    const pick = (v, set, d) => set.includes(v) ? v : d;
    const a = r?.avatar || {};
    const byElement = {
      Fire:  { top: "tee", topColor: "#B6452C", bottom: "cargo", bottomColor: "#2A2A28", shoes: "boots", shoesColor: "#1C1C1C" },
      Earth: { top: "sweater", topColor: "#6B6B52", bottom: "trousers", bottomColor: "#3A352C", shoes: "boots", shoesColor: "#2E241C" },
      Air:   { top: "shirt", topColor: "#C9CDD4", bottom: "trousers", bottomColor: "#4A5568", shoes: "sneakers", shoesColor: "#E8E8E4" },
      Water: { top: "hoodie", topColor: "#2E4A6B", bottom: "jeans", bottomColor: "#22304A", shoes: "sneakers", shoesColor: "#1A1A1A" },
    };
    const d = byElement[s?.element] || byElement.Water;
    const base = {
      top: pick(a.top, ["tee","tank","hoodie","blazer","coat","sweater","shirt"], d.top),
      topColor: okHex(a.topColor) || d.topColor,
      bottom: pick(a.bottom, ["trousers","jeans","shorts","skirt","cargo"], d.bottom),
      bottomColor: okHex(a.bottomColor) || d.bottomColor,
      shoes: pick(a.shoes, ["sneakers","boots","loafers"], d.shoes),
      shoesColor: okHex(a.shoesColor) || d.shoesColor,
      hat: (avatarPrefs.hat && avatarPrefs.hat !== "auto") ? avatarPrefs.hat : pick(a.hat, ["none","cap","trucker","cowboy","durag","beanie","skully"], "none"),
      hatColor: okHex(a.hatColor) || (avatarPrefs.hatColor) || "#1F1F1F",
    };
    return applyTier(base, avatarPrefs.budget || "$$");
  }

  // Make the budget tier visibly change the fit: garment formality + palette.
  function applyTier(av, tier) {
    if (tier === "$$") return av;
    const adjust = (hex, satMul, litShift) => {
      const n = parseInt(hex.slice(1), 16);
      let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      const avg = (r + g + b) / 3;
      r = avg + (r - avg) * satMul; g = avg + (g - avg) * satMul; b = avg + (b - avg) * satMul;
      r += litShift; g += litShift; b += litShift;
      const cl = (v) => Math.max(0, Math.min(255, Math.round(v)));
      return `#${((cl(r) << 16) | (cl(g) << 8) | cl(b)).toString(16).padStart(6, "0")}`;
    };
    const out = { ...av };
    if (tier === "$") {
      // casual / streetwear: soften formal tops to tees/hoodies, sneakers, brighter+lighter
      if (["blazer", "coat", "shirt"].includes(out.top)) out.top = out.top === "shirt" ? "tee" : "hoodie";
      out.shoes = "sneakers";
      out.topColor = adjust(out.topColor, 1.25, 14);
      out.bottomColor = adjust(out.bottomColor, 1.1, 8);
    } else if (tier === "$$$") {
      // premium: elevate casual tops to shirt/sweater, loafers/boots, muted refined tones
      if (["tee", "tank", "hoodie"].includes(out.top)) out.top = out.top === "hoodie" ? "sweater" : "shirt";
      if (out.shoes === "sneakers") out.shoes = "loafers";
      out.topColor = adjust(out.topColor, 0.8, -10);
      out.bottomColor = adjust(out.bottomColor, 0.8, -12);
    } else if (tier === "$$$$") {
      // ultra-luxury: tailored coat/blazer, deep rich monochrome, polished footwear
      if (!["coat", "blazer"].includes(out.top)) out.top = (out.top === "hoodie" || out.top === "tee" || out.top === "tank") ? "blazer" : "coat";
      out.shoes = out.shoes === "sneakers" ? "loafers" : out.shoes;
      out.topColor = adjust(out.topColor, 0.55, -34);
      out.bottomColor = adjust(out.bottomColor, 0.5, -40);
      out.shoesColor = adjust(out.shoesColor, 0.6, -20);
    }
    return out;
  }

  function PixelAvatar({ a, prefs = {}, facing = "front", sex = "", age = null, size }) {
    const SKIN = prefs.skin || "#E6C39A";
    const HAIR = prefs.hairColor || (age && age >= 60 ? "#8A8A88" : "#2E2620");
    const hairStyle = prefs.hair || (sex === "Female" ? "bob" : "short");
    const scene = prefs.scene || "void";
    const glasses = prefs.glasses || "none";
    const INK = "#141414";
    const OUT = "#221814";
    const shade = (hex, f = 0.72) => {
      const n = parseInt(hex.slice(1), 16);
      const r = Math.min(255, Math.round(((n >> 16) & 255) * f)), g = Math.min(255, Math.round(((n >> 8) & 255) * f)), b = Math.min(255, Math.round((n & 255) * f));
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
    };
    const SKIN2 = shade(SKIN, 0.8), SKINH = shade(SKIN, 1.1);
    const BELT = "#15151A";
    const gfx = prefs.graphic || "none";
    const GRAPHIC_TOPS = ["tee", "tank", "hoodie", "sweater", "shirt"];
    const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
    const CONTRAST = lum(a.topColor) > 0.45 ? "#1A1A1A" : "#EDEDE8";
    const tC = a.topColor, bC = a.bottomColor, sC = a.shoesColor;
    const tB = shade(tC, 1.2), tS = shade(tC, 0.74), bS = shade(bC, 0.74);
    const outl = [], fills = [], dets = [];
    // limb collectors for opposition-swing animation (front/back only)
    const limbs = { larm: [], rarm: [], lleg: [], rleg: [] };
    let route = null; // when set to a limb key, draws go there instead of main arrays
    const O = (x, y, w, h) => (route ? limbs[route] : outl).push([x - 0.38, y - 0.38, w + 0.76, h + 0.76, OUT]);
    const F = (x, y, w, h, c) => (route ? limbs[route] : fills).push([x, y, w, h, c]);
    const B = (x, y, w, h, c) => { O(x, y, w, h); F(x, y, w, h, c); };
    const P = (x, y, w, h, c) => (route ? limbs[route] : dets).push([x, y, w, h, c]);
    const mirror = facing === "left";
    const view = mirror ? "right" : facing;
    const legBot = a.bottom === "shorts" ? 25 : a.bottom === "skirt" ? 26 : 30;
    const shoeTop = a.shoes === "boots" ? 28.6 : 30;
    const torsoBot = a.top === "coat" ? 24.6 : 21;
    const sleeve = a.top === "tank" ? 0 : a.top === "tee" ? 4 : 8;
    const hasBelt = ["trousers", "jeans", "cargo", "shorts"].includes(a.bottom);
    const acc = prefs.accessory || "none";
    // Accessory drawer (held at the figure's right side / shoulder). Front & back only.
    function drawAccessory() {
      if (acc === "none" || view === "right") return;
      if (acc === "bag") { // shoulder bag hanging clear at the figure's side
        P(10.6, 12.4, 7.2, 0.7, "#2A201A"); // strap across torso
        B(18.6, 17.5, 3.8, 4.0, "#6B4A32"); // body, pushed out past the arm
        P(18.6, 17.5, 3.8, 0.8, shade("#6B4A32", 1.3)); // flap
        P(20.0, 18.6, 1.0, 0.9, "#E0B84E"); // brass clasp
        P(18.6, 19.6, 3.8, 0.45, shade("#6B4A32", 0.7));
      }
      if (acc === "tote") { // canvas tote hanging at side, clear of arm
        P(18.4, 12.6, 0.6, 5.2, "#B8AD90"); P(21.2, 12.6, 0.6, 5.2, "#B8AD90"); // handles
        B(18.0, 17.4, 4.0, 4.6, "#E0D6BA"); // bag body, light = high contrast
        P(18.0, 17.4, 4.0, 0.6, shade("#E0D6BA", 0.8));
        P(19.2, 19.0, 1.6, 1.6, shade("#E0D6BA", 0.78)); // subtle panel
      }
      if (acc === "laptop") { // carried out front, both hands, fully visible
        B(11.4, 19.0, 5.2, 3.4, "#A8B0B8"); // lid/back
        P(11.8, 19.4, 4.4, 2.6, "#3A4450"); P(12.1, 19.7, 3.8, 2.0, "#7FB8D8"); // screen glow
        P(11.4, 22.0, 5.2, 0.6, shade("#A8B0B8", 0.7));
        P(13.7, 18.6, 0.6, 0.5, "#C9F24D"); // tiny power light
      }
      if (acc === "luggage") { // stands ON THE GROUND beside the character
        const AL = "#C2C8CE", ALd = shade(AL, 0.80), ALl = shade(AL, 1.12);
        const lx = 21.0, ly = 21.4, lw = 5.0, lh = 9.4; // base sits at ~30.8, on the floor line
        B(lx, ly, lw, lh, AL);
        for (let gy = 0; gy < 7; gy++) P(lx, ly + 0.8 + gy * 1.2, lw, 0.45, ALd); // grooves
        P(lx, ly, 0.7, lh, ALl); // edge highlight
        P(lx + 1.0, ly - 1.4, lw - 2.0, 1.6, "#2A2A2A"); P(lx + 1.6, ly - 1.4, 0.6, 1.6, "#1A1A1A"); P(lx + 2.8, ly - 1.4, 0.6, 1.6, "#1A1A1A"); // top handle
        P(lx + 0.4, ly + lh, 1.1, 0.7, "#141414"); P(lx + lw - 1.5, ly + lh, 1.1, 0.7, "#141414"); // feet/wheels on ground
      }
      if (acc === "headphones") { // worn around the neck, clearly visible against the top
        P(11.4, 11.0, 5.2, 0.8, "#1A1A1A"); // band around neck
        B(10.8, 11.2, 1.6, 1.8, "#2A2A2A"); B(15.6, 11.2, 1.6, 1.8, "#2A2A2A"); // ear cups at neck
        P(11.0, 11.5, 1.1, 1.2, "#4A4A4A"); P(15.8, 11.5, 1.1, 1.2, "#4A4A4A");
      }
    }

    if (view === "front" || view === "back") {
      // bottoms
      B(11, 21, 6, 3, bC);
      if (a.bottom === "skirt") {
        B(10, 23, 8, 4, bC); P(10, 26.3, 8, 0.7, bS);
        B(11, 27, 2, 3, SKIN); B(15, 27, 2, 3, SKIN);
      } else {
        route = "lleg";
        B(11, 24, 2.6, legBot - 24, bC); P(12.8, 24, 0.8, legBot - 24, bS);
        if (a.bottom === "shorts") B(11, 25, 2.6, 5, SKIN);
        if (a.bottom === "cargo") P(10.7, 25.5, 1, 2, bS);
        if (a.bottom === "jeans" && view === "front") P(11.3, 22.2, 1.2, 0.5, bS);
        route = "rleg";
        B(14.4, 24, 2.6, legBot - 24, bC); P(16.2, 24, 0.8, legBot - 24, bS);
        if (a.bottom === "shorts") B(14.4, 25, 2.6, 5, SKIN);
        if (a.bottom === "cargo") P(16.3, 25.5, 1, 2, bS);
        if (a.bottom === "jeans" && view === "front") P(15.5, 22.2, 1.2, 0.5, bS);
        route = null;
      }
      if (hasBelt) { P(11, 21, 6, 0.7, BELT); if (view === "front") P(13.6, 21.05, 0.8, 0.6, "#A8A8A0"); }
      // shoes — ride with their legs
      route = "lleg";
      B(10.4, shoeTop, 3.2, 32 - shoeTop, sC);
      if (a.shoes === "sneakers") P(10.4, 31.2, 3.2, 0.8, "#F4F4F0");
      if (a.shoes === "boots") P(10.4, 29.4, 3.2, 0.6, shade(sC, 1.9));
      if (a.shoes === "loafers" && view === "front") P(10.8, 30.4, 2.4, 0.5, shade(sC, 1.8));
      route = "rleg";
      B(14.4, shoeTop, 3.2, 32 - shoeTop, sC);
      if (a.shoes === "sneakers") P(14.4, 31.2, 3.2, 0.8, "#F4F4F0");
      if (a.shoes === "boots") P(14.4, 29.4, 3.2, 0.6, shade(sC, 1.9));
      if (a.shoes === "loafers" && view === "front") P(14.8, 30.4, 2.4, 0.5, shade(sC, 1.8));
      route = null;
      // arms — each into its own collector
      [["larm", 8.2], ["rarm", 18]].forEach(([key, ax]) => {
        route = key;
        B(ax, 12, 1.8, 8, SKIN);
        if (sleeve) { P(ax, 12, 1.8, sleeve, tC); P(ax + 1, 12, 0.8, sleeve, tS); }
        if (a.top === "sweater" && sleeve === 8) P(ax, 19, 1.8, 1, tS);
        P(ax, 19.4, 1.8, 0.6, SKIN2);
        route = null;
      });
      // torso
      if (a.top === "coat") {
        B(9.3, 12, 9.4, 12.6, tC);
        P(9.3, 12, 0.9, 12.6, tB); P(17.8, 12, 0.9, 12.6, tS);
        P(13.7, 13, 0.6, 11, tS);
        if (view === "front") { P(12.8, 15, 0.6, 0.6, "#D8D4C8"); P(12.8, 17.2, 0.6, 0.6, "#D8D4C8"); P(12.8, 19.4, 0.6, 0.6, "#D8D4C8"); }
      } else {
        B(10, 12, 8, torsoBot - 12, tC);
        P(10, 12, 0.9, torsoBot - 12, tB); P(17.1, 12, 0.9, torsoBot - 12, tS);
      }
      if (view === "front") {
        if (a.top === "blazer") { P(12.4, 12, 1, 3.4, tS); P(14.6, 12, 1, 3.4, tS); P(13.4, 12, 1.2, 2.4, "#EDEDE8"); P(13.7, 16, 0.6, 0.6, "#EDEDE8"); P(13.7, 18, 0.6, 0.6, "#EDEDE8"); P(11.3, 13.6, 0.9, 0.6, "#EDEDE8"); }
        if (a.top === "hoodie") { B(9.2, 10.5, 1.4, 2.5, tC); B(17.4, 10.5, 1.4, 2.5, tC); P(12, 17.4, 4, 2.4, tS); P(12.6, 12.6, 0.5, 1.6, "#EDEDE8"); P(14.9, 12.6, 0.5, 1.6, "#EDEDE8"); }
        if (a.top === "sweater") { P(10, 20, 8, 1, tS); P(10, 15.4, 8, 0.45, shade(tC, 0.85)); P(10, 17.4, 8, 0.45, shade(tC, 0.85)); }
        if (a.top === "shirt") { P(12, 12, 1.4, 1, "#EDEDE8"); P(14.6, 12, 1.4, 1, "#EDEDE8"); P(13.7, 13, 0.6, 8, shade(tC, 0.82)); }
        if (a.top === "tee") P(12.5, 14.2, 1.4, 1.4, shade(tC, 0.8));
      } else {
        if (a.top === "hoodie") { P(10.6, 12, 6.8, 3.6, shade(tC, 0.85)); B(11.2, 10.5, 5.6, 1.6, tC); }
        if (a.top === "blazer") P(13.7, 17, 0.6, 4, tS);
        if (a.top === "sweater") { P(10, 20, 8, 1, tS); P(10, 15.4, 8, 0.45, shade(tC, 0.85)); P(10, 17.4, 8, 0.45, shade(tC, 0.85)); }
        if (a.top === "shirt") P(10, 13.2, 8, 0.5, shade(tC, 0.82));
      }
      // chest graphic
      if (view === "front" && GRAPHIC_TOPS.includes(a.top) && gfx !== "none") {
        if (gfx === "cross") { P(13.55, 13.1, 0.9, 3.4, CONTRAST); P(12.35, 14.0, 3.3, 0.9, CONTRAST); }
        if (gfx === "star") { P(13.55, 13.2, 0.9, 3.0, CONTRAST); P(12.5, 14.25, 3.0, 0.9, CONTRAST); P(13.1, 13.75, 1.8, 1.9, CONTRAST); }
        if (gfx === "crest") { P(12.85, 13.1, 2.5, 2.3, CONTRAST); P(13.35, 15.4, 1.5, 0.7, CONTRAST); P(13.75, 16.1, 0.7, 0.5, CONTRAST); P(13.05, 13.8, 2.1, 0.45, tC); }
        if (gfx === "stripe") {
          P(10, 14.0, 8, 1.0, CONTRAST); P(10, 16.1, 8, 1.0, CONTRAST);
          if (sleeve === 8) { P(8.2, 14.0, 1.8, 1.0, CONTRAST); P(18, 14.0, 1.8, 1.0, CONTRAST); P(8.2, 16.1, 1.8, 1.0, CONTRAST); P(18, 16.1, 1.8, 1.0, CONTRAST); }
        }
      }
      // neck + head
      F(13, 11, 2, 1, SKIN);
      B(10, 4, 8, 7, SKIN);
      P(10, 4, 0.8, 7, SKINH); P(17.2, 4, 0.8, 7, SKIN2);
      if (view === "front") {
        if (hairStyle === "short") { B(9.3, 3, 9.4, 2.4, HAIR); B(9.3, 5.4, 1, 3.4, HAIR); B(17.7, 5.4, 1, 3.4, HAIR); P(9.3, 4.8, 9.4, 0.6, shade(HAIR, 0.7)); }
        if (hairStyle === "buzz") B(9.7, 3.4, 8.6, 1.3, HAIR);
        if (hairStyle === "bob") { B(9.3, 3, 9.4, 2.4, HAIR); B(9.1, 5.4, 1.3, 4.8, HAIR); B(17.6, 5.4, 1.3, 4.8, HAIR); P(9.3, 4.8, 9.4, 0.6, shade(HAIR, 0.7)); }
        if (hairStyle === "long") { B(9.3, 3, 9.4, 2.4, HAIR); B(8.9, 5.4, 1.5, 8.8, HAIR); B(17.6, 5.4, 1.5, 8.8, HAIR); P(9.3, 4.8, 9.4, 0.6, shade(HAIR, 0.7)); }
        if (hairStyle === "curly") { B(9.3, 2.5, 9.4, 3, HAIR); B(8.9, 3.2, 0.9, 1.8, HAIR); B(18.2, 3.2, 0.9, 1.8, HAIR); B(10.6, 1.8, 1.7, 1, HAIR); B(13.2, 1.6, 1.7, 1.1, HAIR); B(15.8, 1.8, 1.7, 1, HAIR); B(9.0, 5.4, 1.2, 3.8, HAIR); B(17.8, 5.4, 1.2, 3.8, HAIR); }
        if (hairStyle === "pony") { B(9.3, 3, 9.4, 2.2, HAIR); B(9.3, 5.2, 1, 2.4, HAIR); B(17.7, 5.2, 1, 2.4, HAIR); B(12.8, 1.8, 2.4, 1.3, HAIR); }
        if (hairStyle === "afro") { B(8.4, 1.4, 11.2, 4.4, HAIR); B(8.0, 3.0, 1.6, 4.4, HAIR); B(18.4, 3.0, 1.6, 4.4, HAIR); P(9.0, 1.9, 10, 0.7, shade(HAIR, 1.25)); }
        if (hairStyle === "mohawk") { B(12.8, 0.8, 2.4, 4.6, HAIR); B(9.4, 4.2, 9.2, 1.3, shade(HAIR, 0.85)); P(13.0, 1.0, 2.0, 0.7, shade(HAIR, 1.3)); }
        if (hairStyle === "manbun") { B(9.3, 3, 9.4, 2.4, HAIR); B(9.3, 5.4, 1, 2.6, HAIR); B(17.7, 5.4, 1, 2.6, HAIR); B(12.9, 1.2, 2.2, 1.8, HAIR); P(13.1, 1.5, 1.8, 0.6, shade(HAIR, 1.25)); P(9.3, 4.8, 9.4, 0.6, shade(HAIR, 0.7)); }
        if (hairStyle === "waves") { B(9.3, 3, 9.4, 2.6, HAIR); B(9.3, 5.6, 1, 3.2, HAIR); B(17.7, 5.6, 1, 3.2, HAIR); P(9.6, 3.4, 1.8, 0.5, shade(HAIR, 1.3)); P(12.0, 3.0, 1.8, 0.5, shade(HAIR, 1.3)); P(14.4, 3.4, 1.8, 0.5, shade(HAIR, 1.3)); P(16.6, 3.0, 1.6, 0.5, shade(HAIR, 1.3)); }
      } else {
        if (hairStyle === "buzz") B(9.7, 3.2, 8.6, 2.2, HAIR);
        else if (hairStyle === "bob") B(9.2, 3, 9.6, 7.6, HAIR);
        else if (hairStyle === "long") B(9.0, 3, 10, 11.2, HAIR);
        else if (hairStyle === "curly") { B(9.2, 2.5, 9.6, 6.6, HAIR); B(8.9, 3.2, 0.9, 2.4, HAIR); B(10.6, 1.8, 1.7, 1, HAIR); B(13.2, 1.6, 1.7, 1.1, HAIR); B(15.8, 1.8, 1.7, 1, HAIR); }
        else if (hairStyle === "pony") { B(9.3, 3, 9.4, 5.4, HAIR); P(12.9, 8.2, 2.2, 0.7, "#4A4A48"); B(13.1, 8.9, 1.8, 7, HAIR); }
        else if (hairStyle === "afro") { B(8.4, 1.4, 11.2, 7.2, HAIR); B(8.0, 3.0, 1.6, 4.4, HAIR); B(18.4, 3.0, 1.6, 4.4, HAIR); }
        else if (hairStyle === "mohawk") { B(12.8, 0.8, 2.4, 4.6, HAIR); B(11, 4.4, 6, 4.2, shade(HAIR, 0.8)); }
        else if (hairStyle === "manbun") { B(9.3, 3, 9.4, 5.2, HAIR); B(12.9, 1.2, 2.2, 1.8, HAIR); P(13.1, 1.5, 1.8, 0.6, shade(HAIR, 1.25)); }
        else if (hairStyle === "waves") { B(9.3, 3, 9.4, 5.6, HAIR); P(9.7, 3.4, 1.8, 0.5, shade(HAIR, 1.3)); P(12.4, 3.0, 1.8, 0.5, shade(HAIR, 1.3)); P(15.0, 3.4, 1.8, 0.5, shade(HAIR, 1.3)); }
        else B(9.3, 3, 9.4, 5.6, HAIR);
      }
      if (a.hat === "cap") { B(9.6, 1.7, 8.8, 2.7, a.hatColor); P(9.6, 1.7, 8.8, 0.8, shade(a.hatColor, 1.25)); if (view === "front") B(8, 4.0, 12, 0.8, a.hatColor); else P(13.3, 3.4, 1.4, 1.0, SKIN); }
      if (a.hat === "trucker") { B(9.6, 1.7, 8.8, 2.7, view === "front" ? shade(a.hatColor, 1.18) : a.hatColor); P(9.6, 1.7, 8.8, 1.0, a.hatColor); if (view === "front") { B(8, 4.0, 12, 0.8, a.hatColor); P(10.4, 2.6, 7.2, 1.4, shade(a.hatColor, 1.35)); } else P(13.3, 3.4, 1.4, 1.0, SKIN); }
      if (a.hat === "cowboy") { B(7.0, 4.1, 14, 1.0, a.hatColor); P(7.0, 4.1, 14, 0.4, shade(a.hatColor, 1.25)); B(9.8, 0.8, 8.4, 3.5, a.hatColor); if (view === "front") { P(13.4, 0.8, 1.0, 3.5, shade(a.hatColor, 0.78)); P(9.8, 3.3, 8.4, 0.8, shade(a.hatColor, 0.82)); } }
      if (a.hat === "durag") { B(9.3, 2.6, 9.4, 2.8, a.hatColor); P(9.3, 2.6, 9.4, 0.7, shade(a.hatColor, 1.2)); if (view === "front") P(10.4, 3.4, 7.2, 0.6, shade(a.hatColor, 0.8)); B(17.6, 4.8, 1.6, 6.0, a.hatColor); B(18.9, 4.8, 1.4, 4.6, a.hatColor); P(17.6, 4.8, 1.6, 0.7, shade(a.hatColor, 1.2)); }
      if (a.hat === "beanie") { B(9.3, 1.6, 9.4, 4, a.hatColor); P(9.3, 4.8, 9.4, 1.0, shade(a.hatColor)); P(9.3, 1.6, 9.4, 0.8, shade(a.hatColor, 1.25)); }
      if (a.hat === "skully") { B(9.5, 2.7, 9.0, 3.0, a.hatColor); P(9.5, 5.0, 9.0, 0.7, shade(a.hatColor, 0.8)); P(9.5, 2.7, 9.0, 0.7, shade(a.hatColor, 1.2)); }
      if (view === "front") {
        P(11.8, 6.45, 1.35, 0.45, shade(HAIR, 0.85)); P(14.85, 6.45, 1.35, 0.45, shade(HAIR, 0.85));
        P(13.2, 9.55, 1.6, 0.5, SKIN2);
      }
      drawAccessory();
    } else {
      // side view
      B(12, 21, 5, 3, bC);
      if (a.bottom === "skirt") {
        B(11.4, 23, 6, 4, bC); P(11.4, 26.3, 6, 0.7, bS);
        B(12.6, 27, 2, 3, shade(SKIN, 0.85)); B(13.8, 27, 2.2, 3, SKIN);
      } else {
        B(12.2, 24, 2.4, legBot - 24, shade(bC, 0.82));
        B(13.8, 24, 2.6, legBot - 24, bC);
        if (a.bottom === "shorts") { B(12.2, 25, 2.4, 5, shade(SKIN, 0.85)); B(13.8, 25, 2.6, 5, SKIN); }
        if (a.bottom === "cargo") P(15.5, 25.5, 1, 2, bS);
      }
      if (hasBelt) P(12, 21, 5, 0.7, BELT);
      B(11.8, shoeTop, 3, 32 - shoeTop, shade(sC, 0.82));
      B(13.4, shoeTop, 4.2, 32 - shoeTop, sC);
      if (a.shoes === "sneakers") P(13.4, 31.2, 4.2, 0.8, "#F4F4F0");
      if (a.shoes === "boots") P(13.4, 29.4, 4.2, 0.6, shade(sC, 1.9));
      // torso
      if (a.top === "coat") { B(11.2, 12, 6.4, 12.6, tC); P(16.9, 12, 0.7, 12.6, tS); P(11.2, 12, 0.8, 12.6, tB); }
      else { B(11.6, 12, 5.6, torsoBot - 12, tC); P(11.6, 12, 0.8, torsoBot - 12, tB); P(16.4, 12, 0.8, torsoBot - 12, tS); }
      if (a.top === "hoodie") { B(10.3, 9.8, 1.5, 3.8, tC); P(14.2, 17.4, 2.6, 2.2, tS); }
      if (a.top === "blazer") P(16.3, 12, 0.9, 3.2, tS);
      if (a.top === "sweater") P(11.6, 20, 5.6, 1, tS);
      B(13.4, 12, 1.8, 8, SKIN);
      if (sleeve) { P(13.4, 12, 1.8, sleeve, tC); P(14.4, 12, 0.8, sleeve, tS); }
      if (a.top === "sweater" && sleeve === 8) P(13.4, 19, 1.8, 1, tS);
      P(13.4, 19.4, 1.8, 0.6, SKIN2);
      // head profile
      F(13.4, 11, 2, 1, SKIN);
      B(11, 4, 7, 7, SKIN);
      B(17.9, 7.6, 0.9, 1.2, SKIN);
      P(11, 4, 0.8, 7, SKINH);
      if (hairStyle === "short") { B(10.4, 3, 8, 2.4, HAIR); B(10.4, 5.4, 1.2, 3.8, HAIR); P(10.4, 4.8, 8, 0.6, shade(HAIR, 0.7)); }
      if (hairStyle === "buzz") B(10.8, 3.4, 7.2, 1.3, HAIR);
      if (hairStyle === "bob") { B(10.4, 3, 8, 2.4, HAIR); B(10.2, 5.4, 1.7, 5.2, HAIR); P(10.4, 4.8, 8, 0.6, shade(HAIR, 0.7)); }
      if (hairStyle === "long") { B(10.4, 3, 8, 2.4, HAIR); B(9.9, 5.4, 2, 9.2, HAIR); P(10.4, 4.8, 8, 0.6, shade(HAIR, 0.7)); }
      if (hairStyle === "curly") { B(10.4, 2.5, 8, 3, HAIR); B(11.4, 1.7, 1.7, 1, HAIR); B(14.2, 1.6, 1.7, 1.1, HAIR); B(10.0, 3.4, 0.9, 2, HAIR); B(10.1, 5.4, 1.4, 4, HAIR); }
      if (hairStyle === "pony") { B(10.4, 3, 8, 2.2, HAIR); B(10.4, 5.2, 1.1, 2.6, HAIR); P(9.5, 6.3, 1.6, 0.7, "#4A4A48"); B(9.4, 7, 1.6, 6.2, HAIR); }
      if (hairStyle === "afro") { B(9.0, 1.4, 9.4, 4.6, HAIR); B(8.6, 3.2, 1.6, 4.2, HAIR); P(9.6, 1.9, 8, 0.7, shade(HAIR, 1.25)); }
      if (hairStyle === "mohawk") { B(11.6, 0.8, 2.6, 4.6, HAIR); B(10.6, 4.2, 6.4, 1.3, shade(HAIR, 0.85)); }
      if (hairStyle === "manbun") { B(10.4, 3, 8, 2.4, HAIR); B(10.4, 5.4, 1.2, 2.8, HAIR); B(8.8, 2.6, 1.8, 1.8, HAIR); P(9.0, 2.9, 1.4, 0.6, shade(HAIR, 1.25)); P(10.4, 4.8, 8, 0.6, shade(HAIR, 0.7)); }
      if (hairStyle === "waves") { B(10.4, 3, 8, 2.6, HAIR); B(10.4, 5.6, 1.2, 3.2, HAIR); P(10.8, 3.4, 1.8, 0.5, shade(HAIR, 1.3)); P(13.2, 3.0, 1.8, 0.5, shade(HAIR, 1.3)); P(15.6, 3.4, 1.6, 0.5, shade(HAIR, 1.3)); }
      if (a.hat === "cap") { B(10.6, 1.7, 7.8, 2.7, a.hatColor); B(16.8, 4.0, 3.6, 0.8, a.hatColor); P(10.6, 1.7, 7.8, 0.8, shade(a.hatColor, 1.25)); }
      if (a.hat === "trucker") { B(10.6, 1.7, 7.8, 2.7, a.hatColor); B(16.8, 4.0, 3.6, 0.8, a.hatColor); P(10.6, 1.7, 7.8, 0.8, shade(a.hatColor, 1.25)); P(11.2, 2.5, 3.4, 1.4, shade(a.hatColor, 1.35)); }
      if (a.hat === "cowboy") { B(8.6, 4.1, 12.6, 1.0, a.hatColor); P(8.6, 4.1, 12.6, 0.4, shade(a.hatColor, 1.25)); B(10.8, 0.8, 7.0, 3.5, a.hatColor); P(10.8, 3.3, 7.0, 0.8, shade(a.hatColor, 0.82)); }
      if (a.hat === "durag") { B(10.4, 1.7, 8.2, 3.4, a.hatColor); P(10.4, 1.7, 8.2, 0.8, shade(a.hatColor, 1.2)); B(8.4, 4.8, 1.8, 6.2, a.hatColor); P(8.4, 4.8, 1.8, 0.7, shade(a.hatColor, 1.2)); }
      if (a.hat === "beanie") { B(10.4, 1.6, 8.2, 4, a.hatColor); P(10.4, 4.8, 8.2, 1.0, shade(a.hatColor)); P(10.4, 1.6, 8.2, 0.8, shade(a.hatColor, 1.25)); }
      if (a.hat === "skully") { B(10.6, 2.7, 7.8, 3.0, a.hatColor); P(10.6, 5.0, 7.8, 0.7, shade(a.hatColor, 0.8)); P(10.6, 2.7, 7.8, 0.7, shade(a.hatColor, 1.2)); }
      P(15.6, 6.45, 1.35, 0.45, shade(HAIR, 0.85));
      P(16.5, 9.55, 1.3, 0.5, SKIN2);
    }

    const glassFrame = glasses === "round" ? "#23262B" : "#1C1C1C";
    const SCENES = {
      city: [[0,0,28,32,"#1C2438"],[2,2,0.5,0.5,"#EDEDE8"],[24,5,0.5,0.5,"#EDEDE8"],[8,3,0.4,0.4,"#9FB6C9"],[0.5,12,5,20,"#10141F"],[6.5,8,4,24,"#0D111A"],[17.5,14,4.5,18,"#10141F"],[23,9,4.5,23,"#0D111A"],[1.5,14,0.8,0.8,"#C9B458"],[3.5,17,0.8,0.8,"#C9B458"],[7.5,10,0.8,0.8,"#C9B458"],[9,13,0.8,0.8,"#C9B458"],[18.5,16,0.8,0.8,"#C9B458"],[24,12,0.8,0.8,"#C9B458"],[25.6,18,0.8,0.8,"#C9B458"],[0,32,28,4,"#2A2A30"],[0,32,28,0.5,"#3A3A42"]],
      park: [[0,0,28,31,"#7EC4E8"],[22,2.5,3.4,3.4,"#F2D34D"],[22.8,3.3,1.8,1.8,"#F8E58A"],[4,4,4,1.4,"#FFFFFF"],[5,5.4,2.4,1,"#FFFFFF"],[14,7,3.4,1.2,"#FFFFFF"],[1.2,22,2,8,"#6B4A2E"],[-0.5,16,5.4,7,"#4A8C3F"],[0.4,14.6,3.4,2,"#4A8C3F"],[24.6,23,1.8,7,"#6B4A2E"],[22.4,17,6,6.6,"#3F7A36"],[0,30.5,28,5.5,"#5FA84E"],[2,31,1,0.8,"#4A8C3F"],[8,32.6,1,0.8,"#4A8C3F"],[20,31.4,1,0.8,"#4A8C3F"],[25,32.8,1,0.8,"#4A8C3F"]],
      beach: [[0,0,28,24,"#8FD4F0"],[3.5,3,3.2,3.2,"#F2D34D"],[4.3,3.8,1.6,1.6,"#F8E58A"],[17,5,4,1.2,"#FFFFFF"],[0,24,28,6,"#2E7EB8"],[2,25.2,4,0.5,"#7FB8DC"],[12,26.6,5,0.5,"#7FB8DC"],[21,25,4,0.5,"#7FB8DC"],[6,28.2,4,0.5,"#7FB8DC"],[0,30,28,6,"#E8D8A8"],[4,31.6,1.4,0.6,"#D4C28C"],[19,33,1.4,0.6,"#D4C28C"]],
      room: [[0,0,28,31,"#4A3F52"],[2.5,5.5,7.6,8.6,"#2A2433"],[3.3,6.3,6,7,"#9FCBE8"],[6,6.3,0.5,7,"#2A2433"],[3.3,9.4,6,0.5,"#2A2433"],[19,7.5,5.4,6.6,"#C94B32"],[20.4,9.2,2.6,0.8,"#F4F4F0"],[20.4,10.8,2.6,0.8,"#F4F4F0"],[0,31,28,5,"#6B5436"],[0,31,28,0.5,"#54422B"],[7,33,0.4,3,"#54422B"],[18,32,0.4,4,"#54422B"]],
      night: [[0,0,28,31.5,"#0E1426"],[21,3.5,3,3,"#E8E4D0"],[22,4.2,0.8,0.8,"#C9C5B2"],[21.6,5.6,0.6,0.6,"#C9C5B2"],[3,3,0.5,0.5,"#F4F4F0"],[9,6,0.4,0.4,"#F4F4F0"],[14,2.5,0.5,0.5,"#F4F4F0"],[6,10,0.4,0.4,"#9FB6C9"],[17,8,0.4,0.4,"#F4F4F0"],[25,12,0.4,0.4,"#9FB6C9"],[2,16,0.4,0.4,"#F4F4F0"],[12,12,0.4,0.4,"#9FB6C9"],[0,31.5,28,4.5,"#1A1F2C"]],
      airport: [[0,0,28,31,"#D2DAE2"],[0,0,28,11,"#BCC8D4"],[0,0,28,3,"#A6B4C2"],[1.5,3,6.5,6,"#7FA8CC"],[1.5,3,6.5,0.5,"#5E88AC"],[2.1,3.6,2.6,4.6,"#AED0EC"],[5,3.6,2.6,4.6,"#AED0EC"],[2.1,3.6,2.6,1,"#C8E2F4"],[10,3,7,6,"#7FA8CC"],[10,3,7,0.5,"#5E88AC"],[10.6,3.6,2.8,4.6,"#AED0EC"],[13.7,3.6,2.8,4.6,"#AED0EC"],[10.6,3.6,2.8,1,"#C8E2F4"],[19.5,3,7,6,"#7FA8CC"],[19.5,3,7,0.5,"#5E88AC"],[20.1,3.6,5.6,4.6,"#AED0EC"],[20.1,3.6,5.6,1,"#C8E2F4"],[0,11,28,0.7,"#8A96A2"],[18.5,12.5,9.5,7.5,"#27303A"],[18.5,12.5,9.5,0.6,"#3E4A56"],[19.2,13.4,8,5.4,"#10161C"],[19.6,13.9,1.9,1.2,"#C9F24D"],[21.8,13.9,1.5,1.2,"#E8E8E8"],[19.6,15.6,7,0.45,"#2E3742"],[19.6,16.8,5,0.45,"#2E3742"],[2,13,5,5.5,"#9AA6B2"],[2,13,5,0.5,"#B4C0CC"],[2.6,14,3.8,1.4,"#7E8A96"],[0,31,28,5,"#AEB8C2"],[0,31,28,0.6,"#C2CCD6"],[0,32.5,28,0.4,"#98A4B0"]],
      restaurant: [[0,0,28,31,"#2E211E"],[0,0,28,14,"#3E2C26"],[0,0,28,4,"#4A352D"],[2,5,5,7,"#1E1512"],[2,5,5,0.6,"#5A4036"],[2.6,5.6,3.8,4.5,"#E0B86A"],[2.6,5.6,3.8,1.5,"#F0D08A"],[2.6,10.5,3.8,1,"#B8904A"],[21,5,5,7,"#1E1512"],[21,5,5,0.6,"#5A4036"],[21.6,5.6,3.8,4.5,"#E0B86A"],[21.6,5.6,3.8,1.5,"#F0D08A"],[12.6,2.5,1,4,"#5A4230"],[11.2,1.2,3.6,1.6,"#3A2C1E"],[11.6,1.5,2.8,1,"#F2C94C"],[11.9,0.7,2.2,0.9,"#F8E29A"],[11.4,2.5,3.2,0.5,"#FBE9B0"],[0,14,28,2.5,"#241B18"],[0,14,28,0.5,"#3A2C26"],[7,16,14,2,"#1E1512"],[0,31,28,5,"#4E372F"],[0,30.6,28,0.7,"#6B4E40"],[0,31.6,28,0.5,"#3A2822"],[5,16.5,3,9,"#1A1210"],[20,16.5,3,9,"#1A1210"]],
      club: [[0,0,28,31,"#0E0818"],[0,0,28,16,"#160C24"],[3,1.5,3.5,3.5,"#E84B9A"],[3,1.5,3.5,1,"#F87ABA"],[11,0.5,3.5,3.5,"#5A4BE8"],[11,0.5,3.5,1,"#7A6AF8"],[20,2.5,3.5,3.5,"#3BE8C0"],[20,2.5,3.5,1,"#6AF8DA"],[7.5,5,2.4,2.4,"#E8C04B"],[17,6,2.6,2.6,"#E84B6A"],[1.5,9,1.6,1.6,"#8A4BE8"],[24,10,1.8,1.8,"#4B9AE8"],[5,2,1.2,7,"#E84B9A"],[6,2,0.5,7,"#F87ABA"],[13,1,1.2,8,"#5A4BE8"],[21.5,3,1.2,6,"#3BE8C0"],[0,17,28,9,"#1C1028"],[0,17,28,0.5,"#3A2050"],[2,18,5,8,"#120A1C"],[3,18,1.5,8,"#1E1230"],[11,17,6,9,"#241634"],[12,17,1.5,9,"#341E48"],[20,18,5,8,"#120A1C"],[21,18,1.5,8,"#1E1230"],[0,30.5,28,0.5,"#5A2E80"],[0,31,28,5,"#0A0612"]],
      soccer: [[0,0,28,14,"#8FCFF0"],[0,0,28,5,"#A8DCF4"],[19,1.5,5,4,"#FFFFFF"],[19,1.5,5,3,"#F4F4F4"],[3,3,4.5,1.4,"#FFFFFF"],[8,2,3,1,"#FFFFFF"],[0,13,28,18,"#46A852"],[0,13,28,1.6,"#52B85E"],[0,16.2,28,1.6,"#3E9A48"],[0,19.4,28,1.6,"#52B85E"],[0,22.6,28,1.6,"#3E9A48"],[0,25.8,28,1.6,"#52B85E"],[0,29,28,1.6,"#3E9A48"],[8.5,12.2,11,4.5,"#F0F0F0"],[8.5,12.2,11,0.5,"#FFFFFF"],[8.5,12.2,0.5,4.5,"#FFFFFF"],[19,12.2,0.5,4.5,"#FFFFFF"],[12.3,12.2,0.35,4.5,"#E0E0E0"],[15.1,12.2,0.35,4.5,"#E0E0E0"],[13.2,27.5,1.4,1.4,"#FFFFFF"],[13.4,27.7,1,1,"#1A1A1A"],[0,31,28,5,"#357E3E"],[0,31,28,0.6,"#46A852"]],
      court: [[0,0,28,16,"#4A3326"],[0,0,28,10,"#5A4030"],[0,0,28,3,"#6B4D3A"],[2,3,3.5,6,"#2E1E14"],[2,3,3.5,0.5,"#3E2A1C"],[23,3,3.5,6,"#2E1E14"],[10.5,1.5,7,5.5,"#241810"],[10.5,1.5,7,0.6,"#3A281C"],[12.4,2.5,3.2,2,"#E06838"],[12.4,2.5,3.2,0.5,"#F08850"],[13.4,2.5,0.5,3.5,"#C9542A"],[12.4,2.5,3.2,0.4,"#C9542A"],[0,16,28,15,"#D08A48"],[0,16,28,1,"#E0A05E"],[0,16,28,0.4,"#B87838"],[7,16,14,10,"#C27A3C"],[7,16,14,0.5,"#F4E8D8"],[7,25.5,14,0.5,"#F4E8D8"],[7,16,0.5,10,"#F4E8D8"],[20.5,16,0.5,10,"#F4E8D8"],[11.5,20,5,5,"#F4E8D8"],[12.2,20.7,3.6,3.6,"#C27A3C"],[0,30.7,28,0.4,"#B87838"],[0,31,28,5,"#A8632C"]],
    };
    const sceneRects = SCENES[scene] || null;
    const mirrorT = mirror ? "scale(-1 1) translate(-28 0)" : "";
    // ---- Body profile: make sex & age read in the silhouette itself ----
    const child = age && age <= 12;
    const teen = age && age >= 13 && age <= 17;
    const older = age && age >= 60;
    // Age: children have larger heads + shorter bodies; elders stand slightly shorter.
    const headScale = child ? 1.18 : 1.0;
    const bodyYScale = child ? 0.84 : teen ? 0.93 : older ? 0.96 : 1.0;
    // Compose: scale whole figure vertically from the feet (y=32) up, then bob.
    const ageT = bodyYScale !== 1 ? `translate(0 ${(32 * (1 - bodyYScale)).toFixed(2)}) scale(1 ${bodyYScale})` : "";
    const groupT = [mirrorT, ageT].filter(Boolean).join(" ") || undefined;
    // Female: nip the waist in and round the hip; male: square the shoulders.
    // Overlays in the body's own colors, only on front/back so the profile view stays clean.
    const bodySilhouette = [];
    if ((view === "front" || view === "back")) {
      const tcShade = shade(tC, 0.74);
      if (sex === "Female") {
        // taper the waist with shadow + outline, and flare the hip — reads as an hourglass
        bodySilhouette.push(<rect key="wls" x={10.0} y={16.0} width={1.0} height={4.0} fill={tcShade} />);
        bodySilhouette.push(<rect key="wrs" x={17.0} y={16.0} width={1.0} height={4.0} fill={tcShade} />);
        bodySilhouette.push(<rect key="hl" x={9.4} y={20.6} width={1.3} height={2.6} fill={bC} />);
        bodySilhouette.push(<rect key="hr" x={17.3} y={20.6} width={1.3} height={2.6} fill={bC} />);
        bodySilhouette.push(<rect key="hlo" x={9.02} y={20.22} width={0.38} height={3.36} fill={OUT} />);
        bodySilhouette.push(<rect key="hro" x={18.6} y={20.22} width={0.38} height={3.36} fill={OUT} />);
        bodySilhouette.push(<rect key="hlb" x={9.4} y={23.2} width={1.3} height={0.38} fill={OUT} />);
        bodySilhouette.push(<rect key="hrb" x={17.3} y={23.2} width={1.3} height={0.38} fill={OUT} />);
      } else if (sex === "Male") {
        // broaden shoulders with small color caps at the top corners of the torso
        bodySilhouette.push(<rect key="sl" x={8.7} y={11.8} width={1.4} height={2.2} fill={tC} />);
        bodySilhouette.push(<rect key="sr" x={17.9} y={11.8} width={1.4} height={2.2} fill={tC} />);
        bodySilhouette.push(<rect key="slo" x={8.32} y={11.42} width={0.38} height={2.96} fill={OUT} />);
        bodySilhouette.push(<rect key="sro" x={19.3} y={11.42} width={0.38} height={2.96} fill={OUT} />);
      }
    }
    return (
      <svg viewBox="0 0 28 36" style={{ width: size || "100%", height: "auto", imageRendering: "pixelated", display: "block" }} aria-label={`Pixel character, ${facing} view`}>
        {sceneRects && <g>{sceneRects.map(([x, y, w, h, c], i) => <rect key={`sc${i}`} x={x} y={y} width={w} height={h} fill={c} />)}</g>}
        <ellipse className="avshadow" cx="14" cy="33.4" rx="5.6" ry="1" fill="#000" opacity="0.45" />
        <g transform={groupT}>
        <g className="avbob">
          {sex === "Male" && (view === "front" || view === "back") && bodySilhouette}
          {/* legs (behind torso) */}
          {(view === "front" || view === "back") && (
            <g>
              <g className={"limb-lleg"} style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}>
                {limbs.lleg.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
              </g>
              <g className={"limb-rleg"} style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}>
                {limbs.rleg.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
              </g>
            </g>
          )}
          {(view === "front" || view === "back") && (
            <g>
              <g className={"limb-larm"} style={{ transformBox: "fill-box", transformOrigin: "50% 4%" }}>
                {limbs.larm.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
              </g>
              <g className={"limb-rarm"} style={{ transformBox: "fill-box", transformOrigin: "50% 4%" }}>
                {limbs.rarm.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
              </g>
            </g>
          )}
          {[...outl, ...fills, ...dets].map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
          {sex === "Female" && (view === "front" || view === "back") && bodySilhouette}
          {view === "front" && gfx === "monogram" && GRAPHIC_TOPS.includes(a.top) && (
            <g>
              <rect x="14.7" y="12.7" width="2.7" height="2.2" fill={CONTRAST} />
              <text x="16.05" y="14.4" fontSize="1.65" fontFamily="Courier New, monospace" fontWeight="bold" fill={a.topColor} textAnchor="middle">{(prefs.initials || "CC").slice(0, 2).toUpperCase()}</text>
            </g>
          )}
          {view === "front" && (
            <g>
              <g className="aveyes">
                <rect x="11.9" y="7.1" width="1.15" height="1.7" fill={INK} />
                <rect x="14.95" y="7.1" width="1.15" height="1.7" fill={INK} />
                <rect x="12.0" y="7.3" width="0.45" height="0.55" fill="#FFFFFF" />
                <rect x="15.05" y="7.3" width="0.45" height="0.55" fill="#FFFFFF" />
                {sex === "Female" && <g><rect x="11.45" y="6.95" width="0.5" height="0.45" fill={INK} /><rect x="16.05" y="6.95" width="0.5" height="0.45" fill={INK} /></g>}
              </g>
              {glasses !== "none" && (glasses === "regular" ? (
                <g>
                  <rect x="11.3" y="6.95" width="2.2" height="1.9" fill="none" stroke="#1C1C1C" strokeWidth="0.32" />
                  <rect x="14.5" y="6.95" width="2.2" height="1.9" fill="none" stroke="#1C1C1C" strokeWidth="0.32" />
                  <rect x="13.5" y="7.55" width="1.0" height="0.4" fill="#1C1C1C" />
                  <rect x="9.9" y="7.5" width="1.4" height="0.4" fill="#1C1C1C" />
                  <rect x="16.7" y="7.5" width="1.4" height="0.4" fill="#1C1C1C" />
                  <rect x="11.7" y="7.2" width="0.5" height="0.5" fill="#C8DCEC" />
                  <rect x="14.9" y="7.2" width="0.5" height="0.5" fill="#C8DCEC" />
                </g>
              ) : (
                <g>
                  <rect x={glasses === "round" ? 11.45 : 11.25} y="6.95" width={glasses === "round" ? 1.95 : 2.3} height={glasses === "round" ? 1.95 : 2.05} fill={glassFrame} opacity="0.86" />
                  <rect x={glasses === "round" ? 14.65 : 14.55} y="6.95" width={glasses === "round" ? 1.95 : 2.3} height={glasses === "round" ? 1.95 : 2.05} fill={glassFrame} opacity="0.86" />
                  <rect x="13.45" y="7.6" width="1.15" height="0.45" fill={INK} />
                  <rect x="9.9" y="7.55" width="1.4" height="0.45" fill={INK} />
                  <rect x="16.75" y="7.55" width="1.4" height="0.45" fill={INK} />
                  <rect x="11.75" y="7.2" width="0.55" height="0.55" fill="#9FB6C9" />
                  <rect x="14.95" y="7.2" width="0.55" height="0.55" fill="#9FB6C9" />
                </g>
              ))}
            </g>
          )}
          {view === "right" && (
            <g>
              <g className="aveyes">
                <rect x="15.7" y="7.1" width="1.15" height="1.7" fill={INK} />
                <rect x="15.8" y="7.3" width="0.45" height="0.55" fill="#FFFFFF" />
                {sex === "Female" && <rect x="16.9" y="6.95" width="0.5" height="0.45" fill={INK} />}
              </g>
              {glasses !== "none" && (
                <g>
                  <rect x="15.2" y="6.95" width="2.2" height="2.0" fill={glassFrame} opacity="0.86" />
                  <rect x="11.7" y="7.55" width="3.6" height="0.45" fill={INK} />
                  <rect x="15.55" y="7.2" width="0.55" height="0.55" fill="#9FB6C9" />
                </g>
              )}
            </g>
          )}
        </g>
        </g>
      </svg>
    );
  }
  // Small animated weather icon (inline SVG, CSS-animated)
  function WeatherIcon({ label, size = 15 }) {
    const t = (label || "").toLowerCase();
    const kind = /thunder/.test(t) ? "storm" : /snow|sleet/.test(t) ? "snow" : /rain|drizzle|shower/.test(t) ? "rain" : /fog|mist/.test(t) ? "fog" : /clear|sun/.test(t) ? "sun" : "cloud";
    const C = ACCENT, G = "#9A9A98";
    const cloudPath = <path d="M5.5 12.5 a3 3 0 0 1 0-6 a4 4 0 0 1 7.6-1 a3 3 0 0 1 .4 7 z" fill="none" stroke={G} strokeWidth="1.3" strokeLinejoin="round" />;
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" style={{ overflow: "visible", flexShrink: 0 }} aria-label={label}>
        {kind === "sun" && (
          <g>
            <g className="wspin" style={{ transformOrigin: "8px 8px" }}>
              {[...Array(8)].map((_, i) => <line key={i} x1="8" y1="1.2" x2="8" y2="3.2" stroke={C} strokeWidth="1.2" strokeLinecap="round" transform={`rotate(${i * 45} 8 8)`} />)}
            </g>
            <circle cx="8" cy="8" r="3" fill={C} />
          </g>
        )}
        {kind === "cloud" && <g className="wfloat">{cloudPath}</g>}
        {kind === "fog" && (
          <g>{cloudPath}
            <line className="wfog" x1="4" y1="14.2" x2="12" y2="14.2" stroke={G} strokeWidth="1.1" strokeLinecap="round" />
          </g>
        )}
        {kind === "rain" && (
          <g>{cloudPath}
            {[6, 9, 12].map((x, i) => <line key={i} className="wdrop" style={{ animationDelay: `${i * 0.35}s` }} x1={x} y1="13.5" x2={x - 0.8} y2="15.5" stroke={C} strokeWidth="1.2" strokeLinecap="round" />)}
          </g>
        )}
        {kind === "snow" && (
          <g>{cloudPath}
            {[6, 9, 12].map((x, i) => <circle key={i} className="wdrop" style={{ animationDelay: `${i * 0.4}s` }} cx={x} cy="14.3" r="0.9" fill={WHITE} />)}
          </g>
        )}
        {kind === "storm" && (
          <g>{cloudPath}
            <path className="wflash" d="M8.6 12.2 L7 15 L8.4 15 L7.4 17.6 L10.4 14.2 L8.9 14.2 L10 12.2 Z" fill={C} transform="scale(0.78) translate(2.4 0.6)" />
          </g>
        )}
      </svg>
    );
  }

  function weatherClause() {
    if (!weather || weather.demo) return "";
    let band = weather.tempF <= 32 ? "freezing" : weather.tempF <= 48 ? "cold" : weather.tempF <= 62 ? "cool" : weather.tempF <= 78 ? "mild" : "hot";
    const wet = /rain|drizzle|shower|thunder|snow/i.test(weather.label);
    return ` It is ${weather.tempF}°F and ${weather.label.toLowerCase()} (${band}${wet ? ", wet" : ""}) in ${weather.place} today — the outfit must be practical for that weather.`;
  }
  function sexClause() { return sex === "Male" ? " Style the outfit in menswear." : sex === "Female" ? " Style the outfit in womenswear." : " Keep the outfit gender-neutral."; }
  function ageClause() {
    const a = parseInt(age, 10);
    if (!a) return "";
    if (a < 18) return ` The wearer is ${a} — age-appropriate, comfortable, nothing mature or revealing.`;
    if (a <= 25) return ` The wearer is ${a} — trend-forward, playful, streetwear-leaning welcome.`;
    if (a <= 40) return ` The wearer is ${a} — versatile, polished-but-current pieces.`;
    if (a <= 60) return ` The wearer is ${a} — refined, quality-over-trend, elevated classics.`;
    return ` The wearer is ${a} — comfortable, dignified, timeless.`;
  }

  function priceClause(tierOverride) {
    const b = tierOverride || avatarPrefs.budget || "$$";
    if (b === "$") return " BUDGET: thrifted, fast-fashion, secondhand — affordable high-street pieces, nothing designer. Keep brand-feel accessible.";
    if (b === "$$") return " BUDGET: mid-range contemporary — solid mall/contemporary labels, good basics, occasional standout piece.";
    if (b === "$$$") return " BUDGET: premium/designer-adjacent — elevated contemporary and entry designer, considered fabrics and tailoring.";
    if (b === "$$$$") return " BUDGET: ultra-luxury — full designer and runway-level pieces, rare materials, archival or couture-leaning choices.";
    return "";
  }

  // Build a shopping query that respects sex and budget tier, so results make sense.
  function shopQuery(term) {
    const sexTerm = sex === "Male" ? "men's" : sex === "Female" ? "women's" : "";
    const tierWord = { "$": "affordable", "$$": "", "$$$": "designer", "$$$$": "luxury designer" }[avatarPrefs.budget || "$$"] || "";
    return [sexTerm, tierWord, term].filter(Boolean).join(" ");
  }

  async function loadHistory(signName) {
    const keys = await sList(`day:${signName}:`);
    const entries = [];
    for (const k of keys) { const v = await sGet(k); if (v) entries.push(v); }
    entries.sort((a, b) => b.date.localeCompare(a.date));
    setHistory(entries.slice(0, 7));
  }

  async function pick(s, date = todayKey()) {
    setSign(s); setViewingDate(date); setReading(null);
    setSignListOpen(false);
    sSet("mySign", s.name);
    const cached = await sGet(`day:${s.name}:${date}`);
    if (cached) {
      setReading(cached.reading);
      setQuery(cached.reading.keyword || OUTFIT_THEMES[s.element][0]);
      await loadHistory(s.name);
      return;
    }
    if (date !== todayKey()) { setReading(null); await loadHistory(s.name); return; } // past day with no record
    await generate(s, date);
  }

  async function generate(s, date, tierOverride) {
    setLoading(true); setReading(null);
    try {
      // Gather recent readings for this sign so we can explicitly avoid repeating
      // the same fits, keywords, and tasks day to day.
      const recentKeys = await sList(`day:${s.name}:`);
      const recent = [];
      for (const k of recentKeys) { const v = await sGet(k); if (v?.reading) recent.push(v); }
      recent.sort((a, b) => b.date.localeCompare(a.date));
      const last = recent.slice(0, 7);
      const usedKeywords = last.map(r => r.reading.keyword).filter(Boolean);
      const usedFits = last.map(r => r.reading.fit).filter(Boolean);
      const usedActivities = last.map(r => r.reading.activity).filter(Boolean);
      const usedFitNames = last.map(r => r.reading.fitName).filter(Boolean);

      // A date-derived seed gives the model a concrete, different anchor each day.
      const seed = Array.from(date).reduce((a, c) => a + c.charCodeAt(0), 0) * 7 + s.name.length;

      const avoidBlock = (usedKeywords.length || usedFits.length || usedActivities.length)
        ? `\n\nDO NOT REPEAT anything from the last few days. Previously used outfit keywords: ${JSON.stringify(usedKeywords)}. Previously used fits: ${JSON.stringify(usedFits)}. Previously used tasks: ${JSON.stringify(usedActivities)}. Previously used fit names: ${JSON.stringify(usedFitNames)} - today's fitName must use a different construction (do not repeat the same suffix like Core two days running). Today's fit, keyword, and task must each be clearly different from all of those — different garments, different colors/silhouette, a different kind of task.`
        : "";

      const promptText = `You are writing in the blunt, spare, slightly provocative second-person voice of a Co-Star style horoscope. Write a FRESH, UNIQUE reading for ${s.name} on ${new Date(date + "T12:00:00").toDateString()} (daily variation seed ${seed} — let it push you toward a distinct mood, outfit, and task than other days; do not mention the seed). Respond ONLY with valid JSON, no markdown or backticks. Schema: {"power":"one short blunt sentence about what to lean into today","pressure":"one short blunt sentence about tension today","trouble":"one short blunt sentence warning","fitName":"a short NAME for today's outfit style, 2-4 words, title case. When it genuinely fits the day, nod to a recognizable TikTok fashion aesthetic — e.g. Indie Sleaze, Eclectic Grandpa, Coastal Cowgirl, Dark Academia, Light Academia, Gorpcore, Y2K, Quiet Luxury, Soft Grunge — otherwise just a simple evocative name like 'The Long Game' or 'Overcast Armor'. Keep it understated: at most one trend reference, never the words 'Edit' or 'Slay', don't force slang, vary the construction daily","mood":"2-4 word phrase capturing today's energy, title case","fit":"1 punchy sentence on what to wear today — name specific garments/colors/silhouette, under 18 words","activity":"one concrete task for today, blunt voice, under 14 words","keyword":"a 2-3 word fashion search phrase matching the day and ${s.name}'s ${s.vibe} aesthetic","alts":["4 more distinct 2-3 word outfit search phrases for today, each a different garment/color/silhouette direction that still fits the day's energy — varied, not minor rewordings of the keyword"],"playlist":["5 real songs as 'Artist — Title' that soundtrack today's mood and fit energy — mix well-known and slightly deeper cuts, cohesive vibe, no repeats from common defaults"],"avatar":{"top":"one of: tee|tank|hoodie|blazer|coat|sweater|shirt — must match the fit","topColor":"6-digit hex like #2E4A6B matching the fit's described colors","bottom":"one of: trousers|jeans|shorts|skirt|cargo","bottomColor":"6-digit hex","shoes":"one of: sneakers|boots|loafers","shoesColor":"6-digit hex","hat":"one of: none|cap|beanie","hatColor":"6-digit hex"}}.${sexClause()}${weatherClause()}${ageClause()}${priceClause(tierOverride)} The "fitName", "fit", "activity", "keyword", "alts", "playlist" and "avatar" must respect the guidance above.${avoidBlock}`;
      const res = await fetch("/api/horoscope", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });
      if (!res.ok) throw new Error("api");
      const parsed = await res.json();
      if (parsed.error) throw new Error(parsed.error);
      setReading(parsed);
      setQuery(parsed.keyword || OUTFIT_THEMES[s.element][0]);
      await sSet(`day:${s.name}:${date}`, { date, sign: s.name, reading: parsed });
      await loadHistory(s.name);
    } catch {
      const fb = OUTFIT_THEMES[s.element][0];
      setReading({ power: "The signal dropped. The stars went quiet.", pressure: "You wanted an answer. You got static.", trouble: "Don't mistake silence for permission.", fitName: "Off-Grid", mood: "Quietly Defiant", fit: `Lean into your ${s.vibe} instincts. Dress like you already know.`, activity: "Do the one task you've been avoiding.", keyword: fb, playlist: ["Radiohead — Everything In Its Right Place", "FKA twigs — Two Weeks", "Frank Ocean — Nights", "Portishead — Glory Box", "James Blake — Retrograde"], avatar: { top: "hoodie", topColor: "#2E3138", bottom: "cargo", bottomColor: "#23231F", shoes: "boots", shoesColor: "#151515", hat: "none", hatColor: "#000000" } });
      setQuery(fb);
    } finally { setLoading(false); }
  }

  const themes = sign ? OUTFIT_THEMES[sign.element] : [];
  const pinterestUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
  const tiktokUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query + " outfit")}`;
  const instagramUrl = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(query + " outfit")}`;

  // ---------- Shareable card (Wrapped-style) ----------
  function ShareCard() {
    const cardRef = React.useRef(null);
    const [busy, setBusy] = React.useState(false);
    const dateStr = new Date(viewingDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase();
    const altList = (reading.alts?.length ? reading.alts : themes).slice(0, 4);

    // Build the card as a self-contained SVG string (renders + exports cleanly).
    const CW = 540, CH = 960;
    function esc(t) { return String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function wrap(text, max) {
      const words = String(text || "").split(" "); const lines = []; let cur = "";
      for (const w of words) { if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }
      if (cur.trim()) lines.push(cur.trim());
      return lines;
    }
    const fitName = reading.fitName || "Today's Fit";
    const fitNameLines = wrap(fitName.toUpperCase(), 12).slice(0, 2);
    const moodTxt = reading.mood || (reading.power || "").split(".")[0] || "";
    const fitLines = wrap(reading.fit, 34).slice(0, 2);
    const actLines = wrap(reading.activity, 34).slice(0, 2);
    const keyword = reading.keyword || (altList[0] || "");

    const cx = CW / 2;
    const fitNameY = 430;
    const serifFn = "Georgia, 'Times New Roman', serif";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}" font-family="'Courier New', monospace">
      <defs>
        <radialGradient id="glow" cx="50%" cy="32%" r="60%">
          <stop offset="0%" stop-color="#171717"/>
          <stop offset="100%" stop-color="#0A0A0A"/>
        </radialGradient>
      </defs>
      <rect width="${CW}" height="${CH}" fill="url(#glow)"/>
      ${[...Array(34)].map((_,i)=>{const x=((i*53)%100)/100*CW;const y=((i*37)%100)/100*CH;const r=i%6===0?2:1.1;return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="${i%6===0?'#C9F24D':'#F4F4F0'}" opacity="${i%6===0?0.5:0.18}"/>`;}).join("")}

      <!-- header -->
      <text x="${cx}" y="86" fill="#C9F24D" font-size="13" letter-spacing="6" dx="3" text-anchor="middle">C O S M I C   C L O S E T</text>
      <text x="${cx}" y="112" fill="#5A5A58" font-size="11" letter-spacing="4" dx="2" text-anchor="middle">${dateStr} · ${esc(sign.name.toUpperCase())} ${esc(sign.symbol)}</text>

      <!-- character in scene -->
      ${(() => {
        const av = (viewingDate && fitLog[viewingDate]?.avatar) || deriveAvatar(reading, sign);
        const pf = (viewingDate && fitLog[viewingDate]?.prefsSnap) || avatarPrefs;
        const markup = avatarFrontMarkup(av, pf, sex, parseInt(age, 10) || null);
        // frame the character box: 0.28x scale of 28x36 sprite => ~ 200x257, centered
        const boxW = 220, boxH = 286, bx = cx - boxW / 2, by = 150;
        const sc = boxW / 28;
        return `<rect x="${bx}" y="${by}" width="${boxW}" height="${boxH}" fill="#0D0D10" stroke="#242425"/>
          <g transform="translate(${bx}, ${by}) scale(${sc})">${markup}</g>
          <rect x="${bx}" y="${by}" width="${boxW}" height="${boxH}" fill="none" stroke="#242425"/>`;
      })()}

      <!-- mood -->
      <text x="${cx}" y="476" fill="#C9F24D" font-size="11" letter-spacing="4" dx="2" text-anchor="middle">TODAY'S ENERGY</text>
      <text x="${cx}" y="500" fill="#DCDCD8" font-size="18" font-style="italic" font-family="${serifFn}" text-anchor="middle">${esc(moodTxt)}</text>

      <!-- HERO: fit name -->
      ${(() => {
        const longest = Math.max(...fitNameLines.map(l => l.length), 1);
        const maxByWidth = Math.floor((CW - 70) / (longest * 0.6));
        const size = Math.min(fitNameLines.length > 1 ? 36 : 46, maxByWidth);
        const lineH = size + 5;
        const startY = 542;
        return fitNameLines.map((l, i) => `<text x="${cx}" y="${startY + i * lineH}" fill="#F4F4F0" font-size="${size}" font-family="${serifFn}" text-anchor="middle">${esc(l)}</text>`).join("");
      })()}

      <!-- fit detail -->
      ${fitLines.map((l,i)=>`<text x="${cx}" y="${(fitNameLines.length > 1 ? 612 : 580) + i*24}" fill="#9A9A98" font-size="14" text-anchor="middle">${esc(l)}</text>`).join("")}

      <!-- do this -->
      <text x="${cx}" y="668" fill="#C9F24D" font-size="11" letter-spacing="4" dx="2" text-anchor="middle">DO THIS</text>
      ${actLines.map((l,i)=>`<text x="${cx}" y="${692 + i*23}" fill="#DCDCD8" font-size="14" text-anchor="middle">${esc(l)}</text>`).join("")}

      <!-- keyword chip (compact) -->
      ${(() => {
        const kw = keyword.toUpperCase();
        const fs = 14;
        const ls = 2;
        const textW = kw.length * (fs * 0.62) + (kw.length - 1) * ls;
        const padX = 24;
        const pillW = Math.min(textW + padX * 2, CW - 56);
        const pillH = 42;
        const py = 742;
        return `<rect x="${(cx - pillW / 2).toFixed(0)}" y="${py}" width="${pillW.toFixed(0)}" height="${pillH}" rx="${pillH / 2}" fill="none" stroke="#C9F24D" stroke-width="1.2"/>
        <text x="${cx}" y="${py + pillH / 2 + fs * 0.36}" fill="#C9F24D" font-size="${fs}" letter-spacing="${ls}" dx="${ls / 2}" text-anchor="middle">${esc(kw)}</text>`;
      })()}

      <!-- the soundtrack -->
      ${(() => {
        const tracks = (reading.playlist || []).slice(0, 5);
        if (!tracks.length) return "";
        const label = `<text x="${cx}" y="816" fill="#7A7A78" font-size="11" letter-spacing="5" dx="2.5" text-anchor="middle">THE SOUNDTRACK</text>`;
        const rows = tracks.map((t, i) => {
          const txt = String(t).length > 36 ? String(t).slice(0, 35) + "…" : String(t);
          return `<text x="${cx}" y="${842 + i * 21}" font-size="13.5" fill="#DCDCD8" text-anchor="middle">${esc("0" + (i + 1) + "  " + txt)}</text>`;
        }).join("");
        return label + rows;
      })()}

      <!-- footer -->
      <text x="${cx}" y="${(reading.playlist || []).length ? 952 : 912}" fill="#5A5A58" font-size="10" letter-spacing="4" dx="2" text-anchor="middle">COSMICCLOSET.APP</text>
    </svg>`;

    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    async function download() {
      setBusy(true);
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = svgDataUrl; });
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = CW * scale; canvas.height = CH * scale;
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, CW, CH);
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url; a.download = `cosmic-closet-${sign.name.toLowerCase()}-${viewingDate}.png`;
        document.body.appendChild(a); a.click(); a.remove();
      } catch (e) {
        // Fallback: open the SVG so the user can long-press / right-click save
        window.open(svgDataUrl, "_blank");
      } finally { setBusy(false); }
    }

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20, overflowY: "auto" }}>
        <img ref={cardRef} src={svgDataUrl} alt="Your Cosmic Closet card"
          style={{ width: "min(430px, 88vw)", maxHeight: "76vh", height: "auto", border: `1px solid ${LINE}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} />
        <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 360 }}>
          <button className="up" disabled={busy} onClick={download} style={{ background: ACCENT, color: BLACK, border: "none", padding: "12px 20px", fontSize: 10, letterSpacing: "0.14em", fontFamily: fontStack, cursor: "pointer", fontWeight: 600 }}>{busy ? "Saving…" : "↓ Save image"}</button>
          <a className="up" href={instagramUrl} target="_blank" rel="noopener noreferrer" style={{ background: "transparent", color: WHITE, border: `1px solid ${LINE}`, padding: "12px 16px", fontSize: 10, fontFamily: fontStack, textDecoration: "none", letterSpacing: "0.12em" }}>Instagram</a>
          <a className="up" href={tiktokUrl} target="_blank" rel="noopener noreferrer" style={{ background: "transparent", color: WHITE, border: `1px solid ${LINE}`, padding: "12px 16px", fontSize: 10, fontFamily: fontStack, textDecoration: "none", letterSpacing: "0.12em" }}>TikTok</a>
        </div>
        <button className="up" onClick={() => setShowCard(false)} style={{ background: "none", border: "none", color: GREY, fontSize: 9, letterSpacing: "0.15em", marginTop: 16, fontFamily: fontStack, cursor: "pointer" }}>Close</button>
        <p className="up" style={{ color: DIM, fontSize: 8, letterSpacing: "0.1em", marginTop: 8, textAlign: "center", maxWidth: 300, lineHeight: 1.8 }}>Save the image, then post it to your story</p>
      </div>
    );
  }

  // ---------- Onboarding ----------
  function Onboarding() {
    const [busy, setBusy] = useState(false);
    const titles = ["You are", "Where you are", "How old you are"];
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 400, background: PANEL, border: `1px solid ${LINE}`, padding: "40px 30px 30px", position: "relative" }}>
          <div className="up" style={{ fontSize: 9, color: GREY, textAlign: "center" }}>Cosmic Closet</div>
          <div style={{ display: "flex", gap: 5, justifyContent: "center", margin: "14px 0 28px" }}>
            {[0,1,2].map(i => <span key={i} style={{ width: 24, height: 2, background: i <= step ? ACCENT : LINE, transition: "background .3s" }} />)}
          </div>
          <h2 className="up" style={{ fontSize: 15, textAlign: "center", fontWeight: 400, margin: "0 0 26px" }}>{titles[step]}</h2>
          {step === 0 && (
            <div style={{ display: "grid", gap: 9 }}>
              {["Female", "Male", "Prefer not to say"].map(o => (
                <button key={o} className="up opt" onClick={() => { setSex(o); setStep(1); }} style={{ background: sex === o ? WHITE : "transparent", color: sex === o ? BLACK : WHITE }}>{o}</button>
              ))}
            </div>
          )}
          {step === 1 && (
            <div>
              <input autoFocus value={zip} onChange={e => setZip(e.target.value.slice(0, 40))} onKeyDown={e => { if (e.key === "Enter") document.getElementById("obn").click(); }} placeholder="CITY OR US ZIP" className="up fld" />
              {weatherErr && <div className="up" style={{ fontSize: 9, color: "#E06", marginTop: 11, textAlign: "center" }}>{weatherErr}</div>}
              {weather && <div className="up" style={{ fontSize: 10, color: ACCENT, marginTop: 13, textAlign: "center" }}>{weather.place} · {weather.tempF}°F · {weather.label}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                <button className="up opt" onClick={() => setStep(0)} style={{ flex: 1, color: GREY }}>Back</button>
                <button id="obn" className="up opt" disabled={busy} onClick={async () => { setBusy(true); if (zip.trim()) await loadWeather(zip); setBusy(false); setStep(2); }} style={{ flex: 2, background: WHITE, color: BLACK }}>{busy ? "Checking…" : "Next →"}</button>
              </div>
              <button className="up skip" onClick={() => setStep(2)}>Skip weather</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <input autoFocus value={age} onChange={e => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} onKeyDown={e => { if (e.key === "Enter") setOnboarded(true); }} placeholder="AGE" inputMode="numeric" className="up fld" />
              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                <button className="up opt" onClick={() => setStep(1)} style={{ flex: 1, color: GREY }}>Back</button>
                <button className="up opt" onClick={() => setOnboarded(true)} style={{ flex: 2, background: WHITE, color: BLACK }}>Read my sky →</button>
              </div>
              <button className="up skip" onClick={() => setOnboarded(true)}>Skip</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const ROWS = [["Power", reading?.power], ["Pressure", reading?.pressure], ["Trouble", reading?.trouble]];

  return (
    <div style={{ fontFamily: fontStack, background: BLACK, color: WHITE, minHeight: "100vh", paddingBottom: 80, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        .up { text-transform: uppercase; letter-spacing: 0.18em; }
        .opt { border: 1px solid ${LINE}; padding: 14px; font-size: 11px; letter-spacing: 0.15em; font-family: ${fontStack}; cursor: pointer; text-transform: uppercase; background: transparent; color: ${WHITE}; transition: all .15s; }
        .opt:hover { border-color: ${WHITE}; }
        .fld { width: 100%; background: transparent; border: 1px solid ${LINE}; color: ${WHITE}; padding: 15px; font-size: 12px; letter-spacing: 0.12em; font-family: ${fontStack}; text-align: center; }
        .fld:focus { outline: none; border-color: ${ACCENT}; }
        .skip { width: 100%; background: none; border: none; color: ${DIM}; font-size: 9px; letter-spacing: 0.15em; margin-top: 13px; font-family: ${fontStack}; cursor: pointer; text-transform: uppercase; }
        .skip:hover { color: ${GREY}; }
        .signrow { cursor: pointer; transition: background .15s, padding-left .15s; }
        .signrow:hover { background: rgba(244,244,240,0.04); padding-left: 30px; }
        .photo { transition: filter .4s, transform .4s; cursor: pointer; filter: grayscale(1) contrast(1.05) brightness(0.92); }
        .photo:hover { filter: grayscale(0) contrast(1); transform: scale(1.015); }
        .chip { cursor: pointer; transition: all .18s ease; }
        .chip:hover { background: ${WHITE} !important; color: ${BLACK} !important; border-color: ${WHITE} !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(244,244,240,0.12); }
        .hday { cursor: pointer; transition: all .18s ease; }
        .hday:hover:not(:disabled) { background: ${WHITE} !important; color: ${BLACK} !important; border-color: ${WHITE} !important; transform: translateY(-3px) scale(1.04); box-shadow: 0 10px 26px rgba(244,244,240,0.14); }
        .signrow { transition: all .2s cubic-bezier(.2,.8,.3,1.1); }
        .signrow:hover { background: ${WHITE} !important; color: ${BLACK} !important; border-color: ${WHITE} !important; transform: translateY(-4px) scale(1.03); box-shadow: 0 14px 34px rgba(244,244,240,0.16); z-index: 2; position: relative; }
        .signrow:hover span { color: ${BLACK} !important; }
        .track:hover { background: ${WHITE}; color: ${BLACK}; transform: translateX(4px); }
        .track:hover .chip { border-color: ${BLACK}; }
        .popbtn:hover { background: ${WHITE}; color: ${BLACK} !important; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(244,244,240,0.15); }
        .shoplink:hover { background: ${ACCENT}; color: ${BLACK} !important; border-color: ${ACCENT} !important; transform: translateY(-2px); }
        .shoplink:hover span { color: ${BLACK} !important; }
        input::placeholder { color: ${DIM}; }
        a:focus-visible, button:focus-visible { outline: 1px solid ${ACCENT}; outline-offset: 2px; }
        @keyframes tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes twinkle { 0%,100% { opacity: 0.12; transform: scale(0.8); } 50% { opacity: 0.8; transform: scale(1.25); } }
        @keyframes sparklespin { 0%,100% { opacity: 0.1; transform: scale(0.6) rotate(0deg); } 50% { opacity: 0.95; transform: scale(1.15) rotate(18deg); } }
        @keyframes skelpulse { 0%,100% { opacity: 0.25; } 50% { opacity: 0.55; } }
        @keyframes wspin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .wspin { animation: wspin 14s linear infinite; }
        @keyframes wdrop { 0% { transform: translateY(0); opacity: 0; } 25% { opacity: 1; } 100% { transform: translateY(3.5px); opacity: 0; } }
        .wdrop { animation: wdrop 1.3s ease-in infinite; }
        @keyframes wfloat { 0%,100% { transform: translateX(0); } 50% { transform: translateX(1.6px); } }
        .wfloat { animation: wfloat 5s ease-in-out infinite; }
        @keyframes wfog { 0%,100% { transform: translateX(-1px); opacity: 0.5; } 50% { transform: translateX(1.5px); opacity: 1; } }
        .wfog { animation: wfog 4s ease-in-out infinite; }
        @keyframes wflash { 0%,72%,100% { opacity: 0.25; } 78%,88% { opacity: 1; } }
        .wflash { animation: wflash 2.6s ease-in-out infinite; }
        @keyframes eqb { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
        .eqb { width: 2px; height: 100%; background: currentColor; transform-origin: bottom; animation: eqb 0.8s ease-in-out infinite; }
        @keyframes avbob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-0.8px); } }
        .avbob { animation: avbob 2.4s ease-in-out infinite; }
        @keyframes avshadow { 0%,100% { transform: scaleX(1); opacity: 0.45; } 50% { transform: scaleX(0.9); opacity: 0.3; } }
        .avshadow { transform-origin: center; transform-box: fill-box; animation: avshadow 2.4s ease-in-out infinite; }
        @keyframes avblink { 0%,91%,100% { opacity: 1; } 93%,96% { opacity: 0; } }
        .aveyes { animation: avblink 4.6s infinite; }
        @keyframes curblink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
        .pixcursor { animation: curblink 1.1s steps(1) infinite; }
        .skel { background: ${GREY}; animation: skelpulse 1.4s infinite ease-in-out; border-radius: 2px; }
        .star { position: absolute; width: 2px; height: 2px; background: ${WHITE}; border-radius: 50%; animation: twinkle 3.6s infinite ease-in-out; }
        .star.lg { width: 3px; height: 3px; box-shadow: 0 0 6px rgba(244,244,240,0.6); }
        .star.acc { background: ${ACCENT}; box-shadow: 0 0 8px rgba(201,242,77,0.5); }
        .sparkle { position: absolute; color: ${ACCENT}; font-size: 11px; line-height: 1; animation: sparklespin 4.4s infinite ease-in-out; pointer-events: none; }
        .sparkle.w { color: ${WHITE}; }
        @media (prefers-reduced-motion: reduce){ *{ animation: none !important; transition: none !important } }
      `}</style>

      {/* ambient starfield — denser, twinkling, with sparkle glyphs */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.65 }}>
        {[...Array(70)].map((_, i) => (
          <span key={i} className={`star${i % 9 === 0 ? " lg" : ""}${i % 7 === 0 ? " acc" : ""}`}
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 11) * 0.45}s`, animationDuration: `${3 + (i % 5) * 0.7}s` }} />
        ))}
        {[...Array(14)].map((_, i) => (
          <span key={`sp${i}`} className={`sparkle${i % 3 === 0 ? "" : " w"}`}
            style={{ left: `${(i * 71 + 9) % 96}%`, top: `${(i * 47 + 5) % 96}%`, animationDelay: `${(i % 6) * 0.7}s` }}>✦</span>
        ))}
      </div>

      {!onboarded && profileLoaded && <Onboarding />}
      {showCard && reading && sign && <ShareCard />}
      {authPrompt && <Auth onSkip={() => setAuthPrompt(false)} />}
      {migrationOffer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 250, padding: 20, fontFamily: fontStack }}>
          <div style={{ width: "100%", maxWidth: 380, background: PANEL, border: `1px solid ${LINE}`, padding: "40px 30px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>✦</div>
            <h2 className="up" style={{ fontSize: 13, fontWeight: 400, margin: "0 0 16px" }}>Import your saved progress?</h2>
            <p style={{ color: GREY, fontSize: 11, lineHeight: 1.8, marginBottom: 24 }}>You have fits and preferences saved on this device. Want to sync them to your account?</p>
            <button className="up" onClick={migrateLocalToCloud} style={{ width: "100%", background: WHITE, color: BLACK, border: "none", padding: 14, fontSize: 11, letterSpacing: "0.15em", fontFamily: fontStack, cursor: "pointer", marginBottom: 10 }}>Yes, import everything</button>
            <button className="up" onClick={() => setMigrationOffer(false)} style={{ width: "100%", background: "transparent", color: GREY, border: `1px solid ${LINE}`, padding: 12, fontSize: 10, letterSpacing: "0.12em", fontFamily: fontStack, cursor: "pointer" }}>Skip — start fresh</button>
          </div>
        </div>
      )}

      {/* transit ticker — the signature element */}
      <div style={{ borderBottom: `1px solid ${LINE}`, overflow: "hidden", whiteSpace: "nowrap", background: PANEL }}>
        <div style={{ display: "inline-block", animation: "tick 52s linear infinite", padding: "8px 0" }}>
          {[...Array(2)].map((_, r) => (
            <span key={r} className="up" style={{ fontSize: 9, color: GREY, letterSpacing: "0.22em" }}>
              ✦ Nothing lasts. Least of all today. Dress accordingly. ✦ Everything ends. Your outfit shouldn't be the regret. ✦ Memento mori. Also, that jacket works. ✦ The void is patient. Your fit doesn't have to be boring while you wait. ✦ One day is your last. Statistically, probably not this one. Dress like it could be. ✦&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <header style={{ borderBottom: `1px solid ${LINE}`, padding: "20px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, flexWrap: "wrap", gap: 10 }}>
          <span className="up">Cosmic Closet</span>
          <span style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span className="up" style={{ color: GREY, display: "inline-flex", alignItems: "center", gap: 12 }}>
              {dateLabel}{!isToday && <span style={{ color: ACCENT }}> · ARCHIVE</span>}
              {weather?.days?.length > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderLeft: `1px solid ${LINE}`, paddingLeft: 12 }} title={weather.demo ? "Demo forecast — real weather loads on the deployed site" : `${weather.place} · ${weather.days[0].label}`}>
                  <WeatherIcon label={weather.days[0].label} />
                  <span style={{ color: WHITE, letterSpacing: "0.04em" }}>{weather.days[0].hi}°<span style={{ color: DIM }}>/{weather.days[0].lo}°</span></span>
                  {weather.demo && <span style={{ fontSize: 7, color: DIM, letterSpacing: "0.14em" }}>DEMO</span>}
                </span>
              )}
            </span>
            {view !== "today" && (
              <button className="chip up" onClick={() => setView("today")} style={{ background: "transparent", color: GREY, border: `1px solid ${LINE}`, padding: "6px 11px", fontSize: 9, fontFamily: fontStack, cursor: "pointer" }}>← Today</button>
            )}
            <button className="chip up" onClick={() => setView(view === "friends" ? "today" : "friends")} style={{ background: view === "friends" ? WHITE : "transparent", color: view === "friends" ? BLACK : WHITE, border: `1px solid ${LINE}`, padding: "6px 11px", fontSize: 9, fontFamily: fontStack, cursor: "pointer" }}>Friends</button>
            <button className="chip up" onClick={() => {
              if (!user && supabaseReady) { setAuthPrompt(true); return; }
              setView(view === "world" ? "today" : "world");
            }} style={{ background: view === "world" ? ACCENT : "transparent", color: view === "world" ? BLACK : WHITE, border: `1px solid ${view === "world" ? ACCENT : LINE}`, padding: "6px 11px", fontSize: 9, fontFamily: fontStack, cursor: "pointer" }}>World</button>
            <button className="chip up" onClick={() => {
              if (view === "profile") { setView("today"); return; }
              if (!user && supabaseReady) { setAuthPrompt(true); return; }
              setView("profile");
            }} style={{ background: view === "profile" ? WHITE : "transparent", color: view === "profile" ? BLACK : WHITE, border: `1px solid ${LINE}`, padding: "6px 11px", fontSize: 9, fontFamily: fontStack, cursor: "pointer" }}>
              {displayName ? displayName.slice(0, 12) : "Profile"}
            </button>
          </span>
        </div>
      </header>

      {view === "profile" ? (
        <ProfileView />
      ) : view === "friends" ? (
        <FriendsView />
      ) : view === "world" ? (
        <CosmicWorld />
      ) : (
      <React.Fragment>

      <section style={{ padding: "64px 24px 52px", textAlign: "center", borderBottom: `1px solid ${LINE}`, position: "relative", zIndex: 1 }}>
        <div className="up" style={{ fontSize: 10, color: GREY, marginBottom: 24 }}>What the sky says to wear</div>
        <h1 style={{ fontSize: "clamp(32px, 6.5vw, 58px)", fontWeight: 300, margin: 0, lineHeight: 1.08, letterSpacing: "-0.015em", maxWidth: 760, marginInline: "auto" }}>
          Your day has a <span style={{ fontStyle: "italic" }}>dress code</span>.
        </h1>
        <p style={{ color: GREY, fontSize: 13, lineHeight: 1.8, maxWidth: 380, margin: "24px auto 0", fontWeight: 300 }}>Pick your sign. Read the transit. Wear the energy — and do something with it.</p>
      </section>

      <main style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* profile bar */}
        {onboarded && (
          <section style={{ borderBottom: `1px solid ${LINE}`, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span className="up" style={{ fontSize: 10, color: GREY }}>{[sex || "—", weather ? `${weather.place} ${weather.tempF}°F` : (zip || "no location"), age ? `age ${age}` : "no age"].join("  ·  ")}</span>
            <button className="chip up" onClick={() => { setStep(0); setOnboarded(false); }} style={{ background: "transparent", color: WHITE, border: `1px solid ${LINE}`, padding: "7px 12px", fontSize: 9, fontFamily: fontStack }}>Edit</button>
          </section>
        )}

        {/* sign list */}
        <section style={{ borderBottom: `1px solid ${LINE}` }}>
          {sign && !signListOpen ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
              <span className="up" style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13, letterSpacing: "0.18em" }}>
                <span style={{ fontSize: 18 }}>{sign.symbol}</span>{sign.name}
                <span className="up" style={{ fontSize: 9, color: GREY, letterSpacing: "0.12em" }}>{sign.element}</span>
              </span>
              <button className="chip up" onClick={() => setSignListOpen(true)} style={{ background: "transparent", color: GREY, border: `1px solid ${LINE}`, padding: "7px 12px", fontSize: 9, fontFamily: fontStack, cursor: "pointer" }}>Change</button>
            </div>
          ) : (
            <div style={{ padding: "22px 24px 24px" }}>
              <div className="up" style={{ fontSize: 10, color: GREY, marginBottom: 14 }}>Select sign</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {SIGNS.map(s => {
                  const active = sign?.name === s.name;
                  return (
                    <button key={s.name} className="signrow" onClick={() => pick(s)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: active ? WHITE : "transparent", color: active ? BLACK : WHITE, border: `1px solid ${active ? WHITE : LINE}`, padding: "14px 6px 11px", fontFamily: fontStack, cursor: "pointer" }}>
                      <span style={{ fontSize: 22, color: active ? BLACK : WHITE }}>{s.symbol}</span>
                      <span className="up" style={{ fontSize: 10, letterSpacing: "0.14em" }}>{s.name}</span>
                      <span style={{ fontSize: 8, color: active ? DIM : GREY, letterSpacing: "0.06em" }}>{s.dates}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* history strip */}
        {sign && history.length > 0 && (
          <section style={{ borderBottom: `1px solid ${LINE}`, padding: "22px 24px" }}>
            <div className="up" style={{ fontSize: 10, color: GREY, marginBottom: 14 }}>Last 7 days · {sign.name}</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {[...Array(7)].map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (6 - i));
                const key = d.toISOString().slice(0, 10);
                const has = history.find(h => h.date === key);
                const isV = key === viewingDate;
                const dn = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                const dd = d.getDate();
                return (
                  <button key={key} className="hday up" disabled={!has && key !== todayKey()} onClick={() => pick(sign, key)}
                    style={{ flex: "1 1 0", minWidth: 38, background: isV ? WHITE : "transparent", color: isV ? BLACK : (has || key === todayKey() ? WHITE : DIM), border: `1px solid ${isV ? WHITE : LINE}`, padding: "10px 4px", fontFamily: fontStack, cursor: has || key === todayKey() ? "pointer" : "default", textAlign: "center", position: "relative" }}>
                    <div style={{ fontSize: 8, opacity: 0.7 }}>{dn}</div>
                    <div style={{ fontSize: 14, fontWeight: 300, marginTop: 2 }}>{dd}</div>
                    {key === todayKey() && <span style={{ position: "absolute", top: 5, right: 5, width: 4, height: 4, borderRadius: "50%", background: isV ? BLACK : ACCENT }} />}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* reading */}
        {sign && (
          <section style={{ padding: "44px 24px", borderBottom: `1px solid ${LINE}` }}>
            <div style={{ textAlign: "center", marginBottom: 38 }}>
              <div style={{ fontSize: 40, marginBottom: 6, color: WHITE }}>{sign.symbol}</div>
              <div className="up" style={{ fontSize: 18, letterSpacing: "0.2em" }}>{sign.name}</div>
              <div className="up" style={{ fontSize: 10, color: GREY, marginTop: 6 }}>{sign.element} · {sign.vibe}</div>
              {weather && (
                <span className="up" style={{ display: "inline-block", marginTop: 14, fontSize: 9, color: WHITE, letterSpacing: "0.12em", border: `1px solid ${LINE}`, borderRadius: 999, padding: "6px 14px" }}>
                  {weather.place} · {weather.tempF}°F · {weather.label}
                </span>
              )}
            </div>
            {loading && (
              <div aria-label="Loading reading">
                {[110, 240, 180, 280].map((w, i) => (
                  <div key={i} style={{ borderTop: `1px solid ${LINE}`, padding: "20px 0", display: "grid", gridTemplateColumns: "96px 1fr", gap: 16 }}>
                    <div className="skel" style={{ width: 56, height: 10 }} />
                    <div className="skel" style={{ width: `min(${w}px, 80%)`, height: 13 }} />
                  </div>
                ))}
              </div>
            )}
            {!loading && !reading && !isToday && (
              <p className="up" style={{ textAlign: "center", color: DIM, fontSize: 11, lineHeight: 2 }}>No reading on record for this day.<br />The archive only keeps what you opened.</p>
            )}
            {reading && !loading && (
              <div>
                {ROWS.map(([label, body]) => (
                  <div key={label} style={{ borderTop: `1px solid ${LINE}`, padding: "18px 0", display: "grid", gridTemplateColumns: "96px 1fr", gap: 16 }}>
                    <div className="up" style={{ fontSize: 10, color: GREY, paddingTop: 3 }}>{label}</div>
                    <div style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 300 }}>{body}</div>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${LINE}`, padding: "22px 0", display: "grid", gridTemplateColumns: "96px 1fr", gap: 16 }}>
                  <div className="up" style={{ fontSize: 10, color: WHITE, paddingTop: 3 }}>The Fit</div>
                  <div>
                    {reading.fitName && <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 4, letterSpacing: "0.01em" }}>{reading.fitName}</div>}
                    <div style={{ fontSize: 15, lineHeight: 1.6, color: reading.fitName ? GREY : WHITE }}>{reading.fit}</div>
                    {(() => {
                      const q = shopQuery(reading.keyword || reading.fitName || "outfit");
                      const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`;
                      return (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="up shoplink" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 9, color: ACCENT, letterSpacing: "0.12em", textDecoration: "none", border: `1px solid ${LINE}`, padding: "7px 12px", transition: "all .18s ease" }}>
                          ⌕ Shop a similar fit <span style={{ color: GREY }}>{avatarPrefs.budget || "$$"}</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
                {/* Activity — accented block */}
                <div style={{ borderTop: `1px solid ${ACCENT}`, borderBottom: `1px solid ${ACCENT}`, padding: "22px 0", display: "grid", gridTemplateColumns: "96px 1fr", gap: 16, background: "rgba(201,242,77,0.04)", paddingInline: 14, marginInline: -14 }}>
                  <div className="up" style={{ fontSize: 10, color: ACCENT, paddingTop: 3 }}>Do this</div>
                  <div style={{ fontSize: 16, lineHeight: 1.7, fontWeight: 400 }}>{reading.activity || "Move one goal forward before noon. Momentum is the whole game today."}</div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                  {(() => {
                    const eff = getEffectiveFitLog();
                    const wore = eff[viewingDate]?.wore;
                    return (
                      <button className="up" onClick={() => {
                        if (!user && supabaseReady) { setAuthPrompt(true); return; }
                        saveFitDay(viewingDate, { wore: !wore, fit: !wore ? (reading.fitName || reading.keyword || "") : (eff[viewingDate]?.fit || ""), ...(!wore ? { avatar: deriveAvatar(reading, sign), prefs: { ...avatarPrefs } } : {}) });
                      }}
                        style={{ background: wore ? ACCENT : "transparent", color: wore ? BLACK : WHITE, border: `1px solid ${wore ? ACCENT : LINE}`, padding: "11px 18px", fontSize: 10, letterSpacing: "0.14em", fontFamily: fontStack, cursor: "pointer", fontWeight: 600 }}>
                        {wore ? "✓ Wore it" : "Wore the fit?"}
                      </button>
                    );
                  })()}
                  <button className="up" onClick={() => setShowCard(true)} style={{ background: ACCENT, color: BLACK, border: "none", padding: "11px 18px", fontSize: 10, letterSpacing: "0.14em", fontFamily: fontStack, cursor: "pointer", fontWeight: 600 }}>✦ Share my reading</button>
                  {isToday && (
                    <button className="up" onClick={() => generate(sign, todayKey())} style={{ background: "transparent", color: GREY, border: `1px solid ${LINE}`, padding: "11px 16px", fontSize: 9, fontFamily: fontStack, cursor: "pointer" }}>↻ Re-read today</button>
                  )}
                </div>
                {getEffectiveStreak() > 1 && (
                  <div className="up" style={{ marginTop: 16, fontSize: 9, color: ACCENT, letterSpacing: "0.14em" }}>🔥 {getEffectiveStreak()}-day fit streak</div>
                )}
              </div>
            )}
          </section>
        )}

        {/* fit check — 8-bit preview */}
        {sign && reading && (
          <section style={{ padding: "44px 24px", borderBottom: `1px solid ${LINE}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <span className="up" style={{ fontSize: 11 }}>Fit check</span>
              <button className="chip up" onClick={() => setCustOpen(o => !o)} style={{ background: custOpen ? WHITE : "transparent", color: custOpen ? BLACK : GREY, border: `1px solid ${LINE}`, padding: "6px 11px", fontSize: 9, fontFamily: fontStack, cursor: "pointer" }}>Customize</button>
            </div>
            {custOpen && (() => {
              const openTab = custTab, setOpenTab = setCustTab;
              const tabs = [["look", "Look"], ["style", "Style"], ["scene", "Scene"]];
              const tabBtn = (id, label) => (
                <button key={id} className="up" onClick={() => setOpenTab(openTab === id ? "" : id)} style={{ flex: 1, background: openTab === id ? "rgba(244,244,240,0.06)" : "transparent", color: openTab === id ? WHITE : GREY, border: `1px solid ${openTab === id ? LINE : "transparent"}`, padding: "10px 8px", fontSize: 9, letterSpacing: "0.14em", fontFamily: fontStack, cursor: "pointer", borderBottom: openTab === id ? `1px solid ${ACCENT}` : `1px solid ${LINE}` }}>{label}</button>
              );
              const row = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };
              const lbl = { fontSize: 9, color: GREY, width: 64, letterSpacing: "0.12em" };
              const chip = (val, cur) => ({ background: val === cur ? WHITE : "transparent", color: val === cur ? BLACK : WHITE, border: `1px solid ${LINE}`, padding: "6px 10px", fontSize: 9, fontFamily: fontStack, cursor: "pointer" });
              return (
                <div style={{ border: `1px solid ${LINE}`, marginBottom: 20 }}>
                  <div style={{ display: "flex", borderBottom: `1px solid ${LINE}` }}>
                    {tabs.map(([id, label]) => tabBtn(id, label))}
                  </div>
                  <div style={{ padding: "14px 18px", display: "grid", gap: 14 }}>
                    {openTab === "look" && <>
                      <div style={row}>
                        <span className="up" style={lbl}>Skin</span>
                        {["#F8E0C8", "#F2D6B3", "#E6C39A", "#D4A574", "#C68642", "#A86B3C", "#8D5524", "#6B4220", "#5C3A21", "#3E2814"].map(c => (
                          <button key={c} onClick={() => setAvatarPref("skin", c)} aria-label={`Skin tone ${c}`} style={{ width: 22, height: 22, background: c, border: avatarPrefs.skin === c ? `2px solid ${ACCENT}` : `1px solid ${LINE}`, cursor: "pointer", padding: 0 }} />
                        ))}
                      </div>
                      <div style={row}>
                        <span className="up" style={lbl}>Hair</span>
                        {["short", "buzz", "bob", "long", "curly", "pony", "afro", "mohawk", "manbun", "waves"].map(h => (
                          <button key={h} className="chip up" onClick={() => setAvatarPref("hair", h)} style={chip(h, avatarPrefs.hair)}>{h}</button>
                        ))}
                      </div>
                      <div style={row}>
                        <span className="up" style={lbl}>Hair color</span>
                        {["#2E2620", "#5A3A22", "#8B5A2B", "#C9A55A", "#E8C87A", "#A8A8A6", "#8A8A88", "#3A3A3A", "#7A3B2E", "#9C4A3C", "#C95A8A", "#5A6BA8", "#4A8C6B", "#7A5AA8"].map(c => (
                          <button key={c} onClick={() => setAvatarPref("hairColor", c)} aria-label={`Hair color ${c}`} style={{ width: 22, height: 22, background: c, border: avatarPrefs.hairColor === c ? `2px solid ${ACCENT}` : `1px solid ${LINE}`, cursor: "pointer", padding: 0 }} />
                        ))}
                      </div>
                      <div style={row}>
                        <span className="up" style={lbl}>Glasses</span>
                        {["none", "regular", "round", "square"].map(g => (
                          <button key={g} className="chip up" onClick={() => setAvatarPref("glasses", g)} style={chip(g, avatarPrefs.glasses)}>{g}</button>
                        ))}
                      </div>
                    </>}
                    {openTab === "style" && <>
                      <div style={row}>
                        <span className="up" style={lbl}>Hat</span>
                        {["auto", "none", "cap", "trucker", "cowboy", "durag", "beanie", "skully"].map(h => (
                          <button key={h} className="chip up" onClick={() => setAvatarPref("hat", h)} style={chip(h, avatarPrefs.hat || "auto")}>{h}</button>
                        ))}
                      </div>
                      <div style={row}>
                        <span className="up" style={lbl}>Graphic</span>
                        {["none", "monogram", "cross", "crest", "stripe", "star"].map(g => (
                          <button key={g} className="chip up" onClick={() => { setAvatarPref("graphic", g); if (g === "monogram" && !avatarPrefs.initials && displayName) setAvatarPref("initials", displayName.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase()); }} style={chip(g, avatarPrefs.graphic)}>{g}</button>
                        ))}
                      </div>
                      {avatarPrefs.graphic === "monogram" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="up" style={lbl}>Initials</span>
                          <input value={avatarPrefs.initials || ""} maxLength={2} onChange={e => setAvatarPref("initials", e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2))} placeholder="CC" className="up" style={{ width: 56, background: "transparent", border: `1px solid ${LINE}`, color: WHITE, padding: "8px 10px", fontSize: 12, letterSpacing: "0.2em", fontFamily: fontStack, textAlign: "center" }} />
                        </div>
                      )}
                      <div style={row}>
                        <span className="up" style={lbl}>Carry</span>
                        {["none", "bag", "tote", "laptop", "luggage", "headphones"].map(ac => (
                          <button key={ac} className="chip up" onClick={() => setAvatarPref("accessory", ac)} style={chip(ac, avatarPrefs.accessory || "none")}>{ac}</button>
                        ))}
                      </div>
                      <div style={row}>
                        <span className="up" style={lbl}>Budget</span>
                        {[["$", "thrift"], ["$$", "mid"], ["$$$", "premium"], ["$$$$", "luxury"]].map(([sym, lbl]) => (
                          <button key={sym} className="chip up" onClick={() => { setAvatarPref("budget", sym); if (sign && !loading) generate(sign, todayKey(), sym); }} title={lbl} style={{ background: (avatarPrefs.budget || "$$") === sym ? ACCENT : "transparent", color: (avatarPrefs.budget || "$$") === sym ? BLACK : WHITE, border: `1px solid ${(avatarPrefs.budget || "$$") === sym ? ACCENT : LINE}`, padding: "6px 12px", fontSize: 11, fontFamily: fontStack, cursor: "pointer", fontWeight: 600, letterSpacing: "0.05em" }}>{sym}</button>
                        ))}
                      </div>
                      <div className="up" style={{ fontSize: 8, color: DIM, letterSpacing: "0.1em" }}>Budget restyles today's fit · $ thrift → $$$$ ultra-luxury</div>
                    </>}
                    {openTab === "scene" && <>
                      <div style={row}>
                        <span className="up" style={lbl}>Scene</span>
                        {["void", "city", "park", "beach", "room", "night", "airport", "restaurant", "club", "soccer", "court"].map(sc => (
                          <button key={sc} className="chip up" onClick={() => setAvatarPref("scene", sc)} style={chip(sc, avatarPrefs.scene || "void")}>{sc}</button>
                        ))}
                      </div>
                    </>}
                  </div>
                </div>
              );
            })()}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-block", position: "relative", background: "#0D0D10", border: `1px solid ${LINE}`, width: "min(380px, 90vw)", overflow: "hidden" }}>
                <PixelAvatar a={deriveAvatar(reading, sign)} prefs={avatarPrefs} facing={facing} sex={sex} age={parseInt(age, 10) || null} />
                {/* clickable item hotspots (front view) pinned where each item sits */}
                {facing === "front" && (() => {
                  const av = deriveAvatar(reading, sign);
                  const tierWord = { "$": "affordable", "$$": "", "$$$": "designer", "$$$$": "luxury designer" }[avatarPrefs.budget || "$$"] || "";
                  const accLabels = { bag: "shoulder bag", tote: "canvas tote bag", laptop: "laptop", luggage: "aluminum carry-on luggage", headphones: "over-ear headphones" };
                  const tierOnly = { "$": "affordable", "$$": "", "$$$": "designer", "$$$$": "luxury designer" }[avatarPrefs.budget || "$$"] || "";
                  const spots = [
                    { key: "top", label: "Top", desc: reading.fit ? reading.fit.split(/[,.]/)[0].trim() : av.top, term: av.top, gendered: true, left: "50%", top: "33%" },
                    { key: "bottom", label: "Bottom", desc: av.bottom, term: av.bottom, gendered: true, left: "50%", top: "62%" },
                    { key: "shoes", label: "Shoes", desc: av.shoes, term: av.shoes, gendered: true, left: "50%", top: "85%" },
                  ];
                  if (avatarPrefs.glasses && avatarPrefs.glasses !== "none") spots.push({ key: "eyewear", label: "Eyewear", desc: `${avatarPrefs.glasses} glasses`, term: `${avatarPrefs.glasses === "regular" ? "" : avatarPrefs.glasses} eyeglasses frames`, gendered: false, left: "50%", top: "19%" });
                  if (avatarPrefs.accessory && avatarPrefs.accessory !== "none") {
                    const isSide = ["bag", "tote", "luggage"].includes(avatarPrefs.accessory);
                    spots.push({ key: "accessory", label: "Accessory", desc: accLabels[avatarPrefs.accessory] || avatarPrefs.accessory, term: accLabels[avatarPrefs.accessory] || avatarPrefs.accessory, gendered: false, left: isSide ? "72%" : "50%", top: avatarPrefs.accessory === "headphones" ? "27%" : avatarPrefs.accessory === "laptop" ? "55%" : "62%" });
                  }
                  const choose = (z) => setHoverItem({ ...z, query: z.gendered ? shopQuery(z.term) : [tierOnly, z.term].filter(Boolean).join(" ") });
                  return spots.map(z => {
                    const active = hoverItem?.key === z.key;
                    return (
                      <button key={z.key} onClick={() => choose(z)} onMouseEnter={() => choose(z)} title={`Shop ${z.label.toLowerCase()}`} aria-label={`Shop ${z.label}`}
                        style={{ position: "absolute", left: z.left, top: z.top, transform: "translate(-50%, -50%)", width: 34, height: 22, borderRadius: 4, border: active ? `1px dashed ${ACCENT}` : "1px solid transparent", background: active ? "rgba(201,242,77,0.12)" : "transparent", cursor: "pointer", padding: 0, transition: "all .15s ease", zIndex: 3 }} />
                    );
                  });
                })()}
                <div className="up" style={{ padding: "12px 16px", borderTop: `1px solid ${LINE}`, fontSize: 9, color: ACCENT, letterSpacing: "0.18em" }}>
                  {(reading.fitName || "TODAY'S FIT").toUpperCase()}<span className="pixcursor" style={{ display: "inline-block", width: 6, height: 9, background: ACCENT, marginLeft: 5, verticalAlign: "baseline" }} />
                </div>
                <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(transparent 0 2px, rgba(0,0,0,0.22) 2px 3px)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
                <button className="chip up" aria-label="Rotate left" onClick={() => { setSpinning(false); setFacing(f => { const o = ["front", "right", "back", "left"]; return o[(o.indexOf(f) + 3) % 4]; }); }} style={{ background: "transparent", color: WHITE, border: `1px solid ${LINE}`, padding: "9px 14px", fontSize: 10, fontFamily: fontStack, cursor: "pointer" }}>◀</button>
                <button className="chip up" onClick={() => setSpinning(sp => !sp)} style={{ background: spinning ? ACCENT : "transparent", color: spinning ? BLACK : WHITE, border: `1px solid ${spinning ? ACCENT : LINE}`, padding: "9px 16px", fontSize: 9, letterSpacing: "0.12em", fontFamily: fontStack, cursor: "pointer", fontWeight: 600 }}>{spinning ? "■ Stop" : "↻ 360°"}</button>
                <button className="chip up" aria-label="Rotate right" onClick={() => { setSpinning(false); setFacing(f => { const o = ["front", "right", "back", "left"]; return o[(o.indexOf(f) + 1) % 4]; }); }} style={{ background: "transparent", color: WHITE, border: `1px solid ${LINE}`, padding: "9px 14px", fontSize: 10, fontFamily: fontStack, cursor: "pointer" }}>▶</button>
              </div>
              <div className="up" style={{ fontSize: 8, color: DIM, letterSpacing: "0.14em", marginTop: 12 }}>{facing === "front" ? "Tap an item on the fit to shop it" : `8-bit preview · ${facing} view`}</div>
              </div>

              {/* shop-similar side panel */}
              <div style={{ width: "min(220px, 90vw)", border: `1px solid ${LINE}`, background: "#0D0D10", padding: 16, minHeight: 240, alignSelf: "stretch" }}>
                {hoverItem ? (() => {
                  const shopUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(hoverItem.query)}`;
                  const imgUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(hoverItem.query)}`;
                  return (
                    <div>
                      <div className="up" style={{ fontSize: 9, color: ACCENT, letterSpacing: "0.16em", marginBottom: 10 }}>Shop this — {hoverItem.label}</div>
                      <div style={{ width: "100%", aspectRatio: "1", border: `1px solid ${LINE}`, background: "#15151A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, overflow: "hidden", position: "relative" }}>
                        <img alt={hoverItem.desc} src={`https://image.pollinations.ai/prompt/${encodeURIComponent(hoverItem.query + " product photo on white")}?width=300&height=300&nologo=true`}
                          onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                          style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "auto" }} />
                        <div style={{ display: "none", flexDirection: "column", alignItems: "center", gap: 6, color: DIM, fontSize: 9, textAlign: "center", padding: 10 }} className="up">
                          <span style={{ fontSize: 22 }}>⌕</span>preview loads on the live site
                        </div>
                      </div>
                      <div style={{ fontSize: 13, marginBottom: 4, textTransform: "capitalize" }}>{hoverItem.desc}</div>
                      <div className="up" style={{ fontSize: 9, color: GREY, marginBottom: 14 }}>{avatarPrefs.budget || "$$"} tier · similar look</div>
                      <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="up shoplink" style={{ display: "block", textAlign: "center", fontSize: 9, color: ACCENT, letterSpacing: "0.12em", textDecoration: "none", border: `1px solid ${LINE}`, padding: "10px 8px", marginBottom: 8, transition: "all .18s ease" }}>⌕ Shop similar →</a>
                      <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="up popbtn" style={{ display: "block", textAlign: "center", fontSize: 9, color: WHITE, letterSpacing: "0.12em", textDecoration: "none", border: `1px solid ${LINE}`, padding: "10px 8px", transition: "all .18s ease" }}>See more like this →</a>
                    </div>
                  );
                })() : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 200, color: DIM, textAlign: "center", gap: 10 }}>
                    <span style={{ fontSize: 26 }}>👕</span>
                    <span className="up" style={{ fontSize: 9, letterSpacing: "0.14em", lineHeight: 1.8 }}>Tap an item on the fit<br />to shop that piece</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* soundtrack */}
        {sign && reading?.playlist?.length > 0 && (
          <section style={{ padding: "44px 24px", borderBottom: `1px solid ${LINE}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span className="up" style={{ fontSize: 11 }}>The soundtrack</span>
              <span className="up" style={{ fontSize: 9, color: GREY, letterSpacing: "0.1em" }}>{reading.mood || "Today's mood"}</span>
            </div>
            <div className="up" style={{ fontSize: 9, color: DIM, marginBottom: 18, letterSpacing: "0.1em" }}>Five tracks tuned to the fit</div>
            <div>
              {reading.playlist.slice(0, 5).map((song, i) => {
                const sp = `https://open.spotify.com/search/${encodeURIComponent(song.replace(/—/g, ""))}`;
                const am = `https://music.apple.com/us/search?term=${encodeURIComponent(song.replace(/—/g, ""))}`;
                return (
                  <div key={i} className="track" style={{ display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${LINE}`, padding: "13px 10px", transition: "all .18s ease" }}>
                    <button onClick={() => togglePreview(song, i)} aria-label={playingTrack === i ? "Pause preview" : "Play 30s preview"}
                      style={{ width: 30, height: 30, flexShrink: 0, background: playingTrack === i ? ACCENT : "transparent", color: playingTrack === i ? BLACK : WHITE, border: `1px solid ${playingTrack === i ? ACCENT : LINE}`, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: fontStack, padding: 0 }}>
                      {previewState[i] === "loading" ? <span className="skel" style={{ width: 8, height: 8, borderRadius: "50%" }} />
                        : previewState[i] === "error" ? <span style={{ fontSize: 7, letterSpacing: "0.05em" }}>n/a</span>
                        : playingTrack === i ? (
                          <span style={{ display: "inline-flex", gap: 2, alignItems: "flex-end", height: 11 }}>
                            {[0, 1, 2].map(k => <span key={k} className="eqb" style={{ animationDelay: `${k * 0.16}s` }} />)}
                          </span>
                        ) : "▶"}
                    </button>
                    <span style={{ fontSize: 12, color: DIM, width: 18, fontFamily: fontStack }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ flex: 1, fontSize: 14, letterSpacing: "0.02em" }}>{song}</span>
                    <a className="chip up" href={sp} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, color: "inherit", border: `1px solid ${LINE}`, padding: "6px 10px", textDecoration: "none", letterSpacing: "0.12em", fontFamily: fontStack }}>Spotify</a>
                    <a className="chip up" href={am} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, color: "inherit", border: `1px solid ${LINE}`, padding: "6px 10px", textDecoration: "none", letterSpacing: "0.12em", fontFamily: fontStack }}>Apple</a>
                  </div>
                );
              })}
            </div>
            <a className="up popbtn" href={`https://open.spotify.com/search/${encodeURIComponent((reading.mood || "") + " " + (reading.fitName || ""))}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 18, fontSize: 10, color: WHITE, border: `1px solid ${LINE}`, padding: "12px 18px", textDecoration: "none", letterSpacing: "0.14em", fontFamily: fontStack, transition: "all .18s ease" }}>
              ♪ Find the full vibe on Spotify →
            </a>
          </section>
        )}

        {/* board */}
        {sign && reading && (
          <section style={{ padding: "44px 24px" }}>
            <div style={{ marginBottom: 20 }}>
              <span className="up" style={{ fontSize: 11 }}>Find the look</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {Array.from(new Set([reading?.keyword, ...(reading?.alts?.length ? reading.alts : themes)].filter(Boolean))).map((t, i) => (
                <button key={i} className="chip up" onClick={() => setQuery(t)} style={{ background: query === t ? WHITE : "transparent", color: query === t ? BLACK : WHITE, border: `1px solid ${LINE}`, padding: "7px 12px", fontSize: 10, fontFamily: fontStack, cursor: "pointer" }}>{t}</button>
              ))}
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="SEARCH A LOOK…" className="up" style={{ width: "100%", background: "transparent", border: `1px solid ${LINE}`, color: WHITE, padding: "13px 16px", fontSize: 11, letterSpacing: "0.12em", fontFamily: fontStack, marginBottom: 20 }} />
            <div style={{ display: "grid", gap: 8 }}>
              {(() => {
                const shopUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(shopQuery(query))}`;
                return [["Shop similar " + (avatarPrefs.budget || "$$"), shopUrl], ["Search on Pinterest", pinterestUrl], ["Search on TikTok", tiktokUrl], ["Search on Instagram", instagramUrl]];
              })().map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="up popbtn"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: WHITE, background: "transparent", border: `1px solid ${LINE}`, padding: "15px 16px", textDecoration: "none", letterSpacing: "0.15em" }}>
                  {label}<span>→</span>
                </a>
              ))}
            </div>
            <p className="up" style={{ color: DIM, fontSize: 9, textAlign: "center", marginTop: 18, lineHeight: 2 }}>Opens "{query}" on each platform in a new tab</p>
          </section>
        )}

        {!sign && <div className="up" style={{ textAlign: "center", color: DIM, padding: "64px 24px", fontSize: 11 }}>Select a sign to read the day</div>}
      </main>
      </React.Fragment>
      )}
    </div>
  );

  // ---------- Cosmic World — multiplayer rooms ----------
  function CosmicWorld() {
    const COLS = 10, ROWS = 7;
    const ROOMS = {
      studio: { name: "Streetwear Studio", wall: "linear-gradient(180deg, #3D3B6D 0%, #2E2B55 100%)", floor1: "#4A4670", floor2: "#3E3A62", accent: "#C9F24D", wallBase: "#5A5690" },
      bedroom: { name: "The Bedroom", wall: "linear-gradient(180deg, #5A3A5E 0%, #3E2844 100%)", floor1: "#584068", floor2: "#4A3458", accent: "#E8A0E8", wallBase: "#6A4A70" },
      rooftop: { name: "Rooftop Lounge", wall: "linear-gradient(180deg, #1A2848 0%, #0E1A30 100%)", floor1: "#3A4A5A", floor2: "#2E3E4E", accent: "#6AE4FF", wallBase: "#4A5A6A" },
      gameroom: { name: "Game Room", wall: "linear-gradient(180deg, #2A1A1A 0%, #1A1218 100%)", floor1: "#2A3828", floor2: "#223020", accent: "#FFD700", wallBase: "#4A3A2A" },
    };
    const [room, setRoom] = useState("studio");
    const [myPos, setMyPos] = useState({ x: 4, y: 3 });
    const [others, setOthers] = useState({});
    const [chatMsg, setChatMsg] = useState("");
    const [chatBubbles, setChatBubbles] = useState({});
    const [chatLog, setChatLog] = useState([]);
    const [myFacing, setMyFacing] = useState("front");
    const channelRef = useRef(null);
    const worldRef = useRef(null);
    const R = ROOMS[room];

    const myName = displayName || user?.email?.split("@")[0] || "Anon";
    const myAvatar = reading && sign ? deriveAvatar(reading, sign) : { top: "tee", topColor: "#444", bottom: "jeans", bottomColor: "#2A3A5A", shoes: "sneakers", shoeColor: "#222" };

    // Pixel furniture — SVG pixel blocks
    const P = (x, y, w, h, fill) => <rect key={`${x}${y}${fill}`} x={x} y={y} width={w} height={h} fill={fill} />;
    function PxF({ children, vw, vh }) { return <svg viewBox={`0 0 ${vw} ${vh}`} style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">{children}</svg>; }

    function FCouch({ c = "#6A5ACD" }) { const dk = "#"+Math.max(0,parseInt(c.slice(1),16)-0x151515).toString(16).padStart(6,"0"); const lt = "#"+Math.min(0xFFFFFF,parseInt(c.slice(1),16)+0x202020).toString(16).padStart(6,"0"); return <PxF vw={40} vh={24}>{P(1,20,3,4,"#2A2A2A")}{P(36,20,3,4,"#2A2A2A")}{P(0,8,40,12,c)}{P(0,4,5,16,c)}{P(35,4,5,16,c)}{P(5,2,30,6,lt)}{P(6,9,12,8,dk)}{P(22,9,12,8,dk)}{P(8,4,5,3,"#E06")}{P(27,4,5,3,"#4AF")}</PxF>; }
    function FTable() { return <PxF vw={32} vh={20}>{P(2,0,28,3,"#5A4A3A")}{P(2,0,28,1,"#7A6A5A")}{P(3,3,2,17,"#4A3A2A")}{P(27,3,2,17,"#4A3A2A")}{P(2,18,28,2,"#4A3A2A")}{P(10,1,4,1,"#333")}{P(18,1,4,1,"#333")}</PxF>; }
    function FRack() { return <PxF vw={32} vh={36}>{P(2,0,2,36,"#888")}{P(28,0,2,36,"#888")}{P(4,1,24,2,"#AAA")}{P(7,4,4,12,"#C9F24D")}{P(7,4,1,3,"#9AB830")}{P(13,4,4,16,"#E06")}{P(13,4,1,4,"#A04040")}{P(19,4,4,10,"#4AF")}{P(19,4,1,3,"#3080C0")}{P(25,4,3,14,"#FFA")}{P(25,4,1,3,"#CC8800")}</PxF>; }
    function FMirror() { return <PxF vw={16} vh={32}>{P(2,0,12,28,"#5A5A7A")}{P(3,1,10,26,"#3A3A5A")}{P(4,2,3,8,"rgba(255,255,255,0.08)")}{P(5,28,6,4,"#4A4A5A")}</PxF>; }
    function FSneakers() { return <PxF vw={32} vh={28}>{P(0,0,32,28,"#5A5060")}{P(1,1,30,26,"#3A3040")}{P(1,9,30,1,"#5A5060")}{P(1,18,30,1,"#5A5060")}{P(3,3,8,5,"#E06")}{P(14,3,8,5,"#FFF")}{P(25,3,5,4,"#C9F24D")}{P(3,11,8,5,"#333")}{P(14,11,8,5,"#4AF")}{P(25,12,5,4,"#F90")}{P(3,20,8,5,"#FFA")}{P(14,20,8,5,"#E8A0E8")}{P(25,21,5,4,"#2A2A2A")}</PxF>; }
    function FDJ() { return <PxF vw={40} vh={28}>{P(0,8,40,20,"#2A2A3A")}{P(0,8,40,3,"#3A3A4A")}{P(2,12,16,14,"#1A1A2A")}{P(6,16,8,8,"#333")}{P(9,19,2,2,R.accent)}{P(22,12,16,6,"#1A1A2A")}{P(24,14,3,3,"#E06")}{P(29,14,3,3,"#4AF")}{P(34,14,3,3,"#C9F24D")}{P(22,20,16,6,"#222")}{P(24,22,12,1,"#444")}{P(24,24,12,1,"#444")}</PxF>; }
    function FBed({ c = "#6A4A7A" }) { const dk = "#"+Math.max(0,parseInt(c.slice(1),16)-0x1A1A1A).toString(16); return <PxF vw={48} vh={24}>{P(0,0,48,8,c)}{P(1,2,12,4,"#E8E0D0")}{P(16,2,12,4,"#D8D0C0")}{P(0,8,48,14,dk)}{P(0,8,48,2,c)}{P(0,20,4,4,"#2A2A2A")}{P(44,20,4,4,"#2A2A2A")}</PxF>; }
    function FPlant() { return <PxF vw={16} vh={24}>{P(4,16,8,8,"#8A5A3A")}{P(5,16,6,1,"#A06A4A")}{P(4,6,8,10,"#3A8A3A")}{P(3,8,2,6,"#2A7A2A")}{P(11,7,2,6,"#2A7A2A")}{P(5,3,6,5,"#4AAA4A")}{P(7,1,3,3,"#5ABA5A")}{P(8,1,1,1,R.accent)}</PxF>; }
    function FBar() { return <PxF vw={48} vh={20}>{P(0,6,48,14,"#5A5060")}{P(0,4,48,4,"#7A7090")}{P(0,2,48,3,"#6A6080")}{P(4,0,3,3,"#6AE4FF")}{P(12,0,3,4,"#E8A0E8")}{P(20,0,3,3,"#C9F24D")}{P(28,0,3,3,"#E06")}{P(36,0,3,4,"#FFA")}{P(2,10,8,8,"#4A4050")}{P(14,10,8,8,"#4A4050")}{P(26,10,8,8,"#4A4050")}{P(38,10,8,8,"#4A4050")}</PxF>; }
    function FLamp() { return <PxF vw={12} vh={28}>{P(5,0,2,4,"#FFA")}{P(3,0,6,2,"#FFC")}{P(5,4,2,20,"#888")}{P(3,24,6,2,"#666")}{P(4,22,4,2,"#777")}</PxF>; }
    function FTV() { return <PxF vw={28} vh={20}>{P(0,0,28,16,"#2A2A2A")}{P(1,1,26,14,"#1A1A3A")}{P(2,2,8,4,"#E06")}{P(12,3,6,3,"#4AF")}{P(20,2,6,5,"#C9F24D")}{P(4,8,20,5,"#2A2A4A")}{P(10,16,8,4,"#333")}{P(8,18,12,2,"#444")}</PxF>; }
    function FRug() { return <PxF vw={40} vh={24}>{P(0,0,40,24,R.accent+"18")}{P(1,1,38,22,R.accent+"10")}{P(2,2,36,20,R.accent+"0C")}{P(4,4,32,16,R.accent+"08")}</PxF>; }
    function FStool() { return <PxF vw={12} vh={16}>{P(2,0,8,4,"#5A4A3A")}{P(2,0,8,1,"#7A6A5A")}{P(3,4,2,12,"#4A3A2A")}{P(7,4,2,12,"#4A3A2A")}</PxF>; }
    function FChair() { return <PxF vw={16} vh={24}>{P(2,6,12,4,"#5A5ACD")}{P(2,6,12,1,"#7A7AED")}{P(2,0,12,8,"#6A6ADA")}{P(3,10,2,14,"#3A3A3A")}{P(11,10,2,14,"#3A3A3A")}</PxF>; }
    function FStars() { return <PxF vw={100} vh={40}>{[...Array(30)].map((_,i)=><circle key={i} cx={(i*37+5)%100} cy={(i*23+3)%40} r={i%5===0?1.5:0.7} fill={i%4===0?"#C9F24D":"#FFF"} opacity={i%3===0?0.8:0.25}/>)}<circle cx="85" cy="8" r="5" fill="#FFF" opacity="0.12"/><circle cx="82" cy="6" r="1.5" fill="#FFF" opacity="0.3"/></PxF>; }
    function FGameTable({ game }) {
      const colors = { tictactoe: "#E06", connect4: "#4AF", chess: "#FFD700", poker: "#1DB954" };
      const c = colors[game] || "#FFD700";
      return <PxF vw={32} vh={24}>
        {P(4,0,24,4,c)}{P(4,0,24,1,"#FFF")}{P(5,1,22,2,c)}
        {P(6,4,20,14,"#2A1A0A")}{P(7,5,18,12,"#1A1208")}
        {game === "tictactoe" && <>{P(12,7,1,8,"#555")}{P(18,7,1,8,"#555")}{P(9,10,12,1,"#555")}{P(9,13,12,1,"#555")}</>}
        {game === "connect4" && <>{[0,1,2,3,4,5].map(i=><>{P(9+i*3,7,2,2,"#224")}{P(9+i*3,11,2,2,"#224")}{P(9+i*3,15,2,2,"#224")}</>)}</>}
        {P(6,18,4,6,"#3A2A1A")}{P(22,18,4,6,"#3A2A1A")}
      </PxF>;
    }

    // Room furniture layouts — packed with items
    const [interacting, setInteracting] = useState(null); // { type, data }
    const FURNITURE = {
      studio: [
        { x: 0, y: 0, w: 3, h: 1, comp: <FCouch c="#6A5ACD" /> },
        { x: 4, y: 0, w: 1, h: 1, comp: <FTable /> },
        { x: 6, y: 0, w: 2, h: 1, comp: <FSneakers /> },
        { x: 8, y: 0, w: 2, h: 2, comp: <FRack /> },
        { x: 0, y: 2, w: 1, h: 2, comp: <FMirror /> },
        { x: 3, y: 2, w: 4, h: 2, comp: <FRug /> },
        { x: 5, y: 2, w: 1, h: 1, comp: <FTable /> },
        { x: 3, y: 3, w: 1, h: 1, comp: <FChair /> },
        { x: 6, y: 3, w: 1, h: 1, comp: <FChair /> },
        { x: 9, y: 3, w: 1, h: 1, comp: <FPlant /> },
        { x: 3, y: 5, w: 2, h: 1, comp: <FDJ />, action: "dj" },
        { x: 6, y: 5, w: 2, h: 1, comp: <FTV /> },
        { x: 0, y: 6, w: 1, h: 1, comp: <FPlant /> },
        { x: 9, y: 6, w: 1, h: 1, comp: <FLamp /> },
        { x: 1, y: 5, w: 1, h: 1, comp: <FStool /> },
      ],
      bedroom: [
        { x: 0, y: 0, w: 3, h: 1, comp: <FBed c="#6A4A7A" /> },
        { x: 4, y: 0, w: 1, h: 1, comp: <FLamp /> },
        { x: 6, y: 0, w: 2, h: 1, comp: <FCouch c="#7A4A8A" /> },
        { x: 9, y: 0, w: 1, h: 1, comp: <FPlant /> },
        { x: 0, y: 2, w: 1, h: 2, comp: <FMirror /> },
        { x: 8, y: 2, w: 2, h: 1, comp: <FSneakers /> },
        { x: 3, y: 3, w: 4, h: 2, comp: <FRug /> },
        { x: 4, y: 3, w: 1, h: 1, comp: <FTable /> },
        { x: 5, y: 4, w: 1, h: 1, comp: <FChair /> },
        { x: 0, y: 5, w: 2, h: 1, comp: <FTV /> },
        { x: 9, y: 5, w: 1, h: 1, comp: <FLamp /> },
        { x: 0, y: 6, w: 1, h: 1, comp: <FPlant /> },
        { x: 3, y: 6, w: 2, h: 1, comp: <FRack /> },
      ],
      rooftop: [
        { x: 0, y: 0, w: 3, h: 1, comp: <FBar /> },
        { x: 3, y: 0, w: 1, h: 1, comp: <FStool /> },
        { x: 4, y: 0, w: 1, h: 1, comp: <FStool /> },
        { x: 7, y: 0, w: 2, h: 1, comp: <FCouch c="#4A6A7A" /> },
        { x: 0, y: 2, w: 1, h: 1, comp: <FPlant /> },
        { x: 9, y: 2, w: 1, h: 1, comp: <FPlant /> },
        { x: 3, y: 3, w: 4, h: 2, comp: <FRug /> },
        { x: 4, y: 3, w: 2, h: 1, comp: <FDJ />, action: "dj" },
        { x: 4, y: 4, w: 1, h: 1, comp: <FStool /> },
        { x: 5, y: 4, w: 1, h: 1, comp: <FStool /> },
        { x: 0, y: 5, w: 2, h: 1, comp: <FTable /> },
        { x: 1, y: 5, w: 1, h: 1, comp: <FStool /> },
        { x: 8, y: 5, w: 2, h: 1, comp: <FTable /> },
        { x: 0, y: 6, w: 1, h: 1, comp: <FLamp /> },
        { x: 9, y: 6, w: 1, h: 1, comp: <FLamp /> },
      ],
      gameroom: [
        // Row 1: Tic Tac Toe + Connect 4
        { x: 0, y: 0, w: 1, h: 1, comp: <FLamp /> },
        { x: 1, y: 0, w: 2, h: 1, comp: <FGameTable game="tictactoe" />, action: "game", game: "tictactoe" },
        { x: 0, y: 1, w: 1, h: 1, comp: <FStool /> },
        { x: 3, y: 1, w: 1, h: 1, comp: <FStool /> },
        { x: 6, y: 0, w: 2, h: 1, comp: <FGameTable game="connect4" />, action: "game", game: "connect4" },
        { x: 5, y: 1, w: 1, h: 1, comp: <FStool /> },
        { x: 8, y: 1, w: 1, h: 1, comp: <FStool /> },
        { x: 9, y: 0, w: 1, h: 1, comp: <FLamp /> },
        // Row 2: Blackjack + Slots
        { x: 1, y: 3, w: 2, h: 1, comp: <FGameTable game="poker" />, action: "game", game: "blackjack" },
        { x: 0, y: 4, w: 1, h: 1, comp: <FStool /> },
        { x: 3, y: 4, w: 1, h: 1, comp: <FStool /> },
        { x: 6, y: 3, w: 2, h: 1, comp: <FGameTable game="chess" />, action: "game", game: "slots" },
        { x: 5, y: 4, w: 1, h: 1, comp: <FStool /> },
        { x: 8, y: 4, w: 1, h: 1, comp: <FStool /> },
        // Row 3: Pac-Man arcade + decor
        { x: 4, y: 6, w: 2, h: 1, comp: <FTV />, action: "game", game: "pacman" },
        { x: 0, y: 6, w: 1, h: 1, comp: <FPlant /> },
        { x: 9, y: 6, w: 1, h: 1, comp: <FPlant /> },
      ],
    };

    // Check for interactions when player moves onto furniture
    useEffect(() => {
      const furn = (FURNITURE[room] || []);
      const hit = furn.find(f => f.action && myPos.x >= f.x && myPos.x < f.x + f.w && myPos.y >= f.y && myPos.y < f.y + f.h);
      if (hit?.action === "dj" && reading?.playlist) {
        if (!interacting || interacting.type !== "dj") setInteracting({ type: "dj", playlist: reading.playlist });
        if (wanderInterval.current) { clearInterval(wanderInterval.current); wanderInterval.current = null; }
        if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null; }
      } else if (hit?.action === "game") {
        if (!interacting || interacting.game !== hit.game) setInteracting({ type: "game", game: hit.game });
        if (wanderInterval.current) { clearInterval(wanderInterval.current); wanderInterval.current = null; }
        if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null; }
      } else if (interacting) {
        setInteracting(null);
        resetIdle();
      }
    }, [myPos.x, myPos.y, room]);

    // Realtime presence per room
    useEffect(() => {
      if (!supabaseReady || !user || !supabase) return;
      const ch = supabase.channel(`world-${room}`, { config: { presence: { key: user.id } } });
      channelRef.current = ch;
      ch.on("presence", { event: "sync" }, () => {
        const state = ch.presenceState();
        const o = {};
        for (const [uid, arr] of Object.entries(state)) { if (uid !== user.id && arr[0]) o[uid] = arr[0]; }
        setOthers(o);
      });
      ch.on("broadcast", { event: "chat" }, ({ payload }) => {
        setChatBubbles(prev => ({ ...prev, [payload.uid]: { text: payload.text, t: Date.now() } }));
        setChatLog(prev => [...prev.slice(-50), { name: payload.name, text: payload.text, t: Date.now() }]);
      });
      ch.subscribe(async (status) => {
        if (status === "SUBSCRIBED") await ch.track({ x: myPos.x, y: myPos.y, name: myName, facing: "front", avatar: myAvatar, prefs: avatarPrefs, sex, age });
      });
      return () => { ch.unsubscribe(); };
    }, [user, room]);

    useEffect(() => {
      if (channelRef.current && user) channelRef.current.track({ x: myPos.x, y: myPos.y, name: myName, facing: myFacing, avatar: myAvatar, prefs: avatarPrefs, sex, age });
    }, [myPos, myFacing]);

    useEffect(() => {
      function onKey(e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        let dx = 0, dy = 0, f = myFacing;
        if (e.key === "ArrowUp" || e.key === "w") { dy = -1; f = "back"; }
        if (e.key === "ArrowDown" || e.key === "s") { dy = 1; f = "front"; }
        if (e.key === "ArrowLeft" || e.key === "a") { dx = -1; f = "left"; }
        if (e.key === "ArrowRight" || e.key === "d") { dx = 1; f = "right"; }
        if (dx || dy) { e.preventDefault(); resetIdle(); setMyPos(p => ({ x: Math.max(0, Math.min(COLS - 1, p.x + dx)), y: Math.max(0, Math.min(ROWS - 1, p.y + dy)) })); setMyFacing(f); }
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [myFacing]);

    // Idle wandering — auto-move after 30s of no input
    const idleTimer = useRef(null);
    const wanderInterval = useRef(null);
    const isIdle = useRef(false);

    function resetIdle() {
      isIdle.current = false;
      if (wanderInterval.current) { clearInterval(wanderInterval.current); wanderInterval.current = null; }
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        isIdle.current = true;
        wanderInterval.current = setInterval(() => {
          const dirs = [{ dx: 1, f: "right" }, { dx: -1, f: "left" }, { dy: 1, f: "front" }, { dy: -1, f: "back" }];
          const d = dirs[Math.floor(Math.random() * dirs.length)];
          setMyPos(p => ({ x: Math.max(0, Math.min(COLS - 1, p.x + (d.dx || 0))), y: Math.max(0, Math.min(ROWS - 1, p.y + (d.dy || 0))) }));
          setMyFacing(d.f);
        }, 2000);
      }, 30000);
    }

    useEffect(() => { resetIdle(); return () => { if (idleTimer.current) clearTimeout(idleTimer.current); if (wanderInterval.current) clearInterval(wanderInterval.current); }; }, []);

    function handleTap(e) {
      resetIdle();
      const floorEl = e.currentTarget;
      const rect = floorEl.getBoundingClientRect();
      const cx = Math.max(0, Math.min(COLS - 1, Math.floor((e.clientX - rect.left) / (rect.width / COLS))));
      const cy = Math.max(0, Math.min(ROWS - 1, Math.floor((e.clientY - rect.top) / (rect.height / ROWS))));
      if (cx !== myPos.x || cy !== myPos.y) {
        if (cx > myPos.x) setMyFacing("right"); else if (cx < myPos.x) setMyFacing("left");
        else if (cy > myPos.y) setMyFacing("front"); else setMyFacing("back");
        setMyPos({ x: cx, y: cy });
      }
    }

    function sendChat() {
      if (!chatMsg.trim() || !channelRef.current) return;
      channelRef.current.send({ type: "broadcast", event: "chat", payload: { uid: user.id, name: myName, text: chatMsg.trim() } });
      setChatBubbles(prev => ({ ...prev, [user.id]: { text: chatMsg.trim(), t: Date.now() } }));
      setChatLog(prev => [...prev.slice(-50), { name: myName, text: chatMsg.trim(), t: Date.now() }]);
      setChatMsg("");
    }

    function switchRoom(r) { setRoom(r); setMyPos({ x: 4, y: 3 }); setOthers({}); setChatLog([]); setChatBubbles({}); }

    useEffect(() => {
      const iv = setInterval(() => { setChatBubbles(prev => { const now = Date.now(); const n = {}; for (const [k, v] of Object.entries(prev)) { if (now - v.t < 5000) n[k] = v; } return n; }); }, 1000);
      return () => clearInterval(iv);
    }, []);

    const allPlayers = [
      { uid: user?.id, x: myPos.x, y: myPos.y, name: myName, facing: myFacing, avatar: myAvatar, prefs: avatarPrefs, isMe: true },
      ...Object.entries(others).map(([uid, p]) => ({ uid, x: p.x, y: p.y, name: p.name, facing: p.facing || "front", avatar: p.avatar, prefs: p.prefs || {}, sex: p.sex, age: p.age, isMe: false }))
    ].sort((a, b) => a.y - b.y);

    const fld = { width: "100%", background: "transparent", border: `1px solid ${LINE}`, color: WHITE, padding: 10, fontSize: 11, fontFamily: fontStack, letterSpacing: "0.04em" };
    const furniture = FURNITURE[room] || [];

    // DJ Panel with Spotify 30-second previews
    function DJPanel({ playlist, accent }) {
      const [tracks, setTracks] = useState([]);
      const [loading, setLoading] = useState(true);
      const [playing, setPlaying] = useState(null);
      const audioRef = useRef(null);

      useEffect(() => {
        let cancelled = false;
        (async () => {
          setLoading(true);
          try {
            const res = await fetch("/api/spotify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tracks: playlist.slice(0, 5) }),
            });
            const data = await res.json();
            if (!cancelled && data.results) { setTracks(data.results); }
          } catch {}
          if (!cancelled) setLoading(false);
        })();
        return () => { cancelled = true; };
      }, [playlist.join(",")]);

      function togglePlay(idx) {
        const t = tracks[idx];
        if (!t?.preview_url) return;
        if (playing === idx) {
          audioRef.current?.pause();
          setPlaying(null);
        } else {
          if (audioRef.current) audioRef.current.pause();
          const a = new Audio(t.preview_url);
          a.volume = 0.5;
          a.play();
          a.onended = () => setPlaying(null);
          audioRef.current = a;
          setPlaying(idx);
        }
      }

      useEffect(() => { return () => { if (audioRef.current) audioRef.current.pause(); }; }, []);

      return (
        <div style={{ padding: "16px 24px", borderTop: `2px solid ${accent}`, background: "rgba(0,0,0,0.4)" }}>
          <div className="up" style={{ fontSize: 11, color: accent, marginBottom: 12, letterSpacing: "0.16em" }}>🎧 DJ Booth — Your Playlist</div>
          {loading ? (
            <div style={{ display: "flex", gap: 8 }}>{[1,2,3].map(i => <div key={i} className="skel" style={{ height: 48, flex: 1 }} />)}</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {tracks.map((t, i) => {
                const searchUrl = `https://open.spotify.com/search/${encodeURIComponent((t.query || "").replace(/—/g, ""))}`;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: playing === i ? `${accent}15` : "rgba(255,255,255,0.04)", border: `1px solid ${playing === i ? accent : LINE}`, padding: "8px 12px", transition: "all .15s" }}>
                    {t.found && t.image ? (
                      <img src={t.image} alt="" style={{ width: 40, height: 40, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>♪</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: WHITE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.found ? t.name : t.query}</div>
                      <div style={{ fontSize: 10, color: GREY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.found ? t.artist : "Tap to search on Spotify"}</div>
                    </div>
                    {t.found && t.preview_url ? (
                      <button onClick={() => togglePlay(i)} style={{ background: playing === i ? accent : "#1DB954", color: playing === i ? BLACK : WHITE, border: "none", width: 36, height: 36, fontSize: 16, cursor: "pointer", fontFamily: fontStack, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{playing === i ? "■" : "▶"}</button>
                    ) : (
                      <a href={t.found ? (t.spotify_url || searchUrl) : searchUrl} target="_blank" rel="noopener noreferrer" style={{ color: WHITE, fontSize: 9, textDecoration: "none", background: "#1DB954", padding: "8px 12px", fontFamily: fontStack, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0, fontWeight: 600 }}>Play</a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="up" style={{ fontSize: 8, color: DIM, marginTop: 10, letterSpacing: "0.1em" }}>Walk onto the DJ booth to play · Walk away to stop</div>
        </div>
      );
    }

    // Game Panel — Tic Tac Toe & Connect 4
    function GamePanel({ game, accent }) {
      const NAMES = { tictactoe: "Tic Tac Toe", connect4: "Connect 4", blackjack: "Blackjack", slots: "Slots", pacman: "Pac-Man" };
      const [credits, setCredits] = useState(100);
      const [bet, setBet] = useState(10);
      const [betPlaced, setBetPlaced] = useState(false);
      const [gState, setGState] = useState(null); // game-specific state

      useEffect(() => { if (user && cloudProfile?.credits != null) setCredits(cloudProfile.credits); }, [cloudProfile]);
      useEffect(() => { setGState(null); setBetPlaced(false); }, [game]);

      async function saveCredits(n) { setCredits(n); if (user) try { await upsertProfile(user.id, { credits: n }); } catch {} }
      function placeBet() { if (bet > credits || bet < 1) return; saveCredits(credits - bet); setBetPlaced(true); }

      const cellBtn = { border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)", cursor: "pointer", fontFamily: fontStack, display: "flex", alignItems: "center", justifyContent: "center" };
      const needsBet = ["blackjack", "slots", "tictactoe", "connect4"].includes(game);

      // ---- Tic Tac Toe ----
      function TTT() {
        const [board, setBoard] = useState(Array(9).fill(null));
        const [isX, setIsX] = useState(true);
        const [winner, setWinner] = useState(null);
        const check = b => { const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; for(const[a,c,d]of L){if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];}return b.every(Boolean)?"draw":null; };
        const play = i => { if(board[i]||winner)return; const n=[...board];n[i]=isX?"X":"O";setBoard(n);setIsX(!isX); const w=check(n); if(w){setWinner(w);if(betPlaced){if(w==="X")saveCredits(credits+bet*2);else if(w==="draw")saveCredits(credits+bet);}} };
        return <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,maxWidth:240,margin:"0 auto"}}>{board.map((c,i)=><button key={i} onClick={()=>play(i)} style={{...cellBtn,aspectRatio:"1",fontSize:28,color:c==="X"?"#E06":"#4AF",fontWeight:700}}>{c||""}</button>)}</div>
          <div className="up" style={{textAlign:"center",marginTop:12,fontSize:10,color:winner?accent:GREY}}>{winner?(winner==="draw"?"Draw!":`${winner} wins!${betPlaced&&winner==="X"?` +${bet*2} 💰`:""}`):`${isX?"X":"O"}'s turn`}
          {winner&&<><br/><button className="up" onClick={()=>{setBoard(Array(9).fill(null));setIsX(true);setWinner(null);setBetPlaced(false);}} style={{background:accent,color:BLACK,border:"none",padding:"8px 20px",fontSize:10,fontFamily:fontStack,cursor:"pointer",marginTop:8}}>Again</button></>}</div>
        </div>;
      }

      // ---- Connect 4 ----
      function C4() {
        const [board, setBoard] = useState(Array(42).fill(null));
        const [isR, setIsR] = useState(true);
        const [winner, setWinner] = useState(null);
        const check = b => { const at=(r,c)=>(r>=0&&r<6&&c>=0&&c<7)?b[r*7+c]:null; for(let r=0;r<6;r++)for(let c=0;c<7;c++){const v=at(r,c);if(!v)continue;if(c+3<7&&v===at(r,c+1)&&v===at(r,c+2)&&v===at(r,c+3))return v;if(r+3<6&&v===at(r+1,c)&&v===at(r+2,c)&&v===at(r+3,c))return v;if(r+3<6&&c+3<7&&v===at(r+1,c+1)&&v===at(r+2,c+2)&&v===at(r+3,c+3))return v;if(r+3<6&&c-3>=0&&v===at(r+1,c-1)&&v===at(r+2,c-2)&&v===at(r+3,c-3))return v;}return b.every(Boolean)?"draw":null; };
        const drop = col => { if(winner)return; let row=-1; for(let r=5;r>=0;r--){if(!board[r*7+col]){row=r;break;}} if(row===-1)return; const n=[...board];n[row*7+col]=isR?"R":"Y";setBoard(n);setIsR(!isR); const w=check(n); if(w){setWinner(w);if(betPlaced){if(w==="R")saveCredits(credits+bet*2);else if(w==="draw")saveCredits(credits+bet);}} };
        return <div style={{maxWidth:300,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
            {[...Array(7)].map((_,c)=><button key={c} onClick={()=>drop(c)} style={{background:"transparent",color:isR?"#E06":"#FFD700",border:`1px solid ${LINE}`,padding:4,fontSize:10,fontFamily:fontStack,cursor:"pointer"}}>▼</button>)}
            {board.map((cell,i)=><div key={i} style={{aspectRatio:"1",background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{cell&&<div style={{width:"75%",height:"75%",borderRadius:"50%",background:cell==="R"?"#E06":"#FFD700"}}/>}</div>)}
          </div>
          <div className="up" style={{textAlign:"center",marginTop:12,fontSize:10,color:winner?accent:GREY}}>{winner?(winner==="draw"?"Draw!":`${winner} wins!`):`${isR?"Red":"Yellow"}'s turn`}
          {winner&&<><br/><button className="up" onClick={()=>{setBoard(Array(42).fill(null));setIsR(true);setWinner(null);setBetPlaced(false);}} style={{background:accent,color:BLACK,border:"none",padding:"8px 20px",fontSize:10,fontFamily:fontStack,cursor:"pointer",marginTop:8}}>Again</button></>}</div>
        </div>;
      }

      // ---- Blackjack ----
      function BJ() {
        const deck = () => { const suits=["♠","♥","♦","♣"]; const vals=["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const d=[]; for(const s of suits)for(const v of vals)d.push({s,v,n:v==="A"?11:["J","Q","K"].includes(v)?10:parseInt(v)}); for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];} return d; };
        const [d, setD] = useState(deck);
        const [pi, setPi] = useState(0);
        const [player, setPlayer] = useState([]);
        const [dealer, setDealer] = useState([]);
        const [phase, setPhase] = useState("deal"); // deal, player, dealer, done
        const [result, setResult] = useState("");

        const score = hand => { let t=hand.reduce((a,c)=>a+c.n,0); let aces=hand.filter(c=>c.v==="A").length; while(t>21&&aces>0){t-=10;aces--;} return t; };
        const cardStyle = { display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:44,height:62,background:WHITE,color:BLACK,borderRadius:4,fontFamily:fontStack,fontSize:14,fontWeight:700,margin:2,boxShadow:"0 2px 4px rgba(0,0,0,0.3)" };

        function deal() {
          const nd = deck(); setD(nd);
          setPlayer([nd[0],nd[2]]); setDealer([nd[1],nd[3]]); setPi(4);
          if(score([nd[0],nd[2]])===21){setPhase("done");setResult("blackjack");saveCredits(credits+Math.floor(bet*2.5));return;}
          setPhase("player"); setResult("");
        }
        function hit() {
          const np=[...player,d[pi]]; setPlayer(np); setPi(pi+1);
          if(score(np)>21){setPhase("done");setResult("bust");}
        }
        function stand() {
          let dh=[...dealer]; let di=pi;
          while(score(dh)<17){dh.push(d[di]);di++;}
          setDealer(dh); setPi(di); setPhase("done");
          const ps=score(player),ds=score(dh);
          if(ds>21){setResult("win");saveCredits(credits+bet*2);}
          else if(ps>ds){setResult("win");saveCredits(credits+bet*2);}
          else if(ps===ds){setResult("push");saveCredits(credits+bet);}
          else setResult("lose");
        }
        useEffect(()=>{if(betPlaced&&phase==="deal")deal();},[betPlaced]);

        const Card = ({c,hidden}) => <div style={{...cardStyle,color:["♥","♦"].includes(c?.s)?"#E06":"#1A1A2A"}}>{hidden?<span style={{color:GREY}}>?</span>:<><span style={{fontSize:10}}>{c.s}</span><span>{c.v}</span></>}</div>;

        return <div style={{textAlign:"center"}}>
          {phase==="deal"&&!betPlaced&&<div className="up" style={{color:GREY,fontSize:10,padding:20}}>Place a bet to play</div>}
          {(phase!=="deal"||betPlaced)&&<>
            <div style={{marginBottom:12}}><span className="up" style={{fontSize:9,color:GREY}}>Dealer{phase==="done"?` (${score(dealer)})`:""}</span><div style={{display:"flex",justifyContent:"center",margin:"6px 0"}}>{dealer.map((c,i)=><Card key={i} c={c} hidden={phase!=="done"&&i===1}/>)}</div></div>
            <div style={{marginBottom:12}}><span className="up" style={{fontSize:9,color:accent}}>You ({score(player)})</span><div style={{display:"flex",justifyContent:"center",margin:"6px 0"}}>{player.map((c,i)=><Card key={i} c={c}/>)}</div></div>
            {phase==="player"&&<div style={{display:"flex",gap:8,justifyContent:"center"}}><button className="up" onClick={hit} style={{background:accent,color:BLACK,border:"none",padding:"8px 16px",fontSize:10,fontFamily:fontStack,cursor:"pointer"}}>Hit</button><button className="up" onClick={stand} style={{background:"transparent",color:WHITE,border:`1px solid ${LINE}`,padding:"8px 16px",fontSize:10,fontFamily:fontStack,cursor:"pointer"}}>Stand</button></div>}
            {phase==="done"&&<div><div className="up" style={{fontSize:12,color:result==="win"||result==="blackjack"?"#FFD700":result==="push"?GREY:"#E06",marginBottom:8}}>{result==="blackjack"?`Blackjack! +${Math.floor(bet*2.5)} 💰`:result==="win"?`You win! +${bet*2} 💰`:result==="push"?"Push — bet returned":`Bust! Lost ${bet} 💰`}</div><button className="up" onClick={()=>{setPhase("deal");setPlayer([]);setDealer([]);setBetPlaced(false);}} style={{background:accent,color:BLACK,border:"none",padding:"8px 20px",fontSize:10,fontFamily:fontStack,cursor:"pointer"}}>Deal again</button></div>}
          </>}
        </div>;
      }

      // ---- Slots ----
      function SlotsGame() {
        const syms = ["🍒","🍋","🔔","⭐","💎","7️⃣"];
        const [reels, setReels] = useState(["⭐","⭐","⭐"]);
        const [spinning, setSpinning] = useState(false);
        const [result, setResult] = useState("");

        function spin() {
          if(!betPlaced||spinning) return;
          setSpinning(true); setResult("");
          let count = 0;
          const iv = setInterval(() => {
            setReels([syms[Math.floor(Math.random()*6)],syms[Math.floor(Math.random()*6)],syms[Math.floor(Math.random()*6)]]);
            count++;
            if(count>=15){
              clearInterval(iv);
              const final = [syms[Math.floor(Math.random()*6)],syms[Math.floor(Math.random()*6)],syms[Math.floor(Math.random()*6)]];
              setReels(final); setSpinning(false);
              if(final[0]===final[1]&&final[1]===final[2]){
                const mult = final[0]==="💎"?10:final[0]==="7️⃣"?7:final[0]==="⭐"?5:3;
                setResult(`Jackpot! +${bet*mult} 💰`); saveCredits(credits+bet*mult);
              } else if(final[0]===final[1]||final[1]===final[2]||final[0]===final[2]){
                setResult(`Match! +${bet*2} 💰`); saveCredits(credits+bet*2);
              } else { setResult(`No match. Lost ${bet} 💰`); }
              setBetPlaced(false);
            }
          }, 80);
        }
        useEffect(()=>{if(betPlaced&&!spinning)spin();},[betPlaced]);

        return <div style={{textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",gap:8,margin:"16px 0"}}>
            {reels.map((s,i)=><div key={i} style={{width:64,height:80,background:"rgba(0,0,0,0.5)",border:`2px solid ${spinning?accent:LINE}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,transition:"border .2s"}}>{s}</div>)}
          </div>
          {result&&<div className="up" style={{fontSize:11,color:result.includes("Jackpot")||result.includes("Match")?accent:"#E06",marginBottom:8}}>{result}</div>}
          {!betPlaced&&!spinning&&<div className="up" style={{color:GREY,fontSize:9}}>Place a bet and spin!</div>}
        </div>;
      }

      // ---- Pac-Man ----
      function PacMan() {
        const W=15, H=11;
        const walls = new Set(["0,0","1,0","2,0","3,0","4,0","5,0","9,0","10,0","11,0","12,0","13,0","14,0","0,1","14,1","0,2","2,2","3,2","5,2","6,2","8,2","9,2","11,2","12,2","14,2","0,4","2,4","3,4","5,4","6,4","7,4","8,4","9,4","11,4","12,4","14,4","0,5","14,5","0,6","2,6","3,6","5,6","6,6","8,6","9,6","11,6","12,6","14,6","0,8","2,8","3,8","5,8","6,8","8,8","9,8","11,8","12,8","14,8","0,9","14,9","0,10","1,10","2,10","3,10","4,10","5,10","9,10","10,10","11,10","12,10","13,10","14,10"]);
        const [pos, setPos] = useState({x:7,y:5});
        const [ghosts, setGhosts] = useState([{x:1,y:1},{x:13,y:1},{x:1,y:9},{x:13,y:9}]);
        const [dots, setDots] = useState(()=>{const d=new Set();for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!walls.has(`${x},${y}`))d.add(`${x},${y}`);d.delete("7,5");return d;});
        const [sc, setSc] = useState(0);
        const [dead, setDead] = useState(false);
        const [won, setWon] = useState(false);

        useEffect(()=>{
          function onKey(e){
            if(dead||won)return;
            let dx=0,dy=0;
            if(e.key==="ArrowUp")dy=-1;if(e.key==="ArrowDown")dy=1;if(e.key==="ArrowLeft")dx=-1;if(e.key==="ArrowRight")dx=1;
            if(!dx&&!dy)return; e.preventDefault(); e.stopPropagation();
            setPos(p=>{const nx=p.x+dx,ny=p.y+dy;if(nx<0||nx>=W||ny<0||ny>=H||walls.has(`${nx},${ny}`))return p;const k=`${nx},${ny}`;setDots(prev=>{const n=new Set(prev);if(n.has(k)){n.delete(k);setSc(s=>s+10);if(n.size===0)setWon(true);}return n;});return{x:nx,y:ny};});
          }
          window.addEventListener("keydown",onKey,true);
          return ()=>window.removeEventListener("keydown",onKey,true);
        },[dead,won]);

        // Ghost movement
        useEffect(()=>{
          if(dead||won)return;
          const iv=setInterval(()=>{
            setGhosts(prev=>prev.map(g=>{
              const dirs=[{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(d=>!walls.has(`${g.x+d.dx},${g.y+d.dy}`)&&g.x+d.dx>=0&&g.x+d.dx<W&&g.y+d.dy>=0&&g.y+d.dy<H);
              if(!dirs.length)return g;
              const d=dirs[Math.floor(Math.random()*dirs.length)];
              return{x:g.x+d.dx,y:g.y+d.dy};
            }));
          },500);
          return ()=>clearInterval(iv);
        },[dead,won]);

        // Check ghost collision
        useEffect(()=>{if(ghosts.some(g=>g.x===pos.x&&g.y===pos.y))setDead(true);},[pos,ghosts]);

        const px = 100/W, py = 100/H;
        return <div style={{position:"relative",width:"100%",maxWidth:400,aspectRatio:`${W}/${H}`,margin:"0 auto",background:"#000",border:`2px solid ${accent}`}}>
          {/* Walls */}
          {[...walls].map(k=>{const[x,y]=k.split(",").map(Number);return<div key={k} style={{position:"absolute",left:`${x*px}%`,top:`${y*py}%`,width:`${px}%`,height:`${py}%`,background:"#1A1A4A"}}/>;})}
          {/* Dots */}
          {[...dots].map(k=>{const[x,y]=k.split(",").map(Number);return<div key={`d${k}`} style={{position:"absolute",left:`${x*px+px*0.35}%`,top:`${y*py+py*0.35}%`,width:`${px*0.3}%`,height:`${py*0.3}%`,background:"#FFD700",borderRadius:"50%"}}/>;})}
          {/* Pac-Man */}
          <div style={{position:"absolute",left:`${pos.x*px+px*0.1}%`,top:`${pos.y*py+py*0.1}%`,width:`${px*0.8}%`,height:`${py*0.8}%`,background:"#FFD700",borderRadius:"50%",transition:"left .15s,top .15s",zIndex:5}}/>
          {/* Ghosts */}
          {ghosts.map((g,i)=><div key={i} style={{position:"absolute",left:`${g.x*px+px*0.1}%`,top:`${g.y*py+py*0.1}%`,width:`${px*0.8}%`,height:`${py*0.8}%`,background:["#E06","#4AF","#F90","#E8A0E8"][i],borderRadius:"50% 50% 0 0",transition:"left .4s,top .4s",zIndex:4}}/>)}
          {/* Overlay */}
          {(dead||won)&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:10}}>
            <div className="up" style={{fontSize:14,color:won?accent:"#E06",marginBottom:8}}>{won?"You win!":"Game over!"}</div>
            <div style={{color:"#FFD700",fontSize:12,marginBottom:12}}>Score: {sc}</div>
            <button className="up" onClick={()=>{setPos({x:7,y:5});setGhosts([{x:1,y:1},{x:13,y:1},{x:1,y:9},{x:13,y:9}]);const d=new Set();for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!walls.has(`${x},${y}`))d.add(`${x},${y}`);d.delete("7,5");setDots(d);setSc(0);setDead(false);setWon(false);}} style={{background:accent,color:BLACK,border:"none",padding:"8px 20px",fontSize:10,fontFamily:fontStack,cursor:"pointer"}}>Play again</button>
          </div>}
        </div>;
      }

      return (
        <div style={{ padding: "16px 24px", borderTop: `2px solid ${accent}`, background: "rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span className="up" style={{ fontSize: 11, color: accent, letterSpacing: "0.16em" }}>🎮 {NAMES[game] || game}</span>
            <span className="up" style={{ fontSize: 10, color: "#FFD700" }}>💰 {credits} credits</span>
          </div>

          {needsBet && !betPlaced && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
              <span className="up" style={{ fontSize: 9, color: GREY }}>Bet:</span>
              {[5, 10, 25, 50].map(b => (
                <button key={b} className="up" onClick={() => setBet(b)} style={{ background: bet === b ? accent : "transparent", color: bet === b ? BLACK : WHITE, border: `1px solid ${bet === b ? accent : LINE}`, padding: "5px 10px", fontSize: 9, fontFamily: fontStack, cursor: "pointer", fontWeight: 600 }}>{b}</button>
              ))}
              <button className="up" onClick={placeBet} disabled={bet > credits} style={{ background: "#1DB954", color: WHITE, border: "none", padding: "6px 14px", fontSize: 9, fontFamily: fontStack, cursor: "pointer", fontWeight: 600, marginLeft: "auto" }}>Play for {bet} 💰</button>
            </div>
          )}

          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            {game === "tictactoe" && <TTT />}
            {game === "connect4" && <C4 />}
            {game === "blackjack" && <BJ />}
            {game === "slots" && <SlotsGame />}
            {game === "pacman" && <PacMan />}
          </div>
          <div className="up" style={{ fontSize: 8, color: DIM, marginTop: 10, letterSpacing: "0.1em", textAlign: "center" }}>Walk onto a game table to play · Walk away to leave{game === "pacman" && " · Arrow keys to move"}</div>
        </div>
      );
    }

    return (
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Room header + nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: `1px solid ${LINE}`, flexWrap: "wrap", gap: 8 }}>
          <div>
            <span className="up" style={{ fontSize: 12, letterSpacing: "0.22em" }}>Cosmic World</span>
            <span style={{ color: GREY, fontSize: 10, marginLeft: 10 }}>{allPlayers.length} online</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(ROOMS).map(([key, r]) => (
              <button key={key} className="up" onClick={() => switchRoom(key)} style={{ background: room === key ? r.accent : "transparent", color: room === key ? BLACK : GREY, border: `1px solid ${room === key ? r.accent : LINE}`, padding: "5px 10px", fontSize: 8, fontFamily: fontStack, cursor: "pointer", letterSpacing: "0.1em" }}>{r.name}</button>
            ))}
          </div>
        </div>

        {/* Room */}
        <div style={{ position: "relative", width: "100%", height: "max(75vh, 550px)", overflow: "hidden", background: R.floor1 }}>
          {/* Wall */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "20%", background: R.wall, zIndex: 1 }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: R.wallBase }} />
            {room === "rooftop" && <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}><FStars /></div>}
            {room === "studio" && <>
              <div style={{ position: "absolute", left: "6%", top: "10%", width: "16%", height: "75%", background: "#0D0D1A", border: "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: R.accent, fontSize: "clamp(14px, 2vw, 24px)", fontWeight: 700, fontFamily: fontStack }}>CC</span></div>
              <div style={{ position: "absolute", left: "28%", top: "10%", width: "16%", height: "75%", background: "#0D0D1A", border: "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "clamp(16px, 2.5vw, 28px)" }}>✦</span></div>
              <div style={{ position: "absolute", right: "6%", top: "10%", width: "22%", height: "75%", background: "#0D0D1A", border: "2px solid rgba(255,255,255,0.1)", overflow: "hidden" }}><div style={{ position: "absolute", inset: 3, background: "linear-gradient(135deg, #E06 0%, #C9F24D 50%, #4AF 100%)", opacity: 0.3 }} /></div>
            </>}
            {room === "bedroom" && <>
              <div style={{ position: "absolute", left: "10%", top: "8%", width: "20%", height: "80%", background: "#0D0D1A", border: "2px solid rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}><div style={{ position: "absolute", inset: 3, background: "linear-gradient(180deg, #0D0B2E, #2D2860)" }}><circle cx="50%" cy="30%" r="3" fill="#FFF" opacity="0.4" /><circle cx="30%" cy="50%" r="2" fill="#E8A0E8" opacity="0.3" /></div></div>
              <div style={{ position: "absolute", right: "10%", top: "15%", width: "10%", height: "60%", background: "#0D0D1A", border: "2px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: "60%", height: "60%", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} /></div>
            </>}
            {room === "gameroom" && <>
              <div style={{ position: "absolute", left: "5%", top: "8%", width: "22%", height: "78%", background: "#0D0D1A", border: "2px solid rgba(255,215,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "clamp(16px, 3vw, 32px)", color: "#FFD700" }}>🎮</span></div>
              <div style={{ position: "absolute", left: "35%", top: "12%", width: "30%", height: "70%", background: "#0D0D1A", border: "2px solid rgba(255,215,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="up" style={{ fontSize: "clamp(8px, 1.5vw, 14px)", color: "#FFD700", letterSpacing: "0.2em" }}>Game Room</span></div>
              <div style={{ position: "absolute", right: "5%", top: "8%", width: "22%", height: "78%", background: "#0D0D1A", border: "2px solid rgba(255,215,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "clamp(16px, 3vw, 32px)", color: "#FFD700" }}>🏆</span></div>
            </>}
          </div>

          {/* Floor area */}
          <div ref={worldRef} onClick={handleTap} style={{ position: "absolute", top: "20%", left: 0, right: 0, bottom: 0, cursor: "crosshair", touchAction: "none" }}>
            {/* Checkerboard */}
            {[...Array(COLS * ROWS)].map((_, i) => {
              const col = i % COLS, row = Math.floor(i / COLS);
              return <div key={i} style={{ position: "absolute", left: `${(col / COLS) * 100}%`, top: `${(row / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%`, background: (col + row) % 2 === 0 ? R.floor1 : R.floor2, borderRight: "1px solid rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.02)" }} />;
            })}

            {/* Furniture */}
            {furniture.map((f, i) => (
              <div key={`f${i}`} style={{ position: "absolute", left: `${(f.x / COLS) * 100}%`, top: `${((f.y - (f.h > 1 ? 0 : 0.2)) / ROWS) * 100}%`, width: `${(f.w / COLS) * 100}%`, height: `${((f.h + 0.2) / ROWS) * 100}%`, pointerEvents: "none", zIndex: 4 + f.y, overflow: "visible" }}>{f.comp}</div>
            ))}

            {/* Players */}
            {allPlayers.map(p => {
              const bubble = chatBubbles[p.uid];
              return (
                <div key={p.uid} style={{ position: "absolute", left: `${(p.x / COLS) * 100}%`, top: `${(p.y / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%`, transition: "left 0.18s ease, top 0.18s ease", zIndex: 10 + p.y }}>
                  {bubble && (
                    <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", background: WHITE, color: BLACK, padding: "6px 10px", fontSize: 11, borderRadius: 10, maxWidth: 160, textAlign: "center", lineHeight: 1.4, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: fontStack, pointerEvents: "none", zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.5)", marginBottom: 4 }}>
                      {bubble.text}
                      <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `6px solid ${WHITE}` }} />
                    </div>
                  )}
                  <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: p.isMe ? BLACK : WHITE, background: p.isMe ? R.accent : "rgba(0,0,0,0.7)", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap", pointerEvents: "none", fontFamily: fontStack, fontWeight: 600, zIndex: 50 }}>{p.name}</div>
                  <div style={{ position: "absolute", bottom: "2%", left: "15%", width: "70%", height: "8%", background: "rgba(0,0,0,0.3)", borderRadius: "50%", filter: "blur(2px)" }} />
                  <div style={{ position: "absolute", top: "-40%", left: "0%", right: "0%", bottom: "0%", overflow: "visible" }}>
                    <PixelAvatar a={p.avatar || myAvatar} prefs={{ ...(p.prefs || avatarPrefs), scene: "void" }} facing={p.facing || "front"} sex={p.sex || sex} age={parseInt(p.age || age, 10) || null} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DJ Interaction — Spotify previews */}
        {interacting?.type === "dj" && interacting.playlist?.length > 0 && <DJPanel playlist={interacting.playlist} accent={R.accent} />}

        {/* Game Interaction */}
        {interacting?.type === "game" && <GamePanel game={interacting.game} accent={R.accent} />}

        {/* Chat */}
        <div style={{ display: "flex", gap: 8, padding: "12px 24px", borderTop: `1px solid ${LINE}` }}>
          <input style={fld} value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendChat(); }} placeholder="Say something…" maxLength={100} />
          <button className="up" onClick={sendChat} style={{ border: `1px solid ${LINE}`, background: R.accent, color: BLACK, padding: "0 16px", fontSize: 9, fontFamily: fontStack, cursor: "pointer", letterSpacing: "0.12em", whiteSpace: "nowrap", fontWeight: 600 }}>Send</button>
        </div>
        <div style={{ padding: "4px 24px 60px", maxHeight: 160, overflowY: "auto" }}>
          {chatLog.slice(-20).map((c, i) => (
            <div key={i} style={{ fontSize: 11, padding: "3px 0", lineHeight: 1.5 }}>
              <span style={{ color: R.accent, fontWeight: 500 }}>{c.name}</span>
              <span style={{ color: GREY, marginLeft: 8 }}>{c.text}</span>
            </div>
          ))}
          {chatLog.length === 0 && <p className="up" style={{ color: DIM, fontSize: 9, textAlign: "center", padding: "8px 0" }}>Arrow keys / WASD to move · type to chat · tap tiles on mobile</p>}
        </div>
      </div>
    );
  }

  // ---------- Friends feed ----------
  function FriendsView() {
    const [feed, setFeed] = useState([]);
    const [feedLoading, setFeedLoading] = useState(true);
    const [shared, setShared] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [likesMap, setLikesMap] = useState({});
    const [openComments, setOpenComments] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [sendingComment, setSendingComment] = useState(false);
    const [searchQ, setSearchQ] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [viewUserFeed, setViewUserFeed] = useState([]);
    const up = { textTransform: "uppercase", letterSpacing: "0.18em" };
    const btn = { border: `1px solid ${LINE}`, background: "transparent", color: WHITE, fontFamily: fontStack, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" };
    const fld = { width: "100%", background: "transparent", border: `1px solid ${LINE}`, color: WHITE, padding: 12, fontSize: 12, fontFamily: fontStack, letterSpacing: "0.06em" };

    async function loadFeed() {
      setFeedLoading(true);
      const items = await getFeed(todayKey());
      setFeed(items);
      if (user) { const mine = items.find(i => i.user_id === user.id); if (mine) setShared(true); }
      if (items.length > 0) {
        const lm = await getLikes(items.map(i => i.id));
        setLikesMap(lm);
      }
      setFeedLoading(false);
    }

    useEffect(() => { if (!viewUser) loadFeed(); }, [user, viewUser]);

    async function handleShare() {
      if (!user) { setAuthPrompt(true); return; }
      if (!sign || !reading) return;
      setSharing(true);
      try {
        await shareDay(user.id, {
          date: todayKey(),
          display_name: displayName || user.email?.split("@")[0] || "Anonymous",
          sign_name: sign.name, sign_symbol: sign.symbol,
          fit_name: reading.fitName || "", fit: reading.fit || "",
          mood: reading.mood || "", activity: reading.activity || "",
          playlist: reading.playlist || [],
          avatar: deriveAvatar(reading, sign), prefs: { ...avatarPrefs },
        });
        setShared(true);
        await loadFeed();
      } catch (e) { console.error(e); }
      setSharing(false);
    }

    async function handleLike(itemId) {
      if (!user) { setAuthPrompt(true); return; }
      const liked = await toggleLike(user.id, itemId);
      setLikesMap(prev => {
        const arr = [...(prev[itemId] || [])];
        if (liked) arr.push(user.id); else { const idx = arr.indexOf(user.id); if (idx >= 0) arr.splice(idx, 1); }
        return { ...prev, [itemId]: arr };
      });
    }

    async function handleOpenComments(itemId) {
      if (openComments === itemId) { setOpenComments(null); return; }
      setOpenComments(itemId);
      setComments(await getComments(itemId));
      setCommentText("");
    }

    async function handleSendComment(itemId) {
      if (!user) { setAuthPrompt(true); return; }
      if (!commentText.trim()) return;
      setSendingComment(true);
      await addComment(user.id, itemId, displayName || user.email?.split("@")[0] || "Anonymous", commentText.trim());
      setComments(await getComments(itemId));
      setCommentText("");
      setSendingComment(false);
    }

    async function handleSearch() {
      if (!searchQ.trim()) { setSearchResults([]); return; }
      setSearching(true);
      setSearchResults(await searchUsers(searchQ));
      setSearching(false);
    }

    async function handleViewUser(u) {
      setViewUser(u);
      setViewUserFeed(await getUserFeed(u.user_id));
    }

    // ---------- User profile view ----------
    if (viewUser) {
      return (
        <main style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
          <section style={{ padding: "28px 0", borderBottom: `1px solid ${LINE}` }}>
            <button className="up" onClick={() => setViewUser(null)} style={{ ...btn, padding: "8px 14px", fontSize: 9, marginBottom: 20 }}>← Back to feed</button>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: LINE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{viewUser.sign_symbol}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{viewUser.display_name}</div>
                <div className="up" style={{ fontSize: 9, color: GREY }}>{viewUser.sign_name}</div>
              </div>
            </div>
          </section>
          {viewUserFeed.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p className="up" style={{ color: DIM, fontSize: 10 }}>No shared fits yet.</p>
            </div>
          ) : viewUserFeed.map((item, idx) => (
            <FeedCard key={item.id || idx} item={item} isMe={false} showDate />
          ))}
        </main>
      );
    }

    // ---------- Main feed ----------
    return (
      <main style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
        {/* Search */}
        <section style={{ padding: "20px 0", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={fld} value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSearch(); }} placeholder="SEARCH USERS…" className="up" />
            <button className="up" onClick={handleSearch} disabled={searching} style={{ ...btn, padding: "0 16px", fontSize: 9, whiteSpace: "nowrap" }}>{searching ? "…" : "Search"}</button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {searchResults.map((r, i) => (
                <button key={i} onClick={() => handleViewUser(r)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${LINE}`, padding: "10px 4px", cursor: "pointer", fontFamily: fontStack, color: WHITE, textAlign: "left" }}>
                  <span style={{ fontSize: 16 }}>{r.sign_symbol}</span>
                  <span style={{ fontSize: 12 }}>{r.display_name}</span>
                  <span className="up" style={{ fontSize: 8, color: GREY, marginLeft: "auto" }}>{r.sign_name}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Share */}
        <section style={{ padding: "20px 0", borderBottom: `1px solid ${LINE}`, textAlign: "center" }}>
          <div className="up" style={{ fontSize: 10, color: GREY, marginBottom: 12 }}>Today's feed</div>
          {sign && reading ? (
            <button className="up" onClick={handleShare} disabled={shared || sharing}
              style={{ background: shared ? "transparent" : ACCENT, color: shared ? ACCENT : BLACK, border: `1px solid ${shared ? ACCENT : "transparent"}`, padding: "13px 24px", fontSize: 10, letterSpacing: "0.14em", fontFamily: fontStack, cursor: shared ? "default" : "pointer", fontWeight: 600 }}>
              {shared ? "✓ Shared today" : sharing ? "Sharing…" : "✦ Share your fit to friends"}
            </button>
          ) : (
            <p style={{ color: GREY, fontSize: 11, lineHeight: 1.8 }}>Pick a sign and generate your reading to share it here.</p>
          )}
        </section>

        {/* Feed */}
        {feedLoading ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <div className="skel" style={{ width: 200, height: 12, margin: "0 auto 16px" }} />
            <div className="skel" style={{ width: 160, height: 12, margin: "0 auto" }} />
          </div>
        ) : feed.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>✦</div>
            <p className="up" style={{ color: DIM, fontSize: 10, lineHeight: 2 }}>No one has shared yet today.<br />Be the first.</p>
          </div>
        ) : feed.map((item, idx) => (
          <FeedCard key={item.id || idx} item={item} isMe={user && item.user_id === user.id} />
        ))}
      </main>
    );

    function FeedCard({ item, isMe, showDate }) {
      const likeArr = likesMap[item.id] || [];
      const iLiked = user && likeArr.includes(user.id);
      const isOpen = openComments === item.id;
      return (
        <div style={{ padding: "24px 0", borderBottom: `1px solid ${LINE}` }}>
          {/* User header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <button onClick={() => handleViewUser({ user_id: item.user_id, display_name: item.display_name, sign_name: item.sign_name, sign_symbol: item.sign_symbol })} style={{ width: 28, height: 28, borderRadius: "50%", background: LINE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "none", cursor: "pointer", padding: 0 }}>{item.sign_symbol}</button>
            <div style={{ flex: 1 }}>
              <button onClick={() => handleViewUser({ user_id: item.user_id, display_name: item.display_name, sign_name: item.sign_name, sign_symbol: item.sign_symbol })} style={{ background: "none", border: "none", color: WHITE, fontSize: 12, fontWeight: 500, cursor: "pointer", padding: 0, fontFamily: fontStack }}>
                {item.display_name}{isMe && <span style={{ color: ACCENT, fontSize: 9, marginLeft: 6 }}>YOU</span>}
              </button>
              <div className="up" style={{ fontSize: 8, color: GREY }}>{item.sign_name}{showDate && ` · ${item.date}`}</div>
            </div>
          </div>
          {/* Fit */}
          <div style={{ marginBottom: 12 }}>
            {item.fit_name && <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{item.fit_name}</div>}
            <div style={{ fontSize: 12, color: GREY, lineHeight: 1.7 }}>{item.fit}</div>
          </div>
          {/* Mood + activity */}
          <div style={{ display: "flex", gap: 20, marginBottom: 14, flexWrap: "wrap" }}>
            {item.mood && <div><div className="up" style={{ fontSize: 8, color: GREY, marginBottom: 2 }}>Mood</div><div style={{ fontSize: 12, fontStyle: "italic" }}>{item.mood}</div></div>}
            {item.activity && <div style={{ flex: 1, minWidth: 140 }}><div className="up" style={{ fontSize: 8, color: ACCENT, marginBottom: 2 }}>Do this</div><div style={{ fontSize: 12, lineHeight: 1.5 }}>{item.activity}</div></div>}
          </div>
          {/* Playlist */}
          {item.playlist?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="up" style={{ fontSize: 8, color: GREY, marginBottom: 6 }}>Soundtrack</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {item.playlist.slice(0, 5).map((song, i) => (
                  <a key={i} href={`https://open.spotify.com/search/${encodeURIComponent(song.replace(/—/g, ""))}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 10, color: WHITE, background: "rgba(244,244,240,0.04)", border: `1px solid ${LINE}`, padding: "5px 9px", textDecoration: "none", fontFamily: fontStack, letterSpacing: "0.02em" }}>{song}</a>
                ))}
              </div>
            </div>
          )}
          {/* Like + Comment buttons */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button onClick={() => handleLike(item.id)} style={{ background: "none", border: "none", color: iLiked ? ACCENT : GREY, fontSize: 12, cursor: "pointer", fontFamily: fontStack, padding: 0, display: "flex", alignItems: "center", gap: 5 }}>
              {iLiked ? "♥" : "♡"} <span style={{ fontSize: 10 }}>{likeArr.length || ""}</span>
            </button>
            <button onClick={() => handleOpenComments(item.id)} style={{ background: "none", border: "none", color: isOpen ? WHITE : GREY, fontSize: 10, cursor: "pointer", fontFamily: fontStack, padding: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Comments
            </button>
          </div>
          {/* Comments section */}
          {isOpen && (
            <div style={{ marginTop: 14, paddingLeft: 12, borderLeft: `2px solid ${LINE}` }}>
              {comments.length === 0 && <p className="up" style={{ fontSize: 9, color: DIM }}>No comments yet.</p>}
              {comments.map((c, ci) => (
                <div key={c.id || ci} style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{c.display_name}</span>
                  <span style={{ fontSize: 10, color: GREY, marginLeft: 8 }}>{new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <div style={{ fontSize: 12, color: WHITE, marginTop: 2, lineHeight: 1.5 }}>{c.body}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input style={{ ...fld, flex: 1, padding: 10, fontSize: 11 }} value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSendComment(item.id); }} placeholder="Say something…" />
                <button className="up" onClick={() => handleSendComment(item.id)} disabled={sendingComment} style={{ ...btn, padding: "0 14px", fontSize: 9 }}>{sendingComment ? "…" : "Send"}</button>
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  // ---------- Profile + fit calendar ----------
  function ProfileView() {
    const eff = getEffectiveFitLog();
    const sel = eff[selDay] || {};
    const [nm, setNm] = useState(user ? (cloudProfile?.display_name || "") : displayName);
    const [wore, setWore] = useState(sel.wore || false);
    const [fit, setFit] = useState(sel.fit || "");
    const [note, setNote] = useState(sel.note || "");
    useEffect(() => { const s = eff[selDay] || {}; setWore(s.wore || false); setFit(s.fit || ""); setNote(s.note || ""); }, [selDay, cloudFitLog]);

    const first = new Date(calCursor);
    const startDay = first.getDay();
    const daysInMonth = new Date(calCursor.getFullYear(), calCursor.getMonth() + 1, 0).getDate();
    const cells = []; for (let i = 0; i < startDay; i++) cells.push(null); for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const monthName = calCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
    const woreCount = user ? cloudFitLog.filter(r => r?.wore).length : Object.values(fitLog).filter(r => r?.wore).length;
    const streak = getEffectiveStreak();
    const up = { textTransform: "uppercase", letterSpacing: "0.18em" };
    const btn = { border: `1px solid ${LINE}`, background: "transparent", color: WHITE, fontFamily: fontStack, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" };
    const fld = { width: "100%", background: "transparent", border: `1px solid ${LINE}`, color: WHITE, padding: 12, fontSize: 12, fontFamily: fontStack, letterSpacing: "0.06em" };

    async function saveName() {
      const trimmed = nm.trim();
      if (user) {
        await upsertProfile(user.id, { display_name: trimmed });
        setCloudProfile(await getProfile(user.id));
      }
      setDisplayName(trimmed);
      sSet("displayName", trimmed);
    }

    async function handleSignOut() {
      await signOut();
      setUser(null); setCloudProfile(null); setCloudFitLog([]);
      setView("today");
    }

    return (
      <main style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
        {user && (
          <section style={{ padding: "30px 0 16px", borderBottom: `1px solid ${LINE}` }}>
            <div style={{ ...up, fontSize: 10, color: GREY, marginBottom: 6 }}>Signed in as</div>
            <div style={{ fontSize: 13, color: GREY, wordBreak: "break-all" }}>{user.email}</div>
          </section>
        )}

        <section style={{ padding: "30px 0", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ ...up, fontSize: 10, color: GREY, marginBottom: 8 }}>Display name</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={fld} value={nm} onChange={e => setNm(e.target.value)} placeholder="WHAT THE STARS CALL YOU" />
            <button style={{ ...btn, padding: "0 16px", background: WHITE, color: BLACK }} onClick={saveName}>Save</button>
          </div>
          <div style={{ ...up, fontSize: 9, color: DIM, marginTop: 12 }}>{[sex || "—", weather ? `${weather.place}` : (zip || "no location"), age ? `age ${age}` : "no age"].join("  ·  ")}</div>
        </section>

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

        <section style={{ padding: "28px 0", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <button style={{ ...btn, padding: "6px 12px", fontSize: 12 }} onClick={() => setCalCursor(new Date(calCursor.getFullYear(), calCursor.getMonth() - 1, 1))}>‹</button>
            <span style={{ ...up, fontSize: 12 }}>{monthName}</span>
            <button style={{ ...btn, padding: "6px 12px", fontSize: 12 }} onClick={() => setCalCursor(new Date(calCursor.getFullYear(), calCursor.getMonth() + 1, 1))}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
            {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} style={{ ...up, fontSize: 8, color: DIM, textAlign: "center", paddingBottom: 4 }}>{d}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const key = new Date(calCursor.getFullYear(), calCursor.getMonth(), d).toISOString().slice(0, 10);
              const row = eff[key]; const isToday = key === todayKey(); const isSel = key === selDay; const future = key > todayKey();
              return (
                <button key={i} disabled={future} onClick={() => setSelDay(key)}
                  style={{ aspectRatio: "1", border: `1px solid ${isSel ? WHITE : LINE}`, background: row?.wore ? ACCENT : (isSel ? "rgba(244,244,240,0.06)" : "transparent"), color: row?.wore ? BLACK : (future ? DIM : WHITE), fontFamily: fontStack, fontSize: 12, cursor: future ? "default" : "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

        <section style={{ padding: "28px 0" }}>
          <div style={{ ...up, fontSize: 10, color: GREY, marginBottom: 16 }}>{new Date(selDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          {sel.avatar && (
            <div style={{ display: "flex", alignItems: "center", gap: 18, border: `1px solid ${LINE}`, background: "#0D0D10", padding: 0, marginBottom: 14, overflow: "hidden", position: "relative" }}>
              <div style={{ width: 132, flexShrink: 0 }}>
                <PixelAvatar a={sel.avatar} prefs={sel.prefsSnap || avatarPrefs} facing="front" sex={sex} age={parseInt(age, 10) || null} />
              </div>
              <div style={{ padding: "12px 14px 12px 0" }}>
                <div style={{ ...up, fontSize: 9, color: ACCENT, letterSpacing: "0.16em", marginBottom: 6 }}>The fit that day</div>
                <div style={{ fontSize: 14 }}>{sel.fit || "—"}</div>
              </div>
              <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(transparent 0 2px, rgba(0,0,0,0.18) 2px 3px)" }} />
            </div>
          )}
          <button onClick={() => { const v = !wore; setWore(v); saveFitDay(selDay, { wore: v }); }} style={{ ...btn, ...up, width: "100%", padding: 14, fontSize: 11, background: wore ? ACCENT : "transparent", color: wore ? BLACK : WHITE, borderColor: wore ? ACCENT : LINE, marginBottom: 12 }}>
            {wore ? "✓ Wore the fit" : "Did you wear the fit?"}
          </button>
          <div style={{ ...up, fontSize: 9, color: GREY, marginBottom: 6 }}>Which fit</div>
          <input style={{ ...fld, marginBottom: 12 }} value={fit} onChange={e => setFit(e.target.value)} onBlur={() => saveFitDay(selDay, { fit: fit.trim() })} placeholder="E.G. BLACK OVERCOAT + BOOTS" />
          <div style={{ ...up, fontSize: 9, color: GREY, marginBottom: 6 }}>Notes</div>
          <textarea style={{ ...fld, minHeight: 70, resize: "vertical", marginBottom: 14 }} value={note} onChange={e => setNote(e.target.value)} onBlur={() => saveFitDay(selDay, { note: note.trim() })} placeholder="HOW IT LANDED. WHAT YOU'D CHANGE." />
          <button style={{ ...btn, ...up, width: "100%", padding: 13, fontSize: 11, background: WHITE, color: BLACK }} onClick={() => { saveFitDay(selDay, { wore, fit: fit.trim(), note: note.trim() }); setView("today"); }}>Save day</button>
        </section>

        {user && (
          <button className="up" onClick={handleSignOut} style={{ width: "100%", background: "transparent", color: GREY, border: `1px solid ${LINE}`, padding: 12, fontSize: 9, letterSpacing: "0.15em", fontFamily: fontStack, cursor: "pointer", marginBottom: 20 }}>Sign out</button>
        )}
      </main>
    );
  }
}
