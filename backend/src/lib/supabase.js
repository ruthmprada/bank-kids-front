import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_REF = "bukszojoolxjllgnpzfx";
const DEFAULT_SUPABASE_URL = `https://${DEFAULT_SUPABASE_REF}.supabase.co`;
const DEFAULT_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1a3N6b2pvb2x4amxsZ25wemZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDEzODQsImV4cCI6MjA5MTMxNzM4NH0.Z3VtLF7Ve_Kfw3iBimksyEJ-24gwlJD39zSBVj4fg1A";

function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl) {
    return DEFAULT_SUPABASE_URL;
  }

  const trimmedUrl = rawUrl.trim();

  if (trimmedUrl.includes("supabase.com/dashboard/project/")) {
    const refMatch = trimmedUrl.match(/project\/([a-z0-9]+)\//i);

    if (refMatch?.[1]) {
      return `https://${refMatch[1]}.supabase.co`;
    }
  }

  return trimmedUrl.replace(/\/+$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
const supabaseKey = process.env.SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan las credenciales de Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
