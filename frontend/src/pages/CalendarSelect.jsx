// import React from "react";
// import {
//   CalendarDays, CheckCircle2, Clock3, RotateCcw, Info,
//   ArrowRight, ArrowLeft, Eye, Pencil, Lock, Download, CalendarCheck,
// } from "lucide-react";
// import Layout from "../components/Layout";
// import {
//   Badge, Button, IconBox, StatCard, Crumbs, SuccessBlock,
// } from "../components/UIComponents";
// import { cls, months } from "../utils/helpers";

// // ─── Month Grid ─────────────────────────────────────────
// export function CalendarMonth() {
//   return (
//     <Layout active="Calendar Selection">
//       <Crumbs items={["Calendar Selection"]} />
//       <h1>Calendar Selection</h1>
//       <p className="subtitle">Select a month to choose and customize the calendar design.</p>
//       <div className="notice"><Info />Select one month at a time and choose the preferred design in the next step.</div>
//       <div className="legend">
//         <Badge>Completed</Badge>
//         <Badge tone="orange">Pending</Badge>
//         <Badge tone="blue">Not Started</Badge>
//       </div>
//       <div className="monthGrid">
//         {months.map((m, i) => (
//           <div key={m} className={cls("monthCard", i === 0 && "done")}>
//             <IconBox
//               icon={i === 0 || i === 3 ? CheckCircle2 : i % 2 ? Clock3 : RotateCcw}
//               tone={i === 0 || i === 3 ? "green" : i % 2 ? "orange" : "blue"}
//             />
//             <h3>{m}</h3>
//             <p>2027</p>
//             <Badge tone={i === 0 || i === 3 ? "green" : i % 2 ? "orange" : "blue"}>
//               {i === 0 || i === 3 ? "Completed" : i % 2 ? "Pending" : "Not Started"}
//             </Badge>
//             <Button variant="outline" icon={i === 0 || i === 3 ? Pencil : undefined}>
//               {i === 0 || i === 3 ? "Change Design" : "Select Design"} <ArrowRight size={15} />
//             </Button>
//           </div>
//         ))}
//       </div>
//     </Layout>
//   );
// }

// // ─── Design Selection ───────────────────────────────────
// import { SelectBox } from "../components/UIComponents";

// export function DesignSelect() {
//   return (
//     <Layout active="Calendar Selection">
//       <Crumbs items={["Calendar Selection","Select Design"]} />
//       <div className="pageHead">
//         <div>
//           <h1>Select Design for <span className="blueText">January 2027</span></h1>
//           <p className="subtitle">Show these design options to the doctor and select the preferred calendar design.</p>
//         </div>
//         <SelectBox label="January 2027" />
//       </div>
//       <div className="notice"><Info />You are selecting the calendar design for January 2027. Once saved, you can preview or change it again.</div>
//       <div className="designGrid">
//         {Array.from({ length: 10 }).map((_, i) => (
//           <div key={i} className={cls("designCard", i === 0 && "selected")}>
//             <div className="designTop">
//               <span className="radioDot" />
//               <b>Design {String(i + 1).padStart(2, "0")}</b>
//               {i === 0 && <Badge>Recommended</Badge>}
//             </div>
//             <span>Code: J27-{String(i + 1).padStart(2, "0")}</span>
//             <div className={`calendarMock c${i % 6}`}>
//               <b>2027</b>
//               <div className="miniCal">
//                 {Array.from({ length: 28 }).map((_, j) => <i key={j}>{j + 1}</i>)}
//               </div>
//             </div>
//             <Button variant="outline" icon={Eye}>Preview</Button>
//           </div>
//         ))}
//       </div>
//       <div className="footerActions">
//         <Button variant="outline" icon={ArrowLeft}>Back to Months</Button>
//         <div className="spacer" />
//         <Button variant="outline">Cancel</Button>
//         <Button>Save January Selection <ArrowRight size={16} /></Button>
//       </div>
//     </Layout>
//   );
// }

// // ─── Month Summary ──────────────────────────────────────
// function MonthSummary() {
//   return (
//     <div>
//       <h3>Months Summary <span className="greenText">(12/12 Completed)</span></h3>
//       <div className="summaryMonths">
//         {months.map((m, i) => (
//           <div key={m}>
//             <div className={`thumb c${i % 6}`}></div>
//             <b>{m} 2027</b>
//             <Badge>Completed</Badge>
//             <span>Design {String(i + 1).padStart(2, "0")}</span>
//             <ArrowRight />
//           </div>
//         ))}
//       </div>
//       <div className="notice warn">
//         <Info />
//         You can change the design of any month anytime before finalizing the calendar.
//       </div>
//     </div>
//   );
// }

