import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Hand,
  RefreshCw,
  Send,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";

import Layout from "../components/Layout";
import { Crumbs, Badge } from "../components/UIComponents";
import { getDashboardData } from "../api/doctorAPI";

const COLORS = {
  blue: "#0758f7",
  navy: "#06185f",
  bg: "#f7faff",
  border: "#dbe5f6",
  muted: "#6b7894",
  text: "#172554",
  green: "#16a34a",
  greenBg: "#ecfdf3",
  orange: "#ea8b00",
  orangeBg: "#fff7e8",
  red: "#dc3545",
  redBg: "#fff1f2",
  purple: "#7c3aed",
  purpleBg: "#f5f3ff",
};

function getUserData() {
  try {
    const userString = localStorage.getItem("user");

    if (!userString) return null;

    return JSON.parse(userString);
  } catch {
    return null;
  }
}

function formatDate(date) {
  if (!date) return "Recently";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "Doctor") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value, subtitle, icon: Icon, tone, onClick }) {
  const toneMap = {
    blue: {
      color: COLORS.blue,
      background: "#eef4ff",
    },
    purple: {
      color: COLORS.purple,
      background: COLORS.purpleBg,
    },
    green: {
      color: COLORS.green,
      background: COLORS.greenBg,
    },
    orange: {
      color: COLORS.orange,
      background: COLORS.orangeBg,
    },
    red: {
      color: COLORS.red,
      background: COLORS.redBg,
    },
  };

  const currentTone = toneMap[tone] || toneMap.blue;

  return (
    <button type="button" className="mr-stat-card" onClick={onClick}>
      <div className="mr-stat-top">
        <div
          className="mr-stat-icon"
          style={{
            color: currentTone.color,
            background: currentTone.background,
          }}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>

        <ArrowRight className="mr-stat-arrow" size={17} />
      </div>

      <div className="mr-stat-value">{value}</div>

      <div className="mr-stat-title">{title}</div>

      <div className="mr-stat-subtitle">{subtitle}</div>
    </button>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <div className="mr-section-header">
      <div className="mr-section-title-wrap">
        <div className="mr-section-icon">
          <Icon size={18} />
        </div>

        <div>
          <h2>{title}</h2>

          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      {action && (
        <button type="button" className="mr-section-action" onClick={onAction}>
          {action}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   PENDING ACTION
========================================================= */

function PendingAction({
  icon: Icon,
  title,
  description,
  count,
  tone,
  onClick,
}) {
  const toneMap = {
    blue: {
      color: COLORS.blue,
      background: "#eef4ff",
    },
    orange: {
      color: COLORS.orange,
      background: COLORS.orangeBg,
    },
    green: {
      color: COLORS.green,
      background: COLORS.greenBg,
    },
    purple: {
      color: COLORS.purple,
      background: COLORS.purpleBg,
    },
  };

  const currentTone = toneMap[tone] || toneMap.blue;
  const disabled = count === 0;

  return (
    <button
      type="button"
      className={`mr-pending-row ${disabled ? "is-disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div
        className="mr-pending-icon"
        style={{
          color: currentTone.color,
          background: currentTone.background,
        }}
      >
        <Icon size={19} />
      </div>

      <div className="mr-pending-content">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <div className="mr-pending-count">{count}</div>

      <ChevronRight size={17} className="mr-pending-chevron" />
    </button>
  );
}

/* =========================================================
   RECENT DOCTOR
========================================================= */

function RecentDoctor({ doctor, onClick }) {
  const doctorName = doctor?.doctorName || doctor?.name || "Doctor";

  const speciality =
    doctor?.speciality || doctor?.specialty || "Speciality not available";

  return (
    <button type="button" className="mr-doctor-row" onClick={onClick}>
      <div className="mr-doctor-avatar">{getInitials(doctorName)}</div>

      <div className="mr-doctor-info">
        <strong>{doctorName}</strong>

        <span>{speciality}</span>

        <small>{formatDate(doctor?.updatedAt || doctor?.createdAt)}</small>
      </div>

      <div className="mr-doctor-status">
        <Badge tone="green">{doctor?.status || "Active"}</Badge>

        <ChevronRight size={16} />
      </div>
    </button>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
  tone = "blue",
}) {
  const toneMap = {
    blue: {
      color: COLORS.blue,
      background: "#eef4ff",
    },
    green: {
      color: COLORS.green,
      background: COLORS.greenBg,
    },
    orange: {
      color: COLORS.orange,
      background: COLORS.orangeBg,
    },
    purple: {
      color: COLORS.purple,
      background: COLORS.purpleBg,
    },
  };

  const currentTone = toneMap[tone];

  return (
    <button type="button" className="mr-quick-action" onClick={onClick}>
      <div
        className="mr-quick-icon"
        style={{
          color: currentTone.color,
          background: currentTone.background,
        }}
      >
        <Icon size={20} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <ArrowRight size={17} />
    </button>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

const MRDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    draftCount: 0,
    submittedCount: 0,
    approvedCount: 0,
    consentPendingCount: 0,
    photoPendingCount: 0,
    calendarFrozenCount: 0,
    inputGivenPendingCount: 0,
    calendarDeliveredCount: 0,
    sendConsentCount: 0,
    uploadPhotoCount: 0,
    calendarSelectionCount: 0,
    inputGivenCount: 0,
    frozenDoctors: [],
    recentDoctors: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userData = useMemo(() => getUserData(), []);

  const mrName = userData?.mrName || userData?.name || "User";

  let mrId = null;

  if (userData) {
    mrId = userData.mrId || userData._id;
  }

  if (!mrId) {
    mrId = sessionStorage.getItem("mrId");
  }

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!mrId) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getDashboardData(mrId);

        const data =
          response?.data && response?.success ? response.data : response;

        setDashboardData({
          draftCount: data?.draftCount || 0,
          submittedCount: data?.submittedCount || 0,
          approvedCount: data?.approvedCount || 0,
          consentPendingCount: data?.consentPendingCount || 0,
          photoPendingCount: data?.photoPendingCount || 0,
          calendarFrozenCount: data?.calendarFrozenCount || 0,
          inputGivenPendingCount: data?.inputGivenPendingCount || 0,
          calendarDeliveredCount: data?.calendarDeliveredCount || 0,
          sendConsentCount: data?.sendConsentCount || 0,
          uploadPhotoCount: data?.uploadPhotoCount || 0,
          calendarSelectionCount: data?.calendarSelectionCount || 0,
          inputGivenCount: data?.inputGivenCount || 0,
          frozenDoctors: data?.frozenDoctors || [],
          recentDoctors: data?.recentDoctors || [],
        });
      } catch (err) {
        console.error("Dashboard API Error:", err);

        if (err.response?.status === 404) {
          setError("Session expired. Redirecting...");

          setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();
            navigate("/");
          }, 2000);
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load dashboard",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [mrId, navigate]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const statRoutes = {
    "Draft Doctors": "/draft-doctors",
    "Submitted Doctors": "/submitted-doctors",
    "Approved Doctors": "/approved-doctors",
    "Consent Pending": "/approved-doctors?filter=consent-pending",
    "Photo Pending": "/approved-doctors?filter=photo-pending",
    "Calendar Frozen": "/frozen-doctors",
    "Input Given Pending": "/input-given",
    "Calendar Delivered": "/input-given?status=delivered",
  };

  const handleStatClick = (title, count) => {
    if (count === 0) {
      alert(`No ${title.toLowerCase()} found`);
      return;
    }

    navigate(statRoutes[title] || "/mr-dashboard");
  };

  const handlePendingAction = (action, count) => {
    if (count === 0) {
      alert(`No ${action.toLowerCase()} pending`);
      return;
    }

    const routes = {
      "Send Consent": "/approved-doctors?filter=send-consent",
      "Upload Doctor Photo": "/approved-doctors?filter=upload-photo",
      "Calendar Selection": "/calendar-selection",
      "Input Given": "/input-given",
    };

    navigate(routes[action] || "/mr-dashboard");
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Layout active="Dashboard">
        <Crumbs />

        <div className="mr-dashboard">
          <div className="mr-loading">
            <div className="mr-loading-spinner">
              <RefreshCw size={24} />
            </div>

            <h2>Loading dashboard</h2>

            <p>Fetching your latest campaign information...</p>
          </div>
        </div>

        <DashboardStyles />
      </Layout>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <Layout active="Dashboard">
        <Crumbs />

        <div className="mr-dashboard">
          <div className="mr-error">
            <div className="mr-error-icon">
              <ShieldCheck size={28} />
            </div>

            <h2>Unable to load dashboard</h2>

            <p>{error}</p>

            <div className="mr-error-actions">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mr-primary-btn"
              >
                <RefreshCw size={16} />
                Retry
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="mr-secondary-btn"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>

        <DashboardStyles />
      </Layout>
    );
  }

  const stats = [
    {
      title: "Draft Doctors",
      value: dashboardData.draftCount,
      subtitle: "Profiles in progress",
      icon: Users,
      tone: "blue",
    },
    {
      title: "Submitted Doctors",
      value: dashboardData.submittedCount,
      subtitle: "Awaiting review",
      icon: Send,
      tone: "purple",
    },
    {
      title: "Approved Doctors",
      value: dashboardData.approvedCount,
      subtitle: "Ready for next step",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Consent Pending",
      value: dashboardData.consentPendingCount,
      subtitle: "Consent required",
      icon: Send,
      tone: "orange",
    },
    {
      title: "Photo Pending",
      value: dashboardData.photoPendingCount,
      subtitle: "Photo upload needed",
      icon: Camera,
      tone: "red",
    },
    {
      title: "Calendar Frozen",
      value: dashboardData.calendarFrozenCount,
      subtitle: "Calendars finalized",
      icon: CalendarDays,
      tone: "blue",
    },
    {
      title: "Input Given Pending",
      value: dashboardData.inputGivenPendingCount,
      subtitle: "Waiting for handover",
      icon: Hand,
      tone: "orange",
    },
    {
      title: "Calendar Delivered",
      value: dashboardData.calendarDeliveredCount,
      subtitle: "Successfully delivered",
      icon: CheckCircle2,
      tone: "green",
    },
  ];

  return (
    <Layout active="Dashboard">
      <Crumbs />

      <div className="mr-dashboard">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="mr-hero">
          <div className="mr-hero-content">
            <div className="mr-hero-eyebrow">
              <span className="mr-hero-dot" />
              Medical Representative
            </div>

            <h1>
              Welcome back, <strong>{mrName}</strong>
            </h1>

            <p>
              Keep track of your doctors, approvals and campaign activities from
              one place.
            </p>

            <button
              type="button"
              className="mr-hero-btn"
              onClick={() => navigate("/add-doctor")}
            >
              <UserPlus size={16} />
              Add New Doctor
            </button>
          </div>

          <div className="mr-hero-image">
            <img
              // src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85"
              src="/123.png"
              alt="Doctor"
            />

            <div className="mr-hero-image-overlay">
              <div className="mr-hero-image-icon">
                <Stethoscope size={17} />
              </div>

              <div>
                <strong>Doctor Management</strong>
                <span>Manage your campaign workflow</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section className="mr-section">
          <div className="mr-page-section-heading">
            <div>
              <h2>Campaign Overview</h2>
              <p>A quick snapshot of your current doctor workflow.</p>
            </div>

            <div className="mr-total-pill">
              <Users size={15} />

              <span>
                {dashboardData.draftCount +
                  dashboardData.submittedCount +
                  dashboardData.approvedCount}
              </span>

              <small>Total doctors</small>
            </div>
          </div>

          <div className="mr-stats-grid">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                {...stat}
                onClick={() => handleStatClick(stat.title, stat.value)}
              />
            ))}
          </div>
        </section>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="mr-main-grid">
          {/* =================================================
              PENDING ACTIONS
          ================================================= */}

          <section className="mr-card">
            <SectionHeader
              icon={Clock3}
              title="Today's Pending Actions"
              subtitle="Tasks that may need your attention"
            />

            <div className="mr-pending-list">
              <PendingAction
                icon={Send}
                title="Send Consent"
                description="Doctors waiting for consent email"
                count={dashboardData.sendConsentCount}
                tone="blue"
                onClick={() =>
                  handlePendingAction(
                    "Send Consent",
                    dashboardData.sendConsentCount,
                  )
                }
              />

              <PendingAction
                icon={Camera}
                title="Upload Doctor Photo"
                description="Consent approved, photo pending"
                count={dashboardData.uploadPhotoCount}
                tone="orange"
                onClick={() =>
                  handlePendingAction(
                    "Upload Doctor Photo",
                    dashboardData.uploadPhotoCount,
                  )
                }
              />

              <PendingAction
                icon={CalendarDays}
                title="Calendar Selection"
                description="Photo uploaded, selection pending"
                count={dashboardData.calendarSelectionCount}
                tone="purple"
                onClick={() =>
                  handlePendingAction(
                    "Calendar Selection",
                    dashboardData.calendarSelectionCount,
                  )
                }
              />

              <PendingAction
                icon={Hand}
                title="Input Given"
                description="Calendars ready for handover"
                count={dashboardData.inputGivenCount}
                tone="green"
                onClick={() =>
                  handlePendingAction(
                    "Input Given",
                    dashboardData.inputGivenCount,
                  )
                }
              />
            </div>
          </section>

          {/* =================================================
              RECENT DOCTORS
          ================================================= */}

          <section className="mr-card">
            <SectionHeader
              icon={Users}
              title="Recent Doctor Activity"
              subtitle="Latest updates across your doctors"
              action="View all"
              onAction={() => navigate("/all-doctors")}
            />

            {dashboardData.recentDoctors?.length > 0 ? (
              <div className="mr-doctors-list">
                {dashboardData.recentDoctors.slice(0, 6).map((doctor) => (
                  <RecentDoctor
                    key={doctor._id}
                    doctor={doctor}
                    onClick={() => navigate(`/doctor-details/${doctor._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="mr-empty">
                <div className="mr-empty-icon">
                  <Users size={22} />
                </div>

                <strong>No recent activity</strong>

                <span>Doctor activity will appear here once available.</span>
              </div>
            )}
          </section>
        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="mr-card mr-quick-section">
          <SectionHeader
            icon={ArrowRight}
            title="Quick Actions"
            subtitle="Jump directly to commonly used areas"
          />

          <div className="mr-quick-grid">
            <QuickAction
              icon={UserPlus}
              title="Add Doctor"
              description="Create a new doctor profile"
              tone="blue"
              onClick={() => navigate("/add-doctor")}
            />

            <QuickAction
              icon={CheckCircle2}
              title="Approved Doctors"
              description="View approved doctor profiles"
              tone="green"
              onClick={() => navigate("/approved-doctors")}
            />

            <QuickAction
              icon={Send}
              title="Consent Pending"
              description="Manage pending consents"
              tone="orange"
              onClick={() =>
                navigate("/submitted-doctors?status=consent-pending")
              }
            />

            <QuickAction
              icon={CalendarDays}
              title="Calendar Selection"
              description="Manage calendar selections"
              tone="purple"
              onClick={() => navigate("/calendar-selection")}
            />

            <QuickAction
              icon={Hand}
              title="Input Given"
              description="Manage calendar handovers"
              tone="blue"
              onClick={() => navigate("/input-given")}
            />
          </div>
        </section>

        {/* =================================================
            FROZEN CALENDARS
        ================================================= */}

        {dashboardData.frozenDoctors?.length > 0 && (
          <section className="mr-card">
            <SectionHeader
              icon={CalendarDays}
              title="Frozen Calendars"
              subtitle="Doctors with finalized calendars"
              action="View all"
              onAction={() => navigate("/frozen-doctors")}
            />

            <div className="mr-frozen-grid">
              {dashboardData.frozenDoctors.slice(0, 8).map((doctor) => (
                <button
                  type="button"
                  className="mr-frozen-card"
                  key={doctor._id}
                  onClick={() =>
                    navigate(
                      `/calendar-selection?doctorId=${doctor._id}&mrId=${mrId}`,
                    )
                  }
                >
                  <div className="mr-frozen-avatar">
                    {getInitials(doctor.doctorName)}
                  </div>

                  <div className="mr-frozen-info">
                    <strong>{doctor.doctorName}</strong>

                    <span>{doctor.speciality || "Doctor"}</span>

                    <small>
                      <CheckCircle2 size={12} />
                      Frozen {formatDate(doctor.calendarFrozenAt)}
                    </small>
                  </div>

                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <DashboardStyles />
    </Layout>
  );
};

/* =========================================================
   DASHBOARD STYLES
========================================================= */

function DashboardStyles() {
  return (
    <style>{`
      /* =====================================================
         BASE
      ===================================================== */

      .mr-dashboard {
        width: 100%;
        max-width: 1440px;
        margin: 0 auto;
        padding-bottom: 32px;
        color: ${COLORS.text};
      }

      .mr-dashboard *,
      .mr-dashboard *::before,
      .mr-dashboard *::after {
        box-sizing: border-box;
      }

      /* =====================================================
   HERO
===================================================== */

.mr-hero {
  position: relative;
  overflow: hidden;
  min-height: 175px;
  margin-bottom: 22px;
  padding: 25px 28px;
  border: 1px solid #dbe5f6;
  border-radius: 18px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 18px rgba(25, 55, 100, 0.045);
}

.mr-hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.mr-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
  padding: 5px 9px;
  border-radius: 999px;
  background: #eef5ff;
  color: #0758f7;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.mr-hero-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.mr-hero h1 {
  margin: 0;
  color: #06185f;
  font-size: 25px;
  line-height: 1.25;
  font-weight: 500;
  letter-spacing: -0.5px;
}

.mr-hero h1 strong {
  font-weight: 750;
}

.mr-hero p {
  max-width: 520px;
  margin: 7px 0 14px;
  color: #6b7894;
  font-size: 12px;
  line-height: 1.55;
}

.mr-hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 13px;
  border: 0;
  border-radius: 8px;
  background: #0758f7;
  color: white;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.mr-hero-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(7, 88, 247, 0.2);
}

.mr-hero-image {
  position: relative;
  width: 265px;
  height: 145px;
  flex-shrink: 0;
  margin-right: 5px;
  overflow: hidden;
  border-radius: 14px;
  background: #edf3fb;
}

.mr-hero-image::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(255,255,255,0.02),
      rgba(6,24,95,0.12)
    );
  pointer-events: none;
}

.mr-hero-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  object-position: center;
}

.mr-hero-image-overlay {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 9px;
  background: rgba(255,255,255,0.91);
  backdrop-filter: blur(7px);
}

.mr-hero-image-icon {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #eef4ff;
  color: #0758f7;
}

.mr-hero-image-overlay div:last-child {
  min-width: 0;
}

.mr-hero-image-overlay strong {
  display: block;
  color: #172554;
  font-size: 9px;
  font-weight: 750;
}

.mr-hero-image-overlay span {
  display: block;
  margin-top: 2px;
  color: #6b7894;
  font-size: 8px;
}

      .mr-hero-content {
        position: relative;
        z-index: 2;
        max-width: 720px;
      }

      .mr-hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding: 6px 11px;
        border: 1px solid rgba(255,255,255,.2);
        border-radius: 999px;
        background: rgba(255,255,255,.09);
        color: rgba(255,255,255,.88);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .3px;
        text-transform: uppercase;
      }

      .mr-hero-badge span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #4ade80;
        box-shadow: 0 0 0 4px rgba(74,222,128,.12);
      }

      .mr-hero h1 {
        margin: 0;
        font-size: 30px;
        line-height: 1.2;
        font-weight: 500;
        letter-spacing: -.6px;
      }

      .mr-hero h1 strong {
        font-weight: 750;
      }

      .mr-hero p {
        margin: 10px 0 0;
        color: rgba(255,255,255,.75);
        font-size: 14px;
        line-height: 1.6;
        max-width: 620px;
      }

      .mr-hero-decoration {
        position: relative;
        width: 150px;
        height: 150px;
        margin-right: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,.9);
      }

      .mr-hero-decoration > svg {
        position: relative;
        z-index: 3;
      }

      .mr-hero-circle {
        position: absolute;
        border: 1px solid rgba(255,255,255,.15);
        border-radius: 50%;
      }

      .circle-one {
        width: 125px;
        height: 125px;
      }

      .circle-two {
        width: 175px;
        height: 175px;
      }

      /* =====================================================
         SECTION
      ===================================================== */

      .mr-section {
        margin-bottom: 24px;
      }

      .mr-page-section-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 13px;
      }

      .mr-page-section-heading h2 {
        margin: 0;
        color: ${COLORS.navy};
        font-size: 19px;
        font-weight: 750;
        letter-spacing: -.2px;
      }

      .mr-page-section-heading p {
        margin: 4px 0 0;
        color: ${COLORS.muted};
        font-size: 12px;
      }

      .mr-total-pill {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 8px 12px;
        border: 1px solid ${COLORS.border};
        border-radius: 999px;
        background: white;
        color: ${COLORS.blue};
        white-space: nowrap;
      }

      .mr-total-pill span {
        font-size: 14px;
        font-weight: 800;
      }

      .mr-total-pill small {
        color: ${COLORS.muted};
        font-size: 11px;
      }

      /* =====================================================
         STATS
      ===================================================== */

    /* =====================================================
   COMPACT STATS
===================================================== */

.mr-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.mr-stat-card {
  position: relative;
  min-width: 0;
  min-height: 112px;
  padding: 13px;
  border: 1px solid #dfe7f3;
  border-radius: 13px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
}

.mr-stat-card:hover {
  transform: translateY(-2px);
  border-color: #c5d5ef;
  box-shadow: 0 7px 18px rgba(30, 64, 175, 0.07);
}

.mr-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.mr-stat-icon {
  width: 31px;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.mr-stat-arrow {
  width: 14px;
  height: 14px;
  color: #b5c0d0;
}

.mr-stat-card:hover .mr-stat-arrow {
  color: #0758f7;
  transform: translateX(2px);
}

.mr-stat-value {
  color: #06185f;
  font-size: 22px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.mr-stat-title {
  margin-top: 6px;
  color: #172554;
  font-size: 10px;
  font-weight: 750;
}

.mr-stat-subtitle {
  margin-top: 2px;
  color: #8a97ab;
  font-size: 8px;
  line-height: 1.35;
}

      /* =====================================================
         MAIN GRID
      ===================================================== */

      .mr-main-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 16px;
        margin-bottom: 16px;
      }

      .mr-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid #e1e8f2;
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(25, 55, 100, 0.025);
}
      .mr-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 15px;
        margin-bottom: 3px;
        border-bottom: 1px solid #edf2fa;
      }

      .mr-section-title-wrap {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .mr-section-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #f0f5ff;
  color: #0758f7;
}

      .mr-section-header h2 {
  margin: 0;
  color: #172554;
  font-size: 13px;
  font-weight: 750;
}

      .mr-section-header p {
  margin: 3px 0 0;
  color: #8a97ab;
  font-size: 9px;
}

      .mr-section-action {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        border: 0;
        background: transparent;
        color: ${COLORS.blue};
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
      }

      .mr-section-action:hover {
        text-decoration: underline;
      }

      /* =====================================================
         PENDING
      ===================================================== */

      .mr-pending-list {
        display: flex;
        flex-direction: column;
      }

      .mr-pending-row {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 2px;
  border: 0;
  border-bottom: 1px solid #edf2f8;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

      .mr-pending-row:last-child {
        border-bottom: 0;
      }

      .mr-pending-row:not(.is-disabled):hover {
        background: #fafcff;
      }

      .mr-pending-row.is-disabled {
        cursor: default;
        opacity: .5;
      }

     .mr-pending-icon {
  width: 31px;
  height: 31px;
  flex: 0 0 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

      .mr-pending-content {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

     .mr-pending-content strong {
  overflow: hidden;
  color: #172554;
  font-size: 10px;
  font-weight: 750;
  white-space: nowrap;
  text-overflow: ellipsis;
}

      .mr-pending-content span {
  overflow: hidden;
  color: #8a97ab;
  font-size: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

      .mr-pending-count {
        min-width: 27px;
        height: 27px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 7px;
        border-radius: 8px;
        background: #f1f5fb;
        color: ${COLORS.navy};
        font-size: 12px;
        font-weight: 800;
      }

      .mr-pending-chevron {
        color: #b4bfd0;
      }

      /* =====================================================
         RECENT DOCTORS
      ===================================================== */

      .mr-doctors-list {
        display: flex;
        flex-direction: column;
      }

      .mr-doctor-row {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 10px 2px;
        border: 0;
        border-bottom: 1px solid #edf2f8;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }

      .mr-doctor-row:last-child {
        border-bottom: 0;
      }

      .mr-doctor-row:hover {
        background: #fafcff;
      }

      .mr-doctor-avatar,
      .mr-frozen-avatar {
        flex: 0 0 38px;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 11px;
        background: #eef4ff;
        color: ${COLORS.blue};
        font-size: 11px;
        font-weight: 800;
      }

      .mr-doctor-info {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .mr-doctor-info strong {
        overflow: hidden;
        color: ${COLORS.text};
        font-size: 12px;
        font-weight: 750;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .mr-doctor-info span {
        overflow: hidden;
        color: ${COLORS.muted};
        font-size: 10px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .mr-doctor-info small {
        color: #9aa8bd;
        font-size: 9px;
      }

      .mr-doctor-status {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #a9b6ca;
      }

      .mr-doctor-status .badge {
        font-size: 9px;
      }

      /* =====================================================
         QUICK ACTIONS
      ===================================================== */

      .mr-quick-section {
        margin-bottom: 16px;
      }

      .mr-quick-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-top: 11px;
}

.mr-quick-action {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e4ebf5;
  border-radius: 11px;
  background: #fcfdff;
  color: #172554;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.mr-quick-action:hover {
  transform: translateY(-1px);
  border-color: #c9d7ed;
  box-shadow: 0 5px 14px rgba(30, 64, 175, 0.05);
}

.mr-quick-icon {
  width: 31px;
  height: 31px;
  flex: 0 0 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.mr-quick-action > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.mr-quick-action strong {
  display: block;
  overflow: hidden;
  font-size: 9px;
  font-weight: 750;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mr-quick-action span {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: #8a97ab;
  font-size: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mr-quick-action > svg {
  width: 13px;
  height: 13px;
  flex: 0 0 auto;
  color: #aab6c8;
}

      .mr-quick-action {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border: 1px solid #e4ebf5;
        border-radius: 13px;
        background: #fbfdff;
        color: ${COLORS.text};
        text-align: left;
        cursor: pointer;
        transition:
          transform .16s ease,
          border-color .16s ease,
          box-shadow .16s ease;
      }

      .mr-quick-action:hover {
        transform: translateY(-2px);
        border-color: #bfd1f3;
        box-shadow:
          0 7px 18px rgba(30,64,175,.06);
      }

      .mr-quick-icon {
        width: 36px;
        height: 36px;
        flex: 0 0 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
      }

      .mr-quick-action > div:nth-child(2) {
        min-width: 0;
        flex: 1;
      }

      .mr-quick-action strong {
        display: block;
        overflow: hidden;
        font-size: 11px;
        font-weight: 750;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .mr-quick-action span {
        display: block;
        margin-top: 3px;
        overflow: hidden;
        color: ${COLORS.muted};
        font-size: 9px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .mr-quick-action > svg {
        flex: 0 0 auto;
        color: #aab6c8;
      }

      /* =====================================================
         FROZEN
      ===================================================== */

      .mr-frozen-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
        margin-top: 13px;
      }

      .mr-frozen-card {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 12px;
        border: 1px solid #e4ebf5;
        border-radius: 13px;
        background: #fbfdff;
        text-align: left;
        cursor: pointer;
        transition:
          transform .16s ease,
          border-color .16s ease;
      }

      .mr-frozen-card:hover {
        transform: translateY(-2px);
        border-color: #bfd1f3;
      }

      .mr-frozen-info {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .mr-frozen-info strong {
        overflow: hidden;
        color: ${COLORS.text};
        font-size: 11px;
        font-weight: 750;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .mr-frozen-info span {
        overflow: hidden;
        color: ${COLORS.muted};
        font-size: 9px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .mr-frozen-info small {
        display: flex;
        align-items: center;
        gap: 3px;
        color: ${COLORS.green};
        font-size: 8px;
        font-weight: 650;
      }

      .mr-frozen-card > svg {
        flex: 0 0 auto;
        color: #a9b6ca;
      }

      /* =====================================================
         EMPTY
      ===================================================== */

      .mr-empty {
        min-height: 210px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 5px;
      }

      .mr-empty-icon {
        width: 44px;
        height: 44px;
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 13px;
        background: #f1f5fb;
        color: #9aa8bd;
      }

      .mr-empty strong {
        color: ${COLORS.text};
        font-size: 12px;
      }

      .mr-empty span {
        color: ${COLORS.muted};
        font-size: 10px;
      }

      /* =====================================================
         LOADING
      ===================================================== */

      .mr-loading {
        min-height: 500px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .mr-loading-spinner {
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        border-radius: 15px;
        background: #eef4ff;
        color: ${COLORS.blue};
        animation: mr-spin 1.2s linear infinite;
      }

      .mr-loading h2 {
        margin: 0;
        color: ${COLORS.navy};
        font-size: 17px;
      }

      .mr-loading p {
        margin: 6px 0 0;
        color: ${COLORS.muted};
        font-size: 12px;
      }

      @keyframes mr-spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      /* =====================================================
         ERROR
      ===================================================== */

      .mr-error {
        max-width: 600px;
        margin: 70px auto;
        padding: 35px;
        border: 1px solid #fecdd3;
        border-radius: 18px;
        background: #fff7f8;
        text-align: center;
      }

      .mr-error-icon {
        width: 54px;
        height: 54px;
        margin: 0 auto 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 15px;
        background: ${COLORS.redBg};
        color: ${COLORS.red};
      }

      .mr-error h2 {
        margin: 0;
        color: #991b1b;
        font-size: 18px;
      }

      .mr-error p {
        margin: 8px 0 0;
        color: #7f1d1d;
        font-size: 12px;
      }

      .mr-error-actions {
        display: flex;
        justify-content: center;
        gap: 9px;
        margin-top: 20px;
      }

      .mr-primary-btn,
      .mr-secondary-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        min-height: 38px;
        padding: 0 15px;
        border-radius: 9px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }

      .mr-primary-btn {
        border: 0;
        background: ${COLORS.blue};
        color: white;
      }

      .mr-secondary-btn {
        border: 1px solid ${COLORS.border};
        background: white;
        color: ${COLORS.text};
      }

      /* =====================================================
         TABLET
      ===================================================== */

      @media (max-width: 1100px) {
        .mr-stats-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .mr-quick-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .mr-frozen-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      /* =====================================================
         MOBILE
      ===================================================== */

      @media (max-width: 768px) {
        .mr-dashboard {
          padding-bottom: 20px;
        }

        .mr-hero {
          min-height: 175px;
          padding: 22px 20px;
          border-radius: 16px;
          margin-bottom: 18px;
        }

        .mr-hero h1 {
          font-size: 23px;
          letter-spacing: -.4px;
        }

        .mr-hero p {
          max-width: 90%;
          font-size: 11px;
        }

        .mr-hero-badge {
          font-size: 9px;
        }

        .mr-hero-decoration {
          position: absolute;
          right: -25px;
          bottom: -30px;
          opacity: .7;
          transform: scale(.7);
        }

        .mr-page-section-heading {
          align-items: flex-start;
        }

        .mr-page-section-heading h2 {
          font-size: 16px;
        }

        .mr-page-section-heading p {
          font-size: 10px;
        }

        .mr-total-pill {
          padding: 6px 9px;
        }

        .mr-total-pill small {
          display: none;
        }

        .mr-stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .mr-stat-card {
          padding: 13px;
          border-radius: 13px;
        }

        .mr-stat-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
        }

        .mr-stat-value {
          font-size: 23px;
        }

        .mr-stat-title {
          font-size: 11px;
        }

        .mr-stat-subtitle {
          font-size: 9px;
        }

        .mr-main-grid {
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }

        .mr-card {
          padding: 14px;
          border-radius: 15px;
        }

        .mr-section-header {
          padding-bottom: 11px;
        }

        .mr-section-icon {
          width: 32px;
          height: 32px;
          flex-basis: 32px;
        }

        .mr-section-header h2 {
          font-size: 13px;
        }

        .mr-section-header p {
          font-size: 9px;
        }

        .mr-pending-row {
          padding: 9px 1px;
        }

        .mr-pending-icon {
          width: 32px;
          height: 32px;
          flex-basis: 32px;
        }

        .mr-pending-content strong {
          font-size: 10px;
        }

        .mr-pending-content span {
          font-size: 8px;
        }

        .mr-pending-count {
          min-width: 24px;
          height: 24px;
          font-size: 10px;
        }

        .mr-doctor-avatar {
          width: 34px;
          height: 34px;
          flex-basis: 34px;
        }

        .mr-doctor-info strong {
          font-size: 10px;
        }

        .mr-doctor-info span {
          font-size: 8px;
        }

        .mr-doctor-info small {
          font-size: 8px;
        }

        .mr-doctor-status .badge {
          display: none;
        }

        .mr-quick-grid {
          grid-template-columns: 1fr;
          gap: 7px;
        }

        .mr-quick-action {
          padding: 10px;
        }

        .mr-frozen-grid {
          grid-template-columns: 1fr;
          gap: 7px;
        }

        .mr-error {
          margin: 35px 0;
          padding: 25px 18px;
        }
      }
@media (max-width: 768px) {
  .mr-hero {
    min-height: 165px;
    padding: 19px;
    border-radius: 14px;
  }

  .mr-hero-content {
    max-width: 58%;
  }

  .mr-hero h1 {
    font-size: 20px;
  }

  .mr-hero p {
    font-size: 9px;
    margin: 6px 0 11px;
  }

  .mr-hero-eyebrow {
    font-size: 8px;
    padding: 4px 7px;
  }

  .mr-hero-btn {
    height: 30px;
    padding: 0 10px;
    font-size: 9px;
  }

  .mr-hero-image {
    position: absolute;
    right: 12px;
    width: 145px;
    height: 120px;
  }

  .mr-hero-image-overlay {
    display: none;
  }

  .mr-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  .mr-stat-card {
    min-height: 96px;
    padding: 11px;
  }

  .mr-stat-value {
    font-size: 20px;
  }

  .mr-quick-grid {
    grid-template-columns: 1fr;
  }

  .mr-main-grid {
    grid-template-columns: 1fr;
  }
}
      /* =====================================================
         SMALL MOBILE
      ===================================================== */

      @media (max-width: 420px) {
        .mr-hero h1 {
          max-width: 80%;
          font-size: 20px;
        }

        .mr-hero p {
          max-width: 78%;
        }

        .mr-stats-grid {
          gap: 7px;
        }

        .mr-stat-card {
          padding: 11px;
        }

        .mr-stat-value {
          font-size: 21px;
        }
      }
    `}</style>
  );
}

export default MRDashboard;
