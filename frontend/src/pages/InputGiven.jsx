import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, Box, Info, ArrowLeft, Download, X, AlertCircle } from "lucide-react";
import Layout from "../components/Layout";
import { StatCard, Badge, Button, DataTable, Crumbs, SuccessBlock } from "../components/UIComponents";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api`;

export default function InputGiven({ modal = false, success = false }) {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [stats, setStats] = useState({
    readyForHandover: 0,
    inputGivenToday: 0,
    pendingInputGiven: 0,
    calendarDelivered: 0,
  });

  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    doctor: null,
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const mrId = user.mrId;

        if (!mrId) {
          console.error("No MR ID found");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/doctors/mr/${mrId}`);
        const data = await response.json();

        if (data.success && data.doctors) {
          // ✅ Filter only approved doctors
          const approvedDoctors = data.doctors.filter(d => d.approvalStatus === "approved");
          setDoctors(approvedDoctors);
          
          // Recalculate stats based on approved doctors only
          const ready = approvedDoctors.filter(d => d.calendarStatus === "frozen" && !d.inputGiven).length;
          const pending = approvedDoctors.filter(d => d.calendarStatus === "frozen" && !d.inputGiven).length;
          const delivered = approvedDoctors.filter(d => d.inputGiven === true).length;
          const today = approvedDoctors.filter(d => {
            if (!d.inputGivenAt) return false;
            const todayDate = new Date().toDateString();
            const inputDate = new Date(d.inputGivenAt).toDateString();
            return todayDate === inputDate;
          }).length;
          
          setStats({
            readyForHandover: ready,
            inputGivenToday: today,
            pendingInputGiven: pending,
            calendarDelivered: delivered,
          });
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const openConfirmPopup = (doctor) => {
    setConfirmPopup({ isOpen: true, doctor });
  };

  const closeConfirmPopup = () => {
    setConfirmPopup({ isOpen: false, doctor: null });
  };

  const handleConfirmYes = () => {
    const doctor = confirmPopup.doctor;
    closeConfirmPopup();
    setSelectedDoctor(doctor);
    setShowModal(true);
    setRemarks("");
  };

  const handleConfirmInputGiven = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const response = await fetch(`${API_BASE}/calendar/mark-input-given`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mrId: user.mrId,
          doctorId: selectedDoctor._id,
          year: 2027,
          remarks: remarks,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Input Given marked successfully!");
        setShowModal(false);
        window.location.reload();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to mark Input Given: " + err.message);
    }
  };

  if (success) {
    return (
      <Layout active="Input Given">
        <Crumbs items={["Input Given", "Confirmed"]} />
        <h1>Input Given Successfully!</h1>
        <p className="subtitle">The calendar has been marked as handed over to the doctor.</p>
        <SuccessBlock title="Input Given Confirmed" status="INPUT GIVEN" />
        <div className="footerActions">
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/input-given")}>
            Back to Input Given List
          </Button>
          <div className="spacer" />
          <Button variant="outline" icon={Download}>
            Download Handover Confirmation (PDF)
          </Button>
          <Button onClick={() => navigate("/mr-dashboard")}>Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout active="Input Given">
        <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout active="Input Given">
      <Crumbs items={["Input Given"]} />
      <h1>Input Given</h1>
      <p className="subtitle">
        Select the doctor whose personalized calendar has been handed over to mark as Input Given.
      </p>
      
      <div className="grid cards4">
        <StatCard title="Ready for Handover" value={stats.readyForHandover} icon={CalendarDays} />
        <StatCard title="Input Given Today" value={stats.inputGivenToday} icon={CheckCircle2} tone="green" />
        <StatCard title="Pending Input Given" value={stats.pendingInputGiven} icon={Clock3} tone="orange" />
        <StatCard title="Calendar Dispatched" value={stats.calendarDelivered} icon={Box} tone="purple" />
      </div>
      
      <div className="notice">
        <Info />
        Mark the calendar as Input Given only after the personalized calendar has been physically handed over to the doctor.
      </div>
      
      <DataTable
        headers={[
          "Doctor Name",
          "Speciality",
          "MCL Code",
          "City",
          "Calendar Status",
          "Input Given Status",
          "Last Updated",
          "Action",
        ]}
        rows={doctors.map((doctor) => [
          doctor.doctorName,
          doctor.speciality || "N/A",
          doctor.mclCode || "N/A",
          doctor.city || "N/A",
          <Badge tone={doctor.calendarStatus === "frozen" ? "green" : "orange"}>
            {doctor.calendarStatus === "frozen" ? "Frozen" : doctor.calendarStatus || "Not Started"}
          </Badge>,
          <Badge tone={doctor.inputGiven ? "green" : "orange"}>
            {doctor.inputGiven ? "Delivered" : "Pending"}
          </Badge>,
          doctor.updatedAt ? new Date(doctor.updatedAt).toLocaleDateString() : "N/A",
          !doctor.inputGiven && doctor.calendarStatus === "frozen" ? (
            <Button onClick={() => openConfirmPopup(doctor)}>Mark Input Given</Button>
          ) : doctor.inputGiven ? (
            <Badge tone="green">Delivered</Badge>
          ) : (
            <Badge tone="orange">Waiting</Badge>
          ),
        ])}
      />
      
      {/* Confirmation Popup */}
      {confirmPopup.isOpen && confirmPopup.doctor && (
        <div
          className="popup-overlay"
          onClick={closeConfirmPopup}
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
              maxWidth: "420px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              animation: "scaleIn 0.3s ease",
              position: "relative",
            }}
          >
            <button
              onClick={closeConfirmPopup}
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
                  backgroundColor: "#fef3c7",
                  color: "#92400e",
                }}
              >
                <AlertCircle size={32} />
              </div>
            </div>

            <h2
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#92400e",
              }}
            >
              Confirm Input Given
            </h2>

            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#666",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              Are you sure you want to mark Input Given for <strong>{confirmPopup.doctor.doctorName}</strong>?<br />
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={closeConfirmPopup}
                style={{
                  flex: 1,
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
                Cancel
              </button>
              <button
                onClick={handleConfirmYes}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#d97706";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#f59e0b";
                }}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Remarks Modal */}
      {showModal && selectedDoctor && (
        <div className="modalOverlay" onClick={() => setShowModal(false)}>
          <div className="modal small" onClick={e => e.stopPropagation()}>
            <button className="x" onClick={() => setShowModal(false)}>
              <X />
            </button>
            <h2>Mark Input Given</h2>
            <p>Provide the handover details to mark the calendar as Input Given.</p>
            
            <div style={{ marginBottom: 16, background: "#f9fafb", padding: 12, borderRadius: 8 }}>
              <p><strong>Doctor Name:</strong> {selectedDoctor.doctorName}</p>
              <p><strong>MCL Code:</strong> {selectedDoctor.mclCode || "N/A"}</p>
              <p><strong>Calendar Year:</strong> 2027</p>
              <p><strong>Calendar Status:</strong> {selectedDoctor.calendarStatus}</p>
            </div>
            
            <label>Input Given Date *</label>
            <div className="input" style={{ marginBottom: 16 }}>
              <CalendarDays size={20} />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            
            <label>Remarks (Optional)</label>
            <textarea
              placeholder="Enter any remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 16 }}
              rows={3}
            />
            
            <div className="modalActions">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleConfirmInputGiven}>Confirm Input Given</Button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media (max-width: 768px) {
  .tableBox {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  .tableBox table {
    min-width: 700px;
    width: 100%;
  }
}
      `}</style>
    </Layout>
  );
}