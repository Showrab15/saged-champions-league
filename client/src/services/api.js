import axios from "axios";

const API_URL = "https://cricket-league-backend.vercel.app"; // Change for production

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add user ID to requests
export const setUserId = (userId) => {
  if (userId) {
    api.defaults.headers.common["x-user-id"] = userId;
  } else {
    delete api.defaults.headers.common["x-user-id"];
  }
};

// Teams API
export const teamsAPI = {
  getAll: () => api.get("/teams"),
  create: (team) => api.post("/teams", team),
  delete: (id) => api.delete(`/teams/${id}`),
};

// Tournaments API
export const tournamentsAPI = {
  getAll: (params) => api.get("/tournaments", { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (tournament) => api.post("/tournaments", tournament),
  updateMatch: (tournamentId, matchId, data) =>
    api.put(`/tournaments/${tournamentId}/matches/${matchId}`, data),
  updateKnockoutTeams: (tournamentId, data) =>
    api.put(`/tournaments/${tournamentId}/knockout-teams`, data),
  delete: (id, adminCode) =>
    api.delete(`/tournaments/${id}`, { data: { adminCode } }),
  verifyAdmin: (id, adminCode) =>
    api.post(`/tournaments/${id}/verify-admin`, { adminCode }),
  updateStatus: (id, adminCode, status) =>
    api.patch(`/tournaments/${id}/status`, { adminCode, status }),
};

export default api;
