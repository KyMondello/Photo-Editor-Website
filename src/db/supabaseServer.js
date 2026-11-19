// supabaseServer.js
// Supabase client for the Node server only. Uses the service-role key,
// which bypasses Row Level Security, so it must never be sent to the browser.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
}

export default createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});