// // ─── Summary Page ───────────────────────────────────────
// export function CalendarSummary({ finalized = false }) {
//   return (
//     <Layout active="Calendar Selection">
//       <Crumbs items={["Calendar Selection","Summary", finalized ? "Finalized" : ""]} />
//       <h1>Calendar Finalized Successfully!</h1>
//       <p className="subtitle">
//         {finalized
//           ? "The calendar design selection for Dr. Rajesh Shah has been finalized by you."
//           : "All selected months and designs have been saved successfully."}
//       </p>
//       {finalized ? (
//         <SuccessBlock title="Calendar Selection Finalized" status="CALENDAR FROZEN" />
//       ) : (
//         <>
//           <div className="summaryBar">
//             <StatCard title="Calendar Year" value="2027" icon={CalendarCheck} tone="green" />
//             <StatCard title="Total Months" value="12" />
//             <StatCard title="Completed" value="12" tone="green" />
//             <StatCard title="Pending" value="0" tone="orange" />
//             <StatCard title="Last Updated" value="20 May 2025" sub="by Amit Sharma" />
//           </div>
//           <MonthSummary />
//         </>
//       )}
//       <div className="footerActions">
//         <Button variant="outline" icon={ArrowLeft}>Back to Summary</Button>
//         <div className="spacer" />
//         <Button variant="outline" icon={Download}>Download Summary (PDF)</Button>
//         {finalized
//           ? <Button variant="outline">Go to Dashboard</Button>
//           : <Button variant="primary" icon={Lock}>Freeze Calendar</Button>}
//         {finalized && <Button variant="success" icon={CheckCircle2}>Mark Input Given</Button>}
//       </div>
//     </Layout>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  RotateCcw,
  Info,
  ArrowRight,
  ArrowLeft,
  Lock,
  Download,
  CalendarCheck,
  CalendarDays,
  Check,
  Box,
  Pencil,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  Badge,
  Button,
  IconBox,
  StatCard,
  Crumbs,
} from "../components/UIComponents";
import { cls, months } from "../utils/helpers";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CalendarMonthGrid from "../components/CalendarMonthGrid";
import { designAssets } from "../utils/designAssets";
const CALENDAR_YEAR = 2027;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/calendar`;

function getCalendarLayoutRole() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = String(user.role || "mr").toLowerCase();
  return ["flm", "slm", "tlm"].includes(role) ? "manager" : role;
}

// ─── Popup Component ────────────────────────────────────
// ─── Popup Component ────────────────────────────────────
function Popup({
  isOpen,
  type,
  title,
  message,
  onClose,
  onConfirm,
  showConfirmButton,
  confirmText,
}) {
  if (!isOpen) return null;

  const getIconColor = () => {
    if (type === "success")
      return { bg: "#d1fae5", color: "#065f46", Icon: CheckCircle2 };
    if (type === "warning")
      return { bg: "#fef3c7", color: "#92400e", Icon: AlertCircle };
    return { bg: "#fee2e2", color: "#991b1b", Icon: AlertCircle };
  };

  const { bg, color, Icon } = getIconColor();

  return (
    <div
      className="popup-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        className="popup-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "450px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "scaleIn 0.3s ease",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#999",
            padding: "4px",
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: bg,
              color: color,
            }}
          >
            <Icon size={32} />
          </div>
        </div>

        <h2
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: color,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#666",
            marginBottom: "24px",
            lineHeight: "1.6",
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: showConfirmButton ? 1 : 1,
              padding: "12px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
            }}
          >
            {showConfirmButton ? "Cancel" : "Got it"}
          </button>

          {showConfirmButton && onConfirm && (
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: type === "warning" ? "#f59e0b" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  type === "warning" ? "#d97706" : "#059669";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor =
                  type === "warning" ? "#f59e0b" : "#10b981";
              }}
            >
              {confirmText || "Confirm"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
// ─── Asset map ───────────────────────────────────────────
// const designAssets = {
//   January: [
//     {
//       id: "jan-v1",
//       label: "Jan V1",
//       file: new URL("../assets/Jan v1.webp", import.meta.url).href,
//     },
//     {
//       id: "jan-v2",
//       label: "Jan V2",
//       file: new URL("../assets/Jan v2.webp", import.meta.url).href,
//     },
//     {
//       id: "jan-v3",
//       label: "Jan V3",
//       file: new URL("../assets/Jan v3.webp", import.meta.url).href,
//     },
//     {
//       id: "jan",
//       label: "Jan",
//       file: new URL("../assets/jan.webp", import.meta.url).href,
//     },
//   ],
//   February: [
//     {
//       id: "feb-v1",
//       label: "Feb V1",
//       file: new URL("../assets/Feb v1.webp", import.meta.url).href,
//     },
//     {
//       id: "feb",
//       label: "Feb",
//       file: new URL("../assets/feb.webp", import.meta.url).href,
//     },
//   ],
//   March: [
//     {
//       id: "march-v1",
//       label: "March V1",
//       file: new URL("../assets/March v1.webp", import.meta.url).href,
//     },
//     {
//       id: "march-v2",
//       label: "March V2",
//       file: new URL("../assets/March v2.webp", import.meta.url).href,
//     },
//     {
//       id: "march",
//       label: "March",
//       file: new URL("../assets/march.webp", import.meta.url).href,
//     },
//   ],
//   April: [
//     {
//       id: "april",
//       label: "April",
//       file: new URL("../assets/april.webp", import.meta.url).href,
//     },
//   ],
//   May: [
//     {
//       id: "may-v1",
//       label: "May V1",
//       file: new URL("../assets/May v1.webp", import.meta.url).href,
//     },
//     {
//       id: "may",
//       label: "May",
//       file: new URL("../assets/may.webp", import.meta.url).href,
//     },
//   ],
//   June: [
//     {
//       id: "june-v1",
//       label: "June V1",
//       file: new URL("../assets/June v1.webp", import.meta.url).href,
//     },
//     {
//       id: "june",
//       label: "June",
//       file: new URL("../assets/june.webp", import.meta.url).href,
//     },
//   ],
//   July: [
//     {
//       id: "july-v1",
//       label: "July V1",
//       file: new URL("../assets/July v1.webp", import.meta.url).href,
//     },
//     {
//       id: "july-v2",
//       label: "July V2",
//       file: new URL("../assets/July v2.webp", import.meta.url).href,
//     },
//     {
//       id: "july-v3",
//       label: "July V3",
//       file: new URL("../assets/July v3.webp", import.meta.url).href,
//     },
//     {
//       id: "july-v4",
//       label: "July V4",
//       file: new URL("../assets/July v4.webp", import.meta.url).href,
//     },
//     {
//       id: "july-v5",
//       label: "July V5",
//       file: new URL("../assets/July v5.webp", import.meta.url).href,
//     },
//     {
//       id: "july",
//       label: "July",
//       file: new URL("../assets/july.webp", import.meta.url).href,
//     },
//   ],
//   August: [
//     {
//       id: "aug-v1",
//       label: "Aug V1",
//       file: new URL("../assets/Aug v1.webp", import.meta.url).href,
//     },
//     {
//       id: "aug-v2",
//       label: "Aug V2",
//       file: new URL("../assets/Aug v2.webp", import.meta.url).href,
//     },
//     {
//       id: "aug-v3",
//       label: "Aug V3",
//       file: new URL("../assets/Aug v3.webp", import.meta.url).href,
//     },
//     {
//       id: "august",
//       label: "August",
//       file: new URL("../assets/august.webp", import.meta.url).href,
//     },
//   ],
//   September: [
//     {
//       id: "sep-v1",
//       label: "Sep V1",
//       file: new URL("../assets/Sep v1.webp", import.meta.url).href,
//     },
//     {
//       id: "sep-v2",
//       label: "Sep V2",
//       file: new URL("../assets/Sep v2.webp", import.meta.url).href,
//     },
//     {
//       id: "september",
//       label: "September",
//       file: new URL("../assets/september.webp", import.meta.url).href,
//     },
//   ],
//   October: [
//     {
//       id: "oct-v1",
//       label: "Oct V1",
//       file: new URL("../assets/Oct v1.webp", import.meta.url).href,
//     },
//     {
//       id: "oct",
//       label: "Oct",
//       file: new URL("../assets/oct.webp", import.meta.url).href,
//     },
//   ],
//   November: [
//     {
//       id: "nov-v1",
//       label: "Nov V1",
//       file: new URL("../assets/Nov v1.webp", import.meta.url).href,
//     },
//     {
//       id: "nov",
//       label: "Nov",
//       file: new URL("../assets/nov.webp", import.meta.url).href,
//     },
//   ],
//   December: [
//     {
//       id: "dec-v1",
//       label: "Dec V1",
//       file: new URL("../assets/Dec v1.webp", import.meta.url).href,
//     },
//     {
//       id: "dec",
//       label: "Dec",
//       file: new URL("../assets/dec.webp", import.meta.url).href,
//     },
//   ],
// };

// ─── Shared ID resolver ──────────────────────────────────
// mrId always available from localStorage (logged-in user)
// doctorId comes from URL params or location state
function resolveIds(searchParams, locationState) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Try multiple sources for doctorId
  const doctorId =
    searchParams.get("doctorId") ||
    locationState?.doctorId ||
    sessionStorage.getItem("currentDoctorId") ||
    localStorage.getItem("currentDoctorId") ||
    null;

  // Try multiple sources for mrId
  const mrId =
    searchParams.get("mrId") ||
    locationState?.mrId ||
    storedUser.mrId ||
    sessionStorage.getItem("mrId") ||
    localStorage.getItem("mrId") ||
    null;

  // Persist IDs for this session
  if (doctorId && doctorId !== "null") {
    sessionStorage.setItem("currentDoctorId", doctorId);
    localStorage.setItem("currentDoctorId", doctorId);
  }

  if (mrId && mrId !== "null") {
    sessionStorage.setItem("mrId", mrId);
  }

  console.log("Resolved IDs:", { doctorId, mrId }); // Debug log

  return { doctorId, mrId };
}
// ─── Local helpers ───────────────────────────────────────
function Panel({ title, children }) {
  return (
    <div className="panel">
      <div className="panelHead">
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}
function ListLine({ icon: Icon, title, sub }) {
  return (
    <div className="listline">
      <IconBox icon={Icon} tone="orange" />
      <div>
        <b>{title}</b>
        <span>{sub}</span>
      </div>
      <ArrowRight size={18} />
    </div>
  );
}
function SuccessBlock({ title, status }) {
  return (
    <>
      <div className="successBlock">
        <IconBox icon={Check} tone="green" />
        <div>
          <h2>{title}</h2>
          <p>
            All 12 months have been selected and the calendar is now frozen. The
            calendar is ready for production and handover process.
          </p>
        </div>
        <div className="statusBox">
          <b>STATUS</b>
          <Badge>{status}</Badge>
          <small>Locked for Production</small>
        </div>
        <div className="facts">
          <span>
            Doctor Name <b>Dr. Rajesh Shah</b>
          </span>
          <span>
            Calendar Year <b>{CALENDAR_YEAR}</b>
          </span>
          <span>
            Total Months <b>12</b>
          </span>
          <span>
            Finalized By <b>Amit Sharma (MR)</b>
          </span>
        </div>
      </div>
      <Panel title="What happens next?">
        <ListLine
          icon={Lock}
          title="Calendar Locked for Production"
          sub="The selected designs are locked and sent for production."
        />
        <ListLine
          icon={Box}
          title="Calendar Handed Over"
          sub="Once printed calendars are received, please mark Input Given."
        />
        <ListLine
          icon={CheckCircle2}
          title="Change Request (If Required)"
          sub="Any changes can be made only through a change request process."
        />
      </Panel>
    </>
  );
}

// ─── Design Card ─────────────────────────────────────────
function DesignCard({ design, selected, onSelect, onPreview }) {
  return (
    <div
      onClick={() => onSelect(design.id, design.label)}
      style={{
        border: selected ? "2.5px solid #0b55f4" : "1.5px solid #e5e7eb",
        borderRadius: 12,
        background: selected ? "#f0f4ff" : "#fff",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: selected
          ? "0 0 0 3px #c7d4fd"
          : "0 1px 4px rgba(0,0,0,0.07)",
        transition: "all 0.15s",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {selected && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            background: "#0b55f4",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(11,85,244,0.4)",
          }}
        >
          <Check size={14} color="#fff" />
        </div>
      )}
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
          overflow: "hidden",
          background: "#f9fafb",
        }}
      >
        <img
          src={design.file}
          alt={design.label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div
          style={{
            display: "none",
            position: "absolute",
            inset: 0,
            background: "#f3f4f6",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            color: "#9ca3af",
            fontSize: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>🖼️</span>
          <span>{design.label}</span>
        </div>
      </div>
      <div
        style={{
          padding: "10px 12px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
            {design.label}
          </div>
          {/* <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
            Code: {design.id}
          </div> */}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
             console.log("🔵 Preview button clicked for:", design.label);
            onPreview(design);
          }}
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            border: "1.5px solid #e5e7eb",
            background: "#fff",
            color: "#374151",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Preview
        </button>
      </div>
    </div>
  );
}

// ─── Preview Modal ───────────────────────────────────────
function PreviewModal({ design, month, onClose, onSelect, selected }) {
  if (!design) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          maxWidth: 700,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {design.label} — {month} {CALENDAR_YEAR}
            </div>
            {/* <div style={{ fontSize: 12, color: "#6b7280" }}>
              Code: {design.id}
            </div> */}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#6b7280",
            }}
          >
            ✕
          </button>
        </div>
        <img
          src={design.file}
          alt={design.label}
          style={{
            width: "100%",
            display: "block",
            maxHeight: "65vh",
            objectFit: "contain",
            background: "#f9fafb",
          }}
        />
        <div
          style={{
            padding: "14px 20px",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Close
          </button>
          <button
            onClick={() => {
              onSelect(design.id, design.label);
              onClose();
            }}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: selected ? "#16a34a" : "#0b55f4",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {selected ? (
              <>
                <Check size={14} /> Selected
              </>
            ) : (
              "Select This Design"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 1: Month Grid ────────────────────────────────
// export function CalendarMonth() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const location = useLocation();
//   const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

//   const CURRENT_DOCTOR_ID =
//     searchParams.get("doctorId") !== "null" && searchParams.get("doctorId")
//       ? searchParams.get("doctorId")
//       : location.state?.doctorId
//       || sessionStorage.getItem("currentDoctorId")
//       || null;

//   const CURRENT_MR_ID =
//     searchParams.get("mrId") !== "null" && searchParams.get("mrId")
//       ? searchParams.get("mrId")
//       : location.state?.mrId
//       || storedUser.mrId
//       || null;

//   const [dbSelections, setDbSelections] = useState({});
//   const [calendarStatus, setCalendarStatus] = useState("in_progress");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`${API_BASE}/${CURRENT_DOCTOR_ID}?year=${CALENDAR_YEAR}`)
//       .then(r => r.json())
//       .then(data => {
//         if (data.success && data.selections) {
//           const map = {};
//           data.selections.forEach(s => { map[s.month] = s.designId; });
//           setDbSelections(map);
//           setCalendarStatus(data.status || "in_progress");
//         }
//       })
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

// const goToDesign = (month) => {
//   // Get IDs from multiple sources
//   const doctorId = CURRENT_DOCTOR_ID ||
//                    sessionStorage.getItem("currentDoctorId") ||
//                    localStorage.getItem("currentDoctorId");

//   const mrId = CURRENT_MR_ID ||
//                sessionStorage.getItem("mrId") ||
//                JSON.parse(localStorage.getItem("user") || "{}").mrId;

//   console.log("Navigating to design with:", { doctorId, mrId, month }); // Debug log

//   if (!doctorId) {
//     alert("Doctor ID is missing. Please go back to Approved Doctors page.");
//     navigate("/approved-doctors");
//     return;
//   }

//   navigate(`/calendar-design?month=${month}&doctorId=${doctorId}&mrId=${mrId}`, {
//     state: { doctorId, mrId, month }
//   });
// };

//   return (
//     <Layout active="Calendar Selection">
//       <Crumbs items={["Calendar Selection"]} />
//       <h1>Calendar Selection</h1>
//       <p className="subtitle">Select a month to choose and customize the calendar design.</p>
//       <div className="notice">
//         <Info />
//         Select one month at a time and choose the preferred design in the next step.
//         {calendarStatus === "frozen" && <b style={{ marginLeft: 8, color: "#16a34a" }}>✓ Calendar is frozen.</b>}
//       </div>
//       <div className="legend">
//         <Badge>Completed</Badge>
//         <Badge tone="orange">Pending</Badge>
//         <Badge tone="blue">Not Started</Badge>
//       </div>

//       {loading ? (
//         <p style={{ padding: 24, color: "#6b7280" }}>Loading selections…</p>
//       ) : (
//         <div className="monthGrid">
//           {months.map((m, i) => {
//             const isDone = !!dbSelections[m];
//             const isPending = !isDone && i < 4;
//             return (
//               <div key={m} className={cls("monthCard", isDone && "done")}>
//                 <IconBox
//                   icon={isDone ? CheckCircle2 : isPending ? Clock3 : RotateCcw}
//                   tone={isDone ? "green" : isPending ? "orange" : "blue"}
//                 />
//                 <h3>{m}</h3>
//                 <p>{CALENDAR_YEAR}</p>
//                 <Badge tone={isDone ? "green" : isPending ? "orange" : "blue"}>
//                   {isDone ? "Completed" : isPending ? "Pending" : "Not Started"}
//                 </Badge>
//                 <Button
//                   variant="outline"
//                   icon={isDone ? Pencil : undefined}
//                   onClick={() => goToDesign(m)}
//                   disabled={calendarStatus === "frozen"}
//                 >
//                   {isDone ? "Change Design" : "Select Design"} <ArrowRight size={15} />
//                 </Button>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </Layout>
//   );
// }

// export function CalendarMonth() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const location = useLocation();
//   const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

//   const [popup, setPopup] = useState({
//     isOpen: false,
//     type: "success",
//     title: "",
//     message: "",
//     onConfirm: null,
//     showConfirmButton: false,
//     confirmText: "Confirm",
//   });

//   // State for preview modal
//   const [previewDesign, setPreviewDesign] = useState(null);
//   const [previewMonth, setPreviewMonth] = useState("");

//   const showPopup = (type, title, message) => {
//     setPopup({ isOpen: true, type, title, message });
//   };

//   const closePopup = () => {
//     setPopup({
//       ...popup,
//       isOpen: false,
//       onConfirm: null,
//       showConfirmButton: false,
//     });
//   };

//   const CURRENT_DOCTOR_ID =
//     searchParams.get("doctorId") ||
//     location.state?.doctorId ||
//     sessionStorage.getItem("currentDoctorId") ||
//     localStorage.getItem("currentDoctorId");

//   const CURRENT_MR_ID =
//     searchParams.get("mrId") ||
//     location.state?.mrId ||
//     storedUser.mrId ||
//     sessionStorage.getItem("currentMrId");

//   const [dbSelections, setDbSelections] = useState({});
//   const [calendarStatus, setCalendarStatus] = useState("in_progress");
//   const [loading, setLoading] = useState(true);
//   const [filterStatus, setFilterStatus] = useState("all");

//   // Validate IDs
//   useEffect(() => {
//     if (!CURRENT_DOCTOR_ID) {
//       console.error("No doctor ID found");
//       showPopup("error", "No Doctor Selected", "Please select a doctor first");
//       navigate("/approved-doctors");
//       return;
//     }

//     if (!CURRENT_MR_ID) {
//       console.error("No MR ID found");
//       const user = JSON.parse(localStorage.getItem("user") || "{}");
//       if (!user.mrId) {
//         showPopup("error", "Session Expired", "Please login again");
//         navigate("/login");
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (!CURRENT_DOCTOR_ID) return;

//     console.log("Fetching calendar for doctor:", CURRENT_DOCTOR_ID);

//     fetch(`${API_BASE}/${CURRENT_DOCTOR_ID}?year=${CALENDAR_YEAR}`)
//       .then((r) => r.json())
//       .then((data) => {
//         console.log("Calendar data:", data);
//         if (data.success && data.selections) {
//           const map = {};
//           data.selections.forEach((s) => {
//             map[s.month] = s.designId;
//           });
//           setDbSelections(map);
//           setCalendarStatus(data.status || "in_progress");
//         }
//       })
//       .catch((err) => console.error("Fetch error:", err))
//       .finally(() => setLoading(false));
//   }, [CURRENT_DOCTOR_ID]);

//   // ✅ SIMPLIFIED goToDesign - ALWAYS add unfreeze=true when editing any month
//   // const goToDesign = (month) => {
//   //   console.log("🔗 Navigating to design for:", month);
//   //   // ✅ ALWAYS add unfreeze=true to allow editing
//   //   const url = `/calendar-design?month=${month}&doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}&unfreeze=true`;
//   //   console.log("🔗 URL:", url);
//   //   navigate(url);
//   // };

//   const goToDesign = (month) => {
//   console.log("Going to design for month:", month);
//   console.log("Calendar status:", calendarStatus);
  
//   // ✅ If calendar is frozen, show popup and block navigation
//   if (calendarStatus === "frozen") {
//     setPopup({
//       isOpen: true,
//       type: "warning",
//       title: "⚠️ Calendar is FROZEN",
//       message: "This calendar has been frozen and cannot be edited.\n\nTo make changes, you need to unfreeze it first from the Summary page.",
//       onConfirm: () => {
//         closePopup();
//         // Navigate to summary page instead
//         navigate(
//           `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`
//         );
//       },
//       showConfirmButton: true,
//       confirmText: "Go to Summary",
//     });
//     return;
//   }
  
//   // ✅ Calendar is not frozen - allow navigation
//   const url = `/calendar-design?month=${month}&doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`;
//   console.log("🔗 Navigating to:", url);
//   navigate(url);
// };

//   const handlePreview = (design, month) => {
//     setPreviewDesign(design);
//     setPreviewMonth(month);
//   };

//   const closePreview = () => {
//     setPreviewDesign(null);
//     setPreviewMonth("");
//   };

//   const getMonthStatus = (month) => {
//     const isDone = !!dbSelections[month];
//     if (isDone) return "completed";

//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth();
//     const monthIndex = months.indexOf(month);

//     if (CALENDAR_YEAR > currentYear) {
//       if (monthIndex <= 2) return "pending";
//       return "not_started";
//     }

//     if (CALENDAR_YEAR === currentYear) {
//       if (monthIndex <= currentMonth + 2 && monthIndex >= currentMonth) {
//         return "pending";
//       }
//       if (monthIndex < currentMonth) {
//         return "completed";
//       }
//     }

//     return "not_started";
//   };

//   const getFilteredMonths = () => {
//     if (filterStatus === "all") return months;
//     return months.filter((month) => getMonthStatus(month) === filterStatus);
//   };

//   const completedCount = Object.keys(dbSelections).length;
//   const pendingCount = months.filter(
//     (m) => getMonthStatus(m) === "pending",
//   ).length;
//   const notStartedCount = months.filter(
//     (m) => getMonthStatus(m) === "not_started",
//   ).length;

//   if (!CURRENT_DOCTOR_ID) {
//     return <div>Loading doctor information...</div>;
//   }



//   return (
//     <Layout active="Calendar Selection">
//       <Crumbs items={["Calendar Selection"]} />

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 16,
//         }}
//       >
//         <div>
//           <h1>Calendar Selection</h1>
//           <p className="subtitle">
//             Select a month to choose and customize the calendar design.
//           </p>
//         </div>
//         <Button
//           variant="outline"
//           icon={CalendarCheck}
//           onClick={() =>
//             navigate(
//               `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`,
//             )
//           }
//         >
//           View Summary
//         </Button>
//       </div>
//       <div className="notice">
      
//         <Info />
//         Select one month at a time and choose the preferred design in the next
//         step.
//         {calendarStatus === "frozen" && (
//           <b style={{ marginLeft: 8, color: "#16a34a" }}>
//             ✓ Calendar is frozen.
//           </b>
//         )}
//       </div>

//       {/* Clickable Filter Badges */}
//       <div
//         className="legend"
//         style={{
//           display: "flex",
//           gap: "12px",
//           marginBottom: "20px",
//           cursor: "pointer",
//         }}
//       >
//         <div
//           onClick={() => setFilterStatus("all")}
//           style={{
//             opacity: filterStatus === "all" ? 1 : 0.6,
//             cursor: "pointer",
//             transition: "opacity 0.2s",
//           }}
//         >
//           <Badge tone="blue">All ({12})</Badge>
//         </div>
//         <div
//           onClick={() => setFilterStatus("completed")}
//           style={{
//             opacity: filterStatus === "completed" ? 1 : 0.6,
//             cursor: "pointer",
//             transition: "opacity 0.2s",
//           }}
//         >
//           <Badge tone="green">Completed ({completedCount})</Badge>
//         </div>
//         <div
//           onClick={() => setFilterStatus("pending")}
//           style={{
//             opacity: filterStatus === "pending" ? 1 : 0.6,
//             cursor: "pointer",
//             transition: "opacity 0.2s",
//           }}
//         >
//           <Badge tone="orange">Pending ({pendingCount})</Badge>
//         </div>
//         <div
//           onClick={() => setFilterStatus("not_started")}
//           style={{
//             opacity: filterStatus === "not_started" ? 1 : 0.6,
//             cursor: "pointer",
//             transition: "opacity 0.2s",
//           }}
//         >
//           <Badge tone="blue">Not Started ({notStartedCount})</Badge>
//         </div>
//       </div>

//       {loading ? (
//         <p style={{ padding: 24, color: "#6b7280" }}>Loading selections…</p>
//       ) : (
//         <div className="monthGrid">
//           {getFilteredMonths().map((m) => {
//             const isDone = !!dbSelections[m];
//             const status = getMonthStatus(m);
//             const selectedDesignId = dbSelections[m];

//             const selectedDesign = selectedDesignId
//               ? designAssets[m]?.find((d) => d.id === selectedDesignId)
//               : null;

//             let icon = RotateCcw;
//             let tone = "blue";
//             let statusText = "Not Started";
//             let statusColor = "#94a3b8";

//             if (isDone) {
//               icon = CheckCircle2;
//               tone = "green";
//               statusText = "Completed";
//               statusColor = "#10b981";
//             } else if (status === "pending") {
//               icon = Clock3;
//               tone = "orange";
//               statusText = "Pending";
//               statusColor = "#f59e0b";
//             }

//             return (
//               <div
//                 key={m}
//                 className={cls("monthCard", isDone && "done")}
//                 style={{
//                   position: "relative",
//                   background: "white",
//                   borderRadius: "12px",
//                   padding: "16px",
//                   boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                   transition: "all 0.2s",
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   textAlign: "center",
//                   border: "1px solid #e5e7eb",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = "translateY(-4px)";
//                   e.currentTarget.style.boxShadow =
//                     "0 4px 12px rgba(0,0,0,0.1)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = "translateY(0)";
//                   e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
//                 }}
//               >
//                 {/* Month Name */}
//                 <div
//                   style={{
//                     fontSize: "18px",
//                     fontWeight: "bold",
//                     color: "#1a1a2e",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   {m}
//                 </div>

//                 {/* Year */}
//                 <div
//                   style={{
//                     fontSize: "12px",
//                     color: "#666",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   {CALENDAR_YEAR}
//                 </div>

//                 {/* Design Thumbnail */}
              
//                  {selectedDesign ? (
//   <div
//     style={{
//       width: "100%",
//       height: "140px",
//       overflow: "hidden",
//       borderRadius: "8px",
//       marginBottom: "12px",
//       position: "relative",
//       border: `2px solid ${statusColor}`,
//       cursor: calendarStatus === "frozen" ? "not-allowed" : "pointer",
//       background: "#f9fafb",
//       opacity: calendarStatus === "frozen" ? 0.6 : 1,
//     }}
//     onClick={() => {
//       if (calendarStatus === "frozen") {
//         setPopup({
//           isOpen: true,
//           type: "warning",
//           title: "⚠️ Calendar is FROZEN",
//           message: "This calendar has been frozen and cannot be edited.\n\nTo make changes, you need to unfreeze it first from the Summary page.",
//           onConfirm: () => {
//             closePopup();
//             navigate(
//               `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`
//             );
//           },
//           showConfirmButton: true,
//           confirmText: "Go to Summary",
//         });
//       } else {
//         goToDesign(m);
//       }
//     }}
//   >
//                     <img
//                       src={selectedDesign.file}
//                       alt={selectedDesign.label}
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                       }}
//                       onError={(e) => {
//                         e.target.src =
//                           'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="2" y="2" width="20" height="20" rx="2.18"/%3E%3Ccircle cx="8.5" cy="8.5" r="2.5"/%3E%3Cpath d="M21 15l-5-5-6 6-3-3-4 4"/%3E%3C/svg%3E';
//                       }}
//                     />
//                     {isDone && (
//                       <div
//                         style={{
//                           position: "absolute",
//                           top: "8px",
//                           right: "8px",
//                           background: "#10b981",
//                           color: "white",
//                           borderRadius: "50%",
//                           width: "24px",
//                           height: "24px",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           fontSize: "12px",
//                         }}
//                       >
//                         <Check size={14} />
//                       </div>
//                     )}
//                   </div>
//                                ) : (
//                   <div
//                     style={{
//                       width: "100%",
//                       height: "140px",
//                       borderRadius: "8px",
//                       marginBottom: "12px",
//                       background: "#f3f4f6",
//                       border: `2px dashed ${statusColor}`,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       flexDirection: "column",
//                       cursor: calendarStatus === "frozen" ? "not-allowed" : "pointer",
//                       color: "#9ca3af",
//                       opacity: calendarStatus === "frozen" ? 0.6 : 1,
//                     }}
//                     onClick={() => {
//                       if (calendarStatus === "frozen") {
//                         setPopup({
//                           isOpen: true,
//                           type: "warning",
//                           title: "⚠️ Calendar is FROZEN",
//                           message: "This calendar has been frozen and cannot be edited.\n\nTo make changes, you need to unfreeze it first from the Summary page.",
//                           onConfirm: () => {
//                             closePopup();
//                             navigate(
//                               `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`
//                             );
//                           },
//                           showConfirmButton: true,
//                           confirmText: "Go to Summary",
//                         });
//                       } else {
//                         goToDesign(m);
//                       }
//                     }}
//                   >
//                     <span style={{ fontSize: "32px", marginBottom: "8px" }}>
//                       🖼️
//                     </span>
//                     <span style={{ fontSize: "12px" }}>No design selected</span>
//                   </div>
//                 )}

//                 {/* Action Buttons */}
//                 <div
//                   style={{
//                     display: "flex",
//                     gap: "8px",
//                     width: "100%",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   {selectedDesign && (
//                     <Button
//                       variant="outline"
//                       icon={Eye}
//                       onClick={() => handlePreview(selectedDesign, m)}
//                       style={{
//                         flex: 1,
//                         justifyContent: "center",
//                         fontSize: "12px",
//                         padding: "6px 12px",
//                       }}
//                     >
//                       Preview
//                     </Button>
//                   )}
//                  <Button
//   variant={isDone ? "outline" : "primary"}
//   icon={isDone ? Pencil : undefined}
//   onClick={() => goToDesign(m)}
//   disabled={calendarStatus === "frozen"}
//   style={{
//     flex: selectedDesign ? 1 : 1,
//     justifyContent: "center",
//     fontSize: "12px",
//     padding: "6px 12px",
//     opacity: calendarStatus === "frozen" ? 0.6 : 1,
//     cursor: calendarStatus === "frozen" ? "not-allowed" : "pointer",
//   }}
// >
//   {calendarStatus === "frozen" ? " Frozen" : (isDone ? "Change" : "Select")}
// </Button>
//                 </div>

//                 {/* Status Badge */}
//                 <Badge tone={tone} style={{ marginTop: "4px" }}>
//                   {statusText}
//                 </Badge>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Show message when no months match filter */}
//       {!loading && getFilteredMonths().length === 0 && (
//         <div className="notice" style={{ textAlign: "center", marginTop: 24 }}>
//           <Info />
//           <span>No months found with the selected filter.</span>
//         </div>
//       )}

//       {/* Freeze Calendar Button */}
//       {completedCount === 12 && calendarStatus !== "frozen" && (
//         <div
//           style={{
//             marginTop: "32px",
//             padding: "20px",
//             background: "#f0fdf4",
//             borderRadius: "12px",
//             border: "1px solid #bbf7d0",
//             textAlign: "center",
//           }}
//         >
//           <p style={{ marginBottom: "12px", color: "#065f46" }}>
//              All 12 months have been selected! You can now freeze the
//             calendar.
//           </p>
//           <Button
//             variant="primary"
//             icon={Lock}
//             onClick={() =>
//               navigate(
//                 `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`,
//               )
//             }
//             style={{
//               minWidth: "250px",
//               fontSize: "16px",
//               padding: "12px 24px",
//             }}
//           >
//             Freeze Calendar
//           </Button>
//         </div>
//       )}

//       {/* Show frozen status if already frozen */}
//       {calendarStatus === "frozen" && (
//         <div
//           style={{
//             marginTop: "32px",
//             padding: "20px",
//             background: "#dbeafe",
//             borderRadius: "12px",
//             border: "1px solid #bfdbfe",
//             textAlign: "center",
//           }}
//         >
//           <p style={{ marginBottom: "12px", color: "#1e40af" }}>
//             ❄️ This calendar is <b>FROZEN</b>. You can still change designs, but
//             it will unfreeze.
//           </p>
//           <Button
//             variant="outline"
//             icon={Eye}
//             onClick={() =>
//               navigate(
//                 `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`,
//               )
//             }
//             style={{ minWidth: "200px" }}
//           >
//             View Summary
//           </Button>
//         </div>
//       )}

//       {/* Preview Modal */}
//       {previewDesign && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 1000,
//             background: "rgba(0,0,0,0.75)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 24,
//           }}
//           onClick={closePreview}
//         >
//           <div
//             style={{
//               background: "#fff",
//               borderRadius: 16,
//               overflow: "hidden",
//               maxWidth: 700,
//               width: "100%",
//               maxHeight: "90vh",
//               boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
//               display: "flex",
//               flexDirection: "column",
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 padding: "14px 20px",
//                 borderBottom: "1px solid #f3f4f6",
//                 flexShrink: 0,
//               }}
//             >
//               <div>
//                 <div style={{ fontWeight: 700, fontSize: 16 }}>
//                   {previewDesign.label} — {previewMonth} {CALENDAR_YEAR}
//                 </div>
//                 <div style={{ fontSize: 12, color: "#6b7280" }}>
//                   Code: {previewDesign.id}
//                 </div>
//               </div>
//               <button
//                 onClick={closePreview}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                   fontSize: 24,
//                   color: "#6b7280",
//                   padding: "4px 8px",
//                 }}
//               >
//                 ✕
//               </button>
//             </div>

//             <div
//               style={{
//                 flex: 1,
//                 overflow: "auto",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 padding: "16px",
//                 background: "#f9fafb",
//                 minHeight: "300px",
//               }}
//             >
//               <img
//                 src={previewDesign.file}
//                 alt={previewDesign.label}
//                 style={{
//                   maxWidth: "100%",
//                   maxHeight: "60vh",
//                   objectFit: "contain",
//                   borderRadius: "8px",
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                 }}
//                 onError={(e) => {
//                   e.target.src =
//                     "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'/%3E%3Ccircle cx='8.5' cy='8.5' r='2.5'/%3E%3Cpath d='M21 15l-5-5-6 6-3-3-4 4'/%3E%3C/svg%3E";
//                   e.target.style.width = "200px";
//                   e.target.style.height = "200px";
//                   e.target.style.objectFit = "contain";
//                 }}
//               />
//             </div>

//             <div
//               style={{
//                 padding: "14px 20px",
//                 display: "flex",
//                 gap: 10,
//                 justifyContent: "flex-end",
//                 borderTop: "1px solid #f3f4f6",
//                 flexShrink: 0,
//               }}
//             >
//               <button
//                 onClick={closePreview}
//                 style={{
//                   padding: "8px 18px",
//                   borderRadius: 8,
//                   border: "1.5px solid #e5e7eb",
//                   background: "#fff",
//                   cursor: "pointer",
//                   fontWeight: 600,
//                   fontSize: 13,
//                 }}
//               >
//                 Close
//               </button>
//               <button
//                 onClick={() => {
//                   closePreview();
//                   goToDesign(previewMonth);
//                 }}
//                 style={{
//                   padding: "8px 18px",
//                   borderRadius: 8,
//                   border: "none",
//                   background: "#0b55f4",
//                   color: "#fff",
//                   cursor: "pointer",
//                   fontWeight: 600,
//                   fontSize: 13,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 6,
//                 }}
//               >
//                 <Pencil size={14} />
//                 Edit Design
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Popup */}
//       <Popup
//         isOpen={popup.isOpen}
//         type={popup.type}
//         title={popup.title}
//         message={popup.message}
//         onClose={closePopup}
//       />

//       <style>{`
//         .monthCard {
//           transition: all 0.2s ease;
//         }
//         .monthCard .design-thumbnail {
//           position: relative;
//           cursor: pointer;
//         }
//         .monthCard .design-thumbnail:hover {
//           opacity: 0.9;
//         }
//       `}</style>
//     </Layout>
//   );
// }

