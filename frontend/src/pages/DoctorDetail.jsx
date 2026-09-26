import React, { useEffect, useState, useRef } from "react";

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
function Timeline({ doctor }) {
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
      <Button variant="outline" icon={Clock3} style={{ marginTop: 12, width: isMobile ? "100%" : "auto" }}>
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

  const showPopup = (type, title, message) => {
    setPopup({ isOpen: true, type, title, message });
  };
  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
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
      await uploadDoctorPhotos(doctorId, formData);
      const data = await getDoctorDetails(doctorId);
      setDoctor(data.doctor);
      showPopup("success", "Photos Uploaded!", "Photos uploaded successfully!");
    } catch (error) {
      console.log(error);
      showPopup("error", "Upload Failed", "Failed to upload photos");
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

  const mrIdString = storedUser.mrId || "";

  return (
    <Layout active="My Doctors">
      <Crumbs items={["My Doctors", "Doctor Details"]} />
      <div
        className="pageHead"
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
            className="tabs"
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

              <div style={{ marginBottom: 24 }}>
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
              {/* Photo Section */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, marginBottom: 12 }}>
                  Photos
                </h3>
                {isApproved ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={handlePhotoUpload}
                      disabled={isPhotoLimitReached}
                    />
                    <div
                      className="uploadBox"
                      onClick={() => {
                        if (!isPhotoLimitReached) fileInputRef.current?.click();
                      }}
                      style={{
                        cursor: isPhotoLimitReached ? "not-allowed" : "pointer",
                        opacity: isPhotoLimitReached ? 0.6 : 1,
                        border: "2px dashed #d1d5db",
                        borderRadius: 8,
                        padding: isMobile ? 16 : 20,
                        textAlign: "center",
                        background: "#f9fafb",
                      }}
                    >
                      <Upload
                        size={isMobile ? 24 : 28}
                        style={{ display: "block", margin: "0 auto 8px" }}
                      />
                      <span style={{ fontSize: isMobile ? 13 : 14 }}>
                        {isPhotoLimitReached
                          ? "Photo Limit Reached (5/5)"
                          : `View / Upload Photo (${doctor?.doctorPhotos?.length || 0}/5)`}
                      </span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      border: "2px dashed #d1d5db",
                      borderRadius: 8,
                      padding: isMobile ? 16 : 20,
                      textAlign: "center",
                      background: "#f3f4f6",
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 8 }}>🔒</div>
                    <span style={{ color: "#6b7280", fontSize: isMobile ? 13 : 14 }}>
                      Photos can be uploaded only after approval
                    </span>
                    <div
                      style={{ fontSize: isMobile ? 11 : 12, color: "#9ca3af", marginTop: 4 }}
                    >
                      Current status: {doctor.approvalStatus || "Pending"}
                    </div>
                  </div>
                )}

                {doctor.doctorPhotos && doctor.doctorPhotos.length > 0 && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 12,
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <h4
                        style={{
                          fontSize: isMobile ? 13 : 14,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Uploaded Photos ({doctor.doctorPhotos.length}/5)
                      </h4>
                      <Button
                        variant="outline"
                        icon={Download}
                        onClick={handleDownloadPhotosZip}
                        size="small"
                      >
                        Download ZIP
                      </Button>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                          ? "repeat(auto-fill, minmax(80px, 1fr))"
                          : "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: isMobile ? 8 : 12,
                        marginTop: 8,
                      }}
                    >
                      {doctor.doctorPhotos.map((photo, idx) => (
                        <div
                          key={photo._id || idx}
                          style={{
                            position: "relative",
                            borderRadius: 8,
                            overflow: "hidden",
                            border: "1px solid #e5e7eb",
                            cursor: "pointer",
                            background: "white",
                          }}
                          onClick={() =>
                            window.open(
                              `${API_BASE_URL}${photo.url}`,
                              "_blank",
                            )
                          }
                        >
                          <img
                            src={`${API_BASE_URL}${photo.url}`}
                            alt={`Photo ${idx + 1}`}
                            style={{
                              width: "100%",
                              height: isMobile ? 80 : 100,
                              objectFit: "cover",
                              display: "block",
                            }}
                            onError={(e) => {
                              e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="2" y="2" width="20" height="20" rx="2.18"/%3E%3Ccircle cx="8.5" cy="8.5" r="2.5"/%3E%3Cpath d="M21 15l-5-5-6 6-3-3-4 4"/%3E%3C/svg%3E';
                            }}
                          />

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(photo._id, idx);
                            }}
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              background: "rgba(0,0,0,0.7)",
                              border: "none",
                              borderRadius: "50%",
                              width: isMobile ? 24 : 28,
                              height: isMobile ? 24 : 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              cursor: "pointer",
                              transition: "0.2s",
                              zIndex: 2,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(220,0,0,0.9)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(0,0,0,0.7)")
                            }
                          >
                            <X size={isMobile ? 14 : 16} />
                          </button>

                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "rgba(0,0,0,0.6)",
                              color: "white",
                              fontSize: isMobile ? 8 : 10,
                              padding: isMobile ? 2 : 4,
                              textAlign: "center",
                            }}
                          >
                            Photo {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
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
                <CalendarMonthGrid
                  doctorId={doctorId}
                  mrId={mrIdString}
                  isFrozen={doctor.calendarFrozen || false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Timeline – moves to bottom on mobile */}
        <Timeline doctor={doctor} />
      </div>

      {consentModal && <ConsentModal />}
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