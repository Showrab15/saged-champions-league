// services/api.js
import axios from "axios";

const API_URL = "http://localhost:5000"; // Change for production

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

// Add these to your existing services/api.js file

// Players API
export const playersAPI = {
  // Get all players with optional filters
  getAll: (params) => api.get("/players", { params }),
  
  // Get single player by ID
  getById: (id) => api.get(`/players/${id}`),
  
  // Create new player (admin only)
  create: (playerData) => api.post("/players", playerData),
  
  // Update player (admin only)
  update: (id, playerData) => api.put(`/players/${id}`, playerData),
  
  // Delete player (admin only)
  delete: (id) => api.delete(`/players/${id}`),
  
  // Get player statistics summary
  getStatsSummary: () => api.get("/players/stats/summary"),
  
  // Get top performers by category
  getTopPerformers: (category, limit = 10) => 
    api.get("/players/stats/top-performers", { 
      params: { category, limit } 
    }),
  
  // Get players by team
  getByTeam: (teamId) => api.get(`/players/team/${teamId}`)
};

// Usage Example:
/*
import { playersAPI, setUserId } from './services/api';

// Set user ID after login
setUserId(currentUser.uid);

// Get all players
const players = await playersAPI.getAll();

// Get players with filters
const filteredPlayers = await playersAPI.getAll({
  search: 'virat',
  teamId: 'team123',
  role: 'Batsman'
});

// Create player
const newPlayer = await playersAPI.create({
  name: 'Virat Kohli',
  teamName: 'India',
  teamId: 'team123',
  role: 'Batsman',
  matchesPlayed: 100,
  wins: 70,
  losses: 25,
  ties: 5,
  runsScored: 12000,
  battingAverage: 59.5,
  battingStrikeRate: 93.2,
  fours: 1200,
  sixes: 100,
  ducks: 5,
  bowlingAverage: 0,
  bowlingStrikeRate: 0,
  maidens: 0,
  wickets: 0
});

// Update player
await playersAPI.update('player123', updatedData);

// Delete player
await playersAPI.delete('player123');

// Get stats summary
const summary = await playersAPI.getStatsSummary();

// Get top run scorers
const topScorers = await playersAPI.getTopPerformers('runs', 5);

// Get players by team
const teamPlayers = await playersAPI.getByTeam('team123');
*/
export default api;
