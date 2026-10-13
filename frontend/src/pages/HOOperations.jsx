import React, { useEffect, useState } from "react";
import { Search, RefreshCw, Users, Activity, ShieldCheck, Settings, Download, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getHODoctors, getHOHierarchy, getHOActivity, createHOUser, deleteHOUser, getHODeletedUsers, restoreHOUser } from "../api/hoAPI";

const styles = {
  card: { background:"#fff", border:"1px solid #e5eaf2", borderRadius:14, padding:18, boxShadow:"0 3px 12px rgba(15,23,42,.035)" },
  muted: { color:"#64748b", fontSize:13 },
  button: { border:"1px solid #d8e1ee", background:"#fff", color:"#1d4ed8", borderRadius:9, padding:"9px 12px", cursor:"pointer", fontWeight:650 },
  input: { border:"1px solid #dbe3ef", borderRadius:9, padding:"10px 12px", background:"#fff", minWidth:0, width:"100%", boxSizing:"border-box" },
};
const fmt = (value) => value ? new Date(value).toLocaleString() : "—";

export default function HOOperations({ page = "users" }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hqFilter, setHqFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [userForm, setUserForm] = useState({ role: "mr", userId: "", password: "", name: "", hq: "", region: "", zone: "", parentId: "" });

  const load = async () => {
    setLoading(true); setError("");
    try {
      if (page === "settings") {
        setRows([]);
      } else if (page === "deleted-users") { const data = await getHODeletedUsers(); setRows(data.users || []); setCounts({});
      } else if (page === "activity") {
        const data = await getHOActivity(); setRows(data.activities || []);
      } else if (page === "users" || page === "hierarchy") {
        const data = await getHOHierarchy(); setRows(data.users || []); setCounts(data.counts || {});
      } else {
        const data = await getHODoctors({ q: search, status, consent: page === "consent" ? "pending" : "all", input: page === "input" ? "pending" : "all" });
        setRows(data.doctors || []);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Could not load data. Check that the backend is running and connected to MongoDB.");
      setRows([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status]);
  const getUserRole = (row) => String(row.role || (row.mrId ? "mr" : row.flmId ? "flm" : row.slmId ? "slm" : row.tlmId ? "tlm" : "")).toLowerCase();
  const uniqueOptions = (key) => [...new Set(rows.map((row) => row[key]).filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))].sort((a, b) => a.localeCompare(b));
  const filtered = rows.filter((row) => {
    const q = search.toLowerCase().trim();
    const userLabel = [row.name,row.mrName,row.flmName,row.slmName,row.tlmName,row.userId,row.mrId,row.flmId,row.slmId,row.tlmId,row.role,row.hq,row.region,row.zone].filter(Boolean).join(" ").toLowerCase();
    const doctorLabel = [row.doctorName,row.mclCode,row.speciality,row.city,row.mr?.mrName,row.action,row.details,row.role,row.status].filter(Boolean).join(" ").toLowerCase();
    const searchMatch = !q || (page === "users" || page === "hierarchy" || page === "deleted-users" ? userLabel : page === "activity" ? doctorLabel : [row.doctorName,row.mclCode,row.speciality,row.city,row.mr?.mrName,row.mr?.mrId,row.mr?.hq,row.mr?.region,row.mr?.zone].filter(Boolean).join(" ").toLowerCase()).includes(q);
    if (!searchMatch) return false;
    if (page === "users" || page === "hierarchy") {
      if (roleFilter !== "all" && getUserRole(row) !== roleFilter) return false;
      if (hqFilter !== "all" && row.hq !== hqFilter) return false;
      if (regionFilter !== "all" && row.region !== regionFilter) return false;
      if (zoneFilter !== "all" && row.zone !== zoneFilter) return false;
    }
    return true;
  });

  const title = ({users:"Users Management", "deleted-users":"Deleted Users", hierarchy:"Organisation Hierarchy", activity:"Activity Log", consent:"Consent Tracker", input:"Input Given Tracker", settings:"System Settings"})[page] || "HO Operations";
  const exportCsv = () => {
    const safe = (value) => String(value ?? "").replace(/"/g, '""');
    const data = filtered.map(row => page === "activity"
      ? [row.action,row.role?.toUpperCase(),row.status,row.doctor?.doctorName,row.mr?.mrName,row.details,row.createdAt]
      : page === "deleted-users" ? [row.role,row.name,row.userId,row.deletedAt]
      : page === "users" || page === "hierarchy"
        ? [(row.role || (row.mrId ? "mr" : row.flmId ? "flm" : row.slmId ? "slm" : "tlm")).toUpperCase(),row.tlmName || row.slmName || row.flmName || row.mrName || row.userId,row.tlmId || row.slmId || row.flmId || row.mrId,row.hq,row.region,row.zone]
        : [row.doctorName,row.mclCode,row.speciality,row.city,row.mr?.mrName,row.approvalStatus,row.consentStatus,row.inputGivenStatus]);
    const csv = [page === "activity" ? ["Action","Role","Status","Doctor","MR","Details","Date"] : page === "deleted-users" ? ["Role","Name","ID","Deleted at"] : page === "users" || page === "hierarchy" ? ["Role","Name","ID","HQ","Region","Zone"] : ["Doctor","MCL","Speciality","City","MR","Approval","Consent","Input"], ...data].map(line => line.map(v => '"' + safe(v) + '"').join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8;"})); const a = document.createElement("a"); a.href = url; a.download = "ho-" + page + ".csv"; a.click(); URL.revokeObjectURL(url);
  };

  return <Layout role="ho" active={title}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:20}}>
      <div><div style={{fontSize:11,fontWeight:800,letterSpacing:".12em",color:"#2563eb",marginBottom:7}}>HEAD OFFICE • OPERATIONS</div><h1 style={{margin:0,fontSize:27,color:"#172033"}}>{title}</h1><p style={{...styles.muted,marginTop:8}}>Live records from the connected Calendar Me database.</p></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{page === "users" && <><button style={styles.button} onClick={()=>navigate("/ho/deleted-users")}>Deleted users / Restore</button><button style={{...styles.button,background:"#2563eb",color:"#fff"}} onClick={()=>setShowCreate(v=>!v)}>{showCreate ? "Cancel" : "+ Add user"}</button></>}<button style={styles.button} onClick={load}><RefreshCw size={14} style={{verticalAlign:"middle",marginRight:6}}/>Refresh</button>{page !== "settings" && <button style={styles.button} onClick={exportCsv}><Download size={14} style={{verticalAlign:"middle",marginRight:6}}/>Export CSV</button>}</div>
    </div>
    {(page === "users" || page === "hierarchy") && <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:16}}>{[["TLM",counts.tlm],["SLM",counts.slm],["FLM",counts.flm],["MR",counts.mr]].map(([label,value])=><div key={label} style={styles.card}><div style={styles.muted}>{label} accounts</div><div style={{fontSize:25,fontWeight:800,color:"#172033",marginTop:8}}>{value ?? "—"}</div></div>)}</div>}
    {page === "users" && showCreate && <form onSubmit={async e => { e.preventDefault(); setSavingUser(true); setError(""); try { await createHOUser(userForm); setUserForm({role:"mr",userId:"",password:"",name:"",hq:"",region:"",zone:"",parentId:""}); setShowCreate(false); await load(); } catch(err) { setError(err.response?.data?.message || "Could not create user"); } finally { setSavingUser(false); } }} style={{...styles.card,marginBottom:14}}>
      <h2 style={{margin:"0 0 14px",fontSize:18}}>Create account</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
        <select style={styles.input} value={userForm.role} onChange={e=>setUserForm(v=>({...v,role:e.target.value,parentId:""}))}><option value="mr">MR</option><option value="flm">FLM</option><option value="slm">SLM</option><option value="tlm">TLM</option></select>
        <input required style={styles.input} placeholder="Employee / User ID" value={userForm.userId} onChange={e=>setUserForm(v=>({...v,userId:e.target.value}))}/>
        <input required style={styles.input} placeholder="Full name" value={userForm.name} onChange={e=>setUserForm(v=>({...v,name:e.target.value}))}/>
        <input required type="password" style={styles.input} placeholder="Initial password" value={userForm.password} onChange={e=>setUserForm(v=>({...v,password:e.target.value}))}/>
        <input style={styles.input} placeholder="HQ" value={userForm.hq} onChange={e=>setUserForm(v=>({...v,hq:e.target.value}))}/>
        <input style={styles.input} placeholder="Region" value={userForm.region} onChange={e=>setUserForm(v=>({...v,region:e.target.value}))}/>
        <input style={styles.input} placeholder="Zone" value={userForm.zone} onChange={e=>setUserForm(v=>({...v,zone:e.target.value}))}/>
        {userForm.role !== "tlm" && <input style={styles.input} placeholder={userForm.role==="mr"?"Parent FLM ID":userForm.role==="flm"?"Parent SLM ID":"Parent TLM ID"} value={userForm.parentId} onChange={e=>setUserForm(v=>({...v,parentId:e.target.value}))}/>}
      </div>
      <button disabled={savingUser} type="submit" style={{...styles.button,background:"#2563eb",color:"#fff",marginTop:14}}>{savingUser ? "Creating…" : "Create user"}</button>
    </form>}
    {page === "settings" ? <div style={styles.card}><div style={{display:"flex",gap:12,alignItems:"center"}}><Settings color="#2563eb"/><div><h2 style={{margin:"0 0 5px",fontSize:18}}>System status</h2><p style={styles.muted}>This panel reports application configuration without exposing secrets or changing production settings.</p></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginTop:18}}><div style={{padding:14,background:"#f8fafc",borderRadius:10}}><b>Backend API</b><p style={styles.muted}>Connected when this page successfully loads records.</p></div><div style={{padding:14,background:"#f8fafc",borderRadius:10}}><b>Database</b><p style={styles.muted}>MongoDB connection is managed by the backend environment.</p></div><div style={{padding:14,background:"#f8fafc",borderRadius:10}}><b>Access</b><p style={styles.muted}>HO user creation, deletion and restoration are available from Users Management.</p></div></div></div> : <>
      {page !== "deleted-users" && <div style={{...styles.card,marginBottom:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><div style={{position:"relative",flex:"1 1 240px"}}><Search size={16} color="#64748b" style={{position:"absolute",left:11,top:12}}/><input style={{...styles.input,paddingLeft:35}} value={search} onChange={e=>setSearch(e.target.value)} placeholder={page==="activity"?"Search actions, users, doctors…":"Search name, ID, HQ, region, zone…"}/></div>{(page==="users" || page==="hierarchy") && <><select aria-label="Filter by role" style={{...styles.input,width:145}} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}><option value="all">All roles</option><option value="tlm">TLM</option><option value="slm">SLM</option><option value="flm">FLM</option><option value="mr">MR</option></select><select aria-label="Filter by HQ" style={{...styles.input,width:155}} value={hqFilter} onChange={e=>setHqFilter(e.target.value)}><option value="all">All HQs</option>{uniqueOptions("hq").map(v=><option key={v} value={v}>{v}</option>)}</select><select aria-label="Filter by region" style={{...styles.input,width:155}} value={regionFilter} onChange={e=>setRegionFilter(e.target.value)}><option value="all">All regions</option>{uniqueOptions("region").map(v=><option key={v} value={v}>{v}</option>)}</select><select aria-label="Filter by zone" style={{...styles.input,width:155}} value={zoneFilter} onChange={e=>setZoneFilter(e.target.value)}><option value="all">All zones</option>{uniqueOptions("zone").map(v=><option key={v} value={v}>{v}</option>)}</select><button type="button" style={styles.button} onClick={()=>{setSearch("");setRoleFilter("all");setHqFilter("all");setRegionFilter("all");setZoneFilter("all");}}>Clear filters</button></>}{page!=="users"&&page!=="hierarchy"&&page!=="activity"&&<select style={{...styles.input,width:170}} value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All approval statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>}<span style={styles.muted}>{filtered.length} records</span></div>}
      <div style={{...styles.card,padding:0,overflow:"hidden"}}>{loading ? <div style={{padding:35,textAlign:"center",...styles.muted}}>Loading {title.toLowerCase()}…</div> : error ? <div style={{padding:24,color:"#b91c1c"}}>{error}<div style={{marginTop:12}}><button style={styles.button} onClick={load}>Try again</button></div></div> : filtered.length===0 ? <div style={{padding:36,textAlign:"center"}}><Users size={28} color="#94a3b8"/><h3 style={{marginBottom:5}}>No records found</h3><p style={styles.muted}>Try changing your search or filters.</p></div> : <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13,whiteSpace:"nowrap"}}><thead><tr>{(page==="activity"?["Action","Role","Status","Doctor","MR","Date"]:page==="deleted-users"?["Role","Name","ID","Deleted at","Action"]:page==="users"?["Role","Name","ID","HQ","Region","Zone","Parent","Action"]:page==="hierarchy"?["Role","Name","ID","HQ","Region","Zone","Parent"]:["Doctor","MCL Code","Speciality","City","MR","Approval","Consent","Input Given"]).map(h=><th key={h} style={{textAlign:"left",padding:"13px 14px",background:"#f8fafc",color:"#64748b",borderBottom:"1px solid #e5eaf2",fontSize:11,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{filtered.map((row,i)=><tr key={row._id||i}>{(page==="activity"?[row.action,row.role?.toUpperCase(),row.status,row.doctor?.doctorName,row.mr?.mrName,fmt(row.createdAt)]:page==="deleted-users"?[row.role?.toUpperCase(),row.name,row.userId,fmt(row.deletedAt),"RESTORE"]:page==="users"?[(row.role || (row.mrId?"mr":row.flmId?"flm":row.slmId?"slm":"tlm")).toUpperCase(),row.tlmName||row.slmName||row.flmName||row.mrName,row.tlmId||row.slmId||row.flmId||row.mrId,row.hq,row.region,row.zone,row.tlm?.tlmName||row.slm?.slmName||row.flm?.flmName||"—","DELETE"]:page==="hierarchy"?[row.role || (row.mrId?"mr":row.flmId?"flm":row.slmId?"slm":"tlm"),row.tlmName||row.slmName||row.flmName||row.mrName||row.userId,row.tlmId||row.slmId||row.flmId||row.mrId,row.hq,row.region,row.zone,row.tlm?.tlmName||row.slm?.slmName||row.flm?.flmName||"—"]:[row.doctorName,row.mclCode,row.speciality,row.city,row.mr?.mrName,row.approvalStatus,row.consentStatus,row.inputGivenStatus]).map((cell,j)=><td key={j} style={{padding:"13px 14px",borderBottom:"1px solid #edf1f7",color:"#334155"}}>{page==="deleted-users" && j===4 ? <button style={styles.button} onClick={async()=>{if(!window.confirm(`Restore ${row.name} (${row.role.toUpperCase()})?`)) return; try { await restoreHOUser(row._id); await load(); } catch(err) { setError(err.response?.data?.message || "Could not restore user"); } }}>Restore</button> : page==="users" && j===7 ? <button style={{...styles.button,color:"#b91c1c"}} onClick={async()=>{const roleName=row.role || (row.mrId?"mr":row.flmId?"flm":row.slmId?"slm":"tlm"); const id=row.mrId||row.flmId||row.slmId||row.tlmId; const name=row.mrName||row.flmName||row.slmName||row.tlmName||id; if(!window.confirm(`Move ${name} (${roleName.toUpperCase()}) to Deleted Users? You can restore this account later.`)) return; try { await deleteHOUser(roleName,id); await load(); } catch(err) { setError(err.response?.data?.message || "Could not delete user"); } }}>Delete</button> : cell || "—"}</td>)}</tr>)}</tbody></table></div>}</div>
    </>}
    <div style={{marginTop:14,...styles.muted,display:"flex",alignItems:"center",gap:7}}><ShieldCheck size={15}/> {page === "users" || page === "deleted-users" ? "User lifecycle actions are available to HO." : "Read-only access for records and activity. Approval actions remain in Doctor Approvals."}<button style={{...styles.button,marginLeft:"auto"}} onClick={()=>navigate("/ho/approvals")}>Open approvals <ChevronRight size={14} style={{verticalAlign:"middle"}}/></button></div>
  </Layout>;
}
