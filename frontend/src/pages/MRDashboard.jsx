import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  CheckCircle2,
  Camera,
  CalendarDays,
  Hand,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  Panel,
  ListLine,
  DoctorActivity,
  Crumbs,
  Badge,
} from "../components/UIComponents";
import { useEffect, useState } from "react";
import { getDashboardData } from "../api/doctorAPI";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false,
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

function QuickActions({ onNavigate, isMobile }) {
  const actions = [
    { name: "Add Doctor", icon: UserPlus, path: "/add-doctor" },
    { name: "Approved Doctors", icon: CheckCircle2, path: "/approved-doctors" },
    {
      name: "Consent Pending",
      icon: Send,
      path: "/submitted-doctors?status=consent-pending",
    },
    {
      name: "Calendar Selection",
      icon: CalendarDays,
      path: "/calendar-selection",
    },
    { name: "Input Given", icon: Hand, path: "/input-given" },
  ];
  return (
    <div
      className="quick"
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(5, 1fr)",
        gap: isMobile ? "8px" : "12px",
        marginTop: "14px",
        padding: isMobile ? "10px 6px" : "16px",
        background: "white",
        border: "1px solid #dbe5f6",
        borderRadius: "14px",
      }}
    >
      {actions.map(({ name, icon: Icon, path }) => (
        <div
          key={name}
          onClick={() => onNavigate && onNavigate(path)}
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            textAlign: "center",
            padding: isMobile ? "6px 2px" : "10px",
            borderRadius: "10px",
            background: "#f7f7f9",
          }}
        >
          <Icon size={isMobile ? 18 : 22} />
          <span
            style={{ fontSize: isMobile ? "10px" : "12px", lineHeight: 1.2 }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}

const MRDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);
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

  const getUserData = () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) return null;
      return JSON.parse(userString);
    } catch {
      return null;
    }
  };
  const userData = getUserData();
  const mrname = userData?.mrName || userData?.name || "User";
  let mrId = null;
  if (userData) {
    mrId = userData.mrId || userData._id;
  }
  if (!mrId) {
    mrId = sessionStorage.getItem("mrId");
  }

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
        let data = response.data && response.success ? response.data : response;
        setDashboardData({
          draftCount: data.draftCount || 0,
          submittedCount: data.submittedCount || 0,
          approvedCount: data.approvedCount || 0,
          consentPendingCount: data.consentPendingCount || 0,
          photoPendingCount: data.photoPendingCount || 0,
          calendarFrozenCount: data.calendarFrozenCount || 0,
          inputGivenPendingCount: data.inputGivenPendingCount || 0,
          calendarDeliveredCount: data.calendarDeliveredCount || 0,
          sendConsentCount: data.sendConsentCount || 0,
          uploadPhotoCount: data.uploadPhotoCount || 0,
          calendarSelectionCount: data.calendarSelectionCount || 0,
          inputGivenCount: data.inputGivenCount || 0,
          frozenDoctors: data.frozenDoctors || [],
          recentDoctors: data.recentDoctors || [],
        });
      } catch (error) {
        console.error("API Error:", error);
        if (error.response?.status === 404) {
          setError("Session expired. Redirecting...");
          setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();
            navigate("/");
          }, 2000);
        } else {
          setError(
            error.response?.data?.message || error.message || "Failed to load",
          );
        }
      } finally {
        setLoading(false);
      }
    };
    if (mrId) fetchDashboard();
    else setLoading(false);
  }, [mrId, navigate]);

  const handleNavigate = (path) => navigate(path);
  const handleStatClick = (title, count) => {
    if (count === 0) {
      alert(`No ${title.toLowerCase()} found`);
      return;
    }
    const routeMap = {
      "Draft Doctors": "/draft-doctors",
      "Submitted Doctors": "/submitted-doctors",
      "Approved Doctors": "/approved-doctors",
      "Consent Pending": "/approved-doctors?filter=consent-pending",
      "Photo Pending": "/approved-doctors?filter=photo-pending",
      "Calendar Frozen": "/calendar-finalized",
      "Input Given Pending": "/input-given",
      "Calendar Delivered": "/input-given?status=delivered",
    };
    navigate(routeMap[title] || "/my-doctors");
  };
  const handlePendingAction = (action, count) => {
    if (count === 0) {
      alert(`No ${action.toLowerCase()} pending`);
      return;
    }
    const routeMap = {
      "Send Consent": "/approved-doctors?filter=send-consent",
      "Upload Doctor Photo": "/approved-doctors?filter=upload-photo",
      "Calendar Selection": "/calendar-selection",
      "Input Given": "/input-given",
    };
    navigate(routeMap[action] || "/my-doctors");
  };
  const handleViewAllRecent = () => navigate("/all-doctors");
  const handleDoctorClick = (doctorId) =>
    navigate(`/doctor-details/${doctorId}`);
  const handleRetry = () => window.location.reload();

  if (loading) {
    return (
      <Layout active="Dashboard">
        <Crumbs />
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          Loading dashboard...
        </div>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout active="Dashboard">
        <Crumbs />
        <div
          style={{
            textAlign: "center",
            padding: "30px 20px",
            backgroundColor: "#fee",
            borderRadius: "8px",
            margin: "20px",
          }}
        >
          <h3 style={{ color: "#dc3545" }}>Error</h3>
          <p>{error}</p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginTop: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleRetry}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Stats configuration with route and "View all" label
  const statsConfig = [
    {
      title: "Draft Doctors",
      value: dashboardData.draftCount,
      tone: "blue",
      route: "/draft-doctors",
    },
    {
      title: "Submitted Doctors",
      value: dashboardData.submittedCount,
      tone: "purple",
      route: "/submitted-doctors",
    },
    {
      title: "Approved Doctors",
      value: dashboardData.approvedCount,
      tone: "green",
      route: "/approved-doctors",
    },
    {
      title: "Consent Pending",
      value: dashboardData.consentPendingCount,
      tone: "orange",
      route: "/approved-doctors?filter=consent-pending",
    },
    {
      title: "Photo Pending",
      value: dashboardData.photoPendingCount,
      tone: "red",
      route: "/approved-doctors?filter=photo-pending",
    },
    {
      title: "Calendar Frozen",
      value: dashboardData.calendarFrozenCount,
      tone: "blue",
      route: "/calendar-finalized",
    },
    {
      title: "Input Given Pending",
      value: dashboardData.inputGivenPendingCount,
      tone: "orange",
      route: "/input-given",
    },
    {
      title: "Calendar Delivered",
      value: dashboardData.calendarDeliveredCount,
      tone: "green",
      route: "/input-given?status=delivered",
    },
  ];

  return (
    <Layout active="Dashboard">
      <Crumbs />
      <h1
        style={{
          fontSize: isMobile ? "18px" : "22px",
          fontWeight: 600,
          marginBottom: "4px",
        }}
      >
        Welcome {mrname} 👋
      </h1>
      <p
        style={{
          marginBottom: isMobile ? "10px" : "16px",
          fontSize: isMobile ? "14px" : "16px",
          color: "#30406c",
        }}
      >
        Here's your campaign overview and next steps.
      </p>

      {/* Stats – horizontal scroll with "View all" link */}
      <div
        className="scroll-x"
        style={{ display: "flex", gap: "12px", padding: "4px 0 12px" }}
      >
        {statsConfig.map((stat) => (
          <div
            key={stat.title}
            className={`stat ${stat.tone}`}
            style={{
              flex: "0 0 140px",
              cursor: "pointer",
              padding: isMobile ? "12px 10px" : "16px 14px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              scrollSnapAlign: "start",
            }}
            onClick={() => handleStatClick(stat.title, stat.value)}
          >
            <p
              style={{
                fontSize: isMobile ? "11px" : "13px",
                margin: "0 0 2px 0",
                fontWeight: 600,
              }}
            >
              {stat.title}
            </p>
            <h3
              style={{
                fontSize: isMobile ? "24px" : "28px",
                fontWeight: 700,
                margin: "0",
              }}
            >
              {stat.value}
            </h3>
            <div
              style={{
                fontSize: isMobile ? "11px" : "12px",
                color: "#2563eb",
                fontWeight: 600,
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (stat.value > 0) navigate(stat.route);
              }}
            >
              View all <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Main grid – two columns on desktop, single on mobile */}
      <div
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "8px" : "16px",
          width: "100%",
        }}
      >
        {/* Pending Actions – vertical list */}
        <Panel
          title="Today's Pending Actions"
          style={{ padding: isMobile ? "4px 6px" : "18px" }}
        >
          {[
            {
              title: "Send Consent",
              icon: Send,
              sub: "Doctors waiting for consent email",
              value: dashboardData.sendConsentCount,
            },
            {
              title: "Upload Doctor Photo",
              icon: Camera,
              sub: "Consent approved, photo pending",
              value: dashboardData.uploadPhotoCount,
            },
            {
              title: "Calendar Selection",
              icon: CalendarDays,
              sub: "Photo uploaded, selection pending",
              value: dashboardData.calendarSelectionCount,
            },
            {
              title: "Input Given",
              icon: Hand,
              sub: "Calendars ready to be handed over",
              value: dashboardData.inputGivenCount,
            },
          ].map((action) => (
            <div
              key={action.title}
              onClick={() => handlePendingAction(action.title, action.value)}
              style={{
                cursor: action.value > 0 ? "pointer" : "not-allowed",
                opacity: action.value === 0 ? 0.6 : 1,
                width: "100%",
              }}
            >
              <ListLine
                icon={action.icon}
                title={action.title}
                sub={action.sub}
                value={action.value}
              />
            </div>
          ))}
        </Panel>

        {/* Recent Doctor Activities – always shows "View all" */}
        <Panel
          title="Recent Doctor Activities"
          action="View all"
          onActionClick={handleViewAllRecent}
          style={{ padding: isMobile ? "10px 12px" : "18px" }}
        >
          {dashboardData.recentDoctors &&
          dashboardData.recentDoctors.length > 0 ? (
            dashboardData.recentDoctors.map((doctor) => (
              <div
                key={doctor._id}
                onClick={() => handleDoctorClick(doctor._id)}
                style={{ cursor: "pointer" }}
              >
                <DoctorActivity doctor={doctor} />
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: isMobile ? "20px" : "30px",
                color: "#999",
                fontSize: isMobile ? "13px" : "14px",
              }}
            >
              No recent activities
            </div>
          )}
        </Panel>

        {/* Frozen Calendars – spans full width on desktop */}
        {dashboardData.frozenDoctors &&
          dashboardData.frozenDoctors.length > 0 && (
            <Panel
              title="❄️ Frozen Calendars"
              action="View all"
              onActionClick={() => navigate("/frozen-doctors")}
              style={{
                gridColumn: isMobile ? "1" : "1 / -1",
                padding: isMobile ? "10px 12px" : "18px",
              }}
            >
              <div
                className="scroll-x"
                style={{ display: "flex", gap: "12px", padding: "4px 0" }}
              >
                {dashboardData.frozenDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() =>
                      navigate(
                        `/calendar-selection?doctorId=${doctor._id}&mrId=${mrId}`,
                      )
                    }
                    className="stat blue"
                    style={{
                      flex: "0 0 160px",
                      cursor: "pointer",
                      scrollSnapAlign: "start",
                      padding: "14px 12px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {doctor.doctorName}
                      </p>
                      <h3
                        style={{
                          fontSize: "12px",
                          fontWeight: "normal",
                          color: "#666",
                          marginTop: "2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {doctor.speciality}
                      </h3>
                      <small
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Badge tone="green">✓ Frozen</Badge>
                        <span style={{ color: "#999", fontSize: "11px" }}>
                          {doctor.calendarFrozenAt
                            ? new Date(
                                doctor.calendarFrozenAt,
                              ).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
      </div>

      <QuickActions onNavigate={handleNavigate} isMobile={isMobile} />

      {/* ===== OVERRIDES FOR EXACT REFERENCE ===== */}
      <style>{`
        /* Make stat cards bigger and show View all */
        html, body, #root {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

* {
  box-sizing: border-box;
}

.panel {
  overflow-x: hidden;
  width: 100%;
}

.listline {
  width: 100%;
  overflow: hidden;
}
        .stat {
          border: 1px solid #dbe5f6;
          background: white;
          border-radius: 14px;
          transition: transform 0.15s;
        }
        .stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .stat p {
          color: #30406c;
        }
        .stat h3 {
          color: #06185f;
        }

        /* Mobile adjustments */
/* ===== MOBILE ONLY – compact specific parts ===== */
@media (max-width: 768px) {
  /* ---- Pending actions: squeeze rows ---- */
  .listline {
    padding: 2px 0 !important;          /* reduce vertical space */
    gap: 4px !important;               /* reduce gap between elements */
  }
  .listline b {
    font-size: 11px !important;        /* slightly smaller title */
  }
  .listline span {
    font-size: 9px !important;         /* smaller subtitle */
  }
  .listline > strong {
    font-size: 15px !important;        /* keep number readable */
    margin-left: auto !important;      /* push to right */
    min-width: 20px !important;
    text-align: right !important;
  }
  .listline .iconbox {
    width: 22px !important;
    height: 22px !important;
    flex: 0 0 22px !important;
  }
  .listline .iconbox svg {
    width: 14px !important;
    height: 14px !important;
  }

  /* ---- Recent activities: compact rows ---- */
  .doctorAct {
    padding: 2px 0 !important;
    gap: 4px !important;
    border-bottom: none !important;
  }
  .doctorAct + .doctorAct {
    border-top: 1px solid #f0f0f0;
    padding-top: 2px !important;
  }
  .doctorAct .miniAvatar {
    width: 20px !important;
    height: 20px !important;
    font-size: 7px !important;
  }
  .doctorAct b {
    font-size: 10px !important;
  }
  .doctorAct span {
    font-size: 8px !important;
  }
  .doctorAct small {
    font-size: 8px !important;
  }
  .doctorAct .badge {                 /* approval status */
    font-size: 7px !important;
    padding: 1px 5px !important;
  }

  /* ---- "View all" button in panel header ---- */
  .panelHead button {
    background: #2563eb !important;
    color: white !important;
    border: none !important;
    padding: 2px 10px !important;
    border-radius: 12px !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    min-height: 22px !important;
    cursor: pointer !important;
    white-space: nowrap !important;
  }

  /* Optional: reduce panel header spacing */
  .panelHead {
    margin-bottom: 2px !important;
  }
  .panelHead h3 {
    font-size: 13px !important;
    margin: 0 !important;
  }
}
.listline {
  min-width: 0;
}
.listline b,
.listline span {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
      `}</style>
    </Layout>
  );
};

export default MRDashboard;
