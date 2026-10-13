import React, { useEffect, useState } from "react";
import { CalendarDays, UploadCloud, Trash2, FileText, Image as ImageIcon, RefreshCw } from "lucide-react";
import Layout from "../components/Layout";
import { Crumbs } from "../components/UIComponents";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/uploaded-calendars`;
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const inputStyle = { width: "100%", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: 9, fontSize: 14, boxSizing: "border-box", background: "#fff" };
const buttonStyle = { border: 0, borderRadius: 9, padding: "11px 15px", background: "#0b55f4", color: "#fff", fontWeight: 700, cursor: "pointer" };

export default function CalendarUpload() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = String(user.role || "").toLowerCase();
  const [calendars, setCalendars] = useState([]);
  const [name, setName] = useState("");
  const [month, setMonth] = useState("January");
  const [year, setYear] = useState("2027");
  const [category, setCategory] = useState("general");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCalendars = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not load calendars.");
      setCalendars(data.calendars || []);
    } catch (e) {
      setError(e.message || "Could not load calendars. Check the backend connection.");
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchCalendars(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage(""); setError("");
    if (!file) return setError("Please choose a calendar image or PDF.");
    const body = new FormData();
    body.append("name", name.trim());
    body.append("month", month);
    body.append("year", year);
    body.append("category", category);
    body.append("calendarFile", file);
    setBusy(true);
    try {
      const response = await fetch(API_URL, { method: "POST", headers: { "X-User-Role": role }, body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Upload failed.");
      setCalendars(current => [data.calendar, ...current]);
      setName(""); setCategory("general"); setFile(null);
      event.target.reset();
      setMessage("Calendar uploaded. It is now available to other users.");
    } catch (e) { setError(e.message || "Upload failed."); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this uploaded calendar?")) return;
    setError(""); setMessage("");
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: { "X-User-Role": role } });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Delete failed.");
      setCalendars(current => current.filter(item => item._id !== id));
      setMessage("Calendar deleted.");
    } catch (e) { setError(e.message || "Delete failed."); }
  };

  const fileUrl = (url) => url?.startsWith("http") ? url : `${API_BASE_URL}${url || ""}`;

  if (role !== "ho") return <Layout active="Calendar Upload"><div style={{ background: "#fff", padding: 28, borderRadius: 14 }}><h2>Access denied</h2><p>Only HO users can upload or manage calendars.</p></div></Layout>;

  return <Layout role="ho" active="Calendar Upload">
    <Crumbs items={["Calendar Management", "Upload Calendars"]} />
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      <div><h1 style={{ margin: "0 0 6px", color: "#111827", fontSize: 27 }}>Calendar Library</h1><p style={{ margin: 0, color: "#6b7280" }}>Upload calendar designs once and make them available to the team.</p></div>
      <button onClick={fetchCalendars} style={{ ...buttonStyle, background: "#fff", color: "#374151", border: "1px solid #d1d5db", display: "flex", alignItems: "center", gap: 8 }}><RefreshCw size={16}/> Refresh</button>
    </div>

    {(message || error) && <div role="status" style={{ padding: 12, borderRadius: 9, marginBottom: 16, background: error ? "#fef2f2" : "#ecfdf5", color: error ? "#991b1b" : "#065f46" }}>{error || message}</div>}

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 20, alignItems: "start" }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: 22, border: "1px solid #e5e7eb", borderRadius: 14, boxShadow: "0 4px 16px rgba(15,23,42,.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><span style={{ background: "#eff6ff", padding: 10, borderRadius: 10, color: "#0b55f4" }}><UploadCloud size={22}/></span><div><h2 style={{ margin: 0, fontSize: 18 }}>Upload a calendar</h2><p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 12 }}>JPG, PNG, WEBP or PDF · max 15 MB</p></div></div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Calendar name</label><input required maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cardiology Calendar V1" style={{ ...inputStyle, marginBottom: 14 }}/>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Month</label><select value={month} onChange={e => setMonth(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }}>{months.map(m => <option key={m}>{m}</option>)}</select></div>
          <div><label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Year</label><input required type="number" min="2000" max="2100" value={year} onChange={e => setYear(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }}/></div>
        </div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Category (optional)</label><input value={category} onChange={e => setCategory(e.target.value)} maxLength={50} placeholder="General, Festival, Health..." style={{ ...inputStyle, marginBottom: 14 }}/>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Calendar file</label><input required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: 9, marginBottom: 18 }}/>
        {file && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}
        <button disabled={busy} type="submit" style={{ ...buttonStyle, width: "100%", opacity: busy ? .65 : 1 }}>{busy ? "Uploading..." : "Upload calendar"}</button>
      </form>

      <section style={{ minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h2 style={{ margin: 0, fontSize: 19 }}>Uploaded calendars</h2><span style={{ fontSize: 12, color: "#6b7280" }}>{calendars.length} total</span></div>
        {loading ? <p style={{ color: "#6b7280" }}>Loading calendars...</p> : calendars.length === 0 ? <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 30, textAlign: "center", color: "#64748b" }}><CalendarDays size={30}/><p>No calendars uploaded yet.</p></div> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 210px), 1fr))", gap: 14 }}>
          {calendars.map(item => <article key={item._id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            {item.fileUrl?.toLowerCase().endsWith(".pdf") ? <a href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer" style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#475569", flexDirection: "column", gap: 8, textDecoration: "none" }}><FileText size={32}/><span>Open PDF</span></a> : <a href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer"><img src={fileUrl(item.fileUrl)} alt={item.name} style={{ width: "100%", height: 150, objectFit: "contain", background: "#f8fafc", display: "block" }}/></a>}
            <div style={{ padding: 12 }}><strong style={{ display: "block", fontSize: 14 }}>{item.name}</strong><div style={{ fontSize: 12, color: "#6b7280", margin: "5px 0 12px" }}>{item.month} {item.year} · {item.category}</div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><a href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer" style={{ color: "#0b55f4", fontSize: 12, fontWeight: 700 }}>View file</a><button onClick={() => remove(item._id)} title="Delete calendar" style={{ border: "1px solid #fecaca", color: "#b91c1c", background: "#fff", borderRadius: 7, padding: 7, cursor: "pointer" }}><Trash2 size={15}/></button></div></div>
          </article>)}
        </div>}
      </section>
    </div>
  </Layout>;
}
