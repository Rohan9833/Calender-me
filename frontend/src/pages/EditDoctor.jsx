// pages/EditDoctor.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Save, X, ArrowLeft } from "lucide-react";
import Layout from "../components/Layout";
import {
  Button,
  Field,
  SectionTitle,
  Crumbs,
} from "../components/UIComponents";
import { getDoctorDetails } from "../api/doctorAPI";

export default function EditDoctor() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: "",
    speciality: "",
    mclCode: "",
    clinicName: "",
    city: "",
    area: "",
    email: "",
    mobile: "",
    preferredContact: "mobile",
    currentBusiness: "",
    expectedBusiness: "",
    brandFocus: "",
    otherActivities: "",
  });

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await getDoctorDetails(doctorId);
      const doctor = response.doctor;
      setFormData({
        doctorName: doctor.doctorName || "",
        speciality: doctor.speciality || "",
        mclCode: doctor.mclCode || "",
        clinicName: doctor.clinicName || "",
        city: doctor.city || "",
        area: doctor.area || "",
        email: doctor.email || "",
        mobile: doctor.mobile || "",
        preferredContact: doctor.preferredContact || "mobile",
        currentBusiness: doctor.currentBusiness || "",
        expectedBusiness: doctor.expectedBusiness || "",
        brandFocus: doctor.brandFocus || "",
        otherActivities: doctor.otherActivities || "",
      });
    } catch (error) {
      console.error("Error fetching doctor:", error);
      alert("Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!window.confirm("Are you sure you want to update this doctor?")) {
      return;
    }
    
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      await axios.put(
        `https://calendarme.digilateral.com/api/doctors/${doctorId}`,
        {
          ...formData,
          mrId: user.mrId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      alert("Doctor details updated successfully!");
      navigate("/submitted-doctors");
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert(error.response?.data?.message || "Failed to update doctor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout active="My Doctors">
        <div>Loading doctor details...</div>
      </Layout>
    );
  }

  return (
    <Layout active="My Doctors">
      <Crumbs items={["My Doctors", "Submitted Doctors", "Edit Doctor"]} />
      
      <div className="pageHead">
        <div>
          <h1>Edit Doctor</h1>
          <p className="subtitle">
            Update doctor details and campaign information.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="formLayout">
          <div className="formCard">
            <SectionTitle>A. Doctor Information</SectionTitle>

            <div className="formGrid">
              <Field
                label="Doctor Name *"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                required
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
                required
              />

              <Field
                label="MCL Code / Doctor Code *"
                name="mclCode"
                value={formData.mclCode}
                onChange={handleChange}
                required
                disabled
                helperText="MCL Code cannot be changed"
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
                required
              />

              <Field
                label="Area / Locality"
                name="area"
                value={formData.area}
                onChange={handleChange}
              />

              <Field
                label="Email ID"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />

              <Field
                label="Mobile Number *"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
              />

              <Field
                label="Preferred Contact"
                custom={
                  <div className="radio">
                    <label>
                      <input
                        type="radio"
                        name="preferredContact"
                        value="mobile"
                        checked={formData.preferredContact === "mobile"}
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

            <div className="formGrid twoCol">
              <Field
                label="Current Business (₹) *"
                name="currentBusiness"
                type="number"
                value={formData.currentBusiness}
                onChange={handleChange}
                required
              />

              <Field
                label="Expected Business (₹) *"
                name="expectedBusiness"
                type="number"
                value={formData.expectedBusiness}
                onChange={handleChange}
                required
              />
            </div>

            <Field
              label="Therapy / Brand Focus"
              name="brandFocus"
              value={formData.brandFocus}
              onChange={handleChange}
            />

            <SectionTitle>C. Other Activity Information</SectionTitle>

            <Field
              label="Other Activity Done"
              name="otherActivities"
              value={formData.otherActivities}
              onChange={handleChange}
              textarea
            />

            <div className="footerActions">
              <Button variant="ghost" icon={X} onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" icon={Save} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
          
          <div className="rightInfo">
            <div className="infoCard">
              <h3>Important Note</h3>
              <ul>
                <li>MCL Code cannot be changed once created</li>
                <li>Changes will be submitted for approval again</li>
                <li>Doctor will need to give consent again if email changes</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
}