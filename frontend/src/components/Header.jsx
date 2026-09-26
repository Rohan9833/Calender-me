import React, { useState } from "react";
import {
  Menu,
  MapPin,
  Bell,
  ChevronDown,
  X,
  User,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Avatar } from "./UIComponents";
import { useNavigate } from "react-router-dom";

export default function Header({ 
  role = "mr", 
  onMenuClick,
  isSidebarOpen = true,
  isMobile = false,
}) {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user?.mrName || user?.flmName || user?.slmName || user?.tlmName || "User";
  const designation = user?.role === "mr" ? "MR" : user?.role === "flm" ? "FLM" : user?.role === "slm" ? "SLM" : user?.role === "tlm" ? "TLM" : "Manager";
  const loc = user?.hq || "Mumbai West (Area)";

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    navigate("/profile-edit");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header
      className="topbar"
      style={{
        height: isMobile ? "60px" : undefined,
        padding: isMobile ? "0 12px" : undefined,
        gap: isMobile ? "10px" : undefined,
        flexWrap: isMobile ? "nowrap" : undefined,
      }}
    >
      {/* Hamburger / close menu — mobile only, this is what opens & closes the sidebar drawer */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            color: "#374151",
            flexShrink: 0,
          }}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      )}

      {/* Back Button */}
      <button
        onClick={handleGoBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          color: "#374151",
          flexShrink: 0,
        }}
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="spacer" />

      {!isMobile && (
        <div className="location">
          <MapPin size={18} />
          {loc}
        </div>
      )}

      <div className="bell" style={{ flexShrink: 0 }}>
        <Bell size={isMobile ? 20 : 24} />
        <span>
          {role === "ho" ? 18 : role === "manager" ? 12 : 8}
        </span>
      </div>

      <div 
        onClick={() => setIsProfileOpen(!isProfileOpen)} 
        style={{ 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Avatar name={name} role={designation} />
        {!isMobile && <ChevronDown size={18} />}
      </div>

      {isProfileOpen && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? "56px" : "60px",
            right: isMobile ? "12px" : "20px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            padding: "8px",
            minWidth: "180px",
            zIndex: 1100,
          }}
        >
          <div
            onClick={handleProfileClick}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <User size={16} />
            Edit Profile
          </div>
          <div
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "14px",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <LogOut size={16} />
            Logout
          </div>
        </div>
      )}
    </header>
  );
}