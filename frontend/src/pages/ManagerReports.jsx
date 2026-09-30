import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Users, UserCheck, Clock3, CalendarDays, AlertCircle, CheckCircle2, Filter, ChevronDown } from "lucide-react";
import Layout from "../components/Layout";
import { Badge, Button, Crumbs } from "../components/UIComponents";
import {
  getFLMDashboard,
  getSLMDashboard,
  getTLMDashboard,
  getFLMDoctors,
  getSLMDoctors,
  getTLMDoctors,
} from "../api/managerAPI";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const getDaysPending = (date) => {
  if (!date) return 0;
  const created = new Date(date);
  if (Number.isNaN(created.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000));
};

const getDelayStatus = (days) => {
  if (days > 7) return { label: "Overdue", tone: "red" };
  if (days > 3) return { label: "Delayed", tone: "orange" };
  return { label: "Normal", tone: "green" };
};

export default function ManagerReports() {
  const [dashboard, setDashboard] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [mrFilter, setMrFilter] = useState("all");

  const fetchReport = async () => {
    try {
      setRefreshing(true);
      const user = getUser();

      let dashboardData = null;
      let doctorData = null;

      if (user.role === "flm" && user.flmId) {
        [dashboardData, doctorData] = await Promise.all([
          getFLMDashboard(user.flmId),
          getFLMDoctors(user.flmId),
        ]);
      } else if (user.role === "slm" && user.slmId) {
        [dashboardData, doctorData] = await Promise.all([
          getSLMDashboard(user.slmId),
          getSLMDoctors(user.slmId),
        ]);
      } else if (user.role === "tlm" && user.tlmId) {
        [dashboardData, doctorData] = await Promise.all([
          getTLMDashboard(user.tlmId),
          getTLMDoctors(user.tlmId),
        ]);
      }

      setDashboard(dashboardData || null);
      setDoctors(doctorData?.doctors || []);
    } catch (error) {
      console.error("Error loading manager reports:", error);
      setDashboard(null);
      setDoctors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const summary = useMemo(() => {
    const d = dashboard || {};
    const totalDoctors = d.totalDoctors || 0;
    const pendingApprovals = d.pendingApprovals || 0;
    const pendingFreeze = d.pendingFreeze || 0;
    const inputGivenPending = d.inputGivenPending || 0;
    const approved = d.approvedDoctors || 0;
    const frozen = d.funnel?.frozen || 0;
    const rejected = d.rejectedDoctors || 0;

    const delayed = doctors.filter((doctor) => {
      const days = getDaysPending(doctor.createdAt);
      return doctor.approvalStatus === "pending" && days > 3;
    }).length;

    const overdue = doctors.filter((doctor) => {
      const days = getDaysPending(doctor.createdAt);
      return doctor.approvalStatus === "pending" && days > 7;
    }).length;

    return {
      totalMRs: d.totalMRs || 0,
      totalDoctors,
      approved,
      pendingApprovals,
      pendingFreeze,
      inputGivenPending,
      rejected,
      frozen,
      delayed,
      overdue,
      normalPending: Math.max(0, pendingApprovals - delayed),
      approvalPercent: totalDoctors ? Math.round((approved / totalDoctors) * 100) : 0,
      frozenPercent: totalDoctors ? Math.round((frozen / totalDoctors) * 100) : 0,
    };
  }, [dashboard, doctors]);

  const mrOptions = useMemo(() => {
    const names = (dashboard?.mrPerformance || [])
      .map((mr) => mr.mrName)
      .filter(Boolean);
    return [...new Set(names)];
  }, [dashboard]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const mrName = doctor.mr?.mrName || "N/A";
      const days = getDaysPending(doctor.createdAt);

      const status =
        doctor.approvalStatus === "approved"
          ? "approved"
          : doctor.approvalStatus === "rejected"
            ? "rejected"
            : days > 7
              ? "overdue"
              : days > 3
                ? "delayed"
                : "pending";

      return (
        (statusFilter === "all" || status === statusFilter) &&
        (mrFilter === "all" || mrName === mrFilter)
      );
    });
  }, [doctors, statusFilter, mrFilter]);

  if (loading) {
    return (
      <Layout role="manager" active="Reports">
        <Crumbs items={["Reports", "Manager Reports"]} />
        <div className="manager-report-loading">
          <RefreshCw size={30} className="spin" />
          <h3>Loading manager reports</h3>
          <p>Preparing team, doctor and calendar data...</p>
        </div>
        <style>{reportStyles}</style>
      </Layout>
    );
  }

  if (!dashboard) {
    return (
      <Layout role="manager" active="Reports">
        <Crumbs items={["Reports", "Manager Reports"]} />
        <div className="manager-report-empty">
          <AlertCircle size={34} />
          <h3>Report data could not be loaded</h3>
          <p>Refresh the page or try again.</p>
          <Button onClick={fetchReport}>
            <RefreshCw size={16} /> Retry
          </Button>
        </div>
        <style>{reportStyles}</style>
      </Layout>
    );
  }

  return (
    <Layout role="manager" active="Reports">
      <div className="manager-reports-page">
        <Crumbs items={["Reports", "Manager Reports"]} />

        <section className="reports-header">
          <div>
            <div className="reports-eyebrow"><Users size={14} /> Manager Analytics</div>
            <h1>Manager Reports</h1>
            <p>Monitor your team, doctors, approvals, calendars and pending work.</p>
          </div>
          <Button variant="outline" onClick={fetchReport} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </section>

        <section className="summary-grid">
          <SummaryCard icon={Users} title="Total MRs" value={summary.totalMRs} tone="blue" />
          <SummaryCard icon={UserCheck} title="Total Doctors" value={summary.totalDoctors} tone="purple" />
          <SummaryCard icon={Clock3} title="Pending Approvals" value={summary.pendingApprovals} tone="orange" />
          <SummaryCard icon={AlertCircle} title="Delayed" value={summary.delayed} tone="red" />
          <SummaryCard icon={CheckCircle2} title="Approved Doctors" value={summary.approved} tone="green" />
        </section>

        <section className="report-grid-two">
          <ReportCard title="Doctor & Approval Status" icon={UserCheck}>
            <div className="status-list">
              <StatusRow label="Approved" value={summary.approved} total={summary.totalDoctors} />
              <StatusRow label="Pending Approval" value={summary.pendingApprovals} total={summary.totalDoctors} />
              <StatusRow label="Rejected" value={summary.rejected} total={summary.totalDoctors} />
            </div>
          </ReportCard>

          <ReportCard title="Calendar Progress" icon={CalendarDays}>
            <div className="status-list">
              <StatusRow label="Calendars Frozen" value={summary.frozen} total={summary.totalDoctors} />
              <StatusRow label="Pending Freeze" value={summary.pendingFreeze} total={summary.totalDoctors} />
              <StatusRow label="Input Given Pending" value={summary.inputGivenPending} total={summary.totalDoctors} />
            </div>
          </ReportCard>
        </section>

        <ReportCard
          title="MR Performance"
          subtitle={`${mrOptions.length} MRs in your accessible team`}
          icon={Users}
        >
          <div className="table-scroll">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>MR</th>
                  <th>Doctors</th>
                  <th>Approved</th>
                  <th>Input Given</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard.mrPerformance || []).map((mr, index) => (
                  <tr key={`${mr.mrName || "mr"}-${index}`}>
                    <td><strong>{mr.mrName || "N/A"}</strong></td>
                    <td>{mr.totalDoctors || 0}</td>
                    <td>
                      <div className="metric-cell">
                        <span>{mr.approvedDoctors || 0} ({mr.approvedPercentage || 0}%)</span>
                        <div className="bar"><i style={{ width: `${Math.min(100, mr.approvedPercentage || 0)}%` }} /></div>
                      </div>
                    </td>
                    <td>
                      <div className="metric-cell">
                        <span>{mr.inputGivenDoctors || 0} ({mr.inputGivenPercentage || 0}%)</span>
                        <div className="bar purple"><i style={{ width: `${Math.min(100, mr.inputGivenPercentage || 0)}%` }} /></div>
                      </div>
                    </td>
                    <td><Badge tone={(mr.pendingDoctors || 0) > 5 ? "red" : "orange"}>{mr.pendingDoctors || 0}</Badge></td>
                  </tr>
                ))}
                {(!dashboard.mrPerformance || dashboard.mrPerformance.length === 0) && (
                  <tr><td colSpan="5" className="empty-cell">No MR data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ReportCard>

        <ReportCard
          title="Delay Report"
          subtitle={`${filteredDoctors.length} records`}
          icon={Clock3}
          action={
            <div className="filters">
              <div className="select-wrap">
                <Filter size={14} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="pending">Normal Pending</option>
                  <option value="delayed">Delayed (3-7 days)</option>
                  <option value="overdue">Overdue (&gt;7 days)</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown size={14} />
              </div>
              <div className="select-wrap">
                <Users size={14} />
                <select value={mrFilter} onChange={(e) => setMrFilter(e.target.value)}>
                  <option value="all">All MRs</option>
                  {mrOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          }
        >
          <div className="table-scroll">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Speciality</th>
                  <th>MR</th>
                  <th>Created</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.slice(0, 50).map((doctor) => {
                  const days = getDaysPending(doctor.createdAt);
                  const delay = getDelayStatus(days);
                  const status = doctor.approvalStatus === "approved"
                    ? { label: "Approved", tone: "green" }
                    : doctor.approvalStatus === "rejected"
                      ? { label: "Rejected", tone: "red" }
                      : delay;

                  return (
                    <tr key={doctor._id}>
                      <td><strong>{doctor.doctorName || "N/A"}</strong></td>
                      <td>{doctor.speciality || "N/A"}</td>
                      <td>{doctor.mr?.mrName || "N/A"}</td>
                      <td>{doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td>{days}</td>
                      <td><Badge tone={status.tone}>{status.label}</Badge></td>
                    </tr>
                  );
                })}
                {filteredDoctors.length === 0 && (
                  <tr><td colSpan="6" className="empty-cell">No records match the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredDoctors.length > 50 && (
            <p className="table-note">Showing the first 50 records. Use the filters to narrow the report.</p>
          )}
        </ReportCard>
      </div>

      <style>{reportStyles}</style>
    </Layout>
  );
}

function SummaryCard({ icon: Icon, title, value, tone }) {
  return (
    <div className={`summary-card tone-${tone}`}>
      <div className="summary-icon"><Icon size={21} /></div>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusRow({ label, value, total }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="status-row">
      <div><span>{label}</span><strong>{value}</strong></div>
      <div className="bar"><i style={{ width: `${Math.min(100, percent)}%` }} /></div>
    </div>
  );
}

function ReportCard({ title, subtitle, icon: Icon, children, action }) {
  return (
    <section className="report-card">
      <div className="report-card-head">
        <div className="report-card-title">
          <div className="report-card-icon"><Icon size={17} /></div>
          <div><h2>{title}</h2>{subtitle && <span>{subtitle}</span>}</div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const reportStyles = `
.manager-reports-page { width:100%; padding-bottom:30px; color:#111827; }
.reports-header { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:24px 26px; margin:8px 0 20px; border:1px solid #e5e7eb; border-radius:20px; background:linear-gradient(135deg,#fff,#f8fbff); box-shadow:0 8px 26px rgba(15,23,42,.05); }
.reports-eyebrow { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; background:#eff6ff; color:#2563eb; font-size:11px; font-weight:700; }
.reports-header h1 { margin:10px 0 5px; font-size:30px; letter-spacing:-.7px; }
.reports-header p { margin:0; color:#6b7280; font-size:14px; }
.summary-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:16px; margin-bottom:20px; }
.summary-card { position:relative; min-height:145px; padding:20px; border:1px solid #e5e7eb; border-radius:18px; background:#fff; box-shadow:0 6px 20px rgba(15,23,42,.05); overflow:hidden; }
.summary-card::before { content:""; position:absolute; left:0; right:0; top:0; height:3px; background:currentColor; opacity:.85; }
.summary-icon { width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:13px; margin-bottom:16px; background:rgba(37,99,235,.08); color:currentColor; }
.summary-card span { display:block; color:#6b7280; font-size:13px; font-weight:600; }
.summary-card strong { display:block; margin-top:5px; font-size:30px; letter-spacing:-.6px; }
.tone-blue { color:#2563eb; } .tone-purple { color:#7c3aed; } .tone-orange { color:#d97706; } .tone-red { color:#dc2626; } .tone-green { color:#059669; }
.report-grid-two { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
.report-card { margin-bottom:20px; border:1px solid #e5e7eb; border-radius:18px; background:#fff; box-shadow:0 6px 20px rgba(15,23,42,.045); overflow:hidden; }
.report-card-head { display:flex; align-items:center; justify-content:space-between; gap:15px; padding:18px 20px; border-bottom:1px solid #eef2f7; }
.report-card-title { display:flex; align-items:center; gap:11px; }
.report-card-icon { width:38px; height:38px; display:flex; align-items:center; justify-content:center; border-radius:11px; background:#eff6ff; color:#2563eb; }
.report-card-title h2 { margin:0 0 3px; font-size:16px; }
.report-card-title span { color:#9ca3af; font-size:11px; }
.status-list { padding:18px 20px; }
.status-row { margin-bottom:17px; }
.status-row:last-child { margin-bottom:0; }
.status-row > div:first-child { display:flex; justify-content:space-between; margin-bottom:7px; font-size:13px; }
.status-row span { color:#6b7280; } .status-row strong { color:#111827; }
.bar { height:7px; border-radius:999px; background:#eef2f7; overflow:hidden; }
.bar i { display:block; height:100%; border-radius:inherit; background:#2563eb; }
.bar.purple i { background:#7c3aed; }
.table-scroll { overflow-x:auto; }
.reports-table { width:100%; min-width:760px; border-collapse:collapse; }
.reports-table th { padding:13px 18px; text-align:left; background:#f8fafc; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:.3px; }
.reports-table td { padding:14px 18px; border-top:1px solid #f1f5f9; font-size:13px; color:#475569; vertical-align:middle; }
.reports-table tbody tr:hover { background:#f8fbff; }
.metric-cell { min-width:145px; }
.metric-cell span { display:block; margin-bottom:6px; font-size:12px; color:#475569; }
.metric-cell .bar { height:6px; }
.filters { display:flex; gap:8px; flex-wrap:wrap; }
.select-wrap { display:flex; align-items:center; gap:7px; padding:0 10px; height:38px; border:1px solid #dbe3ef; border-radius:9px; color:#64748b; background:#fff; }
.select-wrap select { border:0; outline:0; color:#334155; background:#fff; font-size:12px; min-width:125px; }
.empty-cell { text-align:center !important; padding:35px !important; color:#9ca3af !important; }
.table-note { margin:0; padding:10px 18px 16px; color:#94a3b8; font-size:11px; }
.manager-report-loading,.manager-report-empty { min-height:55vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#64748b; }
.manager-report-loading h3,.manager-report-empty h3 { margin:14px 0 5px; color:#111827; }
.manager-report-loading p,.manager-report-empty p { margin:0 0 16px; font-size:13px; }
.spin { animation:reportSpin .9s linear infinite; } @keyframes reportSpin { to { transform:rotate(360deg); } }
@media(max-width:1100px){ .summary-grid{grid-template-columns:repeat(3,1fr);} }
@media(max-width:760px){ .reports-header{align-items:flex-start; padding:18px;} .reports-header h1{font-size:24px;} .summary-grid{grid-template-columns:repeat(2,1fr);gap:10px;} .report-grid-two{grid-template-columns:1fr;gap:0;} .summary-card{min-height:125px;padding:15px;} .summary-card strong{font-size:26px;} .report-card-head{align-items:flex-start; flex-direction:column;} .filters{width:100%;} .select-wrap{flex:1;} .select-wrap select{min-width:0;width:100%;} }
@media(max-width:460px){ .summary-grid{grid-template-columns:1fr 1fr;} .reports-header{flex-direction:column;} .reports-header button{width:100%;} }
`;

