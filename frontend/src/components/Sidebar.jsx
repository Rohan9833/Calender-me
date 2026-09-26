import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  UserPlus,
  Users,
  FileText,
  Clock3,
  Hand,
  BarChart3,
  HelpCircle,
  LogOut,
  ImageIcon,
  ClipboardList,
  Building2,
  Settings,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cls } from "../utils/helpers";
import { getPendingActionsCount } from "../api/managerAPI";
import calendarmeLogo from "../assets/calendarme-logo.png"
const iconMap = {
  LayoutDashboard,
  UserPlus,
  Users,
  FileText,
  Clock3,
  Hand,
  BarChart3,
  ImageIcon,
  ClipboardList,
  Building2,
  Settings,
  Filter,
  CalendarDays,
};

const navByRole = {
  mr: [
    ["Dashboard", "LayoutDashboard", "/mr-dashboard"],
    ["Add Doctor", "UserPlus", "/add-doctor"],
    ["My Doctors", "Users"],
    ["Calendar Selection", "CalendarDays", "/calendar-selection"],
    ["Input Given", "Hand", "/input-given"],
    ["Calendar Designs", "ImageIcon", "/manager/calendar-designs"],
  ],
  manager: [
    ["Dashboard", "LayoutDashboard", "/manager-dashboard"],
    ["Doctor Approvals", "ClipboardList", "/manager/approvals"],
    ["My Team", "Users", "/manager/mr-progress"],
    ["Reports", "BarChart3", "/manager/delay-report"],
    ["Pending Actions", "Clock3", "/manager/delay-report"],
    ["Calendar Designs", "ImageIcon", "/manager/calendar-designs"],
  ],
  ho: [
    ["Dashboard", "LayoutDashboard", "/ho-dashboard"],
    ["Doctor Approvals", "ClipboardList", "/ho/approvals"],
    ["Campaign Funnel", "Filter", "/ho/report-summary"],
    ["Calendar Designs", "ImageIcon", "/ho/calendar-designs"],
    ["Consent & Input Tracker", "Users", "/ho/pending-report"],
    ["Reports", "BarChart3", "/ho/report-summary"],
    ["Hierarchy", "Building2", "/ho/report-hierarchy"],
    ["Users Management", "Users", "/ho/dashboard"],
    ["Activity Log", "FileText", "/ho/pending-report"],
    ["System Settings", "Settings", "/ho/dashboard"],
  ],
};

