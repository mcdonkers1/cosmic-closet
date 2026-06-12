import React, { useState, useEffect, useRef } from "react";

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
  const [view, setView] = useState("today");        // "today" | "profile"
  const [showCard, setShowCard] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [fitLog, setFitLog] = useState({});           // { "YYYY-MM-DD": {wore, fit, note} }
  const [calCursor, setCalCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selDay, setSelDay] = useState(todayKey());

  const dateObj = new Date(viewingDate + "T12:00:00");
  const isToday = viewingDate === todayKey();
  const dateLabel = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();

  // Load saved profile once
  useEffect(() => {
    (async () => {
      const p = await sGet("profile");
      if (p) { setSex(p.sex || ""); setZip(p.zip || ""); setAge(p.age || ""); if (p.sex || p.zip || p.age) setOnboarded(true); }
      const nm = await sGet("displayName"); if (nm) setDisplayName(nm);
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

  function saveFitDay(date, fields) {
    setFitLog(prev => { const next = { ...prev, [date]: { ...prev[date], ...fields } }; sSet("fitLog", next); return next; });
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
    const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`)).json();
    return { tempF: Math.round(w.current.temperature_2m), label: WCODE[w.current.weather_code] || "—", place: label };
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
    } catch { setWeatherErr("Weather lookup failed — you can still continue."); }
  }

  function weatherClause() {
    if (!weather) return "";
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

  async function generate(s, date) {
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

      // A date-derived seed gives the model a concrete, different anchor each day.
      const seed = Array.from(date).reduce((a, c) => a + c.charCodeAt(0), 0) * 7 + s.name.length;

      const avoidBlock = (usedKeywords.length || usedFits.length || usedActivities.length)
        ? `\n\nDO NOT REPEAT anything from the last few days. Previously used outfit keywords: ${JSON.stringify(usedKeywords)}. Previously used fits: ${JSON.stringify(usedFits)}. Previously used tasks: ${JSON.stringify(usedActivities)}. Today's fit, keyword, and task must each be clearly different from all of those — different garments, different colors/silhouette, a different kind of task.`
        : "";

      const res = await fetch("/api/horoscope", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sign: s.name, vibe: s.vibe,
          date: new Date(date + "T12:00:00").toDateString(),
          seed, sex, age,
          weather: weatherClause(),
          avoid: { keywords: usedKeywords, fits: usedFits, activities: usedActivities },
        }),
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
      setReading({ power: "The signal dropped. The stars went quiet.", pressure: "You wanted an answer. You got static.", trouble: "Don't mistake silence for permission.", fitName: "Off-Grid Uniform", mood: "Quietly Defiant", fit: `Lean into your ${s.vibe} instincts. Dress like you already know.`, activity: "Do the one task you've been avoiding.", keyword: fb, playlist: ["Radiohead — Everything In Its Right Place", "FKA twigs — Two Weeks", "Frank Ocean — Nights", "Portishead — Glory Box", "James Blake — Retrograde"] });
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
      <text x="${cx}" y="86" fill="#C9F24D" font-size="13" letter-spacing="6" text-anchor="middle">C O S M I C   C L O S E T</text>
      <text x="${cx}" y="112" fill="#5A5A58" font-size="11" letter-spacing="4" text-anchor="middle">${dateStr}</text>

      <!-- sign -->
      <text x="${cx}" y="210" fill="#F4F4F0" font-size="76" text-anchor="middle">${esc(sign.symbol)}</text>
      <text x="${cx}" y="250" fill="#7A7A78" font-size="14" letter-spacing="5" text-anchor="middle">${esc(sign.name.toUpperCase())}</text>

      <!-- mood -->
      <text x="${cx}" y="318" fill="#C9F24D" font-size="11" letter-spacing="4" text-anchor="middle">TODAY'S ENERGY</text>
      <text x="${cx}" y="350" fill="#DCDCD8" font-size="20" font-style="italic" font-family="${serifFn}" text-anchor="middle">${esc(moodTxt)}</text>

      <!-- HERO: fit name -->
      <text x="${cx}" y="372" fill="#7A7A78" font-size="11" letter-spacing="5" text-anchor="middle">THE FIT</text>
      <line x1="${cx-30}" y1="392" x2="${cx+30}" y2="392" stroke="#C9F24D" stroke-width="1.5"/>
      ${(() => {
        // bigger hero, but clamp so the longest line still fits within margins
        const longest = Math.max(...fitNameLines.map(l => l.length), 1);
        const maxByWidth = Math.floor((CW - 70) / (longest * 0.6)); // ~0.6em per char for this serif
        const size = Math.min(fitNameLines.length > 1 ? 50 : 64, maxByWidth);
        const lineH = size + 8;
        const blockH = fitNameLines.length * lineH;
        const startY = fitNameY + (fitNameLines.length > 1 ? 0 : 14);
        // twinkling stars scattered around the hero area
        const region = { x0: 40, x1: CW - 40, y0: 405, y1: startY + blockH + 10 };
        const stars = [...Array(16)].map((_, i) => {
          const sx = (region.x0 + ((i * 67) % (region.x1 - region.x0))).toFixed(0);
          const sy = (region.y0 + ((i * 41) % (region.y1 - region.y0))).toFixed(0);
          const r = (i % 4 === 0 ? 2.4 : 1.4);
          const dur = (2.2 + (i % 5) * 0.6).toFixed(1);
          const col = i % 3 === 0 ? "#C9F24D" : "#F4F4F0";
          const begin = ((i % 7) * 0.35).toFixed(2);
          // four-point sparkle for the bigger ones, dot for small
          const shape = i % 4 === 0
            ? `<path d="M${sx} ${sy-6} L${(+sx+1.6).toFixed(1)} ${sy} L${sx} ${(+sy+6)} L${(+sx-1.6).toFixed(1)} ${sy} Z M${sx-6} ${sy} L${sx} ${(+sy-1.6).toFixed(1)} L${(+sx+6)} ${sy} L${sx} ${(+sy+1.6).toFixed(1)} Z" fill="${col}"><animate attributeName="opacity" values="0.15;0.9;0.15" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></path>`
            : `<circle cx="${sx}" cy="${sy}" r="${r}" fill="${col}"><animate attributeName="opacity" values="0.1;0.7;0.1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
          return shape;
        }).join("");
        const names = fitNameLines.map((l, i) => `<text x="${cx}" y="${startY + i * lineH + size * 0.34}" fill="#F4F4F0" font-size="${size}" font-family="${serifFn}" text-anchor="middle">${esc(l)}</text>`).join("");
        return stars + names;
      })()}

      <!-- fit detail -->
      ${fitLines.map((l,i)=>`<text x="${cx}" y="${(fitNameLines.length > 1 ? 600 : 540) + i*26}" fill="#9A9A98" font-size="15" text-anchor="middle">${esc(l)}</text>`).join("")}

      <!-- do this -->
      <text x="${cx}" y="700" fill="#C9F24D" font-size="11" letter-spacing="4" text-anchor="middle">DO THIS</text>
      ${actLines.map((l,i)=>`<text x="${cx}" y="${728 + i*26}" fill="#DCDCD8" font-size="16" text-anchor="middle">${esc(l)}</text>`).join("")}

      <!-- search keyword chip -->
      <text x="${cx}" y="784" fill="#7A7A78" font-size="11" letter-spacing="5" text-anchor="middle">THE LOOK</text>
      ${(() => {
        const kw = keyword.toUpperCase();
        const fs = 18;                         // bigger text
        const ls = 2.5;                         // letter spacing
        const textW = kw.length * (fs * 0.62) + (kw.length - 1) * ls;
        const padX = 32;
        const pillW = Math.min(textW + padX * 2, CW - 56);
        const pillH = 56;
        const py = 806;
        return `<rect x="${(cx - pillW / 2).toFixed(0)}" y="${py}" width="${pillW.toFixed(0)}" height="${pillH}" rx="${pillH / 2}" fill="none" stroke="#C9F24D" stroke-width="1.3"/>
        <text x="${cx}" y="${py + pillH / 2 + fs * 0.36}" fill="#C9F24D" font-size="${fs}" letter-spacing="${ls}" text-anchor="middle">${esc(kw)}</text>`;
      })()}

      <!-- footer -->
      <text x="${cx}" y="912" fill="#5A5A58" font-size="11" letter-spacing="4" text-anchor="middle">COSMICCLOSET.APP</text>
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
          style={{ width: "min(340px, 80vw)", height: "auto", border: `1px solid ${LINE}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} />
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
        input::placeholder { color: ${DIM}; }
        a:focus-visible, button:focus-visible { outline: 1px solid ${ACCENT}; outline-offset: 2px; }
        @keyframes tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes twinkle { 0%,100% { opacity: 0.12; transform: scale(0.8); } 50% { opacity: 0.8; transform: scale(1.25); } }
        @keyframes sparklespin { 0%,100% { opacity: 0.1; transform: scale(0.6) rotate(0deg); } 50% { opacity: 0.95; transform: scale(1.15) rotate(18deg); } }
        @keyframes skelpulse { 0%,100% { opacity: 0.25; } 50% { opacity: 0.55; } }
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

      <header style={{ borderBottom: `1px solid ${LINE}`, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, position: "relative", zIndex: 1 }}>
        <span className="up">Cosmic Closet</span>
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="up" style={{ color: GREY }}>{dateLabel}{!isToday && <span style={{ color: ACCENT }}> · ARCHIVE</span>}</span>
          <button className="chip up" onClick={() => setView(view === "profile" ? "today" : "profile")} style={{ background: view === "profile" ? WHITE : "transparent", color: view === "profile" ? BLACK : WHITE, border: `1px solid ${LINE}`, padding: "6px 11px", fontSize: 9, fontFamily: fontStack, cursor: "pointer" }}>
            {view === "profile" ? "← Today" : (displayName ? displayName.slice(0, 12) : "Profile")}
          </button>
        </span>
      </header>

      {view === "profile" ? (
        <ProfileView />
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
                  </div>
                </div>
                {/* Activity — accented block */}
                <div style={{ borderTop: `1px solid ${ACCENT}`, borderBottom: `1px solid ${ACCENT}`, padding: "22px 0", display: "grid", gridTemplateColumns: "96px 1fr", gap: 16, background: "rgba(201,242,77,0.04)", paddingInline: 14, marginInline: -14 }}>
                  <div className="up" style={{ fontSize: 10, color: ACCENT, paddingTop: 3 }}>Do this</div>
                  <div style={{ fontSize: 16, lineHeight: 1.7, fontWeight: 400 }}>{reading.activity || "Move one goal forward before noon. Momentum is the whole game today."}</div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                  {(() => {
                    const wore = fitLog[viewingDate]?.wore;
                    return (
                      <button className="up" onClick={() => saveFitDay(viewingDate, { wore: !wore, fit: !wore ? (reading.fitName || reading.keyword || "") : (fitLog[viewingDate]?.fit || "") })}
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
                {fitStreak() > 1 && (
                  <div className="up" style={{ marginTop: 16, fontSize: 9, color: ACCENT, letterSpacing: "0.14em" }}>🔥 {fitStreak()}-day fit streak</div>
                )}
              </div>
            )}
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
                  <div key={i} className="track" style={{ display: "flex", alignItems: "center", gap: 14, borderTop: `1px solid ${LINE}`, padding: "13px 10px", transition: "all .18s ease" }}>
                    <span style={{ fontSize: 13, color: DIM, width: 18, fontFamily: fontStack }}>{String(i + 1).padStart(2, "0")}</span>
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
              {[["Search on Pinterest", pinterestUrl], ["Search on TikTok", tiktokUrl], ["Search on Instagram", instagramUrl]].map(([label, url]) => (
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

  // ---------- Profile + fit calendar (preview: saved in-browser) ----------
  function ProfileView() {
    const sel = fitLog[selDay] || {};
    const [nm, setNm] = useState(displayName);
    const [wore, setWore] = useState(sel.wore || false);
    const [fit, setFit] = useState(sel.fit || "");
    const [note, setNote] = useState(sel.note || "");
    useEffect(() => { const s = fitLog[selDay] || {}; setWore(s.wore || false); setFit(s.fit || ""); setNote(s.note || ""); }, [selDay]);

    const first = new Date(calCursor);
    const startDay = first.getDay();
    const daysInMonth = new Date(calCursor.getFullYear(), calCursor.getMonth() + 1, 0).getDate();
    const cells = []; for (let i = 0; i < startDay; i++) cells.push(null); for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const monthName = calCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
    const woreCount = Object.values(fitLog).filter(r => r?.wore).length;
    const up = { textTransform: "uppercase", letterSpacing: "0.18em" };
    const btn = { border: `1px solid ${LINE}`, background: "transparent", color: WHITE, fontFamily: fontStack, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" };
    const fld = { width: "100%", background: "transparent", border: `1px solid ${LINE}`, color: WHITE, padding: 12, fontSize: 12, fontFamily: fontStack, letterSpacing: "0.06em" };

    return (
      <main style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
        <section style={{ padding: "30px 0", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ ...up, fontSize: 10, color: GREY, marginBottom: 8 }}>Display name</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={fld} value={nm} onChange={e => setNm(e.target.value)} placeholder="WHAT THE STARS CALL YOU" />
            <button style={{ ...btn, padding: "0 16px", background: WHITE, color: BLACK }} onClick={() => { setDisplayName(nm.trim()); sSet("displayName", nm.trim()); }}>Save</button>
          </div>
          <div style={{ ...up, fontSize: 9, color: DIM, marginTop: 12 }}>{[sex || "—", weather ? `${weather.place}` : (zip || "no location"), age ? `age ${age}` : "no age"].join("  ·  ")}</div>
        </section>

        <section style={{ padding: "28px 0", borderBottom: `1px solid ${LINE}`, display: "flex", gap: 32 }}>
          <div>
            <div style={{ ...up, fontSize: 10, color: ACCENT }}>Current streak</div>
            <div style={{ fontSize: 40, fontWeight: 300, marginTop: 4 }}>{fitStreak()}<span style={{ fontSize: 13, color: GREY, marginLeft: 8 }}>days</span></div>
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
              const row = fitLog[key]; const isToday = key === todayKey(); const isSel = key === selDay; const future = key > todayKey();
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
          <button onClick={() => { const v = !wore; setWore(v); saveFitDay(selDay, { wore: v }); }} style={{ ...btn, ...up, width: "100%", padding: 14, fontSize: 11, background: wore ? ACCENT : "transparent", color: wore ? BLACK : WHITE, borderColor: wore ? ACCENT : LINE, marginBottom: 12 }}>
            {wore ? "✓ Wore the fit" : "Did you wear the fit?"}
          </button>
          <div style={{ ...up, fontSize: 9, color: GREY, marginBottom: 6 }}>Which fit</div>
          <input style={{ ...fld, marginBottom: 12 }} value={fit} onChange={e => setFit(e.target.value)} onBlur={() => saveFitDay(selDay, { fit: fit.trim() })} placeholder="E.G. BLACK OVERCOAT + BOOTS" />
          <div style={{ ...up, fontSize: 9, color: GREY, marginBottom: 6 }}>Notes</div>
          <textarea style={{ ...fld, minHeight: 70, resize: "vertical", marginBottom: 14 }} value={note} onChange={e => setNote(e.target.value)} onBlur={() => saveFitDay(selDay, { note: note.trim() })} placeholder="HOW IT LANDED. WHAT YOU'D CHANGE." />
          <button style={{ ...btn, ...up, width: "100%", padding: 13, fontSize: 11, background: WHITE, color: BLACK }} onClick={() => { saveFitDay(selDay, { wore, fit: fit.trim(), note: note.trim() }); setView("today"); }}>Save day</button>
        </section>
      </main>
    );
  }
}
