import React from "react";
import { signOut } from "../lib/useAuth";
import AddDogForm from "./AddDogForm";
import { C, display, sans } from "../lib/theme";

/**
 * The protected admin view. Rendered only when a session exists.
 */
export default function Dashboard({ session }) {
  return (
    <div style={{ minHeight: "100vh", background: C.paper, fontFamily: sans }}>
      <header style={header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/rean-logo.png" alt="REAN" width={40} height={40} />
          <div>
            <div style={{ fontFamily: display, fontSize: 20, fontWeight: 600, color: C.ink, lineHeight: 1 }}>REAN Admin</div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{session?.user?.email}</div>
          </div>
        </div>
        <button onClick={signOut} style={signOutBtn}>Sign out</button>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 80px" }}>
        <div style={panel}>
          <AddDogForm />
        </div>
      </main>
    </div>
  );
}

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 20px",
  background: C.white,
  borderBottom: `1px solid ${C.line}`,
};
const signOutBtn = {
  padding: "8px 16px",
  fontFamily: sans,
  fontSize: 14,
  fontWeight: 500,
  color: C.ink,
  background: C.white,
  border: `1px solid ${C.line}`,
  borderRadius: 999,
  cursor: "pointer",
};
const panel = {
  background: C.white,
  border: `1px solid ${C.line}`,
  borderRadius: 24,
  padding: "32px 28px",
  boxShadow: "0 24px 60px -36px rgba(31,74,40,.35)",
};
