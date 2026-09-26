import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import Layout from "../components/Layout";
import { getDraftDoctors, deleteDoctor } from "../api/doctorAPI";

export default function DraftDoctors() {
  const navigate = useNavigate();

  const [doctorData, setDoctorData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    doctorId: null,
    doctorName: "",
  });

  /* =========================================================
     FETCH DRAFT DOCTORS
  ========================================================= */

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const data = await getDraftDoctors(user?.mrId);

        setDoctorData(data?.doctors || []);
      } catch (error) {
        console.error("Failed to fetch draft doctors:", error);
        setDoctorData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredData = useMemo(() => {
    let result = [...doctorData];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((doctor) =>
        [
          doctor.doctorName,
          doctor.speciality,
          doctor.mclCode,
          doctor.clinicName,
          doctor.city,
          doctor.area,
          doctor.email,
          doctor.mobile,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(search)
          )
      );
    }

    if (specialtyFilter) {
      result = result.filter(
        (doctor) => doctor.speciality === specialtyFilter
      );
    }

    if (dateFilter) {
      const now = new Date();

      if (dateFilter === "Today") {
        result = result.filter((doctor) => {
          const date = new Date(doctor.createdAt);

          return date.toDateString() === now.toDateString();
        });
      }

      if (dateFilter === "Last 7 Days") {
        const weekAgo = new Date();

        weekAgo.setDate(now.getDate() - 7);

        result = result.filter(
          (doctor) => new Date(doctor.createdAt) >= weekAgo
        );
      }

      if (dateFilter === "This Month") {
        result = result.filter((doctor) => {
          const date = new Date(doctor.createdAt);

          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });
      }
    }

    return result;
  }, [doctorData, searchTerm, specialtyFilter, dateFilter]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const thisMonthCount = useMemo(() => {
    const now = new Date();

    return doctorData.filter((doctor) => {
      const date = new Date(doctor.createdAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [doctorData]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getInitials = (name) => {
    if (!name) return "DR";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSpecialtyFilter("");
    setDateFilter("");
  };

  const hasFilters = searchTerm || specialtyFilter || dateFilter;

  /* =========================================================
     DELETE
  ========================================================= */

  const openDeletePopup = (doctorId, doctorName) => {
    setDeletePopup({
      isOpen: true,
      doctorId,
      doctorName,
    });
  };

  const closeDeletePopup = () => {
    setDeletePopup({
      isOpen: false,
      doctorId: null,
      doctorName: "",
    });
  };

  const handleDelete = async () => {
    const { doctorId } = deletePopup;

    if (!doctorId) return;

    try {
      await deleteDoctor(doctorId);

      setDoctorData((current) =>
        current.filter((doctor) => doctor._id !== doctorId)
      );

      closeDeletePopup();
    } catch (error) {
      console.error("Delete error:", error);

      alert("Failed to delete doctor.");
    }
  };

  const specialtyOptions = [
    "Cardiology",
    "Dermatology",
    "Paediatrics",
    "Orthopedics",
    "General Physician",
  ];

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <Layout active="My Doctors">
        <div className="draft-loading">
          <div className="draft-spinner" />
          <span>Loading draft doctors...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout active="My Doctors">
      <div className="draft-page">

        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <div className="draft-breadcrumb">
          <span>My Doctors</span>
          <ChevronRight size={15} />
          <strong>Draft Doctors</strong>
        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="draft-header">
          <div>
            <div className="draft-eyebrow">
              <span />
              DRAFT WORKSPACE
            </div>

            <h1>Draft Doctors</h1>

            <p>
              Manage and continue editing doctor profiles saved as drafts.
            </p>
          </div>

          <button
            type="button"
            className="draft-add"
            onClick={() => navigate("/add-doctor")}
          >
            <UserPlus size={18} />
            Add New Doctor
          </button>
        </div>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="draft-stats">
          <div className="draft-stat draft-stat-main">
            <div className="draft-stat-icon">
              <FileText size={22} />
            </div>

            <div>
              <span>Total Draft Doctors</span>
              <strong>{doctorData.length}</strong>
              <small>Saved doctor profiles</small>
            </div>
          </div>

          <div className="draft-stat">
            <div className="draft-stat-heading">
              <span>Added This Month</span>
              <CalendarDays size={17} />
            </div>

            <strong>{thisMonthCount}</strong>
            <small>New draft profiles</small>
          </div>

          <div className="draft-stat">
            <div className="draft-stat-heading">
              <span>Currently Showing</span>
              <Search size={17} />
            </div>

            <strong>{filteredData.length}</strong>
            <small>Matching current filters</small>
          </div>
        </div>

        {/* =====================================================
            MAIN PANEL
        ===================================================== */}

        <section className="draft-panel">
          <div className="draft-panel-header">
            <div>
              <h2>Saved Doctor Profiles</h2>
              <p>
                Search your drafts and continue where you left off.
              </p>
            </div>

            <span className="draft-count">
              {filteredData.length}{" "}
              {filteredData.length === 1 ? "Doctor" : "Doctors"}
            </span>
          </div>

          {/* ===================================================
              FILTERS
          =================================================== */}

          <div className="draft-filters">
            <div className="draft-search">
              <Search size={19} />

              <input
                type="text"
                placeholder="Search doctor, speciality, MCL, clinic or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="">All Specialities</option>

              {specialtyOptions.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            <div className="draft-date">
              <CalendarDays size={17} />

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="">Any Date</option>
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                className="draft-reset"
                onClick={clearFilters}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            )}
          </div>

          {/* ===================================================
              EMPTY
          =================================================== */}

          {filteredData.length === 0 ? (
            <div className="draft-empty">
              <div className="draft-empty-icon">
                <FileText size={30} />
              </div>

              <h3>No draft doctors found</h3>

              <p>
                {doctorData.length
                  ? "Try changing your search or filters."
                  : "Doctors saved as drafts will appear here."}
              </p>

              <button
                type="button"
                className="draft-outline"
                onClick={
                  doctorData.length
                    ? clearFilters
                    : () => navigate("/add-doctor")
                }
              >
                {doctorData.length
                  ? "Clear Filters"
                  : "Add New Doctor"}
              </button>
            </div>
          ) : (
            /* =================================================
               DOCTORS
            ================================================= */

            <div className="draft-doctors">
              {filteredData.map((doctor) => (
                <div
                  className="draft-doctor"
                  key={doctor._id}
                >
                  {/* -----------------------------------------
                      DOCTOR
                  ----------------------------------------- */}

                  <div className="draft-doctor-identity">
                    <div className="draft-avatar">
                      {getInitials(doctor.doctorName)}
                    </div>

                    <div className="draft-doctor-name">
                      <div className="draft-name-line">
                        <h3>
                          {doctor.doctorName || "Unnamed Doctor"}
                        </h3>

                        <span className="draft-badge">
                          Draft
                        </span>
                      </div>

                      <p>
                        {doctor.speciality ||
                          "Speciality not specified"}
                      </p>

                      {doctor.mclCode && (
                        <span className="draft-mcl">
                          MCL {doctor.mclCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* -----------------------------------------
                      CLINIC
                  ----------------------------------------- */}

                  <div className="draft-field">
                    <div className="draft-field-icon">
                      <MapPin size={20} />
                    </div>

                    <div className="draft-field-content">
                      <label>CLINIC</label>

                      <strong>
                        {doctor.clinicName ||
                          "Not specified"}
                      </strong>

                      <span>
                        {doctor.area
                          ? `${doctor.area}${
                              doctor.city
                                ? `, ${doctor.city}`
                                : ""
                            }`
                          : doctor.city ||
                            "Location not specified"}
                      </span>
                    </div>
                  </div>

                  {/* -----------------------------------------
                      CONTACT
                  ----------------------------------------- */}

                  <div className="draft-field">
                    <div className="draft-field-icon">
                      <Phone size={20} />
                    </div>

                    <div className="draft-field-content">
                      <label>CONTACT</label>

                      <strong>
                        {doctor.mobile ||
                          "No mobile number"}
                      </strong>

                      <span className="draft-mail">
                        <Mail size={15} />

                        {doctor.email ||
                          "No email address"}
                      </span>
                    </div>
                  </div>

                  {/* -----------------------------------------
                      BUSINESS
                  ----------------------------------------- */}

                  <div className="draft-field">
                    <div className="draft-field-icon">
                      <span className="draft-rupee">
                        ₹
                      </span>
                    </div>

                    <div className="draft-field-content">
                      <label>BUSINESS</label>

                      <div className="draft-business">
                        <div>
                          <span>Current</span>

                          <strong>
                            {doctor.currentBusiness || "0"}
                          </strong>
                        </div>

                        <div>
                          <span>Expected</span>

                          <strong>
                            {doctor.expectedBusiness || "0"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* -----------------------------------------
                      SAVED
                  ----------------------------------------- */}

                  <div className="draft-field draft-saved">
                    <div className="draft-field-icon">
                      <CalendarDays size={20} />
                    </div>

                    <div className="draft-field-content">
                      <label>SAVED</label>

                      <strong>
                        {formatDate(doctor.createdAt)}
                      </strong>

                      <span>
                        Modified{" "}
                        {formatDate(
                          doctor.updatedAt ||
                            doctor.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  {/* -----------------------------------------
                      ACTIONS
                  ----------------------------------------- */}

                  <div className="draft-actions">
                    <button
                      type="button"
                      className="draft-edit"
                      onClick={() =>
                        navigate(
                          `/edit-doctor/${doctor._id}`
                        )
                      }
                    >
                      <Pencil size={17} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="draft-delete"
                      onClick={() =>
                        openDeletePopup(
                          doctor._id,
                          doctor.doctorName
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            DELETE MODAL
        ===================================================== */}

        {deletePopup.isOpen && (
          <div
            className="draft-modal-overlay"
            onClick={closeDeletePopup}
          >
            <div
              className="draft-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="draft-modal-close"
                onClick={closeDeletePopup}
              >
                <X size={20} />
              </button>

              <div className="draft-warning">
                <AlertCircle size={30} />
              </div>

              <h2>Delete Doctor?</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {deletePopup.doctorName}
                </strong>
                ?
                <br />
                This action cannot be undone.
              </p>

              <div className="draft-modal-actions">
                <button
                  type="button"
                  className="draft-cancel"
                  onClick={closeDeletePopup}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="draft-confirm"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} />
                  Delete Doctor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          CSS
      ======================================================= */}

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .draft-page {
          --blue: #0758f7;
          --navy: #06185f;
          --border: #dbe5f6;
          --muted: #6b7894;

          width: 100%;
          max-width: 1450px;

          margin: 0 auto;

          animation: draftIn .25s ease;
        }

        /* =====================================================
           BREADCRUMB
        ===================================================== */

        .draft-breadcrumb {
          display: flex;
          align-items: center;

          gap: 6px;

          margin-bottom: 14px;

          color: #9aa8bd;

          font-size: 13px;
        }

        .draft-breadcrumb svg {
          color: #b9c5d7;
        }

        .draft-breadcrumb strong {
          color: #172554;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .draft-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 20px;
        }

        .draft-eyebrow {
          display: flex;
          align-items: center;

          gap: 8px;

          margin-bottom: 7px;

          color: var(--blue);

          font-size: 11px;
          font-weight: 850;

          letter-spacing: .09em;
        }

        .draft-eyebrow span {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: var(--blue);

          box-shadow:
            0 0 0 4px rgba(7, 88, 247, .08);
        }

        .draft-header h1 {
          margin: 0;

          color: var(--navy);

          font-size: 30px;
          font-weight: 800;

          line-height: 1.1;
          letter-spacing: -.03em;
        }

        .draft-header p {
          margin: 8px 0 0;

          color: var(--muted);

          font-size: 14px;
        }

        .draft-add {
          height: 44px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          padding: 0 18px;

          border: 1px solid var(--blue);
          border-radius: 9px;

          background: var(--blue);

          color: white;

          font-size: 13px;
          font-weight: 750;

          cursor: pointer;

          box-shadow:
            0 7px 18px rgba(7, 88, 247, .15);

          transition: .2s ease;
        }

        .draft-add:hover {
          transform: translateY(-1px);

          box-shadow:
            0 10px 24px rgba(7, 88, 247, .2);
        }

        /* =====================================================
           STATS
        ===================================================== */

        .draft-stats {
          display: grid;

          grid-template-columns:
            1.3fr
            1fr
            1fr;

          gap: 12px;

          margin-bottom: 18px;
        }

        .draft-stat {
          min-height: 94px;

          padding: 16px 18px;

          border: 1px solid var(--border);
          border-radius: 12px;

          background: white;

          box-shadow:
            0 4px 16px rgba(24, 55, 112, .04);
        }

        .draft-stat-main {
          display: flex;
          align-items: center;

          gap: 13px;
        }

        .draft-stat-icon {
          width: 45px;
          height: 45px;

          flex: 0 0 45px;

          display: grid;
          place-items: center;

          border: 1px solid #dce8ff;
          border-radius: 11px;

          background: #eef4ff;

          color: var(--blue);
        }

        .draft-stat span {
          color: var(--muted);

          font-size: 12px;
          font-weight: 700;
        }

        .draft-stat strong {
          display: block;

          margin-top: 5px;

          color: var(--navy);

          font-size: 26px;
          line-height: 1;
        }

        .draft-stat small {
          display: block;

          margin-top: 6px;

          color: #9aa8bd;

          font-size: 11px;
        }

        .draft-stat-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .draft-stat-heading svg {
          color: #9cb0d0;
        }

        /* =====================================================
           MAIN PANEL
        ===================================================== */

        .draft-panel {
          overflow: hidden;

          border: 1px solid var(--border);
          border-radius: 14px;

          background: white;

          box-shadow:
            0 6px 22px rgba(24, 55, 112, .05);
        }

        .draft-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 19px 21px 15px;
        }

        .draft-panel-header h2 {
          margin: 0;

          color: var(--navy);

          font-size: 18px;
          font-weight: 800;
        }

        .draft-panel-header p {
          margin: 5px 0 0;

          color: var(--muted);

          font-size: 12px;
        }

        .draft-count {
          padding: 7px 11px;

          border-radius: 999px;

          background: #eef4ff;

          color: var(--blue);

          font-size: 11px;
          font-weight: 800;
        }

        /* =====================================================
           FILTERS
        ===================================================== */

        .draft-filters {
          display: grid;

          grid-template-columns:
            minmax(300px, 1fr)
            190px
            175px
            auto;

          gap: 9px;

          padding: 0 21px 18px;
        }

        .draft-search,
        .draft-filters select,
        .draft-date {
          height: 42px;

          border: 1px solid var(--border);
          border-radius: 9px;

          background: #fbfdff;

          color: #475569;

          font-size: 12px;

          outline: none;
        }

        .draft-search {
          display: flex;
          align-items: center;

          gap: 9px;

          padding: 0 11px;

          color: #8b9ab2;
        }

        .draft-search:focus-within,
        .draft-filters select:focus,
        .draft-date:focus-within {
          border-color: #9ab8f7;

          background: white;

          box-shadow:
            0 0 0 3px rgba(7, 88, 247, .07);
        }

        .draft-search input {
          width: 100%;

          border: 0;
          outline: 0;

          background: transparent;

          color: #1e293b;

          font-size: 12px;
        }

        .draft-search input::placeholder {
          color: #9aa8bd;
        }

        .draft-search button {
          border: 0;

          background: transparent;

          color: #94a3b8;

          cursor: pointer;
        }

        .draft-filters > select {
          width: 100%;

          padding: 0 11px;

          cursor: pointer;
        }

        .draft-date {
          display: flex;
          align-items: center;

          gap: 7px;

          padding: 0 10px;

          color: #8b9ab2;
        }

        .draft-date select {
          width: 100%;

          border: 0;
          outline: 0;

          background: transparent;

          color: #475569;

          font-size: 12px;

          cursor: pointer;
        }

        .draft-reset {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          height: 42px;

          padding: 0 12px;

          border: 1px solid var(--border);
          border-radius: 9px;

          background: white;

          color: #64748b;

          font-size: 11px;
          font-weight: 700;

          cursor: pointer;
        }

        .draft-reset:hover {
          color: var(--blue);
          border-color: #b9c8e5;
        }

        /* =====================================================
           DOCTOR LIST
        ===================================================== */

        .draft-doctors {
          display: flex;
          flex-direction: column;

          gap: 9px;

          padding: 0 21px 21px;

          background: #f8faff;

          border-top: 1px solid #edf2fa;
        }

        /* =====================================================
           DOCTOR CARD
        ===================================================== */

        .draft-doctor {
          display: flex;
          align-items: center;

          width: 100%;

          min-height: 124px;

          margin-top: 9px;

          padding: 16px;

          box-sizing: border-box;

          border: 1px solid #dfe8f6;
          border-radius: 12px;

          background: white;

          box-shadow:
            0 2px 8px rgba(24, 55, 112, .03);

          transition:
            border-color .18s ease,
            box-shadow .18s ease;
        }

        .draft-doctor:hover {
          border-color: #c9d8ed;

          box-shadow:
            0 5px 15px rgba(24, 55, 112, .06);
        }

        /* =====================================================
           IDENTITY
        ===================================================== */

        .draft-doctor-identity {
          width: 260px;
          min-width: 260px;

          display: flex;
          align-items: center;

          gap: 12px;

          padding-right: 17px;

          border-right: 1px solid #edf2f8;
        }

        .draft-avatar {
          width: 48px;
          height: 48px;

          flex: 0 0 48px;

          display: grid;
          place-items: center;

          border: 1px solid #d8e5ff;
          border-radius: 12px;

          background: #eef4ff;

          color: var(--blue);

          font-size: 13px;
          font-weight: 850;
        }

        .draft-doctor-name {
          min-width: 0;
        }

        .draft-name-line {
          display: flex;
          align-items: center;

          gap: 7px;
        }

        .draft-doctor-name h3 {
          margin: 0;

          overflow: hidden;

          color: #172554;

          font-size: 15px;
          font-weight: 800;

          line-height: 1.3;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .draft-doctor-name p {
          margin: 5px 0 0;

          overflow: hidden;

          color: #64748b;

          font-size: 12px;
          line-height: 1.35;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .draft-badge {
          flex: 0 0 auto;

          padding: 4px 8px;

          border-radius: 999px;

          background: #fff7ed;

          color: #c2410c;

          font-size: 10px;
          font-weight: 800;
        }

        .draft-mcl {
          display: inline-block;

          margin-top: 5px;

          padding: 3px 7px;

          border-radius: 5px;

          background: #f3f6fb;

          color: #7b8aa2;

          font-size: 10px;
          font-weight: 700;
        }

        /* =====================================================
           FIELD
        ===================================================== */

        .draft-field {
          flex: 1 1 0;

          min-width: 0;

          display: flex;
          align-items: center;

          gap: 10px;

          padding: 0 15px;

          border-right: 1px solid #edf2f8;
        }

        .draft-field-icon {
          width: 34px;
          height: 34px;

          flex: 0 0 34px;

          display: grid;
          place-items: center;

          border: 1px solid #e1e9f6;
          border-radius: 9px;

          background: #f6f8fc;

          color: #8092b3;
        }

        .draft-field-content {
          min-width: 0;
        }

        .draft-field-content label {
          display: block;

          margin-bottom: 5px;

          color: #8b9ab2;

          font-size: 10px;
          font-weight: 850;

          letter-spacing: .06em;
        }

        .draft-field-content strong {
          display: block;

          overflow: hidden;

          color: #334155;

          font-size: 13px;
          font-weight: 750;

          line-height: 1.4;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .draft-field-content span {
          display: block;

          margin-top: 4px;

          overflow: hidden;

          color: #7d8da6;

          font-size: 11px;

          line-height: 1.4;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .draft-mail {
          display: flex !important;
          align-items: center;

          gap: 4px;

          font-size: 11px !important;
        }

        /* =====================================================
           BUSINESS
        ===================================================== */

        .draft-business {
          display: flex;

          gap: 18px;
        }

        .draft-business > div {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .draft-business span {
          margin: 0;

          color: #8b9ab2;

          font-size: 9px !important;
        }

        .draft-business strong {
          color: #243b72;

          font-size: 13px !important;
          font-weight: 800;
        }

        .draft-rupee {
          color: #627cae;

          font-size: 17px;
          font-weight: 800;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .draft-actions {
          display: flex;
          align-items: center;

          gap: 7px;

          padding-left: 15px;
        }

        .draft-edit {
          height: 36px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          padding: 0 12px;

          border: 1px solid #d7e4ff;
          border-radius: 8px;

          background: #eef4ff;

          color: var(--blue);

          font-size: 11px;
          font-weight: 750;

          cursor: pointer;
        }

        .draft-edit:hover {
          background: #e3edff;
        }

        .draft-delete {
          width: 36px;
          height: 36px;

          display: grid;
          place-items: center;

          border: 1px solid #fee2e2;
          border-radius: 8px;

          background: #fff7f7;

          color: #dc2626;

          cursor: pointer;
        }

        .draft-delete:hover {
          background: #fee2e2;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .draft-empty {
          min-height: 280px;

          margin: 0 21px 21px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          border: 1px dashed #cbd8ed;
          border-radius: 11px;

          background: #fbfdff;
        }

        .draft-empty-icon {
          width: 54px;
          height: 54px;

          display: grid;
          place-items: center;

          margin-bottom: 12px;

          border-radius: 13px;

          background: #eef4ff;

          color: var(--blue);
        }

        .draft-empty h3 {
          margin: 0;

          color: #1e293b;

          font-size: 16px;
        }

        .draft-empty p {
          margin: 7px 0 15px;

          color: #8a98ad;

          font-size: 12px;
        }

        .draft-outline {
          min-height: 38px;

          padding: 0 15px;

          border: 1px solid var(--border);
          border-radius: 8px;

          background: white;

          color: #475569;

          font-size: 11px;
          font-weight: 700;

          cursor: pointer;
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .draft-loading {
          min-height: 60vh;

          display: grid;
          place-items: center;
          align-content: center;

          gap: 10px;

          color: var(--muted);

          font-size: 13px;
        }

        .draft-spinner {
          width: 29px;
          height: 29px;

          border: 3px solid #dbe5f6;
          border-top-color: var(--blue);

          border-radius: 50%;

          animation: draftSpin .7s linear infinite;
        }

        /* =====================================================
           MODAL
        ===================================================== */

        .draft-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 9999;

          display: grid;
          place-items: center;

          padding: 20px;

          background: rgba(6, 24, 95, .35);

          backdrop-filter: blur(4px);
        }

        .draft-modal {
          position: relative;

          width: min(420px, 100%);

          padding: 30px;

          border-radius: 16px;

          background: white;

          box-shadow:
            0 25px 70px rgba(6, 24, 95, .23);

          text-align: center;
        }

        .draft-modal-close {
          position: absolute;

          top: 12px;
          right: 12px;

          width: 32px;
          height: 32px;

          display: grid;
          place-items: center;

          border: 0;
          border-radius: 8px;

          background: transparent;

          color: #94a3b8;

          cursor: pointer;
        }

        .draft-warning {
          width: 60px;
          height: 60px;

          display: grid;
          place-items: center;

          margin: 0 auto 15px;

          border-radius: 15px;

          background: #fff1f2;

          color: #dc2626;
        }

        .draft-modal h2 {
          margin: 0;

          color: #172554;

          font-size: 20px;
        }

        .draft-modal p {
          margin: 9px auto 22px;

          color: #64748b;

          font-size: 13px;

          line-height: 1.6;
        }

        .draft-modal p strong {
          color: #334155;
        }

        .draft-modal-actions {
          display: flex;

          justify-content: center;

          gap: 9px;
        }

        .draft-cancel,
        .draft-confirm {
          min-height: 40px;

          border-radius: 9px;

          font-size: 12px;
          font-weight: 750;

          cursor: pointer;
        }

        .draft-cancel {
          padding: 0 17px;

          border: 1px solid var(--border);

          background: white;

          color: #475569;
        }

        .draft-confirm {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 16px;

          border: 1px solid #dc2626;

          background: #dc2626;

          color: white;
        }

        .draft-confirm:hover {
          background: #b91c1c;
        }

        /* =====================================================
           ANIMATIONS
        ===================================================== */

        @keyframes draftSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes draftIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1150px) {
          .draft-doctor {
            flex-wrap: wrap;
          }

          .draft-doctor-identity {
            width: 250px;
            min-width: 250px;
          }

          .draft-field {
            flex: 1 1 180px;

            min-height: 52px;
          }

          .draft-saved {
            border-right: 0;
          }

          .draft-actions {
            margin-left: auto;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 800px) {
          .draft-header {
            align-items: flex-start;

            flex-direction: column;
          }

          .draft-add {
            width: 100%;
          }

          .draft-stats {
            grid-template-columns: 1fr 1fr;
          }

          .draft-stat-main {
            grid-column: 1 / -1;
          }

          .draft-filters {
            grid-template-columns: 1fr 1fr;
          }

          .draft-search {
            grid-column: 1 / -1;
          }

          .draft-doctor {
            display: grid;

            grid-template-columns: 1fr 1fr;

            gap: 0;

            padding: 14px;
          }

          .draft-doctor-identity {
            width: auto;
            min-width: 0;

            grid-column: 1 / -1;

            padding: 0 0 13px;

            border-right: 0;
            border-bottom: 1px solid #edf2f8;

            margin-bottom: 4px;
          }

          .draft-field {
            padding: 12px 9px;

            border-right: 0;
            border-bottom: 1px solid #edf2f8;
          }

          .draft-actions {
            grid-column: 1 / -1;

            padding: 12px 0 0;

            margin: 0;
          }

          .draft-edit {
            flex: 1;
          }
        }

        @media (max-width: 560px) {
          .draft-stats {
            grid-template-columns: 1fr;
          }

          .draft-stat-main {
            grid-column: auto;
          }

          .draft-filters {
            grid-template-columns: 1fr;
          }

          .draft-search {
            grid-column: auto;
          }

          .draft-panel-header {
            align-items: flex-start;

            flex-direction: column;

            gap: 10px;
          }

          .draft-doctor {
            grid-template-columns: 1fr;
          }

          .draft-doctor-identity {
            grid-column: auto;
          }

          .draft-field {
            grid-column: auto;
          }

          .draft-actions {
            grid-column: auto;
          }
        }

      `}</style>
    </Layout>
  );
}