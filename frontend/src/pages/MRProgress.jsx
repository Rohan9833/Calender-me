// pages/MRProgress.jsx
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, CheckCircle2, CalendarDays, Clock3, Filter, Eye, Info, RefreshCw, AlertCircle } from "lucide-react";
import Layout from "../components/Layout";
import { StatCard, Badge, Button, SelectBox, DataTable, Crumbs, ProgressBar } from "../components/UIComponents";
import { getFLMDashboard, getSLMDashboard, getTLMDashboard, getPendingApprovals } from "../api/managerAPI";

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

// ─── MR Progress Component – Polished UI ──────────────────
export function MRProgress() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
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
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <Layout role="manager" active="Reports">
        <Crumbs items={["Reports", "MR-wise Progress"]} />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading MR progress data...</div>
      </Layout>
    );
  }

  if (!dashboard) {
    return (
      <Layout role="manager" active="Reports">
        <Crumbs items={["Reports", "MR-wise Progress"]} />
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <h3>Failed to load data</h3>
          <Button onClick={handleRefresh} variant="primary">Retry</Button>
        </div>
      </Layout>
    );
  }

  const totalDoctors = dashboard.totalDoctors || 0;
  const approvedDoctors = dashboard.approvedDoctors || 0;
  const inputGiven = dashboard.inputGiven || 0;
  const pendingActions = dashboard.pendingActions || 0;
  const totalMRs = dashboard.totalMRs || 0;

  // Stats configuration – each stat will be displayed as a centered card with icon
  const statsData = [
    { title: "Total MRs", value: totalMRs, icon: Users, tone: "purple" },
    { title: "Doctors Registered", value: totalDoctors, icon: UserPlus, tone: "blue" },
    { title: "Approved Doctors", value: approvedDoctors, icon: CheckCircle2, tone: "green" },
    { title: "Input Given", value: inputGiven, icon: CalendarDays, tone: "orange" },
    { title: "Pending Actions", value: pendingActions, icon: Clock3, tone: "orange" },
  ];

  // Styling for centered stat cards (same as DelayReport)
  const statCardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: isMobile ? '16px 10px' : '24px 16px',
    borderRadius: '16px',
    background: 'white',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    flex: isMobile ? '0 0 140px' : '0 0 180px',
    scrollSnapAlign: 'start',
  };

  const statTitleStyle = {
    fontSize: isMobile ? '13px' : '16px',
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: '4px',
  };

  const statValueStyle = {
    fontSize: isMobile ? '28px' : '36px',
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
  };

  const statIconStyle = {
    color: '#2563eb',
    marginBottom: '6px',
  };

  return (
    <Layout role="manager" active="Reports">
      <Crumbs items={["Reports", "MR-wise Progress"]} />
      
      {/* Centered header */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
        <h1 style={{ fontSize: isMobile ? '24px' : '34px', fontWeight: 700, marginBottom: '8px' }}>
          MR-wise Progress
        </h1>
        <p className="subtitle" style={{ fontSize: isMobile ? '16px' : '20px', color: '#6b7280', marginBottom: 0 }}>
          Track progress of your team members for this campaign.
        </p>
      </div>
      
      {/* Refresh button – right aligned */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: isMobile ? '16px' : '24px' }}>
       
      </div>
      
      {/* Stats – horizontally scrollable on mobile, centered content */}
      <div className="scroll-x" style={{ display: 'flex', gap: isMobile ? '12px' : '20px', padding: '4px 0 16px', justifyContent: 'center' }}>
        {statsData.map((stat) => (
          <div key={stat.title} className={`stat ${stat.tone}`} style={statCardStyle}>
            <div style={statIconStyle}>
              <stat.icon size={isMobile ? 24 : 32} />
            </div>
            <p style={statTitleStyle}>{stat.title}</p>
            <h3 style={statValueStyle}>{stat.value}</h3>
          </div>
        ))}
      </div>
      
      {/* DataTable – horizontally scrollable, Action column removed */}
      <div style={{ overflowX: 'auto', width: '100%', marginTop: isMobile ? '4px' : '8px' }}>
        <DataTable
          headers={[
            "#", 
            "MR Name", 
            "Doctors Registered", 
            "Approved Doctors (%)", 
            "Input Given (%)", 
            "Pending Actions", 
            "Last Activity"
          ]}
          rows={dashboard.mrPerformance?.map((mr, i) => {
            const total = mr.totalDoctors || 0;
            const approved = mr.approvedDoctors || 0;
            const inputGivenMR = mr.inputGivenDoctors || 0;
            const approvedPercent = mr.approvedPercentage || 0;
            const inputPercent = mr.inputGivenPercentage || 0;
            const pending = mr.pendingDoctors || 0;
            
            return [
              i + 1,
              mr.mrName,
              total,
              <div key={`approved-${i}`}>
                <span>{approved} ({approvedPercent}%)</span>
                <ProgressBar value={approvedPercent} />
              </div>,
              <div key={`input-${i}`}>
                <span>{inputGivenMR} ({inputPercent}%)</span>
                <ProgressBar value={inputPercent} tone="orange" />
              </div>,
              <Badge tone={pending > 5 ? "red" : "orange"}>{pending}</Badge>,
              mr.lastActivity || new Date().toLocaleDateString()
            ];
          }) || []}
        />
      </div>

      {/* Responsive overrides – consistent with DelayReport */}
      <style>{`
        @media (max-width: 768px) {
          .scroll-x {
            gap: 8px !important;
            padding: 4px 0 !important;
            justify-content: flex-start !important; /* allow scroll */
          }
          .stat {
            padding: 12px 8px !important;
            flex: 0 0 140px !important;
          }
          .stat p {
            font-size: 12px !important;
          }
          .stat h3 {
            font-size: 24px !important;
          }
          .tableBox {
            overflow-x: auto !important;
          }
          .tableBox table {
            min-width: 700px !important;
          }
          h1 {
            font-size: 22px !important;
          }
          .subtitle {
            font-size: 14px !important;
          }
        }
      `}</style>
    </Layout>
  );
}

