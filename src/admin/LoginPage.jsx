import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { C, display, sans } from "../lib/theme";

/**
 * Admin login screen. Uses supabase.auth.signInWithPassword.
 * On success the useAuth hook (in AdminApp) picks up the new session and
 * swaps this screen for the dashboard automatically — no manual redirect.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Light client-side validation before hitting the network.
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (signInError) {
      // Keep the message generic so we don't reveal which field was wrong.
      setError("Those details didn't match. Please check and try again.");
      return;
    }
    // Success: AdminApp re-renders into the dashboard via the auth listener.
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <img src="/rean-logo.png" alt="REAN" width={64} height={64} style={{ display: "block", margin: "0 auto 20px" }} />
        <h1 style={title}>Admin sign in</h1>
        <p style={subtitle}>Manage dogs and site content.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 28 }} noValidate>
          <label style={label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            placeholder="you@rean.org.uk"
          />

          <label style={{ ...label, marginTop: 18 }} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            placeholder="••••••••"
          />

          {error && <p style={errorText} role="alert">{error}</p>}

          <button type="submit" disabled={submitting} style={{ ...button, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <a href="/" style={{ display: "block", textAlign: "center", marginTop: 20, fontFamily: sans, fontSize: 14, color: C.inkSoft, textDecoration: "none" }}>
          ← Back to the main site
        </a>
      </div>
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 20,
  background: C.paper,
  fontFamily: sans,
};
const card = {
  width: "100%",
  maxWidth: 400,
  background: C.white,
  border: `1px solid ${C.line}`,
  borderRadius: 24,
  padding: "40px 32px",
  boxShadow: "0 24px 60px -30px rgba(31,74,40,.4)",
};
const title = { fontFamily: display, fontSize: 28, fontWeight: 600, color: C.ink, textAlign: "center", margin: 0 };
const subtitle = { fontFamily: sans, fontSize: 15, color: C.inkSoft, textAlign: "center", margin: "8px 0 0" };
const label = { display: "block", fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 };
const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  fontFamily: sans,
  fontSize: 15,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  outline: "none",
};
const errorText = { fontFamily: sans, fontSize: 14, color: C.danger, margin: "16px 0 0" };
const button = {
  width: "100%",
  marginTop: 24,
  padding: "13px 16px",
  fontFamily: sans,
  fontSize: 16,
  fontWeight: 600,
  color: C.white,
  background: C.forest,
  border: "none",
  borderRadius: 999,
  cursor: "pointer",
};
