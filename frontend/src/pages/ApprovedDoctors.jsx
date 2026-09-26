import React from "react";
import { useEffect, useState } from "react";
import { getApprovedDoctors, sendConsent } from "../api/doctorAPI";
import {
  Send,
  CheckCircle2,
  Clock3,
  Download,
  Mail,
  Camera,
  CalendarDays,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Pencil,
} from "lucide-react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import {
  StatCard,
  Badge,
  Button,
  Toolbar,
  DataTable,
  Crumbs,
  Field,
} from "../components/UIComponents";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { downloadCalendarPDF } from "../utils/calendarPdf";

export default function ApprovedDoctors() {
  const [doctorData, setDoctorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingConsent, setSendingConsent] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();

  // Popup state
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // Consent Modal state
  const [consentModal, setConsentModal] = useState({
    isOpen: false,
    doctorId: null,
    doctorName: "",
    email: "",
    tempEmail: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await getApprovedDoctors(user.mrId);
      setDoctorData(response.doctors || []);
      setFilteredData(response.doctors || []);
    } catch (error) {
      console.log(error);
      showPopup(
        "error",
        "Failed to Load Doctors",
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  useEffect(() => {
    let result = doctorData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.doctorName?.toLowerCase().includes(term) ||
        d.speciality?.toLowerCase().includes(term) ||
        d.mclCode?.toLowerCase().includes(term)
      );
    }
    if (statusFilter) {
      if (statusFilter === "sent") result = result.filter(d => d.consentSent);
      else if (statusFilter === "notsent") result = result.filter(d => !d.consentSent);
      else if (statusFilter === "approved") result = result.filter(d => d.consentStatus === "approved");
      else if (statusFilter === "pending") result = result.filter(d => d.consentStatus === "pending");
    }
    if (specialtyFilter) {
      result = result.filter(d => d.speciality === specialtyFilter);
    }
    if (dateFilter === "Today") {
      const today = new Date().toDateString();
      result = result.filter(d => new Date(d.createdAt).toDateString() === today);
    } else if (dateFilter === "Last 7 Days") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter(d => new Date(d.createdAt) >= weekAgo);
    } else if (dateFilter === "This Month") {
      const now = new Date();
      result = result.filter(d => {
        const date = new Date(d.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
    }
    setFilteredData(result);
  }, [searchTerm, statusFilter, specialtyFilter, dateFilter, doctorData]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSpecialtyFilter("");
    setDateFilter("");
  };

  const showPopup = (type, title, message) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup({
      ...popup,
      isOpen: false,
    });
  };

  // Open consent confirmation modal
  const openConsentModal = (doctorId, doctorName, email) => {
    setConsentModal({
      isOpen: true,
      doctorId,
      doctorName,
      email: email || "",
      tempEmail: email || "",
    });
  };

  // Close consent modal
  const closeConsentModal = () => {
    setConsentModal({
      ...consentModal,
      isOpen: false,
    });
  };

  // Handle email change in modal
  const handleEmailChange = (e) => {
    setConsentModal({
      ...consentModal,
      tempEmail: e.target.value,
    });
  };

  // Send consent with email
  const handleSendConsentWithEmail = async () => {
    const { doctorId, doctorName, tempEmail } = consentModal;

    // Validate email
    if (!tempEmail || !tempEmail.includes("@")) {
      showPopup(
        "error",
        "Invalid Email",
        "Please enter a valid email address.",
      );
      return;
    }

    // Close modal
    closeConsentModal();

    setSendingConsent((prev) => ({ ...prev, [doctorId]: true }));
    try {
      // If email changed, update doctor's email first
      if (tempEmail !== consentModal.email) {
        // You might want to call an API to update the email here
        // For now, we'll just send to the updated email
        await updateDoctorEmail(doctorId, tempEmail);
      }

      await sendConsent(doctorId);
      showPopup(
        "success",
        "Consent Email Sent!",
        `Consent email has been sent to ${tempEmail} successfully.`,
      );
      fetchDoctors();
    } catch (error) {
      showPopup(
        "error",
        "Failed to Send Consent",
        error.response?.data?.message ||
          "Failed to send consent email. Please try again.",
      );
    } finally {
      setSendingConsent((prev) => ({ ...prev, [doctorId]: false }));
    }
  };

  // Update doctor email (you need to add this API call)
  const updateDoctorEmail = async (doctorId, email) => {
    try {
      // Add your update email API call here
      // await axios.patch(`/api/doctors/${doctorId}/email`, { email });
      console.log(`Updating email for doctor ${doctorId} to ${email}`);
    } catch (error) {
      console.error("Failed to update email:", error);
    }
  };

  const handleDownloadPhotos = async (doctorId, doctorName, photos) => {
    if (!photos || photos.length === 0) {
      showPopup("error", "No Photos", "This doctor has no uploaded photos.");
      return;
    }
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${doctorName.replace(/\s/g, "_")}_photos`);

      const downloadPromises = photos.map(async (photo, index) => {
        const response = await fetch(`https://calendarme.digilateral.com${photo.url}`);
        const blob = await response.blob();
        const ext = photo.url.split(".").pop() || "jpg";
        folder.file(`photo_${index + 1}.${ext}`, blob);
      });

      await Promise.all(downloadPromises);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `Doctor_${doctorName.replace(/\s/g, "_")}_Photos.zip`);
      showPopup("success", "Download Complete", "Photos downloaded as ZIP.");
    } catch (error) {
      console.error("Download error:", error);
      showPopup("error", "Download Failed", "Could not download photos.");
    }
  };

  const handleDownloadCalendar = async (doctorId, doctorName) => {
    try {
      await downloadCalendarPDF(doctorId, doctorName);
      showPopup(
        "success",
        "Download Started",
        "Calendar PDF is being generated.",
      );
    } catch (error) {
      showPopup("error", "Download Failed", error.message);
    }
  };

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor-details/${doctorId}`);
  };

  const handleUploadPhoto = (doctorId) => {
    navigate(`/doctor-details/${doctorId}?action=upload-photo`);
  };

  const handleViewPhoto = (doctorId) => {
    navigate(`/doctor-details/${doctorId}`);
  };

  const handleCalendarSelection = (doctorId) => {
    navigate(`/calendar-selection?doctorId=${doctorId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout active="My Doctors">
      <Crumbs items={["My Doctors", "Approved Doctors"]} />
      <div className="pageHead">
        <div>
          <h1>Approved Doctors</h1>
          <p className="subtitle">
            Below are the doctors approved by Manager / FLM.
          </p>
        </div>
        {/* <Button variant="outline" icon={Download}>
          Export
        </Button> */}
      </div>

      <div className="grid cards4">
        <StatCard
          title="Total Approved"
          value={filteredData.length}
          icon={Send}
          tone="green"
        />
        <StatCard
          title="Consent Sent"
          value={filteredData.filter((d) => d.consentSent).length}
          icon={Mail}
          tone="blue"
        />
        <StatCard
          title="Consent Pending"
          value={filteredData.filter((d) => !d.consentSent).length}
          icon={Clock3}
          tone="orange"
        />
        <StatCard
          title="Photo Uploaded"
          value={filteredData.filter((d) => d.photoUploaded).length}
          icon={Camera}
          tone="purple"
        />
      </div>

      <Toolbar
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        statusValue={statusFilter}
        onStatusChange={(e) => setStatusFilter(e.target.value)}
        specialtyValue={specialtyFilter}
        onSpecialtyChange={(e) => setSpecialtyFilter(e.target.value)}
        dateValue={dateFilter}
        onDateChange={(e) => setDateFilter(e.target.value)}
        onClearFilters={handleClearFilters}
        statusOptions={["Sent", "Not Sent", "Consent Given", "Consent Pending"]}
        specialtyOptions={["Cardiology", "Dermatology", "Paediatrics", "Orthopedics", "General Physician"]}
      />
<div style={{ overflowX: 'auto', width: '100%' }}>
      <DataTable
        headers={[
          "Doctor Name",
          "Speciality",
          "MCL Code",
          "Approved On",
          "Consent Status",
          "Photo Status",
          "Actions",
        ]}
        rows={filteredData.map((doctor) => [
          <span
            key={`name-${doctor._id}`}
            onClick={() => handleDoctorClick(doctor._id)}
            style={{ cursor: "pointer", color: "#0066cc", fontWeight: 500 }}
            className="doctor-name-link"
          >
            {doctor.doctorName}
          </span>,
          doctor.speciality,
          doctor.mclCode,
          new Date(doctor.approvedAt || doctor.updatedAt).toLocaleDateString(),
          doctor.consentSent ? (
            doctor.consentStatus === "approved" ? (
              <Badge tone="green">Consent Given</Badge>
            ) : (
              <Badge tone="blue">Consent Sent</Badge>
            )
          ) : (
            <Badge tone="orange">Consent Not Sent</Badge>
          ),
          doctor.photoUploaded ? (
            <span
              onClick={() =>
                handleDownloadPhotos(
                  doctor._id,
                  doctor.doctorName,
                  doctor.doctorPhotos,
                )
              }
              style={{
                cursor: "pointer",
                color: "#10b981",
                textDecoration: "underline",
              }}
            >
               ({doctor.doctorPhotos?.length || 0})
            </span>
          ) : (
            <Badge tone="orange">Pending</Badge>
          ),
          <div className="action-icons" key={`actions-${doctor._id}`}>
            {!doctor.consentSent && (
              <button
                className="icon-btn consent-icon"
                onClick={() =>
                  openConsentModal(doctor._id, doctor.doctorName, doctor.email)
                }
                disabled={sendingConsent[doctor._id]}
                title="Send Consent"
              >
                <Mail size={16} />
              </button>
            )}

            {doctor.consentStatus === "approved" && !doctor.photoUploaded && (
              <button
                className="icon-btn photo-icon"
                onClick={() => handleUploadPhoto(doctor._id)}
                title="Upload Photo"
              >
                <Camera size={16} />
              </button>
            )}

            {doctor.photoUploaded && (
              <>
                <button
                  className="icon-btn view-icon"
                  onClick={() => handleViewPhoto(doctor._id)}
                  title="View"
                >
                  <Eye size={16} />
                </button>
                {doctor.calendarFrozen && (
                  <button
                    className="icon-btn calendar-icon"
                    onClick={() =>
                      handleDownloadCalendar(doctor._id, doctor.doctorName)
                    }
                    title="Download Calendar"
                  >
                    <CalendarDays size={16} />
                  </button>
                )}
              </>
            )}
          </div>,
        ])}
      />
      </div>

      <style>{`
        .doctor-name-link:hover {
          text-decoration: underline;
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
        
        .action-icons {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .consent-icon {
          color: #3b82f6;
        }
        
        .consent-icon:hover:not(:disabled) {
          background-color: #eff6ff;
          transform: scale(1.1);
        }
        
        .consent-icon:disabled {
          color: #93c5fd;
          cursor: not-allowed;
        }
        
        .photo-icon {
          color: #10b981;
        }
        
        .photo-icon:hover {
          background-color: #ecfdf5;
          transform: scale(1.1);
        }
        
        .view-icon {
          color: #f59e0b;
        }
        
        .view-icon:hover {
          background-color: #fffbeb;
          transform: scale(1.1);
        }
        
        .calendar-icon {
          color: #8b5cf6;
        }
        
        .calendar-icon:hover {
          background-color: #f5f3ff;
          transform: scale(1.1);
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .action-icons {
            gap: 8px;
          }
        }
      `}</style>

      {/* Consent Confirmation Modal */}
      {consentModal.isOpen && (
        <div
          className="modal-overlay"
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
            zIndex: 10000,
            animation: "fadeIn 0.3s ease",
          }}
          onClick={closeConsentModal}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              animation: "scaleIn 0.3s ease",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={closeConsentModal}
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

            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                  }}
                >
                  <Mail size={24} />
                </div>
                <div>
                  <h2
                    style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}
                  >
                    Send Consent Email
                  </h2>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Dr. {consentModal.doctorName}
                  </p>
                </div>
              </div>
            </div>

            {/* Email input */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                }}
              >
                Email Address
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email"
                  value={consentModal.tempEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter doctor's email"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <p
                style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}
              >
                Edit the email address if needed before sending.
              </p>
            </div>

            {/* Doctor info */}
            <div
              style={{
                background: "#f9fafb",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#666" }}>Doctor:</span>
                <span style={{ fontWeight: "500" }}>
                  {consentModal.doctorName}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                <span style={{ color: "#666" }}>Consent will be sent to:</span>
                <span style={{ fontWeight: "500", color: "#1e40af" }}>
                  {consentModal.tempEmail || "Not set"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={closeConsentModal}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f9fafb")}
                onMouseLeave={(e) => (e.target.style.background = "white")}
              >
                Cancel
              </button>
              <button
                onClick={handleSendConsentWithEmail}
                disabled={sendingConsent[consentModal.doctorId]}
                style={{
                  flex: 2,
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#3b82f6",
                  color: "white",
                  cursor: sendingConsent[consentModal.doctorId]
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  opacity: sendingConsent[consentModal.doctorId] ? 0.7 : 1,
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (!sendingConsent[consentModal.doctorId]) {
                    e.target.style.background = "#2563eb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!sendingConsent[consentModal.doctorId]) {
                    e.target.style.background = "#3b82f6";
                  }
                }}
              >
                <Mail size={16} />
                {sendingConsent[consentModal.doctorId]
                  ? "Sending..."
                  : "Send Consent"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Popup */}
      {popup.isOpen && (
        <div
          className="popup-overlay"
          onClick={closePopup}
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
              onClick={closePopup}
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
              {popup.type === "success" ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                  }}
                >
                  <CheckCircle size={32} />
                </div>
              ) : (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                  }}
                >
                  <AlertCircle size={32} />
                </div>
              )}
            </div>

            <h2
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: popup.type === "success" ? "#065f46" : "#991b1b",
              }}
            >
              {popup.title}
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
              {popup.message}
            </p>

            <button
              onClick={closePopup}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                backgroundColor:
                  popup.type === "success" ? "#10b981" : "#ef4444",
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
                  popup.type === "success" ? "#059669" : "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor =
                  popup.type === "success" ? "#10b981" : "#ef4444";
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}