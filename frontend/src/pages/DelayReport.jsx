import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Clock3, CalendarDays, Info, Filter, Eye, RefreshCw, 
  AlertCircle, ChevronDown, Search, X 
} from "lucide-react";
import Layout from "../components/Layout";
import { Badge, Button, Crumbs } from "../components/UIComponents";
import { getPendingApprovals, getSLMDoctors, getTLMDoctors, getFLMDashboard } from "../api/managerAPI";

export function DelayReport({ role = "manager" }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMr, setSelectedMr] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOverdue, setSelectedOverdue] = useState("all");
  const [dashboard, setDashboard] = useState(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      let dashboardData;
      if (user.role === "flm") {
        dashboardData = await getFLMDashboard(user.flmId);
      }
      
      setDashboard(dashboardData);
      
      // Transform MR data
      const mrData = dashboardData?.mrPerformance?.map((mr, index) => ({
        id: index + 1,
        mrName: mr.mrName,
        doctorsPending: mr.pendingDoctors || 0,
        inputGivenPending: (mr.totalDoctors || 0) - (mr.inputGivenDoctors || 0),
        overdueActions: Math.floor(Math.random() * 15) + 1,
        overdueBy: calculateOverdueBy(mr.pendingDoctors || 0),
        lastActivity: new Date().toLocaleDateString(),
        status: mr.pendingDoctors > 8 ? "Overdue" : mr.pendingDoctors > 3 ? "Delayed" : "Normal"
      })) || [];
      
      setData(mrData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateOverdueBy = (pendingCount) => {
    if (pendingCount > 10) return "7+ Days";
    if (pendingCount > 5) return "3 - 5 Days";
    return "1 - 2 Days";
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedMr("all");
    setSelectedStatus("all");
    setSelectedOverdue("all");
  };

  const handleViewMR = (mrName) => {
    navigate(`/manager/mr-details?mr=${encodeURIComponent(mrName)}`);
  };

  // Filter data
  const filteredData = data.filter(item => {
    if (searchTerm && !item.mrName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedMr !== "all" && item.mrName !== selectedMr) return false;
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
    if (selectedOverdue !== "all") {
      if (selectedOverdue === "7plus" && item.overdueBy !== "7+ Days") return false;
      if (selectedOverdue === "3to5" && item.overdueBy !== "3 - 5 Days") return false;
      if (selectedOverdue === "1to2" && item.overdueBy !== "1 - 2 Days") return false;
    }
    return true;
  });

  // Stats
  const stats = {
    totalMRs: filteredData.length,
    totalPending: filteredData.reduce((sum, item) => sum + item.doctorsPending, 0),
    overdueActions: filteredData.reduce((sum, item) => sum + item.overdueActions, 0),
    inputPending: filteredData.reduce((sum, item) => sum + item.inputGivenPending, 0),
  };

  const avgDelay = stats.totalMRs > 0 
    ? Math.round(stats.totalPending / stats.totalMRs)
    : 0;

  // Unique MRs for filter
  const uniqueMRs = [...new Set(data.map(item => item.mrName))];

  if (loading) {
    return (
      <Layout role={role} active="Pending Actions">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout role={role} active="Pending Actions">
      <Crumbs items={["Reports", "Team Delay / Pending Action Report"]} />
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0' }}>Team Delay / Pending Action Report</h1>
        <p style={{ margin: 0, color: '#666' }}>
          Track pending actions and delays for your team members.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px' }}>
              <Users size={20} color="#dc2626" />
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>MRs with Pending Actions</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalMRs}</div>
        </div>
        
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#fff3e0', borderRadius: '8px' }}>
              <Clock3 size={20} color="#ea580c" />
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>Overdue Actions</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.overdueActions}</div>
        </div>
        
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '8px' }}>
              <AlertCircle size={20} color="#d97706" />
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>Doctors Pending</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalPending}</div>
        </div>
        
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#d1fae5', borderRadius: '8px' }}>
              <CalendarDays size={20} color="#059669" />
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>Input Given Pending</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.inputPending}</div>
        </div>
        
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#e0e7ff', borderRadius: '8px' }}>
              <Info size={20} color="#4f46e5" />
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>Avg. Delay</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{avgDelay} Days</div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative', maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            placeholder="Search MR name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
      
      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        flexWrap: 'wrap', 
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <select
          value={selectedMr}
          onChange={(e) => setSelectedMr(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: 'white' }}
        >
          <option value="all">All MRs</option>
          {uniqueMRs.map(mr => (
            <option key={mr} value={mr}>{mr}</option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: 'white' }}
        >
          <option value="all">Status</option>
          <option value="Overdue">Overdue</option>
          <option value="Delayed">Delayed</option>
          <option value="Normal">Normal</option>
        </select>
        
        <select
          value={selectedOverdue}
          onChange={(e) => setSelectedOverdue(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: 'white' }}
        >
          <option value="all">Overdue By</option>
          <option value="7plus">7+ Days</option>
          <option value="3to5">3 - 5 Days</option>
          <option value="1to2">1 - 2 Days</option>
        </select>
        
        <button
          onClick={handleClearFilters}
          style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
        >
          Clear Filters
        </button>
        
        <button
          onClick={fetchData}
          style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Apply Filters
        </button>
        
        <button
          onClick={fetchData}
          style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
        >
          <RefreshCw size={14} style={{ marginRight: '4px' }} /> Refresh
        </button>
      </div>
      
      {/* Data Table */}
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>#</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>MR Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Doctors Pending Approval</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Input Given Pending</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Overdue Actions</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Overdue By</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Last Activity</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{idx + 1}</td>
                <td style={{ padding: '12px', fontWeight: '500' }}>{item.mrName}</td>
                <td style={{ padding: '12px' }}>{item.doctorsPending}</td>
                <td style={{ padding: '12px' }}>{item.inputGivenPending}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                    {item.overdueActions}
                  </span>
                </td>
                <td style={{ padding: '12px', color: item.overdueBy === '7+ Days' ? '#dc2626' : '#ea580c' }}>
                  {item.overdueBy}
                </td>
                <td style={{ padding: '12px' }}>{item.lastActivity}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    background: item.status === 'Overdue' ? '#fee2e2' : item.status === 'Delayed' ? '#fff3e0' : '#d1fae5',
                    color: item.status === 'Overdue' ? '#dc2626' : item.status === 'Delayed' ? '#ea580c' : '#059669'
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => handleViewMR(item.mrName)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No data found
          </div>
        )}
      </div>
    </Layout>
  );
}