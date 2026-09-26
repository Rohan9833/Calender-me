import React from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  Search,
  SlidersHorizontal,
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

      result = result.filter(
        (d) =>
          d.doctorName?.toLowerCase().includes(term) ||
          d.speciality?.toLowerCase().includes(term) ||
          d.mclCode?.toLowerCase().includes(term),
      );
    }

    if (statusFilter) {
      if (statusFilter === "sent") {
        result = result.filter((d) => d.consentSent);
      } else if (statusFilter === "notsent") {
        result = result.filter((d) => !d.consentSent);
      } else if (statusFilter === "approved") {
        result = result.filter((d) => d.consentStatus === "approved");
      } else if (statusFilter === "pending") {
        result = result.filter((d) => d.consentStatus === "pending");
      }
    }

    if (specialtyFilter) {
      result = result.filter((d) => d.speciality === specialtyFilter);
    }

    if (dateFilter === "Today") {
      const today = new Date().toDateString();

      result = result.filter(
        (d) => new Date(d.createdAt).toDateString() === today,
      );
    } else if (dateFilter === "Last 7 Days") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      result = result.filter((d) => new Date(d.createdAt) >= weekAgo);
    } else if (dateFilter === "This Month") {
      const now = new Date();

      result = result.filter((d) => {
        const date = new Date(d.createdAt);

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
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
    const { doctorId, tempEmail } = consentModal;

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

    setSendingConsent((prev) => ({
      ...prev,
      [doctorId]: true,
    }));

    try {
      // If email changed, update doctor's email first
      if (tempEmail !== consentModal.email) {
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
      setSendingConsent((prev) => ({
        ...prev,
        [doctorId]: false,
      }));
    }
  };

  // Update doctor email
  const updateDoctorEmail = async (doctorId, email) => {
    try {
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
        const response = await fetch(`${API_BASE_URL}${photo.url}`);

        const blob = await response.blob();

        const ext = photo.url.split(".").pop() || "jpg";

        folder.file(`photo_${index + 1}.${ext}`, blob);
      });

      await Promise.all(downloadPromises);

      const zipBlob = await zip.generateAsync({
        type: "blob",
      });

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

  if (loading) {
    return (
      <Layout active="My Doctors">
        <div className="approved-loading">
          <div className="approved-loading-spinner" />
          <p>Loading approved doctors...</p>
        </div>

        <style>{`
          .approved-loading {
            min-height: 55vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            color: #64748b;
          }

          .approved-loading p {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
          }

          .approved-loading-spinner {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 3px solid #e2e8f0;
            border-top-color: #f47a32;
            animation: approvedSpin 0.8s linear infinite;
          }

          @keyframes approvedSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Layout>
    );
  }

  return (
    <Layout active="My Doctors">
      <Crumbs items={["My Doctors", "Approved Doctors"]} />

      <div className="approved-doctors-page">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}
        <section className="approved-page-header">
          <div className="approved-header-left">
            <div className="approved-eyebrow">
              <span className="approved-eyebrow-dot" />
              Doctor Management
            </div>

            <h1>Approved Doctors</h1>

            <p>
              Manage approved doctors, consent status, photos and calendar
              information from one place.
            </p>
          </div>

          <div className="approved-header-summary">
            <div className="summary-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Approved Doctors</span>
              <strong>{doctorData.length}</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            STAT CARDS
        ===================================================== */}
        <section className="approved-stats-grid">
          <div className="approved-stat-card">
            <div className="approved-stat-icon approved-stat-green">
              <Send size={19} />
            </div>

            <div className="approved-stat-content">
              <span>Total Approved</span>
              <strong>{filteredData.length}</strong>
              <small>Doctors in current view</small>
            </div>
          </div>

          <div className="approved-stat-card">
            <div className="approved-stat-icon approved-stat-blue">
              <Mail size={19} />
            </div>

            <div className="approved-stat-content">
              <span>Consent Sent</span>
              <strong>
                {filteredData.filter((d) => d.consentSent).length}
              </strong>
              <small>Consent communication sent</small>
            </div>
          </div>

          <div className="approved-stat-card">
            <div className="approved-stat-icon approved-stat-orange">
              <Clock3 size={19} />
            </div>

            <div className="approved-stat-content">
              <span>Consent Pending</span>
              <strong>
                {filteredData.filter((d) => !d.consentSent).length}
              </strong>
              <small>Awaiting consent email</small>
            </div>
          </div>

          <div className="approved-stat-card">
            <div className="approved-stat-icon approved-stat-purple">
              <Camera size={19} />
            </div>

            <div className="approved-stat-content">
              <span>Photo Uploaded</span>
              <strong>
                {filteredData.filter((d) => d.photoUploaded).length}
              </strong>
              <small>Doctor photos available</small>
            </div>
          </div>
        </section>

        {/* =====================================================
            FILTER AREA
        ===================================================== */}
        <section className="approved-filter-section">
          <div className="approved-filter-heading">
            <div className="approved-filter-title">
              <div className="approved-filter-icon">
                <SlidersHorizontal size={17} />
              </div>

              <div>
                <h2>Find Doctors</h2>
                <p>Search and filter your approved doctor list.</p>
              </div>
            </div>

            {(searchTerm || statusFilter || specialtyFilter || dateFilter) && (
              <div className="approved-active-filter">Filters active</div>
            )}
          </div>

          <div className="approved-toolbar">
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
              statusOptions={[
                "Sent",
                "Not Sent",
                "Consent Given",
                "Consent Pending",
              ]}
              specialtyOptions={[
                "Cardiology",
                "Dermatology",
                "Paediatrics",
                "Orthopedics",
                "General Physician",
              ]}
            />
          </div>
        </section>

        {/* =====================================================
            TABLE
        ===================================================== */}
        <section className="approved-table-section">
          <div className="approved-table-header">
            <div>
              <h2>Approved Doctors</h2>
              <p>
                Showing <strong>{filteredData.length}</strong> doctor
                {filteredData.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="approved-table-count">
              <CheckCircle2 size={15} />
              {filteredData.length} records
            </div>
          </div>

          <div className="approved-table-wrapper">
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
                  className="doctor-name-link"
                >
                  <span className="doctor-avatar">
                    {doctor.doctorName?.charAt(0)?.toUpperCase() || "D"}
                  </span>

                  <span className="doctor-name-text">
                    <strong>{doctor.doctorName}</strong>
                    <small>View doctor profile</small>
                  </span>
                </span>,

                <span className="speciality-text">
                  {doctor.speciality || "—"}
                </span>,

                <span className="mcl-code">{doctor.mclCode || "—"}</span>,

                <span className="approved-date">
                  {new Date(
                    doctor.approvedAt || doctor.updatedAt,
                  ).toLocaleDateString()}
                </span>,

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
                  <button
                    type="button"
                    className="photo-count-button"
                    onClick={() =>
                      handleDownloadPhotos(
                        doctor._id,
                        doctor.doctorName,
                        doctor.doctorPhotos,
                      )
                    }
                    title="Download doctor photos"
                  >
                    <Camera size={14} />
                    <span>
                      {doctor.doctorPhotos?.length || 0} photo
                      {(doctor.doctorPhotos?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    <Download size={13} />
                  </button>
                ) : (
                  <Badge tone="orange">Pending</Badge>
                ),

                <div className="action-icons" key={`actions-${doctor._id}`}>
                  {!doctor.consentSent && (
                    <button
                      type="button"
                      className="icon-btn consent-icon"
                      onClick={() =>
                        openConsentModal(
                          doctor._id,
                          doctor.doctorName,
                          doctor.email,
                        )
                      }
                      disabled={sendingConsent[doctor._id]}
                      title="Send Consent"
                    >
                      <Mail size={16} />
                    </button>
                  )}

                  {doctor.consentStatus === "approved" &&
                    !doctor.photoUploaded && (
                      <button
                        type="button"
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
                        type="button"
                        className="icon-btn view-icon"
                        onClick={() => handleViewPhoto(doctor._id)}
                        title="View Doctor"
                      >
                        <Eye size={16} />
                      </button>

                      {doctor.calendarFrozen && (
                        <button
                          type="button"
                          className="icon-btn calendar-icon"
                          onClick={() =>
                            handleDownloadCalendar(
                              doctor._id,
                              doctor.doctorName,
                            )
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

          {filteredData.length === 0 && (
            <div className="approved-empty-state">
              <div className="approved-empty-icon">
                <Search size={22} />
              </div>

              <h3>No doctors found</h3>

              <p>Try changing your search or filter criteria.</p>

              <button type="button" onClick={handleClearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          PAGE UI
      ===================================================== */}
      <style>{`
        .approved-doctors-page {
          width: 100%;
          max-width: 100%;
          padding-bottom: 40px;
        }

        /* =========================================
           HEADER
        ========================================= */

        .approved-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 24px 26px;
          margin-bottom: 18px;
          border-radius: 16px;
          border: 1px solid #e8edf3;
          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f8fafc 100%
            );
          box-shadow:
            0 3px 12px rgba(15, 23, 42, 0.04);
        }

        .approved-header-left {
          min-width: 0;
        }

        .approved-eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #f47a32;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .approved-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f47a32;
          box-shadow: 0 0 0 4px #fff1e9;
        }

        .approved-page-header h1 {
          margin: 0;
          color: #172033;
          font-size: 25px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.02em;
        }

        .approved-page-header p {
          margin: 7px 0 0;
          color: #718096;
          font-size: 13px;
          line-height: 1.55;
          max-width: 650px;
        }

        .approved-header-summary {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 15px;
          min-width: 170px;
          border: 1px solid #e7ebf0;
          border-radius: 12px;
          background: #fff;
        }

        .summary-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #15803d;
          background: #ecfdf3;
        }

        .approved-header-summary span {
          display: block;
          color: #7b8797;
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .approved-header-summary strong {
          display: block;
          color: #172033;
          font-size: 20px;
          line-height: 1.1;
        }

        /* =========================================
           STATS
        ========================================= */

        .approved-stats-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 18px;
        }

        .approved-stat-card {
          min-width: 0;
          min-height: 108px;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 13px;
          border: 1px solid #e8edf3;
          border-radius: 14px;
          background: #fff;
          box-shadow:
            0 2px 9px rgba(15, 23, 42, 0.035);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .approved-stat-card:hover {
          transform: translateY(-2px);
          border-color: #dce3eb;
          box-shadow:
            0 7px 20px rgba(15, 23, 42, 0.07);
        }

        .approved-stat-icon {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .approved-stat-green {
          color: #15803d;
          background: #ecfdf3;
        }

        .approved-stat-blue {
          color: #2563eb;
          background: #eff6ff;
        }

        .approved-stat-orange {
          color: #ea580c;
          background: #fff7ed;
        }

        .approved-stat-purple {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .approved-stat-content {
          min-width: 0;
        }

        .approved-stat-content span {
          display: block;
          color: #687588;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .approved-stat-content strong {
          display: block;
          margin-top: 2px;
          color: #172033;
          font-size: 22px;
          line-height: 1.15;
          font-weight: 750;
        }

        .approved-stat-content small {
          display: block;
          margin-top: 4px;
          color: #9aa5b3;
          font-size: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =========================================
           FILTER SECTION
        ========================================= */

        .approved-filter-section {
          margin-bottom: 18px;
          padding: 17px 18px 14px;
          border: 1px solid #e8edf3;
          border-radius: 14px;
          background: #fff;
          box-shadow:
            0 2px 9px rgba(15, 23, 42, 0.03);
        }

        .approved-filter-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 13px;
        }

        .approved-filter-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .approved-filter-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f47a32;
          background: #fff4ed;
        }

        .approved-filter-title h2 {
          margin: 0;
          color: #1e293b;
          font-size: 14px;
          font-weight: 700;
        }

        .approved-filter-title p {
          margin: 2px 0 0;
          color: #8994a4;
          font-size: 11px;
        }

        .approved-active-filter {
          padding: 5px 9px;
          border-radius: 20px;
          color: #c2410c;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          font-size: 10px;
          font-weight: 700;
        }

        .approved-toolbar {
          min-width: 0;
        }

        /* =========================================
           TABLE
        ========================================= */

        .approved-table-section {
          overflow: hidden;
          border: 1px solid #e8edf3;
          border-radius: 14px;
          background: #fff;
          box-shadow:
            0 2px 9px rgba(15, 23, 42, 0.03);
        }

        .approved-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 18px;
          border-bottom: 1px solid #edf0f4;
        }

        .approved-table-header h2 {
          margin: 0;
          color: #1e293b;
          font-size: 15px;
          font-weight: 700;
        }

        .approved-table-header p {
          margin: 3px 0 0;
          color: #8994a4;
          font-size: 11px;
        }

        .approved-table-header p strong {
          color: #4b5563;
        }

        .approved-table-count {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 7px;
          color: #64748b;
          background: #f8fafc;
          border: 1px solid #edf0f4;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        .approved-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .approved-table-wrapper table {
          width: 100%;
          min-width: 900px;
        }

        .approved-table-wrapper th {
          background: #f8fafc;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .approved-table-wrapper td {
          color: #475569;
          font-size: 12px;
          vertical-align: middle;
        }

        .approved-table-wrapper tbody tr {
          transition: background 0.15s ease;
        }

        .approved-table-wrapper tbody tr:hover {
          background: #fafbfc;
        }

        /* =========================================
           DOCTOR NAME
        ========================================= */

        .doctor-name-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          text-align: left;
        }

        .doctor-avatar {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          color: #c2410c;
          background: #fff1e8;
          border: 1px solid #ffe0cc;
          font-size: 12px;
          font-weight: 750;
        }

        .doctor-name-text {
          display: flex;
          flex-direction: column;
          min-width: 120px;
        }

        .doctor-name-text strong {
          color: #1e293b;
          font-size: 12px;
          font-weight: 650;
          line-height: 1.25;
        }

        .doctor-name-text small {
          margin-top: 2px;
          color: #a0a9b6;
          font-size: 9px;
        }

        .doctor-name-link:hover .doctor-name-text strong {
          color: #ea6a23;
        }

        .speciality-text {
          color: #475569;
          font-weight: 500;
        }

        .mcl-code {
          display: inline-block;
          padding: 4px 7px;
          border-radius: 5px;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #edf0f4;
          font-size: 10px;
          font-weight: 600;
          font-family: monospace;
        }

        .approved-date {
          color: #64748b;
          font-size: 11px;
          white-space: nowrap;
        }

        /* =========================================
           PHOTO BUTTON
        ========================================= */

        .photo-count-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border: 1px solid #bbf7d0;
          border-radius: 7px;
          background: #f0fdf4;
          color: #15803d;
          cursor: pointer;
          font-size: 10px;
          font-weight: 650;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        }

        .photo-count-button:hover {
          background: #dcfce7;
          border-color: #86efac;
          transform: translateY(-1px);
        }

        /* =========================================
           ACTIONS
        ========================================= */

        .action-icons {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .icon-btn {
          width: 31px;
          height: 31px;
          padding: 0;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition:
            transform 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease;
        }

        .icon-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .icon-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .consent-icon {
          color: #2563eb;
          background: #eff6ff;
          border-color: #dbeafe;
        }

        .consent-icon:hover:not(:disabled) {
          background: #dbeafe;
          border-color: #bfdbfe;
        }

        .photo-icon {
          color: #059669;
          background: #ecfdf5;
          border-color: #d1fae5;
        }

        .photo-icon:hover {
          background: #d1fae5;
          border-color: #a7f3d0;
        }

        .view-icon {
          color: #d97706;
          background: #fffbeb;
          border-color: #fef3c7;
        }

        .view-icon:hover {
          background: #fef3c7;
          border-color: #fde68a;
        }

        .calendar-icon {
          color: #7c3aed;
          background: #f5f3ff;
          border-color: #ede9fe;
        }

        .calendar-icon:hover {
          background: #ede9fe;
          border-color: #ddd6fe;
        }

        /* =========================================
           EMPTY STATE
        ========================================= */

        .approved-empty-state {
          padding: 50px 20px;
          text-align: center;
          border-top: 1px solid #edf0f4;
        }

        .approved-empty-icon {
          width: 46px;
          height: 46px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #94a3b8;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .approved-empty-state h3 {
          margin: 0;
          color: #334155;
          font-size: 14px;
          font-weight: 700;
        }

        .approved-empty-state p {
          margin: 5px 0 14px;
          color: #94a3b8;
          font-size: 12px;
        }

        .approved-empty-state button {
          border: 1px solid #fed7aa;
          border-radius: 7px;
          padding: 7px 12px;
          background: #fff7ed;
          color: #c2410c;
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
        }

        .approved-empty-state button:hover {
          background: #ffedd5;
        }

        /* =========================================
           MODALS
        ========================================= */

        .approved-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.52);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        /* =========================================
           RESPONSIVE
        ========================================= */

        @media (max-width: 1100px) {
          .approved-stats-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .approved-page-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
          }

          .approved-header-summary {
            width: 100%;
            box-sizing: border-box;
          }

          .approved-stats-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .approved-stat-card {
            min-height: 96px;
            padding: 13px;
          }

          .approved-stat-icon {
            width: 36px;
            height: 36px;
          }

          .approved-stat-content strong {
            font-size: 19px;
          }

          .approved-filter-section {
            padding: 14px;
          }

          .approved-filter-heading {
            align-items: flex-start;
          }

          .approved-table-header {
            align-items: flex-start;
            padding: 14px;
          }

          .approved-table-count {
            display: none;
          }
        }

        @media (max-width: 520px) {
          .approved-page-header h1 {
            font-size: 21px;
          }

          .approved-page-header p {
            font-size: 12px;
          }

          .approved-stats-grid {
            grid-template-columns: 1fr;
          }

          .approved-stat-card {
            min-height: 82px;
          }

          .approved-filter-heading {
            flex-direction: column;
            gap: 8px;
          }

          .approved-table-header {
            padding: 13px;
          }

          .approved-table-wrapper {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

      {/* =====================================================
          CONSENT CONFIRMATION MODAL
      ===================================================== */}
      {consentModal.isOpen && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={closeConsentModal}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "28px",
              maxWidth: "480px",
              width: "100%",
              boxSizing: "border-box",
              boxShadow: "0 25px 70px rgba(15, 23, 42, 0.22)",
              animation: "scaleIn 0.25s ease",
              position: "relative",
            }}
          >
            {/* Close */}
            <button
              onClick={closeConsentModal}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid #edf0f4",
                background: "#f8fafc",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={17} />
            </button>

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "13px",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  flexShrink: 0,
                  borderRadius: "13px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mail size={21} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#172033",
                    fontSize: "18px",
                    fontWeight: "750",
                  }}
                >
                  Send Consent Email
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#7b8797",
                    fontSize: "12px",
                  }}
                >
                  Dr. {consentModal.doctorName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: "650",
                  marginBottom: "7px",
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                value={consentModal.tempEmail}
                onChange={handleEmailChange}
                placeholder="Enter doctor's email"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  border: "1px solid #d9e0e8",
                  borderRadius: "9px",
                  fontSize: "13px",
                  color: "#1e293b",
                  outline: "none",
                  background: "#fff",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#f47a32")}
                onBlur={(e) => (e.target.style.borderColor = "#d9e0e8")}
              />

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#94a3b8",
                  fontSize: "10px",
                }}
              >
                You can edit the email before sending the consent request.
              </p>
            </div>

            {/* Doctor info */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #edf0f4",
                borderRadius: "10px",
                padding: "13px 14px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  fontSize: "12px",
                }}
              >
                <span
                  style={{
                    color: "#7b8797",
                  }}
                >
                  Doctor
                </span>

                <strong
                  style={{
                    color: "#334155",
                    fontWeight: "650",
                    textAlign: "right",
                  }}
                >
                  {consentModal.doctorName}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  fontSize: "12px",
                  marginTop: "9px",
                }}
              >
                <span
                  style={{
                    color: "#7b8797",
                  }}
                >
                  Send to
                </span>

                <strong
                  style={{
                    color: "#2563eb",
                    fontWeight: "650",
                    textAlign: "right",
                    wordBreak: "break-word",
                  }}
                >
                  {consentModal.tempEmail || "Not set"}
                </strong>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "9px",
              }}
            >
              <button
                onClick={closeConsentModal}
                style={{
                  flex: 1,
                  padding: "11px",
                  border: "1px solid #d9e0e8",
                  borderRadius: "9px",
                  background: "#fff",
                  color: "#475569",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "650",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSendConsentWithEmail}
                disabled={sendingConsent[consentModal.doctorId]}
                style={{
                  flex: 1.5,
                  padding: "11px",
                  border: "none",
                  borderRadius: "9px",
                  background: "#f47a32",
                  color: "#fff",
                  cursor: sendingConsent[consentModal.doctorId]
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "12px",
                  fontWeight: "650",
                  opacity: sendingConsent[consentModal.doctorId] ? 0.65 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                }}
              >
                <Mail size={15} />

                {sendingConsent[consentModal.doctorId]
                  ? "Sending..."
                  : "Send Consent"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS / ERROR POPUP
      ===================================================== */}
      {popup.isOpen && (
        <div
          className="popup-overlay"
          onClick={closePopup}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            className="popup-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "28px",
              maxWidth: "420px",
              width: "100%",
              boxSizing: "border-box",
              boxShadow: "0 25px 70px rgba(15, 23, 42, 0.22)",
              animation: "scaleIn 0.25s ease",
              position: "relative",
            }}
          >
            <button
              onClick={closePopup}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid #edf0f4",
                background: "#f8fafc",
                cursor: "pointer",
                color: "#64748b",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={17} />
            </button>

            <div
              style={{
                textAlign: "center",
                marginBottom: "17px",
              }}
            >
              {popup.type === "success" ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    background: "#ecfdf3",
                    color: "#059669",
                  }}
                >
                  <CheckCircle size={30} />
                </div>
              ) : (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    background: "#fef2f2",
                    color: "#dc2626",
                  }}
                >
                  <AlertCircle size={30} />
                </div>
              )}
            </div>

            <h2
              style={{
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "750",
                margin: "0 0 7px",
                color: popup.type === "success" ? "#047857" : "#b91c1c",
              }}
            >
              {popup.title}
            </h2>

            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#64748b",
                margin: "0 0 20px",
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
                padding: "11px",
                background: popup.type === "success" ? "#10b981" : "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "9px",
                fontSize: "12px",
                fontWeight: "650",
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform:
              scale(0.94)
              translateY(-10px);
          }

          to {
            opacity: 1;
            transform:
              scale(1)
              translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}
