import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { Send, CheckCircle2, Clock3, XCircle, Download, Eye, Edit, MoreVertical, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import {
  StatCard,
  Badge,
  Button,
  Toolbar,
  DataTable,
  Crumbs,
} from "../components/UIComponents";
import { getSubmittedDoctors } from "../api/doctorAPI";

// 3 Dots Dropdown Menu Component (unchanged)
function MoreActionsMenu({ onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="more-actions-menu" ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          color: '#6b7280'
        }}
        title="More Actions"
      >
        <MoreVertical size={18} />
      </button>
      
      {isOpen && (
        <div
          className="dropdown-menu"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '140px',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              color: '#ef4444'
            }}
          >
            <Trash2 size={14} />
            Delete Doctor
          </button>
        </div>
      )}
      
      <style>{`
        .more-actions-menu button:hover {
          background-color: #f3f4f6;
        }
        .dropdown-menu button:hover {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
}

export default function SubmittedDoctors() {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const data = await getSubmittedDoctors(user.mrId);
        setDoctorData(data.doctors || []);
        setFilteredData(data.doctors || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Filter logic (unchanged)
  useEffect(() => {
    let result = doctorData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.doctorName?.toLowerCase().includes(term) ||
        d.speciality?.toLowerCase().includes(term) ||
        d.mclCode?.toLowerCase().includes(term)
      );
    }
    if (statusFilter) {
      result = result.filter(d => d.approvalStatus === statusFilter);
    }
    if (specialtyFilter) {
      result = result.filter(d => d.speciality === specialtyFilter);
    }
    if (dateFilter === "Today") {
      const today = new Date().toDateString();
      result = result.filter(d => new Date(d.createdAt).toDateString() === today);
    } else if (dateFilter === "Last 7 Days") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter(d => new Date(d.createdAt) >= weekAgo);
    } else if (dateFilter === "This Month") {
      const now = new Date();
      result = result.filter(d => {
        const date = new Date(d.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
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

  const handleEdit = (doctorId) => {
    navigate(`/edit-doctor/${doctorId}`);
  };
  
  const handleView = (doctorId) => {
    navigate(`/doctor-details/${doctorId}`);
  };
  
  const handleDelete = async (doctorId, doctorName) => {
    if (window.confirm(`Are you sure you want to delete ${doctorName}?`)) {
      try {
        // Add your delete API call here
        alert("Delete functionality - Add your API call");
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("Failed to delete doctor");
      }
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Layout active="My Doctors">
      <Crumbs items={["My Doctors", "Submitted Doctors"]} />
      <div className="pageHead">
        <div>
          <h1>Submitted Doctors</h1>
          <p className="subtitle">
            Below are the doctors you've submitted for approval.
          </p>
        </div>
        {/* <Button variant="outline" icon={Download}>
          Export
        </Button> */}
      </div>

      <div className="grid cards4">
        <StatCard
          title="Total Submitted"
          value={filteredData.length}
          icon={Send}
          tone="purple"
        />
        <StatCard
          title="Pending Approval"
          value={filteredData.filter((doctor) => doctor.approvalStatus === "pending").length}
          icon={Clock3}
          tone="orange"
        />
        <StatCard
          title="Approved"
          value={filteredData.filter((doctor) => doctor.approvalStatus === "approved").length}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          title="Rejected / Returned"
          value={filteredData.filter((doctor) => doctor.approvalStatus === "rejected").length}
          icon={XCircle}
          tone="red"
        />
      </div>

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
        statusOptions={["pending", "approved", "rejected"]}
        specialtyOptions={["Cardiology", "Dermatology", "Paediatrics", "Orthopedics", "General Physician"]}
      />

      {/* ✅ Horizontal scroll wrapper for all fields */}
      <div style={{ overflowX: "auto", width: "100%", marginTop: "16px" }}>
        <div style={{ minWidth: "1800px", width: "max-content" }}>
          <DataTable
            headers={[
              "Doctor Name",
              "Speciality",
              "MCL Code",
              "Clinic",
              "City",
              "Area",
              "Email",
              "Mobile",
              "Brand",
              "Current Business",
              "Expected Business",
              "Brand Focus",           
              "Other Activities",
              "Submitted On",
              "Modified Date",
              "Status",
              "Submitted By",
              "Actions",
            ]}
            rows={filteredData.map((doctor, i) => [
              doctor.doctorName,
              doctor.speciality,
              doctor.mclCode,
              doctor.clinicName || "-",
              doctor.city || "-",
              doctor.area || "-",
              doctor.email || "-",
              doctor.mobile || "-",
              doctor.brand || "-",
              doctor.currentBusiness || "0",
              doctor.expectedBusiness || "0",
              doctor.brandFocus || "-",
              doctor.otherActivities || "-",
              new Date(doctor.createdAt).toLocaleDateString(),
              doctor.updatedAt
                ? new Date(doctor.updatedAt).toLocaleDateString()
                : new Date(doctor.createdAt).toLocaleDateString(),
              doctor.approvalStatus === "approved" ? (
                <Badge tone="green">Approved</Badge>
              ) : doctor.approvalStatus === "rejected" ? (
                <Badge tone="red">Rejected / Returned</Badge>
              ) : (
                <Badge tone="orange">Pending Approval</Badge>
              ),
              "MR",
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} key={i}>
                {/* Eye Icon - View */}
                <button
                  onClick={() => handleView(doctor._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: '#3b82f6'
                  }}
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                
                {/* Edit Icon - Only for pending approval */}
                {doctor.approvalStatus === "pending" && (
                  <button
                    onClick={() => handleEdit(doctor._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: '#10b981'
                    }}
                    title="Edit Doctor"
                  >
                    <Edit size={18} />
                  </button>
                )}
                
                {/* 3 Dots - More Actions (only for pending approval) */}
                {doctor.approvalStatus === "pending" && (
                  <MoreActionsMenu onDelete={() => handleDelete(doctor._id, doctor.doctorName)} />
                )}
              </div>,
            ])}
          />
        </div>
      </div>

      {/* CSS to prevent text wrapping in table cells */}
      <style>{`
        .dataTable th,
        .dataTable td {
          white-space: nowrap;
          padding: 10px 14px;
          vertical-align: middle;
        }
        .dataTable table {
          width: auto !important;
          min-width: 100%;
        }
      `}</style>
    </Layout>
  );
}