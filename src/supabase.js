// Supabase client + data layer for accounts, profiles, and the fit calendar.
// Reads config from Vite env vars (safe to expose: the anon key is public by design;
// Row Level Security in schema.sql is what actually protects each user's rows).
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If env vars are missing, export a null client so the app can show a clear message
// instead of crashing.
export const supabase = url && anon ? createClient(url, anon) : null;
export const supabaseReady = Boolean(supabase);

// ---- Auth ----
export async function signUp(email, password) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}
export async function signIn(email, password) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
export async function signInWithGoogle() {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
  return data;
}
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

// ---- Profile ----
// profiles table: id (uuid, = auth user id), display_name, sign, sex, zip, age, updated_at
export async function getProfile(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
export async function upsertProfile(userId, fields) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---- Fit calendar ----
// fit_log table: id, user_id, date (YYYY-MM-DD), wore (bool), fit (text), note (text)
// Unique on (user_id, date) so each day has one row.
export async function getFitLog(userId, fromDate, toDate) {
  if (!supabase) return [];
  let q = supabase.from("fit_log").select("*").eq("user_id", userId);
  if (fromDate) q = q.gte("date", fromDate);
  if (toDate) q = q.lte("date", toDate);
  const { data, error } = await q.order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function upsertFitDay(userId, date, fields) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("fit_log")
    .upsert({ user_id: userId, date, ...fields }, { onConflict: "user_id,date" })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Compute current streak (consecutive days up to today with wore=true).
export function computeStreak(log) {
  const wore = new Set(log.filter((r) => r.wore).map((r) => r.date));
  let streak = 0;
  const d = new Date();
  // allow today to be unfilled without breaking streak — start from today, stop at first gap
  for (let i = 0; i < 400; i++) {
    const key = new Date(d.getTime() - i * 86400000).toISOString().slice(0, 10);
    if (wore.has(key)) streak++;
    else if (i === 0) continue; // today not logged yet — keep counting back
    else break;
  }
  return streak;
}
