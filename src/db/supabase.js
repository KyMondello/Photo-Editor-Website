import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseClient = createClient(
  "https://hgqbrvezakfzludnswmd.supabase.co",
  "sb_publishable_qw_nQS11KmFAJchOn6JKQg_fKjFguN6"
);

export default supabaseClient;

