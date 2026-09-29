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

    setConfirmPopup((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await updateDoctorStatus(
        doctorId,
        status,
        user._id,
        user.role,
      );

      if (response && response.success) {
        closeConfirmPopup();

        showPopup(
          "success",
          `${status.charAt(0).toUpperCase() + status.slice(1)}!`,
          `Doctor has been ${status} successfully!`,
        );

        await fetchDoctors();
      }
    } catch (error) {
      console.error("Error:", error);

      closeConfirmPopup();

      showPopup(
        "error",
        "Action Failed",
        `Failed to ${status} doctor: ${
          error.response?.data?.message || error.message
        }`,
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

      showPopup(
        "error",
        "Fetch Failed",
        "Failed to load doctors. Please try again.",
      );
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
      filtered = filtered.filter(
        (doctor) =>
          doctor.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.speciality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.mclCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.mr?.mrName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedMR !== "all") {
      filtered = filtered.filter((doctor) => doctor.mr?.mrName === selectedMR);
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.speciality === selectedSpecialty,
      );
    }

    if (selectedDateFilter !== "all") {
      const now = new Date();

      filtered = filtered.filter((doctor) => {
        const daysPending = Math.floor(
          (now - new Date(doctor.createdAt)) / (1000 * 60 * 60 * 24),
        );

        if (selectedDateFilter === "today") return daysPending === 0;
        if (selectedDateFilter === "3days") return daysPending <= 3;
        if (selectedDateFilter === "7days") return daysPending <= 7;

        return true;
      });
    }

    if (selectedStatusFilter !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.approvalStatus === selectedStatusFilter,
      );
    }

    setFilteredDoctors(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [
    searchTerm,
    selectedMR,
    selectedSpecialty,
    selectedDateFilter,
    selectedStatusFilter,
    doctors,
  ]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedMR("all");
    setSelectedSpecialty("all");
    setSelectedDateFilter("all");
    setSelectedStatusFilter("all");
  };

  const uniqueMRs = [
    ...new Set(doctors.map((d) => d.mr?.mrName).filter(Boolean)),
  ];

  const uniqueSpecialties = [
    ...new Set(doctors.map((d) => d.speciality).filter(Boolean)),
  ];

  const stats = {
    total: doctors.length,

    pendingToday: doctors.filter((d) => {
      const days = Math.floor(
        (new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24),
      );

      return days === 0 && d.approvalStatus === "pending";
    }).length,

    pendingOver3Days: doctors.filter((d) => {
      const days = Math.floor(
        (new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24),
      );

      return days > 3 && d.approvalStatus === "pending";
    }).length,

    pendingBetween1to3Days: doctors.filter((d) => {
      const days = Math.floor(
        (new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24),
      );

      return days > 0 && days <= 3 && d.approvalStatus === "pending";
    }).length,

    approved: doctors.filter((d) => d.approvalStatus === "approved").length,

    rejected: doctors.filter((d) => d.approvalStatus === "rejected").length,
  };

  if (loading) {
    return (
      <Layout role={role} active="Doctor Approvals">
        <div className="approval-loading-screen">
          <div className="approval-loader">
            <div className="loader-ring" />

            <div className="loader-core">
              <Users size={22} />
            </div>
          </div>

          <h2>Loading approval queue</h2>

          <p>Fetching the latest doctor submissions...</p>

          <div className="loading-shimmer">
            <span />
            <span />
            <span />
          </div>
        </div>

        <style>{`
          .approval-loading-screen {
            min-height: 62vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #172033;
          }

          .approval-loader {
            width: 72px;
            height: 72px;
            position: relative;
            display: grid;
            place-items: center;
            margin-bottom: 20px;
          }

          .loader-ring {
            position: absolute;
            inset: 0;
            border: 3px solid #e8eefc;
            border-top-color: #2563eb;
            border-right-color: #60a5fa;
            border-radius: 50%;
            animation: approvalSpin 1s linear infinite;
          }

          .loader-core {
            width: 44px;
            height: 44px;
            border-radius: 15px;
            display: grid;
            place-items: center;
            color: #2563eb;
            background: linear-gradient(
              145deg,
              #eff6ff,
              #dbeafe
            );
            box-shadow:
              0 10px 30px rgba(37, 99, 235, 0.16);
          }

          .approval-loading-screen h2 {
            margin: 0 0 6px;
            font-size: 20px;
          }

          .approval-loading-screen p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }

          .loading-shimmer {
            display: flex;
            gap: 6px;
            margin-top: 18px;
          }

          .loading-shimmer span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #60a5fa;
            animation:
              approvalPulse 1.1s ease-in-out infinite;
          }

          .loading-shimmer span:nth-child(2) {
            animation-delay: 0.15s;
          }

          .loading-shimmer span:nth-child(3) {
            animation-delay: 0.3s;
          }

          @keyframes approvalSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes approvalPulse {
            0%,
            100% {
              opacity: 0.25;
              transform: translateY(0);
            }

            50% {
              opacity: 1;
              transform: translateY(-4px);
            }
          }
        `}</style>
      </Layout>
    );
  }

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Layout role={role} active="Doctor Approvals">
      <div className="approval-page">
        <div className="approval-background-orb orb-one" />
        <div className="approval-background-orb orb-two" />

        <Crumbs items={["Doctor Approvals", "Approval Queue"]} />

        <section className="approval-hero">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              MANAGEMENT CONSOLE
            </div>

            <h1>Doctor Approval Queue</h1>

            <p className="subtitle">
              {user?.role === "slm"
                ? "FLM-approved doctors are already approved. Approve pending submissions or override an approval with Disapprove."
                : user?.role === "tlm"
                  ? "TLM can approve MR submissions directly, bypassing FLM and SLM, or override an existing approval with Disapprove."
                  : "Review and Approve or reject doctors submitted by your MRs."}
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchDoctors}
            type="button"
          >
            <span className="refresh-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
                <path
                  d="M20 11a8.1 8.1 0 0 0-15.4-2M4 13a8.1 8.1 0 0 0 15.4 2M4 5v4h4M20 19v-4h-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Refresh Queue
          </button>
        </section>

        <section className="approval-stats">
          <div className="approval-stat stat-purple">
            <div className="stat-icon">
              <Users size={20} />
            </div>

            <div className="stat-content">
              <span>Total Submitted</span>
              <strong>{stats.total}</strong>
              <small>All submissions</small>
            </div>

            <div className="stat-glow" />
          </div>

          <div className="approval-stat stat-orange">
            <div className="stat-icon">
              <Clock3 size={20} />
            </div>

            <div className="stat-content">
              <span>Pending Today</span>
              <strong>{stats.pendingToday}</strong>
              <small>Needs attention</small>
            </div>

            <div className="stat-glow" />
          </div>

          <div className="approval-stat stat-blue">
            <div className="stat-icon">
              <CalendarDays size={20} />
            </div>

            <div className="stat-content">
              <span>Pending 1–3 Days</span>
              <strong>{stats.pendingBetween1to3Days}</strong>
              <small>Recent queue</small>
            </div>

            <div className="stat-glow" />
          </div>

          <div className="approval-stat stat-red">
            <div className="stat-icon">
              <CalendarDays size={20} />
            </div>

            <div className="stat-content">
              <span>Pending &gt; 3 Days</span>
              <strong>{stats.pendingOver3Days}</strong>
              <small>Priority review</small>
            </div>

            <div className="stat-glow" />
          </div>

          <div className="approval-stat stat-red">
            <div className="stat-icon">
              <XCircle size={20} />
            </div>

            <div className="stat-content">
              <span>Rejected</span>
              <strong>{stats.rejected}</strong>
              <small>Closed submissions</small>
            </div>

            <div className="stat-glow" />
          </div>
        </section>

        <section className="approval-controls">
          <div className="search-panel">
            <div className="search-icon">
              <Search size={19} />
            </div>

            <input
              type="text"
              placeholder="Search doctor, speciality, MCL code or MR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                className="search-clear"
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filter-row">
            <div className="filter-heading">
              <div className="filter-heading-icon">
                <Filter size={16} />
              </div>

              <div>
                <strong>Filter queue</strong>
                <span>Refine the submissions below</span>
              </div>
            </div>

            <div className="filter-control">
              <SelectBox
                label="All MRs"
                value={selectedMR}
                onChange={(e) => setSelectedMR(e.target.value)}
                options={[
                  {
                    value: "all",
                    label: "All MRs",
                  },
                  ...uniqueMRs.map((mr) => ({
                    value: mr,
                    label: mr,
                  })),
                ]}
              />
            </div>

            <div className="filter-control">
              <SelectBox
                label="Specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                options={[
                  {
                    value: "all",
                    label: "All Specialties",
                  },
                  ...uniqueSpecialties.map((spec) => ({
                    value: spec,
                    label: spec,
                  })),
                ]}
              />
            </div>

            <div className="filter-control">
              <SelectBox
                label="Date Filter"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                options={[
                  {
                    value: "all",
                    label: "All Dates",
                  },
                  {
                    value: "today",
                    label: "Today",
                  },
                  {
                    value: "3days",
                    label: "Last 3 Days",
                  },
                  {
                    value: "7days",
                    label: "Last 7 Days",
                  },
                ]}
              />
            </div>

            <div className="filter-control">
              <SelectBox
                label="Status"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                options={[
                  {
                    value: "all",
                    label: "All Status",
                  },
                  {
                    value: "pending",
                    label: "Pending",
                  },
                  {
                    value: "approved",
                    label: "Approved",
                  },
                  {
                    value: "rejected",
                    label: "Rejected",
                  },
                ]}
              />
            </div>

            <button
              className="clear-filter-button"
              type="button"
              onClick={clearAllFilters}
            >
              <Filter size={15} />
              Clear Filters
            </button>
          </div>
        </section>

        <section className="queue-panel">
          <div className="queue-panel-head">
            <div>
              <div className="queue-title-row">
                <h2>Submission Queue</h2>

                <span className="result-count">
                  {filteredDoctors.length}{" "}
                  {filteredDoctors.length === 1 ? "doctor" : "doctors"}
                </span>
              </div>

              <p>
                Manage submitted doctors and take action on pending approvals.
              </p>
            </div>

            <div className="queue-live">
              <span />
              Live Queue
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="empty-queue">
              <div className="empty-icon">
                <Search size={26} />
              </div>

              <h3>No doctors found</h3>

              <p>No doctors match your current filters.</p>

              <button type="button" onClick={clearAllFilters}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="approval-table-wrap">
              <table className="approval-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Doctor</th>
                    <th>Speciality</th>
                    <th>MCL Code</th>
                    <th>Submitted By</th>
                    <th>Submission Date</th>
                    <th>Days Pending</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDoctors.map((doctor, index) => {
                    const daysPending = Math.floor(
                      (new Date() - new Date(doctor.createdAt)) /
                        (1000 * 60 * 60 * 24),
                    );

                    const isApproved = doctor.approvalStatus === "approved";

                    const isRejected = doctor.approvalStatus === "rejected";

                    const isPending = doctor.approvalStatus === "pending";

                    const lowerManagerLockedByTLM =
                      isRejected &&
                      doctor.approvedByRole === "tlm" &&
                      user?.role !== "tlm";

                    return (
                      <tr
                        key={doctor._id}
                        className="approval-row"
                        style={{
                          "--row-delay": `${Math.min(index * 45, 450)}ms`,
                        }}
                      >
                        <td>
                          <span className="row-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </td>

                        <td>
                          <div className="doctor-cell">
                            <div className="doctor-avatar">
                              {(doctor.doctorName || "D")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>{doctor.doctorName}</strong>

                              <span>Doctor</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="speciality-text">
                            {doctor.speciality}
                          </span>
                        </td>

                        <td>
                          <span className="mcl-code">{doctor.mclCode}</span>
                        </td>

                        <td>
                          <div className="mr-cell">
                            <span className="mr-avatar">
                              {(doctor.mr?.mrName || "N")
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                            <span>{doctor.mr?.mrName || "N/A"}</span>
                          </div>
                        </td>

                        <td>
                          <span className="date-text">
                            {new Date(doctor.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`pending-pill ${
                              daysPending > 7
                                ? "pending-danger"
                                : daysPending > 3
                                  ? "pending-warning"
                                  : "pending-normal"
                            }`}
                          >
                            {daysPending} day(s)
                          </span>
                        </td>

                        <td>
                          <div className="status-wrap">
                            {isApproved ? (
                              <Badge tone="green">Approved</Badge>
                            ) : isRejected ? (
                              <Badge tone="red">Rejected</Badge>
                            ) : (
                              <Badge tone={daysPending > 7 ? "red" : "orange"}>
                                Pending
                              </Badge>
                            )}
                          </div>
                        </td>

                        <td>
                          {user?.role === "flm" && isPending ? (
                            <div className="approval-actions">
                              <button
                                className="action-button approve-button"
                                onClick={() =>
                                  openConfirmPopup(
                                    doctor._id,
                                    "approved",
                                    doctor.doctorName,
                                  )
                                }
                                disabled={processingId === doctor._id}
                                type="button"
                              >
                                <CheckCircle2 size={14} />
                                {processingId === doctor._id
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                className="action-button reject-button"
                                onClick={() =>
                                  openConfirmPopup(
                                    doctor._id,
                                    "rejected",
                                    doctor.doctorName,
                                  )
                                }
                                disabled={processingId === doctor._id}
                                type="button"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </div>
                          ) : user?.role === "slm" || user?.role === "tlm" ? (
                            lowerManagerLockedByTLM ? (
                              <span className="view-only">Locked by TLM</span>
                            ) : (
                              <div className="approval-actions">
                              {(isPending || isRejected) && (
                                <button
                                  className="action-button approve-button"
                                  onClick={() =>
                                    openConfirmPopup(
                                      doctor._id,
                                      "approved",
                                      doctor.doctorName,
                                    )
                                  }
                                  disabled={processingId === doctor._id}
                                  type="button"
                                >
                                  <CheckCircle2 size={14} />
                                  {processingId === doctor._id
                                    ? "Processing..."
                                    : "Approve"}
                                </button>
                              )}

                              {(isPending || isApproved) && (
                                <button
                                  className="action-button reject-button"
                                  onClick={() =>
                                    openConfirmPopup(
                                      doctor._id,
                                      "rejected",
                                      doctor.doctorName,
                                    )
                                  }
                                  disabled={processingId === doctor._id}
                                  type="button"
                                >
                                  <XCircle size={14} />
                                  {isApproved ? "Disapprove" : "Disapprove"}
                                </button>
                              )}
                              </div>
                            )
                          ) : (
                            <span className="view-only">
                              {isApproved
                                ? "Approved"
                                : isRejected
                                  ? "Rejected"
                                  : "View Only"}
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
        </section>
      </div>

      {confirmPopup.isOpen && (
        <div className="modern-modal-overlay">
          <div className="modern-modal-backdrop" onClick={closeConfirmPopup} />

          <div className="modern-modal confirm-modal">
            <button
              className="modal-close"
              onClick={closeConfirmPopup}
              type="button"
              aria-label="Close confirmation"
            >
              <X size={18} />
            </button>

            <div
              className={`modal-icon ${
                confirmPopup.status === "approved"
                  ? "modal-icon-success"
                  : "modal-icon-danger"
              }`}
            >
              <AlertTriangle size={29} />
            </div>

            <span className="modal-eyebrow">
              {confirmPopup.status === "approved"
                ? "APPROVAL CONFIRMATION"
                : user?.role === "slm" || user?.role === "tlm"
                  ? "OVERRIDE CONFIRMATION"
                  : "ACTION CONFIRMATION"}
            </span>

            <h2>
              Confirm{" "}
              {confirmPopup.status === "approved"
                ? "Approval"
                : user?.role === "slm" || user?.role === "tlm"
                  ? "Disapproval"
                  : "Rejection"}
            </h2>

            <p>
              Are you sure you want to{" "}
              <strong
                className={
                  confirmPopup.status === "approved"
                    ? "text-success"
                    : "text-danger"
                }
              >
                {confirmPopup.status === "approved"
                  ? "approve"
                  : user?.role === "slm" || user?.role === "tlm"
                    ? "disapprove"
                    : "reject"}
              </strong>{" "}
              this doctor?
            </p>

            {confirmPopup.doctorName && (
              <div className="selected-doctor">
                <div className="selected-doctor-avatar">
                  {confirmPopup.doctorName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <span>Selected doctor</span>

                  <strong>Dr. {confirmPopup.doctorName}</strong>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={closeConfirmPopup}
                disabled={confirmPopup.isLoading}
                type="button"
              >
                Cancel
              </button>

              <button
                className={`modal-confirm ${
                  confirmPopup.status === "approved"
                    ? "confirm-success"
                    : "confirm-danger"
                }`}
                onClick={confirmStatusChange}
                disabled={confirmPopup.isLoading}
                type="button"
              >
                {confirmPopup.isLoading ? (
                  <>
                    <span className="button-spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    {confirmPopup.status === "approved" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    Yes, {confirmPopup.status}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {popup.isOpen && (
        <div className="modern-modal-overlay">
          <div className="modern-modal-backdrop" onClick={closePopup} />

          <div className="modern-modal result-modal">
            <button
              className="modal-close"
              onClick={closePopup}
              type="button"
              aria-label="Close message"
            >
              <X size={18} />
            </button>

            <div
              className={`modal-icon ${
                popup.type === "success"
                  ? "modal-icon-success"
                  : "modal-icon-danger"
              }`}
            >
              {popup.type === "success" ? (
                <CheckCircle2 size={30} />
              ) : (
                <AlertTriangle size={30} />
              )}
            </div>

            <span
              className={`modal-eyebrow ${
                popup.type === "success" ? "eyebrow-success" : "eyebrow-danger"
              }`}
            >
              {popup.type === "success" ? "COMPLETED" : "ACTION FAILED"}
            </span>

            <h2>{popup.title}</h2>

            <p>{popup.message}</p>

            <button
              className={`result-button ${
                popup.type === "success" ? "result-success" : "result-danger"
              }`}
              onClick={closePopup}
              type="button"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <style>{`
        .approval-page {
          position: relative;
          isolation: isolate;
          min-height: calc(100vh - 100px);
          padding-bottom: 40px;
          color: #172033;
        }

        .approval-background-orb {
          position: fixed;
          pointer-events: none;
          z-index: -1;
          border-radius: 50%;
          filter: blur(2px);
          opacity: .48;
        }

        .orb-one {
          width: 320px;
          height: 320px;
          top: 90px;
          right: -150px;
          background: radial-gradient(
            circle,
            rgba(96,165,250,.12),
            transparent 68%
          );
          animation: floatOrb 9s ease-in-out infinite;
        }

        .orb-two {
          width: 280px;
          height: 280px;
          bottom: -120px;
          left: -130px;
          background: radial-gradient(
            circle,
            rgba(129,140,248,.10),
            transparent 68%
          );
          animation: floatOrb 11s ease-in-out infinite reverse;
        }

        .approval-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin: 12px 0 22px;
          animation:
            heroReveal .55s
            cubic-bezier(.22,1,.36,1) both;
        }

        .hero-copy {
          min-width: 0;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .13em;
        }

        .eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2563eb;
          box-shadow:
            0 0 0 5px
            rgba(37,99,235,.09);
          animation:
            dotPulse 2s
            ease-in-out infinite;
        }

        .approval-hero h1 {
          margin: 0;
          font-size: clamp(27px, 3vw, 38px);
          line-height: 1.08;
          letter-spacing: -.035em;
          color: #111827;
        }

        .approval-hero .subtitle {
          margin: 9px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.55;
        }

        .refresh-button {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border: 1px solid #dbe5f4;
          border-radius: 13px;
          padding: 11px 15px;
          background: rgba(255,255,255,.88);
          color: #1e40af;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 8px 22px
            rgba(15,23,42,.05);
          backdrop-filter: blur(12px);
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease,
            background .2s ease;
        }

        .refresh-button:hover {
          transform: translateY(-2px);
          border-color: #93c5fd;
          background: #fff;
          box-shadow:
            0 12px 28px
            rgba(37,99,235,.12);
        }

        .refresh-button:active {
          transform: translateY(0) scale(.98);
        }

        .refresh-button:hover .refresh-icon {
          animation: refreshSpin .65s ease;
        }

        .refresh-icon {
          display: inline-flex;
        }

        .approval-stats {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 18px;
        }

        .approval-stat {
          position: relative;
          overflow: hidden;
          min-height: 116px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px;
          border: 1px solid
            rgba(226,232,240,.9);
          border-radius: 18px;
          background: rgba(255,255,255,.88);
          box-shadow:
            0 8px 28px
            rgba(15,23,42,.055);
          backdrop-filter: blur(13px);
          animation:
            statReveal .6s
            cubic-bezier(.22,1,.36,1) both;
          transition:
            transform .22s ease,
            box-shadow .22s ease,
            border-color .22s ease;
        }

        .approval-stat:nth-child(1) {
          animation-delay: 60ms;
        }

        .approval-stat:nth-child(2) {
          animation-delay: 110ms;
        }

        .approval-stat:nth-child(3) {
          animation-delay: 160ms;
        }

        .approval-stat:nth-child(4) {
          animation-delay: 210ms;
        }

        .approval-stat:nth-child(5) {
          animation-delay: 260ms;
        }

        .approval-stat:hover {
          transform: translateY(-5px);
          box-shadow:
            0 18px 35px
            rgba(15,23,42,.09);
          border-color:
            rgba(191,219,254,.95);
        }

        .stat-icon {
          position: relative;
          z-index: 1;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 14px;
          transition:
            transform .25s ease;
        }

        .approval-stat:hover .stat-icon {
          transform:
            rotate(-5deg) scale(1.08);
        }

        .stat-content {
          position: relative;
          z-index: 1;
          min-width: 0;
        }

        .stat-content span,
        .stat-content small {
          display: block;
        }

        .stat-content span {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stat-content strong {
          display: block;
          margin: 3px 0 1px;
          color: #111827;
          font-size: 27px;
          line-height: 1;
          letter-spacing: -.04em;
        }

        .stat-content small {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 600;
        }

        .stat-glow {
          position: absolute;
          width: 100px;
          height: 100px;
          right: -42px;
          bottom: -52px;
          border-radius: 50%;
          opacity: .12;
          transition:
            transform .35s ease;
        }

        .approval-stat:hover .stat-glow {
          transform: scale(1.6);
        }

        .stat-purple .stat-icon {
          color: #7c3aed;
          background: #f3e8ff;
        }

        .stat-purple .stat-glow {
          background: #8b5cf6;
        }

        .stat-orange .stat-icon {
          color: #ea580c;
          background: #ffedd5;
        }

        .stat-orange .stat-glow {
          background: #f97316;
        }

        .stat-blue .stat-icon {
          color: #2563eb;
          background: #dbeafe;
        }

        .stat-blue .stat-glow {
          background: #3b82f6;
        }

        .stat-red .stat-icon {
          color: #dc2626;
          background: #fee2e2;
        }

        .stat-red .stat-glow {
          background: #ef4444;
        }

        .approval-controls {
          position: relative;
          z-index: 2;
          margin-bottom: 18px;
          animation:
            contentReveal .65s .18s
            cubic-bezier(.22,1,.36,1) both;
        }

        .search-panel {
          position: relative;
          width: min(100%, 560px);
          display: flex;
          align-items: center;
          margin-bottom: 13px;
        }

        .search-panel input {
          width: 100%;
          height: 47px;
          padding: 0 43px 0 44px;
          border: 1px solid #dbe4f0;
          border-radius: 14px;
          outline: none;
          background: rgba(255,255,255,.93);
          color: #172033;
          font-size: 13px;
          box-shadow:
            0 7px 22px
            rgba(15,23,42,.045);
          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            transform .2s ease;
        }

        .search-panel input::placeholder {
          color: #9aa7b8;
        }

        .search-panel input:focus {
          border-color: #60a5fa;
          box-shadow:
            0 0 0 4px
            rgba(37,99,235,.09),
            0 10px 25px
            rgba(37,99,235,.07);
          transform: translateY(-1px);
        }

        .search-icon {
          position: absolute;
          z-index: 2;
          left: 15px;
          color: #64748b;
          display: flex;
          pointer-events: none;
          transition:
            color .2s ease,
            transform .2s ease;
        }

        .search-panel:focus-within .search-icon {
          color: #2563eb;
          transform: scale(1.08);
        }

        .search-clear {
          position: absolute;
          z-index: 2;
          right: 11px;
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 8px;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
          transition:
            background .18s ease,
            color .18s ease,
            transform .18s ease;
        }

        .search-clear:hover {
          background: #dbeafe;
          color: #2563eb;
          transform: rotate(90deg);
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: rgba(255,255,255,.78);
          box-shadow:
            0 7px 22px
            rgba(15,23,42,.035);
          backdrop-filter: blur(10px);
        }

        .filter-heading {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-right: 3px;
          min-width: 145px;
        }

        .filter-heading-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #2563eb;
          background: #eff6ff;
        }

        .filter-heading strong,
        .filter-heading span {
          display: block;
        }

        .filter-heading strong {
          color: #334155;
          font-size: 11px;
        }

        .filter-heading span {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
        }

        .filter-control {
          min-width: 135px;
          transition: transform .18s ease;
        }

        .filter-control:hover {
          transform: translateY(-1px);
        }

        .filter-control label {
          font-size: 9px !important;
          color: #64748b !important;
          font-weight: 700 !important;
        }

        .filter-control select {
          transition:
            border-color .18s ease,
            box-shadow .18s ease;
        }

        .filter-control select:focus {
          border-color: #60a5fa !important;
          box-shadow:
            0 0 0 3px
            rgba(37,99,235,.08);
          outline: none;
        }

        .clear-filter-button {
          height: 38px;
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 12px;
          border: 1px solid #dbe4f0;
          border-radius: 10px;
          background: #fff;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s ease;
        }

        .clear-filter-button:hover {
          color: #2563eb;
          border-color: #93c5fd;
          background: #eff6ff;
          transform: translateY(-1px);
        }

        .queue-panel {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: rgba(255,255,255,.93);
          box-shadow:
            0 14px 42px
            rgba(15,23,42,.06);
          animation:
            contentReveal .7s .25s
            cubic-bezier(.22,1,.36,1) both;
        }

        .queue-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 20px;
          border-bottom: 1px solid #edf2f7;
          background:
            linear-gradient(
              180deg,
              rgba(248,250,252,.92),
              rgba(255,255,255,.92)
            );
        }

        .queue-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .queue-title-row h2 {
          margin: 0;
          color: #172033;
          font-size: 17px;
          letter-spacing: -.02em;
        }

        .result-count {
          padding: 4px 8px;
          border-radius: 999px;
          color: #2563eb;
          background: #eff6ff;
          font-size: 9px;
          font-weight: 800;
        }

        .queue-panel-head p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .queue-live {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          padding: 7px 10px;
          border: 1px solid #dcfce7;
          border-radius: 999px;
          color: #15803d;
          background: #f0fdf4;
          font-size: 10px;
          font-weight: 800;
        }

        .queue-live > span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 0 4px
            rgba(34,197,94,.12);
          animation:
            dotPulse 1.8s
            ease-in-out infinite;
        }

        .approval-table-wrap {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color:
            #cbd5e1 transparent;
        }

        .approval-table {
          width: 100%;
          min-width: 1080px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .approval-table th {
          padding: 12px 14px;
          border-bottom: 1px solid #e8edf4;
          background: #f8fafc;
          color: #64748b;
          text-align: left;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .07em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .approval-table td {
          padding: 13px 14px;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
          color: #475569;
          font-size: 12px;
          white-space: nowrap;
        }

        .approval-row {
          animation:
            rowReveal .48s
            var(--row-delay)
            cubic-bezier(.22,1,.36,1) both;
          transition:
            transform .2s ease;
        }

        .approval-row:hover td {
          background: #f8fbff;
        }

        .approval-row:hover {
          transform: translateX(2px);
        }

        .approval-row:last-child td {
          border-bottom: 0;
        }

        .row-number {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .doctor-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .doctor-avatar,
        .mr-avatar {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #1d4ed8;
          background:
            linear-gradient(
              145deg,
              #dbeafe,
              #eff6ff
            );
          font-weight: 800;
        }

        .doctor-avatar {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          font-size: 13px;
          box-shadow:
            inset 0 0 0 1px
            rgba(37,99,235,.08);
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .approval-row:hover .doctor-avatar {
          transform:
            rotate(-4deg) scale(1.08);
          box-shadow:
            0 7px 16px
            rgba(37,99,235,.14);
        }

        .doctor-cell strong {
          display: block;
          color: #1e293b;
          font-size: 12px;
          font-weight: 750;
        }

        .doctor-cell span {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
        }

        .speciality-text {
          color: #475569;
          font-weight: 600;
        }

        .mcl-code {
          display: inline-flex;
          padding: 5px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          background: #f8fafc;
          color: #475569;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            monospace;
          font-size: 10px;
          font-weight: 700;
        }

        .mr-cell {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .mr-avatar {
          width: 25px;
          height: 25px;
          border-radius: 8px;
          font-size: 9px;
        }

        .date-text {
          color: #64748b;
          font-size: 11px;
        }

        .pending-pill {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
          transition:
            transform .18s ease;
        }

        .approval-row:hover .pending-pill {
          transform: scale(1.04);
        }

        .pending-normal {
          color: #2563eb;
          background: #eff6ff;
        }

        .pending-warning {
          color: #c2410c;
          background: #fff7ed;
        }

        .pending-danger {
          color: #dc2626;
          background: #fef2f2;
        }

        .status-wrap {
          display: inline-flex;
          transition:
            transform .18s ease;
        }

        .approval-row:hover .status-wrap {
          transform: translateY(-1px);
        }

        .approval-actions {
          display: flex;
          gap: 6px;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-width: 76px;
          height: 31px;
          padding: 0 9px;
          border: 0;
          border-radius: 8px;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform .18s ease,
            box-shadow .18s ease,
            filter .18s ease;
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: saturate(1.08);
        }

        .action-button:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        .action-button:disabled {
          cursor: not-allowed;
          opacity: .55;
        }

        .approve-button {
          background:
            linear-gradient(
              135deg,
              #10b981,
              #059669
            );
          box-shadow:
            0 6px 14px
            rgba(16,185,129,.16);
        }

        .approve-button:hover:not(:disabled) {
          box-shadow:
            0 9px 20px
            rgba(16,185,129,.25);
        }

        .reject-button {
          background:
            linear-gradient(
              135deg,
              #ef4444,
              #dc2626
            );
          box-shadow:
            0 6px 14px
            rgba(239,68,68,.15);
        }

        .reject-button:hover:not(:disabled) {
          box-shadow:
            0 9px 20px
            rgba(239,68,68,.23);
        }

        .view-only {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 700;
        }

        .empty-queue {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 35px 20px;
          text-align: center;
          animation:
            emptyReveal .45s ease both;
        }

        .empty-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin-bottom: 14px;
          border-radius: 18px;
          color: #64748b;
          background: #f1f5f9;
          animation:
            emptyFloat 3s
            ease-in-out infinite;
        }

        .empty-queue h3 {
          margin: 0 0 5px;
          color: #334155;
          font-size: 17px;
        }

        .empty-queue p {
          margin: 0 0 15px;
          color: #94a3b8;
          font-size: 12px;
        }

        .empty-queue button {
          border: 0;
          border-radius: 9px;
          padding: 9px 14px;
          color: #2563eb;
          background: #eff6ff;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: all .18s ease;
        }

        .empty-queue button:hover {
          color: #fff;
          background: #2563eb;
          transform: translateY(-2px);
        }

        .modern-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modern-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15,23,42,.58);
          backdrop-filter: blur(8px);
          animation:
            modalFade .25s ease both;
        }

        .modern-modal {
          position: relative;
          z-index: 1;
          width: min(100%, 440px);
          overflow: hidden;
          padding: 30px;
          border: 1px solid
            rgba(255,255,255,.75);
          border-radius: 24px;
          background: rgba(255,255,255,.97);
          box-shadow:
            0 35px 90px
            rgba(15,23,42,.28);
          text-align: center;
          animation:
            modalEnter .4s
            cubic-bezier(.16,1,.3,1) both;
        }

        .modern-modal::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          height: 4px;
          background:
            linear-gradient(
              90deg,
              #2563eb,
              #60a5fa,
              #818cf8
            );
        }

        .modal-close {
          position: absolute;
          top: 13px;
          right: 13px;
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
          transition:
            all .18s ease;
        }

        .modal-close:hover {
          color: #1e40af;
          background: #dbeafe;
          transform: rotate(90deg);
        }

        .modal-icon {
          width: 68px;
          height: 68px;
          display: grid;
          place-items: center;
          margin: 4px auto 16px;
          border-radius: 21px;
          animation:
            iconPop .55s .1s
            cubic-bezier(.22,1,.36,1) both;
        }

        .modal-icon-success {
          color: #059669;
          background: #d1fae5;
          box-shadow:
            0 12px 28px
            rgba(16,185,129,.14);
        }

        .modal-icon-danger {
          color: #dc2626;
          background: #fee2e2;
          box-shadow:
            0 12px 28px
            rgba(239,68,68,.12);
        }

        .modal-eyebrow {
          display: inline-block;
          margin-bottom: 7px;
          color: #d97706;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .14em;
        }

        .eyebrow-success {
          color: #059669;
        }

        .eyebrow-danger {
          color: #dc2626;
        }

        .modern-modal h2 {
          margin: 0;
          color: #172033;
          font-size: 22px;
          letter-spacing: -.025em;
        }

        .modern-modal > p {
          margin: 9px auto 0;
          max-width: 350px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.65;
        }

        .text-success {
          color: #059669;
        }

        .text-danger {
          color: #dc2626;
        }

        .selected-doctor {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 20px 0;
          padding: 11px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #f8fafc;
          text-align: left;
          animation:
            selectedReveal .35s .18s ease both;
        }

        .selected-doctor-avatar {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 11px;
          color: #1d4ed8;
          background: #dbeafe;
          font-weight: 900;
        }

        .selected-doctor span,
        .selected-doctor strong {
          display: block;
        }

        .selected-doctor span {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
        }

        .selected-doctor strong {
          margin-top: 3px;
          color: #334155;
          font-size: 12px;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 9px;
          margin-top: 22px;
        }

        .modal-cancel,
        .modal-confirm,
        .result-button {
          min-height: 43px;
          border-radius: 11px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform .18s ease,
            box-shadow .18s ease,
            background .18s ease;
        }

        .modal-cancel {
          border: 1px solid #dbe2ea;
          background: #fff;
          color: #475569;
        }

        .modal-cancel:hover:not(:disabled) {
          background: #f8fafc;
          transform: translateY(-2px);
        }

        .modal-confirm,
        .result-button {
          border: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #fff;
        }

        .confirm-success,
        .result-success {
          background:
            linear-gradient(
              135deg,
              #10b981,
              #059669
            );
          box-shadow:
            0 9px 20px
            rgba(16,185,129,.19);
        }

        .confirm-danger,
        .result-danger {
          background:
            linear-gradient(
              135deg,
              #ef4444,
              #dc2626
            );
          box-shadow:
            0 9px 20px
            rgba(239,68,68,.18);
        }

        .modal-confirm:hover:not(:disabled),
        .result-button:hover {
          transform: translateY(-2px);
        }

        .modal-confirm:active:not(:disabled),
        .result-button:active {
          transform: scale(.98);
        }

        .modal-confirm:disabled,
        .modal-cancel:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        .button-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid
            rgba(255,255,255,.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation:
            approvalSpin .7s
            linear infinite;
        }

        .result-modal .result-button {
          width: 100%;
          margin-top: 20px;
        }

        @keyframes heroReveal {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes contentReveal {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes statReveal {
          from {
            opacity: 0;
            transform:
              translateY(18px)
              scale(.97);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @keyframes rowReveal {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes modalFade {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes modalEnter {
          from {
            opacity: 0;
            transform:
              translateY(22px)
              scale(.94);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @keyframes iconPop {
          from {
            opacity: 0;
            transform:
              scale(.55)
              rotate(-10deg);
          }

          to {
            opacity: 1;
            transform:
              scale(1)
              rotate(0);
          }
        }

        @keyframes selectedReveal {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes emptyReveal {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes emptyFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes refreshSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes dotPulse {
          0%,
          100% {
            opacity: .65;
            transform: scale(.9);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes floatOrb {
          0%,
          100% {
            transform:
              translate3d(0,0,0);
          }

          50% {
            transform:
              translate3d(12px,-15px,0);
          }
        }

        @media (max-width: 1100px) {
          .approval-stats {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .approval-page {
            min-height: 100vh;
            padding-bottom: 22px;
          }

          .approval-hero {
            align-items: flex-start;
            flex-direction: column;
            gap: 13px;
            margin-bottom: 15px;
          }

          .approval-hero h1 {
            font-size: 25px;
          }

          .approval-hero .subtitle {
            font-size: 12px;
          }

          .refresh-button {
            width: 100%;
            justify-content: center;
          }

          .approval-stats {
            display: flex;
            overflow-x: auto;
            gap: 9px;
            padding: 2px 2px 8px;
            margin-bottom: 11px;
            scrollbar-width: none;
            scroll-snap-type: x mandatory;
          }

          .approval-stats::-webkit-scrollbar {
            display: none;
          }

          .approval-stat {
            flex: 0 0 174px;
            min-height: 96px;
            padding: 13px;
            border-radius: 15px;
            scroll-snap-align: start;
          }

          .stat-icon {
            width: 38px;
            height: 38px;
            border-radius: 11px;
          }

          .stat-content strong {
            font-size: 23px;
          }

          .stat-content span {
            font-size: 10px;
          }

          .stat-content small {
            font-size: 8px;
          }

          .search-panel {
            width: 100%;
          }

          .filter-row {
            padding: 9px;
            gap: 7px;
          }

          .filter-heading {
            width: 100%;
            margin-bottom: 1px;
          }

          .filter-control {
            flex: 1 1 calc(50% - 5px);
            min-width: 0;
          }

          .clear-filter-button {
            width: 100%;
            margin-left: 0;
          }

          .queue-panel {
            border-radius: 15px;
          }

          .queue-panel-head {
            padding: 14px;
          }

          .queue-panel-head p {
            display: none;
          }

          .queue-title-row h2 {
            font-size: 15px;
          }

          .queue-live {
            padding: 6px 8px;
            font-size: 8px;
          }

          .approval-table {
            min-width: 1000px;
          }

          .modern-modal {
            padding: 27px 20px 20px;
            border-radius: 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .approval-page *,
          .approval-page *::before,
          .approval-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
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

          <p className="subtitle">
            Review doctor details submitted by the MR and take action.
          </p>
        </div>

        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => window.history.back()}
        >
          Back to Queue
        </Button>
      </div>

      <div className="review">
        <div className="panel">
          <div className="panelHead">
            <h3>Doctor Details</h3>
          </div>

          <div className="reviewGrid">
            <span>
              Doctor Name <b>Loading...</b>
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
