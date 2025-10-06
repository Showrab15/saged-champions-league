// // server/controllers/team.controller.js
// const { ObjectId } = require("mongodb");
// const { getDB } = require("../config/db");

// // Get all teams for a tournament
// exports.getTeamsByTournament = async (req, res) => {
//   try {
//     const db = getDB();
//     const { tournamentId } = req.params;

//     const teams = await db.collection("teams").find({ tournamentId }).toArray();

//     res.json({ success: true, data: teams });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get team by ID
// exports.getTeamById = async (req, res) => {
//   try {
//     const db = getDB();
//     const team = await db
//       .collection("teams")
//       .findOne({ _id: new ObjectId(req.params.id) });

//     if (!team) {
//       return res.status(404).json({
//         success: false,
//         message: "Team not found",
//       });
//     }

//     res.json({ success: true, data: team });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Create new team
// exports.createTeam = async (req, res) => {
//   try {
//     const db = getDB();
//     const { tournamentId, name, group } = req.body;

//     if (!tournamentId || !name) {
//       return res.status(400).json({
//         success: false,
//         message: "Tournament ID and team name are required",
//       });
//     }

//     // Check if team already exists in this tournament
//     const existingTeam = await db
//       .collection("teams")
//       .findOne({ tournamentId, name });

//     if (existingTeam) {
//       return res.status(400).json({
//         success: false,
//         message: "Team already exists in this tournament",
//       });
//     }

//     const newTeam = {
//       tournamentId,
//       name,
//       group: group || null,
//       createdAt: new Date(),
//     };

//     const result = await db.collection("teams").insertOne(newTeam);

//     // Create initial standing for this team
//     const standing = {
//       tournamentId,
//       teamId: result.insertedId.toString(),
//       teamName: name,
//       group: group || null,
//       played: 0,
//       won: 0,
//       lost: 0,
//       tied: 0,
//       noResult: 0,
//       points: 0,
//       nrr: 0,
//       runsScored: 0,
//       oversPlayed: 0,
//       runsConceded: 0,
//       oversBowled: 0,
//     };

//     await db.collection("standings").insertOne(standing);

//     res.status(201).json({
//       success: true,
//       message: "Team created successfully",
//       data: { _id: result.insertedId, ...newTeam },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update team
// exports.updateTeam = async (req, res) => {
//   try {
//     const db = getDB();
//     const { id } = req.params;
//     const updateData = req.body;

//     delete updateData._id;
//     delete updateData.tournamentId; // Prevent changing tournament

//     const result = await db
//       .collection("teams")
//       .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

//     if (result.matchedCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Team not found",
//       });
//     }

//     // Update team name in standings if changed
//     if (updateData.name) {
//       await db
//         .collection("standings")
//         .updateOne({ teamId: id }, { $set: { teamName: updateData.name } });
//     }

//     res.json({
//       success: true,
//       message: "Team updated successfully",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Delete team
// exports.deleteTeam = async (req, res) => {
//   try {
//     const db = getDB();
//     const { id } = req.params;

//     // Check if team is in any matches
//     const matchesWithTeam = await db.collection("matches").findOne({
//       $or: [{ team1Id: id }, { team2Id: id }],
//     });

//     if (matchesWithTeam) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot delete team that has matches. Delete matches first.",
//       });
//     }

//     // Delete team and standings
//     await db.collection("standings").deleteOne({ teamId: id });
//     const result = await db
//       .collection("teams")
//       .deleteOne({ _id: new ObjectId(id) });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Team not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Team deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// //
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get all teams for a tournament
exports.getTeamsByTournament = async (req, res) => {
  try {
    const db = getDB();
    const { tournamentId } = req.params;
    const teams = await db.collection("teams").find({ tournamentId }).toArray();
    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get team by ID
exports.getTeamById = async (req, res) => {
  try {
    const db = getDB();
    const team = await db
      .collection("teams")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new team
exports.createTeam = async (req, res) => {
  try {
    const db = getDB();
    const { tournamentId, name, group } = req.body;

    if (!tournamentId || !name) {
      return res.status(400).json({
        success: false,
        message: "Tournament ID and team name are required",
      });
    }

    const existingTeam = await db
      .collection("teams")
      .findOne({ tournamentId, name });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: "Team already exists in this tournament",
      });
    }

    const newTeam = {
      tournamentId,
      name,
      group: group || null,
      createdAt: new Date(),
    };

    const result = await db.collection("teams").insertOne(newTeam);

    // Create initial standing for this team
    const standing = {
      tournamentId,
      teamId: result.insertedId.toString(),
      teamName: name,
      group: group || null,
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      noResult: 0,
      points: 0,
      nrr: 0,
      runsScored: 0,
      oversPlayed: 0,
      runsConceded: 0,
      oversBowled: 0,
    };

    await db.collection("standings").insertOne(standing);

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: { _id: result.insertedId, ...newTeam },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;

    delete updateData._id;
    delete updateData.tournamentId;

    const result = await db
      .collection("teams")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (updateData.name) {
      await db
        .collection("standings")
        .updateOne({ teamId: id }, { $set: { teamName: updateData.name } });
    }

    res.json({
      success: true,
      message: "Team updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const matchesWithTeam = await db.collection("matches").findOne({
      $or: [{ team1Id: id }, { team2Id: id }],
    });

    if (matchesWithTeam) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete team that has matches. Delete matches first.",
      });
    }

    await db.collection("standings").deleteOne({ teamId: id });
    const result = await db
      .collection("teams")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Added function: Get standings for a tournament
exports.getStandings = async (req, res) => {
  try {
    const db = getDB();
    const { tournamentId } = req.params;

    const standings = await db
      .collection("standings")
      .find({ tournamentId })
      .sort({ points: -1, nrr: -1 }) // sort by points, then NRR
      .toArray();

    res.json({ success: true, data: standings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