export default function Sidebar({ 
  role = "mr", 
  isOpen = true,
  toggleSidebar,
  isMobile = false,
}) {
   const user = JSON.parse(localStorage.getItem("user") || "{}");
 

  // ✅ Override: if mrId exists, they are MR
  if (user.mrId) {
    role = "mr";
  } else if (["flm", "slm", "tlm"].includes(role)) {
    role = "manager";
  }

  const navigate = useNavigate();
  const location = useLocation();
  const [doctorMenuOpen, setDoctorMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const items = navByRole[role];

  const isActive = (path) => location.pathname === path;

  // ✅ Merged condition for My Doctors and Calendar Selection
  const isDoctorOrCalendarPage =
    isActive("/draft-doctors") ||
    isActive("/submitted-doctors") ||
    isActive("/approved-doctors") ||
    isActive("/calendar-selection");

  const isDoctorPage =
    isActive("/draft-doctors") ||
    isActive("/submitted-doctors") ||
    isActive("/approved-doctors");

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (role === "manager" || role === "ho") {
        try {
          const response = await getPendingActionsCount();
          if (response && response.success) {
            setPendingCount(response.count || 0);
          }
        } catch (error) {
          console.error("Error fetching pending count:", error);
        }
      }
    };
    fetchPendingCount();
  }, [role]);

  useEffect(() => {
    if (isDoctorPage) {
      setDoctorMenuOpen(true);
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      if (isMobile && toggleSidebar) {
        toggleSidebar();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside 
      className="sidebar"
      style={{
        width: isOpen ? "260px" : "70px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        transition: "width 0.3s ease",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        color: "#1a1a2e",
        boxShadow: "2px 0 10px rgba(0,0,0,0.08)",
      }}
    >
      {/* Brand */}
     <div 
        className="brand"
        style={{
          padding: isOpen ? "20px 16px" : "20px 8px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: isOpen ? "12px" : "0",
          justifyContent: isOpen ? "flex-start" : "center",
          minHeight: "70px",
        }}
      >
        {/* Icon – visible in both states */}
       {isOpen ? (
    <img 
      src={calendarmeLogo} 
      alt="Calendarme" 
      style={{ height: "60px", width: "auto", objectFit: "contain" , }}
    />
  ) : (
    <CalendarDays size={34} color="#0b55f4" />
  )}
        
        {/* ✅ Optional: keep "Personalized" text (if you want) */}
        {isOpen && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* <b style={{ color: "#1a1a2e", fontSize: "14px" }}>Personalized</b> */}
            {/* <span style={{ color: "#6b7280", fontSize: "12px" }}>
              {role === "ho" ? "HO Admin Portal" : "Calendar Campaign Portal"}
            </span> */}
          </div>
        )}

        {/* Toggle button */}
        <button
    onClick={toggleSidebar}
    style={{
      background: "none",
      border: "none",
      color: "#6b7280",
      cursor: "pointer",
      padding: "4px",
      marginLeft: isOpen ? "0" : "0",
    }}
  >
    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
  </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: isOpen ? "12px 12px" : "12px 8px" }}>
        {items.map(([title, iconName, path]) => {
          const Icon = iconMap[iconName] || CalendarDays;

          // My Doctors — dropdown for MR only
          if (title === "My Doctors" && role === "mr") {
            return (
              <React.Fragment key={title}>
                <div
                  className={cls("navitem", isDoctorOrCalendarPage && "active")}
                  onClick={() => {
                    if (isOpen) {
                      setDoctorMenuOpen(!doctorMenuOpen);
                    } else {
                      toggleSidebar?.();
                      setTimeout(() => setDoctorMenuOpen(true), 300);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isOpen ? "12px" : "0",
                    padding: isOpen ? "10px 14px" : "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    backgroundColor: isDoctorOrCalendarPage ? "#eff6ff" : "transparent",
                    color: isDoctorOrCalendarPage ? "#0b55f4" : "#4b5563",
                    justifyContent: isOpen ? "flex-start" : "center",
                  }}
                  onMouseEnter={(e) => {
                    if (!isDoctorOrCalendarPage) {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDoctorOrCalendarPage) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <Icon size={21} style={{ flexShrink: 0 }} />
                  {isOpen && (
                    <>
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>{title}</span>
                      <ChevronDown
                        size={16}
                        style={{
                          marginLeft: "auto",
                          transition: "transform 0.2s",
                          transform: doctorMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </>
                  )}
                </div>

                {isOpen && doctorMenuOpen && (
                  <div style={{ paddingLeft: "20px", marginTop: "4px" }}>
                    {[
                      ["Draft Doctors", "/draft-doctors"],
                      ["Submitted Doctors", "/submitted-doctors"],
                      ["Approved Doctors", "/approved-doctors"],
                    ].map(([label, routePath]) => (
                      <div
                        key={label}
                        className={cls("submenuItem", isActive(routePath) && "active")}
                        onClick={() => handleNavigation(routePath)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          backgroundColor: isActive(routePath) ? "#eff6ff" : "transparent",
                          color: isActive(routePath) ? "#0b55f4" : "#4b5563",
                          fontSize: "13px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive(routePath)) {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive(routePath)) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        <span style={{ fontSize: "6px", color: "#9ca3af" }}>●</span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          }

          // Calendar Selection – use merged condition
          if (title === "Calendar Selection") {
            return (
              <div
                key={title}
                className={cls("navitem", isDoctorOrCalendarPage && "active")}
                onClick={() => handleNavigation(path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isOpen ? "12px" : "0",
                  padding: isOpen ? "10px 14px" : "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: isDoctorOrCalendarPage ? "#eff6ff" : "transparent",
                  color: isDoctorOrCalendarPage ? "#0b55f4" : "#4b5563",
                  justifyContent: isOpen ? "flex-start" : "center",
                }}
                onMouseEnter={(e) => {
                  if (!isDoctorOrCalendarPage) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDoctorOrCalendarPage) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <Icon size={21} style={{ flexShrink: 0 }} />
                {isOpen && (
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{title}</span>
                )}
              </div>
            );
          }

          // All other nav items
          const targetPath = path;
          return (
            <div
              key={title}
              className={cls("navitem", targetPath && isActive(targetPath) && "active")}
              onClick={() => targetPath && handleNavigation(targetPath)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isOpen ? "12px" : "0",
                padding: isOpen ? "10px 14px" : "10px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: targetPath && isActive(targetPath) ? "#eff6ff" : "transparent",
                color: targetPath && isActive(targetPath) ? "#0b55f4" : "#4b5563",
                justifyContent: isOpen ? "flex-start" : "center",
              }}
              onMouseEnter={(e) => {
                if (!(targetPath && isActive(targetPath))) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (!(targetPath && isActive(targetPath))) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <Icon size={21} style={{ flexShrink: 0 }} />
              {isOpen && (
                <>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{title}</span>
                  {title === "Pending Actions" && pendingCount > 0 && (
                    <em
                      style={{
                        marginLeft: "auto",
                        background: "#ef4444",
                        color: "white",
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontStyle: "normal",
                      }}
                    >
                      {pendingCount}
                    </em>
                  )}
                </>
              )}
            </div>
          );
        })}

        <hr style={{ borderColor: "#e5e7eb", margin: "8px 0" }} />

        {isOpen && (
          <div
            className="navitem"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "#4b5563",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fee2e2";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#4b5563";
            }}
          >
            <LogOut size={21} />
            <span style={{ fontSize: "14px", fontWeight: "500" }}>Logout</span>
          </div>
        )}
      </nav>

      {/* Campaign Period */}
      {isOpen && (
        <div
          className="period"
          style={{
            padding: "16px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarDays size={18} color="#0b55f4" />
            <b style={{ fontSize: "13px", color: "#1a1a2e" }}>Campaign Period</b>
          </div>
          <span style={{ fontSize: "11px", color: "#6b7280" }}>
            01 Jan 2027 - 31 Dec 2027
          </span>
          <strong style={{ fontSize: "12px", color: "#0b55f4" }}>
            365 days remaining
          </strong>
        </div>
      )}
    </aside>
  );
}