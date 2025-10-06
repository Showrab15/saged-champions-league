// // server/routes/team.routes.js
// const express = require("express");
// const router = express.Router();
// const teamController = require("../controllers/team.controller");

// // Get all teams for a tournament
// router.get("/tournament/:tournamentId", teamController.getTeamsByTournament);

// // Get team by ID
// router.get("/:id", teamController.getTeamById);

// // Create new team
// router.post("/", teamController.createTeam);

// // Update team
// router.put("/:id", teamController.updateTeam);

// // Delete team
// router.delete("/:id", teamController.deleteTeam);

// // Get standings for tournament
// router.get("/tournament/:tournamentId/standings", teamController.getStandings);

// module.exports = router;
// server/routes/team.routes.js
const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team.controller");

// Get all teams for a tournament
router.get("/tournament/:tournamentId", teamController.getTeamsByTournament);

// Get team by ID
router.get("/:id", teamController.getTeamById);

// Create new team
router.post("/", teamController.createTeam);

// Update team
router.put("/:id", teamController.updateTeam);

// Delete team
router.delete("/:id", teamController.deleteTeam);

// ✅ Get standings for tournament (fixed)
router.get("/tournament/:tournamentId/standings", teamController.getStandings);

module.exports = router;
