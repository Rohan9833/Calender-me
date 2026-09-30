import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { useNavigate, useParams } from "react-router-dom";
import {
  Pencil,
  Download,
  Upload,
  Clock3,
  CheckCircle2,
  Camera,
  CalendarDays,
  Hand,
  Send,
  X,
  AlertCircle,
} from "lucide-react";
import Layout from "../components/Layout";
import { uploadDoctorPhotos } from "../api/doctorAPI";
import {
  Badge,
  Button,
  IconBox,
  Section,
  Crumbs,
} from "../components/UIComponents";
import { ConsentModal } from "../components/Modal";
import { getDoctorDetails } from "../api/doctorAPI";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import api from "../api/axios";
import { downloadCalendarPDF } from "../utils/calendarPdf";
import CalendarMonthGrid from "../components/CalendarMonthGrid";
import jsPDF from "jspdf";
import { deleteDoctorPhoto } from "../api/doctorAPI";
import { getManagerMRs } from "../api/managerAPI";

// ---- Mobile breakpoint hook ----
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

// ─── Popup Component ────────────────────────────────────
function Popup({ isOpen, type, title, message, onClose }) {
  if (!isOpen) return null;
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
          {type === "success" ? (
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
              <CheckCircle2 size={32} />
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
            color: type === "success" ? "#065f46" : "#991b1b",
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
          }}
        >
          {message}
        </p>

        <button
          onClick={onClose}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            backgroundColor: type === "success" ? "#10b981" : "#ef4444",
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
              type === "success" ? "#059669" : "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor =
              type === "success" ? "#10b981" : "#ef4444";
          }}
        >
          Got it
        </button>
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

