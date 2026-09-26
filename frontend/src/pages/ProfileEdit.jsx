import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import Layout from "../components/Layout";
import { Button, Crumbs } from "../components/UIComponents";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
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

  return (
    <Layout active="Profile">
      <Crumbs items={["Profile", "Edit Profile"]} />

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            style={{ padding: "8px" }}
          >
            Back
          </Button>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Edit Profile</h1>
        </div>

        {saved && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#dcfce7",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              color: "#16a34a",
              marginBottom: "16px",
            }}
          >
            ✅ Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "#0b55f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                color: "white",
                fontSize: "40px",
                fontWeight: "bold",
                position: "relative",
              }}
            >
              {(user?.mrName || user?.flmName || user?.slmName || user?.tlmName || "U").charAt(0).toUpperCase()}
              <button
                type="button"
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "#0b55f4",
                  border: "2px solid white",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <Camera size={16} />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="text"
                name="mrName"
                value={user?.mrName || user?.flmName || user?.slmName || user?.tlmName || ""}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="email"
                name="email"
                value={user?.email || ""}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
              Phone
            </label>
            <div style={{ position: "relative" }}>
              <Phone size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="tel"
                name="phone"
                value={user?.phone || ""}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
              Location / HQ
            </label>
            <div style={{ position: "relative" }}>
              <MapPin size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="text"
                name="hq"
                value={user?.hq || ""}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
              Department
            </label>
            <div style={{ position: "relative" }}>
              <Building size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="text"
                name="department"
                value={user?.department || ""}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
              Employee ID
            </label>
            <div style={{ position: "relative" }}>
              <Briefcase size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="text"
                name="employeeId"
                value={user?.employeeId || ""}
                onChange={handleChange}
                disabled
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#f3f4f6",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <Button variant="outline" onClick={() => navigate(-1)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} disabled={loading} style={{ flex: 1 }}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}