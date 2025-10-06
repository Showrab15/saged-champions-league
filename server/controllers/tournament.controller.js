// server/controllers/tournament.controller.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get all tournaments
exports.getAllTournaments = async (req, res) => {
  try {
    const db = getDB();
    const tournaments = await db
      .collection("tournaments")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: tournaments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active tournament
exports.getActiveTournament = async (req, res) => {
  try {
    const db = getDB();
    const tournament = await db
      .collection("tournaments")
      .findOne({ status: "active" });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "No active tournament found",
      });
    }

    res.json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tournament by ID
exports.getTournamentById = async (req, res) => {
  try {
    const db = getDB();
    const tournament = await db
      .collection("tournaments")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    res.json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new tournament
exports.createTournament = async (req, res) => {
  try {
    const db = getDB();
    const { name, format, playoffFormat, numGroups, qualifyPerGroup } =
      req.body;

    // Validation
    if (!name || !format || !playoffFormat) {
      return res.status(400).json({
        success: false,
        message: "Name, format, and playoff format are required",
      });
    }

    // Check if there's already an active tournament
    const activeTournament = await db
      .collection("tournaments")
      .findOne({ status: "active" });

    if (activeTournament) {
      return res.status(400).json({
        success: false,
        message:
          "An active tournament already exists. Please complete it first.",
      });
    }

    const newTournament = {
      name,
      format,
      playoffFormat,
      numGroups: numGroups || null,
      qualifyPerGroup: qualifyPerGroup || null,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("tournaments").insertOne(newTournament);

    res.status(201).json({
      success: true,
      message: "Tournament created successfully",
      data: { _id: result.insertedId, ...newTournament },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update tournament
exports.updateTournament = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    // Remove _id if present to avoid update errors
    delete updateData._id;

    const result = await db
      .collection("tournaments")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    res.json({
      success: true,
      message: "Tournament updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete tournament
exports.deleteTournament = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    // Delete associated teams, matches, and standings
    await db.collection("teams").deleteMany({ tournamentId: id });
    await db.collection("matches").deleteMany({ tournamentId: id });
    await db.collection("standings").deleteMany({ tournamentId: id });

    // Delete tournament
    const result = await db
      .collection("tournaments")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    res.json({
      success: true,
      message: "Tournament and all associated data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete tournament
exports.completeTournament = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection("tournaments").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    res.json({
      success: true,
      message: "Tournament marked as completed",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
