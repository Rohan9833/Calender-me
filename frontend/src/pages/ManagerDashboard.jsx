import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getFLMDashboard,
  getSLMDashboard,
  getTLMDashboard,
} from "../api/managerAPI";

import {
  Users,
  UserPlus,
  CheckCircle2,
  CalendarDays,
  Clock3,
  XCircle,
  Hand,
  RefreshCw,
  ArrowUpRight,
  Activity,
} from "lucide-react";

import Layout from "../components/Layout";

import {
  Panel,
  ListLine,
  ManagerActivity,
  Badge,
  Button,
  Crumbs,
} from "../components/UIComponents";

// ============================================================
// MOBILE BREAKPOINT
// ============================================================

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

// ============================================================
// FUNNEL PANEL
// ============================================================

function FunnelPanel({ funnel }) {
  const data = [
    {
      name: "Registered",
      value: funnel?.registered || 0,
      color: "#2563eb",
    },
    {
      name: "Approved",
      value: funnel?.approved || 0,
      color: "#10b981",
    },
    {
      name: "Input Given",
      value: funnel?.inputGiven || 0,
      color: "#f59e0b",
    },
    {
      name: "Calendar Frozen",
      value: funnel?.frozen || 0,
      color: "#8b5cf6",
    },
    {
      name: "Rejected",
      value: funnel?.rejected || 0,
      color: "#ef4444",
    },
  ];

  const conversionRate =
    funnel?.registered > 0
      ? Math.round(((funnel.inputGiven || 0) / funnel.registered) * 100)
      : 0;

  const registered = funnel?.registered || 0;

  return (
    <div className="dashboard-card funnel-card">
      <div className="card-header">
        <div>
          <div className="card-title">Design Progress</div>

          <div className="card-subtitle">Campaign funnel overview</div>
        </div>

        <div className="header-icon blue">
          <Activity size={17} />
        </div>
      </div>

      <div className="funnel-list">
        {data.map((item) => {
          const percentage =
            registered > 0
              ? Math.min(100, Math.round((item.value / registered) * 100))
              : 0;

          return (
            <div className="funnel-item" key={item.name}>
              <div className="funnel-label-row">
                <div className="funnel-label">
                  <span
                    className="funnel-dot"
                    style={{
                      background: item.color,
                    }}
                  />

                  <span>{item.name}</span>
                </div>

                <div className="funnel-value">{item.value}</div>
              </div>

              <div className="funnel-track">
                <div
                  className="funnel-progress"
                  style={{
                    width: `${Math.max(
                      item.value > 0 ? percentage : 0,
                      item.value > 0 ? 3 : 0,
                    )}%`,
                    background: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="conversion-box">
        <div className="conversion-icon">
          <ArrowUpRight size={18} />
        </div>

        <div className="conversion-content">
          <span>Registered → Input Given</span>

          <strong>{conversionRate}%</strong>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function DashboardStat({
  title,
  value,
  icon: Icon,
  tone,
  route,
  onClick,
  isMobile,
}) {
  const toneConfig = {
    blue: {
      iconBg: "#eff6ff",
      iconColor: "#2563eb",
      accent: "#2563eb",
    },

    purple: {
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed",
      accent: "#7c3aed",
    },

    green: {
      iconBg: "#ecfdf5",
      iconColor: "#059669",
      accent: "#059669",
    },

    orange: {
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
      accent: "#ea580c",
    },

    red: {
      iconBg: "#fef2f2",
      iconColor: "#dc2626",
      accent: "#dc2626",
    },
  };

  const config = toneConfig[tone] || toneConfig.blue;

  return (
    <div
      className={`dashboard-stat ${route ? "clickable" : ""}`}
      onClick={() => route && onClick(route)}
      style={{
        minWidth: isMobile ? "154px" : "0",
      }}
    >
      <div className="stat-top">
        <div
          className="stat-icon"
          style={{
            background: config.iconBg,
            color: config.iconColor,
          }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>

        {route && (
          <ArrowUpRight className="stat-arrow" size={16} color="#94a3b8" />
        )}
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-title">{title}</div>

      <div
        className="stat-accent"
        style={{
          background: config.accent,
        }}
      />
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const isMobile = useIsMobile(768);

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [showAllMRs, setShowAllMRs] = useState(false);

  // ============================================================
  // FETCH DASHBOARD
  // ============================================================

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);

      const user = JSON.parse(localStorage.getItem("user"));

      let data;

      if (user.role === "flm") {
        data = await getFLMDashboard(user.flmId);
      } else if (user.role === "slm") {
        data = await getSLMDashboard(user.slmId);
      } else if (user.role === "tlm") {
        data = await getTLMDashboard(user.tlmId);
      }

      setDashboard(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handleRefresh = () => fetchDashboard();

  const handleViewAllMRs = () => navigate("/manager/mr-progress");

  const handleViewPendingApprovals = () => navigate("/manager/approvals");

  const handleViewDoctor = (doctorId) =>
    navigate(`/doctor-details/${doctorId}`);

  const handleViewAllActivities = () => setActivityModalOpen(true);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Layout role="manager" active="Dashboard">
        <Crumbs items={["Dashboard"]} />

        <div className="dashboard-loading">
          <div className="loading-spinner">
            <RefreshCw size={24} />
          </div>

          <h3>Loading dashboard</h3>

          <p>Please wait while we load your campaign overview.</p>
        </div>

        <style>{`
          .dashboard-loading {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #64748b;
          }

          .loading-spinner {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eff6ff;
            color: #2563eb;
            margin-bottom: 16px;
            animation: dashboardSpin 1.4s linear infinite;
          }

          .dashboard-loading h3 {
            margin: 0;
            color: #0f172a;
            font-size: 18px;
            font-weight: 700;
          }

          .dashboard-loading p {
            margin: 6px 0 0;
            font-size: 14px;
          }

          @keyframes dashboardSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Layout>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (!dashboard) {
    return (
      <Layout role="manager" active="Dashboard">
        <Crumbs items={["Dashboard"]} />

        <div className="dashboard-error">
          <div className="error-icon">
            <XCircle size={28} />
          </div>

          <h3>Failed to load dashboard data</h3>

          <p>Something went wrong while loading your dashboard.</p>

          <Button onClick={handleRefresh} variant="primary">
            <RefreshCw size={16} />
            Retry
          </Button>
        </div>

        <style>{`
          .dashboard-error {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .error-icon {
            width: 58px;
            height: 58px;
            border-radius: 18px;
            background: #fef2f2;
            color: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
          }

          .dashboard-error h3 {
            margin: 0;
            color: #0f172a;
            font-size: 18px;
          }

          .dashboard-error p {
            color: #64748b;
            font-size: 14px;
            margin: 7px 0 18px;
          }
        `}</style>
      </Layout>
    );
  }

  // ============================================================
  // USER
  // ============================================================

  const user = JSON.parse(localStorage.getItem("user"));

  const managerName =
    user?.flmName || user?.slmName || user?.tlmName || "Manager";

  // ============================================================
  // STATS
  // ============================================================

  const statsConfig = [
    {
      title: "Total MRs",
      value: dashboard.totalMRs || 0,
      icon: Users,
      tone: "purple",
      route: "/manager/mr-progress",
    },

    {
      title: "Total Doctors",
      value: dashboard.totalDoctors || 0,
      icon: UserPlus,
      tone: "blue",
    },

    {
      title: "Approved Doctors",
      value: dashboard.approvedDoctors || 0,
      icon: CheckCircle2,
      tone: "green",
    },

    {
      title: "Input Given",
      value: dashboard.inputGiven || 0,
      icon: CalendarDays,
      tone: "orange",
    },

    {
      title: "Pending Actions",
      value: dashboard.pendingActions || 0,
      icon: Clock3,
      tone: "orange",
      route:
        (dashboard.pendingApprovals || 0) > 0
          ? "/manager/approvals"
          : (dashboard.inputGivenPending || 0) > 0
            ? "/manager/input-given"
            : (dashboard.pendingFreeze || 0) > 0
              ? "/manager/calendar-designs"
              : null,
    },

    {
      title: "Rejected Doctors",
      value: dashboard.rejectedDoctors || 0,
      icon: XCircle,
      tone: "red",
    },
  ];

  return (
    <Layout role="manager" active="Dashboard">
      <div className="manager-dashboard">
        <Crumbs items={["Dashboard"]} />

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="dashboard-header">
          <div className="header-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              TEAM OVERVIEW
            </div>

            <h1>Manager Dashboard</h1>

            <p>
              Welcome back, <strong>{managerName}</strong>. Here's an overview
              of your team's campaign progress.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size={isMobile ? "small" : "medium"}
          >
            <RefreshCw
              size={isMobile ? 14 : 17}
              className={refreshing ? "refreshing-icon" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* ====================================================
            STATS
        ==================================================== */}

        <div className="stats-wrapper">
          <div className="stats-grid">
            {statsConfig.map((stat) => (
              <DashboardStat
                key={stat.title}
                {...stat}
                isMobile={isMobile}
                onClick={(route) => navigate(route)}
              />
            ))}
          </div>
        </div>

        {/* ====================================================
            FIRST ROW
        ==================================================== */}

        <div className="dashboard-grid first-grid">
          <FunnelPanel funnel={dashboard.funnel} />

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">MR-wise Performance</div>

                <div className="card-subtitle">
                  Performance breakdown by medical representative
                </div>
              </div>

              <button className="card-action" onClick={handleViewAllMRs}>
                View All
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="table-wrapper">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>MR Name</th>
                    <th>Total</th>
                    <th>Approved</th>
                    <th>Input</th>
                    <th>Pending</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.mrPerformance?.length > 0 ? (
                    (showAllMRs ? dashboard.mrPerformance : dashboard.mrPerformance.slice(0, 5)).map((mr, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="mr-name-cell">
                            <div className="mr-avatar">
                              {mr.mrName?.charAt(0)?.toUpperCase() || "M"}
                            </div>

                            <span>{mr.mrName}</span>
                          </div>
                        </td>

                        <td>
                          <strong>{mr.totalDoctors || 0}</strong>
                        </td>

                        <td>
                          <div className="metric-cell">
                            <strong>{mr.approvedDoctors || 0}</strong>

                            <span>{mr.approvedPercentage || 0}%</span>
                          </div>
                        </td>

                        <td>
                          <div className="metric-cell">
                            <strong>{mr.inputGivenDoctors || 0}</strong>

                            <span>{mr.inputGivenPercentage || 0}%</span>
                          </div>
                        </td>

                        <td>
                          <Badge tone="red" compact={isMobile}>
                            {mr.pendingDoctors || 0}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        No MR performance data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {dashboard.mrPerformance?.length > 5 && (
              <div className="mr-performance-more">
                <button
                  type="button"
                  className="mr-performance-more-button"
                  onClick={() => setShowAllMRs((prev) => !prev)}
                >
                  {showAllMRs
                    ? "Show Less"
                    : "View More (" + (dashboard.mrPerformance.length - 5) + ")"}
                  <ArrowUpRight
                    size={14}
                    style={{
                      transform: showAllMRs ? "rotate(-90deg)" : "rotate(90deg)",
                    }}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================
            SECOND ROW
        ==================================================== */}

        <div className="dashboard-grid second-grid">
          {/* PENDING ACTIONS */}

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Pending Actions</div>

                <div className="card-subtitle">
                  Items requiring your attention
                </div>
              </div>

              <div className="header-icon orange">
                <Clock3 size={17} />
              </div>
            </div>

            <div className="action-list">
              {/* =================================================
                  HOVER FIX
                  Dedicated wrapper around every ListLine
              ================================================= */}

              <div
                className={`pending-action-item ${
                  (dashboard.pendingApprovals || 0) > 0 ? "is-clickable" : ""
                }`}
              >
                <ListLine
                  icon={Clock3}
                  title="Doctors awaiting approval"
                  sub="Submitted by MRs pending your approval"
                  value={dashboard.pendingApprovals || 0}
                  onClick={handleViewPendingApprovals}
                  clickable={(dashboard.pendingApprovals || 0) > 0}
                />
              </div>

              <div
                className={`pending-action-item ${
                  (dashboard.inputGivenPending || 0) > 0 ? "is-clickable" : ""
                }`}
              >
                <ListLine
                  icon={Hand}
                  title="Input given pending"
                  sub="Frozen calendars not marked input"
                  value={dashboard.inputGivenPending || 0}
                  onClick={() => navigate("/manager/input-given")}
                  clickable={(dashboard.inputGivenPending || 0) > 0}
                />
              </div>

              <div
                className={`pending-action-item ${
                  (dashboard.pendingFreeze || 0) > 0 ? "is-clickable" : ""
                }`}
              >
                <ListLine
                  icon={CalendarDays}
                  title="Calendars pending freeze"
                  sub="Selected but not frozen by MR"
                  value={dashboard.pendingFreeze || 0}
                  onClick={() => navigate("/manager/calendar-designs")}
                  clickable={(dashboard.pendingFreeze || 0) > 0}
                />
              </div>

            </div>
          </div>

          {/* RECENT ACTIVITY */}

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Activity</div>

                <div className="card-subtitle">Latest team activity</div>
              </div>

              <button className="card-action" onClick={handleViewAllActivities}>
                View All
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="activity-list">
              {dashboard.recentActivities &&
              dashboard.recentActivities.length > 0 ? (
                dashboard.recentActivities.map((activity, index) => {
                  let title = "Activity performed";

                  let status = "Completed";

                  let time = activity.createdAt || new Date();

                  if (activity.action) {
                    title = activity.action;
                  }

                  if (activity.doctor?.doctorName) {
                    title = `${activity.doctor.doctorName} - ${
                      activity.action || "Activity"
                    }`;
                  }

                  if (activity.description) {
                    title = activity.description;
                  }

                  if (activity.status) {
                    status = activity.status;
                  }

                  return (
                    <div className="activity-row" key={activity._id || index}>
                      <ManagerActivity
                        title={title}
                        status={status}
                        time={time}
                        compact={isMobile}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Activity size={20} />
                  </div>

                  <span>No recent activities</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            RECENT DOCTORS
        ==================================================== */}

        {dashboard.recentDoctors && dashboard.recentDoctors.length > 0 && (
          <div className="dashboard-card recent-doctors-card">
            <div className="card-header">
              <div>
                <div className="card-title">Recently Added Doctors</div>

                <div className="card-subtitle">
                  Latest doctors added to your team
                </div>
              </div>

              <button
                className="card-action"
                onClick={() => navigate("/manager/approvals")}
              >
                View All
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="doctors-grid">
              {dashboard.recentDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="doctor-card"
                  onClick={() => handleViewDoctor(doctor._id)}
                >
                  <div className="doctor-top">
                    <div className="doctor-avatar">
                      {doctor.doctorName?.charAt(0)?.toUpperCase() || "D"}
                    </div>

                    <Badge
                      tone={
                        doctor.approvalStatus === "approved"
                          ? "green"
                          : doctor.approvalStatus === "rejected"
                            ? "red"
                            : "orange"
                      }
                      compact={isMobile}
                    >
                      {doctor.approvalStatus === "approved"
                        ? "Approved"
                        : doctor.approvalStatus === "rejected"
                          ? "Rejected"
                          : "Pending"}
                    </Badge>
                  </div>

                  <div className="doctor-info">
                    <h4>{doctor.doctorName}</h4>

                    <p>{doctor.speciality || "Speciality not available"}</p>

                    <span>
                      Added {new Date(doctor.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="doctor-footer">
                    <span>View details</span>

                    <ArrowUpRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {activityModalOpen && (
        <div
          className="manager-activity-modal-overlay"
          onClick={() => setActivityModalOpen(false)}
        >
          <div
            className="manager-activity-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="manager-activity-modal-header">
              <div>
                <h2>Recent Activity</h2>
                <p>Latest activity from your team</p>
              </div>
              <button
                type="button"
                className="manager-activity-modal-close"
                onClick={() => setActivityModalOpen(false)}
                aria-label="Close recent activity"
              >
                ×
              </button>
            </div>

            <div className="manager-activity-modal-list">
              {dashboard.recentActivities?.length > 0 ? (
                dashboard.recentActivities.map((activity, index) => {
                  const title = activity.doctor?.doctorName
                    ? `${activity.doctor.doctorName} - ${activity.action || "Activity"}`
                    : activity.action || "Activity performed";

                  return (
                    <button
                      type="button"
                      className="manager-activity-modal-row"
                      key={activity._id || index}
                      onClick={() => {
                        setActivityModalOpen(false);
                        if (activity.doctor?._id) {
                          handleViewDoctor(activity.doctor._id);
                        }
                      }}
                    >
                      <div className="manager-activity-modal-row-main">
                        <strong>{title}</strong>
                        <span>
                          {activity.createdAt
                            ? new Date(activity.createdAt).toLocaleString()
                            : "Recently"}
                        </span>
                      </div>
                      <Badge
                        tone={
                          activity.status === "Rejected"
                            ? "red"
                            : activity.status === "Completed"
                              ? "green"
                              : "purple"
                        }
                      >
                        {activity.status || "Completed"}
                      </Badge>
                    </button>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Activity size={20} />
                  </div>
                  <span>No recent activities</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style>{`
        .manager-activity-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.45);
        }

        .manager-activity-modal {
          width: min(720px, 100%);
          max-height: min(720px, 85vh);
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.2);
        }

        .manager-activity-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 22px;
          border-bottom: 1px solid #e2e8f0;
        }

        .manager-activity-modal-header h2 {
          margin: 0;
          color: #0f172a;
          font-size: 20px;
        }

        .manager-activity-modal-header p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .manager-activity-modal-close {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 9px;
          background: #f1f5f9;
          color: #475569;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
        }

        .manager-activity-modal-list {
          max-height: calc(min(720px, 85vh) - 92px);
          overflow-y: auto;
          padding: 8px;
        }

        .manager-activity-modal-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px;
          border: 0;
          border-bottom: 1px solid #f1f5f9;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
        }

        .manager-activity-modal-row:hover {
          background: #f8fbff;
        }

        .manager-activity-modal-row-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .manager-activity-modal-row-main strong {
          color: #0f172a;
          font-size: 14px;
        }

        .manager-activity-modal-row-main span {
          color: #94a3b8;
          font-size: 12px;
        }

        .manager-dashboard {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding-bottom: 28px;
          color: #0f172a;
        }

        /* ================= HEADER ================= */

        .dashboard-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin: 20px 0 22px;
        }

        .header-copy {
          min-width: 0;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          margin-bottom: 7px;
        }

        .eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2563eb;
          box-shadow: 0 0 0 4px #dbeafe;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.15;
          letter-spacing: -0.025em;
          font-weight: 750;
          color: #0f172a;
        }

        .dashboard-header p {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
        }

        .dashboard-header p strong {
          color: #334155;
        }

        .refreshing-icon {
          animation: spinDashboard 0.9s linear infinite;
        }

        @keyframes spinDashboard {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ================= STATS ================= */

        .stats-wrapper {
          width: 100%;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(6, minmax(0, 1fr));
          gap: 12px;
        }

        .dashboard-stat {
          position: relative;
          min-height: 126px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
          box-shadow:
            0 3px 12px
            rgba(15, 23, 42, 0.035);
          overflow: hidden;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .dashboard-stat.clickable {
          cursor: pointer;
        }

        .dashboard-stat.clickable:hover {
          transform: translateY(-2px);
          border-color: #bfdbfe;
          box-shadow:
            0 8px 24px
            rgba(37, 99, 235, 0.10);
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-arrow {
          transition:
            transform 0.2s ease;
        }

        .dashboard-stat:hover
          .stat-arrow {
          transform:
            translate(2px, -2px);
        }

        .stat-value {
          margin-top: 13px;
          font-size: 27px;
          line-height: 1;
          font-weight: 750;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .stat-title {
          margin-top: 7px;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .stat-accent {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 0.85;
        }

        /* ================= CARDS ================= */

        .mr-performance-more {
          display: flex;
          justify-content: center;
          padding: 8px 12px 10px;
          border-top: 1px solid #eef2f7;
          background: #ffffff;
        }

        .mr-performance-more-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 0;
          background: transparent;
          color: #2563eb;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 7px;
        }

        .mr-performance-more-button:hover {
          background: #eff6ff;
        }

        .mr-performance-more-button svg {
          transition: transform .2s ease;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          gap: 18px;
          width: 100%;
        }

        .second-grid {
          margin-top: 18px;
        }

        .dashboard-card {
          min-width: 0;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: #ffffff;
          box-shadow:
            0 3px 14px
            rgba(15, 23, 42, 0.035);
          overflow: hidden;
        }

        .card-header {
          min-height: 70px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom:
            1px solid #eef2f7;
        }

        .card-title {
          color: #172033;
          font-size: 15px;
          font-weight: 750;
          line-height: 1.25;
        }

        .card-subtitle {
          margin-top: 4px;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.35;
        }

        .header-icon {
          flex-shrink: 0;
          width: 35px;
          height: 35px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .header-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .card-action {
          border: 0;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 8px;
          padding: 7px 10px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition:
            all 0.18s ease;
        }

        .card-action:hover {
          background: #dbeafe;
          transform:
            translateY(-1px);
        }

        /* ================= FUNNEL ================= */

        .funnel-list {
          padding: 17px 18px 8px;
        }

        .funnel-item {
          margin-bottom: 13px;
        }

        .funnel-item:last-child {
          margin-bottom: 2px;
        }

        .funnel-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .funnel-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
        }

        .funnel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .funnel-value {
          color: #0f172a;
          font-size: 12px;
          font-weight: 750;
        }

        .funnel-track {
          width: 100%;
          height: 7px;
          border-radius: 99px;
          background: #f1f5f9;
          overflow: hidden;
        }

        .funnel-progress {
          height: 100%;
          border-radius: inherit;
          min-width: 0;
          transition:
            width 0.4s ease;
        }

        .conversion-box {
          margin: 9px 18px 18px;
          padding: 11px 12px;
          border-radius: 11px;
          background: #f8fafc;
          border: 1px solid #eef2f7;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .conversion-icon {
          width: 31px;
          height: 31px;
          border-radius: 9px;
          background: #ecfdf5;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .conversion-content {
          min-width: 0;
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .conversion-content span {
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
        }

        .conversion-content strong {
          color: #059669;
          font-size: 16px;
          font-weight: 750;
        }

        /* ================= TABLE ================= */

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          padding: 0 4px 5px;
        }

        .performance-table {
          width: 100%;
          min-width: 570px;
          border-collapse: collapse;
          font-size: 12px;
        }

        .performance-table th {
          padding: 12px 14px;
          background: #f8fafc;
          color: #64748b;
          font-size: 10px;
          font-weight: 750;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.045em;
          border-bottom:
            1px solid #e5e7eb;
          white-space: nowrap;
        }

        .performance-table td {
          padding: 12px 14px;
          color: #475569;
          border-bottom:
            1px solid #f1f5f9;
          white-space: nowrap;
        }

        .performance-table tbody tr {
          transition:
            background 0.15s ease;
        }

        .performance-table tbody tr:hover {
          background: #f8fafc;
        }

        .performance-table
          tbody
          tr:last-child
          td {
          border-bottom: 0;
        }

        .mr-name-cell {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 145px;
        }

        .mr-avatar {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 750;
        }

        .mr-name-cell span {
          color: #334155;
          font-weight: 650;
        }

        .metric-cell {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .metric-cell strong {
          color: #334155;
        }

        .metric-cell span {
          color: #94a3b8;
          font-size: 10px;
        }

        .empty-table {
          text-align: center !important;
          padding: 35px !important;
          color: #94a3b8 !important;
        }

        /* =====================================================
           PENDING ACTIONS
        ===================================================== */

        .action-list {
          padding: 6px 12px 10px;
        }

        /*
         * IMPORTANT:
         * Each ListLine now has its own wrapper.
         * This guarantees the hover effect regardless
         * of the internal ListLine implementation.
         */

        .pending-action-item {
          position: relative;
          margin: 4px 0;
          border: 1px solid transparent;
          border-radius: 12px;
          overflow: hidden;
          background: transparent;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .pending-action-item.is-clickable {
          cursor: pointer;
        }

        .pending-action-item:hover {
          background: #f8fbff;
          border-color: #dbeafe;
          transform: translateX(3px);
          box-shadow:
            0 4px 14px
            rgba(37, 99, 235, 0.08);
        }

        .pending-action-item.is-clickable {
          cursor: pointer;
        }

        .pending-action-item.is-clickable:active {
          transform:
            translateX(3px)
            scale(0.995);
          background: #eff6ff;
        }

        /*
         * Add a blue indicator on hover.
         */

        .pending-action-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10px;
          bottom: 10px;
          width: 3px;
          border-radius: 0 4px 4px 0;
          background: #2563eb;
          opacity: 0;
          transform: scaleY(0.5);
          transition:
            opacity 0.18s ease,
            transform 0.18s ease;
          z-index: 2;
        }

        .pending-action-item:hover::before {
          opacity: 1;
          transform: scaleY(1);
        }

        /*
         * Prevent ListLine's own hover styles from
         * fighting with the wrapper.
         */

        .pending-action-item
          > * {
          transition:
            background 0.18s ease;
        }

        /* ================= ACTIVITY ================= */

        .activity-list {
          padding: 4px 17px 10px;
        }

        .activity-row {
          border-bottom:
            1px solid #f1f5f9;
        }

        .activity-row:last-child {
          border-bottom: 0;
        }

        .empty-state {
          min-height: 145px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
          color: #94a3b8;
          font-size: 12px;
        }

        .empty-state-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #f8fafc;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ================= DOCTORS ================= */

        .recent-doctors-card {
          margin-top: 18px;
        }

        .doctors-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(250px, 1fr)
            );
          gap: 12px;
          padding: 17px;
        }

        .doctor-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          background: #ffffff;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .doctor-card:hover {
          transform:
            translateY(-2px);
          border-color: #bfdbfe;
          box-shadow:
            0 8px 20px
            rgba(37, 99, 235, 0.08);
        }

        .doctor-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .doctor-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 750;
        }

        .doctor-info {
          margin-top: 13px;
        }

        .doctor-info h4 {
          margin: 0;
          color: #172033;
          font-size: 14px;
          font-weight: 750;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doctor-info p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .doctor-info span {
          display: block;
          margin-top: 6px;
          color: #94a3b8;
          font-size: 10px;
        }

        .doctor-footer {
          margin-top: 13px;
          padding-top: 10px;
          border-top:
            1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #2563eb;
          font-size: 10px;
          font-weight: 700;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .manager-dashboard {
            padding-bottom: 18px;
          }

          .dashboard-header {
            align-items: flex-start;
            margin: 12px 0 15px;
            gap: 12px;
          }

          .eyebrow {
            font-size: 8px;
            margin-bottom: 5px;
          }

          .eyebrow-dot {
            width: 5px;
            height: 5px;
          }

          .dashboard-header h1 {
            font-size: 21px;
          }

          .dashboard-header p {
            font-size: 11px;
            line-height: 1.45;
            max-width: 95%;
          }

          .dashboard-header button {
            flex-shrink: 0;
          }

          .stats-wrapper {
            overflow-x: auto;
            margin: 0 -2px 15px;
            padding: 2px;
            scrollbar-width: none;
          }

          .stats-wrapper::-webkit-scrollbar {
            display: none;
          }

          .stats-grid {
            display: flex;
            gap: 8px;
            width: max-content;
          }

          .dashboard-stat {
            width: 154px;
            min-width: 154px;
            min-height: 112px;
            padding: 13px;
            border-radius: 14px;
          }

          .stat-icon {
            width: 32px;
            height: 32px;
            border-radius: 9px;
          }

          .stat-value {
            margin-top: 10px;
            font-size: 23px;
          }

          .stat-title {
            font-size: 10px;
            margin-top: 6px;
          }

          .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .second-grid {
            margin-top: 12px;
          }

          .dashboard-card {
            border-radius: 14px;
          }

          .card-header {
            min-height: 60px;
            padding: 13px 14px;
            gap: 10px;
          }

          .card-title {
            font-size: 13px;
          }

          .card-subtitle {
            font-size: 9px;
            margin-top: 3px;
          }

          .header-icon {
            width: 31px;
            height: 31px;
            border-radius: 9px;
          }

          .card-action {
            padding: 6px 8px;
            font-size: 9px;
          }

          .funnel-list {
            padding: 14px 14px 6px;
          }

          .funnel-item {
            margin-bottom: 11px;
          }

          .funnel-label {
            font-size: 10px;
          }

          .funnel-value {
            font-size: 10px;
          }

          .funnel-track {
            height: 6px;
          }

          .conversion-box {
            margin: 8px 14px 14px;
            padding: 9px 10px;
          }

          .conversion-icon {
            width: 28px;
            height: 28px;
          }

          .conversion-content span {
            font-size: 9px;
          }

          .conversion-content strong {
            font-size: 14px;
          }

          .performance-table {
            min-width: 520px;
            font-size: 10px;
          }

          .performance-table th {
            padding: 9px 10px;
            font-size: 8px;
          }

          .performance-table td {
            padding: 9px 10px;
          }

          .mr-name-cell {
            min-width: 130px;
            gap: 7px;
          }

          .mr-avatar {
            width: 25px;
            height: 25px;
            border-radius: 8px;
            font-size: 9px;
          }

          .metric-cell span {
            font-size: 8px;
          }

          /* ===========================
             MOBILE PENDING ACTIONS
          =========================== */

          .action-list {
            padding: 5px 10px 8px;
          }

          .pending-action-item {
            margin: 3px 0;
            border-radius: 11px;
          }

          .pending-action-item:hover {
            transform: translateX(2px);
            box-shadow:
              0 3px 10px
              rgba(37, 99, 235, 0.07);
          }

          .pending-action-item::before {
            top: 8px;
            bottom: 8px;
          }

          .activity-list {
            padding: 2px 12px 7px;
          }

          .empty-state {
            min-height: 110px;
          }

          .recent-doctors-card {
            margin-top: 12px;
          }

          .doctors-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            padding: 12px;
          }

          .doctor-card {
            padding: 10px;
            border-radius: 11px;
          }

          .doctor-avatar {
            width: 32px;
            height: 32px;
            border-radius: 9px;
            font-size: 11px;
          }

          .doctor-info {
            margin-top: 9px;
          }

          .doctor-info h4 {
            font-size: 11px;
          }

          .doctor-info p {
            font-size: 9px;
          }

          .doctor-info span {
            font-size: 8px;
            margin-top: 5px;
          }

          .doctor-footer {
            margin-top: 9px;
            padding-top: 8px;
            font-size: 8px;
          }
        }

        /* =====================================================
           VERY SMALL PHONES
        ===================================================== */

        @media (max-width: 390px) {
          .dashboard-header {
            flex-direction: column;
          }

          .dashboard-header button {
            align-self: flex-start;
          }

          .dashboard-header h1 {
            font-size: 20px;
          }

          .stats-wrapper {
            margin-bottom: 12px;
          }

          .dashboard-stat {
            width: 145px;
            min-width: 145px;
          }

          .doctors-grid {
            grid-template-columns: 1fr;
          }
        }

        /* =====================================================
           SHORT DESKTOP SCREENS
        ===================================================== */

        @media (min-width: 769px) and (max-height: 800px) {
          .dashboard-header {
            margin-top: 12px;
            margin-bottom: 15px;
          }

          .dashboard-header h1 {
            font-size: 27px;
          }

          .stats-wrapper {
            margin-bottom: 15px;
          }

          .dashboard-stat {
            min-height: 112px;
            padding: 13px;
          }

          .stat-value {
            margin-top: 10px;
            font-size: 24px;
          }

          .dashboard-grid {
            gap: 14px;
          }

          .second-grid {
            margin-top: 14px;
          }

          .card-header {
            min-height: 62px;
            padding: 13px 15px;
          }

          .funnel-list {
            padding-top: 13px;
          }

          .funnel-item {
            margin-bottom: 9px;
          }

          .conversion-box {
            margin-bottom: 13px;
          }

          .doctors-grid {
            padding: 13px;
          }
        }
      `}</style>
    </Layout>
  );
}