// ─── Delay Report Component – Polished UI ──────────────────
export function DelayReport({ role = "manager" }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOverdue, setSelectedOverdue] = useState("all");

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      let data;
      if (role === "manager") {
        if (user.role === "flm") {
          data = await getPendingApprovals(user.flmId);
        } else if (user.role === "slm") {
          data = await getSLMDoctors(user.slmId);
        } else if (user.role === "tlm") {
          data = await getTLMDoctors(user.tlmId);
        }
      }
      
      const doctorsList = data?.doctors || [];
      setDoctors(doctorsList);
      setFilteredData(doctorsList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  useEffect(() => {
    let filtered = [...doctors];
    
    if (selectedStatus !== "all") {
      filtered = filtered.filter(d => d.approvalStatus === selectedStatus);
    }
    
    if (selectedOverdue !== "all") {
      const now = new Date();
      filtered = filtered.filter(d => {
        const daysPending = Math.floor((now - new Date(d.createdAt)) / (1000 * 60 * 60 * 24));
        if (selectedOverdue === "overdue") return daysPending > 7;
        if (selectedOverdue === "delayed") return daysPending > 3 && daysPending <= 7;
        if (selectedOverdue === "normal") return daysPending <= 3;
        return true;
      });
    }
    
    setFilteredData(filtered);
  }, [selectedStatus, selectedOverdue, doctors]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    setSelectedStatus("all");
    setSelectedOverdue("all");
  };

  const handleViewDoctor = (doctorId) => {
    navigate(`/doctor-details/${doctorId}`);
  };

  // Calculate stats
  const totalPending = filteredData.length;
  const overdueActions = filteredData.filter(d => {
    const days = Math.floor((new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24));
    return days > 7;
  }).length;
  const delayedActions = filteredData.filter(d => {
    const days = Math.floor((new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24));
    return days > 3 && days <= 7;
  }).length;
  
  const avgDelay = filteredData.length > 0 
    ? Math.round(filteredData.reduce((sum, d) => {
        const days = Math.floor((new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / filteredData.length)
    : 0;

  if (loading) {
    return (
      <Layout role={role} active={role === "manager" ? "Pending Actions" : "Reports"}>
        <Crumbs items={["Reports", role === "manager" ? "Team Delay / Pending Action" : "Pending Action Report"]} />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading delay report...</div>
      </Layout>
    );
  }

  // Stat card styles – centered with larger fonts
  const statCardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: isMobile ? '16px 10px' : '24px 16px',
    borderRadius: '16px',
    background: 'white',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    flex: isMobile ? '0 0 140px' : '0 0 180px',
    scrollSnapAlign: 'start',
  };

  const statTitleStyle = {
    fontSize: isMobile ? '13px' : '16px',
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: '4px',
  };

  const statValueStyle = {
    fontSize: isMobile ? '28px' : '36px',
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
  };

  const statIconStyle = {
    color: '#2563eb',
    marginBottom: '6px',
  };

  const statsData = [
    { title: role === "manager" ? "Pending Approvals" : "Total Pending", value: totalPending, icon: Clock3, tone: "red" },
    { title: "Overdue Actions (>7 days)", value: overdueActions, icon: AlertCircle, tone: "orange" },
    { title: "Delayed Actions (3-7 days)", value: delayedActions, icon: Clock3, tone: "warning" },
    { title: "Normal Pending (<3 days)", value: totalPending - overdueActions - delayedActions, icon: CalendarDays, tone: "green" },
    { title: "Avg. Delay (Days)", value: `${avgDelay} Days`, icon: Info, tone: "purple" },
  ];

  return (
    <Layout role={role} active={role === "manager" ? "Pending Actions" : "Reports"}>
      <Crumbs items={["Reports", role === "manager" ? "Team Delay / Pending Action" : "Pending Action Report"]} />
      
      {/* Centered header */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
        <h1 style={{ fontSize: isMobile ? '24px' : '34px', fontWeight: 700, marginBottom: '8px' }}>
          {role === "manager" ? "Team Delay / Pending Action Report" : "Pending Action Report"}
        </h1>
        <p className="subtitle" style={{ fontSize: isMobile ? '16px' : '20px', color: '#6b7280', marginBottom: 0 }}>
          Track pending actions and delays for {role === "manager" ? "your team members" : "each level to ensure timely approvals"}.
        </p>
      </div>
      
      {/* Refresh button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: isMobile ? '16px' : '24px' }}>
      
      </div>
      
      {/* Stats – horizontally scrollable on mobile, centered content */}
      <div className="scroll-x" style={{ display: 'flex', gap: isMobile ? '12px' : '20px', padding: '4px 0 16px', justifyContent: 'center' }}>
        {statsData.map((stat) => (
          <div key={stat.title} className={`stat ${stat.tone}`} style={statCardStyle}>
            <div style={statIconStyle}>
              <stat.icon size={isMobile ? 24 : 32} />
            </div>
            <p style={statTitleStyle}>{stat.title}</p>
            <h3 style={statValueStyle}>{stat.value}</h3>
          </div>
        ))}
      </div>
      
      {/* Filter toolbar – stacked on mobile */}
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '20px', justifyContent: 'center' }}>
        <SelectBox 
          label="Status" 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={[
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
          ]}
          wide={isMobile}
        />
        <SelectBox 
          label="Overdue By"
          value={selectedOverdue}
          onChange={(e) => setSelectedOverdue(e.target.value)}
          options={[
            { value: "all", label: "All" },
            { value: "normal", label: "Normal (<3 days)" },
            { value: "delayed", label: "Delayed (3-7 days)" },
            { value: "overdue", label: "Overdue (>7 days)" },
          ]}
          wide={isMobile}
        />
        <Button variant="outline" icon={Filter} onClick={handleClearFilters}>
          Clear Filters
        </Button>
        <Button icon={Filter} onClick={() => fetchData()}>
          Apply Filters
        </Button>
      </div>
      
      {/* DataTable – horizontally scrollable, Action column removed */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <DataTable
          headers={[
            "#",
            "Doctor Name",
            "Speciality",
            "MCL Code",
            "Submitted By (MR)",
            "Submission Date",
            "Days Pending",
            "Status"
          ]}
          rows={filteredData.map((doctor, index) => {
            const daysPending = Math.floor((new Date() - new Date(doctor.createdAt)) / (1000 * 60 * 60 * 24));
            let statusText = "Pending";
            let statusTone = "orange";
            
            if (daysPending > 7) {
              statusText = "Overdue";
              statusTone = "red";
            } else if (daysPending > 3) {
              statusText = "Delayed";
              statusTone = "orange";
            } else {
              statusText = "Normal";
              statusTone = "green";
            }
            
            return [
              index + 1,
              doctor.doctorName,
              doctor.speciality,
              doctor.mclCode,
              doctor.mr?.mrName || "N/A",
              new Date(doctor.createdAt).toLocaleDateString(),
              <Badge tone={daysPending > 7 ? "red" : daysPending > 3 ? "orange" : "green"}>
                {daysPending} days
              </Badge>,
              <Badge tone={statusTone}>{statusText}</Badge>
            ];
          })}
        />
      </div>

      {/* Responsive overrides – enhanced styles */}
      <style>{`
        @media (max-width: 768px) {
          .scroll-x {
            gap: 8px !important;
            padding: 4px 0 !important;
            justify-content: flex-start !important; /* allow scroll */
          }
          .stat {
            padding: 12px 8px !important;
            flex: 0 0 140px !important;
          }
          .stat p {
            font-size: 12px !important;
          }
          .stat h3 {
            font-size: 24px !important;
          }
          .toolbar {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .toolbar > * {
            width: 100% !important;
          }
          .tableBox {
            overflow-x: auto !important;
          }
          .tableBox table {
            min-width: 700px !important;
          }
          h1 {
            font-size: 22px !important;
          }
          .subtitle {
            font-size: 14px !important;
          }
        }
      `}</style>
    </Layout>
  );
}