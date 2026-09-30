// api/managerAPI.js
import api from "./axios";

// =====================================
// FLM APIs
// =====================================

export const getFLMDashboard = async (flmId) => {
  const response = await api.get(`/manager/flm/${flmId}/dashboard`);
  return response.data;
};

// Get only the MRs assigned to the logged-in FLM.
export const getFLMMRs = async (flmId) => {
  const response = await api.get(`/manager/flm/${flmId}/mrs`);
  return response.data;
};

// api/managerAPI.js - Add this function
export const getAllDoctors = async (flmId) => {
  const response = await api.get(`/manager/flm/${flmId}/doctors`);
  return response.data;
};

export const getPendingApprovals = async (flmId) => {
  const response = await api.get(`/manager/flm/${flmId}/pending-approvals`);
  return response.data;
};

export const getFLMDoctors = async (flmId) => {
  const response = await api.get(`/manager/flm/${flmId}/doctors`);
  return response.data;
};

// =====================================
// SLM APIs
// =====================================

export const getSLMDashboard = async (slmId) => {
  const response = await api.get(`/manager/slm/${slmId}/dashboard`);
  return response.data;
};

export const getSLMDoctors = async (slmId) => {
  const response = await api.get(`/manager/slm/${slmId}/doctors`);
  return response.data;
};

// =====================================
// TLM APIs
// =====================================

export const getTLMDashboard = async (tlmId) => {
  const response = await api.get(`/manager/tlm/${tlmId}/dashboard`);
  return response.data;
};

export const getTLMDoctors = async (tlmId) => {
  const response = await api.get(`/manager/tlm/${tlmId}/doctors`);
  return response.data;
};

// =====================================
// Pending Actions Count API
// =====================================

export const getPendingActionsCount = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await api.get("/manager/pending-actions-count", {
      headers: {
        'x-user-role': user.role,
        'x-user-id': user.flmId || user.slmId || user.tlmId
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pending actions count:", error);
    return { success: false, count: 0 };
  }
};

// =====================================
// Common APIs
// =====================================

export const updateDoctorStatus = async (doctorId, approvalStatus, approvedBy, approvedByRole) => {
  const response = await api.patch(`/manager/doctors/${doctorId}/status`, {
    approvalStatus,
    approvedBy,
    approvedByRole,
  });
  return response.data;
};
export const getMRPendingActions = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.role !== "mr" || !user.mrId) {
      return { success: true, actions: [] };
    }

    const response = await api.get(`/doctors/mr/${user.mrId}/pending-actions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching MR pending actions:", error);
    return { success: false, actions: [] };
  }
};

export const getPendingActions = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const userId =
      user.role === "flm"
        ? user.flmId
        : user.role === "slm"
          ? user.slmId
          : user.role === "tlm"
            ? user.tlmId
            : user.role === "ho"
              ? user.hoId
              : null;

    const response = await api.get("/manager/pending-actions", {
      headers: {
        "x-user-role": user.role,
        "x-user-id": userId,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching pending actions:", error);
    return { success: false, actions: [] };
  }
};
