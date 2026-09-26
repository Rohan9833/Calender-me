import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import {
  FileText,
  Send,
  RotateCcw,
  UserPlus,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  Button,
  Field,
  SectionTitle,
  InfoCard,
} from "../components/UIComponents";

export default function AddDoctor() {
  const [formData, setFormData] = useState({
    doctorName: "",
    speciality: "",
    mclCode: "",
    clinicName: "",
    city: "",
    area: "",
    email: "",
    mobile: "",
    preferredContact: "email",
    brand: "",
    currentBusiness: "",
    expectedBusiness: "",
    brandFocus: "",
    otherActivities: "",
  });

  // Popup state
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success", // "success" or "error"
    title: "",
    message: "",
  });

  // Brand options
  const brandOptions = ["Brand A", "Brand B", "Brand C", "Other"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const showPopup = (type, title, message) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup({
      ...popup,
      isOpen: false,
    });
  };

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await axios.post(`${API_BASE_URL}/api/createdoc`, {
        ...formData,
        mrId: user.mrId,
        status: "pending",
      });

      showPopup(
        "success",
        "Doctor Added Successfully!",
        ` ${formData.doctorName} has been submitted for approval.`,
      );

      setFormData({
        doctorName: "",
        speciality: "",
        mclCode: "",
        clinicName: "",
        city: "",
        area: "",
        email: "",
        mobile: "",
        preferredContact: "email",
        brand: "",
        currentBusiness: "",
        expectedBusiness: "",
        brandFocus: "",
        otherActivities: "",
      });

      console.log(response.data);
    } catch (error) {
      console.log(error);
      showPopup(
        "error",
        "Failed to Add Doctor",
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  const handleSaveDraft = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      await axios.post(`${API_BASE_URL}/api/createdoc`, {
        ...formData,
        mrId: user.mrId,
        status: "draft",
      });

      showPopup(
        "success",
        "Draft Saved Successfully!",
        `Dr. ${formData.doctorName} has been saved as draft.`,
      );

      handleClear();
    } catch (error) {
      console.log(error);
      showPopup(
        "error",
        "Failed to Save Draft",
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  const handleClear = () => {
    setFormData({
      doctorName: "",
      speciality: "",
      mclCode: "",
      clinicName: "",
      city: "",
      area: "",
      email: "",
      mobile: "",
      preferredContact: "email",
      brand: "",
      currentBusiness: "",
      expectedBusiness: "",
      brandFocus: "",
      otherActivities: "",
    });
  };

  return (
    <Layout active="Add Doctor">
      <div className="add-doctor-page">
        <div className="add-doctor-breadcrumb" aria-label="Breadcrumb">
          <Link to="/mr-dashboard">Dashboard</Link>
          <span aria-hidden="true">›</span>
          <span>Add Doctor</span>
        </div>
        <h1>Add Doctor</h1>
        <p className="subtitle">
          Enter doctor details and campaign information.
        </p>
        <div className="formLayout">
          <div className="formCard">
            <SectionTitle>A. Doctor Information</SectionTitle>

            <div className="formGrid">
              <Field
                label="Doctor Name *"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
              />

              <Field
                label="Speciality *"
                select
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                options={[
                  "Cardiology",
                  "Dermatology",
                  "Paediatrics",
                  "Orthopedics",
                  "General Physician",
                ]}
              />

              <Field
                label="MCL Code / Doctor Code *"
                name="mclCode"
                value={formData.mclCode}
                onChange={handleChange}
              />

              <Field
                label="Clinic / Hospital Name"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
              />

              <Field
                label="City *"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />

              <Field
                label="Area / Locality"
                name="area"
                value={formData.area}
                onChange={handleChange}
              />

              <Field
                label="Dr.Email ID"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

              <Field
                label="Mobile Number *"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />

              <Field
                label="Preferred Contact"
                custom={
                  <div className="radio">
                    <label>
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === "email"}
                        onChange={handleChange}
                      />
                      Mobile
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === "email"}
                        onChange={handleChange}
                      />
                      Email
                    </label>
                  </div>
                }
              />
            </div>

            <SectionTitle>B. Business Information</SectionTitle>

            {/* ✅ ALL THREE in one line - 3 column grid */}
            <div className="formGrid threeCol">
              <Field
                label="Brand *"
                select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                options={brandOptions}
                placeholder="Select Brand"
              />

              <Field
                label="Current Business (₹) *"
                name="currentBusiness"
                value={formData.currentBusiness}
                onChange={handleChange}
                type="number"
              />

              <Field
                label="Expected Business (₹) *"
                name="expectedBusiness"
                value={formData.expectedBusiness}
                onChange={handleChange}
                type="number"
              />
            </div>

            <SectionTitle>C. Other Activity Information</SectionTitle>

            <Field
              label="Other Activity Done"
              name="otherActivities"
              value={formData.otherActivities}
              onChange={handleChange}
              textarea
            />

            <div className="footerActions">
              <Button
                variant="outline"
                icon={FileText}
                onClick={handleSaveDraft}
              >
                Save as Draft
              </Button>

              <Button variant="ghost" icon={RotateCcw} onClick={handleClear}>
                Clear
              </Button>

              <Button icon={Send} onClick={handleSubmit}>
                Submit for Approval
              </Button>
            </div>
          </div>
          <div className="rightInfo">
            <InfoCard
              title="Your Hierarchy"
              lines={[
                "HQ / Location: Andheri HQ",
                "Area: Mumbai West",
                "Region: Mumbai",
                "Zone: West",
              ]}
            />
            <InfoCard
              title="Instructions"
              lines={[
                "Fields marked with * are mandatory.",
                "After submission, doctor details will be sent for approval.",
                "You will not be able to edit after submission.",
              ]}
            />
            <InfoCard
              title="Tips"
              lines={[
                "Ensure MCL code is correct.",
                "Use valid email ID to send consent.",
                "Provide complete activity details.",
              ]}
            />
          </div>
        </div>

        {/* Centered Popup Modal */}
        {popup.isOpen && (
          <div
            className="popup-overlay"
            onClick={closePopup}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              className="popup-container"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "32px",
                maxWidth: "450px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                animation: "scaleIn 0.3s ease",
                position: "relative",
              }}
            >
              <button
                onClick={closePopup}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#999",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                {popup.type === "success" ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#d1fae5",
                      color: "#065f46",
                    }}
                  >
                    <CheckCircle size={32} />
                  </div>
                ) : (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                    }}
                  >
                    <AlertCircle size={32} />
                  </div>
                )}
              </div>

              <h2
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: popup.type === "success" ? "#065f46" : "#991b1b",
                }}
              >
                {popup.title}
              </h2>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "24px",
                  lineHeight: "1.6",
                }}
              >
                {popup.message}
              </p>

              <button
                onClick={closePopup}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px",
                  backgroundColor:
                    popup.type === "success" ? "#10b981" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor =
                    popup.type === "success" ? "#059669" : "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor =
                    popup.type === "success" ? "#10b981" : "#ef4444";
                }}
              >
                Got it
              </button>
            </div>
          </div>
        )}

        <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* ✅ Add 3-column grid */
        .formGrid.threeCol {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        /* Responsive for mobile */
        @media (max-width: 768px) {
          .formGrid.threeCol {
            grid-template-columns: 1fr;
          }
        }

        /* Mobile responsiveness for AddDoctor */
@media (max-width: 768px) {
  /* Stack formLayout */
  .formLayout {
    grid-template-columns: 1fr !important;
    gap: 16px;
  }

  /* Stack the 3‑column business grid */
  .formGrid.threeCol {
    grid-template-columns: 1fr !important;
    gap: 12px;
  }

  /* Make radio buttons vertical */
  .radio {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  /* Wrap footer actions */
  .footerActions {
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  .footerActions .btn {
    flex: 1 1 100%;  /* full width buttons */
  }

  /* Adjust InfoCards – already stacked by the grid, but ensure padding */
  .rightInfo {
    display: grid;
    gap: 12px;
  }

  /* Tweak popup width on very small screens */
  .popup-container {
    max-width: 95% !important;
    padding: 24px !important;
  }
}
      
              .add-doctor-page { max-width: 1480px; margin: 0 auto; animation: addDoctorPageIn 0.45s ease-out both; }

        .add-doctor-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; color: #64748b; font-size: 12px; font-weight: 650; }

        .add-doctor-breadcrumb a { color: #000000; text-decoration: none; transition: color 0.2s ease, transform 0.2s ease; }

        .add-doctor-breadcrumb a:hover { color: #111827; }

        .add-doctor-breadcrumb > span:last-child { color: #334155; }

        .add-doctor-page > h1 { font-size: 26px; margin-bottom: 6px; }

        .add-doctor-page > .subtitle { font-size: 14px; margin-bottom: 18px; }

        .add-doctor-page .formLayout { grid-template-columns: minmax(0, 1fr) 280px; gap: 18px; }

        .add-doctor-page .formCard { border-radius: 13px; padding: 18px; }

        .add-doctor-page .sectionTitle { font-size: 15px; margin-bottom: 13px; }

        .add-doctor-page .formGrid { gap: 14px; }

        .add-doctor-page .field { gap: 6px; margin-bottom: 12px; }

        .add-doctor-page .field span:first-child { font-size: 12px; }

        .add-doctor-page .fakeInput { height: 40px; padding: 0 12px; font-size: 13px; }

        .add-doctor-page .fakeInput.area { height: 76px; padding-top: 11px; }

        .add-doctor-page .radio { padding-top: 7px; gap: 12px; font-size: 13px; }

        .add-doctor-page .footerActions { gap: 10px; margin-top: 14px; }

        .add-doctor-page .footerActions .btn { padding: 9px 14px; font-size: 13px; }

        .add-doctor-page .rightInfo { gap: 12px; }

        .add-doctor-page .infoCard { border-radius: 12px; padding: 15px; }

        .add-doctor-page .infoCard h3 { font-size: 15px; margin-bottom: 9px; }

        .add-doctor-page .infoCard p { font-size: 12px; margin: 8px 0; line-height: 1.45; }

        .add-doctor-page .popup-container { max-width: 420px !important; padding: 26px !important; }

        @keyframes addDoctorPageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1200px) { .add-doctor-page .formLayout { grid-template-columns: minmax(0, 1fr) 250px; } }

        @media (max-width: 768px) { .add-doctor-page .formLayout { grid-template-columns: 1fr !important; gap: 14px; } .add-doctor-page .formGrid.threeCol { grid-template-columns: 1fr !important; } }
      `}</style>
      </div>
    </Layout>
  );
}
