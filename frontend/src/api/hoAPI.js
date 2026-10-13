import api from "./axios";

export const getHODashboard = async () => (await api.get("/ho/dashboard")).data;
export const getHODoctors = async (params = {}) => (await api.get("/ho/doctors", { params })).data;
export const getHOHierarchy = async () => (await api.get("/ho/hierarchy")).data;
export const getHOActivity = async () => (await api.get("/ho/activity")).data;

const hoHeaders = () => ({ headers: { "x-user-role": "ho" } });
export const createHOUser = async (payload) => (await api.post("/ho/users", payload, hoHeaders())).data;
export const deleteHOUser = async (role, userId) => (await api.delete(`/ho/users/${role}/${encodeURIComponent(userId)}`, hoHeaders())).data;
export const getHODeletedUsers = async () => (await api.get("/ho/deleted-users", hoHeaders())).data;
export const restoreHOUser = async (deletedId) => (await api.post(`/ho/deleted-users/${deletedId}/restore`, {}, hoHeaders())).data;
