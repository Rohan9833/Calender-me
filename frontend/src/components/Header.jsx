import React, { useEffect, useState } from "react";
import {
  Menu,
  MapPin,
  Bell,
  ChevronDown,
  X,
  User,
  LogOut,
  ArrowLeft,
  ClipboardCheck,
  CalendarClock,
  Hand,
} from "lucide-react";
import { Avatar } from "./UIComponents";
import { useNavigate } from "react-router-dom";
import { getPendingActions } from "../api/managerAPI";

export default function Header({
  role = "mr",
  onMenuClick,
  isSidebarOpen = true,
  isMobile = false,
}) {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [pendingActions, setPendingActions] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

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

  const notificationCount = pendingActions.reduce(
    (total, action) => total + (action.count || 0),
    0,
  );

  useEffect(() => {
    let mounted = true;

    const loadPendingActions = async () => {
      const actualRole = user?.role;

      if (!["flm", "slm", "tlm", "ho"].includes(actualRole)) {
        if (mounted) setPendingActions([]);
        return;
      }

      setPendingLoading(true);

      try {
        const response = await getPendingActions();

        if (mounted) {
          setPendingActions(response?.success ? response.actions || [] : []);
        }
      } finally {
        if (mounted) setPendingLoading(false);
      }
    };

    loadPendingActions();

    return () => {
      mounted = false;
    };
  }, [user?.role, user?.flmId, user?.slmId, user?.tlmId, user?.hoId]);

  const actionIcon = (type) => {
    if (type === "calendar") return CalendarClock;
    if (type === "input") return Hand;
    return ClipboardCheck;
  };

  const handlePendingActionClick = (action) => {
    setIsNotificationOpen(false);
    if (action?.route) navigate(action.route);
  };

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

      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setIsNotificationOpen((prev) => !prev)}
          style={{
            position: "relative",
            width: "36px",
            height: "36px",
            padding: 0,
            border: "none",
            background: isNotificationOpen ? "#f4f7fb" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#334155",
            cursor: "pointer",
            borderRadius: "9px",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f4f7fb";
          }}
          onMouseLeave={(e) => {
            if (!isNotificationOpen) e.currentTarget.style.background = "transparent";
          }}
        >
          <Bell size={isMobile ? 20 : 21} strokeWidth={2} />

          {notificationCount > 0 && (
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
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        {isNotificationOpen && (
          <div
            style={{
              position: "absolute",
              top: "44px",
              right: 0,
              width: isMobile ? "min(330px, calc(100vw - 28px))" : "370px",
              maxHeight: "min(520px, calc(100vh - 90px))",
              overflowY: "auto",
              background: "#ffffff",
              border: "1px solid #e3e9f2",
              borderRadius: "14px",
              boxShadow: "0 18px 45px rgba(15,35,70,0.16)",
              zIndex: 1300,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #edf1f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ color: "#172554", fontSize: "14px", fontWeight: 750 }}>
                  Pending Actions
                </div>
                <div style={{ marginTop: "2px", color: "#94a3b8", fontSize: "11px" }}>
                  {notificationCount > 0
                    ? notificationCount + " item" + (notificationCount === 1 ? "" : "s") + " require" + (notificationCount === 1 ? "s" : "") + " your attention"
                    : "You have no pending actions"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNotificationOpen(false)}
                aria-label="Close notifications"
                style={{
                  width: "28px",
                  height: "28px",
                  border: "none",
                  borderRadius: "7px",
                  background: "#f8fafc",
                  color: "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: "8px" }}>
              {pendingLoading ? (
                <div style={{ padding: "28px 12px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
                  Loading pending actions...
                </div>
              ) : pendingActions.length === 0 ? (
                <div style={{ padding: "30px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "7px" }}>✓</div>
                  <div style={{ color: "#334155", fontSize: "13px", fontWeight: 700 }}>
                    All caught up
                  </div>
                  <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "11px" }}>
                    There are no pending actions right now.
                  </div>
                </div>
              ) : (
                pendingActions.map((action) => {
                  const Icon = actionIcon(action.icon);

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handlePendingActionClick(action)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "none",
                        borderRadius: "10px",
                        background: "transparent",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "11px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "background .15s ease, transform .15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f7faff";
                        e.currentTarget.style.transform = "translateX(2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          flexShrink: 0,
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#0758f7",
                          background: "#eff6ff",
                        }}
                      >
                        <Icon size={18} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <span style={{ color: "#172554", fontSize: "12px", fontWeight: 700 }}>
                            {action.title}
                          </span>

                          <span
                            style={{
                              minWidth: "24px",
                              padding: "3px 7px",
                              borderRadius: "999px",
                              background: "#fff7ed",
                              color: "#ea580c",
                              fontSize: "10px",
                              fontWeight: 800,
                              textAlign: "center",
                            }}
                          >
                            {action.count}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: "4px",
                            color: "#64748b",
                            fontSize: "10px",
                            lineHeight: 1.45,
                          }}
                        >
                          {action.description}
                        </div>

                        {action.items?.length > 0 && (
                          <div style={{ marginTop: "7px", color: "#94a3b8", fontSize: "9px" }}>
                            {action.items.slice(0, 3).map((item) => item.name).join(", ")}
                            {action.count > 3 ? " +" + (action.count - 3) + " more" : ""}
                          </div>
                        )}
                      </div>

                      <span
                        style={{
                          flexShrink: 0,
                          marginTop: "10px",
                          color: "#94a3b8",
                          fontSize: "16px",
                          lineHeight: 1,
                        }}
                      >
                        ›
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

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