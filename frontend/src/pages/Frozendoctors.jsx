import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import { Crumbs, Badge } from "../components/UIComponents";
import { getFrozenDoctors } from "../api/doctorAPI";

const FrozenDoctors = () => {
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
        const res = await getFrozenDoctors(mrId);
        const allDocs = res.doctors || [];
        // filter only frozen
        const frozen = allDocs.filter(d => d.calendarFrozen === true || d.calendarStatus === "frozen");
        setDoctors(frozen);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (mrId) fetch();
  }, [mrId]);

  const filtered = doctors.filter(d =>
    d.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality?.toLowerCase().includes(search.toLowerCase()) ||
    d.mclCode?.toLowerCase().includes(search.toLowerCase()) ||
    d.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout active="Dashboard">
      <Crumbs items={["Frozen Calendars"]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700 }}>❄️ Frozen Calendars ({doctors.length})</h1>
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
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>No frozen calendars found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(doctor => (
            <div
              key={doctor._id}
              onClick={() => navigate(`/calendar-selection?doctorId=${doctor._id}&mrId=${mrId}`)}
              style={{
                background: 'white',
                border: '1px solid #dbeafe',
                borderRadius: '12px',
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(59,130,246,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#dbeafe', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <CalendarDays size={20} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{doctor.doctorName}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                    {doctor.speciality} • {doctor.city} • MCL: {doctor.mclCode}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge tone="green">✓ Frozen</Badge>
                <span style={{ fontSize: '12px', color: '#bbb' }}>
                  {doctor.calendarFrozenAt ? new Date(doctor.calendarFrozenAt).toLocaleDateString() : 'Recently'}
                </span>
                <ArrowRight size={16} color="#bbb" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default FrozenDoctors;