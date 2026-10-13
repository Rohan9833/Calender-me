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
      <div><h1 style={{ margin: "0 0 6px", fontSize: 27, color: "#111827" }}>Calendar Library</h1><p style={{ margin: 0, color: "#6b7280" }}>Upload a calendar once for the whole team to use.</p></div>
      <button onClick={load} style={{ ...primary, background: "#fff", color: "#374151", border: "1px solid #d1d5db", display: "flex", gap: 8, alignItems: "center" }}><RefreshCw size={16}/> Refresh</button>
    </div>
    {(error || message) && <div role="status" style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: error ? "#fef2f2" : "#ecfdf5", color: error ? "#991b1b" : "#065f46" }}>{error || message}</div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))", gap: 20, alignItems: "start" }}>
      <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 22 }}>
        <h2 style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 19, marginTop: 0 }}><UploadCloud size={22}/> Upload calendar</h2>
        <p style={{ color: "#6b7280", fontSize: 13 }}>JPG, PNG or WEBP · maximum 15 MB</p>
        <label>Calendar name</label><input required maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Calendar Design V1" style={field}/>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label>Month</label><select value={month} onChange={e => setMonth(e.target.value)} style={field}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select></div>
          <div><label>Year</label><input type="number" min="2000" max="2100" required value={year} onChange={e => setYear(e.target.value)} style={field}/></div>
        </div>
        <label>Display sequence</label><input type="number" min="1" step="1" required value={sequence} onChange={e => setSequence(e.target.value)} style={field}/><p style={{ marginTop: -8, marginBottom: 14, color: "#6b7280", fontSize: 12 }}>1 appears first in that month, 2 appears second, and so on.</p>
        <label>Category</label><input maxLength={50} value={category} onChange={e => setCategory(e.target.value)} placeholder="Festival, Health, General..." style={field}/>
        <label>Calendar image</label><input required type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} style={{ ...field, padding: 8 }}/>
        <button type="submit" disabled={saving} style={{ ...primary, width: "100%", opacity: saving ? .7 : 1 }}>{saving ? "Uploading..." : "Upload calendar"}</button>
      </form>
      <section style={{ minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h2 style={{ margin: 0, fontSize: 19 }}>Available calendars</h2><span style={{ color: "#6b7280", fontSize: 13 }}>{items.length} total</span></div>
        {loading ? <p>Loading calendars...</p> : items.length === 0 ? <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 28, textAlign: "center", color: "#64748b" }}><CalendarDays size={30}/><p>No calendars uploaded yet.</p></div> :
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: 14 }}>
            {items.map(item => <article key={item._id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <a href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer"><img src={fileUrl(item.fileUrl)} alt={item.name} style={{ display: "block", width: "100%", height: 160, objectFit: "contain", background: "#f8fafc" }}/></a>
              <div style={{ padding: 12 }}><strong>{item.name}</strong><div style={{ color: "#6b7280", fontSize: 12, margin: "5px 0 12px" }}>{item.month} {item.year} · Order {item.sequence} · {item.category}</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><a href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer">View image</a><button onClick={() => remove(item._id)} title="Delete calendar" style={{ color: "#b91c1c", background: "#fff", border: "1px solid #fecaca", borderRadius: 7, padding: 7, cursor: "pointer" }}><Trash2 size={15}/></button></div></div>
            </article>)}
          </div>}
      </section>
    </div>
  </Layout>;
}
