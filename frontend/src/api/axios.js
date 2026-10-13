import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach the current UI identity so the API can apply role checks.
// This is not a substitute for signed-token authentication; it complements the
// frontend route guard until the app migrates to a server-issued token.
api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.role) config.headers["x-user-role"] = String(user.role).toLowerCase();
    const id = user?.HOId || user?.userId || user?.mrId || user?.flmId || user?.slmId || user?.tlmId;
    if (id) config.headers["x-user-id"] = String(id);
  } catch {}
  return config;
});

export default api;
