// server/controllers/match.controller.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { updateStandingsAfterMatch } = require("../utils/nrrCalculator");

// Get all matches for a tournament
exports.getMatchesByTournament = async (req, res) => {
  try {
    const db = getDB();
    const { tournamentId } = req.params;
    const { round, group } = req.query;

    const query = { tournamentId };
    if (round) query.round = round;
    if (group) query.group = group;

    console.log("Fetching matches with query:", query);

    const matches = await db
      .collection("matches")
      .find(query)
      .sort({ matchNumber: 1 })
      .toArray();

    console.log(
      `Found ${matches.length} matches for tournament ${tournamentId}`
    );

    res.json({ success: true, data: matches });
  } catch (error) {
    console.error("Error in getMatchesByTournament:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get match by ID
exports.getMatchById = async (req, res) => {
  try {
    const db = getDB();
    const match = await db
      .collection("matches")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.json({ success: true, data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new match
exports.createMatch = async (req, res) => {
  try {
    const db = getDB();
    const { tournamentId, team1Id, team2Id, matchNumber, group, round } =
      req.body;

    if (!tournamentId || !team1Id || !team2Id) {
      return res.status(400).json({
        success: false,
        message: "Tournament ID and both team IDs are required",
      });
    }

    if (team1Id === team2Id) {
      return res.status(400).json({
        success: false,
        message: "A team cannot play against itself",
      });
    }

    // Get team names
    const team1 = await db
      .collection("teams")
      .findOne({ _id: new ObjectId(team1Id) });
    const team2 = await db
      .collection("teams")
      .findOne({ _id: new ObjectId(team2Id) });

    if (!team1 || !team2) {
      return res.status(404).json({
        success: false,
        message: "One or both teams not found",
      });
    }

    const newMatch = {
      tournamentId,
      matchNumber: matchNumber || 1,
      team1Id,
      team2Id,
      team1Name: team1.name,
      team2Name: team2.name,
      team1Score: { runs: 0, wickets: 0, overs: 0 },
      team2Score: { runs: 0, wickets: 0, overs: 0 },
      winner: null,
      group: group || null,
      round: round || "league",
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("matches").insertOne(newMatch);

    res.status(201).json({
      success: true,
      message: "Match created successfully",
      data: { _id: result.insertedId, ...newMatch },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update match (scores and winner)
exports.updateMatch = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { team1Score, team2Score, winner, status } = req.body;

    // Get existing match
    const existingMatch = await db
      .collection("matches")
      .findOne({ _id: new ObjectId(id) });

    if (!existingMatch) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Prepare update data
    const updateData = {};
    if (team1Score) updateData.team1Score = team1Score;
    if (team2Score) updateData.team2Score = team2Score;
    if (winner) updateData.winner = winner;
    if (status) updateData.status = status;

    // If match is being completed, update standings
    if (
      status === "completed" &&
      winner &&
      existingMatch.status !== "completed"
    ) {
      updateData.playedAt = new Date();

      // Update standings for both teams
      await updateTeamStandings(
        db,
        existingMatch.tournamentId,
        existingMatch.team1Id,
        existingMatch.team2Id,
        team1Score || existingMatch.team1Score,
        team2Score || existingMatch.team2Score,
        winner
      );
    }

    // Update match
    await db
      .collection("matches")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    res.json({
      success: true,
      message: "Match updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to update team standings
async function updateTeamStandings(
  db,
  tournamentId,
  team1Id,
  team2Id,
  team1Score,
  team2Score,
  winner
) {
  // Get current standings
  const team1Standing = await db
    .collection("standings")
    .findOne({ tournamentId, teamId: team1Id });

  const team2Standing = await db
    .collection("standings")
    .findOne({ tournamentId, teamId: team2Id });

  if (!team1Standing || !team2Standing) {
    throw new Error("Team standings not found");
  }

  // Prepare match data for NRR calculation
  const matchData = {
    team1Score,
    team2Score,
    winner,
  };

  // Update team 1 standing
  const updatedTeam1Standing = updateStandingsAfterMatch(
    { ...team1Standing, teamId: team1Id },
    matchData,
    true
  );

  // Update team 2 standing
  const updatedTeam2Standing = updateStandingsAfterMatch(
    { ...team2Standing, teamId: team2Id },
    matchData,
    false
  );

  // Save updated standings
  await db
    .collection("standings")
    .updateOne(
      { tournamentId, teamId: team1Id },
      { $set: updatedTeam1Standing }
    );

  await db
    .collection("standings")
    .updateOne(
      { tournamentId, teamId: team2Id },
      { $set: updatedTeam2Standing }
    );
}

// Delete match
exports.deleteMatch = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    // Get match details before deletion
    const match = await db
      .collection("matches")
      .findOne({ _id: new ObjectId(id) });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // If match was completed, we need to reverse the standings update
    if (match.status === "completed" && match.winner) {
      await reverseStandingsUpdate(db, match);
    }

    // Delete match
    await db.collection("matches").deleteOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to reverse standings update
async function reverseStandingsUpdate(db, match) {
  const { tournamentId, team1Id, team2Id, team1Score, team2Score, winner } =
    match;

  // Get current standings
  const team1Standing = await db
    .collection("standings")
    .findOne({ tournamentId, teamId: team1Id });

  const team2Standing = await db
    .collection("standings")
    .findOne({ tournamentId, teamId: team2Id });

  if (!team1Standing || !team2Standing) return;

  // Reverse team 1 stats
  team1Standing.played -= 1;
  if (winner === team1Id) {
    team1Standing.won -= 1;
    team1Standing.points -= 2;
  } else if (winner === null) {
    team1Standing.tied -= 1;
    team1Standing.points -= 1;
  } else {
    team1Standing.lost -= 1;
  }
  team1Standing.runsScored -= team1Score.runs;
  team1Standing.oversPlayed -= team1Score.overs;
  team1Standing.runsConceded -= team2Score.runs;
  team1Standing.oversBowled -= team2Score.overs;

  // Reverse team 2 stats
  team2Standing.played -= 1;
  if (winner === team2Id) {
    team2Standing.won -= 1;
    team2Standing.points -= 2;
  } else if (winner === null) {
    team2Standing.tied -= 1;
    team2Standing.points -= 1;
  } else {
    team2Standing.lost -= 1;
  }
  team2Standing.runsScored -= team2Score.runs;
  team2Standing.oversPlayed -= team2Score.overs;
  team2Standing.runsConceded -= team1Score.runs;
  team2Standing.oversBowled -= team1Score.overs;

  // Recalculate NRR
  const { calculateNRR } = require("../utils/nrrCalculator");
  team1Standing.nrr = calculateNRR(team1Standing);
  team2Standing.nrr = calculateNRR(team2Standing);

  // Update database
  await db
    .collection("standings")
    .updateOne({ tournamentId, teamId: team1Id }, { $set: team1Standing });

  await db
    .collection("standings")
    .updateOne({ tournamentId, teamId: team2Id }, { $set: team2Standing });
}

// Generate tournament schedule
exports.generateSchedule = async (req, res) => {
  try {
    const db = getDB();
    const { tournamentId } = req.body;

    // Get tournament details
    const tournament = await db
      .collection("tournaments")
      .findOne({ _id: new ObjectId(tournamentId) });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    console.log("Tournament format:", tournament.format);

    // Get all teams
    const teams = await db.collection("teams").find({ tournamentId }).toArray();

    console.log("Teams found:", teams.length);
    console.log(
      "Team details:",
      teams.map((t) => ({ name: t.name, group: t.group }))
    );

    if (teams.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 teams are required",
      });
    }

    // Delete existing matches
    await db.collection("matches").deleteMany({ tournamentId });

    let matches = [];
    let matchNumber = 1;

    // Generate matches based on format
    if (tournament.format === "round-robin") {
      console.log("Generating round-robin matches...");

      // Round robin: every team plays every other team
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matches.push({
            tournamentId,
            matchNumber: matchNumber++,
            team1Id: teams[i]._id.toString(),
            team2Id: teams[j]._id.toString(),
            team1Name: teams[i].name,
            team2Name: teams[j].name,
            team1Score: { runs: 0, wickets: 0, overs: 0 },
            team2Score: { runs: 0, wickets: 0, overs: 0 },
            winner: null,
            group: null,
            round: "league",
            status: "pending",
            createdAt: new Date(),
          });
        }
      }
    } else if (
      tournament.format === "groups" ||
      tournament.format === "groups-super4"
    ) {
      console.log("Generating group stage matches...");

      // Group stage matches
      const groups = {};
      teams.forEach((team) => {
        if (!groups[team.group]) {
          groups[team.group] = [];
        }
        groups[team.group].push(team);
      });

      console.log("Groups:", Object.keys(groups));
      console.log(
        "Teams per group:",
        Object.keys(groups).map((g) => ({ group: g, count: groups[g].length }))
      );

      // Generate matches within each group
      Object.keys(groups).forEach((groupName) => {
        const groupTeams = groups[groupName];
        for (let i = 0; i < groupTeams.length; i++) {
          for (let j = i + 1; j < groupTeams.length; j++) {
            matches.push({
              tournamentId,
              matchNumber: matchNumber++,
              team1Id: groupTeams[i]._id.toString(),
              team2Id: groupTeams[j]._id.toString(),
              team1Name: groupTeams[i].name,
              team2Name: groupTeams[j].name,
              team1Score: { runs: 0, wickets: 0, overs: 0 },
              team2Score: { runs: 0, wickets: 0, overs: 0 },
              winner: null,
              group: groupName,
              round: "league",
              status: "pending",
              createdAt: new Date(),
            });
          }
        }
      });
    }

    console.log(`Total matches to insert: ${matches.length}`);

    // Insert all matches
    if (matches.length > 0) {
      await db.collection("matches").insertMany(matches);
    }

    res.json({
      success: true,
      message: `Successfully generated ${matches.length} matches`,
      data: { matchCount: matches.length },
    });
  } catch (error) {
    console.error("Error in generateSchedule:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
