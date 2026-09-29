import React, { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, ChevronDown, Eye, Lock, X } from "lucide-react";
import { Badge, Button } from "./UIComponents";
import { months } from "../utils/helpers";
import { designAssets } from "../utils/designAssets";

const CALENDAR_YEAR = 2027;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = API_BASE_URL + "/api/calendar";

export default function CalendarMonthGrid({ doctorId, mrId, isFrozen = false }) {
  const [selections, setSelections] = useState({});
  const [calendarStatus, setCalendarStatus] = useState("in_progress");
  const [loading, setLoading] = useState(true);
  const [openMonth, setOpenMonth] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");
  const rootRef = useRef(null);

  const frozen = isFrozen || calendarStatus === "frozen";
  const completedCount = Object.keys(selections).length;
  const progress = Math.round((completedCount / months.length) * 100);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    fetch(API_BASE + "/" + doctorId + "?year=" + CALENDAR_YEAR)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message || "Unable to load calendar selections.");
        const mapped = {};
        (data.selections || []).forEach((s) => {
          mapped[s.month] = { designId: s.designId, designLabel: s.designLabel };
        });
        setSelections(mapped);
        setCalendarStatus(data.status || "in_progress");
      })
      .catch((err) => setError(err.message || "Unable to load calendar selections."))
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpenMonth(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const getSelectedDesign = (month) => {
    const selection = selections[month];
    return selection?.designId ? (designAssets[month] || []).find((d) => d.id === selection.designId) || null : null;
  };

  const selectDesign = async (month, design) => {
    if (frozen || saving || !design) return;
    setSaving(month);
    setError("");
    try {
      const response = await fetch(API_BASE + "/save-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mrId, doctorId, year: CALENDAR_YEAR, month, designId: design.id, designLabel: design.label, unfreeze: false }),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.message || "Unable to save " + month + ".");
      setSelections((current) => ({ ...current, [month]: { designId: design.id, designLabel: design.label } }));
      if (data.status) setCalendarStatus(data.status);
      setOpenMonth(null);
    } catch (err) {
      console.error("Calendar design save error:", err);
      setError(err.message || "Unable to save " + month + ".");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="calendar-selection-loading"><span className="calendar-spinner" />Loading calendar selections...<style>{calendarStyles}</style></div>;

  return (
    <div className="calendar-selection-workspace" ref={rootRef}>
      <section className="calendar-selection-progress">
        <div className="calendar-progress-left"><div className="calendar-progress-icon"><CheckCircle2 size={21} /></div><div><span>Calendar selection progress</span><strong>{completedCount} of 12 months selected</strong></div></div>
        <div className="calendar-progress-right"><strong>{progress}%</strong><div className="calendar-progress-bar"><div style={{ width: progress + "%" }} /></div></div>
        <Badge tone={frozen ? "blue" : completedCount === 12 ? "green" : "orange"}>{frozen ? "Frozen" : completedCount === 12 ? "Ready to Freeze" : "In Progress"}</Badge>
      </section>

      {error && <div className="calendar-selection-error"><span>{error}</span><button type="button" onClick={() => setError("")}><X size={16} /></button></div>}

      <section className="calendar-months-panel">
        <div className="calendar-panel-heading"><div><h2>Select calendar designs</h2><p>Choose a design for each month without leaving this page. Your selection is saved immediately.</p></div><div className="calendar-panel-hint"><span className="hint-dot" /> Select from each month</div></div>
        <div className="calendar-month-cards">
          {months.map((month, index) => {
            const selected = getSelectedDesign(month);
            const isOpen = openMonth === month;
            const isSaving = saving === month;
            const options = designAssets[month] || [];
            return (
              <article className={"calendar-month-card " + (selected ? "selected" : "")} key={month}>
                <div className="calendar-card-top"><div className="calendar-month-badge">{String(index + 1).padStart(2, "0")}</div><div className="calendar-month-title"><strong>{month}</strong><span>{CALENDAR_YEAR}</span></div>{selected ? <span className="calendar-selected-check"><CheckCircle2 size={16} /></span> : <span className="calendar-pending-dot" />}</div>
                <button
                  type="button"
                  className="calendar-card-preview"
                  onClick={() =>
                    selected
                      ? setPreview({ month, design: selected })
                      : setOpenMonth(month)
                  }
                  disabled={frozen}
                  aria-label={selected ? `Preview ${month} design` : `Select ${month} design`}
                >
                  {selected ? (
                    <>
                      <img src={selected.file} alt={selected.label} />
                      <span className="calendar-preview-overlay"><Eye size={15} /> Preview</span>
                    </>
                  ) : (
                    <div className="calendar-empty-preview">
                      <div className="empty-image-icon">+</div>
                      <span>No design selected</span>
                      <small>Click to choose a design</small>
                    </div>
                  )}
                </button>
                <div className="calendar-selection-label"><span>Calendar design</span><strong>{selected?.label || "Choose a design"}</strong></div>
                <div className="calendar-design-dropdown">
                  <button type="button" className={"calendar-dropdown-trigger " + (isOpen ? "open" : "")} onClick={() => !frozen && !isSaving && setOpenMonth(isOpen ? null : month)} disabled={frozen || isSaving}><span>{isSaving ? "Saving..." : selected ? "Change design" : "Select design"}</span><ChevronDown size={17} /></button>
                  {isOpen && !frozen && <div className="calendar-dropdown-menu">
                    <div className="calendar-dropdown-heading"><div><strong>{month} designs</strong><span>{options.length} options</span></div><button type="button" onClick={() => setOpenMonth(null)}><X size={15} /></button></div>
                    <div className="calendar-design-options">{options.map((design) => { const active = selected?.id === design.id; return <button type="button" key={design.id} className={"calendar-design-option " + (active ? "active" : "")} onClick={() => selectDesign(month, design)} disabled={saving !== null}><div className="calendar-option-thumb"><img src={design.file} alt={design.label} />{active && <span><Check size={13} /></span>}</div><div className="calendar-option-info"><strong>{design.label}</strong><small>{design.category || "Calendar design"}</small></div>{active && <CheckCircle2 size={17} />}</button>; })}</div>
                  </div>}
                </div>
                <div className={"calendar-card-status " + (selected ? "done" : "")}>{selected ? <><CheckCircle2 size={14} /> Selection saved</> : "Selection pending"}</div>
              </article>
            );
          })}
        </div>
      </section>

      {completedCount === 12 && !frozen && <section className="calendar-freeze-banner"><div className="freeze-icon"><Lock size={20} /></div><div><strong>All 12 months are selected</strong><p>Review your choices, then continue to the summary and freeze the calendar.</p></div><Button variant="primary" icon={Lock} onClick={() => window.location.assign("/calendar-summary?doctorId=" + doctorId + "&mrId=" + mrId)}>Review & Freeze</Button></section>}
      {frozen && <section className="calendar-freeze-banner frozen"><div className="freeze-icon"><Lock size={20} /></div><div><strong>Calendar is frozen</strong><p>All month selections are locked. You can still preview designs.</p></div></section>}

      {preview && <div className="calendar-image-modal" onClick={() => setPreview(null)}><div className="calendar-image-modal-card" onClick={(e) => e.stopPropagation()}><div className="calendar-image-modal-header"><div><span>{preview.month} {CALENDAR_YEAR}</span><strong>{preview.design.label}</strong></div><button type="button" onClick={() => setPreview(null)}><X size={19} /></button></div><img src={preview.design.file} alt={preview.design.label} /></div></div>}
      <style>{calendarStyles}</style>
    </div>
  );
}

const calendarStyles = `
.calendar-selection-workspace{width:100%;color:#172033}.calendar-selection-loading{min-height:360px;display:flex;align-items:center;justify-content:center;gap:10px;color:#64748b;font-size:14px}.calendar-spinner{width:20px;height:20px;border:2px solid #dbe7f5;border-top-color:#0b55f4;border-radius:50%;animation:calendarSpin .7s linear infinite}@keyframes calendarSpin{to{transform:rotate(360deg)}}
.calendar-selection-progress{display:flex;align-items:center;gap:20px;padding:17px 20px;margin-bottom:18px;background:#fff;border:1px solid #e5eaf2;border-radius:14px;box-shadow:0 5px 20px rgba(23,32,51,.04)}.calendar-progress-left{display:flex;align-items:center;gap:12px;min-width:250px}.calendar-progress-icon{width:40px;height:40px;border-radius:11px;background:#eff6ff;color:#0b55f4;display:flex;align-items:center;justify-content:center}.calendar-progress-left span{display:block;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.calendar-progress-left strong{display:block;margin-top:3px;font-size:15px}.calendar-progress-right{flex:1;max-width:360px;margin-left:auto}.calendar-progress-right>strong{display:block;text-align:right;margin-bottom:5px;font-size:13px;color:#0b55f4}.calendar-progress-bar{height:7px;background:#e9eef6;border-radius:99px;overflow:hidden}.calendar-progress-bar>div{height:100%;background:#0b55f4;border-radius:99px;transition:width .25s}.calendar-selection-progress>.badge{margin-left:auto}
.calendar-selection-error{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;margin-bottom:16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;color:#9a3412;font-size:13px}.calendar-selection-error button{border:0;background:none;color:inherit;cursor:pointer}
.calendar-months-panel{background:#fff;border:1px solid #e5eaf2;border-radius:16px;box-shadow:0 6px 24px rgba(23,32,51,.045);padding:22px}.calendar-panel-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:20px}.calendar-panel-heading h2{margin:0;font-size:20px;color:#172033}.calendar-panel-heading p{margin:5px 0 0;color:#64748b;font-size:13px}.calendar-panel-hint{display:flex;align-items:center;gap:7px;padding:8px 11px;background:#f8fafc;border:1px solid #e8edf4;border-radius:8px;color:#64748b;font-size:11px}.hint-dot{width:7px;height:7px;border-radius:50%;background:#f47a32}
.calendar-month-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.calendar-month-card{position:relative;min-width:0;padding:15px;background:#fff;border:1px solid #e5eaf2;border-radius:13px;transition:border-color .18s,box-shadow .18s}.calendar-month-card:hover{border-color:#cbd8ea;box-shadow:0 7px 20px rgba(23,32,51,.06)}.calendar-month-card.selected{border-color:#cfe0ff}.calendar-card-top{display:flex;align-items:center;gap:9px;margin-bottom:11px}.calendar-month-badge{width:29px;height:29px;border-radius:8px;background:#f4f7fb;color:#64748b;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800}.calendar-month-card.selected .calendar-month-badge{background:#eff6ff;color:#0b55f4}.calendar-month-title{display:flex;flex-direction:column}.calendar-month-title strong{font-size:14px}.calendar-month-title span{font-size:10px;color:#94a3b8;margin-top:2px}.calendar-selected-check{margin-left:auto;color:#16a34a;display:flex}.calendar-pending-dot{margin-left:auto;width:8px;height:8px;border-radius:50%;background:#f59e0b}
.calendar-card-preview{position:relative;width:100%;height:148px;padding:0;border:0;border-radius:10px;overflow:hidden;background:#f8fafc;display:block}.calendar-card-preview:disabled{cursor:default}.calendar-card-preview img{display:block;width:100%;height:100%;object-fit:cover}.calendar-preview-overlay{position:absolute;right:8px;bottom:8px;display:flex;align-items:center;gap:5px;padding:6px 9px;background:rgba(23,32,51,.82);color:#fff;border-radius:7px;font-size:10px}.calendar-empty-preview{height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;border:1px dashed #d8e0eb;border-radius:10px;color:#94a3b8;gap:6px}.calendar-empty-preview small{font-size:10px;color:#0b55f4;font-weight:650}.empty-image-icon{width:30px;height:30px;border-radius:50%;background:#eef2f7;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:20px}
.calendar-selection-label{display:flex;flex-direction:column;margin:11px 0 8px}.calendar-selection-label span{font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:700;letter-spacing:.05em}.calendar-selection-label strong{font-size:12px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.calendar-design-dropdown{position:relative}.calendar-dropdown-trigger{width:100%;height:38px;padding:0 11px;display:flex;align-items:center;justify-content:space-between;border:1px solid #dbe3ee;border-radius:8px;background:#fff;color:#172033;font-size:12px;font-weight:650;cursor:pointer}.calendar-dropdown-trigger:hover:not(:disabled),.calendar-dropdown-trigger.open{border-color:#0b55f4;box-shadow:0 0 0 3px rgba(11,85,244,.08)}.calendar-dropdown-trigger:disabled{background:#f8fafc;color:#94a3b8;cursor:not-allowed}.calendar-dropdown-menu{position:absolute;left:0;right:0;top:calc(100% + 7px);z-index:60;background:#fff;border:1px solid #dbe3ee;border-radius:11px;box-shadow:0 18px 45px rgba(23,32,51,.16);padding:8px;max-height:340px;overflow:auto}.calendar-dropdown-heading{display:flex;align-items:center;justify-content:space-between;padding:6px 5px 9px;border-bottom:1px solid #eef2f7;margin-bottom:5px}.calendar-dropdown-heading div{display:flex;flex-direction:column}.calendar-dropdown-heading strong{font-size:12px}.calendar-dropdown-heading span{font-size:10px;color:#94a3b8;margin-top:2px}.calendar-dropdown-heading button{width:26px;height:26px;border:0;background:#f8fafc;border-radius:6px;color:#64748b;display:flex;align-items:center;justify-content:center;cursor:pointer}
.calendar-design-options{display:grid;gap:5px}.calendar-design-option{width:100%;display:grid;grid-template-columns:48px 1fr auto;align-items:center;gap:9px;padding:6px;border:1px solid transparent;border-radius:8px;background:#fff;text-align:left;color:#172033;cursor:pointer}.calendar-design-option:hover{background:#f8fbff;border-color:#dbe7f5}.calendar-design-option.active{background:#eff6ff;border-color:#bfdbfe}.calendar-design-option:disabled{opacity:.55;cursor:wait}.calendar-option-thumb{position:relative;width:48px;height:40px;border-radius:6px;overflow:hidden;background:#f1f5f9}.calendar-option-thumb img{width:100%;height:100%;object-fit:cover;display:block}.calendar-option-thumb>span{position:absolute;right:3px;top:3px;width:17px;height:17px;border-radius:50%;background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center}.calendar-option-info{min-width:0;display:flex;flex-direction:column}.calendar-option-info strong{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.calendar-option-info small{font-size:9px;color:#94a3b8;margin-top:2px;text-transform:capitalize}.calendar-design-option>svg{color:#16a34a}
.calendar-card-status{display:flex;align-items:center;justify-content:flex-end;gap:5px;margin-top:8px;color:#f59e0b;font-size:10px;font-weight:650}.calendar-card-status.done{color:#16a34a}
.calendar-freeze-banner{display:flex;align-items:center;gap:13px;margin-top:18px;padding:15px 17px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px}.calendar-freeze-banner.frozen{background:#eff6ff;border-color:#bfdbfe}.freeze-icon{width:40px;height:40px;flex:0 0 40px;border-radius:10px;background:#fff;color:#16a34a;display:flex;align-items:center;justify-content:center}.calendar-freeze-banner.frozen .freeze-icon{color:#0b55f4}.calendar-freeze-banner>div:nth-child(2){flex:1}.calendar-freeze-banner strong{display:block;font-size:13px}.calendar-freeze-banner p{margin:4px 0 0;color:#64748b;font-size:11px}
.calendar-image-modal{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.72);display:flex;align-items:center;justify-content:center;padding:22px}.calendar-image-modal-card{width:min(760px,100%);max-height:90vh;background:#fff;border-radius:15px;overflow:hidden}.calendar-image-modal-header{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid #eef2f7}.calendar-image-modal-header div{display:flex;flex-direction:column}.calendar-image-modal-header span{font-size:10px;color:#94a3b8}.calendar-image-modal-header strong{font-size:14px;margin-top:2px}.calendar-image-modal-header button{width:30px;height:30px;border:0;border-radius:7px;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center;cursor:pointer}.calendar-image-modal-card>img{display:block;width:100%;max-height:78vh;object-fit:contain;background:#f8fafc}
@media (max-width:1100px){.calendar-month-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:760px){.calendar-selection-progress{flex-wrap:wrap}.calendar-progress-right{min-width:180px;max-width:none;width:100%;order:3}.calendar-selection-progress>.badge{margin-left:0}.calendar-panel-heading{align-items:flex-start;flex-direction:column}.calendar-month-cards{grid-template-columns:1fr}}
`;