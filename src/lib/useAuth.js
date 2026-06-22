import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/**
 * Tracks the current Supabase auth session.
 * Returns { session, loading } — `loading` is true until the initial
 * session check resolves, so the UI doesn't flash the login screen
 * for an already-signed-in admin.
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the existing session on mount.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Keep it in sync with sign-in / sign-out / token refresh.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

export async function signOut() {
  await supabase.auth.signOut();
}
