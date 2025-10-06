// server/routes/admin.routes.js
const express = require("express");
const router = express.Router();

// Get dashboard statistics
router.get("/dashboard-stats/:tournamentId", async (req, res) => {
  try {
    const { getDB } = require("../config/db");
    const db = getDB();
    const { tournamentId } = req.params;

    // Get total teams
    const totalTeams = await db
      .collection("teams")
      .countDocuments({ tournamentId });

    // Get total matches
    const totalMatches = await db
      .collection("matches")
      .countDocuments({ tournamentId });

    // Get completed matches
    const completedMatches = await db
      .collection("matches")
      .countDocuments({ tournamentId, status: "completed" });

    // Get top team by points
    const topTeams = await db
      .collection("standings")
      .find({ tournamentId })
      .sort({ points: -1, nrr: -1 })
      .limit(1)
      .toArray();

    res.json({
      success: true,
      data: {
        totalTeams,
        totalMatches,
        completedMatches,
        pendingMatches: totalMatches - completedMatches,
        topTeam: topTeams[0] || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// ============================================

// ============================================
