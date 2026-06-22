import React from "react";
import { useAuth } from "../lib/useAuth";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import { C, sans } from "../lib/theme";

/**
 * Entry point for the admin area. Acts as the auth gate:
 *   - while the session is loading → a neutral splash
 *   - no session → the login page
 *   - session present → the protected dashboard
 *
 * Mount this wherever the admin lives (e.g. a separate route, or behind a
 * URL check). It is fully self-contained and independent of the public site.
 */
export default function AdminApp() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.paper, fontFamily: sans, color: C.inkSoft }}>
        Loading…
      </div>
    );
  }

  return session ? <Dashboard session={session} /> : <LoginPage />;
}