export function CalendarMonth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
    showConfirmButton: false,
    confirmText: "Confirm",
  });

  // State for preview modal
  const [previewDesign, setPreviewDesign] = useState(null);
  const [previewMonth, setPreviewMonth] = useState("");

  const showPopup = (type, title, message) => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({
      ...popup,
      isOpen: false,
      onConfirm: null,
      showConfirmButton: false,
    });
  };

  const CURRENT_DOCTOR_ID =
    searchParams.get("doctorId") ||
    location.state?.doctorId ||
    sessionStorage.getItem("currentDoctorId") ||
    localStorage.getItem("currentDoctorId");

const CURRENT_MR_ID = storedUser.mrId; // Always use the logged-in user's mrId string

  // We still need calendarStatus and loading for the notice and View Summary button
  const [calendarStatus, setCalendarStatus] = useState("in_progress");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!CURRENT_DOCTOR_ID) return;

    fetch(`${API_BASE}/${CURRENT_DOCTOR_ID}?year=${CALENDAR_YEAR}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.selections) {
          setCalendarStatus(data.status || "in_progress");
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [CURRENT_DOCTOR_ID]);

  // Preview handlers (keep if needed)
  const handlePreview = (design, month) => {
    console.log("Preview clicked for:", design.label);
    setPreviewDesign(design);
    setPreviewMonth(month);
  };
  const closePreview = () => {
    setPreviewDesign(null);
    setPreviewMonth("");
  };

  // Validate IDs
  useEffect(() => {
    if (!CURRENT_DOCTOR_ID) {
      console.error("No doctor ID found");
      showPopup("error", "No Doctor Selected", "Please select a doctor first");
      navigate("/approved-doctors");
      return;
    }
    if (!CURRENT_MR_ID) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.mrId) {
        showPopup("error", "Session Expired", "Please login again");
        navigate("/login");
      }
    }
  }, []);

  if (!CURRENT_DOCTOR_ID) {
    return <div>Loading doctor information...</div>;
  }

  return (
    <Layout active="Calendar Selection">
      <Crumbs items={["Calendar Selection"]} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h1>Calendar Selection</h1>
          <p className="subtitle">
            Select a month to choose and customize the calendar design.
          </p>
        </div>
        <Button
          variant="outline"
          icon={CalendarCheck}
          onClick={() =>
            navigate(
              `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`
            )
          }
        >
          View Summary
        </Button>
      </div>

      <div className="notice">
        <Info />
        Select one month at a time and choose the preferred design in the next
        step.
        {calendarStatus === "frozen" && (
          <b style={{ marginLeft: 8, color: "#16a34a" }}>
            ✓ Calendar is frozen.
          </b>
        )}
      </div>

      {/* ✅ Use the reusable component */}
      <CalendarMonthGrid
        doctorId={CURRENT_DOCTOR_ID}
        mrId={CURRENT_MR_ID}
        isFrozen={calendarStatus === "frozen" || calendarStatus === "input_given"}
      />

      {/* Preview Modal (keep if you need it) */}
      {previewDesign && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={closePreview}
        >
          {/* ... your preview modal content ... */}
        </div>
      )}

      {/* Popup */}
      <Popup
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
        onConfirm={popup.onConfirm}
        showConfirmButton={popup.showConfirmButton}
        confirmText={popup.confirmText}
      />
    </Layout>
  );
}

export function DesignSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isUnfreeze = searchParams.get("unfreeze") === "true";
  console.log("🔍 isUnfreeze from URL:", isUnfreeze);
  console.log("🔍 All params:", searchParams.toString());

  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
    showConfirmButton: false,
    confirmText: "Confirm",
  });

  const showPopup = (
    type,
    title,
    message,
    onConfirm,
    showConfirmButton,
    confirmText,
  ) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: onConfirm || null,
      showConfirmButton: showConfirmButton || false,
      confirmText: confirmText || "Confirm",
    });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  // Get IDs from URL params
  const doctorIdFromUrl = searchParams.get("doctorId");
  const mrIdFromUrl = searchParams.get("mrId");
  const monthFromUrl = searchParams.get("month");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const CURRENT_DOCTOR_ID =
    doctorIdFromUrl ||
    location.state?.doctorId ||
    sessionStorage.getItem("currentDoctorId") ||
    localStorage.getItem("currentDoctorId");

const CURRENT_MR_ID = storedUser.mrId; // Always use the logged-in user's mrId string

  const [activeMonth, setActiveMonth] = useState(monthFromUrl || "January");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [previewDesign, setPreviewDesign] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [error, setError] = useState(null);
  const [freezing, setFreezing] = useState(false);
  const [selections, setSelections] = useState([]);
  const [doctorName, setDoctorName] = useState("");

  const designs = designAssets[activeMonth] || [];
 // ✅ Define designs FIRST


const [activeTab, setActiveTab] = useState("festival"); // ✅ singular
const filteredDesigns = designs.filter(d => 
  d.category && d.category.toLowerCase() === activeTab.toLowerCase()
);

// Debug logs
console.log("🔍 designs:", designs);
console.log("🔍 activeTab:", activeTab);
console.log("🔍 filteredDesigns:", filteredDesigns);

  const buildUrl = (path, month) => {
    return `${path}?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}${month ? `&month=${month}` : ""}`;
  };

  // Fetch doctor name
  useEffect(() => {
    if (CURRENT_DOCTOR_ID) {
      fetch(`${API_BASE_URL}/api/doctors/${CURRENT_DOCTOR_ID}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.doctorName) setDoctorName(data.doctorName);
        })
        .catch(console.error);
    }
  }, [CURRENT_DOCTOR_ID]);

  // Fetch existing selections
  useEffect(() => {
    if (!CURRENT_DOCTOR_ID) return;

    setLoadingExisting(true);
    setError(null);

    fetch(`${API_BASE}/${CURRENT_DOCTOR_ID}?year=${CALENDAR_YEAR}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data.success && data.selections) {
          setSelections(data.selections || []);
          const found = data.selections.find((s) => s.month === activeMonth);
          if (found) {
            setSelectedId(found.designId);
            setSelectedLabel(found.designLabel);
          } else {
            setSelectedId(null);
            setSelectedLabel(null);
          }
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      })
      .finally(() => setLoadingExisting(false));
  }, [activeMonth, CURRENT_DOCTOR_ID]);

  const handleSelect = (id, label) => {
    setSelectedId(id);
    setSelectedLabel(label);
    setSaved(false);
    setError(null);
  };

  const handleMonthChange = (m) => {
    setActiveMonth(m);
    navigate(buildUrl("/calendar-design", m), { replace: true });
  };

  // Save current month selection
  const handleSave = async () => {
    console.log("🔄 handleSave called");
    console.log("📦 isUnfreeze value:", isUnfreeze);

    if (!selectedId) {
      showPopup("error", "No Design Selected", "Please select a design first");
      return;
    }

    setSaving(true);

    const payload = {
      mrId: CURRENT_MR_ID,
      doctorId: CURRENT_DOCTOR_ID,
      year: CALENDAR_YEAR,
      month: activeMonth,
      designId: selectedId,
      designLabel: selectedLabel,
      unfreeze: isUnfreeze,
    };

    console.log("📤 Sending payload:", payload);

    try {
      const response = await fetch(`${API_BASE}/save-month`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📥 Response:", data);

      if (data.success === true) {
        setSaved(true);

        const newSelections = [...selections];
        const existingIndex = newSelections.findIndex(
          (s) => s.month === activeMonth,
        );
        if (existingIndex >= 0) {
          newSelections[existingIndex] = {
            month: activeMonth,
            designId: selectedId,
            designLabel: selectedLabel,
          };
        } else {
          newSelections.push({
            month: activeMonth,
            designId: selectedId,
            designLabel: selectedLabel,
          });
        }

        const allCompleted = newSelections.length === 12;
        setSelections(newSelections);

        // ✅ If unfreeze was true, show success and navigate back
        if (isUnfreeze) {
          setPopup({
            isOpen: true,
            type: "success",
            title: " Design Updated!",
            message: `Design for ${activeMonth} has been updated successfully!\n\n`,
            onConfirm: () => {
              closePopup();
              navigate(
                `/calendar-selection?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`,
              );
            },
            showConfirmButton: true,
            confirmText: "Ok",
          });
        } else if (allCompleted) {
          setPopup({
            isOpen: true,
            type: "success",
            title: " All 12 Months Completed!",
            message: "All months have been designed successfully!",
            onConfirm: () => {
              closePopup();
              navigate(
                `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`,
              );
            },
            showConfirmButton: true,
            confirmText: "Go to Summary",
          });
        } else {
          showPopup(
            "success",
            "Saved!",
            `Design for ${activeMonth} saved successfully!`,
          );
          setTimeout(() => {
            closePopup();
          }, 2000);
        }

        setTimeout(() => setSaved(false), 2000);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("❌ Save error:", err);
      showPopup("error", "Save Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle Freeze
  const handleFreeze = async () => {
    if (!isComplete) {
      showPopup(
        "error",
        "Cannot Freeze",
        `Only ${completedCount}/12 months have been selected. Please complete all months first.`,
      );
      return;
    }

    setFreezing(true);
    try {
      const response = await fetch(`${API_BASE}/freeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mrId: CURRENT_MR_ID,
          doctorId: CURRENT_DOCTOR_ID,
          year: CALENDAR_YEAR,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showPopup(
          "success",
          " Calendar Frozen!",
          "All 12 months have been frozen successfully.",
        );
        setTimeout(() => {
          navigate(
            `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`,
          );
        }, 1500);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Freeze error:", err);
      showPopup("error", "Freeze Failed", err.message);
    } finally {
      setFreezing(false);
    }
  };

  const completedCount = selections.length;
  const isComplete = completedCount === 12;

  if (error) {
    return (
      <Layout active="Calendar Selection">
        <Crumbs items={["Calendar Selection", "Select Design"]} />
        <div
          className="notice"
          style={{
            backgroundColor: "#fee2e2",
            borderColor: "#fecaca",
            color: "#dc2626",
          }}
        >

          <Info />
          <div>
            <strong>Error:</strong> {error}
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/approved-doctors")}
          >
            Go Back to Doctors
          </Button>
        </div>
        <Popup
          isOpen={popup.isOpen}
          type={popup.type}
          title={popup.title}
          message={popup.message}
          onClose={closePopup}
          onConfirm={popup.onConfirm}
          showConfirmButton={popup.showConfirmButton}
          confirmText={popup.confirmText}
        />
      </Layout>
    );
  }

return (
    <Layout active="Calendar Selection">
      <Crumbs items={["Calendar Selection", "Select Design"]} />

      <div className="pageHead">
        <div>
          <h1>
            Select Design for{" "}
            <span className="blueText">
              {activeMonth} {CALENDAR_YEAR}
            </span>
          </h1>
          <p className="subtitle">
            Show these options to the doctor and select the preferred calendar
            design.
          </p>
          <div style={{ marginTop: 8 }}>
            <Badge tone={isComplete ? "green" : "orange"}>
              {completedCount}/12 Months Completed
            </Badge>
          </div>
        </div>
        <select
          value={activeMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1.5px solid #e5e7eb",
            fontSize: 14,
          }}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m} {CALENDAR_YEAR}
            </option>
          ))}
        </select>
      </div>

      <div className="notice">
        <Info />
        {loadingExisting ? (
          "Loading saved selection…"
        ) : selectedId ? (
          <span>
            Selected: <b style={{ color: "#16a34a" }}>{selectedLabel}</b>
          </span>
        ) : (
          <span style={{ color: "#f59e0b" }}>
            No design selected yet for {activeMonth}.
          </span>
        )}
      </div>

      {saved && (
        <div
          className="notice"
          style={{
            backgroundColor: "#dcfce7",
            borderColor: "#bbf7d0",
            color: "#16a34a",
          }}
        >
          <CheckCircle2 size={18} />
          <span>✓ Design saved successfully!</span>
        </div>
      )}

      {/* ✅ Tabs - rendered BEFORE the grid */}
      <div className="designTabs" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
       {["festival", "health", "other"].map(tab => (
          <Button
  key={tab}
  variant={activeTab === tab ? "primary" : "outline"}
  onClick={() => setActiveTab(tab)}
  style={{ textTransform: "capitalize" }}
>
  {tab === "festival" ? "Festivals" : tab}
</Button>
        ))}
      </div>

      {/* ✅ Design Grid - uses filteredDesigns, not designs */}
      {filteredDesigns.length === 0 ? (
        <div className="notice">
          <Info /> No designs available for this category.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          {filteredDesigns.map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              selected={selectedId === design.id}
              onSelect={handleSelect}
              onPreview={setPreviewDesign}
            />
          ))}
        </div>
      )}

      <div className="footerActions" style={{ marginTop: 24 }}>
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => navigate(buildUrl("/calendar-selection", null))}
        >
          Back to Months
        </Button>
        <div className="spacer" />
        <Button
          variant="outline"
          onClick={() => navigate(buildUrl("/calendar-selection", null))}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!selectedId || saving}>
          {saving ? (
            "Saving..."
          ) : saved ? (
            <>
              <Check size={14} /> Saved!
            </>
          ) : (
            <>Save {activeMonth} Selection</>
          )}
        </Button>
      </div>

      {isComplete && (
        <div
          className="footerActions"
          style={{
            marginTop: 16,
            justifyContent: "center",
            borderTop: "2px solid #e5e7eb",
            paddingTop: 20,
          }}
        >
          <Button
            variant="primary"
            icon={Lock}
            onClick={handleFreeze}
            disabled={freezing}
            style={{ minWidth: 450, fontSize: 16, padding: "12px 24px" }}
          >
            {freezing ? "Freezing..." : "✓ Freeze Calendar"}
          </Button>
        </div>
      )}

      <PreviewModal
        design={previewDesign}
        month={activeMonth}
        onClose={() => setPreviewDesign(null)}
        onSelect={handleSelect}
        selected={previewDesign && selectedId === previewDesign.id}
      />

      <Popup
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
        onConfirm={popup.onConfirm}
        showConfirmButton={popup.showConfirmButton}
        confirmText={popup.confirmText}
      />
    </Layout>
  );
}
// ─── Screen 3: Summary / Finalized ──────────────────────
// export function CalendarSummary({ finalized = false }) {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const location = useLocation();

