import React, { useState, useEffect } from "react";
import { getEnquiries, setEnquiryStatus, deleteEnquiry } from "../lib/enquiriesApi";
import { C, display, sans } from "../lib/theme";

export default function EnquiriesPanel() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("new"); // "new" | "all"

  async function load() {
    try {
      setLoading(true);
      const data = await getEnquiries();
      setEnquiries(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleHandled(enq) {
    const next = enq.status === "handled" ? "new" : "handled";
    try {
      await setEnquiryStatus(enq.id, next);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(enq) {
    if (window.confirm(`Delete the enquiry from ${enq.name}? This can't be undone.`)) {
      try {
        await deleteEnquiry(enq.id);
        load();
      } catch (err) {
        alert(err.message);
      }
    }
  }

  const shown = enquiries.filter((e) => (filter === "new" ? e.status === "new" : true));
  const newCount = enquiries.filter((e) => e.status === "new").length;

  return (
    <div style={panel}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: display, fontSize: 26, fontWeight: 600, color: C.ink, margin: 0 }}>Adoption Enquiries</h2>
          <p style={{ fontSize: 14, color: C.inkSoft, margin: "4px 0 0" }}>
            {newCount} new {newCount === 1 ? "enquiry" : "enquiries"} to review.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["new", "New"], ["all", "All"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ ...tab, ...(filter === k ? tabOn : {}) }}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: C.inkSoft }}>Loading enquiries…</p>
      ) : error ? (
        <p style={{ color: C.danger }}>{error}</p>
      ) : shown.length === 0 ? (
        <p style={{ color: C.inkSoft }}>
          {filter === "new" ? "No new enquiries right now. 🎉" : "No enquiries yet."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {shown.map((e) => (
            <div key={e.id} style={{ ...item, borderColor: e.status === "new" ? C.forest : C.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, color: C.ink, fontSize: 16 }}>{e.name}</span>
                    {e.status === "new"
                      ? <span style={badgeNew}>New</span>
                      : <span style={badgeDone}>Handled</span>}
                  </div>
                  <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>
                    Interested in <strong style={{ color: C.forest }}>{e.dog_name || "a dog"}</strong>
                    {" · "}{new Date(e.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => toggleHandled(e)} style={actionGhost}>
                    {e.status === "handled" ? "Mark as new" : "Mark handled"}
                  </button>
                  <button onClick={() => remove(e)} style={actionDanger}>Delete</button>
                </div>
              </div>

              {e.message && (
                <p style={{ fontFamily: sans, fontSize: 14.5, lineHeight: 1.55, color: C.ink, margin: "12px 0 0", whiteSpace: "pre-wrap" }}>{e.message}</p>
              )}

              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Your enquiry about ${e.dog_name || "a REAN dog"}`)}`} style={contactLink}>✉️ {e.email}</a>
                {e.phone && <a href={`tel:${e.phone}`} style={contactLink}>📞 {e.phone}</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const panel = { background: C.white, border: `1px solid ${C.line}`, borderRadius: 24, padding: "32px 28px", boxShadow: "0 24px 60px -36px rgba(31,74,40,.35)" };
const tab = { padding: "8px 16px", fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.ink, background: C.white, border: `1px solid ${C.line}`, borderRadius: 999, cursor: "pointer" };
const tabOn = { background: C.forest, color: C.white, borderColor: C.forest };
const item = { padding: "16px 18px", border: `1px solid ${C.line}`, borderRadius: 16, background: "#fff" };
const badgeNew = { fontSize: 11, fontWeight: 700, color: C.white, background: C.forest, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: ".04em" };
const badgeDone = { fontSize: 11, fontWeight: 700, color: C.inkSoft, background: C.paperDeep, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: ".04em" };
const actionGhost = { background: "none", border: `1px solid ${C.line}`, padding: "6px 14px", borderRadius: 999, fontFamily: sans, fontSize: 13, cursor: "pointer", fontWeight: 500, color: C.ink, whiteSpace: "nowrap" };
const actionDanger = { background: "none", border: "none", padding: "6px 10px", fontFamily: sans, fontSize: 13, cursor: "pointer", fontWeight: 600, color: C.danger };
const contactLink = { fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.forest, textDecoration: "none" };
