import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL não configurado no ambiente (.env)");
  }

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE ou SUPABASE_ANON_KEY não configurado no ambiente (.env)");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}