//   const { doctorId: CURRENT_DOCTOR_ID, mrId: CURRENT_MR_ID } = resolveIds(searchParams, location.state);

//   const [record, setRecord]     = useState(null);
//   const [freezing, setFreezing] = useState(false);
//   const [loading, setLoading]   = useState(true);

//   const buildUrl = (path, month) =>
//     `${path}?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}${month ? `&month=${month}` : ""}`;

//   useEffect(() => {
//     fetch(`${API_BASE}/${CURRENT_DOCTOR_ID}?year=${CALENDAR_YEAR}`)
//       .then(r => r.json())
//       .then(data => { if (data.success) setRecord(data.record); })
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   const completedCount = record?.selections?.length || 0;

//   const handleFreeze = async () => {
//     if (completedCount < 12) {
//       alert(`Only ${completedCount}/12 months selected. Please complete all months first.`);
//       return;
//     }
//     setFreezing(true);
//     try {
//       const res = await fetch(`${API_BASE}/freeze`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           mrId: CURRENT_MR_ID,
//           doctorId: CURRENT_DOCTOR_ID,
//           year: CALENDAR_YEAR,
//         }),
//       });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       navigate(buildUrl("/calendar-finalized", null));
//     } catch (err) {
//       alert("Freeze failed: " + err.message);
//     } finally {
//       setFreezing(false);
//     }
//   };

