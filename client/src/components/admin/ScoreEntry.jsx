/* eslint-disable no-unused-vars */
// client/src/components/admin/ScoreEntry.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { matchAPI } from "../../utils/api";

const ScoreEntry = ({ match, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    team1Score: {
      runs: match.team1Score?.runs || 0,
      wickets: match.team1Score?.wickets || 0,
      overs: match.team1Score?.overs || 0,
    },
    team2Score: {
      runs: match.team2Score?.runs || 0,
      wickets: match.team2Score?.wickets || 0,
      overs: match.team2Score?.overs || 0,
    },
    winner: match.winner || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.winner) {
      setError("Please select a winner");
      setLoading(false);
      return;
    }

    // Validate overs (max 2 decimal places for balls)
    const validateOvers = (overs) => {
      const oversStr = overs.toString();
      if (oversStr.includes(".")) {
        const balls = parseInt(oversStr.split(".")[1]);
        if (balls > 5) {
          return false;
        }
      }
      return true;
    };

    if (
      !validateOvers(formData.team1Score.overs) ||
      !validateOvers(formData.team2Score.overs)
    ) {
      setError(
        "Invalid overs format. Balls should be 0-5 (e.g., 20.3 for 20 overs 3 balls)"
      );
      setLoading(false);
      return;
    }

    try {
      await matchAPI.update(match._id, {
        team1Score: formData.team1Score,
        team2Score: formData.team2Score,
        winner: formData.winner,
        status: "completed",
      });
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating match");
      setLoading(false);
    }
  };

  const handleScoreChange = (team, field, value) => {
    setFormData({
      ...formData,
      [`${team}Score`]: {
        ...formData[`${team}Score`],
        [field]: parseFloat(value) || 0,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-secondary rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">
            Enter Match Score - Match {match.matchNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-600/20 border border-red-600 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team 1 Score */}
          <div className="bg-dark rounded-lg p-4">
            <h3 className="text-xl font-bold text-primary mb-4">
              {match.team1Name}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Runs</label>
                <input
                  type="number"
                  min="0"
                  value={formData.team1Score.runs}
                  onChange={(e) =>
                    handleScoreChange("team1", "runs", e.target.value)
                  }
                  className="w-full bg-secondary border border-primary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">
                  Wickets
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.team1Score.wickets}
                  onChange={(e) =>
                    handleScoreChange("team1", "wickets", e.target.value)
                  }
                  className="w-full bg-secondary border border-primary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">
                  Overs
                  <span className="text-xs block text-gray-500">
                    (e.g., 20.3)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.team1Score.overs}
                  onChange={(e) =>
                    handleScoreChange("team1", "overs", e.target.value)
                  }
                  className="w-full bg-secondary border border-primary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Team 2 Score */}
          <div className="bg-dark rounded-lg p-4">
            <h3 className="text-xl font-bold text-primary mb-4">
              {match.team2Name}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Runs</label>
                <input
                  type="number"
                  min="0"
                  value={formData.team2Score.runs}
                  onChange={(e) =>
                    handleScoreChange("team2", "runs", e.target.value)
                  }
                  className="w-full bg-secondary border border-primary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">
                  Wickets
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.team2Score.wickets}
                  onChange={(e) =>
                    handleScoreChange("team2", "wickets", e.target.value)
                  }
                  className="w-full bg-secondary border border-primary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">
                  Overs
                  <span className="text-xs block text-gray-500">
                    (e.g., 20.3)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.team2Score.overs}
                  onChange={(e) =>
                    handleScoreChange("team2", "overs", e.target.value)
                  }
                  className="w-full bg-secondary border border-primary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Winner Selection */}
          <div>
            <label className="block text-gray-400 mb-2">Select Winner</label>
            <select
              value={formData.winner}
              onChange={(e) =>
                setFormData({ ...formData, winner: e.target.value })
              }
              className="w-full bg-dark border border-primary rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">-- Select Winner --</option>
              <option value={match.team1Id}>{match.team1Name}</option>
              <option value={match.team2Id}>{match.team2Name}</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Score & Declare Winner"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-dark rounded-lg">
          <p className="text-xs text-gray-400">
            <strong>Note:</strong> Overs should be entered as decimal where the
            decimal part represents balls. For example: 20.3 means 20 overs and
            3 balls. The system will automatically calculate NRR based on these
            scores.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScoreEntry;
