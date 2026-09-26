import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Crumbs, Badge } from "../components/UIComponents";
import { getAllDoctors } from "../api/doctorAPI";

const AllDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getUserData = () => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  };
  const userData = getUserData();
  const mrId = userData?.mrId || userData?._id || sessionStorage.getItem("mrId");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllDoctors(mrId);
        setDoctors(res.doctors || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (mrId) fetch();
  }, [mrId]);

  const getStatusTone = (doctor) => {
    if (doctor.approvalStatus === "approved") return { label: "Approved", tone: "green" };
    if (doctor.status === "draft") return { label: "Draft", tone: "purple" };
    if (doctor.consentStatus === "approved") return { label: "Consent Given", tone: "blue" };
    if (doctor.consentSent) return { label: "Consent Sent", tone: "orange" };
    if (doctor.status === "pending") return { label: "Submitted", tone: "orange" };
    return { label: "Pending", tone: "orange" };
  };

  const filtered = doctors.filter(d =>
    d.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality?.toLowerCase().includes(search.toLowerCase()) ||
    d.mclCode?.toLowerCase().includes(search.toLowerCase()) ||
    d.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout active="Dashboard">
      <Crumbs items={["All Doctors"]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700 }}>All Doctors ({doctors.length})</h1>
        <button onClick={() => navigate(-1)} style={{ fontSize: '13px', color: '#666', background: 'none', border: '1px solid #ddd', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', borderRadius: '10px', padding: '8px 14px' }}>
       
        <input
          type="text"
          placeholder="Search by name, speciality, MCL, city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>No doctors found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(doctor => {
            const { label, tone } = getStatusTone(doctor);
            return (
              <div
                key={doctor._id}
                onClick={() => navigate(`/doctor-details/${doctor._id}`)}
                style={{
                  background: 'white',
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: '#e0e7ff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, color: '#4f46e5', fontSize: '14px', flexShrink: 0
                  }}>
                    {doctor.doctorName?.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{doctor.doctorName}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {doctor.speciality} • {doctor.city} • MCL: {doctor.mclCode}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge tone={tone}>{label}</Badge>
                  <span style={{ fontSize: '12px', color: '#bbb' }}>
                    {new Date(doctor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default AllDoctors;