//   return (
//     <Layout active="Calendar Selection">
//       <Crumbs items={["Calendar Selection", "Summary", finalized ? "Finalized" : ""]} />
//       <h1>Calendar {finalized ? "Finalized" : "Selection"} Summary</h1>
//       <p className="subtitle">
//         {finalized
//           ? "The calendar design selection for Dr. Rajesh Shah has been finalized."
//           : "Review all selected months before freezing the calendar."}
//       </p>

//       {finalized ? (
//         <SuccessBlock title="Calendar Selection Finalized" status="CALENDAR FROZEN" />
//       ) : loading ? (
//         <p style={{ padding: 24, color: "#6b7280" }}>Loading summary…</p>
//       ) : (
//         <>
//           <div className="summaryBar">
//             <StatCard title="Calendar Year" value={CALENDAR_YEAR} icon={CalendarCheck} tone="green" />
//             <StatCard title="Total Months"  value="12" />
//             <StatCard title="Completed"     value={completedCount}      tone="green" />
//             <StatCard title="Pending"       value={12 - completedCount} tone="orange" />
//           </div>

//           <div style={{ marginTop: 20 }}>
//             <h3>Months Summary <span className="greenText">({completedCount}/12 Completed)</span></h3>
//             <div className="summaryMonths">
//               {months.map((m) => {
//                 const sel = record?.selections?.find(s => s.month === m);
//                 const allDesigns = designAssets[m] || [];
//                 const asset = allDesigns.find(d => d.id === sel?.designId);
//                 return (
//                   <div
//                     key={m}
//                     style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
//                     onClick={() => navigate(buildUrl("/calendar-design", m))}
//                   >
//                     {asset
//                       ? <img src={asset.file} alt={asset.label} style={{ width: 72, height: 52, objectFit: "cover", borderRadius: 8, border: sel ? "2px solid #16a34a" : "1.5px dashed #d1d5db" }} />
//                       : <div style={{ width: 72, height: 52, borderRadius: 8, background: "#f3f4f6", border: "1.5px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#9ca3af" }}>No design</div>
//                     }
//                     <b style={{ fontSize: 11 }}>{m}</b>
//                     <Badge tone={sel ? "green" : "blue"}>{sel ? sel.designLabel : "Pending"}</Badge>
//                   </div>
//                 );
//               })}
//             </div>
//             <div className="notice warn" style={{ marginTop: 12 }}>
//               <Info /> Click any month to change its design. You can make changes until you freeze the calendar.
//             </div>
//           </div>
//         </>
//       )}

