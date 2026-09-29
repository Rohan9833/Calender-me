import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, Search, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import { Crumbs } from "../components/UIComponents";
import { getApprovedDoctors } from "../api/doctorAPI";
import { CalendarMonth } from "./CalendarSelect";

export default function CalendarSelectionEntry() {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctorId");

  if (doctorId) return <CalendarMonth />;

  return <CalendarDoctorPicker />;
}

function CalendarDoctorPicker() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.mrId) {
          setError("Your MR session is missing. Please log in again.");
          return;
        }
        const response = await getApprovedDoctors(user.mrId);
        const approved = response?.doctors || [];
        setDoctors(approved);
        setFilteredDoctors(approved);
      } catch (err) {
        console.error("Failed to load approved doctors:", err);
        setError(err.response?.data?.message || "Failed to load approved doctors. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFilteredDoctors(doctors);
      return;
    }
    setFilteredDoctors(
      doctors.filter((doctor) =>
        [doctor.doctorName, doctor.speciality, doctor.mclCode, doctor.city]
          .some((value) => String(value || "").toLowerCase().includes(term))
      )
    );
  }, [search, doctors]);

  const selectDoctor = (doctor) => {
    sessionStorage.setItem("currentDoctorId", doctor._id);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.mrId) sessionStorage.setItem("mrId", user.mrId);
    navigate(`/calendar-selection?doctorId=${doctor._id}`);
  };

  return (
    <Layout active="Calendar Selection">
      <Crumbs items={["Calendar Selection", "Select Doctor"]} />

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: "#eff6ff", color: "#0b55f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: "#172033", fontSize: 26 }}>Calendar Selection</h1>
            <p style={{ margin: "5px 0 0", color: "#64748b" }}>Select an approved doctor to start or continue their calendar.</p>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#172033" }}>Select an Approved Doctor</h2>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: "#64748b" }}>Only doctors approved for your MR account are shown.</p>
          </div>
          <div style={{ position: "relative", minWidth: 280 }}>
            <Search size={17} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctor, speciality or MCL code"
              style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px 11px 38px", border: "1px solid #dbe2ea", borderRadius: 9, outline: "none", fontSize: 13 }} />
          </div>
        </div>

        {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading approved doctors...</div>}
        {!loading && error && <div style={{ padding: 18, borderRadius: 10, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>{error}</div>}
        {!loading && !error && filteredDoctors.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#64748b", border: "1px dashed #dbe2ea", borderRadius: 12 }}>No approved doctors found.</div>}

        {!loading && !error && filteredDoctors.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {filteredDoctors.map((doctor) => (
              <div key={doctor._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "15px 16px", border: "1px solid #e5e7eb", borderRadius: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#eff6ff", color: "#0b55f4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {doctor.doctorName?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <strong style={{ color: "#172033" }}>{doctor.doctorName || "Unnamed Doctor"}</strong>
                      <CheckCircle2 size={15} color="#16a34a" />
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4, fontSize: 12, color: "#64748b" }}>
                      <span>{doctor.speciality || "General Physician"}</span>
                      <span>MCL: {doctor.mclCode || "—"}</span>
                      {doctor.city && <span style={{ display: "inline-flex", gap: 3 }}><MapPin size={12} /> {doctor.city}</span>}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => selectDoctor(doctor)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "none", borderRadius: 9, padding: "10px 15px", background: "#0b55f4", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 650 }}>
                  Select Doctor <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
