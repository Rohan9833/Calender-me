import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { getDraftDoctors, deleteDoctor } from "../api/doctorAPI";
import {
  FileText,
  UserPlus,
  Trash2,
  X,
  AlertCircle,
  Search,
  SlidersHorizontal,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Pencil,
  RotateCcw,
} from "lucide-react";
import Layout from "../components/Layout";
import { DataTable } from "../components/UIComponents";

export default function DraftDoctors() {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    doctorId: null,
    doctorName: "",
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const data = await getDraftDoctors(user.mrId);
        setDoctorData(data.doctors || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredData = useMemo(() => {
    let result = doctorData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((d) =>
        [d.doctorName, d.speciality, d.mclCode, d.clinicName, d.city]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term))
      );
    }

    if (statusFilter) {
      result = result.filter(
        (d) => d.status === statusFilter || d.approvalStatus === statusFilter
      );
    }

    if (specialtyFilter) {
      result = result.filter((d) => d.speciality === specialtyFilter);
    }

    if (dateFilter === "Today") {
      const today = new Date().toDateString();
      result = result.filter(
        (d) => new Date(d.createdAt).toDateString() === today
      );
    } else if (dateFilter === "Last 7 Days") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter((d) => new Date(d.createdAt) >= weekAgo);
    } else if (dateFilter === "This Month") {
      const now = new Date();
      result = result.filter((d) => {
        const date = new Date(d.createdAt);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });
    }

    return result;
  }, [searchTerm, statusFilter, specialtyFilter, dateFilter, doctorData]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSpecialtyFilter("");
    setDateFilter("");
  };

  const handleDelete = async () => {
    const { doctorId } = deletePopup;
    if (!doctorId) return;

    try {
      await deleteDoctor(doctorId);
      setDoctorData((current) => current.filter((d) => d._id !== doctorId));
      closeDeletePopup();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete doctor.");
    }
  };

  const openDeletePopup = (doctorId, doctorName) => {
    setDeletePopup({ isOpen: true, doctorId, doctorName });
  };

  const closeDeletePopup = () => {
    setDeletePopup({ isOpen: false, doctorId: null, doctorName: "" });
  };

  const specialtyOptions = [
    "Cardiology",
    "Dermatology",
    "Paediatrics",
    "Orthopedics",
    "General Physician",
  ];

  if (loading) {
    return (
      <Layout active="My Doctors">
        <div className="draft-doctors-page draft-doctors-loading">
          <div className="draft-loading-spinner" />
          <span>Loading draft doctors...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout active="My Doctors">
      <div className="draft-doctors-page">
        <div className="draft-breadcrumb">
          <span>My Doctors</span>
          <span className="draft-breadcrumb-separator">/</span>
          <strong>Draft Doctors</strong>
        </div>

        <section className="draft-page-head">
          <div>
            <div className="draft-eyebrow">
              <span className="draft-eyebrow-dot" />
              Doctor workspace
            </div>
            <h1>Draft Doctors</h1>
            <p>
              Continue working on doctors you saved without submitting yet.
            </p>
          </div>

          <button
            className="draft-primary-button"
            onClick={() => navigate("/add-doctor")}
          >
            <UserPlus size={17} />
            Add New Doctor
          </button>
        </section>

        <section className="draft-summary">
          <div className="draft-summary-card draft-summary-card-main">
            <div className="draft-summary-icon">
              <FileText size={20} />
            </div>
            <div>
              <span>Total drafts</span>
              <strong>{doctorData.length}</strong>
              <small>
                {filteredData.length === doctorData.length
                  ? "All saved drafts"
                  : `${filteredData.length} matching current filters`}
              </small>
            </div>
          </div>

          <div className="draft-summary-card">
            <span>Added this month</span>
            <strong>
              {
                doctorData.filter((doctor) => {
                  const now = new Date();
                  const date = new Date(doctor.createdAt);
                  return (
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </strong>
            <small>New draft records</small>
          </div>

          <div className="draft-summary-card">
            <span>Currently visible</span>
            <strong>{filteredData.length}</strong>
            <small>After search and filters</small>
          </div>
        </section>

        <section className="draft-workspace">
          <div className="draft-workspace-head">
            <div>
              <h2>Saved doctors</h2>
              <p>Search, filter and continue editing any draft.</p>
            </div>
            <span className="draft-result-count">
              {filteredData.length} {filteredData.length === 1 ? "doctor" : "doctors"}
            </span>
          </div>

          <div className="draft-filter-panel">
            <div className="draft-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search by doctor, speciality, MCL, clinic or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="draft-clear-search"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="draft-select-wrap">
              <SlidersHorizontal size={15} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <select
              className="draft-select"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="">All specialities</option>
              {specialtyOptions.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            <div className="draft-select-wrap">
              <CalendarDays size={15} />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="">Any date</option>
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            {(searchTerm || statusFilter || specialtyFilter || dateFilter) && (
              <button
                type="button"
                className="draft-reset-button"
                onClick={handleClearFilters}
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>

          {filteredData.length === 0 ? (
            <div className="draft-empty-state">
              <div className="draft-empty-icon">
                <FileText size={25} />
              </div>
              <h3>No draft doctors found</h3>
              <p>
                {doctorData.length
                  ? "Try changing your search or filters."
                  : "Saved drafts will appear here when you add a doctor."}
              </p>
              {doctorData.length > 0 ? (
                <button onClick={handleClearFilters} className="draft-secondary-button">
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={() => navigate("/add-doctor")}
                  className="draft-primary-button"
                >
                  <UserPlus size={16} />
                  Add New Doctor
                </button>
              )}
            </div>
          ) : (
            <div className="draft-table-shell">
              <div className="draft-table-scroll">
                <div className="draft-table-min-width">
                  <DataTable
                    headers={[
                      "Doctor",
                      "Speciality",
                      "MCL Code",
                      "Clinic",
                      "City",
                      "Contact",
                      "Business",
                      "Brand Focus",
                      "Date Saved",
                      "Modified",
                      "Actions",
                    ]}
                    rows={filteredData.map((doctor) => [
                      <div className="draft-doctor-cell" key={`doctor-${doctor._id}`}>
                        <div className="draft-avatar">
                          {doctor.doctorName
                            ?.split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "DR"}
                        </div>
                        <div>
                          <strong>{doctor.doctorName || "Unnamed doctor"}</strong>
                          <span>
                            {doctor.otherActivities || "Draft profile"}
                          </span>
                        </div>
                      </div>,
                      <span className="draft-primary-text" key={`speciality-${doctor._id}`}>
                        {doctor.speciality || "-"}
                      </span>,
                      <span className="draft-code" key={`mcl-${doctor._id}`}>
                        {doctor.mclCode || "-"}
                      </span>,
                      <span className="draft-muted-cell" key={`clinic-${doctor._id}`}>
                        <MapPin size={13} />
                        {doctor.clinicName || "-"}
                      </span>,
                      doctor.city || "-",
                      <div className="draft-contact-cell" key={`contact-${doctor._id}`}>
                        <span>
                          <Mail size={12} />
                          {doctor.email || "-"}
                        </span>
                        <span>
                          <Phone size={12} />
                          {doctor.mobile || "-"}
                        </span>
                      </div>,
                      <div className="draft-business-cell" key={`business-${doctor._id}`}>
                        <span>Current: {doctor.currentBusiness || "0"}</span>
                        <span>Expected: {doctor.expectedBusiness || "0"}</span>
                      </div>,
                      doctor.brandFocus || "-",
                      new Date(doctor.createdAt).toLocaleDateString(),
                      doctor.updatedAt
                        ? new Date(doctor.updatedAt).toLocaleDateString()
                        : new Date(doctor.createdAt).toLocaleDateString(),
                      <div className="draft-row-actions" key={`actions-${doctor._id}`}>
                        <button
                          type="button"
                          className="draft-icon-button edit"
                          onClick={() => navigate(`/edit-doctor/${doctor._id}`)}
                          title="Edit doctor"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="draft-icon-button delete"
                          onClick={() =>
                            openDeletePopup(doctor._id, doctor.doctorName)
                          }
                          title="Delete doctor"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>,
                    ])}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {deletePopup.isOpen && (
          <div className="draft-modal-overlay" onClick={closeDeletePopup}>
            <div
              className="draft-delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="draft-modal-close"
                onClick={closeDeletePopup}
                aria-label="Close delete dialog"
              >
                <X size={18} />
              </button>

              <div className="draft-delete-icon">
                <AlertCircle size={28} />
              </div>

              <h2>Delete doctor?</h2>
              <p>
                Are you sure you want to delete{" "}
                <strong>{deletePopup.doctorName}</strong>? This action cannot be
                undone.
              </p>

              <div className="draft-modal-actions">
                <button
                  type="button"
                  className="draft-secondary-button"
                  onClick={closeDeletePopup}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="draft-danger-button"
                  onClick={handleDelete}
                >
                  <Trash2 size={15} />
                  Delete Doctor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .draft-doctors-page {
          --draft-blue: #0758f7;
          --draft-navy: #06185f;
          --draft-border: #dbe5f6;
          --draft-muted: #6b7894;
          --draft-bg: #f7faff;
          max-width: 1480px;
          margin: 0 auto;
          animation: draftPageIn .35s ease both;
        }

        .draft-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 14px;
        }

        .draft-breadcrumb strong {
          color: #111827;
          font-weight: 700;
        }

        .draft-breadcrumb-separator {
          color: #b7c1d2;
        }

        .draft-page-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 20px;
        }

        .draft-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--draft-blue);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .draft-eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--draft-blue);
          box-shadow: 0 0 0 4px rgba(7,88,247,.09);
        }

        .draft-page-head h1 {
          margin: 0;
          color: var(--draft-navy);
          font-size: 28px;
          line-height: 1.15;
          letter-spacing: -.025em;
        }

        .draft-page-head p {
          margin: 7px 0 0;
          color: var(--draft-muted);
          font-size: 13px;
        }

        .draft-primary-button,
        .draft-secondary-button,
        .draft-danger-button,
        .draft-reset-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 9px;
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: .2s ease;
        }

        .draft-primary-button {
          min-height: 40px;
          padding: 0 15px;
          color: #fff;
          background: var(--draft-blue);
          border: 1px solid var(--draft-blue);
          box-shadow: 0 7px 18px rgba(7,88,247,.14);
        }

        .draft-primary-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(7,88,247,.2);
        }

        .draft-secondary-button {
          min-height: 38px;
          padding: 0 14px;
          color: #334155;
          background: #fff;
          border: 1px solid var(--draft-border);
        }

        .draft-secondary-button:hover {
          border-color: #b9c8e5;
          background: #f8fbff;
        }

        .draft-danger-button {
          min-height: 38px;
          padding: 0 14px;
          color: #fff;
          background: #dc2626;
          border: 1px solid #dc2626;
        }

        .draft-danger-button:hover {
          background: #b91c1c;
        }

        .draft-summary {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .draft-summary-card {
          min-height: 94px;
          padding: 16px 18px;
          background: #fff;
          border: 1px solid var(--draft-border);
          border-radius: 13px;
          box-shadow: 0 5px 18px rgba(24,55,112,.045);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .draft-summary-card-main {
          flex-direction: row;
          align-items: center;
          gap: 13px;
        }

        .draft-summary-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          color: var(--draft-blue);
          background: #eef4ff;
          border: 1px solid #dce8ff;
        }

        .draft-summary-card span {
          color: var(--draft-muted);
          font-size: 11px;
          font-weight: 700;
        }

        .draft-summary-card strong {
          color: var(--draft-navy);
          font-size: 25px;
          line-height: 1.05;
          margin-top: 5px;
        }

        .draft-summary-card small {
          color: #94a3b8;
          font-size: 10px;
          margin-top: 5px;
        }

        .draft-workspace {
          background: #fff;
          border: 1px solid var(--draft-border);
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 7px 24px rgba(24,55,112,.055);
        }

        .draft-workspace-head {
          padding: 17px 18px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .draft-workspace-head h2 {
          margin: 0;
          color: var(--draft-navy);
          font-size: 15px;
        }

        .draft-workspace-head p {
          margin: 4px 0 0;
          color: var(--draft-muted);
          font-size: 11px;
        }

        .draft-result-count {
          padding: 6px 9px;
          border-radius: 999px;
          color: var(--draft-blue);
          background: #eef4ff;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .draft-filter-panel {
          padding: 0 18px 16px;
          display: grid;
          grid-template-columns: minmax(280px, 1.6fr) 150px 170px 150px auto;
          gap: 8px;
          align-items: center;
        }

        .draft-search,
        .draft-select-wrap,
        .draft-select {
          height: 38px;
          border: 1px solid var(--draft-border);
          border-radius: 9px;
          background: #fbfdff;
          color: #334155;
          font: inherit;
          font-size: 12px;
          outline: none;
        }

        .draft-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 11px;
          color: #8b9ab2;
        }

        .draft-search:focus-within,
        .draft-select-wrap:focus-within {
          border-color: #9ab8f7;
          box-shadow: 0 0 0 3px rgba(7,88,247,.07);
          background: #fff;
        }

        .draft-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #1e293b;
          font: inherit;
        }

        .draft-search input::placeholder {
          color: #9aa8bd;
        }

        .draft-clear-search,
        .draft-modal-close {
          border: 0;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          display: grid;
          place-items: center;
          padding: 4px;
        }

        .draft-select-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 9px;
          color: #8b9ab2;
        }

        .draft-select-wrap select,
        .draft-select {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #475569;
          font: inherit;
          cursor: pointer;
        }

        .draft-select {
          padding: 0 10px;
        }

        .draft-reset-button {
          height: 38px;
          padding: 0 10px;
          color: #64748b;
          background: #fff;
          border: 1px solid var(--draft-border);
        }

        .draft-reset-button:hover {
          color: var(--draft-blue);
          border-color: #b9c8e5;
        }

        .draft-table-shell {
          border-top: 1px solid #edf2fa;
        }

        .draft-table-scroll {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: thin;
        }

        .draft-table-min-width {
          min-width: 1240px;
        }

        .draft-table-shell .dataTable th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #f8faff;
          color: #71809a;
          border-bottom: 1px solid var(--draft-border);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .045em;
          text-transform: uppercase;
          padding: 11px 12px;
          white-space: nowrap;
        }

        .draft-table-shell .dataTable td {
          padding: 11px 12px;
          border-bottom: 1px solid #edf2f8;
          color: #475569;
          font-size: 11px;
          vertical-align: middle;
          white-space: nowrap;
        }

        .draft-table-shell .dataTable tbody tr {
          transition: background .18s ease;
        }

        .draft-table-shell .dataTable tbody tr:hover {
          background: #f9fbff;
        }

        .draft-doctor-cell {
          min-width: 205px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .draft-avatar {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: var(--draft-blue);
          background: #eef4ff;
          border: 1px solid #dce8ff;
          font-size: 10px;
          font-weight: 850;
        }

        .draft-doctor-cell strong {
          display: block;
          color: #172554;
          font-size: 12px;
          font-weight: 750;
        }

        .draft-doctor-cell span {
          display: block;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #94a3b8;
          font-size: 10px;
          margin-top: 2px;
        }

        .draft-primary-text {
          color: #243b72;
          font-weight: 650;
        }

        .draft-code {
          padding: 4px 7px;
          border-radius: 6px;
          color: #53627b;
          background: #f3f6fb;
          font-size: 10px;
          font-weight: 750;
        }

        .draft-muted-cell {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #64748b;
        }

        .draft-contact-cell,
        .draft-business-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .draft-contact-cell span,
        .draft-business-cell span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #64748b;
        }

        .draft-row-actions {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .draft-icon-button {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          cursor: pointer;
          transition: .18s ease;
        }

        .draft-icon-button.edit {
          color: var(--draft-blue);
          background: #eef4ff;
          border: 1px solid #dce8ff;
        }

        .draft-icon-button.edit:hover {
          background: #e4edff;
        }

        .draft-icon-button.delete {
          color: #dc2626;
          background: #fff5f5;
          border: 1px solid #fee2e2;
        }

        .draft-icon-button.delete:hover {
          background: #fee2e2;
        }

        .draft-empty-state {
          margin: 4px 18px 18px;
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 1px dashed #cbd8ed;
          border-radius: 12px;
          background: #fbfdff;
        }

        .draft-empty-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: var(--draft-blue);
          background: #eef4ff;
          margin-bottom: 11px;
        }

        .draft-empty-state h3 {
          margin: 0;
          color: #1e293b;
          font-size: 14px;
        }

        .draft-empty-state p {
          max-width: 360px;
          margin: 6px 0 14px;
          color: #8a98ad;
          font-size: 11px;
          line-height: 1.5;
        }

        .draft-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(6,24,95,.34);
          backdrop-filter: blur(3px);
          animation: draftFade .2s ease both;
        }

        .draft-delete-modal {
          position: relative;
          width: min(420px, 100%);
          padding: 27px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 24px 70px rgba(6,24,95,.22);
          text-align: center;
          animation: draftModalIn .22s ease both;
        }

        .draft-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 30px;
          height: 30px;
          border-radius: 8px;
        }

        .draft-modal-close:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .draft-delete-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          border-radius: 16px;
          color: #dc2626;
          background: #fff1f2;
          border: 1px solid #ffe4e6;
        }

        .draft-delete-modal h2 {
          margin: 0;
          color: #172554;
          font-size: 19px;
        }

        .draft-delete-modal p {
          margin: 8px auto 21px;
          max-width: 340px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.65;
        }

        .draft-delete-modal p strong {
          color: #334155;
        }

        .draft-modal-actions {
          display: flex;
          justify-content: center;
          gap: 9px;
        }

        .draft-doctors-loading {
          min-height: 60vh;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 10px;
          color: var(--draft-muted);
          font-size: 12px;
        }

        .draft-loading-spinner {
          width: 26px;
          height: 26px;
          border: 3px solid #dbe5f6;
          border-top-color: var(--draft-blue);
          border-radius: 50%;
          animation: draftSpin .75s linear infinite;
        }

        @keyframes draftSpin { to { transform: rotate(360deg); } }
        @keyframes draftPageIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes draftFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes draftModalIn { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        @media (max-width: 1050px) {
          .draft-filter-panel {
            grid-template-columns: 1fr 1fr;
          }
          .draft-search {
            grid-column: 1 / -1;
          }
          .draft-summary {
            grid-template-columns: 1fr 1fr;
          }
          .draft-summary-card-main {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 680px) {
          .draft-page-head {
            align-items: flex-start;
            flex-direction: column;
          }
          .draft-page-head h1 {
            font-size: 24px;
          }
          .draft-primary-button {
            width: 100%;
          }
          .draft-summary {
            grid-template-columns: 1fr;
          }
          .draft-summary-card-main {
            grid-column: auto;
          }
          .draft-filter-panel {
            grid-template-columns: 1fr;
          }
          .draft-search {
            grid-column: auto;
          }
          .draft-workspace-head {
            align-items: flex-start;
            flex-direction: column;
          }
          .draft-filter-panel,
          .draft-workspace-head {
            padding-left: 12px;
            padding-right: 12px;
          }
          .draft-empty-state {
            margin-left: 12px;
            margin-right: 12px;
          }
          .draft-modal-actions {
            flex-direction: column-reverse;
          }
          .draft-modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}
