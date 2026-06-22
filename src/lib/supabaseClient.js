import { createClient } from "@supabase/supabase-js";

// Supabase client.
// Keys come from environment variables so they are never hardcoded in source.
// Create a .env file in the project root (see .env.example) with:
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
// The anon key is safe to expose in the browser — row-level security on the
// database and storage policies are what actually protect your data.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // A clear, early error beats a confusing "fetch failed" later on.
  console.error(
    "Missing Supabase environment variables. Add VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_ANON_KEY to your .env file (and to your Vercel project settings)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
