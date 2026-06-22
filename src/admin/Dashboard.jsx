import React, { useState, useEffect } from "react";
import { signOut } from "../lib/useAuth";
import { getDogListings, deleteDogListing } from "../lib/dogsApi";
import AddDogForm from "./AddDogForm";
import { C, display, sans } from "../lib/theme";

export default function Dashboard({ session }) {
  const [view, setView] = useState("list"); // "list" | "form"
  const [dogs, setDogs] = useState([]);
  const [editingDog, setEditingDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDogs() {
    try {
      setLoading(true);
      const data = await getDogListings();
      setDogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDogs();
  }, []);

  async function handleDelete(id, name) {
    if (window.confirm(`Are you absolutely sure you want to delete ${name}?`)) {
      try {
        await deleteDogListing(id);
        loadDogs();
      } catch (err) {
        alert(`Error deleting dog: ${err.message}`);
      }
    }
  }

  function handleEdit(dog) {
    setEditingDog(dog);
    setView("form");
  }

  function handleAddNew() {
    setEditingDog(null);
    setView("form");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.paper, fontFamily: sans }}>
      <header style={header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/rean-logo.png" alt="REAN" width={40} height={40} />
          <div>
            <div style={{ fontFamily: display, fontSize: 20, fontWeight: 600, color: C.ink, lineHeight: 1 }}>REAN Manager</div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{session?.user?.email}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/" style={{ ...signOutBtn, textDecoration: "none", display: "inline-block" }}>View site ↗</a>
          <button onClick={signOut} style={signOutBtn}>Sign out</button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>
        {view === "list" ? (
          <div style={panel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: display, fontSize: 26, fontWeight: 600, color: C.ink, margin: 0 }}>Active Listings</h2>
                <p style={{ fontSize: 14, color: C.inkSoft, margin: "4px 0 0" }}>Review, edit, or remove dog profiles from the website.</p>
              </div>
              <button onClick={handleAddNew} style={addBtn}>+ Add New Dog</button>
            </div>

            {loading ? (
              <p style={{ color: C.inkSoft }}>Loading dog profiles from Supabase...</p>
            ) : error ? (
              <p style={{ color: C.danger }}>{error}</p>
            ) : dogs.length === 0 ? (
              <p style={{ color: C.inkSoft }}>No dogs found. Click '+ Add New Dog' to create your first listing!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {dogs.map((dog) => (
                  <div key={dog.id} style={itemRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={avatar}>
                        {dog.photo_urls?.[0] ? (
                          <img src={dog.photo_urls[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : "🐶"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: C.ink, fontSize: 16 }}>{dog.name}</div>
                        <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>
                          {dog.gender} • {dog.age} • <span style={{ textTransform: "capitalize", fontWeight: 600, color: dog.status === "adopted" ? C.rust : C.forest }}>{dog.status.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleEdit(dog)} style={editAction}>Edit</button>
                      <button onClick={() => handleDelete(dog.id, dog.name)} style={deleteAction}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={panel}>
            <AddDogForm
              editingDog={editingDog}
              onCancel={() => setView("list")}
              onSaved={() => {
                setView("list");
                loadDogs();
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

const header = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: C.white, borderBottom: `1px solid ${C.line}` };
const signOutBtn = { padding: "8px 16px", fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.ink, background: C.white, border: `1px solid ${C.line}`, borderRadius: 999, cursor: "pointer" };
const panel = { background: C.white, border: `1px solid ${C.line}`, borderRadius: 24, padding: "32px 28px", boxShadow: "0 24px 60px -36px rgba(31,74,40,.35)" };
const addBtn = { padding: "10px 20px", fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.white, background: C.forest, border: "none", borderRadius: 999, cursor: "pointer" };
const itemRow = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", border: `1px solid ${C.line}`, borderRadius: 16, background: "#fff" };
const avatar = { width: 48, height: 48, borderRadius: 10, background: C.paper, display: "grid", placeItems: "center", overflow: "hidden", fontSize: 20 };
const editAction = { background: "none", border: `1px solid ${C.line}`, padding: "6px 14px", borderRadius: 999, fontFamily: sans, fontSize: 13, cursor: "pointer", fontWeight: 500, color: C.ink };
const deleteAction = { background: "none", border: "none", padding: "6px 14px", fontFamily: sans, fontSize: 13, cursor: "pointer", fontWeight: 600, color: C.danger };