import { useNavigate, Link } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  Edit,
  MoreVertical,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  RotateCcw,
  Users,
  CalendarDays,
  Building2,
  MapPin,
  Phone,
  Mail,
  X,
} from "lucide-react";

import Layout from "../components/Layout";

import { Badge, Toolbar, DataTable, Crumbs } from "../components/UIComponents";

import { getSubmittedDoctors } from "../api/doctorAPI";

/* =========================================================
   MORE ACTIONS MENU
   ========================================================= */

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="submitted-more-menu" ref={menuRef}>
      <button
        type="button"
        className="submitted-action-icon more"
        onClick={() => setIsOpen((prev) => !prev)}
        title="More Actions"
      >
        <MoreVertical size={17} />
      </button>

      {isOpen && (
        <div className="submitted-dropdown">
          <button
            type="button"
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
          >
            <Trash2 size={15} />
            Delete Doctor
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
   ========================================================= */

function SubmittedStatCard({ title, value, icon: Icon, tone }) {
  return (
    <div className={`submitted-stat ${tone}`}>
      <div className="submitted-stat-top">
        <div className="submitted-stat-icon">
          <Icon size={19} />
        </div>

        <span className="submitted-stat-label">{title}</span>
      </div>

      <div className="submitted-stat-value">{value}</div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function SubmittedDoctors() {
  const navigate = useNavigate();

  const [doctorData, setDoctorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  /* =======================================================
     FETCH DOCTORS
  ======================================================= */

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const data = await getSubmittedDoctors(user.mrId);

        setDoctorData(data.doctors || []);
        setFilteredData(data.doctors || []);
      } catch (error) {
        console.log(error);
        setDoctorData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  /* =======================================================
     FILTER LOGIC
     KEPT SAME AS ORIGINAL
  ======================================================= */

  useEffect(() => {
    let result = [...doctorData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter(
        (doctor) =>
          doctor.doctorName?.toLowerCase().includes(term) ||
          doctor.speciality?.toLowerCase().includes(term) ||
          doctor.mclCode?.toLowerCase().includes(term),
      );
    }

    if (statusFilter) {
      result = result.filter(
        (doctor) => doctor.approvalStatus === statusFilter,
      );
    }

    if (specialtyFilter) {
      result = result.filter((doctor) => doctor.speciality === specialtyFilter);
    }

    if (dateFilter === "Today") {
      const today = new Date().toDateString();

      result = result.filter(
        (doctor) => new Date(doctor.createdAt).toDateString() === today,
      );
    } else if (dateFilter === "Last 7 Days") {
      const weekAgo = new Date();

      weekAgo.setDate(weekAgo.getDate() - 7);

      result = result.filter((doctor) => new Date(doctor.createdAt) >= weekAgo);
    } else if (dateFilter === "This Month") {
      const now = new Date();

      result = result.filter((doctor) => {
        const date = new Date(doctor.createdAt);

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });
    }

    setFilteredData(result);
  }, [searchTerm, statusFilter, specialtyFilter, dateFilter, doctorData]);

  /* =======================================================
     ACTIONS
  ======================================================= */

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
        // Original delete functionality preserved.
        // Add your delete API call here.
        alert("Delete functionality - Add your API call");
      } catch (error) {
        console.error("Error deleting doctor:", error);

        alert("Failed to delete doctor");
      }
    }
  };

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalSubmitted = filteredData.length;

  const pendingCount = filteredData.filter(
    (doctor) => doctor.approvalStatus === "pending",
  ).length;

  const approvedCount = filteredData.filter(
    (doctor) => doctor.approvalStatus === "approved",
  ).length;

  const rejectedCount = filteredData.filter(
    (doctor) => doctor.approvalStatus === "rejected",
  ).length;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Layout active="My Doctors">
        <div className="submitted-loading">
          <div className="submitted-spinner" />

          <p>Loading submitted doctors...</p>
        </div>
      </Layout>
    );
  }

  /* =======================================================
     TABLE ROWS
  ======================================================= */

  const tableRows = filteredData.map((doctor, i) => [
    /* Doctor */
    <div className="submitted-doctor-cell" key={`doctor-${i}`}>
      <div className="submitted-avatar">
        {(doctor.doctorName || "DR")
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase()}
      </div>

      <div>
        <strong>{doctor.doctorName || "-"}</strong>

        <span>{doctor.speciality || "-"}</span>
      </div>
    </div>,

    /* Speciality */
    doctor.speciality || "-",

    /* MCL */
    <span className="submitted-code">{doctor.mclCode || "-"}</span>,

    /* Clinic */
    <div className="submitted-info-cell">
      <Building2 size={15} />
      <span>{doctor.clinicName || "-"}</span>
    </div>,

    /* City */
    <div className="submitted-info-cell">
      <MapPin size={15} />
      <span>{doctor.city || "-"}</span>
    </div>,

    /* Area */
    doctor.area || "-",

    /* Email */
    <div className="submitted-contact-cell">
      <Mail size={14} />
      <span>{doctor.email || "-"}</span>
    </div>,

    /* Mobile */
    <div className="submitted-contact-cell">
      <Phone size={14} />
      <span>{doctor.mobile || "-"}</span>
    </div>,

    /* Brand */
    doctor.brand || "-",

    /* Current Business */
    doctor.currentBusiness || "0",

    /* Expected Business */
    doctor.expectedBusiness || "0",

    /* Brand Focus */
    doctor.brandFocus || "-",

    /* Other Activities */
    doctor.otherActivities || "-",

    /* Submitted On */
    new Date(doctor.createdAt).toLocaleDateString(),

    /* Modified */
    doctor.updatedAt
      ? new Date(doctor.updatedAt).toLocaleDateString()
      : new Date(doctor.createdAt).toLocaleDateString(),

    /* Status */
    doctor.approvalStatus === "approved" ? (
      <Badge tone="green">Approved</Badge>
    ) : doctor.approvalStatus === "rejected" ? (
      <Badge tone="red">Rejected / Returned</Badge>
    ) : (
      <Badge tone="orange">Pending Approval</Badge>
    ),

    /* Submitted By */
    "MR",

    /* Actions */
    <div className="submitted-row-actions" key={`actions-${i}`}>
      <button
        type="button"
        className="submitted-action-icon view"
        onClick={() => handleView(doctor._id)}
        title="View Details"
      >
        <Eye size={17} />
      </button>

      {doctor.approvalStatus === "pending" && (
        <button
          type="button"
          className="submitted-action-icon edit"
          onClick={() => handleEdit(doctor._id)}
          title="Edit Doctor"
        >
          <Edit size={17} />
        </button>
      )}

      {doctor.approvalStatus === "pending" && (
        <MoreActionsMenu
          onDelete={() => handleDelete(doctor._id, doctor.doctorName)}
        />
      )}
    </div>,
  ]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Layout active="My Doctors">
      <div className="submitted-page">
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="submitted-breadcrumb">
          <Link to="/mr-dashboard">Dashboard</Link>

          <span className="submitted-breadcrumb-separator">›</span>

          <Link to="/mr-dashboard">My Doctors</Link>

          <span className="submitted-breadcrumb-separator">›</span>

          <strong>Submitted Doctors</strong>
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="submitted-header">
          <div>
            <div className="submitted-eyebrow">
              <span />
              DOCTOR SUBMISSIONS
            </div>

            <h1>Submitted Doctors</h1>

            <p>
              Track doctors you've submitted for approval and manage their
              status.
            </p>
          </div>

          <div className="submitted-header-summary">
            <Users size={17} />

            <div>
              <strong>{doctorData.length}</strong>

              <span>Total submissions</span>
            </div>
          </div>
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="submitted-stats">
          <SubmittedStatCard
            title="Total Submitted"
            value={totalSubmitted}
            icon={Send}
            tone="purple"
          />

          <SubmittedStatCard
            title="Pending Approval"
            value={pendingCount}
            icon={Clock3}
            tone="orange"
          />

          <SubmittedStatCard
            title="Approved"
            value={approvedCount}
            icon={CheckCircle2}
            tone="green"
          />

          <SubmittedStatCard
            title="Rejected / Returned"
            value={rejectedCount}
            icon={XCircle}
            tone="red"
          />
        </div>

        {/* =================================================
            CONTENT PANEL
        ================================================= */}

        <section className="submitted-panel">
          {/* PANEL HEADER */}

          <div className="submitted-panel-header">
            <div>
              <div className="submitted-panel-title">
                <div className="submitted-panel-title-icon">
                  <Users size={18} />
                </div>

                <div>
                  <h2>Submitted Doctor Profiles</h2>

                  <p>
                    Review and manage all doctor profiles submitted for
                    approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="submitted-result-count">
              <strong>{filteredData.length}</strong>

              <span>
                {filteredData.length === 1 ? "Doctor" : "Doctors"} showing
              </span>
            </div>
          </div>

          {/* =================================================
              FILTER AREA
          ================================================= */}

          <div className="submitted-filter-shell">
            <div className="submitted-filter-heading">
              <div>
                <Filter size={15} />

                <span>Filter submissions</span>
              </div>

              {(searchTerm ||
                statusFilter ||
                specialtyFilter ||
                dateFilter) && (
                <button type="button" onClick={handleClearFilters}>
                  <RotateCcw size={14} />
                  Clear filters
                </button>
              )}
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
              specialtyOptions={[
                "Cardiology",
                "Dermatology",
                "Paediatrics",
                "Orthopedics",
                "General Physician",
              ]}
            />
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="submitted-table-section">
            {filteredData.length === 0 ? (
              <div className="submitted-empty">
                <div className="submitted-empty-icon">
                  <Search size={25} />
                </div>

                <h3>No submitted doctors found</h3>

                <p>Try changing your search or filter options.</p>

                <button type="button" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="submitted-table-scroll">
                <div className="submitted-table-inner">
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
                    rows={tableRows}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          PAGE STYLES
      ===================================================== */}

      <style>{`
        /* =========================================================
   SUBMITTED DOCTORS — UI ONLY
   Functionality untouched
========================================================= */

.submitted-page {
  --blue: #0758f7;
  --navy: #06185f;
  --text: #172554;
  --muted: #71809a;
  --soft-muted: #94a3b8;
  --border: #e5ebf5;
  --border-soft: #edf1f7;
  --page-bg: #f7f9fc;

  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 4px 0 40px;
  animation: submittedPageIn 0.3s ease;
}

@keyframes submittedPageIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =========================================================
   BREADCRUMB
========================================================= */

.submitted-breadcrumb {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 2px 0 20px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.4;
}

.submitted-breadcrumb a {
  color: #94a3b8;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.18s ease;
}

.submitted-breadcrumb a:hover {
  color: var(--blue);
}

.submitted-breadcrumb-separator {
  color: #c5cfdd;
  user-select: none;
}

.submitted-breadcrumb strong {
  color: var(--text);
  font-weight: 700;
}

/* =========================================================
   PAGE HEADER
========================================================= */

.submitted-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.submitted-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--blue);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.submitted-eyebrow span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 0 0 4px rgba(7, 88, 247, 0.08);
}

.submitted-header h1 {
  margin: 0;
  color: var(--navy);
  font-size: 29px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.035em;
}

.submitted-header p {
  max-width: 650px;
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

/* =========================================================
   HEADER TOTAL
========================================================= */

.submitted-header-summary {
  min-width: 165px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: #ffffff;
  box-shadow: 0 5px 20px rgba(15, 35, 70, 0.045);
}

.submitted-header-summary > svg {
  width: 19px;
  height: 19px;
  color: var(--blue);
}

.submitted-header-summary div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.submitted-header-summary strong {
  color: var(--navy);
  font-size: 17px;
  line-height: 1;
  font-weight: 800;
}

.submitted-header-summary span {
  color: var(--soft-muted);
  font-size: 9px;
  font-weight: 650;
}

/* =========================================================
   STAT CARDS
========================================================= */

.submitted-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.submitted-stat {
  position: relative;
  min-height: 88px;
  padding: 14px 15px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 4px 18px rgba(15, 35, 70, 0.035);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.submitted-stat:hover {
  transform: translateY(-2px);
  border-color: #d6e1f3;
  box-shadow: 0 9px 25px rgba(15, 35, 70, 0.07);
}

.submitted-stat::after {
  content: "";
  position: absolute;
  right: -30px;
  bottom: -35px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.035;
}

.submitted-stat-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.submitted-stat-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: currentColor;
}

.submitted-stat-icon svg {
  color: #ffffff;
}

.submitted-stat-label {
  color: #71809a;
  font-size: 10px;
  font-weight: 750;
}

.submitted-stat-value {
  margin-top: 11px;
  padding-left: 44px;
  color: var(--navy);
  font-size: 23px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.submitted-stat.purple {
  color: #7657e8;
}

.submitted-stat.orange {
  color: #e9a11a;
}

.submitted-stat.green {
  color: #20a464;
}

.submitted-stat.red {
  color: #e24a5a;
}

/* =========================================================
   MAIN PANEL
========================================================= */

.submitted-panel {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 7px 28px rgba(15, 35, 70, 0.045);
}

/* =========================================================
   PANEL HEADER
========================================================= */

.submitted-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 19px 20px 16px;
  border-bottom: 1px solid var(--border-soft);
}

.submitted-panel-title {
  display: flex;
  align-items: center;
  gap: 11px;
}

.submitted-panel-title-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid #dce7ff;
  border-radius: 10px;
  background: #f0f5ff;
  color: var(--blue);
}

.submitted-panel-header h2 {
  margin: 0;
  color: var(--navy);
  font-size: 16px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.submitted-panel-header p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.4;
}

.submitted-result-count {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 11px;
  border: 1px solid #dce7ff;
  border-radius: 999px;
  background: #f3f6ff;
  color: var(--blue);
  white-space: nowrap;
}

.submitted-result-count strong {
  font-size: 12px;
  font-weight: 850;
}

.submitted-result-count span {
  font-size: 9px;
  font-weight: 650;
}

/* =========================================================
   FILTER AREA
========================================================= */

.submitted-filter-shell {
  padding: 14px 20px 18px;
  background: #ffffff;
}

.submitted-filter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.submitted-filter-heading > div {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7b8aa2;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.submitted-filter-heading > div svg {
  color: var(--blue);
}

.submitted-filter-heading > button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 7px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--blue);
  font-size: 9px;
  font-weight: 750;
  cursor: pointer;
  transition: background 0.15s ease;
}

.submitted-filter-heading > button:hover {
  background: #f1f5ff;
  text-decoration: none;
}

/* =========================================================
   TABLE AREA
========================================================= */

.submitted-table-section {
  border-top: 1px solid var(--border-soft);
  background: #f8fafc;
}

.submitted-table-scroll {
  width: 100%;
  overflow-x: auto;
  padding: 14px 18px 18px;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.submitted-table-scroll::-webkit-scrollbar {
  height: 7px;
}

.submitted-table-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.submitted-table-scroll::-webkit-scrollbar-thumb {
  border-radius: 20px;
  background: #cbd5e1;
}

.submitted-table-inner {
  min-width: 1800px;
}

/* =========================================================
   TABLE
========================================================= */

.submitted-table-inner .dataTable {
  overflow: hidden;
  border: 1px solid #e1e8f2;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(15, 35, 70, 0.035);
}

.submitted-table-inner .dataTable table {
  width: auto !important;
  min-width: 1800px;
  border-collapse: separate;
  border-spacing: 0;
}

.submitted-table-inner .dataTable th {
  height: 44px;
  padding: 0 13px;
  border-bottom: 1px solid #e1e8f2;
  background: #f8fafc;
  color: #71809a;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.045em;
  text-transform: uppercase;
  white-space: nowrap;
  text-align: left;
}

.submitted-table-inner .dataTable td {
  min-height: 60px;
  padding: 9px 13px;
  border-bottom: 1px solid #eef2f7;
  background: #ffffff;
  color: #475569;
  font-size: 10px;
  white-space: nowrap;
  vertical-align: middle;
}

.submitted-table-inner .dataTable tbody tr {
  transition: background 0.15s ease;
}

.submitted-table-inner .dataTable tbody tr:hover td {
  background: #fbfdff;
}

.submitted-table-inner .dataTable tbody tr:last-child td {
  border-bottom: none;
}

/* =========================================================
   DOCTOR CELL
========================================================= */

.submitted-doctor-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 190px;
}

.submitted-avatar {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  display: grid;
  place-items: center;
  border: 1px solid #d7e3ff;
  border-radius: 10px;
  background: linear-gradient(145deg, #eef4ff, #e7efff);
  color: var(--blue);
  font-size: 10px;
  font-weight: 850;
}

.submitted-doctor-cell > div:last-child {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.submitted-doctor-cell strong {
  max-width: 150px;
  overflow: hidden;
  color: #172554;
  font-size: 11px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submitted-doctor-cell span {
  color: #8b98ab;
  font-size: 9px;
}

/* =========================================================
   TABLE INFORMATION
========================================================= */

.submitted-code {
  display: inline-flex;
  align-items: center;
  padding: 4px 7px;
  border: 1px solid #e7edf5;
  border-radius: 6px;
  background: #f7f9fc;
  color: #71809a;
  font-size: 9px;
  font-weight: 700;
}

.submitted-info-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 150px;
}

.submitted-info-cell svg {
  flex: 0 0 auto;
  color: #9aabc5;
}

.submitted-info-cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submitted-contact-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 190px;
}

.submitted-contact-cell svg {
  flex: 0 0 auto;
  color: #9aabc5;
}

.submitted-contact-cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   ACTIONS
========================================================= */

.submitted-row-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.submitted-action-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.submitted-action-icon:hover {
  transform: translateY(-1px);
}

.submitted-action-icon.view {
  border-color: #dbe6ff;
  background: #f3f6ff;
  color: #2563eb;
}

.submitted-action-icon.view:hover {
  background: #eaf0ff;
  border-color: #cddcff;
}

.submitted-action-icon.edit {
  border-color: #d8f0e3;
  background: #f1fbf5;
  color: #16a34a;
}

.submitted-action-icon.edit:hover {
  background: #e5f8ed;
  border-color: #c8ead8;
}

.submitted-action-icon.more {
  border-color: #e4e9f0;
  background: #f8fafc;
  color: #64748b;
}

.submitted-action-icon.more:hover {
  background: #eef2f7;
}

/* =========================================================
   MORE MENU
========================================================= */

.submitted-more-menu {
  position: relative;
}

.submitted-dropdown {
  position: absolute;
  top: calc(100% + 7px);
  right: 0;
  z-index: 1000;
  min-width: 165px;
  padding: 5px;
  border: 1px solid #e1e7f0;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 14px 35px rgba(15, 35, 70, 0.14);
}

.submitted-dropdown button {
  width: 100%;
  min-height: 35px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: #dc2626;
  font-size: 10px;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
}

.submitted-dropdown button:hover {
  background: #fff1f2;
}

/* =========================================================
   EMPTY STATE
========================================================= */

.submitted-empty {
  min-height: 300px;
  margin: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  box-sizing: border-box;
  text-align: center;
  border: 1px dashed #ccd8ea;
  border-radius: 13px;
  background: #fcfdff;
}

.submitted-empty-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  margin-bottom: 13px;
  border: 1px solid #dce7ff;
  border-radius: 14px;
  background: #f0f5ff;
  color: var(--blue);
}

.submitted-empty h3 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 800;
}

.submitted-empty p {
  margin: 7px 0 15px;
  color: #8a98ad;
  font-size: 11px;
}

.submitted-empty button {
  min-height: 36px;
  padding: 0 15px;
  border: 1px solid #dce5f3;
  border-radius: 8px;
  background: #ffffff;
  color: var(--blue);
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.submitted-empty button:hover {
  background: #f3f6ff;
  border-color: #cbd9f2;
}

/* =========================================================
   LOADING
========================================================= */

.submitted-loading {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 11px;
  color: #6b7894;
  font-size: 12px;
}

.submitted-loading p {
  margin: 0;
}

.submitted-spinner {
  width: 29px;
  height: 29px;
  border: 3px solid #dfe7f3;
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: submittedSpin 0.7s linear infinite;
}

@keyframes submittedSpin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {
  .submitted-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .submitted-page {
    padding-bottom: 25px;
  }

  .submitted-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
  }

  .submitted-header-summary {
    width: 100%;
    box-sizing: border-box;
  }

  .submitted-panel-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 13px;
  }

  .submitted-result-count {
    align-self: flex-start;
  }

  .submitted-table-scroll {
    padding-left: 12px;
    padding-right: 12px;
  }

  .submitted-filter-shell {
    padding-left: 14px;
    padding-right: 14px;
  }
}

@media (max-width: 560px) {
  .submitted-breadcrumb {
    margin-bottom: 15px;
  }

  .submitted-header {
    margin-bottom: 17px;
  }

  .submitted-header h1 {
    font-size: 25px;
  }

  .submitted-header p {
    font-size: 12px;
  }

  .submitted-stats {
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }

  .submitted-stat {
    min-height: 82px;
    padding: 12px;
  }

  .submitted-stat-icon {
    width: 31px;
    height: 31px;
    flex-basis: 31px;
  }

  .submitted-stat-label {
    font-size: 9px;
  }

  .submitted-stat-value {
    margin-top: 9px;
    padding-left: 41px;
    font-size: 21px;
  }

  .submitted-panel {
    border-radius: 13px;
  }

  .submitted-panel-header {
    padding: 15px;
  }

  .submitted-filter-shell {
    padding: 12px 14px 14px;
  }

  .submitted-table-inner {
    min-width: 1800px;
  }
}

@media (max-width: 390px) {
  .submitted-stats {
    grid-template-columns: 1fr;
  }
}
        `}</style>
    </Layout>
  );
}
