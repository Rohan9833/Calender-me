// pages/CalendarDesigns.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  Grid3x3, 
  List,
  Printer
} from "lucide-react";
import Layout from "../components/Layout";
import { Button, Crumbs, Badge } from "../components/UIComponents";
import { months } from "../utils/helpers";
import { designAssets } from "../utils/designAssets";   // ✅ imported from shared file

const CALENDAR_YEAR = 2027;

// ─── Preview Modal (same as before) ───────────────────
function PreviewModal({ design, month, onClose }) {
  if (!design) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          maxWidth: 700,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid #f3f4f6"
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {design.label} — {month} {CALENDAR_YEAR}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#6b7280"
            }}
          >
            ✕
          </button>
        </div>
        
        <img
          src={design.file}
          alt={design.label}
          style={{
            width: "100%",
            display: "block",
            maxHeight: "65vh",
            objectFit: "contain",
            background: "#f9fafb"
          }}
        />
        
        <div style={{
          padding: "14px 20px",
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          borderTop: "1px solid #f3f4f6"
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13
            }}
          >
            Close
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = design.file;
              link.download = `${month}_${CALENDAR_YEAR}_${design.label}.webp`;
              link.click();
            }}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#0b55f4",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Design Card ──────────────────────────────────────
function DesignCard({ design, onPreview, onDownload }) {
  return (
    <div
      style={{
        border: "1.5px solid #e5e7eb",
        borderRadius: 12,
        background: "#fff",
        cursor: "pointer",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#f9fafb" }}>
        <img
          src={design.file}
          alt={design.label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block"
          }}
          onError={e => {
            e.target.style.display = "none";
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = "flex";
            }
          }}
        />
        <div style={{
          display: "none",
          position: "absolute",
          inset: 0,
          background: "#f3f4f6",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 6,
          color: "#9ca3af",
          fontSize: 12
        }}>
          <span style={{ fontSize: 28 }}>🖼️</span>
          <span>{design.label}</span>
        </div>
      </div>
      <div style={{ padding: "10px 12px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{design.label}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(design); }}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              cursor: "pointer"
            }}
          >
            <Eye size={12} />
          </button>
          {/* <button
            onClick={(e) => { e.stopPropagation(); onDownload(design); }}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              border: "none",
              background: "#0b55f4",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            <Download size={12} />
          </button> */}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────
export default function CalendarDesigns({ role: propRole }) {
  // Get role from props or localStorage
  const getUserRole = () => {
    if (propRole) return propRole;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.role || "mr";
    } catch {
      return "mr";
    }
  };
  const role = getUserRole();
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(CALENDAR_YEAR);
  const [viewMode, setViewMode] = useState("grid");
  const [previewDesign, setPreviewDesign] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Build a flat list of all designs with month info
  const getAllDesigns = () => {
    const all = [];
    months.forEach(month => {
      const designs = designAssets[month] || [];
      designs.forEach(design => {
        all.push({
          ...design,
          month: month,
          status: "available"
        });
      });
    });
    return all;
  };

  const allDesigns = getAllDesigns();

  const getFilteredDesigns = () => {
    let filtered = [...allDesigns];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.label.toLowerCase().includes(term) ||
        d.month.toLowerCase().includes(term) ||
        d.id.toLowerCase().includes(term)
      );
    }
    if (selectedMonth !== "all") {
      filtered = filtered.filter(d => d.month === selectedMonth);
    }
    return filtered;
  };

  const filteredDesigns = getFilteredDesigns();
  const uniqueMonths = [...new Set(allDesigns.map(d => d.month))];

  const handleDownload = (design) => {
    const link = document.createElement('a');
    link.href = design.file;
    link.download = `${design.month}_${currentYear}_${design.label}.webp`;
    link.click();
  };

  const handlePrint = () => window.print();
  const handleYearChange = (delta) => setCurrentYear(prev => prev + delta);
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedMonth("all");
  };

  // Group designs by month
  const designsByMonth = {};
  filteredDesigns.forEach(design => {
    if (!designsByMonth[design.month]) designsByMonth[design.month] = [];
    designsByMonth[design.month].push(design);
  });

  return (
    <Layout role={role} active="Calendar Designs">
      <Crumbs items={["Calendar Designs"]} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Calendar Designs Gallery</h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            Browse all available calendar designs for {currentYear}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', border: '1px solid #ddd', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: '6px 12px',
                background: viewMode === "grid" ? '#3b82f6' : 'white',
                color: viewMode === "grid" ? 'white' : '#666',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: '6px 12px',
                background: viewMode === "list" ? '#3b82f6' : 'white',
                color: viewMode === "list" ? 'white' : '#666',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <List size={16} />
            </button>
          </div>
          {/* <Button variant="outline" icon={Printer} onClick={handlePrint}>
            Print
          </Button> */}
        </div>
      </div>

      {/* Year Selector */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
        <button onClick={() => handleYearChange(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: '24px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>{currentYear}</span>
        <button onClick={() => handleYearChange(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by design name, month, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: 'white' }}
          >
            <option value="all">All Months</option>
            {uniqueMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <button
            onClick={handleClearFilters}
            style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{allDesigns.length}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Designs</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{uniqueMonths.length}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Months Covered</div>
        </div>
        <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>
            {Math.round(allDesigns.length / uniqueMonths.length)}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Designs Per Month (Avg)</div>
        </div>
      </div>

      {/* Designs Display */}
    {filteredDesigns.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '12px' }}>
    <p>No designs found matching your criteria.</p>
  </div>
) : viewMode === "grid" ? (
  months.filter(month => designsByMonth[month]).map(month => (
    <div key={month} style={{ marginBottom: '32px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#374151' }}>{month}</h2>
        <Badge tone="blue">{designsByMonth[month].length} designs</Badge>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {designsByMonth[month].map((design) => (
          <DesignCard
            key={`${design.month}-${design.id}`}
            design={design}
            onPreview={setPreviewDesign}
            onDownload={handleDownload}
          />
        ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Preview</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Design Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Month</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Code</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Year</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDesigns.map((design, idx) => (
                <tr key={`${design.month}-${design.id}-${idx}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    <img src={design.file} alt={design.label} style={{
                      width: '60px',
                      height: '45px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }} />
                  </td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{design.label}</td>
                  <td style={{ padding: '12px' }}>{design.month}</td>
                  <td style={{ padding: '12px' }}>{design.id}</td>
                  <td style={{ padding: '12px' }}>{currentYear}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button size="small" variant="outline" icon={Eye} onClick={() => setPreviewDesign(design)} />
                      <Button size="small" variant="primary" icon={Download} onClick={() => handleDownload(design)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewDesign && (
        <PreviewModal
          design={previewDesign}
          month={previewDesign.month}
          onClose={() => setPreviewDesign(null)}
        />
      )}
    </Layout>
  );
}