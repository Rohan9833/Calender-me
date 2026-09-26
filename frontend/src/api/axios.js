import axios from "axios";

const api = axios.create({
  baseURL: "https://calendarme.digilateral.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;