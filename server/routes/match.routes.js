const express = require("express");
const router = express.Router();
const matchController = require("../controllers/match.controller");

// Get all matches for a tournament
router.get("/tournament/:tournamentId", matchController.getMatchesByTournament);

// Get match by ID
router.get("/:id", matchController.getMatchById);

// Create new match
router.post("/", matchController.createMatch);

// Update match (scores, winner)
router.put("/:id", matchController.updateMatch);

// Delete match
router.delete("/:id", matchController.deleteMatch);

// Generate tournament schedule
router.post("/generate-schedule", matchController.generateSchedule);

module.exports = router;