// ─── Campaign Summary ──────────────────────────────────
function CampaignSummary({ doctor }) {
  const isMobile = useIsMobile(768);
  return (
    <div className="campaignSummary" style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: isMobile ? "16px" : "20px" }}>Campaign Status Summary</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {[
          ["Consent", doctor.consentStatus || "Pending", CheckCircle2],
          ["Photo", doctor.photoUploaded ? "Uploaded" : "Pending", Camera],
          [
            "Calendar",
            doctor.calendarFrozen ? "Frozen" : "Pending",
            CalendarDays,
          ],
          [
            "Input Given",
            doctor.inputGivenStatus === "completed" ? "Yes" : "No",
            Hand,
          ],
          ["Delivered", doctor.calendarDelivered ? "Yes" : "No", CheckCircle2],
        ].map(([title, value, Icon]) => (
          <div
            key={title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "#f9fafb",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              flex: isMobile ? "1 0 calc(50% - 12px)" : "1 0 auto",
              minWidth: isMobile ? 0 : 120,
            }}
          >
            <IconBox icon={Icon} tone="green" />
            <div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: "#6b7280" }}>{title}</div>
              <div style={{ fontWeight: 600, fontSize: isMobile ? 13 : 14 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline ──────────────────────────────────────────
function Timeline({ doctor, onViewFullTimeline }) {
  const isMobile = useIsMobile(768);
  const timelineItems = [
    {
      title: "Doctor Added",
      by: doctor.mr?.mrName,
      date: doctor.createdAt,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Consent Sent",
      by: doctor.mr?.mrName,
      date: doctor.consentSentAt,
      icon: Send,
      tone: "purple",
    },
    {
      title: "Consent Approved",
      by: doctor.mr?.mrName,
      date: doctor.consentDate || doctor.approvedAt,
      icon: CheckCircle2,
      tone: "orange",
    },
    {
      title: "Photo Uploaded",
      by: doctor.mr?.mrName,
      date: doctor.photoUploadedAt,
      icon: Camera,
      tone: "green",
    },
    {
      title: "Calendar Design Selected",
      by: doctor.mr?.mrName,
      date: doctor.calendarSelectedAt,
      icon: CalendarDays,
      tone: "purple",
    },
    {
      title: "Calendar Frozen",
      by: doctor.mr?.mrName,
      date: doctor.calendarFrozenAt,
      icon: CalendarDays,
      tone: "orange",
    },
    {
      title: "Input Given",
      by: doctor.mr?.mrName,
      date: doctor.inputGivenAt,
      icon: Hand,
      tone: "green",
    },
    {
      title: "Calendar Delivered",
      by: doctor.mr?.mrName,
      date: doctor.deliveredAt,
      icon: Send,
      tone: "purple",
    },
  ];

  timelineItems.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <aside
      className="doctor-timeline"
      style={{
        background: "white",
        borderRadius: 12,
        padding: isMobile ? 16 : 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb",
        height: isMobile ? "auto" : "fit-content",
        position: isMobile ? "static" : "sticky",
        top: 20,
      }}
    >
      <h3 style={{ marginBottom: 16, fontSize: isMobile ? "16px" : "18px" }}>
        Activity Timeline
      </h3>
      {timelineItems.map((item) => (
        <div
          key={item.title}
          style={{
            display: "flex",
            gap: 12,
            padding: isMobile ? "8px 0" : "12px 0",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <IconBox icon={item.icon} tone={item.tone} />
          <div style={{ flex: 1 }}>
            <b style={{ display: "block", fontSize: isMobile ? "13px" : "14px" }}>{item.title}</b>
            <span style={{ fontSize: isMobile ? 12 : 13, color: "#6b7280" }}>
              By {item.by || "-"} (MR)
            </span>
            <small
              style={{
                display: "block",
                fontSize: isMobile ? 10 : 11,
                color: "#9ca3af",
                marginTop: 2,
              }}
            >
              {item.date
                ? new Date(item.date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata",
                  })
                : "-"}
            </small>
          </div>
        </div>
      ))}
      <Button variant="outline" icon={Clock3} onClick={onViewFullTimeline} style={{ marginTop: 12, width: isMobile ? "100%" : "auto" }}>
        View Full Timeline
      </Button>
    </aside>
  );
}

// ─── Main Component ─────────────────────────────────────
export default function DoctorDetail({ consentModal = false }) {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const isMobile = useIsMobile(768);
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [doctor, setDoctor] = useState(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [calendarData, setCalendarData] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineActivities, setTimelineActivities] = useState([]);
  const [timelineError, setTimelineError] = useState("");
  const isManager =
    ["flm", "slm", "tlm", "ho", "manager"].includes(
      String(storedUser.role || "").toLowerCase()
    );
  const [managerMRs, setManagerMRs] = useState([]);
  const [managerMRLoading, setManagerMRLoading] = useState(false);
  const [selectedManagerMrId, setSelectedManagerMrId] = useState("");

  const showPopup = (type, title, message) => {
    setPopup({ isOpen: true, type, title, message });
  };
  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  const handleViewFullTimeline = async () => {
    if (!doctorId) return;

    setTimelineOpen(true);
    setTimelineLoading(true);
    setTimelineError("");

    try {
      const response = await api.get(`/doctors/${doctorId}/timeline`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to load timeline.");
      }

      setTimelineActivities(response.data.timeline || response.data.activities || []);
    } catch (error) {
      console.error("Failed to fetch doctor timeline:", error);
      setTimelineActivities([]);
      setTimelineError(
        error.response?.data?.message ||
        error.message ||
        "Unable to load timeline."
      );
    } finally {
      setTimelineLoading(false);
    }
  };


  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await getDoctorDetails(doctorId);
        setDoctor(data.doctor);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!doctor || !isManager) return;

    const managerUserId =
      storedUser.flmId ||
      storedUser.slmId ||
      storedUser.tlmId ||
      storedUser.hoId ||
      storedUser.managerId ||
      "";

    if (!managerUserId) {
      setManagerMRs([]);
      return;
    }

    setManagerMRLoading(true);
    getManagerMRs(storedUser.role, managerUserId)
      .then((data) => {
        setManagerMRs(data.mrs || []);
      })
      .catch((error) => {
        console.error("Failed to load manager MRs:", error);
        setManagerMRs([]);
        showPopup(
          "error",
          "Unable to load MRs",
          "Could not load the MRs you can act on behalf of."
        );
      })
      .finally(() => setManagerMRLoading(false));
  }, [doctor, isManager]);

  useEffect(() => {
    if (doctor) {
      fetchCalendarData();
    }
  }, [doctor]);

  const fetchCalendarData = async () => {
    if (!doctorId) return;
    setCalendarLoading(true);
    try {
      const response = await api.get(`/calendar/${doctorId}?year=2027`);
      if (response.data.success) {
        setCalendarData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch calendar:", error);
    } finally {
      setCalendarLoading(false);
    }
  };

  if (!doctor) {
    return <Layout active="My Doctors">Loading...</Layout>;
  }

  const isPhotoLimitReached = (doctor?.doctorPhotos?.length || 0) >= 5;
  const isApproved = doctor?.approvalStatus === "approved";

  const handlePhotoUpload = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      const formData = new FormData();
      files.forEach((file) => formData.append("photos", file));

      if (isManager) {
        if (!selectedManagerMrId) {
          showPopup(
            "error",
            "Select MR First",
            "Please select the MR you are acting on behalf of before uploading photos."
          );
          return;
        }
        formData.append("mrId", selectedManagerMrId);
      }

      await uploadDoctorPhotos(doctorId, formData);
      const data = await getDoctorDetails(doctorId);
      setDoctor(data.doctor);
      showPopup("success", "Photos Uploaded!", "Photos uploaded successfully!");
    } catch (error) {
      console.log(error);
      showPopup("error", "Upload Failed", "Failed to upload photos Doctor havent approved yet");
    }
  };

  const handleDeletePhoto = async (photoId, index) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      await deleteDoctorPhoto(doctorId, photoId);
      const updatedPhotos = doctor.doctorPhotos.filter((_, i) => i !== index);
      setDoctor({
        ...doctor,
        doctorPhotos: updatedPhotos,
        photoUploaded: updatedPhotos.length > 0,
      });
      showPopup("success", "Photo Deleted", "Photo removed successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      showPopup("error", "Delete Failed", "Could not delete photo.");
    }
  };

  const handleDownloadPhotosZip = async () => {
    if (!doctor?.doctorPhotos?.length) {
      showPopup("error", "No Photos", "No photos to download.");
      return;
    }
    try {
      const zip = new JSZip();
      const folder = zip.folder(
        `${doctor.doctorName.replace(/\s/g, "_")}_photos`,
      );
      const downloadPromises = doctor.doctorPhotos.map(async (photo, index) => {
        const response = await fetch(
          `${API_BASE_URL}${photo.url}`,
        );
        const blob = await response.blob();
        const ext = photo.url.split(".").pop() || "jpg";
        folder.file(`photo_${index + 1}.${ext}`, blob);
      });
      await Promise.all(downloadPromises);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(
        zipBlob,
        `Doctor_${doctor.doctorName.replace(/\s/g, "_")}_Photos.zip`,
      );
      showPopup("success", "Download Complete", "Photos downloaded as ZIP.");
    } catch (error) {
      console.error("Download error:", error);
      showPopup("error", "Download Failed", "Could not download photos.");
    }
  };

  const handleDownloadCalendarPDF = async () => {
    if (!calendarData?.selections?.length) {
      showPopup(
        "error",
        "No Calendar",
        "This doctor has no calendar selections.",
      );
      return;
    }
    try {
      await downloadCalendarPDF(
        doctorId,
        doctor.doctorName,
        calendarData.selections,
      );
      showPopup(
        "success",
        "Download Started",
        "Calendar PDF is being generated.",
      );
    } catch (error) {
      showPopup("error", "Download Failed", error.message);
    }
  };

  const handleEditDoctor = () => navigate(`/edit-doctor/${doctorId}`);

  const handleDownloadProfile = async () => {
    if (!doctor) return;
    showPopup(
      "success",
      "Generating PDF...",
      "Please wait while we prepare your download.",
    );

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor("#0b55f4");
      doc.text("Doctor Profile", 14, 22);
      doc.setDrawColor(11, 85, 244);
      doc.line(14, 26, 196, 26);
      doc.setFontSize(12);
      doc.setTextColor("#1a1a2e");

      let y = 36;
      const lineHeight = 8;
      const x = 16;

      doc.setFont("helvetica", "bold");
      doc.text("Doctor Information", x, y);
      y += lineHeight;
      doc.setFont("helvetica", "normal");

      const info = [
        `Name:        ${doctor.doctorName}`,
        `Speciality:  ${doctor.speciality}`,
        `MCL Code:    ${doctor.mclCode}`,
        `Clinic:      ${doctor.clinicName || "-"}`,
        `City:        ${doctor.city || "-"}`,
        `Area:        ${doctor.area || "-"}`,
        `Email:       ${doctor.email || "-"}`,
        `Mobile:      ${doctor.mobile || "-"}`,
        `Status:      ${doctor.approvalStatus || "Pending"}`,
      ];
      info.forEach((line) => {
        doc.text(line, x, y);
        y += lineHeight;
      });
      y += 4;

      doc.setFont("helvetica", "bold");
      doc.text("Business Information", x, y);
      y += lineHeight;
      doc.setFont("helvetica", "normal");

      const business = [
        `Current Business:  ₹${doctor.currentBusiness || 0}`,
        `Expected Business: ₹${doctor.expectedBusiness || 0}`,
        `Brand Focus:       ${doctor.brandFocus || "-"}`,
        `Other Activities:  ${doctor.otherActivities || "-"}`,
      ];
      business.forEach((line) => {
        doc.text(line, x, y);
        y += lineHeight;
      });
      y += 6;

      if (doctor.doctorPhotos && doctor.doctorPhotos.length > 0) {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Photos", x, y);
        y += lineHeight;
        doc.setFont("helvetica", "normal");

        const imagePromises = doctor.doctorPhotos.map((photo, index) => {
          return new Promise((resolve) => {
            const imgUrl = `${API_BASE_URL}${photo.url}`;
            fetch(imgUrl)
              .then((res) => {
                if (!res.ok) throw new Error("Failed to load");
                return res.blob();
              })
              .then((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve({ index, data: reader.result, success: true });
                };
                reader.onerror = () => {
                  resolve({ index, success: false });
                };
                reader.readAsDataURL(blob);
              })
              .catch(() => {
                resolve({ index, success: false });
              });
          });
        });

        const results = await Promise.all(imagePromises);
        const imgWidth = 60;
        const imgHeight = 60;
        const rowGap = 10;
        const colGap = 10;
        let imgX = x;
        let imgY = y;

        results.forEach((result) => {
          if (result.success) {
            if (imgY + imgHeight > 280) {
              doc.addPage();
              imgY = 20;
              imgX = x;
            }
            doc.addImage(result.data, "JPEG", imgX, imgY, imgWidth, imgHeight);
            doc.setFontSize(8);
            doc.text(`Photo ${result.index + 1}`, imgX, imgY + imgHeight + 4);
            doc.setFontSize(12);
            imgX += imgWidth + colGap;
            if (imgX + imgWidth > 196) {
              imgX = x;
              imgY += imgHeight + rowGap + 8;
            }
          }
        });
        y = imgY + imgHeight + rowGap + 8;
      }

      doc.setFontSize(10);
      doc.setTextColor("#6b7280");
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`Downloaded on: ${new Date().toLocaleString()}`, x, y);

      doc.save(`Doctor_${doctor.doctorName.replace(/\s/g, "_")}_Profile.pdf`);

      closePopup();
      showPopup(
        "success",
        "Download Complete!",
        "Profile PDF downloaded successfully.",
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      closePopup();
      showPopup(
        "error",
        "Download Failed",
        "Could not generate PDF. Please try again.",
      );
    }
  };

  const mrIdString =
    storedUser.mrId ||
    doctor?.mr?._id ||
    doctor?.mr?.mrId ||
    doctor?.mrId ||
    "";

  return (
    <Layout active="My Doctors">
      <Crumbs items={["My Doctors", "Doctor Details"]} />
      <div className="doctor-detail-shell">
      <div
        className="pageHead doctor-detail-head"
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 12 : 8,
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: "bold", margin: 0 }}>
            {doctor.doctorName}
            <Badge style={{ marginLeft: 8, fontSize: isMobile ? 12 : 14 }}>
              {doctor.approvalStatus || "Pending"}
            </Badge>
          </h1>
          <p
            className="subtitle"
            style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: isMobile ? 13 : 14 }}
          >
            {doctor.speciality} • {doctor.mclCode}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
          <Button variant="outline" icon={Pencil} onClick={handleEditDoctor} size={isMobile ? "small" : "medium"}>
            Edit Doctor
          </Button>
          <Button
            variant="outline"
            icon={Download}
            onClick={handleDownloadProfile}
            size={isMobile ? "small" : "medium"}
          >
            Download Profile
          </Button>
        </div>
      </div>

      <div
        className="doctor-detail-grid"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
          gap: isMobile ? 16 : 24,
          alignItems: "start",
        }}
      >
        {/* Left Column */}
        <div>
          <div
            className="tabs doctor-detail-tabs"
            style={{
              display: "flex",
              gap: isMobile ? 12 : 16,
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: 8,
              marginBottom: 20,
              overflowX: "auto",
            }}
          >
            <span
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
              style={{
                cursor: "pointer",
                fontWeight: activeTab === "overview" ? "bold" : "normal",
                color: activeTab === "overview" ? "#0b55f4" : "#6b7280",
                paddingBottom: 4,
                borderBottom:
                  activeTab === "overview" ? "2px solid #0b55f4" : "none",
                whiteSpace: "nowrap",
                fontSize: isMobile ? 13 : 14,
              }}
            >
              Overview
            </span>
            <span
              className={activeTab === "calendar" ? "active" : ""}
              onClick={() => setActiveTab("calendar")}
              style={{
                cursor: "pointer",
                fontWeight: activeTab === "calendar" ? "bold" : "normal",
                color: activeTab === "calendar" ? "#0b55f4" : "#6b7280",
                paddingBottom: 4,
                borderBottom:
                  activeTab === "calendar" ? "2px solid #0b55f4" : "none",
                whiteSpace: "nowrap",
                fontSize: isMobile ? 13 : 14,
              }}
            >
              Calendar & Photo
            </span>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              <div
                className="doctor-detail-avatar"
                style={{
                  width: isMobile ? 60 : 80,
                  height: isMobile ? 60 : 80,
                  borderRadius: "50%",
                  background: "#0b55f4",
                  color: "white",
                  fontSize: isMobile ? 24 : 32,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {doctor.doctorName
                  ?.trim()
                  .split(" ")
                  .filter((w) => w.length > 0)
                  .map((w) => w.charAt(0).toUpperCase())
                  .slice(0, 2)
                  .join("")}
              </div>

              <div
                className="doctor-info-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: isMobile ? 12 : 20,
                  marginBottom: 24,
                }}
              >
                <Section
                  title="Doctor Information"
                  data={[
                    `Speciality: ${doctor.speciality}`,
                    `MCL Code: ${doctor.mclCode}`,
                    `Clinic / Hospital: ${doctor.clinicName || "-"}`,
                    `City: ${doctor.city || "-"}`,
                    `Email: ${doctor.email || "-"}`,
                    `Mobile: ${doctor.mobile || "-"}`,
                  ]}
                />
                <Section
                  title="Hierarchy"
                  data={[
                    `HQ / Location: ${doctor.mr?.hq || "-"}`,
                    `Region: ${doctor.mr?.region || "-"}`,
                    `Zone: ${doctor.mr?.zone || "-"}`,
                    `MR: ${doctor.mr?.mrName || "-"}`,
                    `Manager: ${doctor.mr?.flm?.flmName || "-"}`,
                  ]}
                />
              </div>

              <div className="doctor-business-card" style={{ marginBottom: 24 }}>
                <Section
                  title="Business Information"
                  data={[
                    `Current Business (₹): ${doctor.currentBusiness || 0}`,
                    `Expected Business (₹): ${doctor.expectedBusiness || 0}`,
                    `Other Activities: ${doctor.otherActivities || "-"}`,
                  ]}
                />
              </div>

              <CampaignSummary doctor={doctor} />
            </>
          )}

          {/* Calendar & Photo Tab */}
          {activeTab === "calendar" && (
            <div>
              {isManager && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: isMobile ? 14 : 18,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#172033",
                        }}
                      >
                        Select MR to act on behalf of
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: "#64748b",
                        }}
                      >
                        Select the MR responsible for this doctor before uploading photos or selecting the calendar.
                      </div>
                    </div>
                    <select
                      value={selectedManagerMrId}
                      onChange={(e) => setSelectedManagerMrId(e.target.value)}
                      disabled={managerMRLoading}
                      style={{
                        minWidth: isMobile ? "100%" : 280,
                        padding: "10px 12px",
                        borderRadius: 9,
                        border: "1px solid #bfdbfe",
                        background: "#fff",
                        color: "#172033",
                        fontSize: 13,
                        fontWeight: 600,
                        outline: "none",
                      }}
                    >
                      <option value="">
                        {managerMRLoading ? "Loading MRs..." : "Select MR"}
                      </option>
                      {managerMRs.map((mr) => (
                        <option key={mr._id} value={mr.mrId}>
                          {mr.mrName} ({mr.mrId})
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedManagerMrId && doctor?.mr?.mrId !== selectedManagerMrId && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "9px 11px",
                        borderRadius: 8,
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        color: "#9a3412",
                        fontSize: 11,
                      }}
                    >
                      The selected MR is not the MR assigned to this doctor. Select {doctor?.mr?.mrName || "the assigned MR"} to continue.
                    </div>
                  )}
                </div>
              )}

              {/* Photo Section */}
              <div
                style={{
                  marginBottom: 28,
                  background: "#fff",
                  border: "1px solid #e5eaf3",
                  borderRadius: 16,
                  padding: isMobile ? 16 : 22,
                  boxShadow: "0 5px 20px rgba(15, 31, 77, 0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", color: "#0b55f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Camera size={19} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: isMobile ? 17 : 19, fontWeight: 700, color: "#172033" }}>Doctor Photos</h3>
                    </div>
                    <p style={{ margin: 0, color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>
                      Upload up to 5 clear photos of the doctor.
                    </p>
                  </div>

                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 10px",
                    borderRadius: 999, background: isPhotoLimitReached ? "#f0fdf4" : "#f8fafc",
                    border: "1px solid " + (isPhotoLimitReached ? "#bbf7d0" : "#e5eaf3"),
                    color: isPhotoLimitReached ? "#15803d" : "#64748b", fontSize: 11, fontWeight: 700
                  }}>
                    <Camera size={13} />
                    {doctor?.doctorPhotos?.length || 0}/5 photos
                  </div>
                </div>

                {isApproved && (!isManager || !!selectedManagerMrId) ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/*"
                      hidden
                      onChange={handlePhotoUpload}
                      disabled={isPhotoLimitReached}
                    />

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 14, flexWrap: "wrap", padding: isMobile ? 14 : 16, borderRadius: 12,
                      border: "1px dashed " + (isPhotoLimitReached ? "#bbf7d0" : "#b9c9df"),
                      background: isPhotoLimitReached ? "#f0fdf4" : "#f8fbff"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <div style={{ width: 42, height: 42, flex: "0 0 42px", borderRadius: 11, background: "#fff", border: "1px solid #dbe7f5", color: "#0b55f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Upload size={19} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#172033" }}>
                            {isPhotoLimitReached ? "All photo slots are filled" : "Add doctor photos"}
                          </div>
                          <div style={{ marginTop: 3, fontSize: 11, color: "#64748b" }}>
                            {isPhotoLimitReached ? "Delete a photo if you need to replace one." : "JPG, PNG or WebP • You can select multiple photos."}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        icon={Upload}
                        onClick={() => { if (!isPhotoLimitReached) fileInputRef.current?.click(); }}
                        disabled={isPhotoLimitReached}
                      >
                        {isPhotoLimitReached ? "Limit Reached" : "Choose Photos"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, background: "#f8fafc", border: "1px solid #e5eaf3" }}>
                    <div style={{ width: 40, height: 40, flex: "0 0 40px", borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔒</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Photo upload is locked</div>
                      <div style={{ marginTop: 3, fontSize: 11, color: "#64748b" }}>
                        Photos can be uploaded after doctor approval. Current status: <strong>{doctor.approvalStatus || "Pending"}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {doctor.doctorPhotos && doctor.doctorPhotos.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 11 }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#334155" }}>Uploaded Photos</h4>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>Click a photo to view it</span>
                      </div>

                      <Button variant="outline" icon={Download} onClick={handleDownloadPhotosZip} size="small">
                        Download ZIP
                      </Button>
                    </div>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(5, minmax(0, 1fr))",
                      gap: isMobile ? 10 : 12
                    }}>
                      {doctor.doctorPhotos.map((photo, idx) => (
                        <div
                          key={photo._id || idx}
                          style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)" }}
                          onClick={() => window.open(API_BASE_URL + photo.url, "_blank", "noopener,noreferrer")}
                        >
                          <img
                            src={API_BASE_URL + photo.url}
                            alt={"Doctor photo " + (idx + 1)}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            onError={(e) => {
                              e.currentTarget.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"%3E%3Crect x="2" y="2" width="20" height="20" rx="2.18"/%3E%3Ccircle cx="8.5" cy="8.5" r="2.5"/%3E%3Cpath d="M21 15l-5-5-6 6-3-3-4 4"/%3E%3C/svg%3E';
                            }}
                          />

                          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px 8px 7px", background: "linear-gradient(transparent, rgba(15,23,42,.78))", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                            Photo {idx + 1}
                          </div>

                          <button
                            type="button"
                            aria-label={"Delete photo " + (idx + 1)}
                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo._id, idx); }}
                            style={{ position: "absolute", top: 7, right: 7, width: 29, height: 29, border: "1px solid rgba(255,255,255,.65)", borderRadius: 8, background: "rgba(15,23,42,.72)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}

                      {!isPhotoLimitReached &&
                        Array.from({ length: 5 - doctor.doctorPhotos.length }).map((_, idx) => (
                          <button
                            key={"empty-photo-slot-" + idx}
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ aspectRatio: "1 / 1", borderRadius: 12, border: "1px dashed #cbd5e1", background: "#f8fafc", color: "#94a3b8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}
                          >
                            <Upload size={18} />
                            <span style={{ fontSize: 10, fontWeight: 700 }}>Add photo</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Calendar Section */}
              <div>
                {/* <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                    {doctor.calendarFrozen ? "Frozen Calendar" : "Calendar Selection"}
                  </h3>
                  {doctor.calendarFrozen && (
                    <Button variant="outline" icon={Download} onClick={handleDownloadCalendarPDF}>
                      Download Calendar PDF
                    </Button>
                  )}
                </div> */}
                {isManager && !selectedManagerMrId ? (
                  <div
                    style={{
                      padding: 24,
                      textAlign: "center",
                      border: "1px dashed #bfdbfe",
                      borderRadius: 12,
                      background: "#f8fbff",
                      color: "#64748b",
                    }}
                  >
                    Select an MR above to start calendar selection on their behalf.
                  </div>
                ) : (
                  <CalendarMonthGrid
                    doctorId={doctorId}
                    mrId={isManager ? selectedManagerMrId : mrIdString}
                    isFrozen={doctor.calendarFrozen || false}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Timeline – moves to bottom on mobile */}
        <Timeline doctor={doctor} onViewFullTimeline={handleViewFullTimeline} />
      </div>
      </div>

      <style>{`
        .doctor-detail-shell {
          --dd-blue: #0b55f4;
          --dd-navy: #0f1f4d;
          --dd-text: #172554;
          --dd-muted: #64748b;
          --dd-border: #e5eaf3;
          position: relative;
          isolation: isolate;
        }

        .doctor-detail-head {
          animation: ddFadeUp .55s cubic-bezier(.22,1,.36,1) both;
        }

        .doctor-detail-grid {
          animation: ddFadeUp .7s .08s cubic-bezier(.22,1,.36,1) both;
        }

        .doctor-detail-shell .doctor-detail-head h1 {
          letter-spacing: -.035em;
        }

        .doctor-detail-shell .doctor-detail-head button {
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .doctor-detail-shell .doctor-detail-head button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(11,85,244,.14);
        }

        .doctor-detail-tabs {
          position: relative;
          overflow: hidden !important;
          box-shadow: 0 8px 24px rgba(15,31,77,.04);
          transition: box-shadow .25s ease, transform .25s ease;
        }

        .doctor-detail-tabs:hover {
          box-shadow: 0 12px 30px rgba(15,31,77,.07);
        }

        .doctor-detail-tabs::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 90px;
          height: 2px;
          background: linear-gradient(90deg,#0b55f4,#67a3ff,transparent);
          animation: ddShimmer 2.8s ease-in-out infinite;
          pointer-events: none;
        }

        .doctor-detail-tabs > span {
          transition: color .25s ease, transform .25s ease;
        }

        .doctor-detail-tabs > span:hover {
          transform: translateY(-2px);
        }

        .doctor-detail-avatar {
          box-shadow: 0 14px 30px rgba(11,85,244,.22);
          animation: ddFloat 4s ease-in-out infinite, ddPop .65s .18s cubic-bezier(.22,1,.36,1) both;
          position: relative;
        }

        .doctor-detail-avatar::after {
          content: "";
          position: absolute;
          inset: -7px;
          border: 1px solid rgba(11,85,244,.18);
          border-radius: 50%;
          animation: ddPulse 2.4s ease-out infinite;
        }

        .doctor-info-grid {
          align-items: stretch;
        }

        .doctor-info-grid > div,
        .doctor-business-card,
        .campaignSummary,
        .doctor-timeline {
          background: rgba(255,255,255,.97);
          border: 1px solid var(--dd-border);
          box-shadow: 0 8px 24px rgba(15,31,77,.045);
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
        }

        .doctor-info-grid > div {
          border-radius: 16px;
          padding: 22px;
          animation: ddCardIn .65s cubic-bezier(.22,1,.36,1) both;
        }

        .doctor-info-grid > div:nth-child(2) {
          animation-delay: .12s;
        }

        .doctor-info-grid > div:hover,
        .doctor-business-card:hover,
        .campaignSummary:hover,
        .doctor-timeline:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 38px rgba(15,31,77,.09);
          border-color: #d6e1f7;
        }

        .doctor-info-grid h3,
        .doctor-business-card h3 {
          margin-top: 0;
          color: var(--dd-navy);
          font-size: 17px;
          letter-spacing: -.015em;
        }

        .doctor-info-grid p,
        .doctor-business-card p {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 18px;
          margin: 0;
          padding: 11px 0;
          border-bottom: 1px solid #f0f3f8;
          color: var(--dd-muted);
          line-height: 1.45;
        }

        .doctor-info-grid p:last-child,
        .doctor-business-card p:last-child {
          border-bottom: 0;
        }

        .doctor-info-grid p span,
        .doctor-business-card p span {
          color: #64748b;
          font-size: 13px;
        }

        .doctor-info-grid p b,
        .doctor-business-card p b {
          color: var(--dd-text);
          font-size: 14px;
          text-align: right;
          word-break: break-word;
        }

        .doctor-business-card {
          border-radius: 16px;
          padding: 22px;
          animation: ddCardIn .7s .18s cubic-bezier(.22,1,.36,1) both;
        }

        .campaignSummary {
          animation: ddCardIn .7s .25s cubic-bezier(.22,1,.36,1) both;
          overflow: hidden;
        }

        .campaignSummary > div {
          transition: transform .25s ease, background .25s ease;
        }

        .campaignSummary > div:hover {
          transform: translateY(-3px);
        }

        .doctor-timeline {
          box-shadow: 0 10px 28px rgba(15,31,77,.06);
          animation: ddSlideRight .75s .12s cubic-bezier(.22,1,.36,1) both;
          overflow: hidden;
        }

        .doctor-timeline h3 {
          color: var(--dd-navy);
          letter-spacing: -.02em;
        }

        .doctor-timeline > div:not(:first-child) {
          transition: transform .25s ease, background-color .25s ease;
          border-radius: 12px;
          padding-left: 8px !important;
          padding-right: 8px !important;
        }

        .doctor-timeline > div:not(:first-child):hover {
          transform: translateX(5px);
          background: #f8fbff;
        }

        .doctor-timeline .iconbox {
          transition: transform .25s ease;
        }

        .doctor-timeline > div:hover .iconbox {
          transform: rotate(-5deg) scale(1.06);
        }

        @keyframes ddFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ddCardIn {
          from { opacity: 0; transform: translateY(24px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes ddSlideRight {
          from { opacity: 0; transform: translateX(28px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes ddPop {
          from { opacity: 0; transform: scale(.82); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes ddFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes ddPulse {
          0% { opacity: .55; transform: scale(.94); }
          70%,100% { opacity: 0; transform: scale(1.12); }
        }

        @keyframes ddShimmer {
          0%,100% { opacity: .25; transform: translateX(-8px); }
          50% { opacity: 1; transform: translateX(32px); }
        }

        @media (max-width: 768px) {
          .doctor-info-grid > div,
          .doctor-business-card {
            padding: 17px;
          }

          .doctor-info-grid p,
          .doctor-business-card p {
            align-items: flex-start;
          }

          .doctor-info-grid p b,
          .doctor-business-card p b {
            max-width: 58%;
          }

          .doctor-timeline {
            animation-name: ddFadeUp;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .doctor-detail-shell *,
          .doctor-detail-shell *::before,
          .doctor-detail-shell *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      {consentModal && <ConsentModal />}
      {timelineOpen && (
        <div
          onClick={() => setTimelineOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(15,23,42,.62)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(760px, 96vw)",
              maxHeight: "86vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: 18,
              border: "1px solid #e5eaf3",
              boxShadow: "0 24px 70px rgba(15,23,42,.28)",
              padding: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                paddingBottom: 14,
                borderBottom: "1px solid #eef2f7",
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
                  DOCTOR ACTIVITY
                </div>
                <h2 style={{ margin: "4px 0 0", fontSize: 21, color: "#0f1f4d" }}>
                  Full Activity Timeline
                </h2>
                <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
                  {doctor.doctorName}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTimelineOpen(false)}
                aria-label="Close timeline"
                style={{
                  width: 34,
                  height: 34,
                  border: 0,
                  borderRadius: 8,
                  background: "#f8fafc",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {timelineLoading ? (
              <div
                style={{
                  minHeight: 220,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                Loading activity timeline...
              </div>
            ) : timelineError ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  color: "#9a3412",
                  fontSize: 13,
                }}
              >
                {timelineError}
              </div>
            ) : timelineActivities.length === 0 ? (
              <div
                style={{
                  padding: 28,
                  textAlign: "center",
                  border: "1px dashed #dbe3ee",
                  borderRadius: 12,
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                No activity records found for this doctor.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {timelineActivities.map((activity, index) => {
                  const performer =
                    activity.performedBy?.mrName ||
                    activity.performedBy?.flmName ||
                    activity.performedBy?.slmName ||
                    activity.performedBy?.tlmName ||
                    activity.performedBy?.name ||
                    activity.mr?.mrName ||
                    "-";

                  return (
                    <div
                      key={activity._id || index}
                      style={{
                        display: "flex",
                        gap: 14,
                        padding: "15px 0",
                        borderBottom:
                          index === timelineActivities.length - 1
                            ? "none"
                            : "1px solid #eef2f7",
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          flex: "0 0 38px",
                          borderRadius: 10,
                          background:
                            activity.status === "Rejected"
                              ? "#fef2f2"
                              : "#eff6ff",
                          color:
                            activity.status === "Rejected"
                              ? "#dc2626"
                              : "#0b55f4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Clock3 size={18} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong
                          style={{
                            display: "block",
                            color: "#172033",
                            fontSize: 14,
                          }}
                        >
                          {activity.action}
                        </strong>

                        <div
                          style={{
                            marginTop: 4,
                            color: "#64748b",
                            fontSize: 12,
                          }}
                        >
                          By {performer}
                          {activity.role
                            ? ` (${activity.role.toUpperCase()})`
                            : ""}
                        </div>

                        {activity.details && (
                          <div
                            style={{
                              marginTop: 5,
                              color: "#94a3b8",
                              fontSize: 12,
                              lineHeight: 1.5,
                            }}
                          >
                            {activity.details}
                          </div>
                        )}

                        <div
                          style={{
                            marginTop: 5,
                            color: "#94a3b8",
                            fontSize: 11,
                          }}
                        >
                          {activity.createdAt
                            ? new Date(activity.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Asia/Kolkata",
                                }
                              )
                            : "-"}
                        </div>
                      </div>

                      <span
                        style={{
                          alignSelf: "flex-start",
                          padding: "4px 8px",
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          background:
                            activity.status === "Rejected"
                              ? "#fef2f2"
                              : "#f0fdf4",
                          color:
                            activity.status === "Rejected"
                              ? "#dc2626"
                              : "#15803d",
                        }}
                      >
                        {activity.status || "Completed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Popup
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />
    </Layout>
  );
}