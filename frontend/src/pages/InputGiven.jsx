import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Box,
  Info,
  ArrowLeft,
  Download,
  X,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  UserRound,
} from "lucide-react";

import Layout from "../components/Layout";
import { getFLMDoctors, getSLMDoctors, getTLMDoctors } from "../api/managerAPI";

import {
  StatCard,
  Badge,
  Button,
  DataTable,
  Crumbs,
  SuccessBlock,
} from "../components/UIComponents";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_BASE = `${API_BASE_URL}/api`;

export default function InputGiven({
  modal = false,
  success = false,
}) {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] =
    useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  const [stats, setStats] = useState({
    readyForHandover: 0,
    inputGivenToday: 0,
    pendingInputGiven: 0,
    calendarDelivered: 0,
  });

  const [confirmPopup, setConfirmPopup] =
    useState({
      isOpen: false,
      doctor: null,
    });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        let data;

        if (["flm", "slm", "tlm"].includes(user.role)) {
          if (user.role === "flm") {
            data = await getFLMDoctors(user.flmId);
          } else if (user.role === "slm") {
            data = await getSLMDoctors(user.slmId);
          } else {
            data = await getTLMDoctors(user.tlmId);
          }
        } else {
          if (!user.mrId) {
            console.error("No MR ID found");
            setLoading(false);
            return;
          }

          const response = await fetch(`${API_BASE}/doctors/mr/${user.mrId}`);
          data = await response.json();
        }

        if (data?.success && data?.doctors) {
          const approvedDoctors = data.doctors.filter(
            (d) => d.approvalStatus === "approved"
          );

          setDoctors(approvedDoctors);

          const ready = approvedDoctors.filter(
            (d) => d.calendarFrozen === true && !d.inputGiven
          ).length;

          const pending = approvedDoctors.filter(
            (d) => d.calendarFrozen === true && !d.inputGiven
          ).length;

          const delivered = approvedDoctors.filter(
            (d) => d.inputGiven === true
          ).length;

          const today = approvedDoctors.filter((d) => {
            if (!d.inputGivenAt) return false;
            return new Date().toDateString() === new Date(d.inputGivenAt).toDateString();
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
    setConfirmPopup({
      isOpen: true,
      doctor,
    });
  };

  const closeConfirmPopup = () => {
    setConfirmPopup({
      isOpen: false,
      doctor: null,
    });
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
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const mrId = user.mrId || selectedDoctor?.mr?.mrId;

      if (!mrId) {
        throw new Error("MR information is missing for this doctor");
      }

      const response = await fetch(
        `${API_BASE}/calendar/mark-input-given`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mrId,
            doctorId: selectedDoctor._id,
            year: 2027,
            remarks: remarks,
            inputGivenBy: user._id || user.id,
            inputGivenByRole: user.role,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          "Input Given marked successfully!"
        );

        setShowModal(false);

        window.location.reload();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Error:", err);

      alert(
        "Failed to mark Input Given: " +
          err.message
      );
    }
  };

  /* =========================================================
     SUCCESS SCREEN
  ========================================================= */

  if (success) {
    return (
      <Layout role={["flm", "slm", "tlm"].includes((JSON.parse(localStorage.getItem("user") || "{}")).role) ? "manager" : "mr"} active="Input Given">
        <Crumbs
          items={[
            "Input Given",
            "Confirmed",
          ]}
        />

        <div className="input-success-page">
          <div className="success-hero">
            <div className="success-hero-content">
              <div className="success-hero-badge">
                <CheckCircle2 size={15} />
                Handover Completed
              </div>

              <h1>
                Input Given Successfully
              </h1>

              <p>
                The personalized calendar has
                been marked as handed over to
                the doctor.
              </p>
            </div>

            <div className="success-hero-visual">
              <div className="success-circle">
                <CheckCircle2 size={54} />
              </div>

              <div className="success-floating-card">
                <CalendarDays size={17} />
                <span>Calendar 2027</span>
              </div>
            </div>
          </div>

          <div className="success-block-wrapper">
            <SuccessBlock
              title="Input Given Confirmed"
              status="INPUT GIVEN"
            />
          </div>

          <div className="success-actions">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() =>
                navigate("/input-given")
              }
            >
              Back to Input Given List
            </Button>

            <div className="success-actions-spacer" />

            <Button
              variant="outline"
              icon={Download}
            >
              Download Handover Confirmation
              (PDF)
            </Button>

            <Button
              onClick={() =>
                navigate("/mr-dashboard")
              }
            >
              Go to Dashboard
            </Button>
          </div>
        </div>

        <style>{`
          .input-success-page {
            padding-bottom: 40px;
          }

          .success-hero {
            min-height: 280px;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 30px;
            padding: 38px 42px;
            border-radius: 22px;
            background:
              linear-gradient(
                120deg,
                #10251f 0%,
                #173a31 52%,
                #245548 100%
              );
            box-shadow:
              0 16px 40px
              rgba(15, 45, 37, 0.18);
          }

          .success-hero::before {
            content: "";
            position: absolute;
            width: 330px;
            height: 330px;
            right: 120px;
            top: -190px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
          }

          .success-hero::after {
            content: "";
            position: absolute;
            width: 250px;
            height: 250px;
            right: -80px;
            bottom: -150px;
            border-radius: 50%;
            background: rgba(244,122,50,0.15);
          }

          .success-hero-content {
            position: relative;
            z-index: 2;
            max-width: 600px;
          }

          .success-hero-badge {
            width: fit-content;
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 7px 11px;
            border-radius: 999px;
            color: #d1fae5;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            font-size: 11px;
            font-weight: 650;
          }

          .success-hero h1 {
            margin: 17px 0 9px;
            color: #fff;
            font-size: 32px;
            line-height: 1.1;
            font-weight: 750;
            letter-spacing: -0.03em;
          }

          .success-hero p {
            margin: 0;
            max-width: 520px;
            color: rgba(255,255,255,0.68);
            font-size: 14px;
            line-height: 1.7;
          }

          .success-hero-visual {
            position: relative;
            z-index: 2;
            width: 220px;
            height: 190px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .success-circle {
            width: 125px;
            height: 125px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #d1fae5;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow:
              0 0 0 18px rgba(255,255,255,0.025),
              0 20px 40px rgba(0,0,0,0.15);
          }

          .success-floating-card {
            position: absolute;
            right: 0;
            bottom: 10px;
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 9px 12px;
            border-radius: 10px;
            color: #334155;
            background: #fff;
            box-shadow:
              0 12px 30px rgba(0,0,0,0.15);
            font-size: 11px;
            font-weight: 650;
          }

          .success-floating-card svg {
            color: #f47a32;
          }

          .success-block-wrapper {
            margin-top: 18px;
          }

          .success-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 18px;
          }

          .success-actions-spacer {
            flex: 1;
          }

          @media (max-width: 700px) {
            .success-hero {
              padding: 28px;
              min-height: auto;
            }

            .success-hero h1 {
              font-size: 25px;
            }

            .success-hero-visual {
              display: none;
            }

            .success-actions {
              flex-wrap: wrap;
            }

            .success-actions-spacer {
              display: none;
            }
          }
        `}</style>
      </Layout>
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <Layout role={["flm", "slm", "tlm"].includes((JSON.parse(localStorage.getItem("user") || "{}")).role) ? "manager" : "mr"} active="Input Given">
        <div className="input-loading-page">
          <div className="loading-orbit">
            <div className="loading-orbit-dot" />
          </div>

          <h3>Loading doctors</h3>

          <p>
            Preparing your approved doctor
            list...
          </p>
        </div>

        <style>{`
          .input-loading-page {
            min-height: 65vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .loading-orbit {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 3px solid #f1f5f9;
            border-top-color: #f47a32;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: inputSpin 0.8s linear infinite;
          }

          .loading-orbit-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #f47a32;
          }

          .input-loading-page h3 {
            margin: 18px 0 5px;
            color: #1e293b;
            font-size: 15px;
          }

          .input-loading-page p {
            margin: 0;
            color: #94a3b8;
            font-size: 12px;
          }

          @keyframes inputSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Layout>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <Layout role={["flm", "slm", "tlm"].includes((JSON.parse(localStorage.getItem("user") || "{}")).role) ? "manager" : "mr"} active="Input Given">
      <Crumbs items={["Input Given"]} />

      <div className="input-given-page">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="input-hero">
          <div className="input-hero-content">
            <div className="input-hero-eyebrow">
              <span />
              Calendar Handover
            </div>

            <h1>
              Input Given
            </h1>

            <p>
              Complete the final handover step
              once a personalized calendar has
              physically been delivered to the
              doctor.
            </p>

            <div className="input-hero-meta">
              <div>
                <CheckCircle2 size={15} />
                <span>
                  {stats.calendarDelivered}{" "}
                  delivered
                </span>
              </div>

              <div>
                <Clock3 size={15} />
                <span>
                  {stats.pendingInputGiven}{" "}
                  pending
                </span>
              </div>
            </div>
          </div>

          <div className="input-hero-image">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85"
              alt="Doctor holding medical calendar"
            />

            <div className="input-hero-image-overlay" />

            <div className="hero-image-card">
              <div className="hero-image-icon">
                <Stethoscope size={18} />
              </div>

              <div>
                <strong>
                  Doctor Handover
                </strong>

                <span>
                  Mark completed deliveries
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            STATS
        =================================================== */}

        <section className="input-stats">
          <div className="input-stat-card">
            <div className="input-stat-icon orange">
              <CalendarDays size={19} />
            </div>

            <div>
              <span>
                Ready for Handover
              </span>

              <strong>
                {stats.readyForHandover}
              </strong>

              <small>
                Calendar frozen
              </small>
            </div>
          </div>

          <div className="input-stat-card">
            <div className="input-stat-icon green">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>
                Input Given Today
              </span>

              <strong>
                {stats.inputGivenToday}
              </strong>

              <small>
                Completed today
              </small>
            </div>
          </div>

          <div className="input-stat-card">
            <div className="input-stat-icon amber">
              <Clock3 size={19} />
            </div>

            <div>
              <span>
                Pending Input Given
              </span>

              <strong>
                {stats.pendingInputGiven}
              </strong>

              <small>
                Awaiting handover
              </small>
            </div>
          </div>

          <div className="input-stat-card">
            <div className="input-stat-icon purple">
              <Box size={19} />
            </div>

            <div>
              <span>
                Calendar Dispatched
              </span>

              <strong>
                {stats.calendarDelivered}
              </strong>

              <small>
                Delivered calendars
              </small>
            </div>
          </div>
        </section>

        {/* ===================================================
            INFORMATION BANNER
        =================================================== */}

        <section className="handover-notice">
          <div className="notice-icon">
            <Info size={18} />
          </div>

          <div className="notice-content">
            <strong>
              Before marking Input Given
            </strong>

            <p>
              Only mark a calendar as Input
              Given after the personalized
              calendar has been physically handed
              over to the doctor.
            </p>
          </div>

          <div className="notice-step">
            <span>01</span>
            Verify handover
          </div>

          <ArrowRight
            size={16}
            className="notice-arrow"
          />

          <div className="notice-step">
            <span>02</span>
            Confirm
          </div>
        </section>

        {/* ===================================================
            TABLE SECTION
        =================================================== */}

        <section className="input-table-section">

          <div className="table-section-header">
            <div className="table-title-area">
              <div className="table-title-icon">
                <UserRound size={17} />
              </div>

              <div>
                <h2>
                  Approved Doctors
                </h2>

                <p>
                  Select a doctor to record
                  the calendar handover.
                </p>
              </div>
            </div>

            <div className="doctor-count">
              {doctors.length}{" "}
              doctor
              {doctors.length !== 1
                ? "s"
                : ""}
            </div>
          </div>

          <div className="input-table-wrapper">
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
                <div className="doctor-cell">
                  <div className="doctor-avatar">
                    {doctor.doctorName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "D"}
                  </div>

                  <div className="doctor-info">
                    <strong>
                      {doctor.doctorName}
                    </strong>

                    <span>
                      Approved doctor
                    </span>
                  </div>
                </div>,

                <span className="speciality-cell">
                  {doctor.speciality ||
                    "N/A"}
                </span>,

                <span className="mcl-cell">
                  {doctor.mclCode ||
                    "N/A"}
                </span>,

                <span className="city-cell">
                  {doctor.city || "N/A"}
                </span>,

                <Badge
                  tone={
                    doctor.calendarStatus ===
                    "frozen"
                      ? "green"
                      : "orange"
                  }
                >
                  {doctor.calendarStatus ===
                  "frozen"
                    ? "Frozen"
                    : doctor.calendarStatus ||
                      "Not Started"}
                </Badge>,

                <Badge
                  tone={
                    doctor.inputGiven
                      ? "green"
                      : "orange"
                  }
                >
                  {doctor.inputGiven
                    ? "Delivered"
                    : "Pending"}
                </Badge>,

                <span className="updated-cell">
                  {doctor.updatedAt
                    ? new Date(
                        doctor.updatedAt
                      ).toLocaleDateString()
                    : "N/A"}
                </span>,

                !doctor.inputGiven &&
                (doctor.calendarStatus === "frozen" ||
                  doctor.calendarFrozen === true) ? (
                  <button
                    type="button"
                    className="handover-button"
                    onClick={() =>
                      openConfirmPopup(
                        doctor
                      )
                    }
                  >
                    <CheckCircle2
                      size={15}
                    />

                    <span>
                      Mark Input Given
                    </span>

                    <ArrowRight
                      size={14}
                    />
                  </button>
                ) : doctor.inputGiven ? (
                  <div className="completed-action">
                    <CheckCircle2
                      size={14}
                    />

                    <span>
                      Delivered
                    </span>
                  </div>
                ) : (
                  <div className="waiting-action">
                    <Clock3
                      size={14}
                    />

                    <span>
                      Waiting
                    </span>
                  </div>
                ),
              ])}
            />
          </div>

          {doctors.length === 0 && (
            <div className="empty-doctors">
              <div className="empty-icon">
                <UserRound size={23} />
              </div>

              <h3>
                No approved doctors
              </h3>

              <p>
                There are currently no approved
                doctors available for calendar
                handover.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          CONFIRMATION POPUP
      ===================================================== */}

      {confirmPopup.isOpen &&
        confirmPopup.doctor && (
          <div
            className="input-popup-overlay"
            onClick={closeConfirmPopup}
          >
            <div
              className="input-confirm-popup"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <button
                className="popup-close"
                onClick={
                  closeConfirmPopup
                }
              >
                <X size={17} />
              </button>

              <div className="confirm-visual">
                <div className="confirm-visual-inner">
                  <AlertCircle size={28} />
                </div>
              </div>

              <div className="confirm-content">
                <span className="confirm-label">
                  Final confirmation
                </span>

                <h2>
                  Confirm Input Given
                </h2>

                <p>
                  Are you sure you want to
                  mark the calendar as handed
                  over to
                  <strong>
                    {" "}
                    {
                      confirmPopup.doctor
                        .doctorName
                    }
                  </strong>
                  ?
                </p>
              </div>

              <div className="confirm-doctor-card">
                <div className="confirm-doctor-avatar">
                  {confirmPopup.doctor.doctorName
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "D"}
                </div>

                <div>
                  <span>
                    Doctor
                  </span>

                  <strong>
                    {
                      confirmPopup.doctor
                        .doctorName
                    }
                  </strong>
                </div>

                <div className="confirm-doctor-status">
                  <CheckCircle2
                    size={14}
                  />

                  Calendar Frozen
                </div>
              </div>

              <div className="confirm-warning">
                <Info size={15} />

                <span>
                  This action records the
                  physical handover of the
                  calendar.
                </span>
              </div>

              <div className="confirm-actions">
                <button
                  className="confirm-cancel"
                  onClick={
                    closeConfirmPopup
                  }
                >
                  Cancel
                </button>

                <button
                  className="confirm-yes"
                  onClick={
                    handleConfirmYes
                  }
                >
                  <CheckCircle2
                    size={16}
                  />

                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          REMARKS MODAL
      ===================================================== */}

      {showModal &&
        selectedDoctor && (
          <div
            className="handover-modal-overlay"
            onClick={() =>
              setShowModal(false)
            }
          >
            <div
              className="handover-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="handover-modal-header">
                <div className="handover-modal-title">
                  <div className="modal-title-icon">
                    <CalendarDays
                      size={20}
                    />
                  </div>

                  <div>
                    <span>
                      Calendar Handover
                    </span>

                    <h2>
                      Mark Input Given
                    </h2>
                  </div>
                </div>

                <button
                  className="modal-close-button"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  <X size={17} />
                </button>
              </div>

              <p className="handover-modal-description">
                Provide the handover details to
                mark the calendar as Input
                Given.
              </p>

              <div className="selected-doctor-card">
                <div className="selected-doctor-avatar">
                  {selectedDoctor.doctorName
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "D"}
                </div>

                <div className="selected-doctor-main">
                  <span>
                    Doctor
                  </span>

                  <strong>
                    {
                      selectedDoctor.doctorName
                    }
                  </strong>
                </div>

                <div className="selected-doctor-year">
                  <span>
                    Calendar
                  </span>

                  <strong>
                    2027
                  </strong>
                </div>
              </div>

              <div className="handover-details-grid">
                <div className="detail-item">
                  <span>
                    MCL Code
                  </span>

                  <strong>
                    {selectedDoctor.mclCode ||
                      "N/A"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Calendar Status
                  </span>

                  <strong className="detail-green">
                    {selectedDoctor.calendarStatus ||
                      "N/A"}
                  </strong>
                </div>
              </div>

              <div className="form-field">
                <label>
                  Input Given Date
                  <em>*</em>
                </label>

                <div className="date-display">
                  <CalendarDays
                    size={17}
                  />

                  <span>
                    {new Date().toLocaleDateString()}
                  </span>

                  <span className="today-badge">
                    Today
                  </span>
                </div>
              </div>

              <div className="form-field">
                <label>
                  Remarks
                  <small>
                    Optional
                  </small>
                </label>

                <textarea
                  placeholder="Enter any remarks about the handover..."
                  value={remarks}
                  onChange={(e) =>
                    setRemarks(
                      e.target.value
                    )
                  }
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="modal-cancel"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="modal-confirm"
                  onClick={
                    handleConfirmInputGiven
                  }
                >
                  <CheckCircle2
                    size={16}
                  />

                  Confirm Input Given
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          COMPLETE UI STYLES
      ===================================================== */}

      <style>{`
        /* =====================================================
           PAGE
        ===================================================== */

        .input-given-page {
          width: 100%;
          padding-bottom: 45px;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .input-hero {
          position: relative;
          min-height: 300px;
          overflow: hidden;
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          border-radius: 22px;
          margin-bottom: 18px;
          background: #13231f;
          box-shadow:
            0 15px 40px
            rgba(15, 35, 30, 0.14);
        }

        .input-hero-content {
          position: relative;
          z-index: 3;
          width: 55%;
          padding: 39px 0 35px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .input-hero-eyebrow {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 13px;
          padding: 6px 10px;
          border-radius: 999px;
          color: #fed7aa;
          background: rgba(244, 122, 50, 0.12);
          border: 1px solid rgba(244, 122, 50, 0.22);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .input-hero-eyebrow span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f47a32;
          box-shadow:
            0 0 0 4px
            rgba(244,122,50,0.1);
        }

        .input-hero h1 {
          margin: 0;
          color: #fff;
          font-size: 35px;
          line-height: 1.08;
          font-weight: 750;
          letter-spacing: -0.035em;
        }

        .input-hero p {
          max-width: 530px;
          margin: 12px 0 20px;
          color: rgba(255,255,255,0.68);
          font-size: 13px;
          line-height: 1.7;
        }

        .input-hero-meta {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .input-hero-meta div {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 8px;
          color: rgba(255,255,255,0.78);
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 10px;
          font-weight: 600;
        }

        .input-hero-meta svg:first-child {
          color: #86efac;
        }

        .input-hero-meta div:nth-child(2) svg {
          color: #fdba74;
        }

        .input-hero-image {
          position: relative;
          width: 48%;
          min-height: 300px;
          overflow: hidden;
        }

        .input-hero-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          opacity: 0.85;
        }

        .input-hero-image-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              #13231f 0%,
              rgba(19,35,31,0.72) 16%,
              rgba(19,35,31,0.10) 65%,
              rgba(19,35,31,0.05) 100%
            );
        }

        .hero-image-card {
          position: absolute;
          right: 22px;
          bottom: 20px;
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 185px;
          padding: 10px 12px;
          border-radius: 11px;
          background: rgba(255,255,255,0.94);
          box-shadow:
            0 15px 35px
            rgba(0,0,0,0.18);
          backdrop-filter: blur(8px);
        }

        .hero-image-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          color: #ea6a23;
          background: #fff1e8;
        }

        .hero-image-card strong {
          display: block;
          color: #1e293b;
          font-size: 11px;
          font-weight: 750;
        }

        .hero-image-card span {
          display: block;
          margin-top: 2px;
          color: #8994a4;
          font-size: 9px;
        }

        /* =====================================================
           STATS
        ===================================================== */

        .input-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .input-stat-card {
          min-height: 104px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 16px;
          border: 1px solid #e8edf3;
          border-radius: 14px;
          background: #fff;
          box-shadow:
            0 3px 12px
            rgba(15,23,42,0.035);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .input-stat-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 9px 25px
            rgba(15,23,42,0.07);
        }

        .input-stat-icon {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
        }

        .input-stat-icon.orange {
          color: #ea6a23;
          background: #fff1e8;
        }

        .input-stat-icon.green {
          color: #059669;
          background: #ecfdf5;
        }

        .input-stat-icon.amber {
          color: #d97706;
          background: #fffbeb;
        }

        .input-stat-icon.purple {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .input-stat-card span {
          display: block;
          color: #64748b;
          font-size: 10px;
          font-weight: 650;
        }

        .input-stat-card strong {
          display: block;
          margin-top: 3px;
          color: #172033;
          font-size: 23px;
          line-height: 1.1;
          font-weight: 750;
        }

        .input-stat-card small {
          display: block;
          margin-top: 4px;
          color: #a0a9b6;
          font-size: 9px;
        }

        /* =====================================================
           NOTICE
        ===================================================== */

        .handover-notice {
          min-height: 70px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding: 13px 16px;
          border-radius: 13px;
          background:
            linear-gradient(
              110deg,
              #fffaf5,
              #fff7ed
            );
          border: 1px solid #fed7aa;
        }

        .notice-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          color: #ea6a23;
          background: #fff;
          border: 1px solid #fed7aa;
        }

        .notice-content {
          flex: 1;
          min-width: 0;
        }

        .notice-content strong {
          display: block;
          color: #7c2d12;
          font-size: 11px;
          font-weight: 750;
        }

        .notice-content p {
          margin: 3px 0 0;
          color: #9a5b3a;
          font-size: 10px;
          line-height: 1.5;
        }

        .notice-step {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9a5b3a;
          font-size: 9px;
          font-weight: 650;
          white-space: nowrap;
        }

        .notice-step span {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: #c2410c;
          background: #fff;
          font-size: 8px;
          font-weight: 750;
        }

        .notice-arrow {
          color: #d6a17e;
          flex-shrink: 0;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .input-table-section {
          overflow: hidden;
          border: 1px solid #e8edf3;
          border-radius: 15px;
          background: #fff;
          box-shadow:
            0 3px 12px
            rgba(15,23,42,0.035);
        }

        .table-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 16px 18px;
          border-bottom: 1px solid #edf0f4;
        }

        .table-title-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-title-icon {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          color: #ea6a23;
          background: #fff1e8;
        }

        .table-title-area h2 {
          margin: 0;
          color: #1e293b;
          font-size: 14px;
          font-weight: 750;
        }

        .table-title-area p {
          margin: 3px 0 0;
          color: #9aa4b2;
          font-size: 10px;
        }

        .doctor-count {
          padding: 6px 10px;
          border-radius: 7px;
          color: #64748b;
          background: #f8fafc;
          border: 1px solid #edf0f4;
          font-size: 10px;
          font-weight: 650;
        }

        .input-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .input-table-wrapper table {
          width: 100%;
          min-width: 1050px;
        }

        .input-table-wrapper th {
          background: #f8fafc;
          color: #64748b;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .input-table-wrapper td {
          color: #475569;
          font-size: 11px;
          vertical-align: middle;
        }

        .input-table-wrapper tbody tr {
          transition:
            background 0.15s ease;
        }

        .input-table-wrapper tbody tr:hover {
          background: #fcfcfd;
        }

        /* =====================================================
           DOCTOR CELL
        ===================================================== */

        .doctor-cell {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 160px;
        }

        .doctor-avatar {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          color: #c2410c;
          background:
            linear-gradient(
              135deg,
              #fff1e8,
              #ffe4d1
            );
          border: 1px solid #fed7aa;
          font-size: 12px;
          font-weight: 750;
        }

        .doctor-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .doctor-info strong {
          color: #1e293b;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .doctor-info span {
          margin-top: 2px;
          color: #a0a9b6;
          font-size: 9px;
        }

        .speciality-cell {
          color: #475569;
          font-weight: 550;
          white-space: nowrap;
        }

        .mcl-cell {
          display: inline-block;
          padding: 4px 7px;
          border-radius: 5px;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #edf0f4;
          font-family: monospace;
          font-size: 9px;
          font-weight: 650;
        }

        .city-cell {
          color: #64748b;
          white-space: nowrap;
        }

        .updated-cell {
          color: #64748b;
          font-size: 10px;
          white-space: nowrap;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .handover-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border: 1px solid #fed7aa;
          border-radius: 8px;
          color: #c2410c;
          background: #fff7ed;
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          transition:
            transform 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .handover-button:hover {
          transform: translateY(-1px);
          background: #ffedd5;
          box-shadow:
            0 5px 12px
            rgba(194,65,12,0.1);
        }

        .handover-button svg:last-child {
          transition:
            transform 0.18s ease;
        }

        .handover-button:hover svg:last-child {
          transform: translateX(2px);
        }

        .completed-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 7px;
          color: #15803d;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          font-size: 9px;
          font-weight: 700;
        }

        .waiting-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 7px;
          color: #a16207;
          background: #fffbeb;
          border: 1px solid #fde68a;
          font-size: 9px;
          font-weight: 700;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .empty-doctors {
          padding: 55px 20px;
          text-align: center;
          border-top: 1px solid #edf0f4;
        }

        .empty-icon {
          width: 50px;
          height: 50px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          color: #94a3b8;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .empty-doctors h3 {
          margin: 0;
          color: #334155;
          font-size: 14px;
        }

        .empty-doctors p {
          max-width: 400px;
          margin: 5px auto 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.6;
        }

        /* =====================================================
           CONFIRM POPUP
        ===================================================== */

        .input-popup-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background:
            rgba(15, 23, 42, 0.62);
          backdrop-filter: blur(5px);
          animation: fadeIn 0.2s ease;
        }

        .input-confirm-popup {
          position: relative;
          width: 100%;
          max-width: 430px;
          padding: 27px;
          border-radius: 20px;
          background: #fff;
          box-shadow:
            0 30px 80px
            rgba(15,23,42,0.25);
          animation:
            scaleIn 0.25s ease;
        }

        .popup-close {
          position: absolute;
          top: 13px;
          right: 13px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #edf0f4;
          border-radius: 8px;
          color: #64748b;
          background: #f8fafc;
          cursor: pointer;
        }

        .confirm-visual {
          display: flex;
          justify-content: center;
          margin-bottom: 15px;
        }

        .confirm-visual-inner {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          color: #d97706;
          background:
            linear-gradient(
              135deg,
              #fff7ed,
              #fef3c7
            );
          border: 1px solid #fde68a;
        }

        .confirm-content {
          text-align: center;
        }

        .confirm-label {
          color: #c2410c;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .confirm-content h2 {
          margin: 5px 0 8px;
          color: #172033;
          font-size: 20px;
          font-weight: 750;
        }

        .confirm-content p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.65;
        }

        .confirm-content strong {
          color: #334155;
        }

        .confirm-doctor-card {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 19px 0 12px;
          padding: 11px;
          border: 1px solid #edf0f4;
          border-radius: 11px;
          background: #f8fafc;
        }

        .confirm-doctor-avatar {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #c2410c;
          background: #fff1e8;
          font-size: 12px;
          font-weight: 750;
        }

        .confirm-doctor-card > div:nth-child(2) {
          min-width: 0;
          flex: 1;
        }

        .confirm-doctor-card span {
          display: block;
          color: #94a3b8;
          font-size: 8px;
        }

        .confirm-doctor-card strong {
          display: block;
          margin-top: 2px;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
        }

        .confirm-doctor-status {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 7px;
          border-radius: 6px;
          color: #15803d;
          background: #ecfdf5;
          font-size: 8px;
          font-weight: 700;
          white-space: nowrap;
        }

        .confirm-warning {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          padding: 9px 10px;
          margin-bottom: 18px;
          border-radius: 8px;
          color: #92400e;
          background: #fffbeb;
          border: 1px solid #fde68a;
          font-size: 9px;
          line-height: 1.5;
        }

        .confirm-warning svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .confirm-actions {
          display: flex;
          gap: 8px;
        }

        .confirm-cancel,
        .confirm-yes {
          flex: 1;
          height: 40px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .confirm-cancel {
          color: #475569;
          background: #fff;
          border: 1px solid #dce2e9;
        }

        .confirm-cancel:hover {
          background: #f8fafc;
        }

        .confirm-yes {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #fff;
          background: #f47a32;
          border: 1px solid #f47a32;
          box-shadow:
            0 5px 14px
            rgba(244,122,50,0.18);
        }

        .confirm-yes:hover {
          background: #e96d25;
        }

        /* =====================================================
           HANDOVER MODAL
        ===================================================== */

        .handover-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background:
            rgba(15, 23, 42, 0.62);
          backdrop-filter: blur(5px);
          animation: fadeIn 0.2s ease;
        }

        .handover-modal {
          position: relative;
          width: 100%;
          max-width: 510px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 25px;
          border-radius: 19px;
          background: #fff;
          box-shadow:
            0 30px 80px
            rgba(15,23,42,0.25);
          animation:
            scaleIn 0.25s ease;
        }

        .handover-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .handover-modal-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-title-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #ea6a23;
          background: #fff1e8;
        }

        .handover-modal-title span {
          display: block;
          color: #ea6a23;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .handover-modal-title h2 {
          margin: 3px 0 0;
          color: #172033;
          font-size: 18px;
          font-weight: 750;
        }

        .modal-close-button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #edf0f4;
          border-radius: 8px;
          color: #64748b;
          background: #f8fafc;
          cursor: pointer;
        }

        .handover-modal-description {
          margin: 15px 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .selected-doctor-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-radius: 11px;
          background:
            linear-gradient(
              110deg,
              #fffaf5,
              #fff7ed
            );
          border: 1px solid #fed7aa;
        }

        .selected-doctor-avatar {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #c2410c;
          background: #fff;
          border: 1px solid #fed7aa;
          font-size: 12px;
          font-weight: 750;
        }

        .selected-doctor-main {
          flex: 1;
          min-width: 0;
        }

        .selected-doctor-main span,
        .selected-doctor-year span {
          display: block;
          color: #a16207;
          font-size: 8px;
        }

        .selected-doctor-main strong {
          display: block;
          margin-top: 2px;
          color: #334155;
          font-size: 12px;
        }

        .selected-doctor-year {
          text-align: right;
        }

        .selected-doctor-year strong {
          display: block;
          margin-top: 2px;
          color: #c2410c;
          font-size: 15px;
        }

        .handover-details-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin: 10px 0 17px;
        }

        .detail-item {
          padding: 10px 11px;
          border: 1px solid #edf0f4;
          border-radius: 9px;
          background: #f8fafc;
        }

        .detail-item span {
          display: block;
          color: #94a3b8;
          font-size: 8px;
        }

        .detail-item strong {
          display: block;
          margin-top: 3px;
          color: #334155;
          font-size: 10px;
        }

        .detail-item .detail-green {
          color: #15803d;
          text-transform: capitalize;
        }

        .form-field {
          margin-bottom: 14px;
        }

        .form-field label {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 6px;
          color: #334155;
          font-size: 10px;
          font-weight: 700;
        }

        .form-field label em {
          color: #ef4444;
          font-style: normal;
        }

        .form-field label small {
          margin-left: 3px;
          color: #94a3b8;
          font-size: 8px;
          font-weight: 500;
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
          box-sizing: border-box;
          padding: 0 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          background: #f8fafc;
          font-size: 10px;
        }

        .date-display svg {
          color: #f47a32;
        }

        .today-badge {
          margin-left: auto;
          padding: 4px 6px;
          border-radius: 5px;
          color: #15803d;
          background: #ecfdf5;
          font-size: 8px;
          font-weight: 700;
        }

        .form-field textarea {
          width: 100%;
          box-sizing: border-box;
          resize: vertical;
          min-height: 85px;
          padding: 10px;
          border: 1px solid #dce2e9;
          border-radius: 8px;
          outline: none;
          color: #334155;
          background: #fff;
          font-family: inherit;
          font-size: 11px;
          line-height: 1.5;
        }

        .form-field textarea::placeholder {
          color: #a8b1bd;
        }

        .form-field textarea:focus {
          border-color: #f47a32;
          box-shadow:
            0 0 0 3px
            rgba(244,122,50,0.08);
        }

        .modal-actions {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }

        .modal-cancel,
        .modal-confirm {
          flex: 1;
          height: 40px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
        }

        .modal-cancel {
          color: #475569;
          background: #fff;
          border: 1px solid #dce2e9;
        }

        .modal-cancel:hover {
          background: #f8fafc;
        }

        .modal-confirm {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #fff;
          background: #f47a32;
          border: 1px solid #f47a32;
          box-shadow:
            0 5px 14px
            rgba(244,122,50,0.18);
        }

        .modal-confirm:hover {
          background: #e96d25;
        }

        /* =====================================================
           ANIMATIONS
        ===================================================== */

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

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1100px) {
          .input-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .input-hero-content {
            width: 60%;
          }

          .input-hero-image {
            width: 43%;
          }
        }

        @media (max-width: 800px) {
          .input-hero {
            min-height: 320px;
          }

          .input-hero-content {
            width: 100%;
            padding: 30px;
          }

          .input-hero-image {
            position: absolute;
            inset: 0;
            width: 100%;
            opacity: 0.38;
          }

          .input-hero-image-overlay {
            background:
              linear-gradient(
                90deg,
                #13231f 0%,
                rgba(19,35,31,0.88) 60%,
                rgba(19,35,31,0.55) 100%
              );
          }

          .input-hero h1 {
            font-size: 29px;
          }

          .handover-notice {
            flex-wrap: wrap;
          }

          .notice-content {
            min-width: 70%;
          }

          .notice-arrow {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .input-stats {
            grid-template-columns: 1fr;
          }

          .input-stat-card {
            min-height: 82px;
          }

          .input-hero {
            min-height: 350px;
          }

          .input-hero-content {
            padding: 25px;
          }

          .input-hero h1 {
            font-size: 26px;
          }

          .input-hero p {
            font-size: 12px;
          }

          .input-hero-meta {
            flex-wrap: wrap;
          }

          .hero-image-card {
            right: 15px;
            bottom: 15px;
          }

          .table-section-header {
            padding: 13px;
          }

          .doctor-count {
            display: none;
          }

          .handover-notice {
            padding: 12px;
          }

          .notice-step {
            display: none;
          }

          .input-confirm-popup,
          .handover-modal {
            padding: 20px;
          }

          .handover-details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}