//       <div className="footerActions">
//         <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(buildUrl("/calendar-selection", null))}>
//           Back to Months
//         </Button>
//         <div className="spacer" />
//         <Button variant="outline" icon={Download}>Download Summary (PDF)</Button>
//         {finalized
//           ? <Button variant="outline" onClick={() => navigate(buildUrl("/calendar-selection", null))}>Go to Dashboard</Button>
//           : <Button variant="primary" icon={Lock} onClick={handleFreeze} disabled={freezing}>
//               {freezing ? "Freezing…" : "Freeze Calendar"}
//             </Button>
//         }
//         {finalized && (
//           <Button variant="success" icon={CheckCircle2} onClick={() => navigate("/input-given")}>
//             Mark Input Given
//           </Button>
//         )}
//       </div>
//     </Layout>
//   );
// }

// CalendarSelect.jsx - Updated CalendarSummary component
export function CalendarSummary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const layoutRole = getCalendarLayoutRole();

  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
    showConfirmButton: false,
    confirmText: "Confirm",
  });

  const showPopup = (type, title, message) => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  const CURRENT_DOCTOR_ID =
    searchParams.get("doctorId") ||
    location.state?.doctorId ||
    sessionStorage.getItem("currentDoctorId") ||
    localStorage.getItem("currentDoctorId");

