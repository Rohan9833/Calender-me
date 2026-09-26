import React from "react";
import { cls } from "../utils/helpers";
import {
  CheckCircle2, Users, BarChart3, ChevronDown, Search, Filter,
  Eye, Pencil, MoreVertical, ArrowRight, ArrowLeft,Trash2
} from "lucide-react";

// ─── IconBox ────────────────────────────────────────────
export function IconBox({ icon: Icon = CheckCircle2, tone = "blue" }) {
  return (
    <div className={`iconbox ${tone}`}>
      <Icon size={24} />
    </div>
  );
}

// ─── Badge ──────────────────────────────────────────────
export function Badge({ children, tone = "green" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

// ─── Button ─────────────────────────────────────────────
export function Button({ children, variant = "primary", icon: Icon, onClick, className = "", disabled = false, size = "medium" }) {
  return (
    <button 
      onClick={onClick} 
      className={cls("btn", variant, className, size)} 
      disabled={disabled}
    >
      {Icon && <Icon size={16} />} 
      {children}
    </button>
  );
}

// ─── StatCard ───────────────────────────────────────────
// ─── StatCard ───────────────────────────────────────────
export function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  tone = "blue",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`stat ${tone} flex items-center gap-3 rounded-xl bg-white p-3 sm:p-4 lg:p-5 shadow-sm transition hover:shadow-md ${
        onClick ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-lg sm:text-2xl lg:text-3xl font-bold wrap-break-word">
          {title}
        </p>

        <h3 className="text-lg font-bold text-gray-900 sm:text-2xl lg:text-3xl">
          {value}
        </h3>

        {sub && (
          <small className="hidden text-[10px] text-gray-500 sm:block sm:text-xs">
            {sub}
          </small>
        )}
      </div>
    </div>
  );
}

// ─── ProgressBar ────────────────────────────────────────
export function ProgressBar({ value = 60, tone = "green" }) {
  return (
    <span className="progress">
      <span className={tone} style={{ width: `${value}%` }} />
    </span>
  );
}

// ─── Avatar ─────────────────────────────────────────────
export function Avatar({ name, role }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <div className="avatarWrap">
      <div className="avatar">{initials}</div>
      <div>
        <strong>{name}</strong>
        <small>{role}</small>
      </div>
    </div>
  );
}

// ─── SelectBox ──────────────────────────────────────────
export function SelectBox({ label = "All", wide = false, value, onChange, options = [] }) {
  if (options && options.length > 0) {
    return (
      <select
        className={cls("selectbox", wide && "wide")}
        value={value}
        onChange={onChange}
        style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ddd" }}
      >
        <option value="">All</option>
        {options.map(opt => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    );
  }
  // Fallback static display
  return (
    <div className={cls("selectbox", wide && "wide")} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {label}
      <ChevronDown size={16} />
    </div>
  );
}

// ─── SearchBox ──────────────────────────────────────────
// ─── SearchBox ──────────────────────────────────────────
export function SearchBox({ placeholder = "Search doctor name, MCL code...", value = "", onChange }) {
  return (
    <div className="search" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Search size={17} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          border: "none",
          background: "transparent",
          outline: "none",
          padding: "6px 0",
          fontSize: "14px",
          width: "100%",
        }}
      />
    </div>
  );
}
// ─── Panel ──────────────────────────────────────────────
export function Panel({ title, children, action, onActionClick, style }) {
  return (
    <div className="panel" style={style}>
      <div className="panelHead">
        <h3>{title}</h3>
        {action && (
          <button onClick={onActionClick} style={{ cursor: 'pointer' }}>
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── ListLine ───────────────────────────────────────────
export function ListLine({ icon: Icon, title, sub, value, onClick, clickable = true, style }) {
  return (
    <div 
      className="listline" 
      onClick={onClick}
      style={{ cursor: clickable && onClick ? 'pointer' : 'default', ...style }}
    >
      <IconBox icon={Icon} tone="orange" />
      <div>
        <b>{title}</b>
        <span>{sub}</span>
      </div>
      <strong>{value}</strong>
      <ArrowRight size={18} />
    </div>
  );
}

// ─── DoctorActivity ─────────────────────────────────────
export function DoctorActivity({ doctor, style }) {
  let status = "";
  let statusTone = "orange";

  if (doctor.approvalStatus === "approved") {
    status = "Approved";
    statusTone = "green";
  } else if (doctor.consentStatus === "approved" && doctor.approvalStatus === "pending") {
    status = "Approval Pending";
    statusTone = "orange";
  } else if (doctor.consentStatus === "pending") {
    status = "Consent Pending";
    statusTone = "orange";
  } else if (doctor.status === "draft") {
    status = "Draft";
    statusTone = "purple";
  } else {
    status = "Pending";
    statusTone = "orange";
  }

  return (
    <div className="doctorAct" style={style}>
      <div className="miniAvatar">
        {doctor.doctorName?.split(" ")?.map((n) => n[0])?.slice(0, 2)?.join("") || "D"}
      </div>
      <div>
        <b>{doctor.doctorName}</b>
        <span>{doctor.speciality} | {doctor.city}</span>
      </div>
      <Badge tone={statusTone}>{status}</Badge>
      <small>by {doctor.mr?.mrName || "MR"}</small>
    </div>
  );
}

// ─── ManagerActivity ────────────────────────────────────
// In UIComponents.jsx - Updated ManagerActivity
export function ManagerActivity({ title, status, time }) {
  return (
    <div className="doctorAct" style={{ 
      padding: '12px',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div className="miniAvatar" style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#e0e7ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#4f46e5',
        fontSize: '14px',
        flexShrink: 0
      }}>
        {title?.split(' ').slice(0, 2).map(x => x?.[0] || '').join('') || 'A'}
      </div>

      <div style={{ flex: 1 }}>
        <b style={{ fontSize: '13px', display: 'block' }}>{title || 'Activity'}</b>
        {time && (
          <small style={{ fontSize: '11px', color: '#999' }}>
            {new Date(time).toLocaleString()}
          </small>
        )}
      </div>

      <Badge tone={status === "Completed" ? "green" : status === "Rejected" ? "red" : "purple"}>
        {status || "Completed"}
      </Badge>
    </div>
  );
}
// ─── Toolbar ────────────────────────────────────────────
export function Toolbar({
  searchValue = "",
  onSearchChange,
  statusValue = "",
  onStatusChange,
  specialtyValue = "",
  onSpecialtyChange,
  dateValue = "",
  onDateChange,
  onClearFilters,
  statusOptions = ["All Status", "Draft", "Submitted", "Approved", "Pending"],
  specialtyOptions = ["All Specialties", "Cardiology", "Dermatology", "Paediatrics", "Orthopedics", "General Physician"],
}) {
  return (
    <div className="toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
      <SearchBox
        placeholder="Search by Doctor Name, Speciality, MCL Code..."
        value={searchValue}
        onChange={onSearchChange}
      />
      <SelectBox
        label="All Status"
        value={statusValue}
        onChange={onStatusChange}
        options={statusOptions}
      />
      <SelectBox
        label="All Specialties"
        value={specialtyValue}
        onChange={onSpecialtyChange}
        options={specialtyOptions}
      />
      <SelectBox
        label="Select Date Range"
        value={dateValue}
        onChange={onDateChange}
        options={["Today", "Last 7 Days", "This Month"]}
      />
      <Button variant="outline" icon={Filter} onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}

// ─── Actions ────────────────────────────────────────────
// In UIComponents.jsx
export function Actions({ edit, onView, onEdit, onDelete, showView = true }) {
  return (
    <div className="actions">
      {showView && <Button variant="icon" icon={Eye} onClick={onView} />}
      {edit && <Button variant="icon" icon={Pencil} onClick={onEdit} />}
      {/* <Button variant="icon" icon={MoreVertical} onClick={onDelete} /> */}
       <Button variant="icon" icon={Trash2} onClick={onDelete} /> 
    </div>
  );
}


// ─── DataTable ──────────────────────────────────────────

// ─── DataTable ──────────────────────────────────────────
export function DataTable({ headers, rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="tableBox">
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="tableBox overflow-x-auto">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="tableFoot">
        <span>
          Showing 1 to {Math.min(rows.length, 10)} of {rows.length} entries
        </span>
        <div className="pager">
          <button>‹</button>
          <button className="on">1</button>
          <button>›</button>
        </div>
      </div>
    </div>
  );
}
// ─── Breadcrumbs ────────────────────────────────────────
export function Crumbs({ items }) {
  return (
    <div className="crumbs">
      Dashboard{" "}
      {items?.map((i) => (
        <React.Fragment key={i}>
          › <span>{i}</span>{" "}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Form helpers ───────────────────────────────────────
export function Field({
  label,
  select,
  textarea,
  custom,
  value,
  onChange,
  name,
  options = [],
  required,
  type = "text",
  disabled,
  helperText,
}) {
  return (
    <label className="field">
      <span>{label}</span>

      {custom ? (
        custom
      ) : textarea ? (
        <textarea
          className="fakeInput area"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label.replace(" *", "").toLowerCase()}`}
          disabled={disabled}
        />
      ) : select ? (
        <select
          className="fakeInput"
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          <option value="">
            Select {label.replace(" *", "")}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="fakeInput"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label.replace(" *", "").toLowerCase()}`}
          disabled={disabled}
        />
      )}
      {helperText && <small style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>{helperText}</small>}
    </label>
  );
}

export function SectionTitle({ children }) {
  return <h3 className="sectionTitle">{children}</h3>;
}

export function InfoCard({ title, lines }) {
  return (
    <div className="infoCard">
      <h3>{title}</h3>
      {lines.map((l) => (
        <p key={l}>• {l}</p>
      ))}
    </div>
  );
}

export function Section({ title, data }) {
  return (
    <div>
      <h3>{title}</h3>
      {data.map((x) => {
        const [a, b] = x.split(": ");
        return (
          <p key={x}>
            <span>{a}</span>
            <b>{b}</b>
          </p>
        );
      })}
    </div>
  );
}

// ─── SuccessBlock ───────────────────────────────────────
export function SuccessBlock({ title, status }) {
  return (
    <>
      <div className="successBlock">
        <IconBox icon={CheckCircle2} tone="green" />
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
          <span>Doctor Name <b>Dr. Rajesh Shah</b></span>
          <span>Calendar Year <b>2027</b></span>
          <span>Total Months <b>12</b></span>
          <span>Finalized By <b>Amit Sharma (MR)</b></span>
          <span>Finalized On <b>20 May 2025, 04:35 PM</b></span>
        </div>
      </div>
      <Panel title="What happens next?">
        <ListLine icon={CheckCircle2} title="Calendar Locked for Production" sub="The selected designs are locked and sent for production." />
        <ListLine icon={CheckCircle2} title="Calendar Handed Over" sub="Once printed calendars are received, please mark Input Given." />
        <ListLine icon={CheckCircle2} title="Change Request (If Required)" sub="Any changes can be made only through a change request process." />
      </Panel>
    </>
  );
}