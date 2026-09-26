import axios from "axios";
import api from "./axios";

export const getDashboardData = async (mrId) => {
  const response = await api.get(`/doctors/dashboard/${mrId}`);
  return response.data;
};

export const getDoctors = async (mrId, type) => {
  const response = await api.get(`/doctors/${mrId}?status=${type}`);
  return response.data;
};

export const getDraftDoctors = async (mrId) => {
  const response = await api.get(`/doctors/${mrId}?status=draft`);
  return response.data;
};

export const getSubmittedDoctors = async (mrId) => {
  const response = await api.get(`/doctors/${mrId}?status=pending`);
  return response.data;
};

export const getApprovedDoctors = async (mrId) => {
  const response = await api.get(`/doctors/${mrId}?approvalStatus=approved`);
  return response.data;
};

export const getDoctorDetails = async (doctorId) => {
  const response = await api.get(`/doctors/${doctorId}/details`);
  return response.data;
};

export const uploadDoctorPhotos = async (doctorId, formData) => {
  const response = await api.post(`/doctors/${doctorId}/photos`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const sendConsent = async (doctorId) => {
  const response = await api.post(`/doctors/send-consent/${doctorId}`);
  return response.data;
};

// ✅ ADD THIS FUNCTION
export const deleteDoctor = async (doctorId) => {
  const response = await api.delete(`/doctors/${doctorId}`);
  return response.data;
};

export const getAllDoctors = async (mrId) => {
  const response = await api.get(`/doctors/${mrId}`);
  return response.data;
};

export const getFrozenDoctors = async (mrId) => {
  const response = await api.get(`/doctors/by-mr/${mrId}`);
  return response.data;
};

export const deleteDoctorPhoto = async (doctorId, photoId) => {
  const response = await axios.delete(`https://calendarme.digilateral.com/api/doctors/${doctorId}/photos/${photoId}`);
  return response.data;
};