const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournament.controller");

console.log("🔷 Tournament routes loaded");

// Get all tournaments
router.get("/", tournamentController.getAllTournaments);

// Get active tournament - THIS MUST BE BEFORE /:id
router.get("/active", tournamentController.getActiveTournament);

// Get tournament by ID
router.get("/:id", tournamentController.getTournamentById);

// Create new tournament (admin only)
router.post("/", tournamentController.createTournament);

// Update tournament
router.put("/:id", tournamentController.updateTournament);

// Delete tournament
router.delete("/:id", tournamentController.deleteTournament);

// Complete tournament
router.patch("/:id/complete", tournamentController.completeTournament);

module.exports = router;
