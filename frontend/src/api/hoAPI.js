import api from "./axios";

export const getHODashboard = async () => (await api.get("/ho/dashboard")).data;
export const getHODoctors = async (params = {}) => (await api.get("/ho/doctors", { params })).data;
export const getHOHierarchy = async () => (await api.get("/ho/hierarchy")).data;
export const getHOActivity = async () => (await api.get("/ho/activity")).data;
