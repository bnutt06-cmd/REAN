import React, { useState } from "react";
import { createDogListing } from "../lib/dogsApi";
import { C, display, sans } from "../lib/theme";

const STATUS_OPTIONS = [
  { value: "romania", label: "In Romania" },
  { value: "uk_foster", label: "In the UK (Foster)" },
  { value: "uk_kennels", label: "In the UK (Kennels)" },
  { value: "adopted", label: "Adopted" },
];
const SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];
const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];
const COMPAT = [
  { key: "goodWithDogs", label: "Good with dogs" },
  { key: "goodWithCats", label: "Good with cats" },
  { key: "goodWithKids", label: "Good with kids" },
  { key: "neutered", label: "Neutered / spayed" },
  { key: "vaccinated", label: "Vaccinated" },
];

const EMPTY = {
  name: "",
  status: "romania",
  age: "",
  size: "medium",
  gender: "female",
  bio: "",
  goodWithDogs: false,
  goodWithCats: false,
  goodWithKids: false,
  neutered: false,
  vaccinated: false,
};

export default function AddDogForm() {
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // object URLs
  const [progress, setProgress] = useState(null); // {done,total} | null
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  function handleFiles(e) {
    const picked = Array.from(e.target.files || []);
    // Revoke old preview URLs to avoid memory leaks.
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(picked);
    setPreviews(picked.map((f) => URL.createObjectURL(f)));
  }

  function removeFile(index) {
    URL.revokeObjectURL(previews[index]);
    setFiles((fs) => fs.filter((_, i) => i !== index));
    setPreviews((ps) => ps.filter((_, i) => i !== index));
  }

  function resetForm() {
    previews.forEach((u) => URL.revokeObjectURL(u));
    setForm(EMPTY);
    setFiles([]);
    setPreviews([]);
    setProgress(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "idle", message: "" });

    if (!form.name.trim()) {
      setStatus({ type: "error", message: "Please give the dog a name." });
      return;
    }

    setStatus({ type: "saving", message: "" });
    try {
      const dog = await createDogListing(form, files, (done, total) =>
        setProgress({ done, total })
      );
      setStatus({ type: "success", message: `${dog.name} has been added.` });
      resetForm();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
      setProgress(null);
    }
  }

  const saving = status.type === "saving";

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: sans }} noValidate>
      <h2 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.ink, margin: "0 0 4px" }}>
        Add a new dog
      </h2>
      <p style={{ fontSize: 14, color: C.inkSoft, margin: "0 0 24px" }}>
        Fill in the details and upload photos. The listing goes live once saved.
      </p>

      {/* Name + Age */}
      <div style={row2}>
        <Field label="Name">
          <input style={input} value={form.name} onChange={set("name")} placeholder="e.g. Luca" />
        </Field>
        <Field label="Age">
          <input style={input} value={form.age} onChange={set("age")} placeholder="e.g. 2 years" />
        </Field>
      </div>

      {/* Status + Size + Gender */}
      <div style={row3}>
        <Field label="Status">
          <select style={input} value={form.status} onChange={set("status")}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Size">
          <select style={input} value={form.size} onChange={set("size")}>
            {SIZE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Gender">
          <select style={input} value={form.gender} onChange={set("gender")}>
            {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>

      {/* Bio */}
      <Field label="Bio">
        <textarea
          style={{ ...input, minHeight: 120, resize: "vertical", lineHeight: 1.5 }}
          value={form.bio}
          onChange={set("bio")}
          placeholder="Tell their story — temperament, history, what kind of home suits them…"
        />
      </Field>

      {/* Compatibility */}
      <Field label="Compatibility & care">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {COMPAT.map((c) => (
            <label key={c.key} style={{ ...chip, ...(form[c.key] ? chipOn : {}) }}>
              <input
                type="checkbox"
                checked={form[c.key]}
                onChange={set(c.key)}
                style={{ accentColor: C.forest }}
              />
              {c.label}
            </label>
          ))}
        </div>
      </Field>

      {/* Photos */}
      <Field label="Photos">
        <label style={dropzone}>
          <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.forest }}>Choose images</span>
          <span style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>
            {files.length ? `${files.length} selected` : "JPG or PNG · you can pick several"}
          </span>
        </label>

        {previews.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {previews.map((src, i) => (
              <div key={src} style={thumb}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button type="button" onClick={() => removeFile(i)} style={thumbX} aria-label="Remove photo">×</button>
              </div>
            ))}
          </div>
        )}
      </Field>

      {/* Progress + status */}
      {progress && (
        <p style={{ fontSize: 14, color: C.inkSoft, margin: "0 0 12px" }}>
          Uploading photo {progress.done} of {progress.total}…
        </p>
      )}
      {status.type === "error" && (
        <p style={{ fontSize: 14, color: C.danger, margin: "0 0 12px" }} role="alert">{status.message}</p>
      )}
      {status.type === "success" && (
        <p style={{ fontSize: 14, color: C.forest, fontWeight: 600, margin: "0 0 12px" }} role="status">
          ✓ {status.message}
        </p>
      )}

      <button type="submit" disabled={saving} style={{ ...submit, opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving…" : "Save dog listing"}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  fontFamily: sans,
  fontSize: 15,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  outline: "none",
};
const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const row3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 };
const chip = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 14px",
  fontSize: 14,
  fontWeight: 500,
  color: C.ink,
  background: C.white,
  border: `1px solid ${C.line}`,
  borderRadius: 999,
  cursor: "pointer",
};
const chipOn = { borderColor: C.forest, background: "#eef4ee", color: C.forestDeep };
const dropzone = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px 16px",
  textAlign: "center",
  background: C.paper,
  border: `1.5px dashed ${C.line}`,
  borderRadius: 16,
  cursor: "pointer",
};
const thumb = {
  position: "relative",
  width: 84,
  height: 84,
  borderRadius: 12,
  overflow: "hidden",
  border: `1px solid ${C.line}`,
};
const thumbX = {
  position: "absolute",
  top: 4,
  right: 4,
  width: 22,
  height: 22,
  border: "none",
  borderRadius: 999,
  background: "rgba(32,39,31,.8)",
  color: "#fff",
  fontSize: 15,
  lineHeight: "20px",
  cursor: "pointer",
};
const submit = {
  padding: "13px 28px",
  fontFamily: sans,
  fontSize: 16,
  fontWeight: 600,
  color: C.white,
  background: C.forest,
  border: "none",
  borderRadius: 999,
  cursor: "pointer",
};
