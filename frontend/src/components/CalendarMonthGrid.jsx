import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, CheckCircle2, ChevronRight, Eye, Lock, X } from "lucide-react";
import { Badge, Button } from "./UIComponents";
import { months } from "../utils/helpers";
import { designAssets } from "../utils/designAssets";

const CALENDAR_YEAR = 2027;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = API_BASE_URL + "/api/calendar";

export default function CalendarMonthGrid({
  doctorId,
  mrId,
  isFrozen = false,
}) {
  const [selections, setSelections] = useState({});
  const [calendarStatus, setCalendarStatus] = useState("in_progress");
  const [loading, setLoading] = useState(true);
  const [openMonth, setOpenMonth] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");
  const rootRef = useRef(null);

  const frozen = isFrozen || calendarStatus === "frozen" || calendarStatus === "input_given";
  useEffect(() => {
    if (!openMonth && !preview) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMonth(null);
        setPreview(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMonth, preview]);


  const completedCount = Object.keys(selections).length;
  const progress = Math.round((completedCount / months.length) * 100);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    fetch(API_BASE + "/" + doctorId + "?year=" + CALENDAR_YEAR)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success)
          throw new Error(
            data.message || "Unable to load calendar selections.",
          );
        const mapped = {};
        (data.selections || []).forEach((s) => {
          mapped[s.month] = {
            designId: s.designId,
            designLabel: s.designLabel,
          };
        });
        setSelections(mapped);
        setCalendarStatus(data.status || "in_progress");
      })
      .catch((err) =>
        setError(err.message || "Unable to load calendar selections."),
      )
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    const close = (event) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(".calendar-design-modal-overlay")
      ) {
        return;
      }

      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpenMonth(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const getSelectedDesign = (month) => {
    const selection = selections[month];
    return selection?.designId
      ? (designAssets[month] || []).find((d) => d.id === selection.designId) ||
          null
      : null;
  };

  const selectDesign = async (month, design) => {
    if (frozen || saving || !design) return;

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const resolvedDoctorId =
      doctorId ||
      sessionStorage.getItem("currentDoctorId") ||
      localStorage.getItem("currentDoctorId");

    const resolvedMrId =
      mrId ||
      sessionStorage.getItem("mrId") ||
      localStorage.getItem("mrId") ||
      storedUser.mrId ||
      storedUser._id ||
      storedUser.id ||
      "";

    if (!resolvedDoctorId || !resolvedMrId || !design.id) {
      setError("Doctor, MR, and design information is missing. Please refresh the page and try again.");
      return;
    }

    setSaving(month);
    setError("");
    try {
      const response = await fetch(API_BASE + "/save-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mrId: resolvedMrId,
          doctorId: resolvedDoctorId,
          year: CALENDAR_YEAR,
          month,
          designId: design.id,
          designLabel: design.label,
          unfreeze: false,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true)
        throw new Error(data.message || "Unable to save " + month + ".");
      setSelections((current) => ({
        ...current,
        [month]: { designId: design.id, designLabel: design.label },
      }));
      if (data.status) setCalendarStatus(data.status);
      setOpenMonth(null);
    } catch (err) {
      console.error("Calendar design save error:", err);
      setError(err.message || "Unable to save " + month + ".");
    } finally {
      setSaving(null);
    }
  };

  if (loading)
    return (
      <div className="calendar-selection-loading">
        <span className="calendar-spinner" />
        Loading calendar selections...<style>{calendarStyles}</style>
      </div>
    );

  return (
    <div className="calendar-selection-workspace" ref={rootRef}>
      <section className="calendar-selection-progress">
        <div className="calendar-progress-left">
          <div className="calendar-progress-icon">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Calendar selection progress</span>
            <strong>{completedCount} of 12 months selected</strong>
          </div>
        </div>
        <div className="calendar-progress-right">
          <strong>{progress}%</strong>
          <div className="calendar-progress-bar">
            <div style={{ width: progress + "%" }} />
          </div>
        </div>
        <Badge
          tone={frozen ? "blue" : completedCount === 12 ? "green" : "orange"}
        >
          {frozen
            ? "Frozen"
            : completedCount === 12
              ? "Ready to Freeze"
              : "In Progress"}
        </Badge>
      </section>

      {error && (
        <div className="calendar-selection-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <section className="calendar-months-panel">
        <div className="calendar-panel-heading">
          <div>
            <h2>Select calendar designs</h2>
            <p>
              Choose a design for each month. Click an unselected month to
              choose from the available designs.
            </p>
          </div>
          <div className="calendar-panel-hint">
            <span className="hint-dot" /> Select from each month
          </div>
        </div>
        <div className="calendar-month-cards">
          {months.map((month, index) => {
            const selected = getSelectedDesign(month);
            const isOpen = openMonth === month;
            const isSaving = saving === month;
            const options = designAssets[month] || [];
            return (
              <article
                className={
                  "calendar-month-card " + (selected ? "selected" : "")
                }
                key={month}
              >
                <div className="calendar-card-top">
                  <div className="calendar-month-badge">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="calendar-month-title">
                    <strong>{month}</strong>
                    <span>{CALENDAR_YEAR}</span>
                  </div>
                  {selected ? (
                    <span className="calendar-selected-check">
                      <CheckCircle2 size={16} />
                    </span>
                  ) : (
                    <span className="calendar-pending-dot" />
                  )}
                </div>
                <button
                  type="button"
                  className="calendar-card-preview"
                  onClick={() =>
                    selected
                      ? setPreview({ month, design: selected })
                      : setOpenMonth(month)
                  }
                  disabled={frozen && !selected}
                  aria-label={
                    selected
                      ? `Preview ${month} design`
                      : `Open design selection popup for ${month}`
                  }
                >
                  {selected ? (
                    <>
                      <img src={selected.file} alt={selected.label} />
                      <span className="calendar-preview-overlay">
                        <Eye size={15} /> Preview
                      </span>
                    </>
                  ) : (
                    <div className="calendar-empty-preview">
                      <div className="empty-image-icon">+</div>
                      <span>No design selected</span>
                      <small>Click to select a design</small>
                    </div>
                  )}
                </button>
                <div className="calendar-selection-label">
                  <span>Calendar design</span>
                  <strong>{selected?.label || "Choose a design"}</strong>
                </div>
                <div className="calendar-design-dropdown">
                  <button
                    type="button"
                    className={
                      "calendar-dropdown-trigger " + (isOpen ? "open" : "")
                    }
                    onClick={() =>
                      !frozen && !isSaving && setOpenMonth(month)
                    }
                    disabled={frozen || isSaving}
                  >
                    <span>
                      {isSaving
                        ? "Saving..."
                        : selected
                          ? "Change design"
                          : "Select design"}
                    </span>
                    <ChevronRight size={18} />
                  </button>
                  {isOpen && !frozen && typeof document !== "undefined" &&
                    createPortal(
                      <div
                        className="calendar-design-modal-overlay"
                        onClick={() => setOpenMonth(null)}
                      >
                        <div
                          className="calendar-design-modal"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="calendar-dropdown-heading">
                            <div>
                              <strong>{month} designs</strong>
                              <span>{options.length} options</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOpenMonth(null)}
                            >
                              <X size={15} />
                            </button>
                          </div>
                          <div className="calendar-design-options">
                            {options.map((design) => {
                              const active = selected?.id === design.id;
                              return (
                                <button
                                  type="button"
                                  key={design.id}
                                  className={
                                    "calendar-design-option " +
                                    (active ? "active" : "")
                                  }
                                  onClick={() => selectDesign(month, design)}
                                  disabled={saving !== null}
                                >
                                  <div className="calendar-option-thumb">
                                    <img src={design.file} alt={design.label} />
                                    {active && (
                                      <span>
                                        <Check size={13} />
                                      </span>
                                    )}
                                  </div>
                                  <div className="calendar-option-info">
                                    <strong>{design.label}</strong>
                                    <small>
                                      {design.category || "Calendar design"}
                                    </small>
                                  </div>
                                  {active && <CheckCircle2 size={17} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>,
                      document.body
                    )
                  }
                </div>

                <div
                  className={"calendar-card-status " + (selected ? "done" : "")}
                >
                  {selected ? (
                    <>
                      <CheckCircle2 size={14} /> Selection saved
                    </>
                  ) : (
                    "Selection pending"
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {completedCount === 12 && !frozen && (
        <section className="calendar-freeze-banner">
          <div className="freeze-icon">
            <Lock size={20} />
          </div>
          <div>
            <strong>All 12 months are selected</strong>
            <p>
              Review your choices, then continue to the summary and freeze the
              calendar.
            </p>
          </div>
          <Button
            variant="primary"
            icon={Lock}
            onClick={() =>
              window.location.assign(
                "/calendar-summary?doctorId=" + doctorId + "&mrId=" + mrId,
              )
            }
          >
            Review & Freeze
          </Button>
        </section>
      )}
      {frozen && (
        <section className="calendar-freeze-banner frozen">
          <div className="freeze-icon">
            <Lock size={20} />
          </div>
          <div>
            <strong>Calendar is frozen</strong>
            <p>
              All month selections are locked. You can still preview designs.
            </p>
          </div>
        </section>
      )}

      {preview && (
        <div className="calendar-image-modal" onClick={() => setPreview(null)}>
          <div
            className="calendar-image-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="calendar-image-modal-header">
              <div>
                <span>
                  {preview.month} {CALENDAR_YEAR}
                </span>
                <strong>{preview.design.label}</strong>
              </div>
              <button type="button" onClick={() => setPreview(null)}>
                <X size={19} />
              </button>
            </div>
            <img src={preview.design.file} alt={preview.design.label} />
          </div>
        </div>
      )}
      <style>{calendarStyles}</style>
    </div>
  );
}

const calendarStyles = `
.calendar-selection-workspace{
  width:100%;
  color:#172033;
}

.calendar-selection-loading{
  min-height:360px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  color:#64748b;
  font-size:14px;
}

.calendar-spinner{
  width:20px;
  height:20px;
  border:2px solid #dbe7f5;
  border-top-color:#0b55f4;
  border-radius:50%;
  animation:calendarSpin .7s linear infinite;
}

@keyframes calendarSpin{
  to{
    transform:rotate(360deg);
  }
}


/* =========================
   PROGRESS
========================= */

.calendar-selection-progress{
  display:flex;
  align-items:center;
  gap:20px;
  padding:17px 20px;
  margin-bottom:18px;
  background:#fff;
  border:1px solid #e5eaf2;
  border-radius:14px;
  box-shadow:0 5px 20px rgba(23,32,51,.04);
}

.calendar-progress-left{
  display:flex;
  align-items:center;
  gap:12px;
  min-width:250px;
}

.calendar-progress-icon{
  width:40px;
  height:40px;
  border-radius:11px;
  background:#eff6ff;
  color:#0b55f4;
  display:flex;
  align-items:center;
  justify-content:center;
}

.calendar-progress-left span{
  display:block;
  font-size:11px;
  color:#94a3b8;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.05em;
}

.calendar-progress-left strong{
  display:block;
  margin-top:3px;
  font-size:15px;
}

.calendar-progress-right{
  flex:1;
  max-width:360px;
  margin-left:auto;
}

.calendar-progress-right>strong{
  display:block;
  text-align:right;
  margin-bottom:5px;
  font-size:13px;
  color:#0b55f4;
}

.calendar-progress-bar{
  height:7px;
  background:#e9eef6;
  border-radius:99px;
  overflow:hidden;
}

.calendar-progress-bar>div{
  height:100%;
  background:#0b55f4;
  border-radius:99px;
  transition:width .25s;
}

.calendar-selection-progress>.badge{
  margin-left:auto;
}


/* =========================
   ERROR
========================= */

.calendar-selection-error{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:11px 14px;
  margin-bottom:16px;
  background:#fff7ed;
  border:1px solid #fed7aa;
  border-radius:10px;
  color:#9a3412;
  font-size:13px;
}

.calendar-selection-error button{
  border:0;
  background:none;
  color:inherit;
  cursor:pointer;
}


/* =========================
   MONTH PANEL
========================= */

.calendar-months-panel{
  background:#fff;
  border:1px solid #e5eaf2;
  border-radius:16px;
  box-shadow:0 6px 24px rgba(23,32,51,.045);
  padding:22px;
}

.calendar-panel-heading{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:18px;
  margin-bottom:20px;
}

.calendar-panel-heading h2{
  margin:0;
  font-size:20px;
  color:#172033;
}

.calendar-panel-heading p{
  margin:5px 0 0;
  color:#64748b;
  font-size:13px;
}

.calendar-panel-hint{
  display:flex;
  align-items:center;
  gap:7px;
  padding:8px 11px;
  background:#f8fafc;
  border:1px solid #e8edf4;
  border-radius:8px;
  color:#64748b;
  font-size:11px;
}

.hint-dot{
  width:7px;
  height:7px;
  border-radius:50%;
  background:#f47a32;
}


/* =========================
   MONTH CARDS
========================= */

.calendar-month-cards{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:14px;
}

.calendar-month-card{
  position:relative;
  min-width:0;
  padding:15px;
  background:#fff;
  border:1px solid #e5eaf2;
  border-radius:13px;
  transition:border-color .18s,box-shadow .18s;
}

.calendar-month-card:hover{
  border-color:#cbd8ea;
  box-shadow:0 7px 20px rgba(23,32,51,.06);
}

.calendar-month-card.selected{
  border-color:#cfe0ff;
}

.calendar-card-top{
  display:flex;
  align-items:center;
  gap:9px;
  margin-bottom:11px;
}

.calendar-month-badge{
  width:29px;
  height:29px;
  border-radius:8px;
  background:#f4f7fb;
  color:#64748b;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:10px;
  font-weight:800;
}

.calendar-month-card.selected .calendar-month-badge{
  background:#eff6ff;
  color:#0b55f4;
}

.calendar-month-title{
  display:flex;
  flex-direction:column;
}

.calendar-month-title strong{
  font-size:14px;
}

.calendar-month-title span{
  font-size:10px;
  color:#94a3b8;
  margin-top:2px;
}

.calendar-selected-check{
  margin-left:auto;
  color:#16a34a;
  display:flex;
}

.calendar-pending-dot{
  margin-left:auto;
  width:8px;
  height:8px;
  border-radius:50%;
  background:#f59e0b;
}


/* =========================
   MONTH PREVIEW
========================= */

.calendar-card-preview{
  position:relative;
  width:100%;
  height:148px;
  padding:0;
  border:0;
  border-radius:10px;
  overflow:hidden;
  background:#f8fafc;
  display:block;
}

.calendar-card-preview:disabled{
  cursor:default;
}

.calendar-card-preview img{
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
}

.calendar-preview-overlay{
  position:absolute;
  right:8px;
  bottom:8px;
  display:flex;
  align-items:center;
  gap:5px;
  padding:6px 9px;
  background:rgba(23,32,51,.82);
  color:#fff;
  border-radius:7px;
  font-size:10px;
}

.calendar-empty-preview{
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction:column;
  border:1px dashed #d8e0eb;
  border-radius:10px;
  color:#94a3b8;
  gap:6px;
}

.calendar-empty-preview small{
  font-size:10px;
  color:#0b55f4;
  font-weight:650;
}

.empty-image-icon{
  width:30px;
  height:30px;
  border-radius:50%;
  background:#eef2f7;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#64748b;
  font-size:20px;
}


/* =========================
   DESIGN LABEL
========================= */

.calendar-selection-label{
  display:flex;
  flex-direction:column;
  margin:11px 0 8px;
}

.calendar-selection-label span{
  font-size:10px;
  color:#94a3b8;
  text-transform:uppercase;
  font-weight:700;
  letter-spacing:.05em;
}

.calendar-selection-label strong{
  font-size:12px;
  margin-top:3px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}


/* =========================
   DROPDOWN BUTTON
========================= */

.calendar-design-dropdown{
  position:relative;
}

.calendar-dropdown-trigger{
  width:100%;
  height:40px;
  padding:0 12px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  border:1px solid #dbe3ee;
  border-radius:8px;
  background:#fff;
  color:#172033;
  font-size:12px;
  font-weight:650;
  cursor:pointer;
  transition:.18s;
}

.calendar-dropdown-trigger:hover:not(:disabled),
.calendar-dropdown-trigger.open{
  border-color:#0b55f4;
  box-shadow:0 0 0 3px rgba(11,85,244,.08);
}

.calendar-dropdown-trigger:disabled{
  background:#f8fafc;
  color:#94a3b8;
  cursor:not-allowed;
}


/* =========================
   DESIGN POPUP
========================= */

.calendar-design-modal-overlay{
  position:fixed;
  inset:0;
  z-index:11000;
  width:100vw;
  height:100vh;
  background:rgba(15,23,42,.62);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
  box-sizing:border-box;
}

.calendar-design-modal{
  width:min(1000px,96vw);
  max-height:min(90vh,820px);
  overflow:auto;
  background:#fff;
  border:1px solid #dbe3ee;
  border-radius:20px;
  box-shadow:0 28px 80px rgba(15,23,42,.32);
  padding:24px;
  box-sizing:border-box;
}

.calendar-dropdown-menu{
  background:#fff;
  padding:8px;
}


/* =========================
   POPUP HEADER
========================= */

.calendar-dropdown-heading{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:6px 5px 14px;
  border-bottom:1px solid #eef2f7;
  margin-bottom:14px;
}

.calendar-dropdown-heading div{
  display:flex;
  flex-direction:column;
}

.calendar-dropdown-heading strong{
  font-size:18px;
  color:#172033;
}

.calendar-dropdown-heading span{
  font-size:12px;
  color:#94a3b8;
  margin-top:4px;
}

.calendar-dropdown-heading button{
  width:34px;
  height:34px;
  border:0;
  background:#f8fafc;
  border-radius:8px;
  color:#64748b;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition:.18s;
}

.calendar-dropdown-heading button:hover{
  background:#eef2f7;
  color:#172033;
}


/* =========================
   POPUP DESIGN GRID
========================= */

.calendar-design-options{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:18px;
}

.calendar-design-option{
  width:100%;
  display:grid;
  grid-template-columns:180px 1fr auto;
  align-items:center;
  gap:18px;
  padding:16px;
  min-height:145px;
  border:1px solid #e5eaf2;
  border-radius:12px;
  background:#fff;
  text-align:left;
  color:#172033;
  cursor:pointer;
  transition:
    background .18s,
    border-color .18s,
    box-shadow .18s,
    transform .18s;
}

.calendar-design-option:hover{
  background:#f8fbff;
  border-color:#bcd2f3;
  box-shadow:0 7px 20px rgba(23,32,51,.07);
  transform:translateY(-1px);
}

.calendar-design-option.active{
  background:#eff6ff;
  border-color:#93c5fd;
  box-shadow:0 4px 15px rgba(11,85,244,.08);
}

.calendar-design-option:disabled{
  opacity:.55;
  cursor:wait;
  transform:none;
}


/* =========================
   LARGE DESIGN THUMBNAIL
========================= */

.calendar-option-thumb{
  position:relative;
  width:180px;
  height:120px;
  border-radius:9px;
  overflow:hidden;
  background:#f1f5f9;
  flex-shrink:0;
}

.calendar-option-thumb img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}

.calendar-option-thumb>span{
  position:absolute;
  right:6px;
  top:6px;
  width:22px;
  height:22px;
  border-radius:50%;
  background:#16a34a;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
}


/* =========================
   DESIGN TEXT
========================= */

.calendar-option-info{
  min-width:0;
  display:flex;
  flex-direction:column;
}

.calendar-option-info strong{
  font-size:17px;
  line-height:1.3;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.calendar-option-info small{
  font-size:13px;
  color:#94a3b8;
  margin-top:5px;
  text-transform:capitalize;
}

.calendar-design-option>svg{
  color:#16a34a;
  flex-shrink:0;
}


/* =========================
   STATUS
========================= */

.calendar-card-status{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:5px;
  margin-top:8px;
  color:#f59e0b;
  font-size:10px;
  font-weight:650;
}

.calendar-card-status.done{
  color:#16a34a;
}


/* =========================
   FREEZE BANNER
========================= */

.calendar-freeze-banner{
  display:flex;
  align-items:center;
  gap:13px;
  margin-top:18px;
  padding:15px 17px;
  background:#f0fdf4;
  border:1px solid #bbf7d0;
  border-radius:12px;
}

.calendar-freeze-banner.frozen{
  background:#eff6ff;
  border-color:#bfdbfe;
}

.freeze-icon{
  width:40px;
  height:40px;
  flex:0 0 40px;
  border-radius:10px;
  background:#fff;
  color:#16a34a;
  display:flex;
  align-items:center;
  justify-content:center;
}

.calendar-freeze-banner.frozen .freeze-icon{
  color:#0b55f4;
}

.calendar-freeze-banner>div:nth-child(2){
  flex:1;
}

.calendar-freeze-banner strong{
  display:block;
  font-size:13px;
}

.calendar-freeze-banner p{
  margin:4px 0 0;
  color:#64748b;
  font-size:11px;
}


/* =========================
   IMAGE PREVIEW MODAL
========================= */

.calendar-image-modal{
  position:fixed;
  inset:0;
  z-index:1000;
  background:rgba(15,23,42,.72);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:22px;
}

.calendar-image-modal-card{
  width:min(760px,100%);
  max-height:90vh;
  background:#fff;
  border-radius:15px;
  overflow:hidden;
}

.calendar-image-modal-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:13px 16px;
  border-bottom:1px solid #eef2f7;
}

.calendar-image-modal-header div{
  display:flex;
  flex-direction:column;
}

.calendar-image-modal-header span{
  font-size:10px;
  color:#94a3b8;
}

.calendar-image-modal-header strong{
  font-size:14px;
  margin-top:2px;
}

.calendar-image-modal-header button{
  width:30px;
  height:30px;
  border:0;
  border-radius:7px;
  background:#f8fafc;
  color:#64748b;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
}

.calendar-image-modal-card>img{
  display:block;
  width:100%;
  max-height:78vh;
  object-fit:contain;
  background:#f8fafc;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width:1100px){

  .calendar-month-cards{
    grid-template-columns:repeat(2,minmax(0,1fr));
  }

  .calendar-design-options{
    grid-template-columns:1fr;
  }

  .calendar-design-modal{
    width:min(850px,94vw);
  }
}


@media (max-width:760px){

  .calendar-selection-progress{
    flex-wrap:wrap;
  }

  .calendar-progress-right{
    min-width:180px;
    max-width:none;
    width:100%;
    order:3;
  }

  .calendar-selection-progress>.badge{
    margin-left:0;
  }

  .calendar-panel-heading{
    align-items:flex-start;
    flex-direction:column;
  }

  .calendar-month-cards{
    grid-template-columns:1fr;
  }

  .calendar-design-modal{
    width:94vw;
    max-height:92vh;
    padding:16px;
    border-radius:16px;
  }

  .calendar-dropdown-heading strong{
    font-size:16px;
  }

  .calendar-design-option{
    grid-template-columns:130px 1fr auto;
    gap:14px;
    padding:12px;
    min-height:115px;
  }

  .calendar-option-thumb{
    width:130px;
    height:90px;
  }

  .calendar-option-info strong{
    font-size:15px;
  }

  .calendar-option-info small{
    font-size:12px;
  }
}


@media (max-width:520px){

  .calendar-months-panel{
    padding:14px;
  }

  .calendar-design-modal-overlay{
    padding:12px;
  }

  .calendar-design-modal{
    width:100%;
    max-height:94vh;
    padding:12px;
  }

  .calendar-design-option{
    grid-template-columns:100px 1fr auto;
    gap:11px;
    padding:10px;
    min-height:95px;
  }

  .calendar-option-thumb{
    width:100px;
    height:72px;
  }

  .calendar-option-info strong{
    font-size:13px;
  }

  .calendar-option-info small{
    font-size:11px;
  }

  .calendar-design-option>svg{
    width:15px;
    height:15px;
  }
}
`;
