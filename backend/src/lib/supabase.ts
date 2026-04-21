
import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_REF = "bukszojoolxjllgnpzfx";
const DEFAULT_SUPABASE_URL = `https://${DEFAULT_SUPABASE_REF}.supabase.co`;
const SUPABASE_SERVICE_ROLE_KEY="InJlZiI6ImJ1a3N6b2pvb2x4amxsZ25wemZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc0MTM4NCwiZXhwIjoyMDkxMzE3Mzg0fQ.XALigxgmtWgg7y29PQBJ1MkYEhlgtMeqxSz0U2Eu7p0";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1a3N6b2pvb2x4amxsZ25wemZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDEzODQsImV4cCI6MjA5MTMxNzM4NH0.Z3VtLF7Ve_Kfw3iBimksyEJ-24gwlJD39zSBVj4fg1A";

function normalizeSupabaseUrl(rawUrl?: string) {
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
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim() ||
  DEFAULT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan las credenciales de Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
function describeKey(name: string, key?: string) {
  if (!key) {
    return `[supabase] ${name}: MISSING`;
  }

  const prefix = key.slice(0, 16);

  if (key.split(".").length === 3) {
    try {
      const payload = JSON.parse(
        Buffer.from(key.split(".")[1], "base64url").toString("utf8")
      );

      return `[supabase] ${name}: prefix=${prefix} role=${payload.role ?? "unknown"}`;
    } catch {
      return `[supabase] ${name}: prefix=${prefix} jwt-unreadable`;
    }
  }

  return `[supabase] ${name}: prefix=${prefix} non-jwt`;
}

console.log(describeKey("SUPABASE_ANON_KEY", process.env.SUPABASE_ANON_KEY));
console.log(
  describeKey(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
);
console.log(
  `[supabase] admin client source: ${
    process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon/default"
  }`
);


export const supabaseAuth = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
