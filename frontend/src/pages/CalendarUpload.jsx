import React, { useEffect, useState } from "react";
import { CalendarDays, UploadCloud, Trash2, RefreshCw } from "lucide-react";
import Layout from "../components/Layout";
import { Crumbs } from "../components/UIComponents";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/uploaded-calendars`;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const field = { width: "100%", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: 9, boxSizing: "border-box", background: "#fff", marginBottom: 14 };
const primary = { border: 0, borderRadius: 9, padding: "11px 15px", background: "#0b55f4", color: "#fff", fontWeight: 700, cursor: "pointer" };

export default function CalendarUpload() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = String(user.role || "").toLowerCase();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [month, setMonth] = useState("January");
  const [year, setYear] = useState("2027");
  const [sequence, setSequence] = useState("1");
  const [category, setCategory] = useState("general");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load calendars.");
      setItems((data.calendars || []).filter(item => !item.isDeleted));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!file) { setPreviewUrl(""); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setMessage("");
    if (!file) { setError("Choose a calendar image first."); return; }
    const body = new FormData();
    body.append("name", name); body.append("month", month); body.append("year", year); body.append("sequence", sequence);
    body.append("category", category); body.append("calendarFile", file);
    setSaving(true);
    try {
      const response = await fetch(API_URL, { method: "POST", headers: { "X-User-Role": role }, body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Upload failed.");
      setItems(current => [data.calendar, ...current.filter(item => item._id !== data.calendar._id)]);
      setName(""); setCategory("general"); setSequence("1"); setFile(null); e.target.reset();
      setMessage("Calendar uploaded and made available to users.");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this calendar?")) return;
    setError(""); setMessage("");
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: { "X-User-Role": role } });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Delete failed.");
      setItems(current => current.filter(item => item._id !== id));
      setMessage(data.message || "Calendar removed from the library.");
    } catch (err) { setError(err.message); }
  };
  const fileUrl = url => url?.startsWith("http") ? url : `${API_BASE_URL}${url || ""}`;

  if (role !== "ho") return <Layout><div style={{ background: "#fff", padding: 24, borderRadius: 12 }}>Only HO users can manage calendars.</div></Layout>;

  return <Layout role="ho" active="Upload Calendars">
    <Crumbs items={["Calendar Management", "Upload Calendars"]} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
      <div><h1 style={{ margin: "0 0 6px", fontSize: 28, color: "#111827" }}>Calendar Library</h1><p style={{ margin: 0, color: "#6b7280" }}>Upload a calendar once for the whole team to use.</p></div>
      <button onClick={load} disabled={loading} style={{ ...primary, background: "#fff", color: "#374151", border: "1px solid #d1d5db", display: "flex", gap: 8, alignItems: "center" }}><RefreshCw size={16}/> {loading ? "Refreshing..." : "Refresh"}</button>
    </div>
    {(error || message) && <div role="status" style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: error ? "#fef2f2" : "#ecfdf5", color: error ? "#991b1b" : "#065f46" }}>{error || message}</div>}

    <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "clamp(16px, 3vw, 28px)", boxShadow: "0 4px 18px rgba(15,23,42,.04)" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 12, background: "#eff6ff", color: "#155eef" }}><UploadCloud size={23}/></div>
        <div><h2 style={{ margin: 0, fontSize: 20, color: "#111827" }}>Upload a calendar</h2><p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>JPG, PNG or WEBP · maximum 15 MB</p></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: "0 18px" }}>
        <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 7, color: "#334155" }}>Calendar name</label><input required maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Calendar Design V1" style={field}/></div>
        <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 7, color: "#334155" }}>Category</label><input maxLength={50} value={category} onChange={e => setCategory(e.target.value)} placeholder="Festival, Health, General..." style={field}/></div>
        <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 7, color: "#334155" }}>Month</label><select value={month} onChange={e => setMonth(e.target.value)} style={field}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select></div>
        <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 7, color: "#334155" }}>Year</label><input type="number" min="2000" max="2100" required value={year} onChange={e => setYear(e.target.value)} style={field}/></div>
        <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 7, color: "#334155" }}>Display sequence</label><input type="number" min="1" step="1" required value={sequence} onChange={e => setSequence(e.target.value)} style={field}/><p style={{ marginTop: -8, marginBottom: 14, color: "#64748b", fontSize: 12 }}>1 appears first in that month, 2 appears second, and so on.</p></div>
      </div>

      <div style={{ marginTop: 4 }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#334155" }}>Calendar image</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 18, alignItems: "start" }}>
          <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, background: "#f8fafc", padding: 16 }}>
            {previewUrl ? <img src={previewUrl} alt="Selected calendar preview" style={{ width: "100%", maxHeight: 320, objectFit: "contain", display: "block", borderRadius: 8, background: "#fff" }}/> : <div style={{ minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#64748b" }}><CalendarDays size={38}/><strong>No image selected</strong><span style={{ fontSize: 13 }}>Your image preview will appear here</span></div>}
          </div>
          <div style={{ padding: "8px 0" }}>
            <p style={{ marginTop: 0, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>{file ? <><strong style={{ color: "#0f172a" }}>Selected:</strong> {file.name}<br/><span style={{ fontSize: 12 }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</span></> : "Choose an image to preview it before uploading. You can change the image any time before submitting."}</p>
            <input id="calendar-image-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const selected = e.target.files?.[0] || null; if (selected && selected.size > 15 * 1024 * 1024) { setError("Image must be 15 MB or smaller."); e.target.value = ""; return; } setError(""); setFile(selected); }} style={{ display: "none" }}/>
            <label htmlFor="calendar-image-input" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff", color: "#1d4ed8", fontWeight: 700, fontSize: 13, cursor: "pointer" }}><UploadCloud size={17}/>{file ? "Change image" : "Choose image"}</label>
            {file && <button type="button" onClick={() => { setFile(null); const input = document.getElementById("calendar-image-input"); if (input) input.value = ""; }} style={{ marginLeft: 8, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff", color: "#475569", cursor: "pointer" }}>Remove</button>}
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 12 }}>Supported formats: JPG, PNG, WEBP. Maximum size: 15 MB.</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22, paddingTop: 18, borderTop: "1px solid #eef2f7" }}>
        <button type="submit" disabled={saving} style={{ ...primary, minWidth: 190, padding: "13px 20px", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 9, opacity: saving ? .7 : 1 }}><UploadCloud size={17}/>{saving ? "Uploading..." : "Upload calendar"}</button>
      </div>
    </form>

    <section style={{ marginTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div><h2 style={{ margin: "0 0 5px", fontSize: 22, color: "#0f172a" }}>Available calendars</h2><p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>Uploaded designs available to the team.</p></div>
        <span style={{ borderRadius: 999, background: "#eaf2ff", color: "#1d4ed8", fontSize: 13, fontWeight: 700, padding: "6px 11px" }}>{items.length} {items.length === 1 ? "calendar" : "calendars"}</span>
      </div>
      {loading ? <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 30, textAlign: "center", color: "#64748b" }}>Loading calendars...</div> : items.length === 0 ? <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 14, padding: 36, textAlign: "center", color: "#64748b" }}><CalendarDays size={36}/><h3 style={{ color: "#334155", marginBottom: 6 }}>Your calendar library is empty</h3><p style={{ margin: 0 }}>Upload your first calendar above and it will appear here.</p></div> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 245px), 1fr))", gap: 16 }}>
          {items.map(item => <article key={item._id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.035)" }}>
            <a href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer" aria-label={`View ${item.name}`}><img src={fileUrl(item.fileUrl)} alt={item.name} style={{ display: "block", width: "100%", height: 210, objectFit: "contain", background: "#f8fafc", borderBottom: "1px solid #eef2f7" }}/></a>
            <div style={{ padding: 15 }}><strong style={{ display: "block", color: "#0f172a", fontSize: 15, overflowWrap: "anywhere" }}>{item.name}</strong><div style={{ color: "#64748b", fontSize: 12, margin: "7px 0 14px" }}>{item.month} {item.year} · Order {item.sequence} · {item.category}</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><a href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", fontWeight: 600, fontSize: 13 }}>View full image</a><button type="button" onClick={() => remove(item._id)} title="Delete calendar" aria-label={`Delete ${item.name}`} style={{ color: "#b91c1c", background: "#fff", border: "1px solid #fecaca", borderRadius: 8, padding: 8, cursor: "pointer", display: "grid", placeItems: "center" }}><Trash2 size={16}/></button></div></div>
          </article>)}
        </div>}
    </section>
  </Layout>;
}