const CURRENT_MR_ID = searchParams.get("mrId") || storedUser.mrId || sessionStorage.getItem("mrId") || "";

  const [selections, setSelections] = useState([]);
  const [status, setStatus] = useState("in_progress");
  const [freezing, setFreezing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [inputGivenLoading, setInputGivenLoading] = useState(false);
  const resolvedMrId = doctorInfo?.mr?.mrId || CURRENT_MR_ID;

  // Fetch data
  useEffect(() => {
    if (!CURRENT_DOCTOR_ID) {
      setLoading(false);
      return;
    }

    const fetchCalendar = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/${CURRENT_DOCTOR_ID}?year=${CALENDAR_YEAR}`
        );
        const data = await response.json();

        if (data.success) {
          setSelections(data.selections || []);
          setStatus(data.status || "in_progress");

          // Fetch doctor details
          const doctorRes = await fetch(
            `${API_BASE_URL}/api/doctors/${CURRENT_DOCTOR_ID}`
          );
          const doctorData = await doctorRes.json();
          setDoctorInfo(doctorData.doctor);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [CURRENT_DOCTOR_ID]);

  const completedCount = selections.length;
  const isComplete = completedCount === 12;
  const isFrozen = status === "frozen" || status === "input_given";

  // Download PDF
  const downloadCompleteCalendar = async () => {
    if (selections.length === 0) {
      showPopup("No designs selected yet.");
      return;
    }

    setDownloading(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      let isFirstPage = true;

      for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const selection = selections.find((s) => s.month === month);

        if (selection) {
          const designAsset = designAssets[month]?.find(
            (d) => d.id === selection.designId
          );

          if (designAsset) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = designAsset.file;

            await new Promise((resolve) => {
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const imgData = canvas.toDataURL("image/png");

                const pdfWidth = 297;
                const pdfHeight = 210;

                const imgAspectRatio = img.width / img.height;
                const pageAspectRatio = pdfWidth / pdfHeight;

                let imgWidth, imgHeight;
                if (imgAspectRatio > pageAspectRatio) {
                  imgWidth = pdfWidth - 20;
                  imgHeight = imgWidth / imgAspectRatio;
                } else {
                  imgHeight = pdfHeight - 20;
                  imgWidth = imgHeight * imgAspectRatio;
                }

                const xOffset = (pdfWidth - imgWidth) / 2;
                const yOffset = (pdfHeight - imgHeight) / 2;

                if (!isFirstPage) pdf.addPage();
                pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);
                isFirstPage = false;
                resolve();
              };
              img.onerror = () => {
                console.error("Failed to load image:", designAsset.file);
                resolve();
              };
            });
          }
        }
      }

      pdf.save(
        `Calendar_${doctorInfo?.doctorName?.replace(/\s/g, "_") || "Doctor"}_${CALENDAR_YEAR}.pdf`
      );
      showPopup("Calendar PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF error:", err);
      showPopup("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleFreeze = async () => {
    if (!isComplete) {
      showPopup(
        `Cannot freeze calendar. Only ${completedCount}/12 months have been selected. Please complete all months first.`
      );
      return;
    }

    setFreezing(true);
    try {
      const response = await fetch(`${API_BASE}/freeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mrId: resolvedMrId,
          doctorId: CURRENT_DOCTOR_ID,
          year: CALENDAR_YEAR,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showPopup("✅ Calendar frozen successfully!");
        navigate(
          `/calendar-finalized?doctorId=${CURRENT_DOCTOR_ID}&mrId=${resolvedMrId}`
        );
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Freeze error:", err);
      showPopup(`Failed to freeze calendar: ${err.message}`);
    } finally {
      setFreezing(false);
    }
  };

  const handleMarkInputGiven = async () => {
    setInputGivenLoading(true);
    try {
      const response = await fetch(`${API_BASE}/mark-input-given`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mrId: resolvedMrId,
          doctorId: CURRENT_DOCTOR_ID,
          year: CALENDAR_YEAR,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showPopup("Input Given marked successfully!");
        navigate("/input-given");
      }
    } catch (err) {
      showPopup("Failed: " + err.message);
    } finally {
      setInputGivenLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout role={layoutRole} active="Calendar Selection">
        <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout role={layoutRole} active="Calendar Selection">
      <Crumbs items={["Calendar Selection", "Summary"]} />

      {/* ─── Page Head with Doctor Info ─── */}
      <div className="pageHead">
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            Calendar Summary
          </h1>
          {doctorInfo && (
            <>
              <p className="subtitle" style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                {doctorInfo.doctorName} • {doctorInfo.speciality || "General Physician"}
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                {doctorInfo.city || ""} {doctorInfo.mclCode ? `• MCL: ${doctorInfo.mclCode}` : ""}
              </p>
            </>
          )}
        </div>
        <div>
          {isFrozen && <Badge tone="green" style={{ fontSize: "14px", padding: "6px 12px" }}>✓ FROZEN</Badge>}
        </div>
      </div>

      {/* ─── Summary Stats ─── */}
      <div
        style={{
          padding: "20px",
          background: "white",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <div className="grid cards4" style={{ marginBottom: 24 }}>
          <StatCard
            title="Calendar Year"
            value={CALENDAR_YEAR}
            icon={CalendarDays}
            tone="blue"
          />
          <StatCard
            title="Total Months"
            value="12"
            icon={CalendarCheck}
            tone="green"
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle2}
            tone="green"
          />
          <StatCard
            title="Status"
            value={isFrozen ? "Frozen" : "In Progress"}
            icon={Lock}
            tone={isFrozen ? "green" : "orange"}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span>Progress</span>
            <span>
              {completedCount}/12 ({Math.round((completedCount / 12) * 100)}%)
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 8,
              background: "#e5e7eb",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(completedCount / 12) * 100}%`,
                height: "100%",
                background: completedCount === 12 ? "#16a34a" : "#0b55f4",
              }}
            />
          </div>
        </div>

        {isComplete && !isFrozen && (
          <div className="notice" style={{ backgroundColor: "#dcfce7" }}>
            <CheckCircle2 color="#16a34a" />
            <span>
              ✓ All 12 months selected! You can now freeze the calendar.
            </span>
          </div>
        )}
      </div>

      {/* ─── Footer Actions ─── */}
      <div
        className="footerActions"
        style={{
          marginTop: 24,
          padding: "20px 0",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() =>
            navigate(
              `/calendar-selection?doctorId=${CURRENT_DOCTOR_ID}&mrId=${resolvedMrId}`
            )
          }
        >
          Back to Months
        </Button>

        <div className="spacer" />

        <Button
          variant="outline"
          icon={Download}
          onClick={downloadCompleteCalendar}
          disabled={downloading}
        >
          {downloading ? "Generating Calendar..." : "Download Summary (PDF)"}
        </Button>

        {!isFrozen && (
          <Button
            variant="primary"
            icon={Lock}
            onClick={handleFreeze}
            disabled={!isComplete || freezing}
          >
            {freezing ? "Freezing..." : "Freeze Calendar"}
          </Button>
        )}

        {isFrozen && (
          <Button
            variant="success"
            icon={CheckCircle2}
            onClick={handleMarkInputGiven}
            disabled={inputGivenLoading}
          >
            {inputGivenLoading ? "Processing..." : "Mark Input Given"}
          </Button>
        )}
      </div>
    </Layout>
  );
}
// Finalized/Success View Component
export function CalendarFinalized() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const layoutRole = getCalendarLayoutRole();
  // Add this after your existing state declarations
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const showPopup = (type, title, message) => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };
  const CURRENT_DOCTOR_ID =
    searchParams.get("doctorId") ||
    location.state?.doctorId ||
    sessionStorage.getItem("currentDoctorId") ||
    localStorage.getItem("currentDoctorId");

const CURRENT_MR_ID =
    searchParams.get("mrId") ||
    storedUser.mrId ||
    sessionStorage.getItem("mrId") ||
    "";

  const [record, setRecord] = useState(null);
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);

  useEffect(() => {
    if (!CURRENT_DOCTOR_ID) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/${CURRENT_DOCTOR_ID}?year=${CALENDAR_YEAR}`,
        );
        const data = await response.json();

        if (data.success) {
          setRecord(data.record);
          setSelections(data.selections || []);

          // Fetch doctor details
          const doctorRes = await fetch(
            `${API_BASE_URL}/api/doctors/${CURRENT_DOCTOR_ID}`,
          );
          const doctorData = await doctorRes.json();
          setDoctorInfo(doctorData.doctor); 
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [CURRENT_DOCTOR_ID]);

  const downloadPDF = async () => {
    // PDF download functionality (same as in CalendarSummary)
    const element = document.getElementById("finalized-summary");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `calendar_finalized_${doctorInfo?.doctorName || "doctor"}_${CALENDAR_YEAR}.pdf`,
      );
    } catch (err) {
      console.error("PDF error:", err);
      showPopup("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <Layout role={layoutRole} active="Calendar Selection">
        <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout role={layoutRole} active="Calendar Selection">
      <Crumbs items={["Calendar Selection", "Summary", "Finalized"]} />

      <div
        id="finalized-summary"
        style={{ padding: "20px", background: "white" }}
      >
        {/* Success Header */}
        <div
          className="successBlock"
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <IconBox icon={CheckCircle2} tone="green" size={48} />
          <h1 style={{ color: "#16a34a", marginTop: 16, marginBottom: 8 }}>
            Calendar Finalized Successfully!
          </h1>
          <p>
            The calendar design selection for{" "}
            {doctorInfo?.doctorName || "Dr. Rajesh Shah"} has been finalized by
            you.
          </p>
        </div>

        {/* Calendar Selection Finalized Block */}
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <IconBox icon={CalendarCheck} tone="green" />
              <h2 style={{ marginTop: 8, marginBottom: 4 }}>
                Calendar Selection Finalized
              </h2>
              <p>
                All 12 months have been selected and the calendar is now frozen.
                The calendar is ready for production and handover process.
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <Badge tone="green" style={{ fontSize: 14, padding: "8px 16px" }}>
                CALENDAR FROZEN
              </Badge>
              <small style={{ display: "block", marginTop: 4, color: "#666" }}>
                Locked for Production
              </small>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>Doctor Name</div>
              <div>
                <b>{doctorInfo?.doctorName || "N/A"}</b>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>Calendar Year</div>
              <div>
                <b>{CALENDAR_YEAR}</b>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>Total Months</div>
              <div>
                <b>12</b>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>Finalized By</div>
              <div>
                <b>{storedUser.user?.name || "MR"} (MR)</b>
              </div>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div style={{ marginBottom: 24 }}>
          <h3>What happens next?</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 16,
              marginTop: 16,
            }}
          >
            <div
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            >
              <IconBox icon={Lock} tone="orange" />
              <b>Calendar Locked for Production</b>
              <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
                The selected designs are locked and sent for production.
              </p>
            </div>
            <div
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            >
              <IconBox icon={Box} tone="orange" />
              <b>Calendar Handed Over</b>
              <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
                Once printed calendars are received, please mark Input Given.
              </p>
            </div>
            <div
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            >
              <IconBox icon={CheckCircle2} tone="orange" />
              <b>Change Request (If Required)</b>
              <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
                Any changes can be made only through a change request process.
              </p>
            </div>
          </div>
        </div>

        {/* All Months Summary */}
        <div style={{ marginTop: 24 }}>
          <h3>All Months Selection Summary</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
              marginTop: 16,
            }}
          >
            {months.map((month) => {
              const selection = selections.find((s) => s.month === month);
              const designAsset = selection
                ? designAssets[month]?.find((d) => d.id === selection.designId)
                : null;
              return (
                <div
                  key={month}
                  style={{
                    padding: 12,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{month}</div>
                  {designAsset ? (
                    <img
                      src={designAsset.file}
                      alt={selection?.designLabel}
                      style={{
                        width: "100%",
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 6,
                        marginTop: 8,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 80,
                        background: "#f3f4f6",
                        borderRadius: 6,
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "#999",
                      }}
                    >
                      Design {selection?.designLabel || "N/A"}
                    </div>
                  )}
                  <Badge tone="green" style={{ marginTop: 8 }}>
                    ✓ Completed
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        className="footerActions"
        style={{
          marginTop: 24,
          padding: "20px 0",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() =>
            navigate(
              `/calendar-summary?doctorId=${CURRENT_DOCTOR_ID}&mrId=${CURRENT_MR_ID}`,
            )
          }
        >
          Back to Summary
        </Button>

        <div className="spacer" />

        <Button variant="outline" icon={Download} onClick={downloadPDF}>
          Download Summary (PDF)
        </Button>

        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>

        <Button
          variant="success"
          icon={CheckCircle2}
          onClick={() => navigate("/input-given")}
        >
          Mark Input Given
        </Button>
      </div>
    </Layout>
  );
}

export default CalendarMonth;
