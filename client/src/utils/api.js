// // client/src/utils/api.js
// import axios from "axios";
// import { auth } from "../firebase/config";

// const API_URL = "http://localhost:5000/api";

// // Create axios instance
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Add auth token to requests
// api.interceptors.request.use(
//   async (config) => {
//     const user = auth.currentUser;
//     if (user) {
//       const token = await user.getIdToken();
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Tournament API
// export const tournamentAPI = {
//   getAll: () => api.get("/tournaments"),
//   getActive: () => api.get("/tournaments/active"),
//   getById: (id) => api.get(`/tournaments/${id}`),
//   create: (data) => api.post("/tournaments", data),
//   update: (id, data) => api.put(`/tournaments/${id}`, data),
//   delete: (id) => api.delete(`/tournaments/${id}`),
//   complete: (id) => api.patch(`/tournaments/${id}/complete`),

// };

// // Team API
// export const teamAPI = {
//   getByTournament: (tournamentId) =>
//     api.get(`/teams/tournament/${tournamentId}`),
//   getById: (id) => api.get(`/teams/${id}`),
//   create: (data) => api.post("/teams", data),
//   update: (id, data) => api.put(`/teams/${id}`, data),
//   delete: (id) => api.delete(`/teams/${id}`),
//   getStandings: (tournamentId, group = null) => {
//     const url = `/teams/tournament/${tournamentId}/standings`;
//     return api.get(url, { params: { group } });
//   },
// };

// // Match API
// export const matchAPI = {
//   getByTournament: (tournamentId, filters = {}) => {
//     return api.get(`/matches/tournament/${tournamentId}`, { params: filters });
//   },
//   getById: (id) => api.get(`/matches/${id}`),
//   create: (data) => api.post("/matches", data),
//   update: (id, data) => api.put(`/matches/${id}`, data),
//   delete: (id) => api.delete(`/matches/${id}`),
//   generateSchedule: (tournamentId) =>
//     api.post("/matches/generate-schedule", { tournamentId }),
// };

// // Admin API
// export const adminAPI = {
//   getDashboardStats: (tournamentId) =>
//     api.get(`/admin/dashboard-stats/${tournamentId}`),
// };

// export default api;
// client/src/utils/api.js
import axios from "axios";
import { auth } from "../firebase/config";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Tournament API
export const tournamentAPI = {
  getAll: () => api.get("/tournaments"),
  getActive: () => api.get("/tournaments/active"),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post("/tournaments", data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  complete: (id) => api.patch(`/tournaments/${id}/complete`),
};

// ✅ Team API
export const teamAPI = {
  getByTournament: (tournamentId) =>
    api.get(`/teams/tournament/${tournamentId}`),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post("/teams", data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  getStandings: (tournamentId, group = null) => {
    const url = `/teams/tournament/${tournamentId}/standings`;
    return api.get(url, { params: { group } });
  },
};

// ✅ Match API
export const matchAPI = {
  getByTournament: (tournamentId, filters = {}) => {
    return api.get(`/matches/tournament/${tournamentId}`, { params: filters });
  },
  getById: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post("/matches", data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  delete: (id) => api.delete(`/matches/${id}`),
  generateSchedule: (tournamentId) =>
    api.post("/matches/generate-schedule", { tournamentId }),
  generatePlayoffs: (tournamentId) =>
    api.post("/matches/generate-playoff", { tournamentId }),
};

// ✅ Admin API
export const adminAPI = {
  getDashboardStats: (tournamentId) =>
    api.get(`/admin/dashboard-stats/${tournamentId}`),
};

// ✅ Default export (optional, for generic use)
export default api;
