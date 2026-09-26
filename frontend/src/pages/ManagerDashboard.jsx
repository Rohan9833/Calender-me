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
} from "lucide-react";
import Layout from "../components/Layout";
import {
  StatCard,
  Panel,
  ListLine,
  ManagerActivity,
  Badge,
  Button,
  Crumbs,
} from "../components/UIComponents";

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

// Funnel Panel – exact match to image
// Funnel Panel – exact match to your image
// Funnel Panel – exact match to your image
function FunnelPanel({ funnel }) {
  const palette = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
  const data = [
    { name: "Registered", v: funnel?.registered || 0 },
    { name: "Approved", v: funnel?.approved || 0 },
    { name: "Input Given", v: funnel?.inputGiven || 0 },
    { name: "Calendar Frozen", v: funnel?.frozen || 0 },
    { name: "Rejected", v: funnel?.rejected || 0 },
  ];
  const conversionRate = funnel?.registered > 0
    ? Math.round(((funnel.inputGiven || 0) / funnel.registered) * 100)
    : 0;

  return (
    <Panel title="Design Progress Overview">
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {data.map((d, i) => (
          <div
            key={d.name}
            style={{
              width: `${Math.max(20, 100 - i * 13)}%`,
              background: palette[i],
              padding: '8px 14px',
              marginBottom: '4px',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{d.name}</span>
            <span>{d.v}</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#333' }}>
        Conversion Rate (Registered to Input Given) {conversionRate}
      </p>
    </Panel>
  );
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = () => fetchDashboard();
  const handleViewAllMRs = () => navigate("/manager/mr-progress");
  const handleViewPendingApprovals = () => navigate("/manager/approvals");
  const handleViewDoctor = (doctorId) => navigate(`/doctor-details/${doctorId}`);
  const handleViewAllActivities = () => navigate("/manager/activity-log");

  if (loading) {
    return (
      <Layout role="manager" active="Dashboard">
        <Crumbs items={["Dashboard"]} />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading dashboard data...</div>
      </Layout>
    );
  }

  if (!dashboard) {
    return (
      <Layout role="manager" active="Dashboard">
        <Crumbs items={["Dashboard"]} />
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <h3>Failed to load dashboard data</h3>
          <Button onClick={handleRefresh} variant="primary">Retry</Button>
        </div>
      </Layout>
    );
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const managerName = user?.flmName || user?.slmName || user?.tlmName || "Manager";

  const statsConfig = [
    { title: "Total MRs", value: dashboard.totalMRs || 0, icon: Users, tone: "purple", route: "/manager/mr-progress" },
    { title: "Total Doctors", value: dashboard.totalDoctors || 0, icon: UserPlus, tone: "blue" },
    { title: "Approved Doctors", value: dashboard.approvedDoctors || 0, icon: CheckCircle2, tone: "green" },
    { title: "Input Given", value: dashboard.inputGiven || 0, icon: CalendarDays, tone: "orange" },
    { title: "Pending Actions", value: dashboard.pendingActions || 0, icon: Clock3, tone: "orange", route: "/manager/approvals" },
    { title: "Rejected Doctors", value: dashboard.rejectedDoctors || 0, icon: XCircle, tone: "red" },
  ];

  const panelPadding = isMobile ? '4px 6px' : '18px';
  const rowPadding = isMobile ? '2px 0' : '13px 0';

  return (
    <Layout role="manager" active="Dashboard">
      <Crumbs items={["Dashboard"]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '6px' : '24px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '18px' : '28px', marginBottom: '2px' }}>Manager Dashboard</h1>
          <p className="subtitle" style={{ fontSize: isMobile ? '13px' : '16px', marginBottom: 0 }}>
            Welcome back, {managerName}! Here's an overview of your team's campaign progress.
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing} size={isMobile ? 'small' : 'medium'}>
          <RefreshCw size={isMobile ? 14 : 17} /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats – horizontally scrollable on mobile */}
      <div className="scroll-x" style={{ display: 'flex', gap: isMobile ? '8px' : '16px', padding: '4px 0 10px' }}>
        {statsConfig.map((stat) => (
          <div
            key={stat.title}
            className={`stat ${stat.tone}`}
            style={{
              flex: isMobile ? '0 0 120px' : '0 0 160px',
              cursor: stat.route ? 'pointer' : 'default',
              padding: isMobile ? '8px 6px' : '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              scrollSnapAlign: 'start',
              border: '1px solid #dbe5f6',
              borderRadius: '14px',
              background: 'white',
            }}
            onClick={() => stat.route && navigate(stat.route)}
          >
            <p style={{ fontSize: isMobile ? '9px' : '13px', margin: '0 0 2px 0', fontWeight: 600 }}>{stat.title}</p>
            <h3 style={{ fontSize: isMobile ? '18px' : '28px', fontWeight: 700, margin: '0' }}>{stat.value}</h3>
            {stat.route && (
              <div style={{ fontSize: isMobile ? '8px' : '12px', color: '#2563eb', marginTop: '2px', fontWeight: 600 }}>
                View all →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two‑column grid – stacks on mobile */}
      <div
        className="dashboard-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '4px' : '20px',
          width: '100%',
          marginTop: isMobile ? '0' : '8px',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <FunnelPanel funnel={dashboard.funnel} />
        </div>

        <div style={{ overflow: 'hidden' }}>
          <Panel title="MR-wise Performance" action="View All" onActionClick={handleViewAllMRs} style={{ padding: panelPadding }}>
            <div style={{ overflowX: 'auto', padding: '4px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '400px' : '500px', fontSize: isMobile ? '11px' : '14px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: isMobile ? '6px 8px' : '12px', textAlign: 'left' }}>MR Name</th>
                    <th style={{ padding: isMobile ? '6px 8px' : '12px', textAlign: 'left' }}>Total</th>
                    <th style={{ padding: isMobile ? '6px 8px' : '12px', textAlign: 'left' }}>Approved</th>
                    <th style={{ padding: isMobile ? '6px 8px' : '12px', textAlign: 'left' }}>Input</th>
                    <th style={{ padding: isMobile ? '6px 8px' : '12px', textAlign: 'left' }}>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.mrPerformance?.map((mr, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: isMobile ? '6px 8px' : '12px' }}>{mr.mrName}</td>
                      <td style={{ padding: isMobile ? '6px 8px' : '12px' }}>{mr.totalDoctors || 0}</td>
                      <td style={{ padding: isMobile ? '6px 8px' : '12px' }}>{mr.approvedDoctors || 0} ({mr.approvedPercentage || 0}%)</td>
                      <td style={{ padding: isMobile ? '6px 8px' : '12px' }}>{mr.inputGivenDoctors || 0} ({mr.inputGivenPercentage || 0}%)</td>
                      <td style={{ padding: isMobile ? '6px 8px' : '12px' }}><Badge tone="red" compact={isMobile}>{mr.pendingDoctors || 0}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>

      {/* Pending Actions + Recent Activity – second row */}
      <div
        className="dashboard-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '4px' : '20px',
          width: '100%',
          marginTop: isMobile ? '4px' : '16px',
        }}
      >
        <Panel title="Pending Actions (Requires Your Attention)" style={{ padding: panelPadding }}>
          <ListLine
            icon={Clock3}
            title="Doctors awaiting approval"
            sub="Submitted by MRs pending your approval"
            value={dashboard.pendingApprovals || 0}
            onClick={handleViewPendingApprovals}
            clickable={(dashboard.pendingApprovals || 0) > 0}
            style={{ padding: rowPadding }}
          />
          <ListLine
            icon={CalendarDays}
            title="Calendars pending freeze"
            sub="Selected but not frozen by MR"
            value={dashboard.pendingFreeze || 0}
            onClick={() => navigate("/manager/calendar-designs")}
            clickable={(dashboard.pendingFreeze || 0) > 0}
            style={{ padding: rowPadding }}
          />
          <ListLine
            icon={Hand}
            title="Input given pending"
            sub="Frozen calendars not marked input"
            value={dashboard.inputGivenPending || 0}
            onClick={() => navigate("/input-given")}
            clickable={(dashboard.inputGivenPending || 0) > 0}
            style={{ padding: rowPadding }}
          />
        </Panel>

        <Panel title="Recent Activity" action="View All" onActionClick={handleViewAllActivities} style={{ padding: panelPadding }}>
          {dashboard.recentActivities && dashboard.recentActivities.length > 0 ? (
            dashboard.recentActivities.map((activity, index) => {
              let title = "Activity performed";
              let status = "Completed";
              let time = activity.createdAt || new Date();
              if (activity.action) title = activity.action;
              if (activity.doctor?.doctorName) title = `${activity.doctor.doctorName} - ${activity.action || 'Activity'}`;
              if (activity.description) title = activity.description;
              if (activity.status) status = activity.status;
              return (
                <ManagerActivity
                  key={activity._id || index}
                  title={title}
                  status={status}
                  time={time}
                  compact={isMobile}
                />
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: isMobile ? '12px' : '40px', color: '#999', fontSize: isMobile ? '12px' : '14px' }}>
              No recent activities
            </div>
          )}
        </Panel>
      </div>

      {/* Recent Doctors Section */}
      {dashboard.recentDoctors && dashboard.recentDoctors.length > 0 && (
        <Panel title="Recently Added Doctors" action="View All" style={{ padding: panelPadding, marginTop: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: isMobile ? '6px' : '16px' }}>
            {dashboard.recentDoctors.map((doctor) => (
              <div
                key={doctor._id}
                style={{
                  padding: isMobile ? '6px 8px' : '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleViewDoctor(doctor._id)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0', fontSize: isMobile ? '12px' : '16px' }}>{doctor.doctorName}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: isMobile ? '10px' : '12px', color: '#666' }}>{doctor.speciality}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: isMobile ? '9px' : '12px', color: '#999' }}>
                      Added: {new Date(doctor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge tone={doctor.approvalStatus === "approved" ? "green" : "orange"} compact={isMobile}>
                    {doctor.approvalStatus === "approved" ? "Approved" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid {
            gap: 2px !important;
          }
          .panel {
            padding: 4px 6px !important;
            margin: 0 !important;
            border-radius: 8px !important;
          }
          .panelHead h3 {
            font-size: 12px !important;
          }
          .panelHead button {
            background: #2563eb !important;
            color: white !important;
            border: none !important;
            padding: 2px 10px !important;
            border-radius: 12px !important;
            font-size: 9px !important;
            min-height: 20px !important;
          }
          .listline {
            padding: 2px 0 !important;
          }
          .listline b {
            font-size: 10px !important;
          }
          .listline span {
            font-size: 8px !important;
          }
          .listline > strong {
            font-size: 14px !important;
          }
          .stat {
            padding: 6px 4px !important;
          }
          .stat p {
            font-size: 8px !important;
          }
          .stat h3 {
            font-size: 16px !important;
          }
          .scroll-x {
            gap: 4px !important;
            padding: 2px 0 !important;
          }
          .doctorAct {
            padding: 2px 0 !important;
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
          .doctorAct .badge {
            font-size: 7px !important;
            padding: 1px 4px !important;
          }
        }
      `}</style>
    </Layout>
  );
}