import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Camera,
  LayoutDashboard,
  Users,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import Layout from "../components/Layout";
import { Button, Crumbs } from "../components/UIComponents";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    setUser(storedUser);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Update user in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // You can also make an API call to update the user
      // const response = await fetch(`/api/users/${user._id}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(user),
      // });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    user?.mrName || user?.flmName || user?.slmName || user?.tlmName || "User";

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const navItems = [
    {
      label: "Dashboard",
      path: "/mr-dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Doctors",
      path: "/my-doctors",
      icon: Users,
    },
    {
      label: "Input Given",
      path: "/input-given",
      icon: CalendarCheck,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  const handleTopNavigation = (path) => {
    navigate(path);
  };

  return (
    <Layout active="Profile">
      <div className="profile-page">
        {/* =====================================================
            TOP NAVIGATION
        ===================================================== */}

        {/* <div className="profile-top-nav">
          <div className="profile-nav-left">
            <button
              type="button"
              className="profile-back-button"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="profile-nav-divider" />

            <div className="profile-nav-title">
              <span>Workspace</span>
              <strong>Profile Settings</strong>
            </div>
          </div>

          <nav className="profile-main-nav">
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path ||
                (
                  item.path === "/profile" &&
                  location.pathname === "/profile/edit"
                );

              return (
                <button
                  key={item.path}
                  type="button"
                  className={`profile-nav-item ${
                    isActive
                      ? "profile-nav-item-active"
                      : ""
                  }`}
                  onClick={() =>
                    handleTopNavigation(
                      item.path
                    )
                  }
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div> */}

        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <div className="profile-breadcrumb">
          <button type="button" onClick={() => navigate("/mr-dashboard")}>
            Dashboard
          </button>

          {/* <ChevronRight size={14} />

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            Profile
          </button> */}

          <ChevronRight size={14} />

          <strong>Edit Profile</strong>
        </div>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="profile-header">
          <div className="profile-header-content">
            <div className="profile-eyebrow">
              <span className="profile-eyebrow-dot" />
              ACCOUNT SETTINGS
            </div>

            <h1>Edit Profile</h1>

            <p>
              Manage your personal information and workspace details from one
              place.
            </p>
          </div>

          <div className="profile-header-badge">
            <ShieldCheck size={18} />

            <div>
              <strong>Profile</strong>
              <span>Account information</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        {saved && (
          <div className="profile-success">
            <div className="profile-success-icon">
              <CheckCircle2 size={17} />
            </div>

            <div>
              <strong>Profile updated successfully</strong>

              <span>Your changes have been saved.</span>
            </div>
          </div>
        )}

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="profile-layout">
          {/* ===================================================
              PROFILE SIDEBAR
          =================================================== */}

          <aside className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {initials}

                <button
                  type="button"
                  className="profile-camera"
                  title="Change profile picture"
                >
                  <Camera size={14} />
                </button>
              </div>

              <h2>{displayName}</h2>

              <p>{user?.email || "No email available"}</p>

              <div className="profile-role">
                {user?.role?.toLowerCase() === "mr"
                  ? "Medical Representative"
                  : user?.role?.toLowerCase() === "flm"
                    ? "First Line Manager"
                    : user?.role?.toLowerCase() === "slm"
                      ? "Second Line Manager"
                      : user?.role?.toLowerCase() === "tlm"
                        ? "Third Line Manager"
                        : "User"}
              </div>
            </div>

            <div className="profile-sidebar-divider" />

            <div className="profile-sidebar-info">
              <div>
                <span>Employee ID</span>
                <strong>
                  {{
                    mr: user?.mrId,
                    flm: user?.flmId,
                    slm: user?.slmId,
                    tlm: user?.tlmId,
                  }[user?.role?.toLowerCase()] || "Not available"}
                </strong>
              </div>

              <div>
                <span>Zone</span>
                <strong>{user?.zone || "Not specified"}</strong>
              </div>

              <div>
                <span>Location</span>
                <strong>{user?.hq || "Not specified"}</strong>
              </div>
            </div>
          </aside>

          {/* ===================================================
              FORM
          =================================================== */}

          <main className="profile-form-card">
            <div className="profile-form-header">
              <div>
                <h2>Personal Information</h2>

                <p>Update the information associated with your profile.</p>
              </div>

              <div className="profile-form-icon">
                <User size={19} />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* ===============================================
                  BASIC INFORMATION
              =============================================== */}

              <div className="profile-section">
                <div className="profile-section-heading">
                  <div>
                    <h3>Basic Information</h3>

                    <p>Your primary contact details.</p>
                  </div>
                </div>

                <div className="profile-form-grid">
                  {/* NAME */}
                  <div className="profile-field">
                    <label>Full Name</label>

                    <div className="profile-input-wrapper">
                      <User size={17} />

                      <input
                        type="text"
                        name="mrName"
                        value={
                          user?.mrName ||
                          user?.flmName ||
                          user?.slmName ||
                          user?.tlmName ||
                          ""
                        }
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="profile-field">
                    <label>Email Address</label>

                    <div className="profile-input-wrapper">
                      <Mail size={17} />

                      <input
                        type="email"
                        name="email"
                        value={user?.email || ""}
                        onChange={handleChange}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className="profile-field">
                    <label>Phone Number</label>

                    <div className="profile-input-wrapper">
                      <Phone size={17} />

                      <input
                        type="tel"
                        name="phone"
                        value={user?.phone || ""}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="profile-field">
                    <label>Location / HQ</label>

                    <div className="profile-input-wrapper">
                      <MapPin size={17} />

                      <input
                        type="text"
                        name="hq"
                        value={user?.hq || ""}
                        onChange={handleChange}
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  WORK INFORMATION
              =============================================== */}

              <div className="profile-section">
                <div className="profile-section-heading">
                  <div>
                    <h3>Work Information</h3>

                    <p>Your organization and employee details.</p>
                  </div>
                </div>

                <div className="profile-form-grid">
                  {/* DEPARTMENT */}
                  <div className="profile-field">
                    <label>Department</label>

                    <div className="profile-input-wrapper">
                      <Building size={17} />

                      <input
                        type="text"
                        name="department"
                        value={user?.department || ""}
                        onChange={handleChange}
                        placeholder="Enter department"
                      />
                    </div>
                  </div>

                  {/* EMPLOYEE ID */}
                  <div className="profile-field">
                    <label>
                      Employee ID
                      <span>Read only</span>
                    </label>

                    <div className="profile-input-wrapper profile-input-disabled">
                      <Briefcase size={17} />

                      <input
                        type="text"
                        name="employeeId"
                        value={user?.employeeId || ""}
                        onChange={handleChange}
                        disabled
                        placeholder="Employee ID"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  FORM ACTIONS
              =============================================== */}

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={loading}
                >
                  <Save size={16} />

                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>

      {/* =====================================================
          COMPLETE UI
      ===================================================== */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .profile-page {
          width: 100%;
          padding-bottom: 45px;
        }

        /* =====================================================
           TOP NAVIGATION
        ===================================================== */

        .profile-top-nav {
          min-height: 66px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 14px;
          padding: 8px 10px 8px 15px;
          border: 1px solid #e8edf3;
          border-radius: 14px;
          background: #ffffff;
          box-shadow:
            0 3px 12px
            rgba(15, 23, 42, 0.035);
        }

        .profile-nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .profile-back-button {
          height: 38px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          color: #475569;
          background: #ffffff;
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        }

        .profile-back-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateX(-1px);
        }

        .profile-nav-divider {
          width: 1px;
          height: 27px;
          background: #e5eaf0;
        }

        .profile-nav-title {
          min-width: 0;
        }

        .profile-nav-title span {
          display: block;
          color: #9aa4b2;
          font-size: 8px;
          font-weight: 650;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .profile-nav-title strong {
          display: block;
          margin-top: 2px;
          color: #1e293b;
          font-size: 12px;
          font-weight: 750;
        }

        .profile-main-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #edf0f4;
        }

        .profile-nav-item {
          height: 34px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px;
          border: 0;
          border-radius: 7px;
          color: #64748b;
          background: transparent;
          cursor: pointer;
          font-size: 10px;
          font-weight: 650;
          transition:
            color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .profile-nav-item:hover {
          color: #334155;
          background: #ffffff;
        }

        .profile-nav-item-active {
          color: #c2410c !important;
          background: #ffffff !important;
          box-shadow:
            0 2px 7px
            rgba(15, 23, 42, 0.07);
        }

        .profile-nav-item-active svg {
          color: #f47a32;
        }

        /* =====================================================
           BREADCRUMB
        ===================================================== */

        .profile-breadcrumb {
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 0 2px 16px;
          color: #94a3b8;
          font-size: 10px;
        }

        .profile-breadcrumb button {
          padding: 0;
          border: 0;
          color: #94a3b8;
          background: transparent;
          cursor: pointer;
          font-size: 10px;
        }

        .profile-breadcrumb button:hover {
          color: #f47a32;
        }

        .profile-breadcrumb strong {
          color: #475569;
          font-weight: 650;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .profile-header {
          position: relative;
          overflow: hidden;
          min-height: 155px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 17px;
          padding: 28px 30px;
          border-radius: 18px;
          background:
            linear-gradient(
              120deg,
              #172033 0%,
              #24324a 55%,
              #34465f 100%
            );
          box-shadow:
            0 12px 30px
            rgba(23, 32, 51, 0.12);
        }

        .profile-header::before {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          right: 120px;
          top: -160px;
          border-radius: 50%;
          background:
            rgba(244,122,50,0.09);
        }

        .profile-header::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: -50px;
          bottom: -130px;
          border-radius: 50%;
          background:
            rgba(255,255,255,0.04);
        }

        .profile-header-content {
          position: relative;
          z-index: 2;
        }

        .profile-eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 9px;
          color: #fdba74;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.1em;
        }

        .profile-eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f47a32;
          box-shadow:
            0 0 0 4px
            rgba(244,122,50,0.12);
        }

        .profile-header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 750;
          letter-spacing: -0.025em;
        }

        .profile-header p {
          max-width: 550px;
          margin: 8px 0 0;
          color: rgba(255,255,255,0.65);
          font-size: 12px;
          line-height: 1.6;
        }

        .profile-header-badge {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 175px;
          padding: 11px 13px;
          border-radius: 11px;
          background:
            rgba(255,255,255,0.08);
          border:
            1px solid
            rgba(255,255,255,0.1);
        }

        .profile-header-badge svg {
          color: #86efac;
        }

        .profile-header-badge strong {
          display: block;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
        }

        .profile-header-badge span {
          display: block;
          margin-top: 2px;
          color: rgba(255,255,255,0.52);
          font-size: 8px;
        }

        /* =====================================================
           SUCCESS
        ===================================================== */

        .profile-success {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 17px;
          padding: 11px 13px;
          border: 1px solid #bbf7d0;
          border-radius: 11px;
          background: #f0fdf4;
        }

        .profile-success-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #15803d;
          background: #dcfce7;
        }

        .profile-success strong {
          display: block;
          color: #166534;
          font-size: 11px;
        }

        .profile-success span {
          display: block;
          margin-top: 2px;
          color: #4d7c5a;
          font-size: 9px;
        }

        /* =====================================================
           LAYOUT
        ===================================================== */

        .profile-layout {
          display: grid;
          grid-template-columns:
            275px minmax(0, 1fr);
          gap: 17px;
          align-items: start;
        }

        /* =====================================================
           SIDEBAR
        ===================================================== */

        .profile-sidebar {
          overflow: hidden;
          border: 1px solid #e8edf3;
          border-radius: 15px;
          background: #ffffff;
          box-shadow:
            0 3px 12px
            rgba(15, 23, 42, 0.035);
        }

        .profile-avatar-section {
          padding: 25px 20px 21px;
          text-align: center;
        }

        .profile-avatar-large {
          position: relative;
          width: 88px;
          height: 88px;
          margin: 0 auto 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #ffffff;
          background:
            linear-gradient(
              135deg,
              #f47a32,
              #d95816
            );
          border: 4px solid #fff7ed;
          box-shadow:
            0 8px 20px
            rgba(244,122,50,0.18);
          font-size: 27px;
          font-weight: 750;
        }

        .profile-camera {
          position: absolute;
          right: -2px;
          bottom: 1px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          border-radius: 50%;
          color: #ffffff;
          background: #172033;
          cursor: pointer;
          box-shadow:
            0 3px 9px
            rgba(15,23,42,0.18);
        }

        .profile-camera:hover {
          background: #f47a32;
        }

        .profile-avatar-section h2 {
          margin: 0;
          color: #1e293b;
          font-size: 15px;
          font-weight: 750;
        }

        .profile-avatar-section p {
          margin: 4px 0 8px;
          color: #94a3b8;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .profile-role {
          display: inline-flex;
          padding: 5px 8px;
          border-radius: 999px;
          color: #c2410c;
          background: #fff1e8;
          border: 1px solid #fed7aa;
          font-size: 8px;
          font-weight: 700;
        }

        .profile-sidebar-divider {
          height: 1px;
          margin: 0 17px;
          background: #edf0f4;
        }

        .profile-sidebar-info {
          padding: 17px 19px 20px;
        }

        .profile-sidebar-info > div {
          margin-bottom: 14px;
        }

        .profile-sidebar-info > div:last-child {
          margin-bottom: 0;
        }

        .profile-sidebar-info span {
          display: block;
          color: #9aa4b2;
          font-size: 8px;
          font-weight: 650;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .profile-sidebar-info strong {
          display: block;
          margin-top: 3px;
          color: #334155;
          font-size: 10px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        /* =====================================================
           FORM CARD
        ===================================================== */

        .profile-form-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e8edf3;
          border-radius: 15px;
          background: #ffffff;
          box-shadow:
            0 3px 12px
            rgba(15, 23, 42, 0.035);
        }

        .profile-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f4;
        }

        .profile-form-header h2 {
          margin: 0;
          color: #1e293b;
          font-size: 15px;
          font-weight: 750;
        }

        .profile-form-header p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 10px;
        }

        .profile-form-icon {
          width: 37px;
          height: 37px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          color: #ea6a23;
          background: #fff1e8;
        }

        .profile-section {
          padding: 21px 22px;
          border-bottom: 1px solid #edf0f4;
        }

        .profile-section-heading {
          margin-bottom: 15px;
        }

        .profile-section-heading h3 {
          margin: 0;
          color: #334155;
          font-size: 12px;
          font-weight: 750;
        }

        .profile-section-heading p {
          margin: 3px 0 0;
          color: #a0a9b6;
          font-size: 9px;
        }

        .profile-form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .profile-field label {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 6px;
          color: #475569;
          font-size: 10px;
          font-weight: 700;
        }

        .profile-field label span {
          color: #94a3b8;
          font-size: 8px;
          font-weight: 500;
        }

        .profile-input-wrapper {
          position: relative;
        }

        .profile-input-wrapper > svg {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          transition:
            color 0.18s ease;
        }

        .profile-input-wrapper input {
          width: 100%;
          height: 40px;
          padding:
            0 12px 0 37px;
          border:
            1px solid #dce2e9;
          border-radius: 8px;
          outline: none;
          color: #334155;
          background: #ffffff;
          font-family: inherit;
          font-size: 11px;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }

        .profile-input-wrapper input::placeholder {
          color: #b0b8c3;
        }

        .profile-input-wrapper input:hover {
          border-color: #cbd5e1;
        }

        .profile-input-wrapper input:focus {
          border-color: #f47a32;
          box-shadow:
            0 0 0 3px
            rgba(244,122,50,0.08);
        }

        .profile-input-wrapper:focus-within > svg {
          color: #f47a32;
        }

        .profile-input-disabled input {
          color: #94a3b8;
          background: #f8fafc;
          cursor: not-allowed;
        }

        .profile-input-disabled > svg {
          color: #b0b8c3;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .profile-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 17px 22px;
          background: #fcfdfe;
        }

        .profile-cancel-button,
        .profile-save-button {
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 17px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          transition:
            transform 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .profile-cancel-button {
          color: #475569;
          background: #ffffff;
          border: 1px solid #dce2e9;
        }

        .profile-cancel-button:hover {
          background: #f8fafc;
          transform: translateY(-1px);
        }

        .profile-save-button {
          color: #ffffff;
          background: #f47a32;
          border: 1px solid #f47a32;
          box-shadow:
            0 5px 14px
            rgba(244,122,50,0.18);
        }

        .profile-save-button:hover:not(:disabled) {
          background: #e96d25;
          transform: translateY(-1px);
          box-shadow:
            0 7px 18px
            rgba(244,122,50,0.22);
        }

        .profile-save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1050px) {
          .profile-main-nav {
            display: none;
          }

          .profile-layout {
            grid-template-columns:
              230px minmax(0, 1fr);
          }
        }

        @media (max-width: 760px) {
          .profile-top-nav {
            padding: 8px 10px;
          }

          .profile-nav-title {
            display: none;
          }

          .profile-nav-divider {
            display: none;
          }

          .profile-back-button span {
            display: none;
          }

          .profile-back-button {
            width: 38px;
            padding: 0;
            justify-content: center;
          }

          .profile-main-nav {
            display: flex;
            margin-left: auto;
          }

          .profile-nav-item {
            width: 34px;
            padding: 0;
            justify-content: center;
          }

          .profile-nav-item span {
            display: none;
          }

          .profile-layout {
            grid-template-columns: 1fr;
          }

          .profile-sidebar {
            display: grid;
            grid-template-columns:
              1fr 1fr;
          }

          .profile-avatar-section {
            padding: 18px;
          }

          .profile-sidebar-divider {
            display: none;
          }

          .profile-sidebar-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-left: 1px solid #edf0f4;
          }

          .profile-header {
            padding: 24px;
          }

          .profile-header-badge {
            display: none;
          }
        }

        @media (max-width: 560px) {
          .profile-main-nav {
            gap: 2px;
          }

          .profile-nav-item {
            width: 31px;
            height: 31px;
          }

          .profile-breadcrumb {
            margin-bottom: 12px;
          }

          .profile-header {
            min-height: 135px;
            padding: 22px;
          }

          .profile-header h1 {
            font-size: 24px;
          }

          .profile-header p {
            font-size: 10px;
          }

          .profile-sidebar {
            display: block;
          }

          .profile-sidebar-info {
            border-left: 0;
            border-top: 1px solid #edf0f4;
          }

          .profile-form-grid {
            grid-template-columns: 1fr;
          }

          .profile-section {
            padding: 18px 16px;
          }

          .profile-form-header {
            padding: 17px 16px;
          }

          .profile-form-actions {
            padding: 14px 16px;
          }

          .profile-cancel-button,
          .profile-save-button {
            flex: 1;
          }
        }
      `}</style>
    </Layout>
  );
}
