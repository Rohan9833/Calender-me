import React from "react";
import {
  Users,
  Clock3,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  ArrowLeft,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  StatCard,
  Badge,
  Button,
  SelectBox,
  Crumbs,
  Field,
} from "../components/UIComponents";
import { useEffect, useState } from "react";

import {
  getPendingApprovals,
  updateDoctorStatus,
  getSLMDoctors,
  getTLMDoctors,
  getFLMDoctors,
} from "../api/managerAPI";

export function ApprovalQueue({ role = "manager" }) {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMR, setSelectedMR] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Popup state for messages
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // Confirmation Popup state
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    doctorId: null,
    status: "",
    doctorName: "",
    isLoading: false,
  });

  const showPopup = (type, title, message) => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  // Open confirmation popup
  const openConfirmPopup = (doctorId, status, doctorName) => {
    setConfirmPopup({
      isOpen: true,
      doctorId,
      status,
      doctorName,
      isLoading: false,
    });
  };

  // Close confirmation popup
  const closeConfirmPopup = () => {
    setConfirmPopup({
      ...confirmPopup,
      isOpen: false,
      isLoading: false,
    });
  };

  // Handle status change after confirmation
  const confirmStatusChange = async () => {
    const { doctorId, status } = confirmPopup;
    
    setConfirmPopup(prev => ({ ...prev, isLoading: true }));
    
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      const response = await updateDoctorStatus(
        doctorId, 
        status, 
        user._id, 
        user.role
      );
      
      if (response && response.success) {
        closeConfirmPopup();
        showPopup(
          "success",
          `${status.charAt(0).toUpperCase() + status.slice(1)}!`,
          `Doctor has been ${status} successfully!`
        );
        await fetchDoctors();
      }
    } catch (error) {
      console.error("Error:", error);
      closeConfirmPopup();
      showPopup(
        "error",
        "Action Failed",
        `Failed to ${status} doctor: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setProcessingId(null);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      let data;
      if (user.role === "flm") {
        data = await getFLMDoctors(user.flmId);
      } else if (user.role === "slm") {
        data = await getSLMDoctors(user.slmId);
      } else if (user.role === "tlm") {
        data = await getTLMDoctors(user.tlmId);
      }
      
      console.log("Fetched all doctors:", data?.doctors);
      setDoctors(data?.doctors || []);
      applyFilters(data?.doctors || []);
    } catch (error) {
      console.error("Error:", error);
      showPopup("error", "Fetch Failed", "Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const applyFilters = (data = doctors) => {
    let filtered = [...data];
    
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.mclCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.mr?.mrName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedMR !== "all") {
      filtered = filtered.filter(doctor => doctor.mr?.mrName === selectedMR);
    }
    
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(doctor => doctor.speciality === selectedSpecialty);
    }
    
    if (selectedDateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(doctor => {
        const daysPending = Math.floor((now - new Date(doctor.createdAt)) / (1000 * 60 * 60 * 24));
        if (selectedDateFilter === "today") return daysPending === 0;
        if (selectedDateFilter === "3days") return daysPending <= 3;
        if (selectedDateFilter === "7days") return daysPending <= 7;
        return true;
      });
    }
    
    if (selectedStatusFilter !== "all") {
      filtered = filtered.filter(doctor => doctor.approvalStatus === selectedStatusFilter);
    }
    
    setFilteredDoctors(filtered);
  };

  // Re-apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedMR, selectedSpecialty, selectedDateFilter, selectedStatusFilter, doctors]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedMR("all");
    setSelectedSpecialty("all");
    setSelectedDateFilter("all");
    setSelectedStatusFilter("all");
  };

  // Get unique values for filters
  const uniqueMRs = [...new Set(doctors.map(d => d.mr?.mrName).filter(Boolean))];
  const uniqueSpecialties = [...new Set(doctors.map(d => d.speciality).filter(Boolean))];

  // Calculate stats based on ALL doctors
  const stats = {
    total: doctors.length,
    pendingToday: doctors.filter(d => {
      const days = Math.floor((new Date() - new Date(d.createdAt)) / (1000*60*60*24));
      return days === 0 && d.approvalStatus === "pending";
    }).length,
    pendingOver3Days: doctors.filter(d => {
      const days = Math.floor((new Date() - new Date(d.createdAt)) / (1000*60*60*24));
      return days > 3 && d.approvalStatus === "pending";
    }).length,
    pendingBetween1to3Days: doctors.filter(d => {
      const days = Math.floor((new Date() - new Date(d.createdAt)) / (1000*60*60*24));
      return days > 0 && days <= 3 && d.approvalStatus === "pending";
    }).length,
    approved: doctors.filter(d => d.approvalStatus === "approved").length,
    rejected: doctors.filter(d => d.approvalStatus === "rejected").length,
  };

  if (loading) {
    return (
      <Layout role={role} active="Doctor Approvals">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading pending approvals...</div>
      </Layout>
    );
  }

  const user = JSON.parse(localStorage.getItem("user"));
  
  return (
    <Layout role={role} active="Doctor Approvals">
      <Crumbs items={["Doctor Approvals", "Approval Queue"]} />
      
      <div className="pageHead">
        <div>
          <h1>Doctor Approval Queue</h1>
          <p className="subtitle">
            Review and Approve or reject doctors submitted by your MRs.
          </p>
        </div>
        <Button variant="outline" onClick={fetchDoctors}>
          Refresh
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid cards5">
        <StatCard title="Total Submitted" value={stats.total} icon={Users} tone="purple" />
        <StatCard title="Pending Since Today" value={stats.pendingToday} icon={Clock3} tone="orange" />
        <StatCard title="Pending 1-3 Days" value={stats.pendingBetween1to3Days} icon={CalendarDays} tone="blue" />
        <StatCard title="Pending > 3 Days" value={stats.pendingOver3Days} icon={CalendarDays} tone="red" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} tone="red" />
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '10px', marginTop: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            placeholder="Search by Doctor Name, Speciality, MCL Code, or MR Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          {searchTerm && (
            <X 
              size={16} 
              onClick={() => setSearchTerm("")}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#999' }}
            />
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <SelectBox 
          label="All MRs" 
          value={selectedMR}
          onChange={(e) => setSelectedMR(e.target.value)}
          options={[{ value: "all", label: "All MRs" }, ...uniqueMRs.map(mr => ({ value: mr, label: mr }))]}
        />
        <SelectBox 
          label="Specialty"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          options={[{ value: "all", label: "All Specialties" }, ...uniqueSpecialties.map(spec => ({ value: spec, label: spec }))]}
        />
        <SelectBox 
          label="Date Filter"
          value={selectedDateFilter}
          onChange={(e) => setSelectedDateFilter(e.target.value)}
          options={[
            { value: "all", label: "All Dates" },
            { value: "today", label: "Today" },
            { value: "3days", label: "Last 3 Days" },
            { value: "7days", label: "Last 7 Days" },
          ]}
        />
        <SelectBox 
          label="Status"
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          options={[
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
        <Button variant="outline" icon={Filter} onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </div>
      
      {/* Doctors Table */}
      {filteredDoctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '8px' }}>
          <p>No doctors found matching your filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Doctor Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Speciality</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>MCL Code</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Submitted By (MR)</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Submission Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Days Pending</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor, index) => {
                const daysPending = Math.floor((new Date() - new Date(doctor.createdAt)) / (1000 * 60 * 60 * 24));
                const isApproved = doctor.approvalStatus === "approved";
                const isRejected = doctor.approvalStatus === "rejected";
                const isPending = doctor.approvalStatus === "pending";
                
                return (
                  <tr key={doctor._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{index + 1}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{doctor.doctorName}</td>
                    <td style={{ padding: '12px' }}>{doctor.speciality}</td>
                    <td style={{ padding: '12px' }}>{doctor.mclCode}</td>
                    <td style={{ padding: '12px' }}>{doctor.mr?.mrName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{new Date(doctor.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: daysPending > 7 ? '#fee2e2' : daysPending > 3 ? '#fff3e0' : '#e0e7ff', 
                        color: daysPending > 7 ? '#dc2626' : daysPending > 3 ? '#ea580c' : '#2563eb',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {daysPending} day(s)
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {isApproved ? (
                        <Badge tone="green">Approved</Badge>
                      ) : isRejected ? (
                        <Badge tone="red">Rejected</Badge>
                      ) : (
                        <Badge tone={daysPending > 7 ? "red" : "orange"}>
                           Pending
                        </Badge>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {isPending && user?.role === "flm" ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => openConfirmPopup(doctor._id, "approved", doctor.doctorName)}
                            disabled={processingId === doctor._id}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '6px 16px',
                              borderRadius: '6px',
                              cursor: processingId === doctor._id ? 'not-allowed' : 'pointer',
                              opacity: processingId === doctor._id ? 0.6 : 1
                            }}
                          >
                            {processingId === doctor._id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => openConfirmPopup(doctor._id, "rejected", doctor.doctorName)}
                            disabled={processingId === doctor._id}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '6px 16px',
                              borderRadius: '6px',
                              cursor: processingId === doctor._id ? 'not-allowed' : 'pointer',
                              opacity: processingId === doctor._id ? 0.6 : 1
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          {isApproved ? " Approved" : isRejected ? " Rejected" : "View Only"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Popup */}
      {confirmPopup.isOpen && (
        <div 
          className="confirm-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div 
            className="confirm-container"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'scaleIn 0.3s ease',
              position: 'relative'
            }}
          >
            {/* Close button */}
            <button
              onClick={closeConfirmPopup}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                color: '#d97706'
              }}>
                <AlertTriangle size={32} />
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#1a1a2e'
            }}>
              Confirm {confirmPopup.status === 'approved' ? 'Approval' : 'Rejection'}
            </h2>

            {/* Message */}
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#666',
              marginBottom: '8px',
              lineHeight: '1.6'
            }}>
              Are you sure you want to <strong style={{ color: confirmPopup.status === 'approved' ? '#10b981' : '#ef4444' }}>
                {confirmPopup.status}
              </strong> this doctor?
            </p>
            
            {confirmPopup.doctorName && (
              <p style={{
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1a1a2e',
                marginBottom: '24px'
              }}>
                Dr. {confirmPopup.doctorName}
              </p>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={closeConfirmPopup}
                disabled={confirmPopup.isLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: confirmPopup.isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background 0.2s',
                  opacity: confirmPopup.isLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!confirmPopup.isLoading) e.target.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (!confirmPopup.isLoading) e.target.style.background = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={confirmPopup.isLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '8px',
                  background: confirmPopup.status === 'approved' ? '#10b981' : '#ef4444',
                  color: 'white',
                  cursor: confirmPopup.isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: confirmPopup.isLoading ? 0.7 : 1,
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!confirmPopup.isLoading) {
                    e.target.style.background = confirmPopup.status === 'approved' ? '#059669' : '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!confirmPopup.isLoading) {
                    e.target.style.background = confirmPopup.status === 'approved' ? '#10b981' : '#ef4444';
                  }
                }}
              >
                {confirmPopup.isLoading ? (
                  <>Processing...</>
                ) : (
                  <>Yes, {confirmPopup.status}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Popup */}
      {popup.isOpen && (
        <div 
          className="popup-overlay"
          onClick={closePopup}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div 
            className="popup-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'scaleIn 0.3s ease',
              position: 'relative'
            }}
          >
            <button
              onClick={closePopup}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {popup.type === 'success' ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#d1fae5',
                  color: '#065f46'
                }}>
                  <CheckCircle2 size={32} />
                </div>
              ) : (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b'
                }}>
                  <AlertCircle size={32} />
                </div>
              )}
            </div>

            <h2 style={{
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: popup.type === 'success' ? '#065f46' : '#991b1b'
            }}>
              {popup.title}
            </h2>

            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#666',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              {popup.message}
            </p>

            <button
              onClick={closePopup}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                backgroundColor: popup.type === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = popup.type === 'success' ? '#059669' : '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = popup.type === 'success' ? '#10b981' : '#ef4444';
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </Layout>
  );
}

export function DoctorReview({ role = "manager" }) {
  return (
    <Layout role={role} active="Doctor Approvals">
      <Crumbs items={["Doctor Approvals", "Approval Queue", "Doctor Review"]} />
      <div className="pageHead">
        <div>
          <h1>{role === "ho" ? "Doctor Review / Approve" : "Doctor Review"}</h1>
          <p className="subtitle">Review doctor details submitted by the MR and take action.</p>
        </div>
        <Button variant="outline" icon={ArrowLeft} onClick={() => window.history.back()}>
          Back to Queue
        </Button>
      </div>
      <div className="review">
        <div className="panel">
          <div className="panelHead"><h3>Doctor Details</h3></div>
          <div className="reviewGrid">
            <span>Doctor Name <b>Loading...</b></span>
          </div>
        </div>
      </div>
    </Layout>
  );
}