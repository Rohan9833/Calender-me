import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  UserCheck,
  Clock3,
  ChevronRight,
  MapPin,
  Stethoscope,
  CalendarDays,
  X,
} from "lucide-react";
import Layout from "../components/Layout";
import { Badge } from "../components/UIComponents";
import { getAllDoctors } from "../api/doctorAPI";

const AllDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const userData = getUserData();
  const mrId =
    userData?.mrId || userData?._id || sessionStorage.getItem("mrId");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await getAllDoctors(mrId);
        setDoctors(res.doctors || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (mrId) fetchDoctors();
    else setLoading(false);
  }, [mrId]);

  const getStatusTone = (doctor) => {
    if (doctor.approvalStatus === "approved") {
      return { label: "Approved", tone: "green" };
    }
    if (doctor.status === "draft") {
      return { label: "Draft", tone: "purple" };
    }
    if (doctor.consentStatus === "approved") {
      return { label: "Consent Given", tone: "blue" };
    }
    if (doctor.consentSent) {
      return { label: "Consent Sent", tone: "orange" };
    }
    if (doctor.status === "pending") {
      return { label: "Submitted", tone: "orange" };
    }
    return { label: "Pending", tone: "orange" };
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return doctors;

    return doctors.filter((doctor) =>
      [
        doctor.doctorName,
        doctor.speciality,
        doctor.mclCode,
        doctor.city,
        doctor.clinicName,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [doctors, search]);

  const approvedCount = doctors.filter(
    (doctor) => doctor.approvalStatus === "approved"
  ).length;

  const pendingCount = doctors.filter(
    (doctor) =>
      doctor.status === "pending" ||
      doctor.consentSent ||
      doctor.consentStatus !== "approved"
  ).length;

  return (
    <Layout active="My Doctors">
      <div className="all-doctors-page">
        <div className="all-doctors-breadcrumb">
          <span>My Doctors</span>
          <span>/</span>
          <strong>All Doctors</strong>
        </div>

        <section className="all-doctors-head">
          <div>
            <div className="all-doctors-eyebrow">
              <span />
              Doctor directory
            </div>
            <h1>My Doctors</h1>
            <p>View and manage all doctor profiles linked to your account.</p>
          </div>

          <button
            className="all-doctors-back"
            onClick={() => navigate(-1)}
            type="button"
          >
            Back
            <ChevronRight size={15} />
          </button>
        </section>

        <section className="all-doctors-stats">
          <div className="all-stat-card">
            <div className="all-stat-icon blue">
              <Users size={18} />
            </div>
            <div>
              <span>Total doctors</span>
              <strong>{doctors.length}</strong>
              <small>All profiles</small>
            </div>
          </div>

          <div className="all-stat-card">
            <div className="all-stat-icon green">
              <UserCheck size={18} />
            </div>
            <div>
              <span>Approved</span>
              <strong>{approvedCount}</strong>
              <small>Approved profiles</small>
            </div>
          </div>

          <div className="all-stat-card">
            <div className="all-stat-icon orange">
              <Clock3 size={18} />
            </div>
            <div>
              <span>Needs attention</span>
              <strong>{pendingCount}</strong>
              <small>Pending or in progress</small>
            </div>
          </div>
        </section>

        <section className="all-doctors-directory">
          <div className="all-directory-head">
            <div>
              <h2>Doctor directory</h2>
              <p>Select a profile to view its complete details.</p>
            </div>
            <span className="all-directory-count">
              {filtered.length} {filtered.length === 1 ? "doctor" : "doctors"}
            </span>
          </div>

          <div className="all-search-row">
            <div className="all-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search name, speciality, MCL, clinic or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="all-doctors-state">
              <div className="all-loading-spinner" />
              <span>Loading doctors...</span>
            </div>
          ) : !mrId ? (
            <div className="all-doctors-state">
              <div className="all-state-icon">
                <Users size={24} />
              </div>
              <h3>Unable to load doctors</h3>
              <p>Your user information is not available.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="all-doctors-state">
              <div className="all-state-icon">
                <Search size={24} />
              </div>
              <h3>No doctors found</h3>
              <p>
                {doctors.length
                  ? "Try a different search term."
                  : "Doctor profiles will appear here once they are added."}
              </p>
              {search && (
                <button
                  type="button"
                  className="all-clear-button"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="all-doctor-list">
              {filtered.map((doctor) => {
                const { label, tone } = getStatusTone(doctor);

                return (
                  <button
                    type="button"
                    key={doctor._id}
                    className="all-doctor-card"
                    onClick={() => navigate(`/doctor-details/${doctor._id}`)}
                  >
                    <div className="all-doctor-main">
                      <div className="all-doctor-avatar">
                        {doctor.doctorName
                          ?.split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "DR"}
                      </div>

                      <div className="all-doctor-copy">
                        <div className="all-doctor-title-row">
                          <h3>{doctor.doctorName || "Unnamed doctor"}</h3>
                          <Badge tone={tone}>{label}</Badge>
                        </div>

                        <div className="all-doctor-meta">
                          <span>
                            <Stethoscope size={13} />
                            {doctor.speciality || "Speciality not set"}
                          </span>
                          <span>
                            <MapPin size={13} />
                            {doctor.city || "City not set"}
                          </span>
                          <span>
                            MCL: {doctor.mclCode || "Not available"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="all-doctor-side">
                      <div>
                        <CalendarDays size={13} />
                        <span>
                          {doctor.createdAt
                            ? new Date(doctor.createdAt).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                      <ChevronRight size={18} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .all-doctors-page {
          --all-blue: #0758f7;
          --all-navy: #06185f;
          --all-border: #dbe5f6;
          --all-muted: #6b7894;
          max-width: 1180px;
          margin: 0 auto;
          animation: allDoctorsIn .35s ease both;
        }

        .all-doctors-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 14px;
        }

        .all-doctors-breadcrumb strong {
          color: #111827;
        }

        .all-doctors-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 19px;
        }

        .all-doctors-eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--all-blue);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .all-doctors-eyebrow span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--all-blue);
          box-shadow: 0 0 0 4px rgba(7,88,247,.09);
        }

        .all-doctors-head h1 {
          margin: 0;
          color: var(--all-navy);
          font-size: 28px;
          line-height: 1.15;
          letter-spacing: -.025em;
        }

        .all-doctors-head p {
          margin: 7px 0 0;
          color: var(--all-muted);
          font-size: 13px;
        }

        .all-doctors-back {
          height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 0 12px 0 14px;
          border: 1px solid var(--all-border);
          border-radius: 9px;
          background: #fff;
          color: #64748b;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s ease;
        }

        .all-doctors-back:hover {
          color: var(--all-blue);
          border-color: #b9c8e5;
          transform: translateX(-1px);
        }

        .all-doctors-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .all-stat-card {
          min-height: 90px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 17px;
          border: 1px solid var(--all-border);
          border-radius: 13px;
          background: #fff;
          box-shadow: 0 5px 18px rgba(24,55,112,.045);
        }

        .all-stat-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: grid;
          place-items: center;
          border-radius: 11px;
        }

        .all-stat-icon.blue {
          color: var(--all-blue);
          background: #eef4ff;
        }

        .all-stat-icon.green {
          color: #16a34a;
          background: #edf9f1;
        }

        .all-stat-icon.orange {
          color: #d97706;
          background: #fff7e8;
        }

        .all-stat-card span {
          display: block;
          color: var(--all-muted);
          font-size: 11px;
          font-weight: 700;
        }

        .all-stat-card strong {
          display: block;
          margin-top: 4px;
          color: var(--all-navy);
          font-size: 24px;
          line-height: 1;
        }

        .all-stat-card small {
          display: block;
          margin-top: 4px;
          color: #94a3b8;
          font-size: 10px;
        }

        .all-doctors-directory {
          overflow: hidden;
          border: 1px solid var(--all-border);
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 7px 24px rgba(24,55,112,.055);
        }

        .all-directory-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 18px 13px;
        }

        .all-directory-head h2 {
          margin: 0;
          color: var(--all-navy);
          font-size: 15px;
        }

        .all-directory-head p {
          margin: 4px 0 0;
          color: var(--all-muted);
          font-size: 11px;
        }

        .all-directory-count {
          padding: 6px 9px;
          border-radius: 999px;
          color: var(--all-blue);
          background: #eef4ff;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .all-search-row {
          padding: 0 18px 15px;
        }

        .all-search {
          height: 40px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 11px;
          color: #8b9ab2;
          border: 1px solid var(--all-border);
          border-radius: 9px;
          background: #fbfdff;
        }

        .all-search:focus-within {
          border-color: #9ab8f7;
          box-shadow: 0 0 0 3px rgba(7,88,247,.07);
          background: #fff;
        }

        .all-search input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #1e293b;
          font: inherit;
          font-size: 12px;
        }

        .all-search input::placeholder {
          color: #9aa8bd;
        }

        .all-search button {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 7px;
          color: #94a3b8;
          background: transparent;
          cursor: pointer;
        }

        .all-search button:hover {
          color: #475569;
          background: #f1f5f9;
        }

        .all-doctor-list {
          display: flex;
          flex-direction: column;
          border-top: 1px solid #edf2fa;
        }

        .all-doctor-card {
          width: 100%;
          min-height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 13px 18px;
          border: 0;
          border-bottom: 1px solid #edf2f8;
          background: #fff;
          text-align: left;
          cursor: pointer;
          transition: background .18s ease, padding .18s ease;
        }

        .all-doctor-card:last-child {
          border-bottom: 0;
        }

        .all-doctor-card:hover {
          padding-left: 21px;
          background: #f9fbff;
        }

        .all-doctor-main {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .all-doctor-avatar {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: var(--all-blue);
          background: #eef4ff;
          border: 1px solid #dce8ff;
          font-size: 11px;
          font-weight: 850;
        }

        .all-doctor-copy {
          min-width: 0;
        }

        .all-doctor-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .all-doctor-title-row h3 {
          margin: 0;
          color: #172554;
          font-size: 13px;
          font-weight: 750;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .all-doctor-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 6px;
          color: #7a879d;
          font-size: 10px;
        }

        .all-doctor-meta span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .all-doctor-side {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 11px;
          color: #a0acbe;
        }

        .all-doctor-side > div {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          white-space: nowrap;
        }

        .all-doctors-state {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px 18px;
          border-top: 1px solid #edf2fa;
        }

        .all-state-icon {
          width: 50px;
          height: 50px;
          display: grid;
          place-items: center;
          margin-bottom: 11px;
          border-radius: 14px;
          color: var(--all-blue);
          background: #eef4ff;
        }

        .all-doctors-state h3 {
          margin: 0;
          color: #1e293b;
          font-size: 14px;
        }

        .all-doctors-state p {
          max-width: 360px;
          margin: 6px 0 14px;
          color: #8a98ad;
          font-size: 11px;
          line-height: 1.5;
        }

        .all-clear-button {
          min-height: 35px;
          padding: 0 12px;
          border: 1px solid var(--all-border);
          border-radius: 8px;
          background: #fff;
          color: #475569;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .all-clear-button:hover {
          color: var(--all-blue);
          border-color: #b9c8e5;
        }

        .all-loading-spinner {
          width: 26px;
          height: 26px;
          margin-bottom: 10px;
          border: 3px solid #dbe5f6;
          border-top-color: var(--all-blue);
          border-radius: 50%;
          animation: allSpin .75s linear infinite;
        }

        @keyframes allSpin { to { transform: rotate(360deg); } }
        @keyframes allDoctorsIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 760px) {
          .all-doctors-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .all-doctors-back {
            align-self: stretch;
            justify-content: center;
          }

          .all-doctors-stats {
            grid-template-columns: 1fr;
          }

          .all-directory-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .all-doctor-card {
            align-items: flex-start;
          }

          .all-doctor-side {
            display: none;
          }

          .all-doctor-title-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default AllDoctors;
