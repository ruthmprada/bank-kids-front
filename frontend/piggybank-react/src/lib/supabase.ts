import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bukszojoolxjllgnpzfx.supabase.co/families";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1a3N6b2pvb2x4amxsZ25wemZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDEzODQsImV4cCI6MjA5MTMxNzM4NH0.Z3VtLF7Ve_Kfw3iBimksyEJ-24gwlJD39zSBVj4fg1A";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);