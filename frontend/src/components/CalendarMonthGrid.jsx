import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  RotateCcw,
  Eye,
  Pencil,
  Lock,
  Info,
} from "lucide-react";
import { Badge, Button, IconBox } from "./UIComponents";
import { cls, months } from "../utils/helpers";
import { designAssets } from "../utils/designAssets";

const CALENDAR_YEAR = 2027;
const API_BASE = "https://calendarme.digilateral.com/api/calendar";

export default function CalendarMonthGrid({ doctorId, mrId, isFrozen = false }) {
  const navigate = useNavigate();
  const [dbSelections, setDbSelections] = useState({});
  const [calendarStatus, setCalendarStatus] = useState("in_progress");
  const [loading, setLoading] = useState(true);
  const [previewDesign, setPreviewDesign] = useState(null); // State for preview modal

  useEffect(() => {
    if (!doctorId) return;
    fetch(`${API_BASE}/${doctorId}?year=${CALENDAR_YEAR}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.selections) {
          const map = {};
          data.selections.forEach((s) => {
            map[s.month] = s.designId;
          });
          setDbSelections(map);
          setCalendarStatus(data.status || "in_progress");
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const goToDesign = (month) => {
    if (isFrozen || calendarStatus === "frozen") return;
    navigate(`/calendar-design?month=${month}&doctorId=${doctorId}&mrId=${mrId}`);
  };

  if (loading) return <div>Loading calendar…</div>;

  const completedCount = Object.keys(dbSelections).length;

  return (
    <div>
      {/* Legend */}
      <div className="legend" style={{ marginBottom: "16px" }}>
        <Badge>Completed</Badge>
        <Badge tone="orange">Pending</Badge>
        <Badge tone="blue">Not Started</Badge>
      </div>

      {/* Month Grid */}
      <div className="monthGrid">
        {months.map((m) => {
          const isDone = !!dbSelections[m];
          const status = isDone ? "completed" : "pending";
          const selectedDesign = dbSelections[m]
            ? designAssets[m]?.find((d) => d.id === dbSelections[m])
            : null;

          let icon = RotateCcw;
          let tone = "blue";
          let statusText = "Not Started";
          let statusColor = "#94a3b8";

          if (isDone) {
            icon = CheckCircle2;
            tone = "green";
            statusText = "Completed";
            statusColor = "#10b981";
          } else {
            icon = Clock3;
            tone = "orange";
            statusText = "Pending";
            statusColor = "#f59e0b";
          }

          const isDisabled = isFrozen || calendarStatus === "frozen";

          return (
            <div
              key={m}
              className={cls("monthCard", isDone && "done")}
              style={{
                position: "relative",
                background: "white",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                border: "1px solid #e5e7eb",
                opacity: isDisabled ? 0.7 : 1,
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "8px" }}>
                {m}
              </div>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                {CALENDAR_YEAR}
              </div>

              {/* Design thumbnail */}
              {selectedDesign ? (
                <div
                  style={{
                    width: "100%",
                    height: "140px",
                    overflow: "hidden",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    position: "relative",
                    border: `2px solid ${statusColor}`,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    background: "#f9fafb",
                  }}
                  onClick={() => goToDesign(m)}
                >
                  <img
                    src={selectedDesign.file}
                    alt={selectedDesign.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="2" y="2" width="20" height="20" rx="2.18"/%3E%3Ccircle cx="8.5" cy="8.5" r="2.5"/%3E%3Cpath d="M21 15l-5-5-6 6-3-3-4 4"/%3E%3C/svg%3E';
                    }}
                  />
                  {isDone && (
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "#10b981",
                        color: "white",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "140px",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    background: "#f3f4f6",
                    border: `2px dashed ${statusColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    color: "#9ca3af",
                  }}
                  onClick={() => goToDesign(m)}
                >
                  <span style={{ fontSize: "32px", marginBottom: "8px" }}>🖼️</span>
                  <span style={{ fontSize: "12px" }}>No design selected</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px", width: "100%", marginBottom: "8px" }}>
                {selectedDesign && (
                  <Button
                    variant="outline"
                    icon={Eye}
                    onClick={() => setPreviewDesign(selectedDesign)} // ✅ Opens modal
                    style={{ flex: 1, justifyContent: "center", fontSize: "12px", padding: "6px 12px" }}
                  >
                    Preview
                  </Button>
                )}
                <Button
                  variant={isDone ? "outline" : "primary"}
                  icon={isDone ? Pencil : undefined}
                  onClick={() => goToDesign(m)}
                  disabled={isDisabled}
                  style={{
                    flex: selectedDesign ? 1 : 1,
                    justifyContent: "center",
                    fontSize: "12px",
                    padding: "6px 12px",
                    opacity: isDisabled ? 0.6 : 1,
                  }}
                >
                  {isDisabled ? "🔒 Frozen" : isDone ? "Change" : "Select"}
                </Button>
              </div>

              <Badge tone={tone} style={{ marginTop: "4px" }}>
                {statusText}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Freeze button if all months completed and not frozen */}
      {completedCount === 12 && !isFrozen && calendarStatus !== "frozen" && (
        <div
          style={{
            marginTop: "32px",
            padding: "20px",
            background: "#f0fdf4",
            borderRadius: "12px",
            border: "1px solid #bbf7d0",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: "12px", color: "#065f46" }}>
            ✅ All 12 months have been selected! You can now freeze the calendar.
          </p>
          <Button
            variant="primary"
            icon={Lock}
            onClick={() => navigate(`/calendar-summary?doctorId=${doctorId}&mrId=${mrId}`)}
            style={{ minWidth: "250px", fontSize: "16px", padding: "12px 24px" }}
          >
            Freeze Calendar
          </Button>
        </div>
      )}

      {isFrozen && (
        <div
          style={{
            marginTop: "32px",
            padding: "20px",
            background: "#dbeafe",
            borderRadius: "12px",
            border: "1px solid #bfdbfe",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: "12px", color: "#1e40af" }}>
            ❄️ This calendar is <b>FROZEN</b>. You can view the designs but cannot change them.
          </p>
          <Button
            variant="outline"
            icon={Eye}
            onClick={() => navigate(`/calendar-summary?doctorId=${doctorId}&mrId=${mrId}`)}
            style={{ minWidth: "200px" }}
          >
            View Summary
          </Button>
        </div>
      )}

      {/* ✅ Preview Modal */}
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
          onClick={() => setPreviewDesign(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 700,
              width: "100%",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "12px 16px", textAlign: "right" }}>
              <button
                onClick={() => setPreviewDesign(null)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <img
              src={previewDesign.file}
              alt={previewDesign.label}
              style={{ width: "100%", maxHeight: "65vh", objectFit: "contain" }}
            />
            <div style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>
              {previewDesign.label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}