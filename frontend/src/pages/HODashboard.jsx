import React, { useEffect, useState } from "react";
import { Users, CheckCircle2, CalendarDays, Clock3, ImageIcon, RefreshCw, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getHODashboard } from "../api/hoAPI";

const number = (value) => Number(value || 0).toLocaleString("en-IN");
const cardStyle = { background:"#fff", border:"1px solid #e5eaf2", borderRadius:14, padding:18, boxShadow:"0 3px 12px rgba(15,23,42,.035)" };

export default function HODashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { const result = await getHODashboard(); setData(result); }
    catch (e) { setError(e.response?.data?.message || "Could not load dashboard. Check the backend and database connection."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const stats = data?.stats || {};
  const cards = [
    ["Doctors Registered", stats.registered, Users, "#2563eb", "/ho/approvals"],
    ["Doctors Approved", stats.approved, CheckCircle2, "#16a34a", "/ho/approvals"],
    ["Calendars Frozen", stats.frozen, ImageIcon, "#7c3aed", "/ho/input-tracker"],
    ["Input Given", stats.inputGiven, CalendarDays, "#d97706", "/ho/input-tracker"],
    ["Pending Approvals", stats.pending, Clock3, "#dc2626", "/ho/approvals"],
  ];
  const quickLinks = [
    ["Doctor approval queue","Review submitted doctors","/ho/approvals"],
    ["Consent tracker","Find approved doctors awaiting consent","/ho/consent-tracker"],
    ["Input given tracker","Track calendar input completion","/ho/input-tracker"],
    ["Hierarchy report","Review TLM, SLM, FLM and MR coverage","/ho/hierarchy"],
    ["Activity log","See recent changes and submissions","/ho/activity"],
    ["Calendar design library","Manage campaign calendar designs","/ho/calendar-designs"],
  ];

  return <Layout role="ho" active="Dashboard">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:20}}>
      <div><div style={{fontSize:11,fontWeight:800,letterSpacing:".12em",color:"#2563eb",marginBottom:7}}>HEAD OFFICE • NATIONAL VIEW</div><h1 style={{margin:0,fontSize:28,color:"#172033"}}>HO Dashboard</h1><p style={{color:"#64748b",fontSize:13,marginTop:8}}>Campaign progress and operational status across the organisation.</p></div>
      <button onClick={load} style={{border:"1px solid #d8e1ee",background:"#fff",color:"#1d4ed8",borderRadius:9,padding:"10px 13px",cursor:"pointer",fontWeight:650}}><RefreshCw size={14} style={{verticalAlign:"middle",marginRight:7}}/>Refresh data</button>
    </div>
    {error && <div role="alert" style={{padding:14,marginBottom:16,borderRadius:10,background:"#fff1f2",color:"#b91c1c"}}>{error}</div>}
    {loading ? <div style={{...cardStyle,padding:40,textAlign:"center",color:"#64748b"}}>Loading live HO data…</div> : <>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12,marginBottom:16}}>
        {cards.map(([title,value,Icon,color,path])=><button key={title} onClick={()=>navigate(path)} style={{...cardStyle,textAlign:"left",cursor:"pointer",color:"#172033"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:"#64748b",fontWeight:600}}>{title}</span><span style={{background:color+"14",color,borderRadius:10,padding:9}}><Icon size={18}/></span></div><div style={{fontSize:27,fontWeight:800,marginTop:15}}>{number(value)}</div><div style={{fontSize:11,color:"#64748b",marginTop:6}}>View records <ArrowRight size={12} style={{verticalAlign:"middle"}}/></div></button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,360px),1fr))",gap:14,marginBottom:14}}>
        <section style={cardStyle}><h2 style={{fontSize:16,margin:"0 0 5px"}}>Campaign funnel</h2><p style={{fontSize:12,color:"#64748b",margin:"0 0 18px"}}>Counts are calculated from saved doctor records, excluding drafts.</p>{[["Registered",data?.funnel?.registered,"#2563eb"],["Approved",data?.funnel?.approved,"#16a34a"],["Calendars frozen",data?.funnel?.frozen,"#7c3aed"],["Input given",data?.funnel?.inputGiven,"#d97706"]].map(([label,value,color])=>{const pct=stats.registered?Math.round((value||0)/stats.registered*100):0;return <div key={label} style={{marginBottom:15}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span>{label}</span><b>{number(value)} · {pct}%</b></div><div style={{height:8,borderRadius:99,background:"#eef2f7",overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:color,borderRadius:99}}/></div></div>})}<div style={{borderTop:"1px solid #edf1f7",paddingTop:12,fontSize:12,color:"#64748b"}}>Approval rate: <b style={{color:"#172033"}}>{stats.approvalRate || 0}%</b></div></section>
        <section style={cardStyle}><div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}><div><h2 style={{fontSize:16,margin:"0 0 5px"}}>Priority work</h2><p style={{fontSize:12,color:"#64748b",margin:"0 0 12px"}}>Live outstanding counts</p></div><Clock3 color="#64748b" size={19}/></div>{[["Pending approvals",stats.pending,"/ho/approvals"],["Consent pending",stats.consentPending,"/ho/consent-tracker"],["Photo upload pending",stats.photoPending,"/ho/consent-tracker"],["Calendar freeze pending",stats.calendarPending,"/ho/input-tracker"]].map(([label,value,path])=><button key={label} onClick={()=>navigate(path)} style={{display:"flex",width:"100%",alignItems:"center",justifyContent:"space-between",gap:10,padding:"13px 0",border:0,borderBottom:"1px solid #edf1f7",background:"transparent",textAlign:"left",cursor:"pointer",color:"#334155"}}><span style={{fontSize:13}}>{label}</span><span style={{display:"flex",alignItems:"center",gap:8,fontWeight:800}}>{number(value)} <ArrowRight size={14} color="#94a3b8"/></span></button>)}</section>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,360px),1fr))",gap:14}}>
        <section style={cardStyle}><h2 style={{fontSize:16,margin:"0 0 14px"}}>Zone coverage</h2>{(data?.zones||[]).length===0?<p style={{fontSize:13,color:"#64748b"}}>No zone data has been assigned to doctor records yet.</p>:(data.zones||[]).slice(0,8).map(zone=><div key={zone.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #edf1f7"}}><div><b style={{fontSize:13}}>{zone.name}</b><div style={{fontSize:11,color:"#64748b",marginTop:3}}>{number(zone.approved)} approved · {number(zone.pending)} pending</div></div><div style={{minWidth:80,textAlign:"right"}}><b>{number(zone.registered)}</b><div style={{height:5,background:"#eef2f7",borderRadius:99,marginTop:5}}><div style={{height:5,width:(zone.registered?zone.approved/zone.registered*100:0)+"%",background:"#16a34a",borderRadius:99}}/></div></div></div>)}</section>
        <section style={cardStyle}><h2 style={{fontSize:16,margin:"0 0 14px"}}>Recent activity</h2>{(data?.activities||[]).length===0?<p style={{fontSize:13,color:"#64748b"}}>No activity has been recorded yet.</p>:(data.activities||[]).slice(0,6).map((item,i)=><div key={item._id||i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #edf1f7"}}><span style={{width:30,height:30,display:"grid",placeItems:"center",background:"#eff6ff",color:"#2563eb",borderRadius:9,flexShrink:0}}><Activity size={15}/></span><div style={{minWidth:0}}><b style={{fontSize:12,display:"block"}}>{item.action||"Activity"}</b><div style={{fontSize:11,color:"#64748b",marginTop:3}}>{item.details||item.doctor?.doctorName||"—"} · {item.createdAt?new Date(item.createdAt).toLocaleDateString():"—"}</div></div></div>)}<button onClick={()=>navigate("/ho/activity")} style={{marginTop:12,border:0,background:"transparent",color:"#2563eb",fontWeight:700,cursor:"pointer",padding:0,fontSize:12}}>View activity log →</button></section>
      </div>
      <section style={{...cardStyle,marginTop:14}}><h2 style={{fontSize:16,margin:"0 0 12px"}}>HO workspace</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>{quickLinks.map(([title,description,path])=><button key={path+title} onClick={()=>navigate(path)} style={{display:"flex",gap:10,alignItems:"flex-start",padding:13,border:"1px solid #e5eaf2",borderRadius:10,background:"#fff",textAlign:"left",cursor:"pointer"}}><ShieldCheck size={17} color="#2563eb"/><span><b style={{display:"block",fontSize:12,color:"#172033"}}>{title}</b><span style={{display:"block",fontSize:11,color:"#64748b",lineHeight:1.5,marginTop:4}}>{description}</span></span></button>)}</div></section>
    </>}
  </Layout>;
}
