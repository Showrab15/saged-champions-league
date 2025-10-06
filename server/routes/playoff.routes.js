// server/routes/playoff.routes.js
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const router = express.Router();

router.post("/generate-playoff", async (req, res) => {
  try {
    const db = getDB();
    const { tournamentId } = req.body;

    const tournament = await db
      .collection("tournaments")
      .findOne({ _id: new ObjectId(tournamentId) });
    if (!tournament) {
      return res
        .status(404)
        .json({ success: false, message: "Tournament not found" });
    }

    // Check if playoffs already exist
    const existingPlayoffs = await db
      .collection("matches")
      .findOne({ tournamentId, round: { $in: ["semifinal", "final"] } });

    if (existingPlayoffs) {
      return res.status(400).json({
        success: false,
        message: "Playoff matches already exist for this tournament",
      });
    }

    // Check if standings exist
    const standings = await db
      .collection("standings")
      .find({ tournamentId })
      .sort({ group: 1, points: -1, nrr: -1 })
      .toArray();

    if (!standings.length) {
      return res.status(400).json({
        success: false,
        message: "No standings found. Complete group stage first.",
      });
    }

    // Group standings by group name
    const groups = {};
    standings.forEach((team) => {
      if (!groups[team.group]) groups[team.group] = [];
      groups[team.group].push(team);
    });

    const semiFinals = [];
    const groupKeys = Object.keys(groups);

    // Get the highest match number to continue numbering
    const lastMatch = await db
      .collection("matches")
      .find({ tournamentId })
      .sort({ matchNumber: -1 })
      .limit(1)
      .toArray();

    let matchNumber = lastMatch.length > 0 ? lastMatch[0].matchNumber + 1 : 1;

    // Basic format: 1st A vs 2nd B, 1st B vs 2nd A
    if (groupKeys.length >= 2) {
      semiFinals.push({
        tournamentId,
        round: "semifinal", // Changed to lowercase
        matchNumber: matchNumber++,
        team1Id: groups[groupKeys[0]][0].teamId,
        team1Name: groups[groupKeys[0]][0].teamName,
        team2Id: groups[groupKeys[1]][1].teamId,
        team2Name: groups[groupKeys[1]][1].teamName,
        status: "pending",
        winner: null,
        team1Score: null,
        team2Score: null,
        createdAt: new Date(),
      });

      semiFinals.push({
        tournamentId,
        round: "semifinal", // Changed to lowercase
        matchNumber: matchNumber++,
        team1Id: groups[groupKeys[1]][0].teamId,
        team1Name: groups[groupKeys[1]][0].teamName,
        team2Id: groups[groupKeys[0]][1].teamId,
        team2Name: groups[groupKeys[0]][1].teamName,
        status: "pending",
        winner: null,
        team1Score: null,
        team2Score: null,
        createdAt: new Date(),
      });
    }

    // Insert semi-final matches
    if (semiFinals.length) {
      await db.collection("matches").insertMany(semiFinals);
    }

    res.json({
      success: true,
      message: "Playoff matches generated successfully",
      data: semiFinals,
    });
  } catch (error) {
    console.error("Error generating playoffs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
