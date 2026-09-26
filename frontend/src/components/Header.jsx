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

  const name =
    user?.mrName ||
    user?.flmName ||
    user?.slmName ||
    user?.tlmName ||
    "User";

  const designation =
    user?.role === "mr"
      ? "MR"
      : user?.role === "flm"
        ? "FLM"
        : user?.role === "slm"
          ? "SLM"
          : user?.role === "tlm"
            ? "TLM"
            : "Manager";

  const loc = user?.hq || "Mumbai West (Area)";

  const notificationCount =
    role === "ho" ? 18 : role === "manager" ? 12 : 8;

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
        position: "relative",
        width: "100%",
        height: isMobile ? "58px" : "64px",
        minHeight: isMobile ? "58px" : "64px",
        padding: isMobile ? "0 14px" : "0 22px",
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "10px" : "14px",
        background: "#ffffff",
        borderBottom: "1px solid #e5ebf4",
        boxShadow: "0 1px 5px rgba(15, 35, 70, 0.045)",
        boxSizing: "border-box",
        flexWrap: "nowrap",
        zIndex: 1000,
      }}
    >
      {/* =====================================================
          MOBILE MENU
      ===================================================== */}
      {isMobile && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          style={{
            width: "34px",
            height: "34px",
            padding: 0,
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#334155",
            cursor: "pointer",
            flexShrink: 0,
            borderRadius: "8px",
          }}
        >
          {isSidebarOpen ? (
            <X size={21} strokeWidth={2} />
          ) : (
            <Menu size={21} strokeWidth={2} />
          )}
        </button>
      )}

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}
      <button
        type="button"
        onClick={handleGoBack}
        aria-label="Go back"
        style={{
          width: "34px",
          height: "34px",
          padding: 0,
          border: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#334155",
          cursor: "pointer",
          flexShrink: 0,
          borderRadius: "8px",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f4f7fb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </button>

      {/* =====================================================
          SPACER
      ===================================================== */}
      <div
        style={{
          flex: 1,
          minWidth: "20px",
        }}
      />

      {/* =====================================================
          LOCATION
      ===================================================== */}
      {!isMobile && (
        <div
          style={{
            height: "36px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "0 12px",
            borderRadius: "9px",
            background: "#f8faff",
            border: "1px solid #e5ecf7",
            color: "#475569",
            fontSize: "12px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            maxWidth: "220px",
            boxSizing: "border-box",
          }}
        >
          <MapPin
            size={16}
            strokeWidth={2}
            style={{
              color: "#0758f7",
              flexShrink: 0,
            }}
          />

          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {loc}
          </span>
        </div>
      )}

      {/* =====================================================
          NOTIFICATION
      ===================================================== */}
      <button
        type="button"
        aria-label="Notifications"
        style={{
          position: "relative",
          width: "36px",
          height: "36px",
          padding: 0,
          border: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#334155",
          cursor: "pointer",
          borderRadius: "9px",
          flexShrink: 0,
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f4f7fb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Bell
          size={isMobile ? 20 : 21}
          strokeWidth={2}
        />

        <span
          style={{
            position: "absolute",
            top: "1px",
            right: "0px",
            minWidth: "16px",
            height: "16px",
            padding: "0 4px",
            borderRadius: "999px",
            background: "#0758f7",
            color: "#ffffff",
            fontSize: "9px",
            lineHeight: "16px",
            fontWeight: 700,
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          {notificationCount}
        </span>
      </button>

      {/* =====================================================
          PROFILE
      ===================================================== */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          aria-label="Open profile menu"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "0",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {/* Do NOT scale Avatar.
              Let UIComponents control its normal size. */}
          <Avatar
            name={name}
            role={designation}
          />

          {!isMobile && (
            <ChevronDown
              size={16}
              strokeWidth={2}
              style={{
                color: "#64748b",
                transition: "transform 0.15s ease",
                transform: isProfileOpen
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
            />
          )}
        </button>

        {/* =====================================================
            PROFILE DROPDOWN
        ===================================================== */}
        {isProfileOpen && (
          <div
            style={{
              position: "absolute",
              top: "47px",
              right: 0,
              width: "205px",
              padding: "6px",
              background: "#ffffff",
              border: "1px solid #e3e9f2",
              borderRadius: "11px",
              boxShadow: "0 12px 32px rgba(15, 35, 70, 0.13)",
              zIndex: 1200,
              boxSizing: "border-box",
            }}
          >
            {/* USER INFO */}
            <div
              style={{
                padding: "10px 11px 11px",
                borderBottom: "1px solid #edf1f6",
                marginBottom: "5px",
              }}
            >
              <div
                style={{
                  color: "#172554",
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </div>

              <div
                style={{
                  marginTop: "2px",
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                {designation}
              </div>
            </div>

            {/* EDIT PROFILE */}
            <div
              onClick={handleProfileClick}
              style={{
                minHeight: "38px",
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                gap: "9px",
                cursor: "pointer",
                borderRadius: "8px",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 500,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f5f8fc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <User size={15} strokeWidth={2} />
              <span>Edit Profile</span>
            </div>

            {/* LOGOUT */}
            <div
              onClick={handleLogout}
              style={{
                minHeight: "38px",
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                gap: "9px",
                cursor: "pointer",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "12px",
                fontWeight: 500,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fff1f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={15} strokeWidth={2} />
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}