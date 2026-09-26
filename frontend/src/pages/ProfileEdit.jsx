import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
  MapPin,
  Save,
  User,
  Users,
} from "lucide-react";

import Layout from "../components/Layout";
import { getProfile, updateProfile } from "../api/profileAPI";

const ROLE_CONFIG = {
  mr: {
    idField: "mrId",
    nameField: "mrName",
    dashboard: "/mr-dashboard",
  },
  flm: {
    idField: "flmId",
    nameField: "flmName",
    dashboard: "/manager-dashboard",
  },
  slm: {
    idField: "slmId",
    nameField: "slmName",
    dashboard: "/manager-dashboard",
  },
  tlm: {
    idField: "tlmId",
    nameField: "tlmName",
    dashboard: "/manager-dashboard",
  },
};

export default function ProfileEdit() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [form, setForm] = useState({
    name: "",
    hq: "",
    region: "",
    zone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const role = String(user?.role || "mr").toLowerCase();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.mr;
  const userId = user?.[config.idField];

  const displayName = form.name || "User";

  const initials = useMemo(
    () =>
      displayName
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U",
    [displayName],
  );

  useEffect(() => {
    const loadProfile = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      setUser(storedUser);

      const storedRole = String(storedUser?.role || "mr").toLowerCase();
      const storedConfig = ROLE_CONFIG[storedRole] || ROLE_CONFIG.mr;
      const storedUserId = storedUser?.[storedConfig.idField];

      if (!storedUserId) {
        setForm({
          name: storedUser?.[storedConfig.nameField] || "",
          hq: storedUser?.hq || "",
          region: storedUser?.region || "",
          zone: storedUser?.zone || "",
        });
        setLoading(false);
        setError("User ID was not found.");
        return;
      }

      try {
        const response = await getProfile(storedRole, storedUserId);
        const profile = response?.user || storedUser;

        setUser(profile);
        setForm({
          name: profile?.[storedConfig.nameField] || "",
          hq: profile?.hq || "",
          region: profile?.region || "",
          zone: profile?.zone || "",
        });

        localStorage.setItem("user", JSON.stringify(profile));
      } catch (err) {
        console.error("Failed to load profile:", err);

        setForm({
          name: storedUser?.[storedConfig.nameField] || "",
          hq: storedUser?.hq || "",
          region: storedUser?.region || "",
          zone: storedUser?.zone || "",
        });

        setError("Could not load the latest profile data.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("User ID was not found.");
      return;
    }

    if (!form.name.trim() || !form.hq.trim() || !form.region.trim() || !form.zone.trim()) {
      setError("Please fill in all four fields.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await updateProfile(role, userId, {
        name: form.name.trim(),
        hq: form.hq.trim(),
        region: form.region.trim(),
        zone: form.zone.trim(),
      });

      const updatedUser = response?.user;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        const localUser = {
          ...user,
          [config.nameField]: form.name.trim(),
          hq: form.hq.trim(),
          region: form.region.trim(),
          zone: form.zone.trim(),
        };

        setUser(localUser);
        localStorage.setItem("user", JSON.stringify(localUser));
      }

      setSaved(true);
    } catch (err) {
      console.error("Failed to update profile:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const goToDashboard = () => navigate(config.dashboard);

  return (
    <Layout active="Profile">
      <div className="profile-page">
        <div className="profile-topbar">
          <button
            type="button"
            className="profile-back"
            onClick={goToDashboard}
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

          <nav className="profile-nav">
            <button type="button" onClick={goToDashboard}>
              <LayoutDashboard size={15} />
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => navigate("/all-doctors")}
            >
              <Users size={15} />
              My Doctors
            </button>

            <button
              type="button"
              onClick={() => navigate("/input-given")}
            >
              <MapPin size={15} />
              Input Given
            </button>

            <button type="button" className="active">
              <User size={15} />
              Profile
            </button>
          </nav>
        </div>

        <div className="profile-breadcrumb">
          <button type="button" onClick={goToDashboard}>
            Dashboard
          </button>
          <span>/</span>
          <strong>Profile</strong>
        </div>

        <section className="profile-hero">
          <div>
            <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
            <h1>Edit Profile</h1>
            <p>
              Update your basic workspace information. Only these four fields
              can be edited.
            </p>
          </div>

          <div className="profile-avatar">
            {initials}
          </div>
        </section>

        {saved && (
          <div className="profile-message success">
            <CheckCircle2 size={17} />
            <span>Profile updated successfully.</span>
          </div>
        )}

        {error && (
          <div className="profile-message error">
            <span>{error}</span>
          </div>
        )}

        <div className="profile-content">
          <aside className="profile-summary">
            <div className="summary-avatar">{initials}</div>
            <h2>{displayName}</h2>
            <span className="summary-role">
              {role.toUpperCase()}
            </span>

            <div className="summary-divider" />

            <div className="summary-item">
              <span>Employee ID</span>
              <strong>{user?.[config.idField] || "—"}</strong>
            </div>

            <div className="summary-item">
              <span>HQ</span>
              <strong>{form.hq || "—"}</strong>
            </div>

            <div className="summary-item">
              <span>Region</span>
              <strong>{form.region || "—"}</strong>
            </div>

            <div className="summary-item">
              <span>Zone</span>
              <strong>{form.zone || "—"}</strong>
            </div>
          </aside>

          <main className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Profile Information</h2>
                <p>Edit the four profile fields below.</p>
              </div>
              <div className="profile-card-icon">
                <User size={19} />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="profile-fields">
                <div className="profile-field">
                  <label htmlFor="profile-name">Name</label>
                  <div className="profile-input">
                    <User size={17} />
                    <input
                      id="profile-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-hq">HQ</label>
                  <div className="profile-input">
                    <MapPin size={17} />
                    <input
                      id="profile-hq"
                      type="text"
                      name="hq"
                      value={form.hq}
                      onChange={handleChange}
                      placeholder="Enter your HQ"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-region">Region</label>
                  <div className="profile-input">
                    <MapPin size={17} />
                    <input
                      id="profile-region"
                      type="text"
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      placeholder="Enter your region"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-zone">Zone</label>
                  <div className="profile-input">
                    <MapPin size={17} />
                    <input
                      id="profile-zone"
                      type="text"
                      name="zone"
                      value={form.zone}
                      onChange={handleChange}
                      placeholder="Enter your zone"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-cancel"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save"
                  disabled={loading || saving}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>

      <style>{`
        .profile-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 8px 4px 40px;
        }

        .profile-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 8px;
          margin-bottom: 14px;
          background: #fff;
          border: 1px solid #e8edf3;
          border-radius: 13px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
        }

        .profile-back,
        .profile-nav button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 36px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
        }

        .profile-back {
          padding: 0 11px;
          border: 1px solid #e2e8f0;
        }

        .profile-nav {
          display: flex;
          gap: 3px;
          padding: 3px;
          background: #f8fafc;
          border-radius: 9px;
        }

        .profile-nav button {
          padding: 0 11px;
        }

        .profile-nav button:hover,
        .profile-nav button.active {
          color: #c2410c;
          background: #fff;
          box-shadow: 0 2px 7px rgba(15, 23, 42, 0.07);
        }

        .profile-breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 0 3px 14px;
          color: #94a3b8;
          font-size: 10px;
        }

        .profile-breadcrumb button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          font-size: 10px;
        }

        .profile-breadcrumb strong {
          color: #475569;
        }

        .profile-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 150px;
          padding: 28px 32px;
          margin-bottom: 14px;
          border: 1px solid #e8edf3;
          border-radius: 16px;
          background: linear-gradient(135deg, #fff, #fff8f3);
        }

        .profile-eyebrow {
          color: #f47a32;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .profile-hero h1 {
          margin: 7px 0 5px;
          color: #172033;
          font-size: 28px;
          line-height: 1.1;
        }

        .profile-hero p {
          max-width: 590px;
          margin: 0;
          color: #7b8797;
          font-size: 11px;
          line-height: 1.7;
        }

        .profile-avatar,
        .summary-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #fff;
          background: #f47a32;
          font-weight: 800;
        }

        .profile-avatar {
          width: 72px;
          height: 72px;
          font-size: 22px;
          box-shadow: 0 10px 25px rgba(244, 122, 50, 0.2);
        }

        .profile-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 14px;
          margin-bottom: 14px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 650;
        }

        .profile-message.success {
          color: #166534;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .profile-message.error {
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .profile-content {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 15px;
        }

        .profile-summary,
        .profile-card {
          background: #fff;
          border: 1px solid #e8edf3;
          border-radius: 15px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.035);
        }

        .profile-summary {
          padding: 22px;
        }

        .summary-avatar {
          width: 52px;
          height: 52px;
          margin-bottom: 13px;
          font-size: 16px;
        }

        .profile-summary h2 {
          margin: 0 0 5px;
          color: #172033;
          font-size: 17px;
        }

        .summary-role {
          color: #f47a32;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .summary-divider {
          height: 1px;
          margin: 20px 0 4px;
          background: #edf0f4;
        }

        .summary-item {
          padding: 11px 0;
          border-bottom: 1px solid #f0f2f5;
        }

        .summary-item:last-child {
          border-bottom: 0;
        }

        .summary-item span {
          display: block;
          margin-bottom: 4px;
          color: #9aa4b2;
          font-size: 9px;
        }

        .summary-item strong {
          display: block;
          color: #334155;
          font-size: 11px;
        }

        .profile-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 21px 23px;
          border-bottom: 1px solid #edf0f4;
        }

        .profile-card-header h2 {
          margin: 0 0 4px;
          color: #172033;
          font-size: 16px;
        }

        .profile-card-header p {
          margin: 0;
          color: #8b96a5;
          font-size: 10px;
        }

        .profile-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          color: #f47a32;
          background: #fff4ec;
        }

        .profile-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          padding: 23px;
        }

        .profile-field label {
          display: block;
          margin-bottom: 7px;
          color: #475569;
          font-size: 10px;
          font-weight: 750;
        }

        .profile-input {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 42px;
          padding: 0 12px;
          border: 1px solid #dfe5ec;
          border-radius: 9px;
          background: #fff;
          transition: border-color .18s ease, box-shadow .18s ease;
        }

        .profile-input:focus-within {
          border-color: #f47a32;
          box-shadow: 0 0 0 3px rgba(244, 122, 50, .08);
        }

        .profile-input svg {
          flex: 0 0 auto;
          color: #a1acba;
        }

        .profile-input:focus-within svg {
          color: #f47a32;
        }

        .profile-input input {
          width: 100%;
          border: 0;
          outline: 0;
          color: #334155;
          background: transparent;
          font: inherit;
          font-size: 11px;
        }

        .profile-input input::placeholder {
          color: #b0b8c3;
        }

        .profile-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 17px 23px;
          border-top: 1px solid #edf0f4;
          background: #fcfdfe;
          border-radius: 0 0 15px 15px;
        }

        .profile-cancel,
        .profile-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 39px;
          padding: 0 16px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
        }

        .profile-cancel {
          color: #475569;
          background: #fff;
          border: 1px solid #dce2e9;
        }

        .profile-save {
          color: #fff;
          background: #f47a32;
          border: 1px solid #f47a32;
          box-shadow: 0 5px 14px rgba(244, 122, 50, .18);
        }

        .profile-save:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        @media (max-width: 800px) {
          .profile-topbar {
            justify-content: flex-start;
          }

          .profile-nav {
            overflow-x: auto;
          }

          .profile-nav button {
            white-space: nowrap;
          }

          .profile-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .profile-page {
            padding: 4px 0 25px;
          }

          .profile-hero {
            padding: 22px;
          }

          .profile-avatar {
            width: 56px;
            height: 56px;
            font-size: 17px;
          }

          .profile-fields {
            grid-template-columns: 1fr;
            padding: 18px;
          }

          .profile-card-header,
          .profile-actions {
            padding-left: 18px;
            padding-right: 18px;
          }

          .profile-back {
            display: none;
          }
        }
      `}</style>
    </Layout>
  );
}
