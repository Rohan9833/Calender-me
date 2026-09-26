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
        /* =====================================================
          BREADCRUMB
        ===================================================== */

        .submitted-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;

          margin-bottom: 14px;

          font-size: 13px;
          line-height: 1.4;
        }

        .submitted-breadcrumb a {
          color: #9aa8bd;
          text-decoration: none;

          cursor: pointer;

          transition: color 0.15s ease;
        }

        .submitted-breadcrumb a:hover {
          color: #0758f7;
        }

        .submitted-breadcrumb-separator {
          color: #b9c5d7;
          user-select: none;
        }

        .submitted-breadcrumb strong {
          color: #172554;
          font-weight: 700;
        }
              
        /* =====================================================
           PAGE
        ===================================================== */

        .submitted-page {
          --submitted-blue: #0758f7;
          --submitted-navy: #06185f;
          --submitted-border: #dbe5f6;
          --submitted-muted: #6b7894;

          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding-bottom: 35px;

          animation: submittedPageIn .25s ease;
        }

        @keyframes submittedPageIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .submitted-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;

          margin-top: 13px;
          margin-bottom: 20px;
        }

        .submitted-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 7px;

          color: var(--submitted-blue);
          font-size: 11px;
          font-weight: 850;
          letter-spacing: .09em;
        }

        .submitted-eyebrow span {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: var(--submitted-blue);

          box-shadow:
            0 0 0 4px rgba(7, 88, 247, .08);
        }

        .submitted-header h1 {
          margin: 0;

          color: var(--submitted-navy);

          font-size: 30px;
          line-height: 1.1;
          font-weight: 800;

          letter-spacing: -.03em;
        }

        .submitted-header p {
          margin: 8px 0 0;

          color: var(--submitted-muted);

          font-size: 14px;
          line-height: 1.5;
        }

        .submitted-header-summary {
          min-width: 170px;

          display: flex;
          align-items: center;
          gap: 11px;

          padding: 10px 13px;

          border: 1px solid var(--submitted-border);
          border-radius: 11px;

          background: white;

          box-shadow:
            0 4px 14px rgba(24, 55, 112, .04);
        }

        .submitted-header-summary > svg {
          color: var(--submitted-blue);
        }

        .submitted-header-summary div {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .submitted-header-summary strong {
          color: var(--submitted-navy);

          font-size: 16px;
          line-height: 1.2;
        }

        .submitted-header-summary span {
          color: #8b9ab2;

          font-size: 10px;
          font-weight: 600;
        }

        /* =====================================================
           STAT CARDS
        ===================================================== */

        .submitted-stats {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 12px;

          margin-bottom: 18px;
        }

        .submitted-stat {
          position: relative;

          min-height: 100px;

          padding: 14px 16px;

          overflow: hidden;

          border: 1px solid var(--submitted-border);
          border-radius: 12px;

          background: white;

          box-shadow:
            0 4px 16px rgba(24, 55, 112, .04);

          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }

        .submitted-stat:hover {
          transform: translateY(-1px);

          box-shadow:
            0 7px 20px rgba(24, 55, 112, .07);
        }

        .submitted-stat::after {
          content: "";

          position: absolute;

          width: 70px;
          height: 70px;

          right: -25px;
          bottom: -28px;

          border-radius: 50%;

          background: currentColor;

          opacity: .045;
        }

        .submitted-stat-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .submitted-stat-icon {
          width: 38px;
          height: 38px;

          flex: 0 0 38px;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background: currentColor;

          color: inherit;
        }

        .submitted-stat-icon svg {
          color: white;
        }

        .submitted-stat-label {
          color: #6b7894;

          font-size: 11px;
          font-weight: 750;
        }

        .submitted-stat-value {
          margin-top: 9px;
          padding-left: 48px;

          color: var(--submitted-navy);

          font-size: 24px;
          line-height: 1;

          font-weight: 800;
        }

        .submitted-stat.purple {
          color: #7c3aed;
        }

        .submitted-stat.orange {
          color: #f59e0b;
        }

        .submitted-stat.green {
          color: #16a34a;
        }

        .submitted-stat.red {
          color: #ef4444;
        }

        /* =====================================================
           MAIN PANEL
        ===================================================== */

        .submitted-panel {
          overflow: hidden;

          border: 1px solid var(--submitted-border);
          border-radius: 14px;

          background: white;

          box-shadow:
            0 6px 22px rgba(24, 55, 112, .05);
        }

        /* =====================================================
           PANEL HEADER
        ===================================================== */

        .submitted-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          padding: 18px 20px 15px;
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

          border: 1px solid #dce8ff;
          border-radius: 9px;

          background: #eef4ff;

          color: var(--submitted-blue);
        }

        .submitted-panel-header h2 {
          margin: 0;

          color: var(--submitted-navy);

          font-size: 18px;
          line-height: 1.25;

          font-weight: 800;
        }

        .submitted-panel-header p {
          margin: 4px 0 0;

          color: var(--submitted-muted);

          font-size: 12px;
        }

        .submitted-result-count {
          display: flex;
          align-items: center;
          gap: 5px;

          padding: 7px 11px;

          border-radius: 999px;

          background: #eef4ff;

          color: var(--submitted-blue);

          white-space: nowrap;
        }

        .submitted-result-count strong {
          font-size: 12px;
          font-weight: 850;
        }

        .submitted-result-count span {
          font-size: 10px;
          font-weight: 650;
        }

        /* =====================================================
           FILTER SHELL
        ===================================================== */

        .submitted-filter-shell {
          padding: 0 20px 17px;
        }

        .submitted-filter-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 8px;
        }

        .submitted-filter-heading > div {
          display: flex;
          align-items: center;
          gap: 6px;

          color: #7d8da6;

          font-size: 10px;
          font-weight: 800;

          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .submitted-filter-heading > div svg {
          color: var(--submitted-blue);
        }

        .submitted-filter-heading > button {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          border: none;
          background: transparent;

          color: var(--submitted-blue);

          font-size: 10px;
          font-weight: 750;

          cursor: pointer;
        }

        .submitted-filter-heading > button:hover {
          text-decoration: underline;
        }

        /* =====================================================
           TABLE SECTION
        ===================================================== */

        .submitted-table-section {
          border-top: 1px solid #edf2f8;

          background: #f8faff;
        }

        .submitted-table-scroll {
          width: 100%;

          overflow-x: auto;

          padding: 0 20px 20px;

          box-sizing: border-box;

          scrollbar-width: thin;
          scrollbar-color: #c7d3e6 transparent;
        }

        .submitted-table-inner {
          min-width: 1800px;

          padding-top: 15px;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .submitted-table-inner .dataTable {
          overflow: hidden;

          border: 1px solid #dfe8f6;
          border-radius: 11px;

          background: white;

          box-shadow:
            0 2px 8px rgba(24, 55, 112, .03);
        }

        .submitted-table-inner .dataTable table {
          width: auto !important;
          min-width: 1800px;

          border-collapse: separate;
          border-spacing: 0;
        }

        .submitted-table-inner .dataTable th {
          height: 46px;

          padding: 0 14px;

          border-bottom: 1px solid #dfe8f6;

          background: #f8faff;

          color: #71819d;

          font-size: 10px;
          font-weight: 850;

          letter-spacing: .04em;
          text-transform: uppercase;

          white-space: nowrap;

          text-align: left;
        }

        .submitted-table-inner .dataTable td {
          min-height: 62px;

          padding: 10px 14px;

          border-bottom: 1px solid #edf2f8;

          background: white;

          color: #475569;

          font-size: 11px;

          white-space: nowrap;
          vertical-align: middle;
        }

        .submitted-table-inner .dataTable tbody tr {
          transition: background .15s ease;
        }

        .submitted-table-inner .dataTable tbody tr:hover td {
          background: #fbfdff;
        }

        .submitted-table-inner .dataTable tbody tr:last-child td {
          border-bottom: none;
        }

        /* =====================================================
           DOCTOR CELL
        ===================================================== */

        .submitted-doctor-cell {
          display: flex;
          align-items: center;

          gap: 9px;

          min-width: 190px;
        }

        .submitted-avatar {
          width: 36px;
          height: 36px;

          flex: 0 0 36px;

          display: grid;
          place-items: center;

          border: 1px solid #d8e5ff;
          border-radius: 9px;

          background: #eef4ff;

          color: var(--submitted-blue);

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
          max-width: 145px;

          overflow: hidden;

          color: #172554;

          font-size: 12px;
          font-weight: 800;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .submitted-doctor-cell span {
          color: #8a98ad;

          font-size: 10px;
        }

        /* =====================================================
           TABLE INFO
        ===================================================== */

        .submitted-code {
          display: inline-flex;

          padding: 4px 7px;

          border-radius: 5px;

          background: #f3f6fb;

          color: #71819d;

          font-size: 10px;
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

          color: #91a4c4;
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

          color: #91a4c4;
        }

        .submitted-contact-cell span {
          overflow: hidden;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .submitted-row-actions {
          display: flex;
          align-items: center;

          gap: 5px;
        }

        .submitted-action-icon {
          position: relative;

          width: 31px;
          height: 31px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          border: 1px solid transparent;
          border-radius: 7px;

          background: transparent;

          cursor: pointer;

          transition:
            background .15s ease,
            border-color .15s ease,
            transform .15s ease;
        }

        .submitted-action-icon:hover {
          transform: translateY(-1px);
        }

        .submitted-action-icon.view {
          border-color: #dbe8ff;

          background: #f2f6ff;

          color: #2563eb;
        }

        .submitted-action-icon.view:hover {
          background: #e7efff;
        }

        .submitted-action-icon.edit {
          border-color: #d7f0e4;

          background: #effbf5;

          color: #16a34a;
        }

        .submitted-action-icon.edit:hover {
          background: #e2f7ec;
        }

        .submitted-action-icon.more {
          border-color: #e3e9f2;

          background: #f8fafc;

          color: #64748b;
        }

        .submitted-action-icon.more:hover {
          background: #eef2f7;
        }

        /* =====================================================
           MORE MENU
        ===================================================== */

        .submitted-more-menu {
          position: relative;
        }

        .submitted-dropdown {
          position: absolute;

          top: calc(100% + 6px);
          right: 0;

          z-index: 1000;

          min-width: 155px;

          padding: 5px;

          border: 1px solid #e1e7f0;
          border-radius: 9px;

          background: white;

          box-shadow:
            0 12px 30px rgba(15, 35, 70, .13);
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

          font-size: 11px;
          font-weight: 650;

          text-align: left;

          cursor: pointer;
        }

        .submitted-dropdown button:hover {
          background: #fff1f2;
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .submitted-empty {
          min-height: 280px;

          margin: 15px 20px 20px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          border: 1px dashed #cbd8ed;
          border-radius: 11px;

          background: #fbfdff;
        }

        .submitted-empty-icon {
          width: 52px;
          height: 52px;

          display: grid;
          place-items: center;

          margin-bottom: 12px;

          border-radius: 13px;

          background: #eef4ff;

          color: var(--submitted-blue);
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

          font-size: 12px;
        }

        .submitted-empty button {
          min-height: 37px;

          padding: 0 15px;

          border: 1px solid var(--submitted-border);
          border-radius: 8px;

          background: white;

          color: var(--submitted-blue);

          font-size: 11px;
          font-weight: 750;

          cursor: pointer;
        }

        .submitted-empty button:hover {
          background: #f5f8ff;
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .submitted-loading {
          min-height: 60vh;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 11px;

          color: #6b7894;

          font-size: 13px;
        }

        .submitted-loading p {
          margin: 0;
        }

        .submitted-spinner {
          width: 30px;
          height: 30px;

          border: 3px solid #dbe5f6;
          border-top-color: #0758f7;

          border-radius: 50%;

          animation:
            submittedSpin .7s linear infinite;
        }

        @keyframes submittedSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1100px) {
          .submitted-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .submitted-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .submitted-header-summary {
            width: 100%;
            box-sizing: border-box;
          }

          .submitted-panel-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .submitted-result-count {
            align-self: flex-start;
          }

          .submitted-table-scroll {
            padding-left: 12px;
            padding-right: 12px;
          }
        }

        @media (max-width: 560px) {
          .submitted-stats {
            grid-template-columns: 1fr;
          }

          .submitted-header h1 {
            font-size: 27px;
          }

          .submitted-header p {
            font-size: 13px;
          }

          .submitted-panel-header {
            padding: 16px;
          }

          .submitted-filter-shell {
            padding: 0 16px 15px;
          }

          .submitted-table-inner {
            min-width: 1800px;
          }
        }
      `}</style>
    </Layout>
  );
}
